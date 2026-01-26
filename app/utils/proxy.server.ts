import crypto from "crypto";

/**
 * Validates that a request came from Shopify's App Proxy.
 *
 * Shopify signs app proxy requests with HMAC. The signature is passed as
 * a query parameter named "signature". We need to verify it using the
 * app's API secret.
 *
 * @see https://shopify.dev/docs/apps/build/online-store/app-proxies#security
 */

export interface ProxyValidationResult {
  isValid: boolean;
  shop?: string;
  error?: string;
}

/**
 * Validates the Shopify App Proxy signature.
 *
 * @param request - The incoming request object
 * @returns ProxyValidationResult with isValid flag and shop domain if valid
 */
export function validateProxyRequest(request: Request): ProxyValidationResult {
  const url = new URL(request.url);
  const params = url.searchParams;

  // Extract signature from query params
  const signature = params.get("signature");
  if (!signature) {
    return { isValid: false, error: "Missing signature parameter" };
  }

  // Extract shop domain
  const shop = params.get("shop");
  if (!shop) {
    return { isValid: false, error: "Missing shop parameter" };
  }

  // Get API secret from environment
  const apiSecret = process.env.SHOPIFY_API_SECRET;
  if (!apiSecret) {
    return { isValid: false, error: "API secret not configured" };
  }

  // Build the message to sign:
  // All query params EXCEPT "signature", sorted alphabetically
  const paramsToSign = new URLSearchParams();

  // Sort params alphabetically (excluding signature)
  const sortedKeys = Array.from(params.keys())
    .filter((key) => key !== "signature")
    .sort();

  for (const key of sortedKeys) {
    const value = params.get(key);
    if (value !== null) {
      paramsToSign.append(key, value);
    }
  }

  // Create the query string (without leading ?)
  const message = paramsToSign.toString();

  // Compute HMAC-SHA256
  const computed = crypto
    .createHmac("sha256", apiSecret)
    .update(message)
    .digest("hex");

  // Compare signatures (timing-safe comparison)
  const isValid = crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(computed)
  );

  if (!isValid) {
    return { isValid: false, error: "Invalid signature" };
  }

  return { isValid: true, shop };
}

/**
 * Helper to extract shop domain from proxy request headers or params.
 * Fallback chain: query param > header > null
 */
export function getShopFromProxy(request: Request): string | null {
  const url = new URL(request.url);
  const shopParam = url.searchParams.get("shop");
  if (shopParam) return shopParam;

  // Some proxies may pass shop in headers (non-standard)
  const shopHeader = request.headers.get("x-shopify-shop-domain");
  if (shopHeader) return shopHeader;

  return null;
}
