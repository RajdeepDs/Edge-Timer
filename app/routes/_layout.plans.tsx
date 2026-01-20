import {
  Box,
  Card,
  Layout,
  Page,
  Text,
  BlockStack,
  InlineStack,
  ProgressBar,
  Button,
  Icon,
  ButtonGroup,
} from "@shopify/polaris";
import { CheckIcon } from "@shopify/polaris-icons";
import PlanCard from "app/components/plans/plan-card";
import { useCallback, useState } from "react";
import { plans } from "app/config/plans";

export default function PricingPlans() {
  const [activeButtonIndex, setActiveButtonIndex] = useState(0);

  const handleButtonClick = useCallback(
    (index: number) => {
      if (activeButtonIndex === index) return;
      setActiveButtonIndex(index);
    },
    [activeButtonIndex],
  );

  return (
    <Page
      backAction={{
        content: "Home",
        url: "/",
      }}
      title="Pricing Plans"
    >
      <Box paddingBlockEnd={{ xs: "400" }}>
        <Card>
          <Box>
            <InlineStack gap="200">
              <Text as="p">
                You're currently on <Text as="strong">Free plan.</Text> (0 /
                1000 monthly views). One visitor can have multiple views per
                session.
              </Text>
              <ProgressBar size="small" />
            </InlineStack>
          </Box>
        </Card>
      </Box>
      <Card>
        <InlineStack
          align="space-between"
          blockAlign="center"
          gap={{ xs: "400" }}
        >
          <BlockStack>
            <Text as="h2" variant="headingMd">
              Free Plan
            </Text>
            <InlineStack gap={{ xs: "400" }}>
              <Text as="span">
                Up to <Text as="strong">1000</Text> monthly views
              </Text>
              <InlineStack>
                <Icon source={CheckIcon} tone="base" />
                <Text as="span">Unlimited product timers</Text>
              </InlineStack>
              <InlineStack>
                <Icon source={CheckIcon} tone="base" />
                <Text as="span">Unlimited top bar timers</Text>
              </InlineStack>
            </InlineStack>
          </BlockStack>
          <Button disabled>Your current plan</Button>
        </InlineStack>
      </Card>
      <Box padding="600">
        <InlineStack align="center">
          <ButtonGroup variant="segmented">
            <Button
              pressed={activeButtonIndex === 0}
              onClick={() => handleButtonClick(0)}
            >
              Billed Monthly
            </Button>
            <Button
              pressed={activeButtonIndex === 1}
              onClick={() => handleButtonClick(1)}
            >
              Billed Yearly - Save 20%
            </Button>
          </ButtonGroup>
        </InlineStack>
      </Box>
      <Box>
        <Layout>
          {plans.map((plan) => (
            <Layout.Section key={plan.id} variant="oneThird">
              <PlanCard
                title={plan.title}
                subtitle={plan.subtitle}
                badge={plan.badge}
                price={
                  activeButtonIndex === 0 ? plan.monthlyPrice : plan.yearlyPrice
                }
                items={plan.items}
                yearly={activeButtonIndex === 1}
                yearlyPrice={plan.yearlyTotal}
              />
            </Layout.Section>
          ))}
        </Layout>
      </Box>
    </Page>
  );
}
