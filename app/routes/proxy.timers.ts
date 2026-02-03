import { json, type LoaderFunctionArgs } from "@remix-run/node";
import prisma from "../db.server";
import { validateProxyRequest } from "../utils/proxy.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const validation = validateProxyRequest(request);

  const isDev = process.env.NODE_ENV !== "production";
  const url = new URL(request.url);
  const params = url.searchParams;
  const shopParam = params.get("shop");

  if (!validation.isValid && (!isDev || !shopParam)) {
    return json(
      { error: validation.error || "Unauthorized" },
      {
        status: 401,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-store",
        },
      },
    );
  }

  const shop = validation.shop || shopParam!;
  const now = new Date();

  // Context params
  const type = params.get("type") || "";
  const pageType = (params.get("pageType") || "").toLowerCase();
  const productId = params.get("productId") || "";
  const collectionIds = parseList(params.get("collectionIds"));
  const productTags = parseList(params.get("productTags")).map((t) =>
    t.toLowerCase(),
  );
  const pageUrl = params.get("pageUrl") || "";
  const country = (params.get("country") || "").toUpperCase();

  try {
    const timers = await prisma.timer.findMany({
      where: {
        shop,
        isPublished: true,
        isActive: true,
        ...(type ? { type } : {}),
        OR: [{ startsAt: null }, { startsAt: { lte: now } }],
      },
      orderBy: { createdAt: "desc" },
    });

    const filtered = timers
      .filter((timer) => {
        if (!hasStarted(timer.startsAt, now)) return false;

        if (isExpired(timer, now)) {
          const behavior = (timer.onExpiry || "unpublish").toLowerCase();
          if (behavior !== "keep") return false;
        }

        if (
          !matchesGeo(
            timer.geolocation,
            toStringArray(timer.countries),
            country,
          )
        ) {
          return false;
        }

        if (
          !matchesPageSelection(
            timer.pageSelection,
            pageType,
            pageUrl,
            timer.placementConfig,
          )
        ) {
          return false;
        }

        if (
          !matchesProductSelection(
            timer.productSelection,
            toStringArray(timer.selectedProducts),
            toStringArray(timer.selectedCollections),
            toStringArray(timer.excludedProducts),
            toStringArray(timer.productTags),
            productId,
            collectionIds,
            productTags,
          )
        ) {
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
          "Cache-Control": "public, max-age=60",
        },
      },
    );
  } catch (error) {
    console.error("[proxy.timers] Error:", error);
    return json({ error: "Failed to fetch timers" }, { status: 500 });
  }
}

/* -------------------- Helpers -------------------- */

function parseList(value: string | null): string[] {
  if (!value) return [];
  return value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function toStringArray(value: unknown): string[] {
  if (!value) return [];
  return Array.isArray(value) ? value.map(String) : [];
}

function hasStarted(startsAt: Date | null, now: Date): boolean {
  return !startsAt || new Date(startsAt) <= now;
}

function isExpired(timer: any, now: Date): boolean {
  if ((timer.timerType || "").toLowerCase() !== "countdown") return false;
  if (!timer.endDate) return false;
  return new Date(timer.endDate) < now;
}

function matchesGeo(
  geolocation: string | null,
  countries: string[],
  visitorCountry: string,
): boolean {
  const geo = (geolocation || "all-world").toLowerCase();

  if (geo === "all-world") return true;
  if (geo === "specific-countries") {
    return (
      !!visitorCountry &&
      countries.map((c) => c.toUpperCase()).includes(visitorCountry)
    );
  }
  return true;
}

function matchesPageSelection(
  pageSelection: string | null,
  pageType: string,
  pageUrl: string,
  placementConfig: any,
): boolean {
  const mode = (pageSelection || "").toLowerCase();
  const url = pageUrl.toLowerCase();

  switch (mode) {
    case "every-page":
      return true;
    case "home-page":
      return pageType === "home";
    case "all-product-pages":
      return pageType === "product";
    case "all-collection-pages":
      return pageType === "collection";
    case "cart-page":
      return pageType === "cart";
    case "specific-pages":
    case "specific-product-pages":
    case "specific-collection-pages":
      return matchSpecificPages(url, placementConfig);
    case "custom":
      return true;
    default:
      return true;
  }
}

function matchSpecificPages(
  pageUrlLower: string,
  placementConfig: any,
): boolean {
  const pages: string[] = Array.isArray(placementConfig?.specificPages)
    ? placementConfig.specificPages.map((p: any) => String(p).toLowerCase())
    : [];

  return (
    pages.length > 0 &&
    pages.some((p) => pageUrlLower === p || pageUrlLower.startsWith(p))
  );
}

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
  if (excludedProducts.includes(productId)) return false;

  switch ((productSelection || "all").toLowerCase()) {
    case "all":
      return true;
    case "specific":
      return selectedProducts.includes(productId);
    case "collections":
      return selectedCollections.some((c) => collectionIds.includes(c));
    case "tags":
      return timerProductTags.some((t) =>
        productTags.map((pt) => pt.toLowerCase()).includes(t.toLowerCase()),
      );
    case "custom":
      return true;
    default:
      return true;
  }
}

function formatTimerForStorefront(timer: any, now: Date) {
  return {
    id: timer.id,
    type: timer.type,
    name: timer.name,

    title: timer.title,
    subheading: timer.subheading,

    timerType: timer.timerType,
    endDate: timer.endDate,
    isRecurring: timer.isRecurring,
    recurringConfig: timer.recurringConfig,
    fixedMinutes: timer.fixedMinutes,

    daysLabel: timer.daysLabel || "Days",
    hoursLabel: timer.hoursLabel || "Hrs",
    minutesLabel: timer.minutesLabel || "Mins",
    secondsLabel: timer.secondsLabel || "Secs",

    startsAt: timer.startsAt,
    onExpiry: timer.onExpiry,
    ended: isExpired(timer, now),

    ctaType: timer.ctaType,
    buttonText: timer.buttonText,
    buttonLink: timer.buttonLink,

    designConfig: timer.designConfig,
    pageSelection: timer.pageSelection,
    productSelection: timer.productSelection,
  };
}
