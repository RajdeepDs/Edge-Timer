import { json, type LoaderFunctionArgs } from "@remix-run/node";
import prisma from "../db.server";
import { validateProxyRequest } from "../utils/proxy.server";

/**
 * App Proxy endpoint to serve published timers to the storefront.
 *
 * URL: https://yourstore.myshopify.com/apps/urgency-timer/timers
 *
 * Shopify will proxy requests to: https://yourapp.com/proxy/timers
 *
 * Query params automatically added by Shopify:
 * - shop: shop domain
 * - signature: HMAC signature for validation
 *
 * Additional params the client can send:
 * - type: "product-page" | "top-bottom-bar" | "landing-page" | "cart-page"
 * - pageType: "product" | "collection" | "home" | "cart" | "page"
 * - productId: Shopify product ID
 * - collectionIds: comma-separated collection IDs
 * - productTags: comma-separated product tags
 * - pageUrl: current page URL
 * - country: ISO country code
 */
export async function loader({ request }: LoaderFunctionArgs) {
  // Validate the app proxy signature
  const validation = validateProxyRequest(request);

  if (!validation.isValid) {
    return json(
      { error: validation.error || "Unauthorized" },
      {
        status: 401,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-store",
        }
      }
    );
  }

  const shop = validation.shop!;
  const url = new URL(request.url);
  const params = url.searchParams;

  // Extract context parameters
  const type = params.get("type") || "";
  const pageType = (params.get("pageType") || "").toLowerCase();
  const productId = params.get("productId") || "";
  const collectionIds = parseList(params.get("collectionIds"));
  const productTags = parseList(params.get("productTags")).map((t) => t.toLowerCase());
  const pageUrl = params.get("pageUrl") || "";
  const country = (params.get("country") || "").toUpperCase();

  try {
    // Fetch published, active timers for this shop
    const timers = await prisma.timer.findMany({
      where: {
        shop,
        isPublished: true,
        isActive: true,
        ...(type ? { type } : {}),
        // Only timers that have started (startsAt <= now) or have no start date
        OR: [
          { startsAt: null },
          { startsAt: { lte: new Date() } }
        ],
      },
      orderBy: { createdAt: "desc" },
    });

    const now = new Date();

    // Apply additional filters
    const filtered = timers
      .filter((timer) => {
        // Check if timer has started
        if (!hasStarted(timer.startsAt, now)) {
          return false;
        }

        // Check expiry behavior
        const expired = isExpired(timer, now);
        if (expired) {
          const behavior = (timer.onExpiry || "unpublish").toLowerCase();
          if (behavior === "unpublish" || behavior === "hide") {
            return false; // Don't include expired timers
          }
          // behavior === "keep" -> continue to include
        }

        // Geolocation targeting
        if (!matchesGeo(timer.geolocation, toStringArray(timer.countries), country)) {
          return false;
        }

        // Page selection (for bars and landing pages)
        if (!matchesPageSelection(
          timer.pageSelection,
          pageType,
          pageUrl,
          timer.placementConfig
        )) {
          return false;
        }

        // Product selection
        if (!matchesProductSelection(
          timer.productSelection,
          toStringArray(timer.selectedProducts),
          toStringArray(timer.selectedCollections),
          toStringArray(timer.excludedProducts),
          toStringArray(timer.productTags),
          productId,
          collectionIds,
          productTags
        )) {
          return false;
        }

        return true;
      })
      .map((timer) => formatTimerForStorefront(timer, now));

    return json(
      { timers: filtered },
      {
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "public, max-age=60", // Cache for 1 minute
        },
      }
    );
  } catch (error) {
    console.error("[proxy.timers] Error fetching timers:", error);
    return json(
      { error: "Failed to fetch timers" },
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        }
      }
    );
  }
}

/* ---------------------- Helper Functions ---------------------- */

