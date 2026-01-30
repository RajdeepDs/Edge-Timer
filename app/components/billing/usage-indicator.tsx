import { Box, Text, ProgressBar, InlineStack, Badge } from "@shopify/polaris";

interface UsageIndicatorProps {
  currentUsage: number;
  limit: number;
  planName: string;
  showUpgradePrompt?: boolean;
}

export default function UsageIndicator({
  currentUsage,
  limit,
  planName,
  showUpgradePrompt = false,
}: UsageIndicatorProps) {
  const isUnlimited = limit === -1;
  const usagePercent = isUnlimited ? 0 : (currentUsage / limit) * 100;
  const isNearLimit = usagePercent >= 80;
  const isAtLimit = usagePercent >= 100;

  return (
    <Box>
      <InlineStack align="space-between" blockAlign="center">
        <InlineStack gap="200" blockAlign="center">
          <Text as="span" variant="bodyMd">
            <Text as="span" variant="bodyMd" fontWeight="semibold">
              {currentUsage.toLocaleString()}
            </Text>
            {" / "}
            {isUnlimited ? "∞" : limit.toLocaleString()}
            {" monthly views"}
          </Text>
          {isAtLimit && (
            <Badge tone="critical" size="small">
              Limit reached
            </Badge>
          )}
          {isNearLimit && !isAtLimit && (
            <Badge tone="warning">
              {`${Math.round(100 - usagePercent)}% remaining`}
            </Badge>
          )}
        </InlineStack>
        <Badge tone="info">{planName + " Plan"}</Badge>
      </InlineStack>
      {!isUnlimited && (
        <Box paddingBlockStart="200">
          <ProgressBar progress={Math.min(usagePercent, 100)} size="small" />
        </Box>
      )}
      {showUpgradePrompt && isNearLimit && (
        <Box paddingBlockStart="200">
          <Text as="p" tone="subdued" variant="bodySm">
            You're {isAtLimit ? "at" : "approaching"} your monthly view limit.
            {!isAtLimit && " Consider upgrading to avoid interruptions."}
          </Text>
        </Box>
      )}
    </Box>
  );
}
