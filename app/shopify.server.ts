import "@shopify/shopify-app-remix/adapters/node";
import {
  ApiVersion,
  AppDistribution,
  shopifyApp,
} from "@shopify/shopify-app-remix/server";
import { PrismaSessionStorage } from "@shopify/shopify-app-session-storage-prisma";
import prisma from "./db.server";
import { ensureShopExists, ensureUserExists, ensureShopStatsExists } from "./utils/shop.server";

const shopify = shopifyApp({
  apiKey: process.env.SHOPIFY_API_KEY,
  apiSecretKey: process.env.SHOPIFY_API_SECRET || "",
  apiVersion: ApiVersion.January25,
  scopes: process.env.SCOPES?.split(","),
  appUrl: process.env.SHOPIFY_APP_URL || "",
  authPathPrefix: "/auth",
  sessionStorage: new PrismaSessionStorage(prisma),
  distribution: AppDistribution.AppStore,
  future: {
    unstable_newEmbeddedAuthStrategy: true,
    expiringOfflineAccessTokens: true,
  },
  ...(process.env.SHOP_CUSTOM_DOMAIN
    ? { customShopDomains: [process.env.SHOP_CUSTOM_DOMAIN] }
    : {}),
  hooks: {
    afterAuth: async ({ session, admin }) => {
      console.log(`[afterAuth] App installed/re-authed for shop: ${session.shop}`);

      try {
        await ensureShopExists(session.shop);
        await ensureShopStatsExists(session.shop);
      } catch (err) {
        console.error("[afterAuth] shop/stats setup failed:", err);
      }

      // Upsert ShopUser using online session user data + GraphQL for store email fallback
      try {
        const user = session.onlineAccessInfo?.associated_user;

        // Build shopifyUserId: prefer the numeric user id, fall back to shop-scoped key
        const shopifyUserId = user?.id
          ? String(user.id)
          : `shop:${session.shop}`;

        // Fetch store contact email from GraphQL as a fallback when user email is missing
        let storeEmail: string | null = null;
        try {
          const response = await admin.graphql(`#graphql
            query {
              shop {
                email
                contactEmail
              }
            }
          `);
          const { data } = await response.json();
          storeEmail = data?.shop?.contactEmail || data?.shop?.email || null;
        } catch {
          // Non-critical — we'll store whatever we have
        }

        await prisma.shopUser.upsert({
          where: { shopifyUserId },
          create: {
            shopifyUserId,
            shopDomain: session.shop,
            firstName: user?.first_name ?? null,
            lastName: user?.last_name ?? null,
            email: user?.email ?? storeEmail,
            accountOwner: user?.account_owner ?? false,
            locale: user?.locale ?? null,
            emailVerified: user?.email_verified ?? false,
            loginCount: 1,
            lastLoginAt: new Date(),
          },
          update: {
            ...(user?.first_name && { firstName: user.first_name }),
            ...(user?.last_name && { lastName: user.last_name }),
            email: user?.email ?? storeEmail ?? undefined,
            ...(user?.account_owner != null && { accountOwner: user.account_owner }),
            ...(user?.locale && { locale: user.locale }),
            ...(user?.email_verified != null && { emailVerified: user.email_verified }),
            loginCount: { increment: 1 },
            lastLoginAt: new Date(),
          },
        });

        console.log(`[afterAuth] ShopUser upserted for ${session.shop} (userId: ${shopifyUserId})`);
      } catch (err) {
        console.error("[afterAuth] ShopUser upsert failed:", err);
      }
    },
  },
});

export default shopify;
export const apiVersion = ApiVersion.January25;
export const addDocumentResponseHeaders = shopify.addDocumentResponseHeaders;
export const authenticate = shopify.authenticate;
export const unauthenticated = shopify.unauthenticated;
export const login = shopify.login;
export const registerWebhooks = shopify.registerWebhooks;
export const sessionStorage = shopify.sessionStorage;
