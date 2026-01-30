/**
 * Billing configuration for Shopify App Subscriptions
 */

export const BILLING_CONFIG = {
  starter: {
    amount: 6.99,
    currencyCode: "USD",
    interval: "EVERY_30_DAYS",
    trialDays: 7,
  },
  essential: {
    amount: 9.99,
    currencyCode: "USD",
    interval: "EVERY_30_DAYS",
    trialDays: 7,
  },
  professional: {
    amount: 29.99,
    currencyCode: "USD",
    interval: "EVERY_30_DAYS",
    trialDays: 7,
  },
} as const;

export const ANNUAL_BILLING_CONFIG = {
  starter: {
    amount: 67.08,
    currencyCode: "USD",
    interval: "ANNUAL",
    trialDays: 7,
  },
  essential: {
    amount: 95.88,
    currencyCode: "USD",
    interval: "ANNUAL",
    trialDays: 7,
  },
  professional: {
    amount: 287.88,
    currencyCode: "USD",
    interval: "ANNUAL",
    trialDays: 7,
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
    essential: "Essential Plan",
    professional: "Professional Plan",
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
