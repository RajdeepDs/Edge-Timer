import crypto from "crypto";

export interface ProxyValidationResult {
  isValid: boolean;
  shop?: string;
  error?: string;
}

/**
 * Validate a Shopify App Proxy request.
 *
 * Shopify signs ONLY these params:
 * - shop
 * - timestamp
 * - logged_in_customer_id
 * - path_prefix
 * - signature
 *
 * Any custom params must be ignored.
 */
export function validateProxyRequest(request: Request): ProxyValidationResult {
  const url = new URL(request.url);
  const params = url.searchParams;

  // 1. Signature
  const signature = params.get("signature");
  if (!signature) {
    return { isValid: false, error: "Missing signature parameter" };
  }

  // 2. Shop
  const shop = params.get("shop");
  if (!shop) {
    return { isValid: false, error: "Missing shop parameter" };
  }

  // 3. API Secret
  const apiSecret =
    process.env.SHOPIFY_API_SECRET ||
    process.env.SHOPIFY_CLIENT_SECRET ||
    process.env.SHOPIFY_API_SECRET_KEY;

  if (!apiSecret) {
    console.error(
      "[proxy.server] Missing API secret. Checked: SHOPIFY_API_SECRET, SHOPIFY_CLIENT_SECRET, SHOPIFY_API_SECRET_KEY",
    );
    return { isValid: false, error: "API secret not configured", shop };
  }

  // 4. Shopify-signed parameters ONLY
  const shopifySignedParams = [
    "shop",
    "timestamp",
    "logged_in_customer_id",
    "path_prefix",
  ];

  const signedPairs: string[] = [];

  for (const key of shopifySignedParams) {
    const value = params.get(key);
    if (value !== null) {
      signedPairs.push(`${key}=${value}`);
    }
  }

  // Alphabetical order is REQUIRED
  const message = signedPairs.sort().join("&");

  // 5. Compute HMAC-SHA256 (hex)
  const computedSignature = crypto
    .createHmac("sha256", apiSecret)
    .update(message, "utf8")
    .digest("hex");

  // 6. Constant-time comparison (HEX → BUFFER)
  const receivedBuffer = Buffer.from(signature.toLowerCase(), "hex");
  const computedBuffer = Buffer.from(computedSignature.toLowerCase(), "hex");

  const isValid =
    receivedBuffer.length === computedBuffer.length &&
    crypto.timingSafeEqual(receivedBuffer, computedBuffer);

  if (!isValid) {
    console.error("[proxy.server] Signature mismatch", {
      shop,
      message,
      received: signature.slice(0, 16) + "...",
      computed: computedSignature.slice(0, 16) + "...",
    });

    return { isValid: false, error: "Invalid signature", shop };
  }

  return { isValid: true, shop };
}

/**
 * Optional helper to extract shop domain
 */
export function getShopFromProxy(request: Request): string | null {
  const url = new URL(request.url);

  return (
    url.searchParams.get("shop") || request.headers.get("x-shopify-shop-domain")
  );
}
