import {
  BlockStack,
  Button,
  Card,
  Grid,
  Page,
  Text,
  Box,
  Icon,
  InlineStack,
  Bleed,
} from "@shopify/polaris";
import { useNavigate } from "@remix-run/react";
import { LockIcon } from "@shopify/polaris-icons";

interface TimerType {
  id: string;
  title: string;
  description: string;
  image: string;
  badge?: string;
  requiresUpgrade?: boolean;
}

const timerTypes: TimerType[] = [
  {
    id: "product-page",
    title: "Product page",
    description: "Block in product page below add to cart button.",
    image: "/timer-types/product_page.svg",
  },
  {
    id: "top-bottom-bar",
    title: "Top/bottom bar",
    description: "Fixed or sticky bar on the top or the bottom of any page.",
    image: "/timer-types/bar.svg",
  },
  // {
  //   id: "landing-page",
  //   title: "Landing page",
  //   description: "Block in home, collection, password, or any other page.",
  //   image: "/timer-types/landing_page.svg",
  //   badge: "Starter plan",
  //   requiresUpgrade: true,
  // },
  // {
  //   id: "cart-page",
  //   title: "Cart page",
  //   description: "Block in cart page below checkout button.",
  //   image: "/timer-types/cart_page.svg",
  //   badge: "Essential plan",
  //   requiresUpgrade: true,
  // },
];

export default function ChooseTimerPage() {
  const navigate = useNavigate();

  const handleSelectTimer = (timerId: string, requiresUpgrade?: boolean) => {
    if (requiresUpgrade) {
      // Handle upgrade flow
      console.log(`Upgrade required for ${timerId}`);
      return;
    }
    // Navigate to timer creation/configuration
    navigate(`/timer?type=${timerId}`);
  };

  return (
    <Page
      title="Choose timer type"
      backAction={{
        content: "Timers",
        url: "/",
      }}
    >
      <Box paddingBlockEnd="800">
        <Grid columns={{ xs: 1, sm: 2, md: 2, lg: 3 }}>
          {timerTypes.map((timer) => (
            <Grid.Cell key={timer.id}>
              <div style={{ height: "100%" }}>
                <Card padding="0">
                  <div
                    style={{
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <Box padding="400" paddingBlockEnd="0">
                      <img
                        src={timer.image}
                        alt={`${timer.title} preview`}
                        style={{
                          width: "100%",
                          height: "auto",
                          display: "block",
                        }}
                      />
                    </Box>

                    <Box padding="400">
                      <BlockStack gap="200">
                        <BlockStack gap="100">
                          <Text variant="headingMd" as="h3">
                            {timer.title}
                          </Text>
                        </BlockStack>
                        <Text variant="bodyMd" as="p" tone="subdued">
                          {timer.description}
                        </Text>
                      </BlockStack>
                    </Box>

                    <Box
                      paddingInline="400"
                      paddingBlockEnd="400"
                      minHeight="36px"
                    >
                      {timer.requiresUpgrade && (
                        <InlineStack blockAlign="center">
                          <Bleed marginInlineStart={"050"}>
                            <Icon source={LockIcon} tone="subdued" />
                          </Bleed>
                          <Text as="p" variant="bodyXs" tone="subdued">
                            Available with{" "}
                            <Text as="span" tone="base" fontWeight="medium">
                              {timer.badge}
                            </Text>
                            .
                          </Text>
                        </InlineStack>
                      )}
                    </Box>

                    <div style={{ marginTop: "auto" }}>
                      <Box padding="400" paddingBlockStart="0">
                        <Button
                          fullWidth
                          onClick={() =>
                            handleSelectTimer(timer.id, timer.requiresUpgrade)
                          }
                        >
                          {timer.requiresUpgrade
                            ? "Upgrade now"
                            : "Select this timer type"}
                        </Button>
                      </Box>
                    </div>
                  </div>
                </Card>
              </div>
            </Grid.Cell>
          ))}
        </Grid>
      </Box>
    </Page>
  );
}
