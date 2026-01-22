import type { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, useNavigate } from "@remix-run/react";
import {
  Page,
  Text,
  Card,
  Button,
  BlockStack,
  Box,
  InlineStack,
  Grid,
  InlineGrid,
  DataTable,
  Badge,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import prisma from "app/db.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);

  // Fetch shop info
  const shop = await prisma.shop.findUnique({
    where: { shopDomain: session.shop },
  });

  // Fetch all timers
  const timers = await prisma.timer.findMany({
    where: { shop: session.shop },
    orderBy: { createdAt: "desc" },
  });

  return Response.json({ shop, timers });
};

export default function Index() {
  const navigate = useNavigate();

  const { shop, timers } = useLoaderData<typeof loader>();

  const planLimits: Record<string, number> = {
    Free: 1000,
    starter: 10000,
    essential: 50000,
    professional: -1,
  };

  const limit = planLimits[shop?.currentPlan || "Free"];
  const usageText =
    limit === -1
      ? `${shop?.monthlyViews || 0} views this month`
      : `${shop?.monthlyViews || 0}/${limit} monthly views`;
  return (
    <Page>
      <TitleBar title="Urgency Timer" />
      <Box paddingBlock="500">
        <InlineGrid columns={{ lg: 6 }} alignItems="center">
          <Grid.Cell columnSpan={{ lg: 5 }}>
            <Text variant="headingLg" as="h5">
              Countdown timers
            </Text>
          </Grid.Cell>

          <Grid.Cell>
            <InlineStack align="end">
              <Button
                variant="primary"
                size="large"
                onClick={() => navigate("/new")}
              >
                Create a new timer
              </Button>
            </InlineStack>
          </Grid.Cell>
        </InlineGrid>
      </Box>
      <BlockStack gap="200">
        <Card>
          <Text as="h2" variant="bodyMd">
            You're currently on{" "}
            <Text as="span" variant="headingSm">
              {shop?.currentPlan || "Free"} Plan.
            </Text>{" "}
            ({usageText}). One visitor can have multiple views per session.
          </Text>
        </Card>

        {timers.length === 0 ? (
          <Card padding={"1200"}>
            <BlockStack gap="200" align="center">
              <Text as="h2" variant="headingLg" alignment="center">
                This is where you'll manage your timers.
              </Text>

              <Text as="p" variant="bodyMd" alignment="center">
                Start by creating your first countdown timer and publishing it
                to your store.
              </Text>

              <Box paddingBlockStart="400">
                <InlineStack align="center">
                  <Button
                    variant="primary"
                    size="large"
                    onClick={() => navigate("/new")}
                  >
                    Create a new timer
                  </Button>
                </InlineStack>
              </Box>
            </BlockStack>
          </Card>
        ) : (
          <Card padding="0">
            <DataTable
              columnContentTypes={["text", "text", "text"]}
              headings={["Timer name", "Type", "Status"]}
              rows={timers.map((timer) => [
                timer.name,
                timer.type,
                timer.isPublished ? (
                  <Badge tone="success">Published</Badge>
                ) : (
                  <Badge>Draft</Badge>
                ),
              ])}
              stickyHeader
            />
          </Card>
        )}
      </BlockStack>
    </Page>
  );
}
