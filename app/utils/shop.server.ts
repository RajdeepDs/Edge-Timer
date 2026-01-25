import prisma from "../db.server";

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
        currentPlan: "Free",
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

  const limits = {
    free: 1000,
    starter: 10000,
    essential: 50000,
    professional: -1, // unlimited
  };

  const limit = limits[shop.currentPlan as keyof typeof limits];

  if (limit === -1) return false; // unlimited

  return shop.monthlyViews >= limit;
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
      currentPlan: plan,
      subscriptionId: subscriptionId || null,
      planStartDate: new Date(),
      monthlyViews: 0,
      viewsResetAt: nextResetDate,
    },
  });
}
