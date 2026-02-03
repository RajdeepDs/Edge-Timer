import { getShop } from "./shop.server";

/**
 * Plan limits and feature access configuration
 */
export const PLAN_LIMITS = {
  free: {
    monthlyViews: 1500,
    features: {
      productTimers: true,
      topBarTimers: true,
      landingPageTimers: false,
      cartPageTimers: false,
      emailTimers: false,
      scheduledTimers: false,
      recurringTimers: false,
      productTags: false,
      geolocation: false,
      translations: false,
    },
  },
  starter: {
    monthlyViews: 10000,
    features: {
      productTimers: true,
      topBarTimers: true,
      landingPageTimers: true,
      cartPageTimers: false,
      emailTimers: false,
      scheduledTimers: true,
      recurringTimers: true,
      productTags: false,
      geolocation: false,
      translations: false,
    },
  },
  standard: {
    monthlyViews: 50000,
    features: {
      productTimers: true,
      topBarTimers: true,
      landingPageTimers: true,
      cartPageTimers: true,
      emailTimers: true,
      scheduledTimers: true,
      recurringTimers: true,
      productTags: true,
      geolocation: true,
      translations: true,
    },
  },
  premium: {
    monthlyViews: -1, // unlimited
    features: {
      productTimers: true,
      topBarTimers: true,
      landingPageTimers: true,
      cartPageTimers: true,
      emailTimers: true,
      scheduledTimers: true,
      recurringTimers: true,
      productTags: true,
      geolocation: true,
      translations: true,
    },
  },
} as const;

export type PlanTier = keyof typeof PLAN_LIMITS;
export type PlanFeature = keyof typeof PLAN_LIMITS.free.features;

/**
 * Check if shop has access to a specific feature
 */
export async function hasFeatureAccess(
  shopDomain: string,
  feature: PlanFeature,
): Promise<boolean> {
  const shop = await getShop(shopDomain);
  const planLimits =
    PLAN_LIMITS[shop.currentPlan as PlanTier] || PLAN_LIMITS.free;

  return planLimits.features[feature] || false;
}

/**
 * Check if shop has exceeded monthly view limit
 */
export async function hasExceededViewLimit(
  shopDomain: string,
): Promise<boolean> {
  const shop = await getShop(shopDomain);
  const planLimits =
    PLAN_LIMITS[shop.currentPlan as PlanTier] || PLAN_LIMITS.free;

  // -1 means unlimited
  if (planLimits.monthlyViews === -1) {
    return false;
  }

  return shop.monthlyViews >= planLimits.monthlyViews;
}

/**
 * Get remaining views for current billing period
 */
export async function getRemainingViews(shopDomain: string): Promise<number> {
  const shop = await getShop(shopDomain);
  const planLimits =
    PLAN_LIMITS[shop.currentPlan as PlanTier] || PLAN_LIMITS.free;

  // -1 means unlimited
  if (planLimits.monthlyViews === -1) {
    return -1;
  }

  const remaining = planLimits.monthlyViews - shop.monthlyViews;
  return Math.max(0, remaining);
}

/**
 * Get view limit for a plan
 */
export function getPlanViewLimit(planTier: PlanTier): number {
  return PLAN_LIMITS[planTier]?.monthlyViews || PLAN_LIMITS.free.monthlyViews;
}

/**
 * Check if a timer type requires a specific plan
 */
export async function canCreateTimerType(
  shopDomain: string,
  timerType: string,
): Promise<{ allowed: boolean; requiredPlan?: PlanTier; message?: string }> {
  // Map timer types to required features
  const timerTypeFeatures: Record<string, PlanFeature | null> = {
    "product-page": null, // Available in free plan
    "top-bottom-bar": null, // Available in free plan
    "landing-page": "landingPageTimers",
    "cart-page": "cartPageTimers",
    email: "emailTimers",
  };

  const requiredFeature = timerTypeFeatures[timerType];

  // If no specific feature required, it's available in free plan
  if (!requiredFeature) {
    return { allowed: true };
  }

  const hasAccess = await hasFeatureAccess(shopDomain, requiredFeature);

  if (!hasAccess) {
    // Determine minimum required plan
    let requiredPlan: PlanTier = "starter";
    for (const [plan, limits] of Object.entries(PLAN_LIMITS)) {
      if (limits.features[requiredFeature]) {
        requiredPlan = plan as PlanTier;
        break;
      }
    }

    return {
      allowed: false,
      requiredPlan,
      message: `This timer type requires the ${requiredPlan} plan or higher.`,
    };
  }

  return { allowed: true };
}

/**
 * Check if shop can use scheduled timers
 */
export async function canUseScheduledTimers(
  shopDomain: string,
): Promise<boolean> {
  return await hasFeatureAccess(shopDomain, "scheduledTimers");
}

