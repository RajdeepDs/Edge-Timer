import type { ActionFunctionArgs } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import db from "../db.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  const { shop, session, topic } = await authenticate.webhook(request);

  console.log(`Received ${topic} webhook for ${shop}`);

  try {
    // Cleanup sessions for this shop (idempotent)
    if (session) {
      await db.session.deleteMany({ where: { shop } });
    }

    // Update Shop billing status and mark soft delete timestamp
    try {
      await db.shop.update({
        where: { shopDomain: shop },
        data: {
          billingStatus: "cancelled",
          deletedAt: new Date(),
        },
      });
    } catch (err) {
      // Shop record might not exist yet; log and continue
      console.warn(`Shop record not found or update failed for ${shop}:`, err);
    }

    // Soft cleanup timers: unpublish and deactivate all timers for this shop
    await db.timer.updateMany({
      where: { shop },
      data: {
        isPublished: false,
        isActive: false,
      },
    });
  } catch (error) {
    console.error(`Error handling APP_UNINSTALLED for ${shop}:`, error);
    // Return 200 to avoid repeated retries; logging captures the failure
  }

  return new Response();
};
