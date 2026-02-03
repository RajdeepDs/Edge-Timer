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
  Image,
  Banner,
} from "@shopify/polaris";
import { CheckIcon } from "@shopify/polaris-icons";
import PlanCard from "app/components/plans/plan-card";
import { useCallback } from "react";
import { plans } from "app/config/plans";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useNavigation } from "@remix-run/react";
import { authenticate } from "../shopify.server";
import { getShop } from "../utils/shop.server";
import { getPlanViewLimit } from "../utils/plan-check.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);

  if (!session?.shop) {
    throw new Response("Unauthorized", { status: 401 });
  }

  try {
    const shop = await getShop(session.shop);
    const currentPlan = shop.currentPlan || "free";
    const viewLimit = getPlanViewLimit(currentPlan as any);
    const usagePercent =
      viewLimit === -1 ? 0 : (shop.monthlyViews / viewLimit) * 100;

    // Check if coming back from successful subscription
    const url = new URL(request.url);
    const successParam = url.searchParams.get("success");
    const planParam = url.searchParams.get("plan");

    return json({
      shop: {
        currentPlan,
        monthlyViews: shop.monthlyViews,
        viewLimit,
        usagePercent,
        billingStatus: shop.billingStatus,
        trialEndsAt: shop.trialEndsAt?.toISOString(),
        shopDomain: session.shop,
      },
      subscriptionSuccess: successParam === "true",
      subscribedPlan: planParam,
    });
  } catch (error) {
    console.error("Error loading shop data:", error);
    // Return default values
    return json({
      shop: {
        currentPlan: "free",
        monthlyViews: 0,
        viewLimit: 1000,
        usagePercent: 0,
        billingStatus: "active",
        trialEndsAt: null,
        shopDomain: session.shop,
      },
      subscriptionSuccess: false,
      subscribedPlan: null,
    });
  }
};

export default function PricingPlans() {
  const { shop, subscriptionSuccess, subscribedPlan } =
    useLoaderData<typeof loader>();
  const navigation = useNavigation();
  const isSubscribing = navigation.state === "loading";

  const handleSubscribe = useCallback(
    (planId: string) => {
      try {
        // Using Shopify's Managed Pricing - redirect to their hosted plan selection page
        // Extract store handle from shop domain
        const shopDomain = shop.shopDomain || "";

        if (!shopDomain) {
          console.error("No shop domain available");
          alert(
            "Unable to load billing. Please refresh the page and try again.",
          );
          return;
        }

        const storeHandle = shopDomain.replace(".myshopify.com", "");
        const appHandle = "urgency-timer-3"; // Your app handle from the URL

        // Shopify's managed pricing URL format
        const managedPricingUrl = `https://admin.shopify.com/store/${storeHandle}/charges/${appHandle}/pricing_plans`;

        console.log(
          `🔄 Redirecting to Shopify managed pricing: ${managedPricingUrl}`,
        );
        console.log(`Selected plan: ${planId}`);

        // Redirect to Shopify's hosted plan selection page
        window.location.href = managedPricingUrl;
      } catch (error) {
        console.error("Error redirecting to billing:", error);
        alert(
          "Unable to start subscription. Please try again or contact support.",
        );
      }
    },
    [shop.shopDomain],
  );

  const currentPlanName =
    shop.currentPlan.charAt(0).toUpperCase() + shop.currentPlan.slice(1);
  const progressValue = shop.viewLimit === -1 ? 0 : shop.usagePercent;

  return (
    <Page
      backAction={{
        content: "Home",
        url: "/",
      }}
      title="Pricing Plans"
    >
      {subscriptionSuccess && subscribedPlan && (
        <Box paddingBlockEnd={{ xs: "400" }}>
          <Banner
            title="Subscription activated!"
            tone="success"
            onDismiss={() => {
              window.history.replaceState({}, "", "/plans");
            }}
          >
            <p>
              Your {subscribedPlan} plan has been activated successfully. Thank
              you for upgrading!
            </p>
          </Banner>
        </Box>
      )}

      <Box paddingBlockEnd={{ xs: "400" }}>
        <Banner tone="info">
          <p>
            When you select a plan, you'll be redirected to Shopify's secure
            billing page to review and approve your subscription. All plans
            include a <strong>14-day free trial</strong> - you won't be charged
            until the trial ends.
          </p>
        </Banner>
      </Box>

      <Box paddingBlockEnd={{ xs: "400" }}>
        <Card>
          <BlockStack gap="200">
            <Text as="p">
              You're currently on{" "}
              <Text as="strong">{currentPlanName} plan.</Text> (
              {shop.monthlyViews} /{" "}
              {shop.viewLimit === -1 ? "∞" : shop.viewLimit} monthly views). One
              visitor can have multiple views per session.
            </Text>
            {shop.viewLimit !== -1 && (
              <ProgressBar
                progress={progressValue}
                size="small"
                tone="primary"
              />
            )}
            {shop.trialEndsAt && (
              <Text as="p" tone="success">
                Trial active until{" "}
                {new Date(shop.trialEndsAt).toLocaleDateString()}
              </Text>
            )}
          </BlockStack>
        </Card>
      </Box>

      {shop.currentPlan === "free" && (
        <Box paddingBlockEnd={{ xs: "400" }}>
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
                    Up to <Text as="strong">1500</Text> monthly views
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
        </Box>
      )}

      <Box paddingBlockEnd="400">
        <Layout>
          {plans.map((plan) => (
            <Layout.Section key={plan.id} variant="oneThird">
              <PlanCard
                title={plan.title}
                subtitle={plan.subtitle}
                badge={plan.badge}
                price={plan.monthlyPrice}
                items={plan.items}
                yearly={false}
                yearlyPrice={plan.yearlyTotal}
                planId={plan.id}
                currentPlan={shop.currentPlan}
                onSubscribe={handleSubscribe}
                isSubscribing={isSubscribing}
              />
            </Layout.Section>
          ))}
        </Layout>
      </Box>
      <Box paddingBlockEnd="400">
        <BlockStack>
          <Card>
            <InlineStack blockAlign="center" wrap={false} gap="400">
              <Image source="/money_back.svg" alt="Money Back Guarantee" />
              <BlockStack gap="200">
                <Text as="h2" variant="headingMd">
                  30 Day Money Back Guarantee - No questions asked!
                </Text>
                <Text as="p">
                  Write to us within the first 30 days of your paid subscription
                  and we will refund you the money via Shopify's billing.
                </Text>
              </BlockStack>
            </InlineStack>
          </Card>
        </BlockStack>
      </Box>
    </Page>
  );
}
