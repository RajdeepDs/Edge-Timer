import type { ActionFunctionArgs } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import db from "../db.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  const { shop, payload, topic } = await authenticate.webhook(request);

  console.log(`Received ${topic} webhook for ${shop}`);

  try {
    // Parse the subscription update payload
    const subscriptionData = payload as {
      app_subscription: {
        id: string;
        name: string;
        status: string;
        admin_graphql_api_id: string;
        created_at: string;
        updated_at: string;
        trial_days?: number;
        trial_ends_on?: string;
        test?: boolean;
      };
    };

    const subscription = subscriptionData.app_subscription;
    const status = subscription.status;

    console.log(`Subscription status: ${status} for shop: ${shop}`);

    // Map subscription status to billing status
    let billingStatus: string;
    let planStatus: string | undefined;

    switch (status) {
      case "ACTIVE":
        billingStatus = "active";
        // Extract plan from subscription name
        planStatus = extractPlanFromName(subscription.name);
        break;
      case "CANCELLED":
      case "EXPIRED":
        billingStatus = "cancelled";
        // Downgrade to free plan
        planStatus = "free";
        break;
      case "FROZEN":
        billingStatus = "frozen";
        // Keep current plan but mark as frozen
        // Don't change planStatus - merchant keeps features until unfrozen
        console.log(`Subscription frozen for ${shop} - keeping current plan`);
        break;
      case "PENDING":
        billingStatus = "pending";
        // Keep current plan during pending state
        break;
      case "DECLINED":
        billingStatus = "cancelled";
        planStatus = "free";
        break;
      default:
        console.warn(`Unknown subscription status: ${status} for ${shop}`);
        billingStatus = "active";
    }

    // Update shop record
    const updateData: {
      billingStatus: string;
      subscriptionId: string;
      currentPlan?: string;
      trialEndsAt?: Date | null;
    } = {
      billingStatus,
      subscriptionId: subscription.admin_graphql_api_id,
    };

    // Update plan if status changed
    if (planStatus) {
      updateData.currentPlan = planStatus;
    }

    // Update trial end date if present
    if (subscription.trial_ends_on) {
      updateData.trialEndsAt = new Date(subscription.trial_ends_on);
    }

    await db.shop.update({
      where: { shopDomain: shop },
      data: updateData,
    });

    console.log(
      `Updated shop ${shop} - Plan: ${planStatus || "unchanged"}, Billing: ${billingStatus}`,
    );

    return new Response(null, { status: 200 });
  } catch (error) {
    console.error(
      `Error handling APP_SUBSCRIPTIONS_UPDATE for ${shop}:`,
      error,
    );
    // Return 200 to prevent webhook retries on server errors
    return new Response(null, { status: 200 });
  }
};

/**
 * Extract plan tier from subscription name
 * e.g., "Starter Plan" -> "starter"
 */
function extractPlanFromName(name: string): string {
  const lowerName = name.toLowerCase();

  if (lowerName.includes("starter")) return "starter";
  if (lowerName.includes("standard")) return "standard";
  if (lowerName.includes("premium")) return "premium";

  // Default to starter if we can't determine
  return "starter";
}
