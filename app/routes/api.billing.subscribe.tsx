import type { ActionFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import db from "../db.server";
import { getBillingConfig, isValidPlanId } from "../config/billing";

export const action = async ({ request }: ActionFunctionArgs) => {
  const { admin, session } = await authenticate.admin(request);

  if (!session?.shop) {
    return json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const planId = formData.get("planId") as string;
    const billingCycle = formData.get("billingCycle") as "MONTHLY" | "ANNUAL";

    if (!planId || !billingCycle) {
      return json({ error: "Missing planId or billingCycle" }, { status: 400 });
    }

    // Validate plan ID
    if (!isValidPlanId(planId)) {
      return json({ error: "Invalid plan ID" }, { status: 400 });
    }

    // Get billing configuration for the plan
    const config = getBillingConfig(planId, billingCycle);

    // Create subscription using GraphQL
    const response = await admin.graphql(
      `#graphql
      mutation AppSubscriptionCreate($name: String!, $returnUrl: URL!, $test: Boolean, $trialDays: Int, $lineItems: [AppSubscriptionLineItemInput!]!) {
        appSubscriptionCreate(
          name: $name
          returnUrl: $returnUrl
          test: $test
          trialDays: $trialDays
          lineItems: $lineItems
        ) {
          appSubscription {
            id
            name
            status
            trialDays
          }
          confirmationUrl
          userErrors {
            field
            message
          }
        }
      }`,
      {
        variables: {
          name: config.name,
          returnUrl: `${process.env.SHOPIFY_APP_URL}/plans?success=true&plan=${planId}`,
          test: process.env.NODE_ENV === "development",
          trialDays: config.trialDays,
          lineItems: [
            {
              plan: {
                appRecurringPricingDetails: {
                  price: {
                    amount: config.amount,
                    currencyCode: config.currencyCode,
                  },
                  interval:
                    config.interval === "ANNUAL" ? "ANNUAL" : "EVERY_30_DAYS",
                },
              },
            },
          ],
        },
      },
    );

    const responseJson = await response.json();
    const data = responseJson.data?.appSubscriptionCreate;

    if (!data || data.userErrors?.length > 0) {
      console.error("Subscription creation errors:", data?.userErrors);
      return json(
        {
          error:
            data?.userErrors?.[0]?.message || "Failed to create subscription",
        },
        { status: 400 },
      );
    }

    const confirmationUrl = data.confirmationUrl;
    const subscriptionId = data.appSubscription.id;

    // Update shop with subscription info (pending)
    const trialEndsAt = new Date();
    trialEndsAt.setDate(trialEndsAt.getDate() + config.trialDays);

    await db.shop.upsert({
      where: { shopDomain: session.shop },
      update: {
        currentPlan: planId,
        subscriptionId: subscriptionId,
        billingStatus: "active",
        trialEndsAt,
        planStartDate: new Date(),
      },
      create: {
        shopDomain: session.shop,
        currentPlan: planId,
        subscriptionId: subscriptionId,
        billingStatus: "active",
        trialEndsAt,
        planStartDate: new Date(),
        monthlyViews: 0,
        viewsResetAt: new Date(),
      },
    });

    console.log(
      `✅ Created subscription for ${session.shop} - Plan: ${planId}, Trial ends: ${trialEndsAt.toISOString()}`,
    );

    // Redirect to Shopify's billing confirmation page
    return redirect(confirmationUrl);
  } catch (error) {
    console.error("Error creating subscription:", error);
    return json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to create subscription",
      },
      { status: 500 },
    );
  }
};
