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
 * IMPORTANT: Shopify only signs the parameters IT adds:
 * - shop
 * - timestamp
 * - logged_in_customer_id
 * - path_prefix
 * - signature
 *
 * Any custom parameters added by your client-side JavaScript are NOT included
 * in the signature calculation and must be ignored during validation.
 */
export function validateProxyRequest(request: Request): ProxyValidationResult {
  const url = new URL(request.url);
  const params = new URLSearchParams(url.search);

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

  // 4. Build the HMAC message using ONLY Shopify-signed parameters
  //    Shopify signs these parameters (and only these):
  //    - shop
  //    - timestamp
  //    - logged_in_customer_id
  //    - path_prefix
  //
  //    Any other parameters (productId, pageType, country, etc.) are NOT signed
  //    and must be excluded from validation.

  const shopifySignedParams = [
    "shop",
    "timestamp",
    "logged_in_customer_id",
    "path_prefix",
  ];

  // Extract only Shopify-signed parameters
  const signedPairs: string[] = [];

  for (const key of shopifySignedParams) {
    const value = params.get(key);
    if (value !== null) {
      // Use the exact encoding that URLSearchParams provides
      signedPairs.push(`${key}=${value}`);
    }
  }

  // Sort alphabetically and join
  const message = signedPairs.sort().join("&");

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
      message,
      timestamp: params.get("timestamp"),
      receivedSig: receivedSig.substring(0, 16) + "...",
      computedSig: computedSig.substring(0, 16) + "...",
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
