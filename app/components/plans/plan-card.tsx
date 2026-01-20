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
}

export default function PlanCard(props: PlanCardProps) {
  const { title, subtitle, badge, items, price, yearly, yearlyPrice } = props;
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

            <Button size="large" variant="primary">
              Start FREE 7-days trial
            </Button>
          </BlockStack>
        </div>
      </Card>
    </div>
  );
}
