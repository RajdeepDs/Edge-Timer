import { json, type ActionFunctionArgs, type LoaderFunctionArgs } from "@remix-run/node";
import prisma from "../db.server";

/**
 * Public endpoint to serve timers for storefront rendering.
 * Applies scheduling and placement filters so only relevant timers are returned.
 *
 * Query params:
 * - shop: string (required) - shop domain, must match Timer.shop
 * - type: string (optional) - timer type: "product-page" | "top-bottom-bar" | "landing-page" | "cart-page"
 * - pageType: string (optional) - storefront context: "product" | "collection" | "home" | "cart" | "page"
 * - url or pageUrl: string (optional) - current page URL
 * - productId: string (optional) - Shopify product ID
 * - collectionIds: string (optional) - comma-separated Shopify collection IDs
 * - productTags: string (optional) - comma-separated product tags for targeting
 * - country: string (optional) - ISO country code for geolocation targeting
 */
export async function loader({ request }: LoaderFunctionArgs) {
  const corsHeaders = makeCORSHeaders();

  const url = new URL(request.url);
  const sp = url.searchParams;

  const shop = (sp.get("shop") || "").trim();
  if (!shop) {
    return json({ error: "Missing required query parameter: shop" }, { status: 400, headers: corsHeaders });
  }

  const type = (sp.get("type") || "").trim(); // optional
  const pageType = (sp.get("pageType") || "").trim().toLowerCase(); // optional
  const pageUrl = (sp.get("url") || sp.get("pageUrl") || "").trim();
  const productId = (sp.get("productId") || "").trim();
  const collectionIds = parseList(sp.get("collectionIds"));
  const productTags = parseList(sp.get("productTags")).map((t) => t.toLowerCase());
  const country = (sp.get("country") || "").trim().toUpperCase();

  // Fetch published, active timers for this shop.
  // Narrow by type if provided, remaining placement/schedule filters applied in memory.
  const timers = await prisma.timer.findMany({
    where: {
      shop,
      isPublished: true,
      isActive: true,
      ...(type ? { type } : {}),
      // Scheduling start: include timers that have started (startsAt <= now) or have no start date
      OR: [{ startsAt: null }, { startsAt: { lte: new Date() } }],
    },
    orderBy: { createdAt: "desc" },
  });

  const now = new Date();

  const filtered = timers
    .filter((t) => {
      // Respect schedule: has started?
      if (!hasStarted(t.startsAt, now)) {
        return false;
      }

      // Respect expiry: if expired, apply onExpiry behavior
      const expired = isExpired(t, now);
      if (expired) {
        if (t.onExpiry === "unpublish" || t.onExpiry === "hide") {
          return false; // do not include
        }
        // onExpiry === "keep" -> keep included
      }

      // Respect geolocation targeting
      if (!matchesGeo(t.geolocation, toStringArray(t.countries), country)) {
        return false;
      }

      // Respect page selection (for bars and landing placements)
      if (!matchesPageSelection(t.pageSelection, pageType, pageUrl, t.placementConfig)) {
        return false;
      }

      // Respect product/collection targeting (for product-page and also optional for bars)
      if (!matchesProductSelection(t.productSelection, toStringArray(t.selectedProducts), toStringArray(t.selectedCollections), toStringArray(t.excludedProducts), toStringArray(t.productTags), productId, collectionIds, productTags)) {
        return false;
      }

      return true;
    })
    .map((t) => mapTimerForStorefront(t, now));

  return json({ timers: filtered }, { headers: corsHeaders });
}

export async function action({ request }: ActionFunctionArgs) {
  const corsHeaders = makeCORSHeaders();

  // Handle CORS preflight for public access
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  return json({ error: "Method Not Allowed" }, { status: 405, headers: corsHeaders });
}

/* ---------------------- Helpers ---------------------- */

function makeCORSHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json; charset=utf-8",
  };
}

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
 * A timer is "expired" only for countdown timers with endDate in the past.
 * Fixed timers don't have a fixed server-side expiry (session/client-based).
 */
function isExpired(timer: any, now: Date): boolean {
  const tType = (timer.timerType || "").toLowerCase();
  if (tType !== "countdown") return false;
  if (!timer.endDate) return false;
  return new Date(timer.endDate) < now;
}

/**
 * Geolocation targeting rules.
 * geolocation: "all-world" | "specific-countries"
 * countries: array of ISO country codes
 */
function matchesGeo(geolocation: string | null, countries: string[], visitorCountry: string): boolean {
  const geo = (geolocation || "all-world").toLowerCase();

  if (geo === "all-world") return true;
  if (geo === "specific-countries") {
    if (!visitorCountry) return false;
    return countries.map((c) => c.toUpperCase()).includes(visitorCountry.toUpperCase());
  }

  // If unknown mode, allow by default
  return true;
}

