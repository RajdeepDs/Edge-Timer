import { useState, useEffect } from "react";
import { Banner, InlineStack, Text, Link, Box } from "@shopify/polaris";

interface UsageStats {
  currentPlan: string;
  monthlyViews: number;
  viewLimit: number;
  viewsRemaining: number;
  viewLimitExceeded: boolean;
  timerCount: number;
  publishedTimerCount: number;
  timerLimit: number;
  timerLimitExceeded: boolean;
  viewsResetAt: Date;
  planStartDate: Date;
}

interface UsageBannerProps {
  shop?: string;
  autoLoad?: boolean;
}

export function UsageBanner({ shop, autoLoad = true }: UsageBannerProps) {
  const [stats, setStats] = useState<UsageStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (autoLoad) {
      loadUsageStats();
    }
  }, [autoLoad]);

  const loadUsageStats = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/shop/usage");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to load usage stats");
      }

      setStats(data.stats);
    } catch (err) {
      console.error("Error loading usage stats:", err);
      setError(err instanceof Error ? err.message : "Failed to load stats");
    } finally {
      setLoading(false);
    }
  };

  if (loading || !stats || error) {
    return null;
  }

  const { viewLimitExceeded, timerLimitExceeded, currentPlan } = stats;

  // Show critical warning if view limit exceeded
  if (viewLimitExceeded) {
    return (
      <Box paddingBlockEnd="400">
        <Banner
          title="Monthly view limit exceeded"
          tone="critical"
          onDismiss={() => {}}
        >
          <Text as="p" variant="bodyMd">
            Your timers have exceeded the monthly view limit for the{" "}
            <Text as="span" fontWeight="semibold">
              {currentPlan}
            </Text>{" "}
            plan. Timers will not be displayed to customers until you{" "}
            <Link url="/plans" removeUnderline>
              upgrade your plan
            </Link>{" "}
            or wait for the next billing cycle.
          </Text>
        </Banner>
      </Box>
    );
  }

  // Show critical warning if timer limit exceeded
  if (timerLimitExceeded) {
    return (
      <Box paddingBlockEnd="400">
        <Banner
          title="Timer limit reached"
          tone="critical"
          onDismiss={() => {}}
        >
          <Text as="p" variant="bodyMd">
            You have reached the maximum number of timers ({stats.timerLimit}){" "}
            for the{" "}
            <Text as="span" fontWeight="semibold">
              {currentPlan}
            </Text>{" "}
            plan. Please{" "}
            <Link url="/plans" removeUnderline>
              upgrade your plan
            </Link>{" "}
            to create more timers.
          </Text>
        </Banner>
      </Box>
    );
  }

  // Show warning when approaching view limit (>80%)
  const viewUsagePercent =
    stats.viewLimit > 0
      ? (stats.monthlyViews / stats.viewLimit) * 100
      : 0;

  if (viewUsagePercent >= 80 && viewUsagePercent < 100) {
    const daysUntilReset = Math.ceil(
      (new Date(stats.viewsResetAt).getTime() - Date.now()) /
        (1000 * 60 * 60 * 24)
    );

    return (
      <Box paddingBlockEnd="400">
        <Banner
          title="Approaching view limit"
          tone="warning"
          onDismiss={() => {}}
        >
          <InlineStack gap="100" wrap={false}>
            <Text as="p" variant="bodyMd">
              You've used {stats.monthlyViews.toLocaleString()} of{" "}
              {stats.viewLimit.toLocaleString()} monthly timer views (
              {viewUsagePercent.toFixed(0)}%).{" "}
              {daysUntilReset > 0
                ? `Resets in ${daysUntilReset} ${daysUntilReset === 1 ? "day" : "days"}.`
                : "Resets soon."}{" "}
              <Link url="/plans" removeUnderline>
                Upgrade now
              </Link>{" "}
              for more views.
            </Text>
          </InlineStack>
        </Banner>
      </Box>
    );
  }

  // Show warning when approaching timer limit
  const timerUsagePercent =
    stats.timerLimit > 0
      ? (stats.timerCount / stats.timerLimit) * 100
      : 0;

  if (
    stats.timerLimit > 0 &&
    timerUsagePercent >= 80 &&
    timerUsagePercent < 100
  ) {
    return (
      <Box paddingBlockEnd="400">
        <Banner
          title="Approaching timer limit"
          tone="info"
          onDismiss={() => {}}
        >
          <Text as="p" variant="bodyMd">
            You're using {stats.timerCount} of {stats.timerLimit} available
            timers ({timerUsagePercent.toFixed(0)}%).{" "}
            <Link url="/plans" removeUnderline>
              Upgrade your plan
            </Link>{" "}
            to create more timers.
          </Text>
        </Banner>
      </Box>
    );
  }

  return null;
}
