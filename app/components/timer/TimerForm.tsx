import { useCallback, useEffect, useState } from "react";
import {
  Page,
  Box,
  Tabs,
  Card,
  Frame,
  Badge,
  Modal,
  Text,
  BlockStack,
} from "@shopify/polaris";
import { useSubmit, useNavigation, useActionData } from "@remix-run/react";
import { useTimerForm } from "../../hooks/useTimerForm";
import { useTimerTabs } from "../../hooks/useTimerTabs";
import ContentTab from "./ContentTab";
import DesignTab from "./DesignTab";
import PlacementTab from "./PlacementTab";
import TimerPreview from "./TimerPreview";
import { combineDateTime } from "../../utils/timer/datetime";
import {
  validateTimerForm,
  type ValidationError,
} from "../../utils/timer/validation";
import type { Timer, TimerFormData } from "../../types/timer";
import { tabs } from "app/config/timer-tabs";

interface TimerFormProps {
  existingTimer?: Timer | null;
  timerType: "product-page" | "top-bottom-bar";
  timerId?: string;
  shop: string;
  onCancel?: () => void;
}

export function TimerForm({
  existingTimer,
  timerType,
  timerId,
  shop,
  onCancel,
}: TimerFormProps) {
  const submit = useSubmit();
  const navigation = useNavigation();
  const actionData = useActionData<{ error?: string }>();
  const isSaving = navigation.state === "submitting";

  // Single, top-level call to your form state hook
  const formState = useTimerForm({ existingTimer, timerType });

  const { selectedTab, handleTabChange, goToNextTab } = useTimerTabs();
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>(
    [],
  );
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [previousNavigationState, setPreviousNavigationState] = useState(
    navigation.state,
  );

  // Show toast notification for errors from action
  useEffect(() => {
    if (actionData?.error) {
      shopify.toast.show(actionData.error, {
        duration: 5000,
        isError: true,
      });
    }
  }, [actionData]);

  // Show success toast when form is successfully submitted
  useEffect(() => {
    if (
      previousNavigationState === "submitting" &&
      navigation.state === "idle" &&
      !actionData?.error
    ) {
      const message = timerId
        ? "Timer updated successfully"
        : "Timer created successfully";
      shopify.toast.show(message, {
        duration: 3000,
      });
    }
    setPreviousNavigationState(navigation.state);
  }, [navigation.state, actionData, timerId, previousNavigationState]);

  /**
   * Trigger a native "submit" event on the <form data-save-bar> element.
   * This is what the App Bridge Save Bar listens to in order to auto-hide.
   *
   * NOTE: This does NOT actually send the form to the server (we're not
   * calling form.submit()), it only fires the event so App Bridge can react.
   */
  const triggerSaveBarSubmitEvent = useCallback(() => {
    const form = document.getElementById(
      "timer-form",
    ) as HTMLFormElement | null;
    if (!form) return;

    const event = new Event("submit", {
      bubbles: true,
      cancelable: true,
    });

    form.dispatchEvent(event);
  }, []);

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
        setValidationErrors(validation.errors);
        // Switch to Content tab if there are errors
        handleTabChange(0);
        return;
      }

      // Clear validation errors if form is valid
      setValidationErrors([]);

      // Tell App Bridge's save bar that the form has been "submitted"
      // so that it auto-hides.
      triggerSaveBarSubmitEvent();

      const formData = new FormData();
      formData.append("timerData", JSON.stringify(timerData));
      if (timerId) {
        formData.append("timerId", timerId);
      }
      formData.append("intent", publish ? "publish" : "save");

      submit(formData, {
        method: "POST",
        action: timerId ? `/timer?id=${timerId}` : "/timer",
      });
    },
    [
      formState,
      timerType,
      timerId,
      submit,
      handleTabChange,
      triggerSaveBarSubmitEvent,
    ],
  );

  const handlePublish = useCallback(() => {
    void handleSubmit(true);
  }, [handleSubmit]);

  const handleDeleteClick = useCallback(() => {
    setShowDeleteModal(true);
  }, []);

  const handleDeleteConfirm = useCallback(() => {
    if (!timerId) return;

    const form = document.createElement("form");
    form.method = "POST";
    form.action = `/timer?id=${timerId}`;

    const intentInput = document.createElement("input");
    intentInput.type = "hidden";
    intentInput.name = "intent";
    intentInput.value = "delete";
    form.appendChild(intentInput);

    const timerIdInput = document.createElement("input");
    timerIdInput.type = "hidden";
    timerIdInput.name = "timerId";
    timerIdInput.value = timerId;
    form.appendChild(timerIdInput);

    document.body.appendChild(form);
    form.submit();
  }, [timerId]);

  const handleDeleteCancel = useCallback(() => {
    setShowDeleteModal(false);
  }, []);

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
            validationErrors={validationErrors}
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
            timerId={timerId}
            shop={shop}
          />
        );
      default:
        return null;
    }
  };

  const secondaryActions = (() => {
    const actions: any[] = [];
    if (timerId) {
      actions.push({
        content: "Delete timer",
        loading: isSaving,
        destructive: true,
        onAction: handleDeleteClick,
      });
    }

    return actions.length ? actions : undefined;
  })();

  return (
    <Frame>
      <Page
        title={formState.timerName}
        backAction={{
          content: "Timers",
          url: "/",
        }}
        titleMetadata={
          timerId ? (
            <Badge tone="success">Published</Badge>
          ) : (
            <Badge>Draft</Badge>
          )
        }
        subtitle={timerId ? `Timer ID: ${timerId}` : `Save to show Timer ID`}
        secondaryActions={secondaryActions}
        primaryAction={{
          content: timerId ? "Update" : "Publish",
          loading: isSaving,
          onAction: handlePublish,
        }}
      >
        {/*
          IMPORTANT:
          - data-save-bar enables automatic Save Bar behavior
          - We give it an id="timer-form" so we can trigger a synthetic submit
        */}
        <form id="timer-form" method="post" data-save-bar>
          <Box paddingBlockEnd="800">
            <Tabs tabs={tabs} selected={selectedTab} onSelect={handleTabChange}>
              <Box paddingBlockStart="400">
                <div
                  style={{
                    display: "grid",
                    gap: "1rem",
                    gridTemplateColumns: "minmax(324px, 1fr) 2fr",
                  }}
                >
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
                      endDate={formState.endDate}
                      hour={formState.hour}
                      minute={formState.minute}
                      period={formState.period}
                    />
                  </Box>
                </div>
              </Box>
            </Tabs>
          </Box>
        </form>

        <Modal
          open={showDeleteModal}
          onClose={handleDeleteCancel}
          title="Delete timer"
          primaryAction={{
            content: "Delete",
            destructive: true,
            onAction: handleDeleteConfirm,
          }}
          secondaryActions={[
            {
              content: "Cancel",
              onAction: handleDeleteCancel,
            },
          ]}
        >
          <Modal.Section>
            <BlockStack gap="400">
              <Text as="p" variant="bodyMd">
                Are you sure you want to delete this timer? This action cannot
                be undone.
              </Text>
            </BlockStack>
          </Modal.Section>
        </Modal>
      </Page>
    </Frame>
  );
}
