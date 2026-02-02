import type { ActionFunctionArgs } from "@remix-run/node";
import { authenticate } from "../shopify.server";

/**
 * Compliance Webhook Endpoint
 *
 * This endpoint handles mandatory GDPR compliance webhooks from Shopify.
 * It validates HMAC signatures and routes to appropriate handlers.
 *
 * Compliance topics:
 * - customers/data_request
 * - customers/redact
 * - shop/redact
 */
export const action = async ({ request }: ActionFunctionArgs) => {
  try {
    // Authenticate webhook - this validates HMAC digest
    // If HMAC validation fails, this will throw an error
    const { shop, payload, topic } = await authenticate.webhook(request);

    console.log(`Received compliance webhook: ${topic} for shop: ${shop}`);

    // Route to appropriate handler based on topic
    switch (topic) {
      case "CUSTOMERS_DATA_REQUEST":
        await handleCustomerDataRequest(shop, payload);
        break;
      case "CUSTOMERS_REDACT":
        await handleCustomerRedact(shop, payload);
        break;
      case "SHOP_REDACT":
        await handleShopRedact(shop, payload);
        break;
      default:
        console.log(`Unhandled compliance topic: ${topic}`);
    }

    return new Response(null, { status: 200 });
  } catch (error) {
    console.error("Compliance webhook authentication failed:", error);

    // When HMAC validation fails, return 401 Unauthorized as required by Shopify
    // This is a security requirement for mandatory webhooks
    return new Response("Unauthorized", { status: 401 });
  }
};

async function handleCustomerDataRequest(shop: string, payload: any) {
  const customerId = payload?.customer?.id;
  const customerEmail = payload?.customer?.email;

  console.log(
    `Customer data request - Shop: ${shop}, Customer ID: ${customerId}, Email: ${customerEmail}`,
  );

  // This app doesn't store identifiable customer data
  // TimerView records are anonymous
  console.log("No identifiable customer data stored in this app");

  // TODO: In production, implement:
  // 1. Query all data associated with this customer
  // 2. Compile into readable format
  // 3. Send to customer via email
  // 4. Store audit record
}

async function handleCustomerRedact(shop: string, payload: any) {
  const customerId = payload?.customer?.id;
  const shopDomain = payload?.shop_domain;

  console.log(
    `Customer redact request - Shop: ${shopDomain}, Customer ID: ${customerId}`,
  );

  // This app doesn't store customer PII
  // No action needed
  console.log("No customer data to redact");

  // TODO: In production, implement:
  // 1. Delete all customer data
  // 2. Anonymize related records
  // 3. Log the redaction for audit
}

async function handleShopRedact(shop: string, payload: any) {
  const shopDomain = payload?.shop_domain;

  console.log(`Shop redact request - Shop: ${shopDomain}`);

  // After 48 hours of app uninstall, delete shop data
  console.log("Shop data will be redacted");

  // TODO: In production, implement:
  // 1. Delete all shop data from database
  // 2. Remove any stored credentials
  // 3. Clear cached data
  // 4. Log the deletion for audit

  // Note: You may want to implement this with a delay
  // as Shopify gives you 48 hours after uninstall
}
