import { useEffect } from "react";
import {
  TextField,
  BlockStack,
  Text,
  Box,
  InlineGrid,
  RadioButton,
  Button,
  Popover,
  DatePicker,
  FormLayout,
  Card,
} from "@shopify/polaris";
import type {
  TimerTypeValue,
  TimerStarts,
  OnExpiryAction,
} from "../../types/timer";
import { useDateTimePicker } from "../../hooks/useDateTimePicker";
import type { ValidationError } from "../../utils/timer/validation";

interface ContentTabProps {
  timerType: "product-page" | "top-bottom-bar";
  timerName: string;
  setTimerName: (value: string) => void;
  title: string;
  setTitle: (value: string) => void;
  subheading: string;
  setSubheading: (value: string) => void;

  // Timer type settings
  timerTypeValue: TimerTypeValue;
  setTimerTypeValue: (value: TimerTypeValue) => void;
  timerStarts: TimerStarts;
  setTimerStarts: (value: TimerStarts) => void;

  // End date and time
  endDate: Date;
  setEndDate: (date: Date) => void;
  hour: string;
  setHour: (value: string) => void;
  minute: string;
  setMinute: (value: string) => void;
  period: "AM" | "PM";
  setPeriod: (value: "AM" | "PM") => void;

  // Fixed minutes (for fixed timer type)
  fixedMinutes: string;
  setFixedMinutes: (value: string) => void;

  // Timer labels
  daysLabel: string;
  setDaysLabel: (value: string) => void;
  hoursLabel: string;
  setHoursLabel: (value: string) => void;
  minutesLabel: string;
  setMinutesLabel: (value: string) => void;
  secondsLabel: string;
  setSecondsLabel: (value: string) => void;

  // Once it ends
  onceItEnds: OnExpiryAction;
  setOnceItEnds: (value: OnExpiryAction) => void;

  showTimerLabels: boolean;
  setShowTimerLabels: (value: boolean) => void;
  validationErrors: ValidationError[];
  onContinue: () => void;
}

