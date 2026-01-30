import type { ActionFunctionArgs } from "@remix-run/node";
import { authenticate } from "../shopify.server";

/**
 * GDPR: Customer Data Redaction Webhook
 *
 * This webhook is triggered when a shop owner requests deletion of customer data.
 * You must delete the customer's data within 30 days.
 *
 * This is triggered when:
 * - A customer is deleted from the Shopify admin
 * - A customer requests deletion via GDPR rights
 */
export const action = async ({ request }: ActionFunctionArgs) => {
  const { shop, payload, topic } = await authenticate.webhook(request);

  console.log(`Received ${topic} webhook for ${shop}`);

  try {
    const customerId = payload?.customer?.id;
    const customerEmail = payload?.customer?.email;
    const shopDomain = payload?.shop_domain;

    console.log(
      `Customer data redaction request - Shop: ${shopDomain}, Customer ID: ${customerId}, Email: ${customerEmail}`,
    );

    // For this app, we don't store direct customer PII in our database
    // TimerView records are anonymous and don't link to customer IDs

    // If you had customer-specific data, you would delete it here:
    // await db.customerData.deleteMany({
    //   where: {
    //     shop: shopDomain,
    //     customerId: customerId,
    //   },
    // });

    // Optional: Delete any timer views that might be associated with this customer
    // if you tracked visitor sessions linked to customer accounts
    // await db.timerView.deleteMany({
    //   where: {
    //     shop: shopDomain,
    //     visitorId: customerId, // if you linked visitor to customer
    //   },
    // });

    console.log(
      `Customer data redaction completed. This app does not store identifiable customer data.`,
    );

    return new Response(null, { status: 200 });
  } catch (error) {
    console.error(`Error handling ${topic} webhook for ${shop}:`, error);
    // Return 200 to acknowledge receipt and prevent retries
    return new Response(null, { status: 200 });
  }
};
