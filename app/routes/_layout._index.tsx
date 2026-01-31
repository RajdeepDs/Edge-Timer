import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useNavigate, useSubmit } from "@remix-run/react";
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
  ProgressBar,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate, registerWebhooks } from "../shopify.server";
import prisma from "app/db.server";
import { EmptyState } from "../components/ui/EmptyState";
import { TimerDataTable } from "../components/timer/TimerDataTable";
import { ensureShopExists } from "app/utils/shop.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const formData = await request.formData();
  const intent = formData.get("intent");
  const timerId = formData.get("timerId") as string;

  try {
    if (intent === "delete") {
      // Delete the timer
      await prisma.timer.delete({
        where: {
          id: timerId,
          shop: session.shop, // Ensure user can only delete their own timers
        },
      });

      return json({ success: true, message: "Timer deleted successfully" });
    }

    if (intent === "togglePublish") {
      // Get current timer
      const timer = await prisma.timer.findUnique({
        where: { id: timerId, shop: session.shop },
        select: { isPublished: true },
      });

      if (!timer) {
        return json(
          { success: false, error: "Timer not found" },
          { status: 404 },
        );
      }

      // Toggle publish status
      await prisma.timer.update({
        where: { id: timerId },
        data: { isPublished: !timer.isPublished },
      });

      return json({ success: true, message: "Timer status updated" });
    }

    return json({ success: false, error: "Invalid intent" }, { status: 400 });
  } catch (error) {
    console.error("Error in timer action:", error);
    return json(
      { success: false, error: "Failed to perform action" },
      { status: 500 },
    );
  }
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);

  // Ensure shop exists and get the shop data
  const shop = await ensureShopExists(session.shop);
  await registerWebhooks({ session });

  // Fetch all timers
  const timers = await prisma.timer.findMany({
    where: { shop: session.shop },
    orderBy: { createdAt: "desc" },
  });

  return Response.json({ shop, timers });
};

export default function Index() {
  const navigate = useNavigate();
  const submit = useSubmit();
  const { shop, timers } = useLoaderData<typeof loader>();

  const planLimits: Record<string, number> = {
    free: 1000,
    starter: 10000,
    essential: 50000,
    professional: -1,
  };

  const currentPlan = shop?.currentPlan?.toLowerCase() || "free";
  const monthlyViews = shop?.monthlyViews || 0;
  const limit = planLimits[currentPlan];
  const usageText =
    limit === -1
      ? `${monthlyViews} views this month`
      : `${monthlyViews}/${limit} monthly views`;

  const handleCreateTimer = () => navigate("/new");
  const handleTimerClick = (timerId: string) =>
    navigate(`/timer?id=${timerId}`);

  const handleDeleteTimer = (timerId: string) => {
    if (confirm("Are you sure you want to delete this timer?")) {
      const formData = new FormData();
      formData.append("intent", "delete");
      formData.append("timerId", timerId);
      submit(formData, { method: "post" });
    }
  };

  const handleTogglePublish = (timerId: string) => {
    const formData = new FormData();
    formData.append("intent", "togglePublish");
    formData.append("timerId", timerId);
    submit(formData, { method: "post" });
  };

  const currentPlanName =
    currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1);
  const progressValue = limit === -1 ? 0 : (monthlyViews / limit) * 100;

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
      <BlockStack gap="400">
        <Card>
          <InlineStack gap="400" align="space-between" blockAlign="center">
            <div style={{ flex: 1 }}>
              <BlockStack gap="200">
                <Text as="p">
                  You're currently on{" "}
                  <Text as="strong">{currentPlanName} Plan.</Text>{" "}
                  <Text as="span" tone="subdued">
                    ({usageText}).
                  </Text>{" "}
                  One visitor can have multiple views per session.
                </Text>
                {limit !== -1 && (
                  <ProgressBar
                    progress={progressValue}
                    size="small"
                    tone="primary"
                  />
                )}
                {shop?.trialEndsAt && (
                  <Text as="p" tone="success">
                    Trial active until{" "}
                    {new Date(shop?.trialEndsAt).toLocaleDateString()}
                  </Text>
                )}
              </BlockStack>
            </div>
            <Button url="/plans">Upgrade</Button>
          </InlineStack>
        </Card>

        {timers.length === 0 ? (
          <EmptyState
            title="This is where you'll manage your timers."
            message="Start by creating your first countdown timer and publishing it to your store."
            actionLabel="Create a new timer"
            onAction={handleCreateTimer}
          />
        ) : (
          <TimerDataTable
            timers={timers}
            onTimerClick={handleTimerClick}
            onDelete={handleDeleteTimer}
            onTogglePublish={handleTogglePublish}
          />
        )}
      </BlockStack>
    </Page>
  );
}
