import {
  Card,
  BlockStack,
  InlineStack,
  Text,
  Button,
  Box,
  ProgressBar,
  Icon,
} from "@shopify/polaris";
import {
  CheckCircleIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  AlertCircleIcon,
  XIcon,
} from "@shopify/polaris-icons";
import { useState } from "react";

interface SetupGuideCardProps {
  embedActivated: boolean;
  firstTimerCreated: boolean;
  timerConfirmedWorking: boolean;
  onDismiss: () => void;
  onOpenThemeSettings: () => void;
  onMarkEmbedDone: () => void;
  onMarkConfirmedWorking: () => void;
}

export function SetupGuideCard({
  embedActivated,
  firstTimerCreated,
  timerConfirmedWorking,
  onDismiss,
  onOpenThemeSettings,
  onMarkEmbedDone,
  onMarkConfirmedWorking,
}: SetupGuideCardProps) {
  const [isOpen, setIsOpen] = useState(true);

  const steps = [
    {
      id: "embed",
      title: "Activate app embed in Shopify",
      description:
        "Activate and save the app embed in your theme settings to make your countdown timers live.",
      completed: embedActivated,
      actions: (
        <InlineStack gap="200">
          <Button variant="primary" onClick={onOpenThemeSettings}>
            Open theme settings
          </Button>
          <Button onClick={onMarkEmbedDone}>I have done it</Button>
        </InlineStack>
      ),
      secondaryAction: null,
    },
    {
      id: "timer",
      title: "Create your first countdown timer",
      completed: firstTimerCreated,
      description: null,
      actions: null,
      secondaryAction: !firstTimerCreated ? (
        <Button variant="plain">Create</Button>
      ) : null,
    },
    {
      id: "confirm",
      title: "Confirm your timer is working properly",
      completed: timerConfirmedWorking,
      description: null,
      actions: firstTimerCreated ? (
        <InlineStack gap="200">
          <Button onClick={onMarkConfirmedWorking}>Mark as done</Button>
        </InlineStack>
      ) : null,
      secondaryAction: null,
    },
  ];

  const completedSteps = steps.filter((step) => step.completed).length;
  const totalSteps = steps.length;
  const progress = (completedSteps / totalSteps) * 100;

  const currentStepIndex = steps.findIndex((step) => !step.completed);

  return (
    <Card>
      <BlockStack gap="200">
        {/* Header */}
        <InlineStack align="space-between" blockAlign="center">
          <BlockStack gap="0">
            <Text as="h2" variant="headingMd" fontWeight="semibold">
              Setup guide
            </Text>
            <Text as="p" tone="subdued">
              Follow these steps to start using the Countdown timer app
            </Text>
          </BlockStack>

          <InlineStack gap="100" blockAlign="center">
            <Button
              variant="plain"
              icon={isOpen ? ChevronUpIcon : ChevronDownIcon}
              onClick={() => setIsOpen(!isOpen)}
              accessibilityLabel="Toggle setup guide"
            />
            <Button
              variant="plain"
              icon={XIcon}
              onClick={onDismiss}
              accessibilityLabel="Dismiss setup guide"
            />
          </InlineStack>
        </InlineStack>

        {/* Progress */}
        <BlockStack gap="200">
          <Text as="p" tone="base" variant="bodySm">
            {completedSteps} / {totalSteps} steps completed
          </Text>
          <ProgressBar progress={progress} size="small" tone="primary" />
        </BlockStack>

        {/* Steps */}
        {isOpen && (
          <BlockStack gap="100">
            {steps.map((step, index) => {
              const isCurrent = index === currentStepIndex;

              return (
                <Box
                  key={step.id}
                  padding={isCurrent ? "300" : "200"}
                  background={isCurrent ? "bg-surface-secondary" : undefined}
                  borderRadius={isCurrent ? "100" : undefined}
                >
                  <BlockStack gap="200">
                    {/* Step Header */}
                    <InlineStack align="space-between" blockAlign="center">
                      <InlineStack gap="300" blockAlign="center">
                        {step.completed ? (
                          <Icon source={CheckCircleIcon} tone="base" />
                        ) : (
                          <Icon source={AlertCircleIcon} tone="subdued" />
                        )}

                        <Text
                          as="h3"
                          variant="bodyMd"
                          fontWeight={isCurrent ? "semibold" : "regular"}
                          tone={step.completed ? "subdued" : undefined}
                        >
                          {step.title}
                        </Text>
                      </InlineStack>

                      {/* Right-aligned CTA for collapsed incomplete steps */}
                      {!isCurrent && !step.completed && step.secondaryAction}
                    </InlineStack>

                    {/* Expanded content for active step */}
                    {isCurrent && !step.completed && (
                      <>
                        {step.description && (
                          <Text as="p" tone="subdued" variant="bodySm">
                            {step.description}
                          </Text>
                        )}

                        {step.actions}
                      </>
                    )}
                  </BlockStack>
                </Box>
              );
            })}
          </BlockStack>
        )}
      </BlockStack>
    </Card>
  );
}
