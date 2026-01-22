import { json, redirect } from "@remix-run/node";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import {
  useSearchParams,
  useLoaderData,
  useNavigation,
  useSubmit,
  Form,
} from "@remix-run/react";
import { useCallback, useState, useEffect } from "react";
import {
  Page,
  Badge,
  Box,
  Tabs,
  Card,
  InlineGrid,
  Frame,
} from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import ContentTab from "../components/timer/ContentTab";
import DesignTab from "../components/timer/DesignTab";
import PlacementTab from "../components/timer/PlacementTab";
import TimerPreview from "../components/timer/TimerPreview";
import db from "../db.server";
import type {
  Timer,
  TimerFormData,
  TimerTypeValue,
  TimerStarts,
  OnExpiryAction,
  CallToActionType,
  DesignConfig,
  PlacementConfig,
} from "../types/timer";

type LoaderData = {
  timer: Timer | null;
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
        { timer: null, error: "Timer not found" },
        { status: 404 },
      );
    }

    return json<LoaderData>({ timer: timer as any });
  }

  return json<LoaderData>({ timer: null });
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

          isPublished: intent === "publish" ? true : false,
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

          isPublished: intent === "publish" ? true : false,
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

// Helper function to combine date and time into a single Date object
function combineDateTime(
  date: Date,
  hour: string,
  minute: string,
  period: "AM" | "PM",
): Date {
  const newDate = new Date(date);
  let hours = parseInt(hour, 10);
  const minutes = parseInt(minute, 10);

  // Convert to 24-hour format
  if (period === "PM" && hours !== 12) {
    hours += 12;
  } else if (period === "AM" && hours === 12) {
    hours = 0;
  }

  newDate.setHours(hours, minutes, 0, 0);
  return newDate;
}

