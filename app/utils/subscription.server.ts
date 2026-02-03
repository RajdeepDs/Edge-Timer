/**
 * Subscription verification utilities
 *
 * These helpers check the current subscription status directly from Shopify's API
 * to avoid race conditions between webhooks and user actions.
 */

import type { AdminApiContext } from "@shopify/shopify-app-remix/server";

export interface SubscriptionStatus {
  hasActiveSubscription: boolean;
  currentPlan: string;
  status: string;
  trialDaysRemaining: number | null;
  isTrial: boolean;
}

/**
 * Query Shopify's API to get the current active subscription
 * This is more reliable than database state during edge cases (race conditions, webhook delays)
 */
export async function getCurrentSubscription(
  admin: AdminApiContext
): Promise<SubscriptionStatus> {
  try {
    const response = await admin.graphql(
      `#graphql
      query getCurrentSubscription {
        currentAppInstallation {
          activeSubscriptions {
            id
            name
            status
            test
            trialDays
            currentPeriodEnd
            createdAt
          }
        }
      }`
    );

    const data = await response.json();
    const subscriptions =
      data.data?.currentAppInstallation?.activeSubscriptions || [];

    // Get the most recent active subscription
    const activeSubscription = subscriptions.find(
      (sub: any) => sub.status === "ACTIVE"
    );

    if (!activeSubscription) {
      return {
        hasActiveSubscription: false,
        currentPlan: "free",
        status: "NONE",
        trialDaysRemaining: null,
        isTrial: false,
      };
    }

    // Extract plan name from subscription name
    const planName = extractPlanFromName(activeSubscription.name);

    // Calculate trial days remaining
    let trialDaysRemaining: number | null = null;
    let isTrial = false;

    if (activeSubscription.trialDays && activeSubscription.trialDays > 0) {
      const createdAt = new Date(activeSubscription.createdAt);
      const now = new Date();
      const daysSinceCreation = Math.floor(
        (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24)
      );
      trialDaysRemaining = Math.max(
        0,
        activeSubscription.trialDays - daysSinceCreation
      );
      isTrial = trialDaysRemaining > 0;
    }

    return {
      hasActiveSubscription: true,
      currentPlan: planName,
      status: activeSubscription.status,
      trialDaysRemaining,
      isTrial,
    };
  } catch (error) {
    console.error("Error fetching subscription from Shopify API:", error);
    // Return safe defaults on error
    return {
      hasActiveSubscription: false,
      currentPlan: "free",
      status: "ERROR",
      trialDaysRemaining: null,
      isTrial: false,
    };
  }
}

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

/**
 * Check if shop has any active subscription (paid plan)
 * Useful for quick checks without full subscription details
 */
export async function hasActiveSubscription(
  admin: AdminApiContext
): Promise<boolean> {
  const status = await getCurrentSubscription(admin);
  return status.hasActiveSubscription;
}

/**
 * Verify subscription and sync with database if needed
 * Returns true if subscription is active, false otherwise
 */
export async function verifyAndSyncSubscription(
  admin: AdminApiContext,
  shopDomain: string,
  db: any // Prisma client
): Promise<boolean> {
  const apiStatus = await getCurrentSubscription(admin);

  // Sync database with API state if there's a mismatch
  try {
    await db.shop.update({
      where: { shopDomain },
      data: {
        currentPlan: apiStatus.currentPlan,
        billingStatus: apiStatus.hasActiveSubscription ? "active" : "cancelled",
      },
    });
  } catch (error) {
    console.error("Error syncing subscription to database:", error);
  }

  return apiStatus.hasActiveSubscription;
}
