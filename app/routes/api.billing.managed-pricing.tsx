import type { LoaderFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { authenticate } from "../shopify.server";

/**
 * Managed Pricing Redirect Route
 *
 * This route handles redirects to Shopify's managed pricing page.
 * Server-side redirects ensure proper iframe breakout and compatibility
 * with Shopify's embedding requirements.
 *
 * Usage: Navigate to /api/billing/managed-pricing?plan=<planId>
 */
export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);

  if (!session?.shop) {
    throw new Response("Unauthorized", { status: 401 });
  }

  try {
    // Extract query parameters
    const url = new URL(request.url);
    const selectedPlan = url.searchParams.get("plan");

    // Build Shopify's managed pricing URL
    const shopDomain = session.shop;
    const storeHandle = shopDomain.replace(".myshopify.com", "");
    const appHandle = "urgency-timer-3"; // Your app handle

    // Shopify's managed pricing URL format
    // This page is hosted by Shopify and shows all your configured plans
    const managedPricingUrl = `https://admin.shopify.com/store/${storeHandle}/charges/${appHandle}/pricing_plans`;

    console.log(
      `🔄 Redirecting to Shopify managed pricing for shop: ${shopDomain}`,
    );
    if (selectedPlan) {
      console.log(`   Selected plan: ${selectedPlan}`);
    }

    // Server-side redirect
    // Shopify's embedding host automatically handles iframe breakout
    // This avoids X-Frame-Options and CSP issues
    return redirect(managedPricingUrl);
  } catch (error) {
    console.error("Error redirecting to managed pricing:", error);

    // Fallback to plans page on error
    return redirect("/plans?error=billing_redirect_failed");
  }
};
