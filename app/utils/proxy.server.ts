import crypto from "crypto";

export interface ProxyValidationResult {
  isValid: boolean;
  shop?: string;
  error?: string;
}

/**
 * Validate a Shopify App Proxy request.
 *
 * Shopify docs:
 * https://shopify.dev/docs/apps/build/online-store/app-proxies/authenticate-app-proxies#verify-the-request
 *
 * IMPORTANT: Shopify calculates the HMAC signature using the URL-encoded query string.
 * We must preserve the encoding when validating.
 */
export function validateProxyRequest(request: Request): ProxyValidationResult {
  const url = new URL(request.url);

  // Get the raw query string (preserves URL encoding)
  const queryString = url.search.substring(1); // Remove leading '?'

  if (!queryString) {
    return { isValid: false, error: "Missing query parameters" };
  }

  // Parse params to extract signature and shop (these will be decoded)
  const params = new URLSearchParams(queryString);

  // 1. Get signature
  const signature = params.get("signature");
  if (!signature) {
    return { isValid: false, error: "Missing signature parameter" };
  }

  // 2. Get shop (for convenience and verification)
  const shop = params.get("shop");
  if (!shop) {
    return { isValid: false, error: "Missing shop parameter" };
  }

  // 3. Get app secret
  const apiSecret =
    process.env.SHOPIFY_API_SECRET ||
    process.env.SHOPIFY_CLIENT_SECRET ||
    process.env.SHOPIFY_API_SECRET_KEY;

  if (!apiSecret) {
    console.error(
      "[proxy.server] API secret not configured. Checked: SHOPIFY_API_SECRET, SHOPIFY_CLIENT_SECRET, SHOPIFY_API_SECRET_KEY",
    );
    return { isValid: false, error: "API secret not configured", shop };
  }

  // 4. Build the HMAC message:
  //    - Remove the signature parameter
  //    - Sort remaining parameters alphabetically
  //    - Join with '&'
  //    CRITICAL: We must work with the RAW (encoded) query string to match Shopify's signature

  const queryParams = queryString.split("&");

  // Filter out signature parameter and sort alphabetically
  const paramsWithoutSignature = queryParams
    .filter((param) => !param.startsWith("signature="))
    .sort();

  const message = paramsWithoutSignature.join("&");

  // 5. Compute HMAC-SHA256 (hex) with app secret
  const computed = crypto
    .createHmac("sha256", apiSecret)
    .update(message, "utf8")
    .digest("hex");

  // 6. Compare signatures (constant-time, case-insensitive)
  const receivedSig = signature.toLowerCase();
  const computedSig = computed.toLowerCase();

  // Use constant-time comparison to prevent timing attacks
  const recvBuf = Buffer.from(receivedSig, "utf8");
  const compBuf = Buffer.from(computedSig, "utf8");

  const isValid =
    recvBuf.length === compBuf.length &&
    crypto.timingSafeEqual(recvBuf, compBuf);

  if (!isValid) {
    console.error("[proxy.server] Signature mismatch", {
      shop,
      receivedLength: receivedSig.length,
      computedLength: computedSig.length,
      messagePreview: message.substring(0, 200),
      timestamp: params.get("timestamp"),
    });
    return { isValid: false, error: "Invalid signature", shop };
  }

  return { isValid: true, shop };
}

/**
 * Helper to extract shop domain from proxy request headers or params.
 */
export function getShopFromProxy(request: Request): string | null {
  const url = new URL(request.url);
  const shopParam = url.searchParams.get("shop");
  if (shopParam) return shopParam;

  const shopHeader = request.headers.get("x-shopify-shop-domain");
  if (shopHeader) return shopHeader;

  return null;
}
