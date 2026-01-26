import { json, type ActionFunctionArgs, type LoaderFunctionArgs } from "@remix-run/node";
import prisma from "../db.server";
import { incrementShopViews } from "../utils/shop.server";

/**
 * Public endpoint to record timer views from the storefront.
 *
 * Path: /public/views
 *
 * Accepts:
 * - Method: POST (JSON)
 * - Body:
 *   {
 *     shop: string;           // required (shop domain)
 *     timerId: string;        // required (Timer.id)
 *     pageUrl?: string;
 *     pageType?: string;      // "product" | "collection" | "home" | "cart" | "page"
 *     productId?: string;
 *     country?: string;       // ISO country code, optional (falls back to headers when present)
 *     visitorId?: string;     // Optional client-generated visitor/session id
 *   }
 *
 * Returns:
 *   { success: true, id: string } on success
 *
 * CORS:
 *   - Allows cross-origin calls from storefronts
 */

// Handle GET (not allowed for this endpoint)
export async function loader({ request }: LoaderFunctionArgs) {
  return json({ error: "Method Not Allowed" }, { status: 405, headers: corsHeaders() });
}

// Handle POST / OPTIONS
export async function action({ request }: ActionFunctionArgs) {
  const headers = corsHeaders();

  // CORS preflight
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers });
  }

  if (request.method !== "POST") {
    return json({ error: "Method Not Allowed" }, { status: 405, headers });
  }

  let payload: any;
  try {
    payload = await request.json();
  } catch {
    return json({ error: "Invalid JSON body" }, { status: 400, headers });
  }

  const shop = String(payload?.shop || "").trim();
  const timerId = String(payload?.timerId || "").trim();

  if (!shop) {
    return json({ error: "Missing required field: shop" }, { status: 400, headers });
  }
  if (!timerId) {
    return json({ error: "Missing required field: timerId" }, { status: 400, headers });
  }

  // Optional context data
  const pageUrl = safeString(payload?.pageUrl, 2048);
  const pageType = safeString(payload?.pageType, 64)?.toLowerCase();
  const productId = safeString(payload?.productId, 128);
  const visitorId = safeString(payload?.visitorId, 128);
  const userAgent = safeString(request.headers.get("user-agent"), 1024);
  const ipAddress = extractIP(request);
  const headerCountry = safeString(
    request.headers.get("cf-ipcountry") ||
      request.headers.get("x-country-code") ||
      request.headers.get("x-vercel-ip-country") ||
      request.headers.get("fly-client-ip-country") ||
      request.headers.get("x-geo-country"),
    8,
  );
  const country = safeString(payload?.country, 8) || headerCountry || null;

  try {
    // Ensure timer exists and belongs to shop
    const timer = await prisma.timer.findFirst({
      where: { id: timerId, shop },
      select: { id: true },
    });

    if (!timer) {
      return json({ error: "Timer not found for this shop" }, { status: 404, headers });
    }

    // Record the view
    const view = await prisma.timerView.create({
      data: {
        timerId,
        shop,
        visitorId: visitorId || null,
        ipAddress: ipAddress || null,
        userAgent: userAgent || null,
        country: country || null,
        pageUrl: pageUrl || null,
        pageType: pageType || null,
        productId: productId || null,
      },
      select: { id: true },
    });

    // Increment aggregates
    await prisma.timer.update({
      where: { id: timerId },
      data: { viewCount: { increment: 1 } },
    });

    // Increment shop monthly views (best-effort)
    await incrementShopViews(shop).catch(() => {});

    return json({ success: true, id: view.id }, { headers });
  } catch (err) {
    // Avoid leaking server internals
    return json({ error: "Failed to record view" }, { status: 500, headers });
  }
}

/* ---------------------- Utilities ---------------------- */

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json; charset=utf-8",
  };
}

function safeString(value: unknown, maxLen: number): string | null {
  if (typeof value !== "string") return null;
  const v = value.trim();
  if (!v) return null;
  return v.length > maxLen ? v.slice(0, maxLen) : v;
}

function extractIP(request: Request): string | null {
  // Common reverse-proxy headers (first IP in list if present)
  const xff = request.headers.get("x-forwarded-for");
  if (xff) {
    const first = xff.split(",").map((s) => s.trim())[0];
    if (first) return first;
  }
  // Cloudflare, Vercel, Fly etc. may expose real client IP differently
  const alt =
    request.headers.get("cf-connecting-ip") ||
    request.headers.get("x-real-ip") ||
    request.headers.get("x-vercel-forwarded-for") ||
    request.headers.get("fly-client-ip");
  if (alt) return alt;

  // As a last resort, return null (node doesn't expose remoteAddress here)
  return null;
}
