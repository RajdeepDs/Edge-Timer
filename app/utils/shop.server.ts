import prisma from "../db.server";

/**
 * Plan limits configuration
 */
export const PLAN_LIMITS = {
  free: {
    monthlyViews: 1000,
    timers: 2,
  },
  starter: {
    monthlyViews: 10000,
    timers: -1, // unlimited
  },
  essential: {
    monthlyViews: 50000,
    timers: -1, // unlimited
  },
  professional: {
    monthlyViews: -1, // unlimited
    timers: -1, // unlimited
  },
} as const;

export type PlanType = keyof typeof PLAN_LIMITS;

/**
 * Ensures a Shop record exists for the given shop domain
 * Creates one if it doesn't exist
 */

export async function ensureShopExists(shopDomain: string) {
  let shop = await prisma.shop.findUnique({
    where: { shopDomain },
  });

  if (!shop) {
    shop = await prisma.shop.create({
      data: {
        shopDomain,
        currentPlan: "free",
        monthlyViews: 0,
        viewsResetAt: new Date(),
        billingStatus: "active",
      },
    });
    console.log(`Created new Shop record for ${shopDomain}`);
  } else {
    // If the shop previously uninstalled and reinstalled the app,
    // reactivate billing status and clear soft-delete flag.
    if (shop.billingStatus === "cancelled" || shop.deletedAt) {
      shop = await prisma.shop.update({
        where: { shopDomain },
        data: {
          billingStatus: "active",
          deletedAt: null,
        },
      });

      console.log(`Reactivated Shop record for ${shopDomain}`);
    }
  }

  return shop;
}

/**
 * Get shop with error handling
 */
export async function getShop(shopDomain: string) {
  const shop = await prisma.shop.findUnique({
    where: { shopDomain },
  });

  if (!shop) {
    throw new Error(`Shop ${shopDomain} not found`);
  }

  return shop;
}

/**
 * Update shop's monthly view count
 */
export async function incrementShopViews(shopDomain: string) {
  return await prisma.shop.update({
    where: { shopDomain },
    data: {
      monthlyViews: {
        increment: 1,
      },
    },
  });
}

/**
 * Reset monthly views (called on billing cycle)
 */
export async function resetMonthlyViews(shopDomain: string) {
  const nextResetDate = new Date();
  nextResetDate.setDate(nextResetDate.getDate() + 30);

  return await prisma.shop.update({
    where: { shopDomain },
    data: {
      monthlyViews: 0,
      viewsResetAt: nextResetDate,
    },
  });
}

/**
 * Check if shop has exceeded view limit for current plan
 */
export async function hasExceededViewLimit(
  shopDomain: string,
): Promise<boolean> {
  const shop = await getShop(shopDomain);

  const plan = (shop.currentPlan?.toLowerCase() || "free") as PlanType;
  const limit =
    PLAN_LIMITS[plan]?.monthlyViews ?? PLAN_LIMITS.free.monthlyViews;

  if (limit === -1) return false; // unlimited

  return shop.monthlyViews >= limit;
}

/**
 * Check if shop has exceeded timer limit for current plan
 */
export async function hasExceededTimerLimit(
  shopDomain: string,
): Promise<boolean> {
  const shop = await getShop(shopDomain);

  const plan = (shop.currentPlan?.toLowerCase() || "free") as PlanType;
  const limit = PLAN_LIMITS[plan]?.timers ?? PLAN_LIMITS.free.timers;

  if (limit === -1) return false; // unlimited

  const timerCount = await prisma.timer.count({
    where: {
      shop: shopDomain,
      isActive: true,
    },
  });

  return timerCount >= limit;
}

/**
 * Get remaining views for current billing period
 */
export async function getRemainingViews(shopDomain: string): Promise<number> {
  const shop = await getShop(shopDomain);

  const plan = (shop.currentPlan?.toLowerCase() || "free") as PlanType;
  const limit =
    PLAN_LIMITS[plan]?.monthlyViews ?? PLAN_LIMITS.free.monthlyViews;

  if (limit === -1) return -1; // unlimited

  return Math.max(0, limit - shop.monthlyViews);
}

/**
 * Get shop usage stats
 */
export async function getShopUsageStats(shopDomain: string) {
  const shop = await getShop(shopDomain);

  const plan = (shop.currentPlan?.toLowerCase() || "free") as PlanType;
  const planLimits = PLAN_LIMITS[plan] ?? PLAN_LIMITS.free;

  const timerCount = await prisma.timer.count({
    where: {
      shop: shopDomain,
      isActive: true,
    },
  });

  const publishedTimerCount = await prisma.timer.count({
    where: {
      shop: shopDomain,
      isActive: true,
      isPublished: true,
    },
  });

  return {
    currentPlan: shop.currentPlan,
    monthlyViews: shop.monthlyViews,
    viewLimit: planLimits.monthlyViews,
    viewsRemaining:
      planLimits.monthlyViews === -1
        ? -1
        : Math.max(0, planLimits.monthlyViews - shop.monthlyViews),
    viewLimitExceeded:
      planLimits.monthlyViews === -1
        ? false
        : shop.monthlyViews >= planLimits.monthlyViews,
    timerCount,
    publishedTimerCount,
    timerLimit: planLimits.timers,
    timerLimitExceeded:
      planLimits.timers === -1 ? false : timerCount >= planLimits.timers,
    viewsResetAt: shop.viewsResetAt,
    planStartDate: shop.planStartDate,
  };
}

/**
 * Check if shop can create a new timer
 */
export async function canCreateTimer(
  shopDomain: string,
): Promise<{ allowed: boolean; reason?: string }> {
  const limitExceeded = await hasExceededTimerLimit(shopDomain);

  if (limitExceeded) {
    const shop = await getShop(shopDomain);
    const plan = (shop.currentPlan?.toLowerCase() || "free") as PlanType;
    const limit = PLAN_LIMITS[plan]?.timers ?? PLAN_LIMITS.free.timers;

    return {
      allowed: false,
      reason: `You have reached the maximum number of timers (${limit}) for your current plan. Please upgrade to create more timers.`,
    };
  }

  return { allowed: true };
}

/**
 * Update shop's subscription plan
 */
export async function updateShopPlan(
  shopDomain: string,
  plan: string,
  subscriptionId?: string,
) {
  const nextResetDate = new Date();
  nextResetDate.setDate(nextResetDate.getDate() + 30);

  return await prisma.shop.update({
    where: { shopDomain },
    data: {
      currentPlan: plan.toLowerCase(),
      subscriptionId: subscriptionId || null,
      planStartDate: new Date(),
      monthlyViews: 0,
      viewsResetAt: nextResetDate,
    },
  });
}
