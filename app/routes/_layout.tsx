import type { HeadersFunction, LoaderFunctionArgs } from "@remix-run/node";
import { Link, Outlet, useLoaderData, useRouteError } from "@remix-run/react";
import { boundary } from "@shopify/shopify-app-remix/server";
import { AppProvider } from "@shopify/shopify-app-remix/react";
import { NavMenu } from "@shopify/app-bridge-react";
import polarisStyles from "@shopify/polaris/build/esm/styles.css?url";

import { authenticate } from "../shopify.server";
import { ensureShopExists, ensureUserExists, ensureShopStatsExists, updateUserFromApi } from "app/utils/shop.server";


export const links = () => [{ rel: "stylesheet", href: polarisStyles }];

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session, admin } = await authenticate.admin(request);

  await ensureShopExists(session.shop);

  // Ensure rows exist (afterAuth handles new installs; these are safety nets for existing shops)
  try {
    await ensureShopStatsExists(session.shop);
  } catch (err) {
    console.error("[layout] ensureShopStatsExists failed:", err);
  }

  try {
    const user = await ensureUserExists(session);
    // Fallback: if email is still missing (existing shop, no re-auth), fetch from API once
    if (user && !user.email) {
      updateUserFromApi(admin, user.shopifyUserId).catch((err) =>
        console.error("[layout] updateUserFromApi failed:", err),
      );
    }
  } catch (err) {
    console.error("[layout] ensureUserExists failed:", err);
  }

  return { apiKey: process.env.SHOPIFY_API_KEY || "" };
};

export default function App() {
  const { apiKey } = useLoaderData<typeof loader>();

  return (
    <AppProvider isEmbeddedApp apiKey={apiKey}>
      <NavMenu>
        <Link to="/" rel="home">
          Home
        </Link>
        <Link to="/plans">Pricing Plans</Link>
        <Link to="/help">Help &amp; Support</Link>
      </NavMenu>
      <Outlet />
    </AppProvider>
  );
}

// Shopify needs Remix to catch some thrown responses, so that their headers are included in the response.
export function ErrorBoundary() {
  return boundary.error(useRouteError());
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};