/**
 * Check if shop can use recurring timers
 */
export async function canUseRecurringTimers(
  shopDomain: string,
): Promise<boolean> {
  return await hasFeatureAccess(shopDomain, "recurringTimers");
}

/**
 * Check if shop can use geolocation targeting
 */
export async function canUseGeolocation(shopDomain: string): Promise<boolean> {
  return await hasFeatureAccess(shopDomain, "geolocation");
}

/**
 * Check if shop can use product tags
 */
export async function canUseProductTags(shopDomain: string): Promise<boolean> {
  return await hasFeatureAccess(shopDomain, "productTags");
}

/**
 * Get all features available for a shop's current plan
 */
export async function getAvailableFeatures(shopDomain: string): Promise<{
  plan: string;
  monthlyViews: number;
  features: Record<string, boolean>;
}> {
  const shop = await getShop(shopDomain);
  const planLimits =
    PLAN_LIMITS[shop.currentPlan as PlanTier] || PLAN_LIMITS.free;

  return {
    plan: shop.currentPlan,
    monthlyViews: planLimits.monthlyViews,
    features: { ...planLimits.features },
  };
}

/**
 * Validate timer configuration against plan limits
 */
export async function validateTimerConfig(
  shopDomain: string,
  timerConfig: {
    type: string;
    isRecurring?: boolean;
    startsAt?: Date | null;
    geolocation?: string;
    productTags?: unknown;
  },
): Promise<{ valid: boolean; errors: string[] }> {
  const errors: string[] = [];

  // Check timer type access
  const timerTypeCheck = await canCreateTimerType(shopDomain, timerConfig.type);
  if (!timerTypeCheck.allowed) {
    errors.push(
      timerTypeCheck.message || "Timer type not available in current plan",
    );
  }

  // Check recurring timer access
  if (timerConfig.isRecurring) {
    const canUseRecurring = await canUseRecurringTimers(shopDomain);
    if (!canUseRecurring) {
      errors.push("Recurring timers require the Starter plan or higher");
    }
  }

  // Check scheduled timer access
  if (timerConfig.startsAt) {
    const canUseScheduled = await canUseScheduledTimers(shopDomain);
    if (!canUseScheduled) {
      errors.push("Scheduled timers require the Starter plan or higher");
    }
  }

  // Check geolocation access
  if (timerConfig.geolocation && timerConfig.geolocation !== "all-world") {
    const canUseGeo = await canUseGeolocation(shopDomain);
    if (!canUseGeo) {
      errors.push("Geolocation targeting requires the Standard plan or higher");
    }
  }

  // Check product tags access
  if (timerConfig.productTags) {
    const canUseTags = await canUseProductTags(shopDomain);
    if (!canUseTags) {
      errors.push("Product tag targeting requires the Standard plan or higher");
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Check if shop is on trial
 */
export async function isOnTrial(shopDomain: string): Promise<boolean> {
  const shop = await getShop(shopDomain);

  if (!shop.trialEndsAt) {
    return false;
  }

  return new Date() < shop.trialEndsAt;
}

/**
 * Get days remaining in trial
 */
export async function getTrialDaysRemaining(
  shopDomain: string,
): Promise<number> {
  const shop = await getShop(shopDomain);

  if (!shop.trialEndsAt) {
    return 0;
  }

  const now = new Date();
  const trialEnd = shop.trialEndsAt;

  if (now >= trialEnd) {
    return 0;
  }

  const diffTime = trialEnd.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
}

/**
 * Check if shop's billing is active
 */
export async function isBillingActive(shopDomain: string): Promise<boolean> {
  const shop = await getShop(shopDomain);
  return shop.billingStatus === "active";
}

/**
 * Get upgrade recommendations based on usage
 */
export async function getUpgradeRecommendations(shopDomain: string): Promise<{
  shouldUpgrade: boolean;
  reason?: string;
  recommendedPlan?: PlanTier;
}> {
  const shop = await getShop(shopDomain);
  const currentPlan = shop.currentPlan as PlanTier;
  const planLimits = PLAN_LIMITS[currentPlan] || PLAN_LIMITS.free;

  // Check if approaching view limit (80% threshold)
  if (planLimits.monthlyViews !== -1) {
    const usagePercent = (shop.monthlyViews / planLimits.monthlyViews) * 100;

    if (usagePercent >= 80) {
      // Recommend next tier
      const planOrder: PlanTier[] = ["free", "starter", "standard", "premium"];
      const currentIndex = planOrder.indexOf(currentPlan);
      const nextPlan = planOrder[currentIndex + 1];

      if (nextPlan) {
        return {
          shouldUpgrade: true,
          reason: `You've used ${Math.round(usagePercent)}% of your monthly views`,
          recommendedPlan: nextPlan,
        };
      }
    }
  }

  return { shouldUpgrade: false };
}
