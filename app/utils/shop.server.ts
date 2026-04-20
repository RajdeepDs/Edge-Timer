import prisma from "../db.server";

/**
 * Plan limits configuration
 */
export const PLAN_LIMITS = {
  free: {
    monthlyViews: 1500,
    timers: 2,
  },
  starter: {
    monthlyViews: 10000,
    timers: -1, // unlimited
  },
  standard: {
    monthlyViews: 50000,
    timers: -1, // unlimited
  },
  premium: {
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
        setupCompleted: false,
        embedActivated: false,
        firstTimerCreated: false,
        timerConfirmedWorking: false,
        setupDismissed: false,
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
 * Update shop's monthly view count and lifetime stats
 */
export async function incrementShopViews(shopDomain: string) {
  const [shop] = await Promise.all([
    prisma.shop.update({
      where: { shopDomain },
      data: { monthlyViews: { increment: 1 } },
    }),
    prisma.shopStats.upsert({
      where: { shopDomain },
      create: { shopDomain, totalViewsAllTime: 1, lastViewAt: new Date() },
      update: {
        totalViewsAllTime: { increment: 1 },
        lastViewAt: new Date(),
        lastActiveAt: new Date(),
      },
    }),
  ]);

  // Keep peakMonthlyViews in sync after the Shop update
  prisma.shopStats
    .updateMany({
      where: { shopDomain, peakMonthlyViews: { lt: shop.monthlyViews } },
      data: { peakMonthlyViews: shop.monthlyViews },
    })
    .catch(() => {});

  return shop;
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
 * Unpublish all timers for a shop when view limit is exceeded.
 * Only runs if the limit is actually exceeded to avoid unnecessary DB writes.
 */
export async function unpublishAllTimersIfLimitExceeded(
  shopDomain: string,
): Promise<void> {
  const exceeded = await hasExceededViewLimit(shopDomain);
  if (!exceeded) return;

  await prisma.timer.updateMany({
    where: { shop: shopDomain, isPublished: true },
    data: { isPublished: false },
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
 * Upsert ShopUser from a Shopify session. Called on every authenticated request.
 * Falls back to a shop-scoped synthetic ID when Shopify doesn't provide userId
 * (e.g. offline sessions or the new embedded auth strategy before token exchange).
 */
export async function ensureUserExists(session: {
  userId?: bigint | null;
  shop: string;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  accountOwner?: boolean;
  locale?: string | null;
  emailVerified?: boolean | null;
}) {
  // Use Shopify's userId when available; fall back to a stable shop-scoped key.
  const shopifyUserId = session.userId
    ? String(session.userId)
    : `shop:${session.shop}`;

  return await prisma.shopUser.upsert({
    where: { shopifyUserId },
    create: {
      shopifyUserId,
      shopDomain: session.shop,
      firstName: session.firstName ?? null,
      lastName: session.lastName ?? null,
      email: session.email ?? null,
      accountOwner: session.accountOwner ?? false,
      locale: session.locale ?? null,
      emailVerified: session.emailVerified ?? false,
      loginCount: 1,
      lastLoginAt: new Date(),
    },
    update: {
      // Update user info whenever it arrives (may be null early, filled later)
      ...(session.firstName != null && { firstName: session.firstName }),
      ...(session.lastName != null && { lastName: session.lastName }),
      ...(session.email != null && { email: session.email }),
      ...(session.accountOwner != null && { accountOwner: session.accountOwner }),
      ...(session.locale != null && { locale: session.locale }),
      ...(session.emailVerified != null && { emailVerified: session.emailVerified }),
      // Upgrade from synthetic ID to real userId when we get it
      ...(session.userId && shopifyUserId !== `shop:${session.shop}` && { shopifyUserId: String(session.userId) }),
      loginCount: { increment: 1 },
      lastLoginAt: new Date(),
    },
  });
}

/**
 * Fetch user info from Shopify Admin GraphQL and update the ShopUser record.
 * Called when the session is offline and doesn't carry name/email directly.
 */
export async function updateUserFromApi(admin: any, shopifyUserId: string) {
  const response = await admin.graphql(`#graphql
    query {
      shop {
        email
        owner {
          firstName
          lastName
          email
        }
      }
    }
  `);

  const { data } = await response.json();
  const owner = data?.shop?.owner;
  const shopEmail = data?.shop?.email;

  if (!owner && !shopEmail) return;

  await prisma.shopUser.update({
    where: { shopifyUserId },
    data: {
      ...(owner?.firstName && { firstName: owner.firstName }),
      ...(owner?.lastName && { lastName: owner.lastName }),
      email: owner?.email ?? shopEmail ?? undefined,
      accountOwner: true,
    },
  });
}

/**
 * Ensure a ShopStats row exists for the shop (upsert with zero defaults).
 */
export async function ensureShopStatsExists(shopDomain: string) {
  return await prisma.shopStats.upsert({
    where: { shopDomain },
    create: { shopDomain },
    update: { lastActiveAt: new Date() },
  });
}

/**
 * Increment timer creation stats when a new timer is created.
 */
export async function incrementShopTimerCreated(shopDomain: string) {
  return await prisma.shopStats.upsert({
    where: { shopDomain },
    create: {
      shopDomain,
      totalTimersCreated: 1,
      activeTimerCount: 1,
      lastTimerCreatedAt: new Date(),
      lastActiveAt: new Date(),
    },
    update: {
      totalTimersCreated: { increment: 1 },
      activeTimerCount: { increment: 1 },
      lastTimerCreatedAt: new Date(),
      lastActiveAt: new Date(),
    },
  });
}

/**
 * Sync active/published timer counts into ShopStats (best-effort, call after publish toggle or delete).
 */
export async function syncTimerCountsToStats(shopDomain: string) {
  const [activeTimerCount, publishedTimerCount] = await Promise.all([
    prisma.timer.count({ where: { shop: shopDomain, isActive: true } }),
    prisma.timer.count({ where: { shop: shopDomain, isPublished: true } }),
  ]);

  return await prisma.shopStats.upsert({
    where: { shopDomain },
    create: { shopDomain, activeTimerCount, publishedTimerCount },
    update: { activeTimerCount, publishedTimerCount },
  });
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
