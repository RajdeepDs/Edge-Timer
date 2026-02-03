import {
  BlockStack,
  Button,
  Text,
  Card,
  Icon,
  InlineStack,
  Badge,
  Box,
} from "@shopify/polaris";
import { CheckIcon } from "@shopify/polaris-icons";

interface PlanCardProps {
  title: string;
  subtitle: string;
  badge?: string;
  items: string[];
  price: string;
  yearly?: boolean;
  yearlyPrice?: string;
  planId: string;
  currentPlan: string;
  onSubscribe: (planId: string) => void;
  isSubscribing: boolean;
}

export default function PlanCard(props: PlanCardProps) {
  const {
    title,
    subtitle,
    badge,
    items,
    price,
    yearly,
    yearlyPrice,
    planId,
    currentPlan,
    onSubscribe,
    isSubscribing,
  } = props;

  const isCurrentPlan = currentPlan === planId;
  const planOrder = ["free", "starter", "standard", "premium"];
  const currentPlanIndex = planOrder.indexOf(currentPlan);
  const thisPlanIndex = planOrder.indexOf(planId);
  const isDowngrade = thisPlanIndex < currentPlanIndex;
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <Card>
        <div
          style={{ height: "100%", display: "flex", flexDirection: "column" }}
        >
          <BlockStack gap="400">
            <BlockStack gap="100">
              {badge ? (
                <InlineStack gap="200" blockAlign="center">
                  <Text as="h2" variant="headingMd">
                    {title}
                  </Text>
                  <Badge tone="info">{badge}</Badge>
                </InlineStack>
              ) : (
                <Text as="h2" variant="headingMd">
                  {title}
                </Text>
              )}
              <Text as="p" tone="subdued">
                {subtitle}
              </Text>
            </BlockStack>
            <Box minHeight="150px">
              <BlockStack gap="100" inlineAlign="baseline">
                {items.map((item, index) => (
                  <InlineStack key={index} gap="100" wrap={false}>
                    <Icon source={CheckIcon} />
                    <Text as="span">{item}</Text>
                  </InlineStack>
                ))}
              </BlockStack>
            </Box>
            <BlockStack>
              <InlineStack gap="100" blockAlign="baseline">
                <Text as="h3" variant="heading3xl">
                  {price}
                </Text>
                <Text as="span" tone="subdued" variant="bodyMd">
                  /month
                </Text>
              </InlineStack>
              {yearly && (
                <Text as="p">
                  <Text as="strong">{yearlyPrice}</Text> billed once a year
                </Text>
              )}
            </BlockStack>

            {isCurrentPlan ? (
              <Button size="large" disabled>
                Your current plan
              </Button>
            ) : isDowngrade ? (
              <Button size="large" disabled>
                Downgrade not available
              </Button>
            ) : (
              <Button
                size="large"
                variant="primary"
                onClick={() => onSubscribe(planId)}
                loading={isSubscribing}
              >
                Start FREE 14-day trial
              </Button>
            )}
          </BlockStack>
        </div>
      </Card>
    </div>
  );
}
