import type { ActionFunctionArgs } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import db from "../db.server";

/**
 * GDPR: Shop Data Redaction Webhook
 *
 * This webhook is triggered 48 hours after a shop uninstalls your app.
 * You must delete the shop's data within 30 days.
 *
 * This is your final opportunity to clean up all shop-related data.
 */
export const action = async ({ request }: ActionFunctionArgs) => {
  const { shop, payload, topic } = await authenticate.webhook(request);

  console.log(`Received ${topic} webhook for ${shop}`);

  try {
    const shopId = payload?.shop_id;
    const shopDomain = payload?.shop_domain;

    console.log(
      `Shop data redaction request - Shop ID: ${shopId}, Domain: ${shopDomain}`
    );

    // GDPR Compliance: Delete all shop data
    // This is a hard delete, not a soft delete

    // 1. Delete all timer views for this shop
    const deletedViews = await db.timerView.deleteMany({
      where: { shop: shopDomain },
    });
    console.log(`Deleted ${deletedViews.count} timer views`);

    // 2. Delete all timers for this shop
    const deletedTimers = await db.timer.deleteMany({
      where: { shop: shopDomain },
    });
    console.log(`Deleted ${deletedTimers.count} timers`);

    // 3. Delete all sessions for this shop
    const deletedSessions = await db.session.deleteMany({
      where: { shop: shopDomain },
    });
    console.log(`Deleted ${deletedSessions.count} sessions`);

    // 4. Delete shop record
    const deletedShop = await db.shop.deleteMany({
      where: { shopDomain: shopDomain },
    });
    console.log(`Deleted ${deletedShop.count} shop records`);

    console.log(`Successfully redacted all data for shop: ${shopDomain}`);

    // Optional: Log this deletion for audit purposes
    // You might want to keep a minimal audit log (shop domain + deletion timestamp)
    // in a separate compliance table that gets purged after the required retention period

    return new Response(null, { status: 200 });
  } catch (error) {
    console.error(`Error handling ${topic} webhook for ${shop}:`, error);
    // Return 200 to acknowledge receipt and prevent retries
    // Log the error for manual investigation
    return new Response(null, { status: 200 });
  }
};