export default function TimerConfigPage() {
  const [searchParams] = useSearchParams();
  const loaderData = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  const submit = useSubmit();

  const timerTypeParam = searchParams.get("type");
  const timerId = searchParams.get("id");
  const existingTimer = loaderData?.timer;

  const timerType = (timerTypeParam ||
    existingTimer?.type ||
    "product-page") as
    | "product-page"
    | "top-bottom-bar"
    | "landing-page"
    | "cart-page";

  const [selected, setSelected] = useState(0);

  // Content Tab State
  const [timerName, setTimerName] = useState(
    existingTimer?.name || "Timer name",
  );
  const [title, setTitle] = useState(existingTimer?.title || "Hurry up!");
  const [subheading, setSubheading] = useState(
    existingTimer?.subheading || "Sale ends in:",
  );

  const [timerTypeValue, setTimerTypeValue] = useState<TimerTypeValue>(
    (existingTimer?.timerType as TimerTypeValue) || "countdown",
  );
  const [timerStarts, setTimerStarts] = useState<TimerStarts>("now");

  const [endDate, setEndDate] = useState<Date>(
    existingTimer?.endDate ? new Date(existingTimer.endDate) : new Date(),
  );
  const [hour, setHour] = useState("12");
  const [minute, setMinute] = useState("00");
  const [period, setPeriod] = useState<"AM" | "PM">("PM");

  const [fixedMinutes, setFixedMinutes] = useState(
    existingTimer?.fixedMinutes?.toString() || "30",
  );

  const [daysLabel, setDaysLabel] = useState(
    existingTimer?.daysLabel || "Days",
  );
  const [hoursLabel, setHoursLabel] = useState(
    existingTimer?.hoursLabel || "Hrs",
  );
  const [minutesLabel, setMinutesLabel] = useState(
    existingTimer?.minutesLabel || "Mins",
  );
  const [secondsLabel, setSecondsLabel] = useState(
    existingTimer?.secondsLabel || "Secs",
  );

  const [onceItEnds, setOnceItEnds] = useState<OnExpiryAction>(
    (existingTimer?.onExpiry as OnExpiryAction) || "unpublish",
  );

  // CTA State (for top-bottom-bar)
  const [callToAction, setCallToAction] = useState<CallToActionType>(
    (existingTimer?.ctaType as CallToActionType) || "button",
  );
  const [buttonText, setButtonText] = useState(
    existingTimer?.buttonText || "Shop now!",
  );
  const [buttonLink, setButtonLink] = useState(existingTimer?.buttonLink || "");

  // Design state (initialized with defaults or existing config)
  const [designConfig, setDesignConfig] = useState<DesignConfig>(
    (existingTimer?.designConfig as DesignConfig) || {},
  );

  // Placement state (initialized with defaults or existing config)
  const [placementConfig, setPlacementConfig] = useState<PlacementConfig>(
    (existingTimer?.placementConfig as PlacementConfig) || {},
  );

  const isPublished = existingTimer?.isPublished || false;
  const isSaving = navigation.state === "submitting";

  // Update form when existing timer loads
  useEffect(() => {
    if (existingTimer) {
      setTimerName(existingTimer.name);
      setTitle(existingTimer.title);
      setSubheading(existingTimer.subheading || "Sale ends in:");
      setTimerTypeValue(
        (existingTimer.timerType as TimerTypeValue) || "countdown",
      );

      if (existingTimer.endDate) {
        const date = new Date(existingTimer.endDate);
        setEndDate(date);
        const hours = date.getHours();
        const mins = date.getMinutes();

        setHour((hours % 12 || 12).toString());
        setMinute(mins.toString().padStart(2, "0"));
        setPeriod(hours >= 12 ? "PM" : "AM");
      }

      if (existingTimer.fixedMinutes) {
        setFixedMinutes(existingTimer.fixedMinutes.toString());
      }

      setDaysLabel(existingTimer.daysLabel);
      setHoursLabel(existingTimer.hoursLabel);
      setMinutesLabel(existingTimer.minutesLabel);
      setSecondsLabel(existingTimer.secondsLabel);
      setOnceItEnds((existingTimer.onExpiry as OnExpiryAction) || "unpublish");

      if (existingTimer.ctaType) {
        setCallToAction(existingTimer.ctaType as CallToActionType);
      }
      if (existingTimer.buttonText) {
        setButtonText(existingTimer.buttonText);
      }
      if (existingTimer.buttonLink) {
        setButtonLink(existingTimer.buttonLink);
      }

      setDesignConfig((existingTimer.designConfig as DesignConfig) || {});
      setPlacementConfig(
        (existingTimer.placementConfig as PlacementConfig) || {},
      );
    }
  }, [existingTimer]);

  const handleTabChange = useCallback(
    (selectedTabIndex: number) => setSelected(selectedTabIndex),
    [],
  );

  const handleSubmit = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      // Combine date and time for countdown timers
      const finalEndDate =
        timerTypeValue === "countdown"
          ? combineDateTime(endDate, hour, minute, period)
          : null;

      const timerData: TimerFormData = {
        name: timerName,
        title: title,
        subheading: subheading,
        type: timerType,

        // Timer settings
        timerType: timerTypeValue,
        endDate: finalEndDate,
        fixedMinutes:
          timerTypeValue === "fixed" ? parseInt(fixedMinutes, 10) : null,
        isRecurring: false,
        recurringConfig: null,

        // Labels
        daysLabel: daysLabel,
        hoursLabel: hoursLabel,
        minutesLabel: minutesLabel,
        secondsLabel: secondsLabel,

        // Scheduling
        startsAt: null,
        onExpiry: onceItEnds,

        // CTA (for top-bottom-bar)
        ctaType: timerType === "top-bottom-bar" ? callToAction : null,
        buttonText: timerType === "top-bottom-bar" ? buttonText : null,
        buttonLink: timerType === "top-bottom-bar" ? buttonLink : null,

        // Design & Placement
        designConfig: designConfig,
        placementConfig: placementConfig,

        // Product/Page Selection
        productSelection: placementConfig.productSelection || "all",
        selectedProducts: placementConfig.selectedProducts || null,
        selectedCollections: placementConfig.selectedCollections || null,
        excludedProducts: placementConfig.excludedProducts || null,
        productTags: placementConfig.productTags || null,

        pageSelection: placementConfig.pageSelection || null,
        excludedPages: placementConfig.excludedPages || null,

        // Geolocation
        geolocation: placementConfig.geolocation || "all-world",
        countries: placementConfig.countries || null,

        isPublished: false,
      };

      // Create form data and submit using Remix submit
      const formData = new FormData();
      formData.append("intent", "save");
      formData.append("timerData", JSON.stringify(timerData));
      if (timerId) {
        formData.append("timerId", timerId);
      }

      submit(formData, { method: "post" });
    },
    [
      timerName,
      title,
      subheading,
      timerType,
      timerTypeValue,
      endDate,
      hour,
      minute,
      period,
      fixedMinutes,
      daysLabel,
      hoursLabel,
      minutesLabel,
      secondsLabel,
      onceItEnds,
      callToAction,
      buttonText,
      buttonLink,
      designConfig,
      placementConfig,
      timerId,
      submit,
    ],
  );

  const handlePublish = useCallback(() => {
    // Combine date and time for countdown timers
    const finalEndDate =
      timerTypeValue === "countdown"
        ? combineDateTime(endDate, hour, minute, period)
        : null;

    const timerData: TimerFormData = {
      name: timerName,
      title: title,
      subheading: subheading,
      type: timerType,

      // Timer settings
      timerType: timerTypeValue,
      endDate: finalEndDate,
      fixedMinutes:
        timerTypeValue === "fixed" ? parseInt(fixedMinutes, 10) : null,
      isRecurring: false,
      recurringConfig: null,

      // Labels
      daysLabel: daysLabel,
      hoursLabel: hoursLabel,
      minutesLabel: minutesLabel,
      secondsLabel: secondsLabel,

      // Scheduling
      startsAt: null,
      onExpiry: onceItEnds,

      // CTA (for top-bottom-bar)
      ctaType: timerType === "top-bottom-bar" ? callToAction : null,
      buttonText: timerType === "top-bottom-bar" ? buttonText : null,
      buttonLink: timerType === "top-bottom-bar" ? buttonLink : null,

      // Design & Placement
      designConfig: designConfig,
      placementConfig: placementConfig,

      // Product/Page Selection
      productSelection: placementConfig.productSelection || "all",
      selectedProducts: placementConfig.selectedProducts || null,
      selectedCollections: placementConfig.selectedCollections || null,
      excludedProducts: placementConfig.excludedProducts || null,
      productTags: placementConfig.productTags || null,

      pageSelection: placementConfig.pageSelection || null,
      excludedPages: placementConfig.excludedPages || null,

      // Geolocation
      geolocation: placementConfig.geolocation || "all-world",
      countries: placementConfig.countries || null,

      isPublished: true,
    };

    const formData = new FormData();
    formData.append("intent", "publish");
    formData.append("timerData", JSON.stringify(timerData));
    if (timerId) {
      formData.append("timerId", timerId);
    }

    // Use fetcher or Form to submit
    const form = document.createElement("form");
    form.method = "POST";
    formData.forEach((value, key) => {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = key;
      input.value = value.toString();
      form.appendChild(input);
    });
    document.body.appendChild(form);
    form.submit();
  }, [
    timerName,
    title,
    subheading,
    timerType,
    timerTypeValue,
    endDate,
    hour,
    minute,
    period,
    fixedMinutes,
    daysLabel,
    hoursLabel,
    minutesLabel,
    secondsLabel,
    onceItEnds,
    callToAction,
    buttonText,
    buttonLink,
    designConfig,
    placementConfig,
    timerId,
  ]);

  const handleDelete = useCallback(() => {
    if (!timerId) return;

    if (confirm("Are you sure you want to delete this timer?")) {
      const formData = new FormData();
      formData.append("intent", "delete");
      formData.append("timerId", timerId);

      const form = document.createElement("form");
      form.method = "POST";
      formData.forEach((value, key) => {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = key;
        input.value = value.toString();
        form.appendChild(input);
      });
      document.body.appendChild(form);
      form.submit();
    }
  }, [timerId]);

  const tabs = [
    {
      id: "content-1",
      content: "Content",
      accessibilityLabel: "Contents",
      panelID: "content-1",
    },
    {
      id: "design-1",
      content: "Design",
      accessibilityLabel: "Design",
      panelID: "design-1",
    },
    {
      id: "placement-1",
      content: "Placement",
      accessibilityLabel: "Placement",
      panelID: "placement-1",
    },
  ];

  const renderTabContent = () => {
    switch (selected) {
      case 0:
        return (
          <ContentTab
            timerType={
              timerType === "top-bottom-bar" ? "top-bottom-bar" : "product-page"
            }
            timerName={timerName}
            setTimerName={setTimerName}
            title={title}
            setTitle={setTitle}
            subheading={subheading}
            setSubheading={setSubheading}
            timerTypeValue={timerTypeValue}
            setTimerTypeValue={setTimerTypeValue}
            timerStarts={timerStarts}
            setTimerStarts={setTimerStarts}
            endDate={endDate}
            setEndDate={setEndDate}
            hour={hour}
            setHour={setHour}
            minute={minute}
            setMinute={setMinute}
            period={period}
            setPeriod={setPeriod}
            fixedMinutes={fixedMinutes}
            setFixedMinutes={setFixedMinutes}
            daysLabel={daysLabel}
            setDaysLabel={setDaysLabel}
            hoursLabel={hoursLabel}
            setHoursLabel={setHoursLabel}
            minutesLabel={minutesLabel}
            setMinutesLabel={setMinutesLabel}
            secondsLabel={secondsLabel}
            setSecondsLabel={setSecondsLabel}
            onceItEnds={onceItEnds}
            setOnceItEnds={setOnceItEnds}
            callToAction={
              timerType === "top-bottom-bar" ? callToAction : undefined
            }
            setCallToAction={
              timerType === "top-bottom-bar" ? setCallToAction : undefined
            }
            buttonText={timerType === "top-bottom-bar" ? buttonText : undefined}
            setButtonText={
              timerType === "top-bottom-bar" ? setButtonText : undefined
            }
            buttonLink={timerType === "top-bottom-bar" ? buttonLink : undefined}
            setButtonLink={
              timerType === "top-bottom-bar" ? setButtonLink : undefined
            }
            onContinue={() => handleTabChange(1)}
          />
        );
      case 1:
        return (
          <DesignTab
            timerType={
              timerType === "top-bottom-bar" ? "top-bottom-bar" : "product"
            }
            designConfig={designConfig}
            setDesignConfig={setDesignConfig}
            onContinue={() => handleTabChange(2)}
          />
        );
      case 2:
        return (
          <PlacementTab
            timerType={
              timerType === "top-bottom-bar" ? "top-bottom-bar" : "product"
            }
          />
        );
      default:
        return null;
    }
  };

  const secondaryActions = timerId
    ? [
        {
          content: "Delete",
          loading: isSaving,
          destructive: true,
          onAction: handleDelete,
        },
      ]
    : [];

  return (
    <Frame>
      <Page
        title={timerName || "New Timer"}
        backAction={{
          content: "Back",
          url: "/",
        }}
        titleMetadata={
          isPublished ? (
            <Badge tone="success">Published</Badge>
          ) : (
            <Badge>Draft</Badge>
          )
        }
        subtitle={timerId ? `Timer ID: ${timerId}` : "Save to show timer ID"}
        primaryAction={
          !isPublished
            ? {
                content: "Publish",
                loading: isSaving,
                onAction: handlePublish,
              }
            : undefined
        }
        secondaryActions={secondaryActions}
      >
        <Form method="post" data-save-bar onSubmit={handleSubmit}>
          <input type="hidden" name="intent" value="save" />
          {timerId && <input type="hidden" name="timerId" value={timerId} />}

          <Box paddingBlockEnd="800">
            <Tabs tabs={tabs} selected={selected} onSelect={handleTabChange}>
              <Box paddingBlockStart="400">
                <InlineGrid columns={{ xs: 1, lg: "2fr 3fr" }} gap="400">
                  <Box>
                    <Card padding="400">{renderTabContent()}</Card>
                  </Box>
                  <Box>
                    <TimerPreview
                      title={title}
                      subheading={subheading}
                      daysLabel={daysLabel}
                      hoursLabel={hoursLabel}
                      minutesLabel={minutesLabel}
                      secondsLabel={secondsLabel}
                      designConfig={designConfig}
                      timerType={
                        timerType === "top-bottom-bar"
                          ? "top-bottom-bar"
                          : "product"
                      }
                      buttonText={buttonText}
                    />
                  </Box>
                </InlineGrid>
              </Box>
            </Tabs>
          </Box>
        </Form>
      </Page>
    </Frame>
  );
}
