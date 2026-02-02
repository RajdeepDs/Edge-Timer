import { json, type LoaderFunctionArgs } from "@remix-run/node";
import crypto from "crypto";

/**
 * Debug endpoint to help diagnose App Proxy signature issues.
 *
 * Access at: https://yourstore.myshopify.com/apps/urgency-timer/debug
 *
 * This will show you exactly what Shopify is sending and how we're processing it.
 */
export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const queryString = url.search.substring(1);

  // Extract all parameters
  const params = new URLSearchParams(queryString);
  const signature = params.get("signature") || "";
  const shop = params.get("shop") || "";
  const timestamp = params.get("timestamp") || "";
  const pathPrefix = params.get("path_prefix") || "";

  // Get API secret
  const apiSecret =
    process.env.SHOPIFY_API_SECRET ||
    process.env.SHOPIFY_CLIENT_SECRET ||
    process.env.SHOPIFY_API_SECRET_KEY ||
    "";

  // Build HMAC message (remove signature, sort, join)
  const queryParams = queryString.split("&");
  const paramsWithoutSignature = queryParams
    .filter((param) => !param.startsWith("signature="))
    .sort();
  const hmacMessage = paramsWithoutSignature.join("&");

  // Compute expected signature
  let computedSignature = "";
  if (apiSecret) {
    computedSignature = crypto
      .createHmac("sha256", apiSecret)
      .update(hmacMessage, "utf8")
      .digest("hex");
  }

  // Check if valid
  const isValid = signature.toLowerCase() === computedSignature.toLowerCase();

  const debugInfo = {
    status: isValid ? "✅ VALID" : "❌ INVALID",
    timestamp: new Date().toISOString(),

    request: {
      url: request.url,
      method: request.method,
      queryString,
    },

    shopifyParams: {
      shop,
      timestamp,
      pathPrefix,
      signatureReceived: signature,
      signatureLength: signature.length,
    },

    validation: {
      hmacMessage,
      hmacMessageLength: hmacMessage.length,
      computedSignature,
      computedLength: computedSignature.length,
      matches: isValid,
    },

    environment: {
      nodeEnv: process.env.NODE_ENV || "unknown",
      hasShopifyApiSecret: !!process.env.SHOPIFY_API_SECRET,
      hasShopifyClientSecret: !!process.env.SHOPIFY_CLIENT_SECRET,
      hasShopifyApiSecretKey: !!process.env.SHOPIFY_API_SECRET_KEY,
      secretSource: process.env.SHOPIFY_API_SECRET
        ? "SHOPIFY_API_SECRET"
        : process.env.SHOPIFY_CLIENT_SECRET
          ? "SHOPIFY_CLIENT_SECRET"
          : process.env.SHOPIFY_API_SECRET_KEY
            ? "SHOPIFY_API_SECRET_KEY"
            : "NONE - THIS IS THE PROBLEM!",
      apiSecretLength: apiSecret.length,
      apiSecretPreview: apiSecret ? `${apiSecret.substring(0, 4)}...${apiSecret.substring(apiSecret.length - 4)}` : "NOT SET",
    },

    allQueryParams: Object.fromEntries(params.entries()),

    sortedParamsWithoutSignature: paramsWithoutSignature,

    troubleshooting: {
      message: isValid
        ? "Signature validation is working correctly! ✅"
        : "Signature validation is failing. Check the issues below:",
      possibleIssues: !isValid ? [
        !apiSecret && "❌ CRITICAL: API secret is not set in environment variables",
        apiSecret && signature.length !== computedSignature.length && "❌ Signature length mismatch - possible encoding issue",
        !shop && "❌ Missing 'shop' parameter",
        !timestamp && "❌ Missing 'timestamp' parameter",
        apiSecret && shop && timestamp && "❌ Signature mismatch - verify your SHOPIFY_API_SECRET matches your app's API secret key in Shopify Partner Dashboard",
      ].filter(Boolean) : [],
      nextSteps: !isValid ? [
        "1. Go to Shopify Partner Dashboard → Apps → Your App",
        "2. Copy the 'API secret key' value",
        "3. Set SHOPIFY_API_SECRET environment variable in Render with this exact value",
        "4. Redeploy your app",
        "5. Test again",
      ] : [],
    },
  };

  return json(debugInfo, {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
  });
}
