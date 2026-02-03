/**
 * Billing configuration for Shopify App Subscriptions
 */

export const BILLING_CONFIG = {
  starter: {
    amount: 4.99,
    currencyCode: "USD",
    interval: "EVERY_30_DAYS",
    trialDays: 14,
  },
  standard: {
    amount: 7.99,
    currencyCode: "USD",
    interval: "EVERY_30_DAYS",
    trialDays: 14,
  },
  premium: {
    amount: 14.99,
    currencyCode: "USD",
    interval: "EVERY_30_DAYS",
    trialDays: 14,
  },
} as const;

// Annual amounts are derived from current monthly with a 20% discount:
// annual = round_to_cents(12 * monthly * 0.8)
export const ANNUAL_BILLING_CONFIG = {
  starter: {
    amount: 47.9, // 4.99 * 12 * 0.8 = 47.904 -> 47.90
    currencyCode: "USD",
    interval: "ANNUAL",
    trialDays: 14,
  },
  standard: {
    amount: 76.7, // 7.99 * 12 * 0.8 = 76.704 -> 76.70
    currencyCode: "USD",
    interval: "ANNUAL",
    trialDays: 14,
  },
  premium: {
    amount: 143.9, // 14.99 * 12 * 0.8 = 143.904 -> 143.90
    currencyCode: "USD",
    interval: "ANNUAL",
    trialDays: 14,
  },
} as const;

export type PlanId = keyof typeof BILLING_CONFIG;

/**
 * Get billing configuration for a plan
 */
export function getBillingConfig(
  planId: PlanId,
  billingCycle: "MONTHLY" | "ANNUAL" = "MONTHLY",
) {
  const config =
    billingCycle === "ANNUAL"
      ? ANNUAL_BILLING_CONFIG[planId]
      : BILLING_CONFIG[planId];

  return {
    ...config,
    name: getPlanName(planId, billingCycle),
  };
}

/**
 * Get plan display name
 */
export function getPlanName(
  planId: PlanId,
  billingCycle: "MONTHLY" | "ANNUAL" = "MONTHLY",
): string {
  const names: Record<PlanId, string> = {
    starter: "Starter Plan",
    standard: "Standard Plan",
    premium: "Premium Plan",
  };

  const baseName = names[planId];
  return billingCycle === "ANNUAL" ? `${baseName} (Annual)` : baseName;
}

/**
 * Calculate annual savings percentage
 */
export function getAnnualSavingsPercent(planId: PlanId): number {
  const monthlyTotal = BILLING_CONFIG[planId].amount * 12;
  const annualTotal = ANNUAL_BILLING_CONFIG[planId].amount;
  const savings = ((monthlyTotal - annualTotal) / monthlyTotal) * 100;
  return Math.round(savings);
}

/**
 * Validate plan ID
 */
export function isValidPlanId(planId: string): planId is PlanId {
  return planId in BILLING_CONFIG;
}
