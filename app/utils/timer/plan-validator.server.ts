import type { Timer } from "@prisma/client";
import {
  canCreateTimerType,
  canUseScheduledTimers,
  canUseRecurringTimers,
  canUseGeolocation,
  canUseProductTags,
  hasExceededViewLimit,
} from "../plan-check.server";

/**
 * Validate timer creation against plan limits
 */
export async function validateTimerCreation(
  shopDomain: string,
  timerData: Partial<Timer>,
): Promise<{ valid: boolean; errors: string[] }> {
  const errors: string[] = [];

  // Check if view limit exceeded
  const viewLimitExceeded = await hasExceededViewLimit(shopDomain);
  if (viewLimitExceeded) {
    errors.push(
      "You've reached your monthly view limit. Please upgrade to continue.",
    );
  }

  // Check timer type access
  if (timerData.type) {
    const timerTypeCheck = await canCreateTimerType(shopDomain, timerData.type);
    if (!timerTypeCheck.allowed) {
      errors.push(
        timerTypeCheck.message || "Timer type not available in current plan",
      );
    }
  }

  // Check recurring timer access
  if (timerData.isRecurring) {
    const canUseRecurring = await canUseRecurringTimers(shopDomain);
    if (!canUseRecurring) {
      errors.push("Recurring timers require the Starter plan or higher");
    }
  }

  // Check scheduled timer access
  if (timerData.startsAt) {
    const canUseScheduled = await canUseScheduledTimers(shopDomain);
    if (!canUseScheduled) {
      errors.push("Scheduled timers require the Starter plan or higher");
    }
  }

  // Check geolocation access
  if (timerData.geolocation && timerData.geolocation !== "all-world") {
    const canUseGeo = await canUseGeolocation(shopDomain);
    if (!canUseGeo) {
      errors.push("Geolocation targeting requires the Standard plan or higher");
    }
  }

  // Check product tags access
  if (
    timerData.productTags &&
    Array.isArray(timerData.productTags) &&
    (timerData.productTags as unknown[]).length > 0
  ) {
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
 * Validate timer update against plan limits
 */
export async function validateTimerUpdate(
  shopDomain: string,
  currentTimer: Timer,
  updates: Partial<Timer>,
): Promise<{ valid: boolean; errors: string[] }> {
  const errors: string[] = [];

  // Merge current timer data with updates
  const mergedTimer = { ...currentTimer, ...updates };

  // Run full validation on merged data
  const validation = await validateTimerCreation(shopDomain, mergedTimer);
  errors.push(...validation.errors);

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Get feature restrictions for display in UI
 */
export async function getTimerFeatureRestrictions(shopDomain: string): Promise<{
  timerTypes: {
    "product-page": boolean;
    "top-bottom-bar": boolean;
    "landing-page": boolean;
    "cart-page": boolean;
    email: boolean;
  };
  features: {
    scheduledTimers: boolean;
    recurringTimers: boolean;
    geolocation: boolean;
    productTags: boolean;
  };
  viewLimitReached: boolean;
}> {
  const [
    productPage,
    topBar,
    landingPage,
    cartPage,
    email,
    scheduled,
    recurring,
    geo,
    tags,
    viewLimit,
  ] = await Promise.all([
    canCreateTimerType(shopDomain, "product-page"),
    canCreateTimerType(shopDomain, "top-bottom-bar"),
    canCreateTimerType(shopDomain, "landing-page"),
    canCreateTimerType(shopDomain, "cart-page"),
    canCreateTimerType(shopDomain, "email"),
    canUseScheduledTimers(shopDomain),
    canUseRecurringTimers(shopDomain),
    canUseGeolocation(shopDomain),
    canUseProductTags(shopDomain),
    hasExceededViewLimit(shopDomain),
  ]);

  return {
    timerTypes: {
      "product-page": productPage.allowed,
      "top-bottom-bar": topBar.allowed,
      "landing-page": landingPage.allowed,
      "cart-page": cartPage.allowed,
      email: email.allowed,
    },
    features: {
      scheduledTimers: scheduled,
      recurringTimers: recurring,
      geolocation: geo,
      productTags: tags,
    },
    viewLimitReached: viewLimit,
  };
}

/**
 * Check if timer can be published based on plan
 */
export async function canPublishTimer(
  shopDomain: string,
  timer: Timer,
): Promise<{ allowed: boolean; reason?: string }> {
  // Check view limit
  const viewLimitExceeded = await hasExceededViewLimit(shopDomain);
  if (viewLimitExceeded) {
    return {
      allowed: false,
      reason: "Monthly view limit reached. Upgrade to publish more timers.",
    };
  }

  // Validate timer configuration
  const validation = await validateTimerCreation(shopDomain, timer);
  if (!validation.valid) {
    return {
      allowed: false,
      reason: validation.errors[0] || "Timer configuration not allowed",
    };
  }

  return { allowed: true };
}

/**
 * Get upgrade prompt message for feature
 */
export function getUpgradePrompt(feature: string): string {
  const prompts: Record<string, string> = {
    "landing-page": "Upgrade to Starter plan to create landing page timers",
    "cart-page": "Upgrade to Standard plan to create cart page timers",
    email: "Upgrade to Standard plan to create email timers",
    scheduledTimers: "Upgrade to Starter plan to schedule timers",
    recurringTimers: "Upgrade to Starter plan to create recurring timers",
    geolocation: "Upgrade to Standard plan to use geolocation targeting",
    productTags: "Upgrade to Standard plan to use product tag targeting",
    viewLimit: "Upgrade your plan to increase your monthly view limit",
  };

  return prompts[feature] || "Upgrade your plan to unlock this feature";
}
