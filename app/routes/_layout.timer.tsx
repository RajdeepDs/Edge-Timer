import { json, redirect } from "@remix-run/node";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import {
  useSearchParams,
  useLoaderData,
  useSubmit,
  useNavigation,
} from "@remix-run/react";
import {
  Page,
  Badge,
  Box,
  Tabs,
  Card,
  InlineGrid,
  Toast,
  Frame,
} from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import { useCallback, useState, useEffect } from "react";
import ContentTab from "../components/timer/ContentTab";
import DesignTab from "../components/timer/DesignTab";
import PlacementTab from "../components/timer/PlacementTab";
import TimerPreview from "../components/timer/TimerPreview";
import db from "../db.server";

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
      return json({ error: "Timer not found" }, { status: 404 });
    }

    return json({ timer });
  }

  return json({ timer: null });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const formData = await request.formData();
  const intent = formData.get("intent");
  const timerId = formData.get("timerId")?.toString();

  if (intent === "delete" && timerId) {
    await db.timer.delete({
      where: { id: timerId },
    });
    return redirect("/");
  }

  // Parse timer data from form
  const timerData = JSON.parse(formData.get("timerData")?.toString() || "{}");

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
        recurringConfig: timerData.recurringConfig || null,

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
        designConfig: timerData.designConfig || {},
        placementConfig: timerData.placementConfig || {},

        productSelection: timerData.productSelection || "all",
        selectedProducts: timerData.selectedProducts || null,
        selectedCollections: timerData.selectedCollections || null,
        excludedProducts: timerData.excludedProducts || null,
        productTags: timerData.productTags || null,

        pageSelection: timerData.pageSelection || null,
        excludedPages: timerData.excludedPages || null,

        geolocation: timerData.geolocation || "all-world",
        countries: timerData.countries || null,

        isPublished: intent === "publish" ? true : false,
      },
    });

    return json({ timer, success: true });
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
        recurringConfig: timerData.recurringConfig || null,

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
        designConfig: timerData.designConfig || {},
        placementConfig: timerData.placementConfig || {},

        productSelection: timerData.productSelection || "all",
        selectedProducts: timerData.selectedProducts || null,
        selectedCollections: timerData.selectedCollections || null,
        excludedProducts: timerData.excludedProducts || null,
        productTags: timerData.productTags || null,

        pageSelection: timerData.pageSelection || null,
        excludedPages: timerData.excludedPages || null,

        geolocation: timerData.geolocation || "all-world",
        countries: timerData.countries || null,

        isPublished: intent === "publish" ? true : false,
        isActive: true,
      },
    });

    return json({ timer, success: true });
  }
};

export default function TimerConfigPage() {
  const [searchParams] = useSearchParams();
  const loaderData = useLoaderData<typeof loader>();
  const submit = useSubmit();
  const navigation = useNavigation();

  const timerTypeParam = searchParams.get("type");
  const timerId = searchParams.get("id");
  const existingTimer = loaderData?.timer;

  const timerType: "product" | "top-bottom-bar" =
    timerTypeParam === "top-bottom-bar" ? "top-bottom-bar" : "product";

  const [selected, setSelected] = useState(0);
  const [showToast, setShowToast] = useState(false);

  // Form state
  const [timerName, setTimerName] = useState(existingTimer?.name || "");
  const [title, setTitle] = useState(existingTimer?.title || "Hurry up!");
  const [subheading, setSubheading] = useState(
    existingTimer?.subheading || "Sale ends in:",
  );

  // Design state (you'll need to collect this from DesignTab)
  const [designConfig, setDesignConfig] = useState(
    existingTimer?.designConfig || {},
  );

  // Placement state (you'll need to collect this from PlacementTab)
  const [placementConfig, setPlacementConfig] = useState(
    existingTimer?.placementConfig || {},
  );

  const isPublished = existingTimer?.isPublished || false;
  const isSaving = navigation.state === "submitting";

  const handleTabChange = useCallback(
    (selectedTabIndex: number) => setSelected(selectedTabIndex),
    [],
  );

  const handleSave = (publish: boolean = false) => {
    const timerData = {
      name: timerName,
      title: title,
      subheading: subheading,
      type: timerType,
      designConfig,
      placementConfig,
      // Add all other timer fields here
      daysLabel: "Days",
      hoursLabel: "Hrs",
      minutesLabel: "Mins",
      secondsLabel: "Secs",
      timerType: "countdown",
      onExpiry: "unpublish",
      productSelection: "all",
      geolocation: "all-world",
    };

    const formData = new FormData();
    formData.append("intent", publish ? "publish" : "save");
    formData.append("timerData", JSON.stringify(timerData));
    if (timerId) {
      formData.append("timerId", timerId);
    }

    submit(formData, { method: "post" });
    setShowToast(true);
  };

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
            timerType={timerType}
            timerName={timerName}
            setTimerName={setTimerName}
            title={title}
            setTitle={setTitle}
            subheading={subheading}
            setSubheading={setSubheading}
            onContinue={() => handleTabChange(1)}
          />
        );
      case 1:
        return (
          <DesignTab
            timerType={timerType}
            onContinue={() => handleTabChange(2)}
          />
        );
      case 2:
        return <PlacementTab timerType={timerType} />;
      default:
        return null;
    }
  };

  const toastMarkup = showToast ? (
    <Toast
      content={
        isPublished ? "Timer published successfully" : "Timer saved as draft"
      }
      onDismiss={() => setShowToast(false)}
    />
  ) : null;

  return (
    <Frame>
      <Page
        title={timerName || "Timer name"}
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
        subtitle={
          timerId ? `Timer ID: ${timerId}` : "Save or Publish to show timer ID"
        }
        primaryAction={{
          content: isPublished ? "Update" : "Publish",
          loading: isSaving,
          onAction: () => handleSave(true),
        }}
        secondaryActions={[
          {
            content: "Save as draft",
            loading: isSaving,
            onAction: () => handleSave(false),
          },
        ]}
      >
        <Box paddingBlockEnd="800">
          <Tabs tabs={tabs} selected={selected} onSelect={handleTabChange}>
            <Box paddingBlockStart="400">
              <InlineGrid columns={{ xs: 1, lg: "2fr 3fr" }} gap="3200">
                <Box>
                  <Card padding="400">{renderTabContent()}</Card>
                </Box>
                <Box>
                  <TimerPreview title={title} subheading={subheading} />
                </Box>
              </InlineGrid>
            </Box>
          </Tabs>
        </Box>
        {toastMarkup}
      </Page>
    </Frame>
  );
}
