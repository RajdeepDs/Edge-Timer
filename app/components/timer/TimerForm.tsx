import { useCallback } from "react";
import {
  Page,
  Box,
  Tabs,
  Card,
  InlineGrid,
  Frame,
  Badge,
} from "@shopify/polaris";
import { useSubmit, useNavigation } from "@remix-run/react";
import { useTimerForm } from "../../hooks/useTimerForm";
import { useTimerTabs } from "../../hooks/useTimerTabs";
import ContentTab from "./ContentTab";
import DesignTab from "./DesignTab";
import PlacementTab from "./PlacementTab";
import TimerPreview from "./TimerPreview";
import { combineDateTime } from "../../utils/timer/datetime";
import { validateTimerForm } from "../../utils/timer/validation";
import type { Timer, TimerFormData } from "../../types/timer";
import { tabs } from "app/config/timer-tabs";

interface TimerFormProps {
  existingTimer?: Timer | null;
  timerType: "product-page" | "top-bottom-bar";
  timerId?: string;
  onCancel?: () => void;
}

export function TimerForm({
  existingTimer,
  timerType,
  timerId,
  onCancel,
}: TimerFormProps) {
  const submit = useSubmit();
  const navigation = useNavigation();
  const isSaving = navigation.state === "submitting";

  const formState = useTimerForm({ existingTimer, timerType });
  const { selectedTab, handleTabChange, goToNextTab } = useTimerTabs();

  console.log(formState.designConfig);

  const handleSubmit = useCallback(
    async (publish: boolean = false) => {
      const finalEndDate =
        formState.timerTypeValue === "countdown"
          ? combineDateTime(
              formState.endDate,
              formState.hour,
              formState.minute,
              formState.period,
            )
          : null;

      const timerData: TimerFormData = {
        name: formState.timerName,
        title: formState.title,
        subheading: formState.subheading,
        type: timerType,

        timerType: formState.timerTypeValue,
        endDate: finalEndDate,
        fixedMinutes:
          formState.timerTypeValue === "fixed"
            ? parseInt(formState.fixedMinutes)
            : null,
        isRecurring: false,
        recurringConfig: null,

        daysLabel: formState.daysLabel,
        hoursLabel: formState.hoursLabel,
        minutesLabel: formState.minutesLabel,
        secondsLabel: formState.secondsLabel,

        startsAt: new Date(),
        onExpiry: formState.onceItEnds,

        ctaType: timerType === "top-bottom-bar" ? formState.callToAction : null,
        buttonText:
          timerType === "top-bottom-bar" ? formState.buttonText : null,
        buttonLink:
          timerType === "top-bottom-bar" ? formState.buttonLink : null,

        designConfig: formState.designConfig,
        placementConfig: formState.placementConfig,

        productSelection: "all",
        selectedProducts: null,
        selectedCollections: null,
        excludedProducts: null,
        productTags: null,

        pageSelection: timerType === "top-bottom-bar" ? "every-page" : null,
        excludedPages: null,

        geolocation: "all-world",
        countries: null,

        isPublished: publish,
      };

      // Validate form
      const validation = validateTimerForm(timerData);
      if (!validation.isValid) {
        console.error("Validation errors:", validation.errors);
        // TODO: Show validation errors to user
        return;
      }

      const formData = new FormData();
      formData.append("timerData", JSON.stringify(timerData));
      if (timerId) {
        formData.append("timerId", timerId);
      }
      formData.append("intent", publish ? "publish" : "save");

      submit(formData, {
        method: timerId ? "PUT" : "POST",
        action: timerId ? `/timer?id=${timerId}` : "/timer",
      });
    },
    [formState, timerType, timerId, submit],
  );

  const handlePublish = useCallback(() => {
    handleSubmit(true);
  }, [handleSubmit]);

  const handleSave = useCallback(() => {
    handleSubmit(false);
  }, [handleSubmit]);

  const handleDelete = useCallback(() => {
    if (!timerId) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete this timer?",
    );
    if (!confirmed) return;

    const formData = new FormData();
    formData.append("intent", "delete");
    formData.append("timerId", timerId);

    const form = document.createElement("form");
    form.method = "POST";
    form.action = `/timer?id=${timerId}`;

    const input = document.createElement("input");
    input.type = "hidden";
    input.name = "intent";
    input.value = "delete";
    form.appendChild(input);

    const timerIdInput = document.createElement("input");
    timerIdInput.type = "hidden";
    timerIdInput.name = "timerId";
    timerIdInput.value = timerId;
    form.appendChild(timerIdInput);

    document.body.appendChild(form);
    form.submit();
  }, [timerId]);

  const renderTabContent = () => {
    switch (selectedTab) {
      case 0:
        return (
          <ContentTab
            timerType={timerType}
            timerName={formState.timerName}
            setTimerName={formState.setTimerName}
            title={formState.title}
            setTitle={formState.setTitle}
            subheading={formState.subheading}
            setSubheading={formState.setSubheading}
            timerTypeValue={formState.timerTypeValue}
            setTimerTypeValue={formState.setTimerTypeValue}
            timerStarts={formState.timerStarts}
            setTimerStarts={formState.setTimerStarts}
            endDate={formState.endDate}
            setEndDate={formState.setEndDate}
            hour={formState.hour}
            setHour={formState.setHour}
            minute={formState.minute}
            setMinute={formState.setMinute}
            period={formState.period}
            setPeriod={formState.setPeriod}
            fixedMinutes={formState.fixedMinutes}
            setFixedMinutes={formState.setFixedMinutes}
            daysLabel={formState.daysLabel}
            setDaysLabel={formState.setDaysLabel}
            hoursLabel={formState.hoursLabel}
            setHoursLabel={formState.setHoursLabel}
            minutesLabel={formState.minutesLabel}
            setMinutesLabel={formState.setMinutesLabel}
            secondsLabel={formState.secondsLabel}
            setSecondsLabel={formState.setSecondsLabel}
            onceItEnds={formState.onceItEnds}
            setOnceItEnds={formState.setOnceItEnds}
            callToAction={formState.callToAction}
            setCallToAction={formState.setCallToAction}
            buttonText={formState.buttonText}
            setButtonText={formState.setButtonText}
            buttonLink={formState.buttonLink}
            setButtonLink={formState.setButtonLink}
            onContinue={goToNextTab}
          />
        );
      case 1:
        return (
          <DesignTab
            timerType={
              timerType === "product-page" ? "product" : "top-bottom-bar"
            }
            designConfig={formState.designConfig}
            setDesignConfig={formState.setDesignConfig}
            onContinue={goToNextTab}
          />
        );
      case 2:
        return (
          <PlacementTab
            timerType={
              timerType === "product-page" ? "product" : "top-bottom-bar"
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
          content: "Delete timer",
          loading: isSaving,
          destructive: true,
          onAction: handleDelete,
        },
      ]
    : undefined;

  return (
    <Frame>
      <Page
        title={`${formState.timerName}`}
        backAction={{
          content: "Timers",
          url: "/new",
        }}
        titleMetadata={
          timerId ? <Badge>Published</Badge> : <Badge>Draft</Badge>
        }
        subtitle={timerId ? `Timer ID: ${timerId}` : "Save to show Timer ID"}
        secondaryActions={secondaryActions}
        primaryAction={{
          content: timerId ? "Update" : "Publish",
          loading: isSaving,
          onAction: handlePublish,
        }}
      >
        <form method="post" data-save-bar onSubmit={handleSave}>
          <Box paddingBlockEnd="800">
            <Tabs tabs={tabs} selected={selectedTab} onSelect={handleTabChange}>
              <Box paddingBlockStart="400">
                <InlineGrid columns={{ xs: 1, lg: "2fr 3fr" }} gap="3200">
                  <Box>
                    <Card padding="400">{renderTabContent()}</Card>
                  </Box>
                  <Box>
                    <TimerPreview
                      title={formState.title}
                      subheading={formState.subheading}
                      daysLabel={formState.daysLabel}
                      hoursLabel={formState.hoursLabel}
                      minutesLabel={formState.minutesLabel}
                      secondsLabel={formState.secondsLabel}
                      designConfig={formState.designConfig}
                      timerType={
                        timerType === "product-page"
                          ? "product"
                          : "top-bottom-bar"
                      }
                      buttonText={formState.buttonText}
                    />
                  </Box>
                </InlineGrid>
              </Box>
            </Tabs>
          </Box>
        </form>
      </Page>
    </Frame>
  );
}
