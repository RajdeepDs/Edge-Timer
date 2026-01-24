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
  Select,
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

  return (
    <FormLayout>
      <TextField
        label="Countdown name"
        value={timerName}
        onChange={setTimerName}
        placeholder="Timer name"
        autoComplete="off"
        helpText="Only visible to you. For your own internal reference."
      />
      <TextField
        label="Title"
        value={title}
        onChange={setTitle}
        placeholder="Hurry up!"
        autoComplete="off"
      />
      <TextField
        label="Subheading"
        value={subheading}
        onChange={setSubheading}
        placeholder="Sale ends in:"
        autoComplete="off"
      />
      {timerType === "top-bottom-bar" && callToAction && setCallToAction && (
        <BlockStack gap="400">
          <Select
            label="Call to action"
            options={[
              { label: "No call to action", value: "no" },
              { label: "Button", value: "button" },
              { label: "Make entire bar clickable", value: "clickable" },
            ]}
            value={callToAction}
            onChange={(value) => setCallToAction(value as CallToActionType)}
          />
          {buttonText !== undefined && setButtonText && (
            <TextField
              label="Button Text"
              value={buttonText}
              onChange={setButtonText}
              placeholder="Shop now!"
              autoComplete="off"
            />
          )}
          {buttonLink !== undefined && setButtonLink && (
            <TextField
              label="Link"
              value={buttonLink}
              onChange={setButtonLink}
              placeholder="Enter link"
              autoComplete="off"
            />
          )}
        </BlockStack>
      )}
      <BlockStack gap="100">
        <Text as="p" variant="bodyMd">
          Timer labels
        </Text>
        <InlineGrid gap="200" columns={4}>
          <TextField
            label="Days"
            labelHidden
            value={daysLabel}
            onChange={setDaysLabel}
            autoComplete="off"
          />
          <TextField
            label="Hrs"
            labelHidden
            value={hoursLabel}
            onChange={setHoursLabel}
            autoComplete="off"
          />
          <TextField
            label="Mins"
            labelHidden
            value={minutesLabel}
            onChange={setMinutesLabel}
            autoComplete="off"
          />
          <TextField
            label="Secs"
            labelHidden
            value={secondsLabel}
            onChange={setSecondsLabel}
            autoComplete="off"
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
            <TextField
              label="Fixed minutes"
              type="number"
              value={fixedMinutes}
              onChange={setFixedMinutes}
              min={1}
              max={1440}
              helpText="Enter the number of minutes for the countdown (1-1440)"
              autoComplete="off"
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
                  onChange={() => setHour}
                  min={1}
                  max={12}
                  autocomplete="off"
                  inputMode="numeric"
                />
                <s-number-field
                  label="Minute"
                  labelAccessibilityVisibility="exclusive"
                  value={minute}
                  onChange={() => setMinute}
                  min={0}
                  max={59}
                  autocomplete="off"
                  inputMode="numeric"
                />
                <s-select
                  label="Period"
                  labelAccessibilityVisibility="exclusive"
                  value={period}
                  onChange={(value) =>
                    setPeriod(value as unknown as "AM" | "PM")
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
              onChange={(value) =>
                setOnceItEnds(value as unknown as OnExpiryAction)
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
