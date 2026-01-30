import {
  json,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
} from "@remix-run/node";
import { authenticate } from "../shopify.server";
import db from "../db.server";
import type { TimerFormData, TimerErrorResponse } from "../types/timer";
import { canCreateTimer } from "../utils/shop.server";

// GET /api/timers - List all timers for the shop
export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const { session } = await authenticate.admin(request);

    const timers = await db.timer.findMany({
      where: {
        shop: session.shop,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return json({ timers });
  } catch (error) {
    console.error("Error fetching timers:", error);
    return json<TimerErrorResponse>(
      { error: "Failed to fetch timers" },
      { status: 500 },
    );
  }
}

// POST /api/timers - Create a new timer
export async function action({ request }: ActionFunctionArgs) {
  try {
    const { session } = await authenticate.admin(request);

    if (request.method !== "POST") {
      return json<TimerErrorResponse>(
        { error: "Method not allowed" },
        { status: 405 },
      );
    }

    // Check if shop can create a new timer
    const canCreate = await canCreateTimer(session.shop);
    if (!canCreate.allowed) {
      return json<TimerErrorResponse>(
        { error: canCreate.reason || "Cannot create timer" },
        { status: 403 },
      );
    }

    const data = (await request.json()) as TimerFormData;

    // Validate required fields
    if (!data.name || !data.title || !data.type) {
      return json<TimerErrorResponse>(
        {
          error: "Missing required fields: name, title, and type are required",
        },
        { status: 400 },
      );
    }

    // Validate timer type
    const validTypes = [
      "product-page",
      "top-bottom-bar",
      "landing-page",
      "cart-page",
    ];
    if (!validTypes.includes(data.type)) {
      return json<TimerErrorResponse>(
        { error: "Invalid timer type" },
        { status: 400 },
      );
    }

    const timer = await db.timer.create({
      data: {
        shop: session.shop,
        name: data.name,
        type: data.type,
        title: data.title,
        subheading: data.subheading || null,

        // Timer settings
        endDate: data.endDate ? new Date(data.endDate) : null,
        timerType: data.timerType || "countdown",
        fixedMinutes: data.fixedMinutes || null,
        isRecurring: data.isRecurring || false,
        recurringConfig: data.recurringConfig as any,

        // Labels
        daysLabel: data.daysLabel || "Days",
        hoursLabel: data.hoursLabel || "Hrs",
        minutesLabel: data.minutesLabel || "Mins",
        secondsLabel: data.secondsLabel || "Secs",

        // Scheduling
        startsAt: data.startsAt ? new Date(data.startsAt) : null,
        onExpiry: data.onExpiry || "unpublish",

        // CTA (for top-bottom-bar)
        ctaType: data.ctaType || null,
        buttonText: data.buttonText || null,
        buttonLink: data.buttonLink || null,

        // Design
        designConfig: data.designConfig as any,

        // Placement
        placementConfig: data.placementConfig as any,
        productSelection: data.productSelection || "all",
        selectedProducts: data.selectedProducts as any,
        selectedCollections: data.selectedCollections as any,
        excludedProducts: data.excludedProducts as any,
        productTags: data.productTags as any,
        pageSelection: data.pageSelection || null,
        excludedPages: data.excludedPages as any,

        // Geolocation
        geolocation: data.geolocation || "all-world",
        countries: data.countries as any,

        // Status
        isPublished: data.isPublished || false,
        isActive: true,
      },
    });

    return json({ timer }, { status: 201 });
  } catch (error) {
    console.error("Error creating timer:", error);
    return json<TimerErrorResponse>(
      { error: "Failed to create timer" },
      { status: 500 },
    );
  }
}
