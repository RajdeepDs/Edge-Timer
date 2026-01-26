import { json, redirect } from "@remix-run/node";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { useSearchParams, useLoaderData } from "@remix-run/react";
import { authenticate } from "../shopify.server";
import { TimerForm } from "../components/timer/TimerForm";
import db from "../db.server";
import type { Timer, TimerFormData } from "../types/timer";

type LoaderData = {
  timer: Timer | null;
  shop: string;
  error?: string;
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);

  const url = new URL(request.url);
  const timerId = url.searchParams.get("id");

  if (timerId) {
    // Load existing timer
    const timer = await db.timer.findFirst({
      where: {
        id: timerId,
        shop: session.shop,
      },
    });

    if (!timer) {
      return json<LoaderData>(
        { timer: null, shop: session.shop, error: "Timer not found" },
        { status: 404 },
      );
    }

    return json<LoaderData>({ timer: timer as any, shop: session.shop });
  }

  return json<LoaderData>({ timer: null, shop: session.shop });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const formData = await request.formData();
  const intent = formData.get("intent")?.toString();
  const timerId = formData.get("timerId")?.toString();

  try {
    if (intent === "delete" && timerId) {
      await db.timer.delete({
        where: { id: timerId },
      });
      return redirect("/");
    }

    // Parse timer data from form
    const timerDataString = formData.get("timerData")?.toString();
    if (!timerDataString) {
      return json({ error: "No timer data provided" }, { status: 400 });
    }

    const timerData = JSON.parse(timerDataString) as TimerFormData;

    // Validate required fields
    if (!timerData.name || !timerData.title || !timerData.type) {
      return json(
        { error: "Missing required fields: name, title, and type" },
        { status: 400 },
      );
    }

    if (timerId) {
      // Update existing timer
      const timer = await db.timer.update({
        where: { id: timerId },
        data: {
          name: timerData.name,
          title: timerData.title,
          subheading: timerData.subheading || null,
          type: timerData.type,

          // Timer settings
          endDate: timerData.endDate ? new Date(timerData.endDate) : null,
          timerType: timerData.timerType || "countdown",
          fixedMinutes: timerData.fixedMinutes || null,
          isRecurring: timerData.isRecurring || false,
          recurringConfig: (timerData.recurringConfig as any) || null,

          // Labels
          daysLabel: timerData.daysLabel || "Days",
          hoursLabel: timerData.hoursLabel || "Hrs",
          minutesLabel: timerData.minutesLabel || "Mins",
          secondsLabel: timerData.secondsLabel || "Secs",

          // Scheduling
          startsAt: timerData.startsAt ? new Date(timerData.startsAt) : null,
          onExpiry: timerData.onExpiry || "unpublish",

          // CTA
          ctaType: timerData.ctaType || null,
          buttonText: timerData.buttonText || null,
          buttonLink: timerData.buttonLink || null,

          // Design & Placement
          designConfig: (timerData.designConfig as any) || {},
          placementConfig: (timerData.placementConfig as any) || {},

          productSelection: timerData.productSelection || "all",
          selectedProducts: (timerData.selectedProducts as any) || null,
          selectedCollections: (timerData.selectedCollections as any) || null,
          excludedProducts: (timerData.excludedProducts as any) || null,
          productTags: (timerData.productTags as any) || null,

          pageSelection: timerData.pageSelection || null,
          excludedPages: (timerData.excludedPages as any) || null,

          // Geolocation
          geolocation: timerData.geolocation || "all-world",
          countries: (timerData.countries as any) || null,

          isPublished: timerData.isPublished || false,
        },
      });

      return json({ timer: timer as any, success: true });
    } else {
      // Create new timer
      const timer = await db.timer.create({
        data: {
          shop: session.shop,
          name: timerData.name,
          title: timerData.title,
          subheading: timerData.subheading || null,
          type: timerData.type,

          // Timer settings
          endDate: timerData.endDate ? new Date(timerData.endDate) : null,
          timerType: timerData.timerType || "countdown",
          fixedMinutes: timerData.fixedMinutes || null,
          isRecurring: timerData.isRecurring || false,
          recurringConfig: (timerData.recurringConfig as any) || null,

          // Labels
          daysLabel: timerData.daysLabel || "Days",
          hoursLabel: timerData.hoursLabel || "Hrs",
          minutesLabel: timerData.minutesLabel || "Mins",
          secondsLabel: timerData.secondsLabel || "Secs",

          // Scheduling
          startsAt: timerData.startsAt ? new Date(timerData.startsAt) : null,
          onExpiry: timerData.onExpiry || "unpublish",

          // CTA
          ctaType: timerData.ctaType || null,
          buttonText: timerData.buttonText || null,
          buttonLink: timerData.buttonLink || null,

          // Design & Placement
          designConfig: (timerData.designConfig as any) || {},
          placementConfig: (timerData.placementConfig as any) || {},

          productSelection: timerData.productSelection || "all",
          selectedProducts: (timerData.selectedProducts as any) || null,
          selectedCollections: (timerData.selectedCollections as any) || null,
          excludedProducts: (timerData.excludedProducts as any) || null,
          productTags: (timerData.productTags as any) || null,

          pageSelection: timerData.pageSelection || null,
          excludedPages: (timerData.excludedPages as any) || null,

          geolocation: timerData.geolocation || "all-world",
          countries: (timerData.countries as any) || null,

          isPublished: timerData.isPublished || false,
          isActive: true,
        },
      });

      return json({ timer: timer as any, success: true });
    }
  } catch (error) {
    console.error("Error saving timer:", error);
    return json({ error: "Failed to save timer" }, { status: 500 });
  }
};

export default function TimerConfigPage() {
  const [searchParams] = useSearchParams();
  const loaderData = useLoaderData<typeof loader>();

  const timerTypeParam = searchParams.get("type");
  const timerId = searchParams.get("id");
  const existingTimer = loaderData.timer as Timer | null;
  const shop = loaderData.shop;

  const timerType =
    (timerTypeParam as "product-page" | "top-bottom-bar") ||
    (existingTimer?.type as "product-page" | "top-bottom-bar") ||
    "product-page";

  return (
    <TimerForm
      existingTimer={existingTimer}
      timerType={timerType}
      timerId={timerId || undefined}
      shop={shop}
    />
  );
}
