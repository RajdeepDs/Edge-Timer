import {
  TextField,
  BlockStack,
  Text,
  Box,
  InlineGrid,
  Divider,
  Bleed,
  RadioButton,
  Button,
  Popover,
  DatePicker,
  FormLayout,
} from "@shopify/polaris";
import type {
  TimerTypeValue,
  TimerStarts,
  OnExpiryAction,
  CallToActionType,
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

  // CTA (for top-bottom-bar)
  callToAction?: CallToActionType;
  setCallToAction?: (value: CallToActionType) => void;
  buttonText?: string;
  setButtonText?: (value: string) => void;
  buttonLink?: string;
  setButtonLink?: (value: string) => void;

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
  callToAction,
  setCallToAction,
  buttonText,
  setButtonText,
  buttonLink,
  setButtonLink,
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
    <FormLayout>
      <s-text-field
        label="Countdown name"
        value={timerName}
        defaultValue={timerName}
        onInput={(e) => setTimerName(e.currentTarget.value)}
        placeholder="Timer name"
        autocomplete="off"
        details="Only visible to you. For your own internal reference."
        error={
          hasFieldError("timerName") ? getFieldError("timerName") : undefined
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
      {timerType === "top-bottom-bar" && callToAction && setCallToAction && (
        <BlockStack gap="400">
          <s-select
            label="Call to action"
            value={callToAction}
            onInput={(e) =>
              setCallToAction(getValue(e) as unknown as CallToActionType)
            }
          >
            <s-option value="no">No call to action</s-option>
            <s-option value="button">Button</s-option>
            <s-option value="clickable">Make entire bar clickable</s-option>
          </s-select>
          {buttonText !== undefined && setButtonText && (
            <s-text-field
              label="Button Text"
              value={buttonText}
              defaultValue={buttonText}
              onInput={(e) => setButtonText(getValue(e))}
              placeholder="Shop now!"
              autocomplete="off"
              error={
                hasFieldError("buttonText")
                  ? getFieldError("buttonText")
                  : undefined
              }
            />
          )}
          {buttonLink !== undefined && setButtonLink && (
            <s-url-field
              label="Link"
              placeholder="Enter link"
              autocomplete="off"
              value={buttonLink}
              defaultValue={buttonLink}
              onInput={(e) => setButtonLink(getValue(e))}
              error={
                hasFieldError("buttonLink")
                  ? getFieldError("buttonLink")
                  : undefined
              }
            />
          )}
        </BlockStack>
      )}
      <BlockStack gap="100">
        <Text as="p" variant="bodyMd">
          Timer labels
        </Text>
        <InlineGrid gap="200" columns={4}>
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
        </InlineGrid>
      </BlockStack>
      <Bleed marginInline={"400"}>
        <Divider />
      </Bleed>
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
            <s-text-field
              label="Fixed minutes"
              value={fixedMinutes}
              defaultValue={fixedMinutes}
              onInput={(e) => setFixedMinutes(getValue(e))}
              autocomplete="off"
              details="Enter the number of minutes for the countdown (1-1440)"
              error={
                hasFieldError("fixedMinutes")
                  ? getFieldError("fixedMinutes")
                  : undefined
              }
            />
          )}

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
                  {/*TODO: fix the data picker by using web components instead of react */}
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
              <s-option value="unpublish">Unpublish timer</s-option>
              <s-option value="keep">Keep timer visible</s-option>
              <s-option value="hide">Hide timer</s-option>
            </s-select>
          </BlockStack>
        </BlockStack>
      </BlockStack>
      <Bleed marginInline={"400"}>
        <Divider />
      </Bleed>
      <Button fullWidth onClick={onContinue}>
        Continue to Design
      </Button>
    </FormLayout>
  );
}
