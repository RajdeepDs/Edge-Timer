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
export function validateProxyRequest(request: Request) {
  const url = new URL(request.url);

  // Raw query string WITHOUT leading '?'
  const rawQuery = url.search.slice(1);

  // Split into key=value pairs
  const pairs = rawQuery
    .split("&")
    .filter(Boolean)
    .filter((p) => !p.startsWith("signature="));

  // Only Shopify-signed keys
  const allowedKeys = new Set([
    "shop",
    "timestamp",
    "logged_in_customer_id",
    "path_prefix",
  ]);

  const signedPairs = pairs.filter((pair) => {
    const key = pair.split("=")[0];
    return allowedKeys.has(key);
  });

  // Alphabetical order
  const message = signedPairs.sort().join("&");

  const secret = process.env.SHOPIFY_API_SECRET!;
  const computed = crypto
    .createHmac("sha256", secret)
    .update(message)
    .digest("hex");

  const received = new URLSearchParams(rawQuery).get("signature")!;

  const isValid =
    Buffer.from(computed, "hex").length ===
      Buffer.from(received, "hex").length &&
    crypto.timingSafeEqual(
      Buffer.from(computed, "hex"),
      Buffer.from(received, "hex"),
    );

  return { isValid, shop: new URLSearchParams(rawQuery).get("shop") };
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