function parseList(value: string | null): string[] {
  if (!value) return [];
  return value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function toStringArray(value: unknown): string[] {
  if (!value) return [];
  if (Array.isArray(value)) return value.map((v) => String(v));
  return [];
}

function hasStarted(startsAt: Date | null, now: Date): boolean {
  if (!startsAt) return true;
  return new Date(startsAt) <= now;
}

/**
 * Check if a countdown timer has expired.
 * Fixed timers don't expire server-side (they're session-based on client).
 */
function isExpired(timer: any, now: Date): boolean {
  const timerType = (timer.timerType || "").toLowerCase();
  if (timerType !== "countdown") return false;
  if (!timer.endDate) return false;
  return new Date(timer.endDate) < now;
}

/**
 * Geolocation targeting check.
 * - "all-world": show to everyone
 * - "specific-countries": only show if visitor country matches
 */
function matchesGeo(
  geolocation: string | null,
  countries: string[],
  visitorCountry: string
): boolean {
  const geo = (geolocation || "all-world").toLowerCase();

  if (geo === "all-world") return true;

  if (geo === "specific-countries") {
    if (!visitorCountry) return false;
    return countries
      .map((c) => c.toUpperCase())
      .includes(visitorCountry.toUpperCase());
  }

  // Unknown mode, allow by default
  return true;
}

/**
 * Page selection check (for top-bottom-bar and landing-page timers).
 *
 * Modes:
 * - every-page
 * - home-page
 * - all-product-pages
 * - specific-product-pages
 * - all-collection-pages
 * - specific-collection-pages
 * - specific-pages
 * - cart-page
 * - custom
 */
function matchesPageSelection(
  pageSelection: string | null,
  pageType: string,
  pageUrl: string,
  placementConfig: any
): boolean {
  const mode = (pageSelection || "").toLowerCase();

  // No page selection set = allow by default
  if (!mode) return true;

  const url = (pageUrl || "").toLowerCase();

  switch (mode) {
    case "every-page":
      return true;

    case "home-page":
      return pageType === "home";

    case "all-product-pages":
      return pageType === "product";

    case "specific-product-pages":
      return matchSpecificPages(url, placementConfig);

    case "all-collection-pages":
      return pageType === "collection";

    case "specific-collection-pages":
      return matchSpecificPages(url, placementConfig);

    case "specific-pages":
      return matchSpecificPages(url, placementConfig);

    case "cart-page":
      return pageType === "cart";

    case "custom":
      // Custom logic handled client-side
      return true;

    default:
      // Unknown mode, allow
      return true;
  }
}

function matchSpecificPages(pageUrlLower: string, placementConfig: any): boolean {
  const pages: string[] = Array.isArray(placementConfig?.specificPages)
    ? placementConfig.specificPages
        .map((p: any) => String(p).toLowerCase())
        .filter(Boolean)
    : [];

  if (pages.length === 0) {
    // No specific pages configured, deny by default
    return false;
  }

  // Match exact URL or URL prefix
  return pages.some((p) => pageUrlLower === p || pageUrlLower.startsWith(p));
}

/**
 * Product selection check (for product-page timers and optional bar targeting).
 *
 * Modes:
 * - all: show on all products
 * - specific: only specific product IDs
 * - collections: products in specific collections
 * - tags: products with specific tags
 * - custom: client-side logic
 */
function matchesProductSelection(
  productSelection: string | null,
  selectedProducts: string[],
  selectedCollections: string[],
  excludedProducts: string[],
  timerProductTags: string[],
  productId: string,
  collectionIds: string[],
  productTags: string[]
): boolean {
  // Check exclusions first
  if (productId && excludedProducts.map((id) => id.toString()).includes(productId.toString())) {
    return false;
  }

  const mode = (productSelection || "all").toLowerCase();

  switch (mode) {
    case "all":
      return true;

    case "specific":
      if (!productId) return false;
      return selectedProducts
        .map((id) => id.toString())
        .includes(productId.toString());

    case "collections":
      if (collectionIds.length === 0 || selectedCollections.length === 0) {
        return false;
      }
      return selectedCollections.some((cid) =>
        collectionIds.map((c) => c.toString()).includes(cid.toString())
      );

    case "tags": {
      if (timerProductTags.length === 0 || productTags.length === 0) {
        return false;
      }
      const timerTagsLower = timerProductTags.map((t) => t.toLowerCase());
      return productTags.some((t) => timerTagsLower.includes(t.toLowerCase()));
    }

    case "custom":
      // Custom logic not enforced server-side
      return true;

    default:
      // Unknown mode, allow
      return true;
  }
}

/**
 * Format timer for storefront consumption.
 * Only include fields needed for rendering.
 */
function formatTimerForStorefront(timer: any, now: Date) {
  const ended = isExpired(timer, now);

  return {
    id: timer.id,
    type: timer.type,
    name: timer.name,

    // Content
    title: timer.title,
    subheading: timer.subheading,

    // Timer settings
    timerType: timer.timerType,
    endDate: timer.endDate,
    isRecurring: timer.isRecurring,
    recurringConfig: timer.recurringConfig,
    fixedMinutes: timer.fixedMinutes,

    // Labels
    daysLabel: timer.daysLabel || "Days",
    hoursLabel: timer.hoursLabel || "Hrs",
    minutesLabel: timer.minutesLabel || "Mins",
    secondsLabel: timer.secondsLabel || "Secs",

    // Scheduling
    startsAt: timer.startsAt,
    onExpiry: timer.onExpiry,
    ended,

    // CTA
    ctaType: timer.ctaType,
    buttonText: timer.buttonText,
    buttonLink: timer.buttonLink,

    // Design config (client will apply styles)
    designConfig: timer.designConfig,

    // Minimal placement info (for client-side verification if needed)
    pageSelection: timer.pageSelection,
    productSelection: timer.productSelection,
  };
}