/**
 * Page selection rules (primarily for "top-bottom-bar" and "landing-page" timers).
 * pageSelection: "every-page" | "home-page" | "all-product-pages" | "specific-product-pages" | "all-collection-pages" | "specific-collection-pages" | "specific-pages" | "cart-page" | "custom"
 * placementConfig may contain specificPages: string[]
 */
function matchesPageSelection(pageSelection: string | null, pageType: string, pageUrl: string, placementConfig: any): boolean {
  const mode = (pageSelection || "").toLowerCase();

  // If no page selection set, allow by default (other placement filters apply)
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
      // Use placementConfig.specificPages to list product URLs if provided
      return matchSpecificPages(url, placementConfig);
    case "all-collection-pages":
      return pageType === "collection";
    case "specific-collection-pages":
      // Also handled via specificPages URLs if provided
      return matchSpecificPages(url, placementConfig);
    case "specific-pages":
      return matchSpecificPages(url, placementConfig);
    case "cart-page":
      return pageType === "cart";
    case "custom":
      // Custom logic is client-side; default allow
      return true;
    default:
      // Unknown mode -> allow
      return true;
  }
}

function matchSpecificPages(pageUrlLower: string, placementConfig: any): boolean {
  const pages: string[] = Array.isArray(placementConfig?.specificPages)
    ? placementConfig.specificPages.map((p: any) => String(p).toLowerCase()).filter(Boolean)
    : [];

  if (pages.length === 0) {
    // If not configured, conservatively deny specific-pages match
    return false;
  }

  // Exact match or startsWith to allow paths w/ querystrings
  return pages.some((p) => pageUrlLower === p || pageUrlLower.startsWith(p));
}

/**
 * Product selection rules (used by "product-page" timers and optionally by bars if configured)
 * productSelection: "all" | "specific" | "collections" | "tags" | "custom"
 * selectedProducts, selectedCollections, excludedProducts, productTags: arrays stored on the timer
 */
function matchesProductSelection(
  productSelection: string | null,
  selectedProducts: string[],
  selectedCollections: string[],
  excludedProducts: string[],
  timerProductTags: string[],
  productId: string,
  collectionIds: string[],
  productTags: string[],
): boolean {
  // Exclusions first: if current product is excluded, deny
  if (productId && excludedProducts.map((id) => id.toString()).includes(productId.toString())) {
    return false;
  }

  const mode = (productSelection || "all").toLowerCase();

  switch (mode) {
    case "all":
      return true;
    case "specific":
      if (!productId) return false;
      return selectedProducts.map((id) => id.toString()).includes(productId.toString());
    case "collections":
      if (collectionIds.length === 0 || selectedCollections.length === 0) return false;
      return selectedCollections.some((cid) => collectionIds.map((c) => c.toString()).includes(cid.toString()));
    case "tags": {
      if (timerProductTags.length === 0 || productTags.length === 0) return false;
      const timerTagsLower = timerProductTags.map((t) => t.toLowerCase());
      return productTags.some((t) => timerTagsLower.includes(t.toLowerCase()));
    }
    case "custom":
      // Custom logic not enforced on server; allow and let client script refine.
      return true;
    default:
      // Unknown mode -> allow by default
      return true;
  }
}

function mapTimerForStorefront(timer: any, now: Date) {
  const ended = isExpired(timer, now);

  return {
    id: timer.id,
    type: timer.type,
    name: timer.name,
    title: timer.title,
    subheading: timer.subheading,

    // Timer settings
    timerType: timer.timerType,
    endDate: timer.endDate,
    isRecurring: timer.isRecurring,
    recurringConfig: timer.recurringConfig,
    fixedMinutes: timer.fixedMinutes,

    // Labels
    daysLabel: timer.daysLabel,
    hoursLabel: timer.hoursLabel,
    minutesLabel: timer.minutesLabel,
    secondsLabel: timer.secondsLabel,

    // Scheduling
    startsAt: timer.startsAt,
    onExpiry: timer.onExpiry,
    ended,

    // CTA
    ctaType: timer.ctaType,
    buttonText: timer.buttonText,
    buttonLink: timer.buttonLink,

    // Design for rendering
    designConfig: timer.designConfig,

    // Expose minimal placement for client verification if needed
    // (Server already filtered; this is just for debugging/advanced logic on client)
    pageSelection: timer.pageSelection,
    productSelection: timer.productSelection,
  };
}
