import crypto from "crypto";

export interface ProxyValidationResult {
  isValid: boolean;
  shop?: string | null;
  error?: string;
}

/**
 * Validates a Shopify App Proxy request signature.
 * Reference: https://shopify.dev
 */
export function validateProxyRequest(request: Request): ProxyValidationResult {
  const url = new URL(request.url);
  const searchParams = url.searchParams;

  const received = searchParams.get("signature");
  if (!received) {
    return { isValid: false, error: "Missing signature" };
  }

  // 1. Extract and sort keys alphabetically (excluding 'signature')
  const sortedKeys = Array.from(searchParams.keys())
    .filter((key) => key !== "signature")
    .sort();

  // 2. Construct the message string.
  // IMPORTANT: For App Proxies, join pairs with NO separator (empty string),
  // and handle multiple values for the same key by joining with commas.
  const message = sortedKeys
    .map((key) => {
      const value = searchParams.getAll(key).join(",");
      return `${key}=${value}`;
    })
    .join("");

  console.log("🔥 HMAC MESSAGE (JOINED WITH EMPTY STRING):", message);

  const secret = process.env.SHOPIFY_API_SECRET;
  if (!secret) {
    console.error("❌ Missing SHOPIFY_API_SECRET env var");
    return { isValid: false, error: "Server configuration error" };
  }

  // 3. Compute HMAC-SHA256
  const computed = crypto
    .createHmac("sha256", secret)
    .update(message, "utf8")
    .digest("hex");

  console.log("🔥 COMPUTED:", computed);
  console.log("🔥 RECEIVED:", received);

  // 4. Constant-time comparison to prevent timing attacks
  try {
    const computedBuf = Buffer.from(computed, "hex");
    const receivedBuf = Buffer.from(received, "hex");

    if (computedBuf.length !== receivedBuf.length) {
      return { isValid: false, error: "Signature mismatch" };
    }

    const isValid = crypto.timingSafeEqual(computedBuf, receivedBuf);

    return {
      isValid,
      shop: searchParams.get("shop"),
      error: isValid ? undefined : "Signature mismatch",
    };
  } catch (e) {
    return { isValid: false, error: "Validation process failed" };
  }
}
