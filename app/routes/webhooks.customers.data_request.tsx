import type { ActionFunctionArgs } from "@remix-run/node";
import { authenticate } from "../shopify.server";

/**
 * GDPR: Customer Data Request Webhook
 *
 * This webhook is triggered when a customer requests their personal data.
 * You must provide the customer's data within 30 days.
 *
 * For this app, we collect minimal customer data:
 * - TimerView records may contain visitor IPs and user agents
 * - No direct customer PII is stored in our database
 */
export const action = async ({ request }: ActionFunctionArgs) => {
  const { shop, payload, topic } = await authenticate.webhook(request);

  console.log(`Received ${topic} webhook for ${shop}`);

  try {
    const customerId = payload?.customer?.id;
    const customerEmail = payload?.customer?.email;
    const shopDomain = payload?.shop_domain;

    console.log(
      `Customer data request - Shop: ${shopDomain}, Customer ID: ${customerId}, Email: ${customerEmail}`,
    );

    // Log the data request for compliance tracking
    // In a production app, you would:
    // 1. Query all data associated with this customer
    // 2. Compile it into a readable format
    // 3. Send it to the customer via email or make it available for download
    // 4. Store a record of this request for audit purposes

    // For this app, we don't store direct customer PII
    // TimerView records are anonymous (no customer ID linking)
    console.log(
      `Data request logged. This app does not store identifiable customer data.`,
    );

    // If you want to check for any potential data:
    // const timerViews = await db.timerView.findMany({
    //   where: {
    //     shop: shopDomain,
    //     // Note: We don't have a customerId field in TimerView
    //   },
    // });

    // TODO: Implement your data export logic here
    // - Compile customer data
    // - Create export file
    // - Email to customer or admin
    // - Log the request in a compliance audit table

    return new Response(null, { status: 200 });
  } catch (error) {
    console.error(`Error handling ${topic} webhook for ${shop}:`, error);
    // Return 200 to acknowledge receipt and prevent retries
    return new Response(null, { status: 200 });
  }
};
