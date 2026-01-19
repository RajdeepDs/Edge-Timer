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
import { useCallback, useState } from "react";

interface ContentTabProps {
  timerName: string;
  setTimerName: (value: string) => void;
  title: string;
  setTitle: (value: string) => void;
  subheading: string;
  setSubheading: (value: string) => void;
  onContinue: () => void;
}

export default function ContentTab({
  timerName,
  setTimerName,
  title,
  setTitle,
  subheading,
  setSubheading,
  onContinue,
}: ContentTabProps) {
  const [timerTypeValue, setTimerTypeValue] = useState("countdown");
  const [timerStarts, setTimerStarts] = useState("now");
  const [selectedDate, setSelectedDate] = useState({
    month: 0,
    year: 2026,
  });
  const [selectedDates, setSelectedDates] = useState({
    start: new Date("2026-01-20"),
    end: new Date("2026-01-20"),
  });
  const [popoverActive, setPopoverActive] = useState(false);
  const [hour, setHour] = useState("4");
  const [minute, setMinute] = useState("29");
  const [period, setPeriod] = useState("PM");
  const [onceItEnds, setOnceItEnds] = useState("unpublish");

  const togglePopoverActive = useCallback(
    () => setPopoverActive((popoverActive) => !popoverActive),
    [],
  );

  const handleMonthChange = useCallback(
    (month: number, year: number) => setSelectedDate({ month, year }),
    [],
  );

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

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
      <BlockStack gap="100">
        <Text as="p" variant="bodyMd">
          Timer labels
        </Text>
        <InlineGrid gap="200" columns={4}>
          <TextField label="Days" labelHidden value="Days" autoComplete="off" />
          <TextField label="Hrs" labelHidden value="Hrs" autoComplete="off" />
          <TextField label="Mins" labelHidden value="Mins" autoComplete="off" />
          <TextField label="Secs" labelHidden value="Secs" autoComplete="off" />
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
                    onChange={setSelectedDates}
                    onMonthChange={handleMonthChange}
                    selected={selectedDates}
                  />
                </div>
              </Box>
            </Popover>
            <InlineGrid columns={3} gap="200">
              <TextField
                label="Hour"
                labelHidden
                type="number"
                value={hour}
                onChange={setHour}
                autoComplete="off"
                min={1}
                max={12}
              />
              <TextField
                label="Minute"
                labelHidden
                type="number"
                value={minute}
                onChange={setMinute}
                autoComplete="off"
                min={0}
                max={59}
              />
              <Select
                label="Period"
                labelHidden
                options={[
                  { label: "AM", value: "AM" },
                  { label: "PM", value: "PM" },
                ]}
                value={period}
                onChange={setPeriod}
              />
            </InlineGrid>
          </BlockStack>

          <BlockStack gap="200">
            <Text as="span" variant="bodyMd">
              Once it ends
            </Text>
            <Select
              label="Once it ends"
              labelHidden
              options={[
                { label: "Unpublish timer", value: "unpublish" },
                { label: "Keep timer visible", value: "keep" },
                { label: "Hide timer", value: "hide" },
              ]}
              value={onceItEnds}
              onChange={setOnceItEnds}
            />
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
