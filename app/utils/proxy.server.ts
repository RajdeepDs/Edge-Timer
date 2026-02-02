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
 */
export function validateProxyRequest(request: Request): ProxyValidationResult {
  const url = new URL(request.url);
  const params = new URLSearchParams(url.search); // decoded query params

  // 1. Get signature
  const signature = params.get("signature");
  if (!signature) {
    return { isValid: false, error: "Missing signature parameter" };
  }

  // 2. Get shop (for convenience and extra sanity)
  const shop = params.get("shop");
  if (!shop) {
    return { isValid: false, error: "Missing shop parameter" };
  }

  // 3. Get app secret
  const apiSecret =
    process.env.SHOPIFY_CLIENT_SECRET ||
    process.env.SHOPIFY_API_SECRET ||
    process.env.SHOPIFY_API_SECRET_KEY;

  if (!apiSecret) {
    return { isValid: false, error: "API secret not configured" };
  }

  // 4. Remove signature from params
  params.delete("signature");

  // 5. Build message:
  //    - sort keys lexicographically
  //    - for each key, include all values as key=value
  const keys = Array.from(params.keys()).sort();

  const message = keys
    .map((key) => {
      const values = params.getAll(key);
      return values.map((value) => `${key}=${value}`).join("&");
    })
    .filter(Boolean)
    .join("&");

  // 6. Compute HMAC-SHA256 (hex) with app secret
  const computed = crypto
    .createHmac("sha256", apiSecret)
    .update(message, "utf8")
    .digest("hex");

  // 7. Constant-time compare (case-insensitive hex)
  const receivedSig = signature.toLowerCase();
  const computedSig = computed.toLowerCase();

  const recvBuf = Buffer.from(receivedSig, "utf8");
  const compBuf = Buffer.from(computedSig, "utf8");

  const isValid =
    recvBuf.length === compBuf.length &&
    crypto.timingSafeEqual(recvBuf, compBuf);

  if (!isValid) {
    return { isValid: false, error: "Invalid signature" };
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