export default function ContentTab({
  timerType,
  timerName,
  setTimerName,
  title,
  setTitle,
  subheading,
  setSubheading,
  timerTypeValue,
  setTimerTypeValue,
  timerStarts,
  setTimerStarts,
  endDate,
  setEndDate,
  hour,
  setHour,
  minute,
  setMinute,
  period,
  setPeriod,
  fixedMinutes,
  setFixedMinutes,
  daysLabel,
  setDaysLabel,
  hoursLabel,
  setHoursLabel,
  minutesLabel,
  setMinutesLabel,
  secondsLabel,
  setSecondsLabel,
  onceItEnds,
  setOnceItEnds,
  showTimerLabels,
  setShowTimerLabels,
  validationErrors,
  onContinue,
}: ContentTabProps) {
  // Use custom hook for date picker state
  const {
    selectedDate,
    selectedDates,
    popoverActive,
    togglePopoverActive,
    handleMonthChange,
    handleDateChange,
    formatDate,
  } = useDateTimePicker({
    initialDate: endDate,
    onDateChange: setEndDate,
  });


  useEffect(() => {
    const fixedOnlyActions: OnExpiryAction[] = ["hide-buyer", "repeat", "nothing"];
    const countdownOnlyActions: OnExpiryAction[] = ["unpublish", "keep", "hide"];
    setOnceItEnds((prev) => {
      if (timerTypeValue === "fixed" && countdownOnlyActions.includes(prev)) {
        return "hide-buyer";
      }
      if (timerTypeValue === "countdown" && fixedOnlyActions.includes(prev)) {
        return "unpublish";
      }
      return prev;
    });
  }, [timerTypeValue, setOnceItEnds]);

  const getValue = (e: any) => {
    // Support both native inputs and custom elements emitting detail.value
    return (
      e?.detail?.value ?? (e?.currentTarget as HTMLInputElement)?.value ?? ""
    );
  };

  // Helper function to get error message for a field
  const getFieldError = (fieldName: string): string | undefined => {
    const error = validationErrors.find((err) => err.field === fieldName);
    return error?.message;
  };

  // Helper function to check if a field has an error
  const hasFieldError = (fieldName: string): boolean => {
    return validationErrors.some((err) => err.field === fieldName);
  };

  return (
    <BlockStack gap="400">
      <Card padding="400">
        <FormLayout>
          <s-text-field
            label="Countdown name"
            value={timerName}
            defaultValue={timerName}
            onInput={(e) => setTimerName(getValue(e))}
            placeholder="Timer name"
            autocomplete="off"
            details="Only visible to you. For your own internal reference."
            error={
              hasFieldError("timerName")
                ? getFieldError("timerName")
                : undefined
            }
          />
          <s-text-field
            label="Title"
            value={title}
            defaultValue={title}
            onInput={(e) => setTitle(getValue(e))}
            placeholder="Hurry up!"
            autocomplete="off"
            error={hasFieldError("title") ? getFieldError("title") : undefined}
          />
          {timerType === "product-page" && (
            <s-text-field
              label="Subheading"
              value={subheading}
              defaultValue={subheading}
              onInput={(e) => setSubheading(getValue(e))}
              placeholder="Sale ends in:"
              autocomplete="off"
            />
          )}
          <BlockStack gap="100">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Text as="p" variant="bodyMd">
                Timer labels
              </Text>
              <s-switch
                checked={showTimerLabels}
                onInput={() => setShowTimerLabels(!showTimerLabels)}
                accessibilityLabel="Toggle timer labels"
              />
            </div>
            {showTimerLabels && <InlineGrid gap="200" columns={4}>
              <s-text-field
                label="Days"
                labelAccessibilityVisibility="exclusive"
                value={daysLabel}
                defaultValue={daysLabel}
                onInput={(e) => setDaysLabel(getValue(e))}
                autocomplete="off"
              />
              <s-text-field
                label="Hrs"
                labelAccessibilityVisibility="exclusive"
                value={hoursLabel}
                defaultValue={hoursLabel}
                onInput={(e) => setHoursLabel(getValue(e))}
                autocomplete="off"
              />
              <s-text-field
                label="Mins"
                labelAccessibilityVisibility="exclusive"
                value={minutesLabel}
                defaultValue={minutesLabel}
                onInput={(e) => setMinutesLabel(getValue(e))}
                autocomplete="off"
              />
              <s-text-field
                label="Secs"
                labelAccessibilityVisibility="exclusive"
                value={secondsLabel}
                defaultValue={secondsLabel}
                onInput={(e) => setSecondsLabel(getValue(e))}
                autocomplete="off"
              />
            </InlineGrid>}
          </BlockStack>
        </FormLayout>
      </Card>

      <Card padding="400">
        <BlockStack gap="400">
          <Text as="h4" variant="headingSm" fontWeight="semibold">
            Timer Type
          </Text>
          <BlockStack gap="200">
            <Box>
              <RadioButton
                label="Countdown to a date"
                helpText="Timer that ends at the specific date."
                checked={timerTypeValue === "countdown"}
                id="countdown"
                name="timerType"
                onChange={() => setTimerTypeValue("countdown")}
              />
              <RadioButton
                label="Fixed minutes"
                helpText="Individual fixed minutes countdown for each buyer session."
                checked={timerTypeValue === "fixed"}
                id="fixed"
                name="timerType"
                onChange={() => setTimerTypeValue("fixed")}
              />
            </Box>

            {timerTypeValue === "fixed" && (
              <s-number-field
                label="Fixed minutes"
                value={fixedMinutes}
                defaultValue={fixedMinutes}
                onInput={(e) => setFixedMinutes(getValue(e))}
                autocomplete="off"
                inputMode="numeric"
                min={1}
                max={1440}
                details="Enter the number of minutes for the countdown (1-1440)"
                error={
                  hasFieldError("fixedMinutes")
                    ? getFieldError("fixedMinutes")
                    : undefined
                }
              />
            )}

            {timerTypeValue === "countdown" && (
              <BlockStack as="fieldset" gap={{ xs: "400", md: "0" }}>
                <Box as="legend" paddingBlockEnd={{ xs: "0", md: "100" }}>
                  <Text as="span" variant="bodyMd">
                    Timer starts
                  </Text>
                </Box>
                <BlockStack as="ul">
                  <RadioButton
                    label="Right now"
                    checked={timerStarts === "now"}
                    id="now"
                    name="timerStarts"
                    onChange={() => setTimerStarts("now")}
                  />
                  <RadioButton
                    disabled
                    label="Schedule to start later"
                    checked={timerStarts === "later"}
                    id="later"
                    name="timerStarts"
                    onChange={() => setTimerStarts("later")}
                  />
                </BlockStack>
              </BlockStack>
            )}

            {timerTypeValue === "countdown" && (
              <BlockStack gap="200">
                <Text as="span" variant="bodyMd">
                  End date
                </Text>
                <Popover
                  active={popoverActive}
                  activator={
                    <TextField
                      label="End date"
                      labelHidden
                      value={formatDate(selectedDates.start)}
                      onFocus={togglePopoverActive}
                      autoComplete="off"
                      error={
                        hasFieldError("endDate")
                          ? getFieldError("endDate")
                          : undefined
                      }
                    />
                  }
                  onClose={togglePopoverActive}
                >
                  <Box padding="400" maxWidth="100%">
                    <div style={{ maxWidth: "276px" }}>
                      <DatePicker
                        month={selectedDate.month}
                        year={selectedDate.year}
                        onChange={handleDateChange}
                        onMonthChange={handleMonthChange}
                        selected={selectedDates}
                      />
                    </div>
                  </Box>
                </Popover>
                <InlineGrid columns={3} gap="200">
                  <s-number-field
                    label="Hour"
                    labelAccessibilityVisibility="exclusive"
                    value={hour}
                    defaultValue={hour}
                    onInput={(e) => setHour(getValue(e))}
                    min={1}
                    max={12}
                    autocomplete="off"
                    inputMode="numeric"
                  />
                  <s-number-field
                    label="Minute"
                    labelAccessibilityVisibility="exclusive"
                    value={minute}
                    defaultValue={minute}
                    onInput={(e) => setMinute(getValue(e))}
                    min={0}
                    max={59}
                    autocomplete="off"
                    inputMode="numeric"
                  />
                  <s-select
                    label="Period"
                    labelAccessibilityVisibility="exclusive"
                    value={period}
                    onInput={(e) =>
                      setPeriod(getValue(e) as unknown as "AM" | "PM")
                    }
                  >
                    <s-option value="AM">AM</s-option>
                    <s-option value="PM">PM</s-option>
                  </s-select>
                </InlineGrid>
              </BlockStack>
            )}

            <BlockStack gap="200">
              <Text as="span" variant="bodyMd">
                Once it ends
              </Text>
              <s-select
                label="Once it ends"
                labelAccessibilityVisibility="exclusive"
                value={onceItEnds}
                onInput={(e) =>
                  setOnceItEnds(getValue(e) as unknown as OnExpiryAction)
                }
              >
                {timerTypeValue === "fixed" ? (
                  <>
                    <s-option value="hide-buyer">Hide the timer for the buyer</s-option>
                    <s-option value="repeat">Repeat the countdown</s-option>
                    <s-option value="nothing">Do nothing</s-option>
                  </>
                ) : (
                  <>
                    <s-option value="unpublish">Unpublish timer</s-option>
                    <s-option value="keep">Keep timer visible</s-option>
                    <s-option value="hide">Hide timer</s-option>
                  </>
                )}
              </s-select>
            </BlockStack>
          </BlockStack>
        </BlockStack>
      </Card>

      <Button fullWidth onClick={onContinue} size="large">
        Continue to Design
      </Button>
    </BlockStack>
  );
}
