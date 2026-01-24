import {
  TextField,
  BlockStack,
  Text,
  Box,
  FormLayout,
  Button,
  RadioButton,
  InlineGrid,
  InlineStack,
  Popover,
  ColorPicker,
  Divider,
  Bleed,
  Select,
} from "@shopify/polaris";
import { useRef, useEffect } from "react";
import type { DesignConfig } from "../../types/timer";
import { useDesignState } from "../../hooks/useDesignState";
import { hsbToHex } from "../../utils/timer/color";

interface DesignTabProps {
  timerType: "product" | "top-bottom-bar";
  designConfig: DesignConfig;
  setDesignConfig: (config: DesignConfig) => void;
  onContinue: () => void;
}

export default function DesignTab({
  timerType,
  designConfig,
  setDesignConfig,
  onContinue,
}: DesignTabProps) {
  const {
    positioning,
    setPositioning,
    backgroundType,
    setBackgroundType,
    bgColorText,
    setBgColorText,
    borderRadius,
    setBorderRadius,
    borderSize,
    setBorderSize,
    borderColor,
    toggleBorderColorPopover,
    borderColorText,
    setBorderColorText,
    insideTop,
    setInsideTop,
    insideBottom,
    setInsideBottom,
    outsideTop,
    setOutsideTop,
    outsideBottom,
    setOutsideBottom,
    titleSize,
    setTitleSize,
    titleColorText,
    setTitleColorText,
    subheadingSize,
    setSubheadingSize,
    subheadingColorText,
    setSubheadingColorText,
    timerSize,
    setTimerSize,
    timerColorText,
    setTimerColorText,
    legendSize,
    setLegendSize,
    legendColorText,
    setLegendColorText,
    buttonFontSize,
    setButtonFontSize,
    cornerRadius,
    setCornerRadius,
    buttonColor,
    setButtonColor,
    buttonBackgroundColor,
    setButtonBackgroundColor,
    buttonColorPopover,
    toggleButtonColorPopover,
    buttonBgColorPopover,
    toggleButtonBgColorPopover,
    buttonColorText,
    setButtonColorText,
    buttonBgColorText,
    setButtonBgColorText,
    handleHexChange,
  } = useDesignState({
    timerType,
    initialConfig: designConfig,
    onConfigChange: setDesignConfig,
  });

  // Create refs for hidden inputs to trigger data-save-bar
  const bgColorInputRef = useRef<HTMLInputElement>(null);
  const borderColorInputRef = useRef<HTMLInputElement>(null);
  const titleColorInputRef = useRef<HTMLInputElement>(null);
  const subheadingColorInputRef = useRef<HTMLInputElement>(null);
  const timerColorInputRef = useRef<HTMLInputElement>(null);
  const legendColorInputRef = useRef<HTMLInputElement>(null);
  const buttonColorInputRef = useRef<HTMLInputElement>(null);
  const buttonBgColorInputRef = useRef<HTMLInputElement>(null);

  // Trigger change events on hidden inputs when colors change
  useEffect(() => {
    if (bgColorInputRef.current) {
      bgColorInputRef.current.value = bgColorText;
      bgColorInputRef.current.dispatchEvent(
        new Event("input", { bubbles: true }),
      );
    }
  }, [bgColorText]);

  useEffect(() => {
    if (borderColorInputRef.current) {
      borderColorInputRef.current.value = borderColorText;
      borderColorInputRef.current.dispatchEvent(
        new Event("input", { bubbles: true }),
      );
    }
  }, [borderColorText]);

  useEffect(() => {
    if (titleColorInputRef.current) {
      titleColorInputRef.current.value = titleColorText;
      titleColorInputRef.current.dispatchEvent(
        new Event("input", { bubbles: true }),
      );
    }
  }, [titleColorText]);

  useEffect(() => {
    if (subheadingColorInputRef.current) {
      subheadingColorInputRef.current.value = subheadingColorText;
      subheadingColorInputRef.current.dispatchEvent(
        new Event("input", { bubbles: true }),
      );
    }
  }, [subheadingColorText]);

  useEffect(() => {
    if (timerColorInputRef.current) {
      timerColorInputRef.current.value = timerColorText;
      timerColorInputRef.current.dispatchEvent(
        new Event("input", { bubbles: true }),
      );
    }
  }, [timerColorText]);

  useEffect(() => {
    if (legendColorInputRef.current) {
      legendColorInputRef.current.value = legendColorText;
      legendColorInputRef.current.dispatchEvent(
        new Event("input", { bubbles: true }),
      );
    }
  }, [legendColorText]);

  useEffect(() => {
    if (buttonColorInputRef.current) {
      buttonColorInputRef.current.value = buttonColorText;
      buttonColorInputRef.current.dispatchEvent(
        new Event("input", { bubbles: true }),
      );
    }
  }, [buttonColorText]);

  useEffect(() => {
    if (buttonBgColorInputRef.current) {
      buttonBgColorInputRef.current.value = buttonBgColorText;
      buttonBgColorInputRef.current.dispatchEvent(
        new Event("input", { bubbles: true }),
      );
    }
  }, [buttonBgColorText]);

  return (
    <FormLayout>
      {timerType === "top-bottom-bar" && (
        <BlockStack gap="400">
          <Select
            label="Positioning"
            options={[
              { label: "Top page", value: "top" },
              { label: "Bottom page", value: "bottom" },
            ]}
            value={positioning}
            onChange={(value) => setPositioning(value as any)}
          />
          <Bleed marginInline={"400"}>
            <Divider />
          </Bleed>
        </BlockStack>
      )}
      <BlockStack gap="400">
        <Text as="h4" variant="headingSm" fontWeight="semibold">
          Card
        </Text>
        <BlockStack gap="200">
          <RadioButton
            label="Single color background"
            checked={backgroundType === "single"}
            id="single"
            name="backgroundType"
            onChange={() => setBackgroundType("single")}
          />
          {backgroundType === "single" && (
            <s-color-field
              name="bgColor"
              value={bgColorText}
              defaultValue={bgColorText}
              onChange={() => setBgColorText}
              autocomplete="off"
            />
          )}
        </BlockStack>
        <InlineGrid columns={2} gap="200">
          <s-number-field
            label="Border radius"
            value={borderRadius}
            defaultValue={borderRadius}
            onChange={() => setBorderRadius}
            autocomplete="off"
            suffix="px"
            inputMode="numeric"
            min={0}
            max={100}
          />
          <s-number-field
            label="Border size"
            value={borderSize}
            defaultValue={borderSize}
            onChange={() => setBorderSize}
            autocomplete="off"
            suffix="px"
            inputMode="numeric"
            min={0}
            max={100}
          />
        </InlineGrid>
        <Box>
          <BlockStack gap="100">
            <Text as="p" variant="bodyMd">
              Border color
            </Text>
            <s-color-field
              name="borderColor"
              value={borderColorText}
              defaultValue={borderColorText}
              onChange={() => setBorderColorText}
              autocomplete="off"
            />
          </BlockStack>
        </Box>
        {timerType !== "top-bottom-bar" && (
          <BlockStack gap="400">
            <Bleed marginInline={"400"}>
              <Divider />
            </Bleed>
            <Text as="p" variant="bodyMd" fontWeight="medium">
              Spacing
            </Text>
            <InlineGrid columns={2} gap="200">
              <s-number-field
                label="Inside top"
                value={insideTop}
                defaultValue={insideTop}
                onChange={() => setInsideTop}
                autocomplete="off"
                suffix="px"
                inputMode="numeric"
                min={0}
                max={100}
              />
              <s-number-field
                label="Inside bottom"
                value={insideBottom}
                defaultValue={insideBottom}
                onChange={() => setInsideBottom}
                autocomplete="off"
                suffix="px"
                inputMode="numeric"
                min={0}
                max={100}
              />
            </InlineGrid>

            <InlineGrid columns={2} gap="200">
              <s-number-field
                label="Outside top"
                value={outsideTop}
                defaultValue={outsideTop}
                onChange={() => setOutsideTop}
                autocomplete="off"
                suffix="px"
                inputMode="numeric"
                min={0}
                max={100}
              />
              <s-number-field
                label="Outside bottom"
                value={outsideBottom}
                defaultValue={outsideBottom}
                onChange={() => setOutsideBottom}
                autocomplete="off"
                suffix="px"
                inputMode="numeric"
                min={0}
                max={100}
              />
            </InlineGrid>
          </BlockStack>
        )}
      </BlockStack>
      <Bleed marginInline={"400"}>
        <Divider />
      </Bleed>
      <BlockStack gap="400">
        <Text as="h4" variant="headingSm" fontWeight="semibold">
          Typography
        </Text>
        <BlockStack gap="200">
          <Text as="p" variant="bodyMd">
            Title size and color
          </Text>
          <InlineStack gap="200" blockAlign="stretch" wrap={false}>
            <s-number-field
              label="Title size"
              labelAccessibilityVisibility="exclusive"
              value={titleSize}
              defaultValue={titleSize}
              onChange={() => setTitleSize}
              autocomplete="off"
              suffix="px"
              inputMode="numeric"
              min={0}
              max={100}
            />
            <s-color-field
              name="titleColor"
              value={titleColorText}
              defaultValue={titleColorText}
              onChange={() => setTitleColorText}
              autocomplete="off"
            />
          </InlineStack>
        </BlockStack>

        <BlockStack gap="200">
          <Text as="p" variant="bodyMd">
            Subheading size and color
          </Text>
          <InlineStack gap="200" blockAlign="stretch" wrap={false}>
            <s-number-field
              label="Subheading size"
              labelAccessibilityVisibility="exclusive"
              value={subheadingSize}
              defaultValue={subheadingSize}
              onChange={() => setSubheadingSize}
              autocomplete="off"
              suffix="px"
              inputMode="numeric"
              min={0}
              max={100}
            />
            <s-color-field
              name="subHeadingColor"
              value={subheadingColorText}
              defaultValue={subheadingColorText}
              onChange={() => setSubheadingColorText}
              autocomplete="off"
            />
          </InlineStack>
        </BlockStack>

        <BlockStack gap="200">
          <Text as="p" variant="bodyMd">
            Timer size and color
          </Text>
          <InlineStack gap="200" blockAlign="stretch" wrap={false}>
            <s-number-field
              label="Timer size"
              labelAccessibilityVisibility="exclusive"
              value={timerSize}
              defaultValue={timerSize}
              onChange={() => setTimerSize}
              autocomplete="off"
              suffix="px"
              inputMode="numeric"
              min={0}
              max={100}
            />
            <s-color-field
              name="timerColor"
              value={timerColorText}
              defaultValue={timerColorText}
              onChange={() => setTimerColorText}
              autocomplete="off"
            />
          </InlineStack>
        </BlockStack>

        <BlockStack gap="200">
          <Text as="p" variant="bodyMd">
            Legend size and color
          </Text>
          <InlineStack gap="200" blockAlign="stretch" wrap={false}>
            <s-number-field
              label="Legend size"
              labelAccessibilityVisibility="exclusive"
              value={legendSize}
              defaultValue={legendSize}
              onChange={() => setLegendSize}
              autocomplete="off"
              suffix="px"
              inputMode="numeric"
              min={0}
              max={100}
            />
            <s-color-field
              name="legendColor"
              value={legendColorText}
              defaultValue={legendColorText}
              onChange={() => setLegendColorText}
              autocomplete="off"
            />
          </InlineStack>
        </BlockStack>
      </BlockStack>
      {timerType === "top-bottom-bar" && (
        <BlockStack gap="400">
          <Bleed marginInline={"400"}>
            <Divider />
          </Bleed>
          <Text as="h4" variant="headingSm" fontWeight="semibold">
            Button
          </Text>
          <BlockStack gap="100">
            <Text as="p" variant="bodyMd">
              Button background color
            </Text>
            <InlineStack gap="200" blockAlign="stretch" wrap={false}>
              <Popover
                active={buttonBgColorPopover}
                activator={
                  <button
                    type="button"
                    onClick={toggleBorderColorPopover}
                    style={{ backgroundColor: hsbToHex(borderColor) }}
                    className="min-h-8 min-w-11 border border-[#e1e3e5] cursor-pointer rounded-md"
                  />
                }
                onClose={toggleButtonBgColorPopover}
              >
                <Box padding="200">
                  <ColorPicker
                    color={buttonBackgroundColor}
                    onChange={setButtonBackgroundColor}
                  />
                </Box>
              </Popover>
              <Box width="100%">
                <TextField
                  label="Button background color"
                  labelHidden
                  value={buttonBgColorText}
                  onChange={setButtonBgColorText}
                  onBlur={() =>
                    handleHexChange(
                      buttonBgColorText,
                      setButtonBackgroundColor,
                      setButtonBgColorText,
                    )
                  }
                  autoComplete="off"
                />
              </Box>
            </InlineStack>
          </BlockStack>
          <BlockStack gap="100">
            <Text as="p" variant="bodyMd">
              Button font size and color
            </Text>
            <InlineStack gap="200" blockAlign="stretch" wrap={false}>
              <div style={{ width: "110px" }}>
                <TextField
                  label="Button font size"
                  labelHidden
                  value={buttonFontSize}
                  onChange={setButtonFontSize}
                  autoComplete="off"
                  suffix="px"
                  type="number"
                />
              </div>
              <Popover
                active={buttonColorPopover}
                activator={
                  <button
                    type="button"
                    onClick={toggleButtonColorPopover}
                    style={{ backgroundColor: hsbToHex(buttonColor) }}
                    className="min-h-8 min-w-11 border border-[#e1e3e5] cursor-pointer rounded-md shrink-0"
                  />
                }
                onClose={toggleButtonColorPopover}
              >
                <Box padding="200">
                  <ColorPicker color={buttonColor} onChange={setButtonColor} />
                </Box>
              </Popover>
              <div className="flex-1">
                <TextField
                  label="Button color"
                  labelHidden
                  value={buttonColorText}
                  onChange={setButtonColorText}
                  onBlur={() =>
                    handleHexChange(
                      buttonColorText,
                      setButtonColor,
                      setButtonColorText,
                    )
                  }
                  autoComplete="off"
                />
              </div>
            </InlineStack>
          </BlockStack>
          <BlockStack gap="100">
            <Text as="p" variant="bodyMd">
              Corner radius
            </Text>
            <InlineStack gap="200" blockAlign="stretch" wrap={false}>
              <div style={{ width: "110px" }}>
                <TextField
                  label="Corner radius"
                  labelHidden
                  value={cornerRadius}
                  onChange={setCornerRadius}
                  autoComplete="off"
                  suffix="px"
                  type="number"
                />
              </div>
            </InlineStack>
          </BlockStack>
        </BlockStack>
      )}
      <Bleed marginInline={"400"}>
        <Divider />
      </Bleed>
      <Button fullWidth onClick={onContinue}>
        Continue to Placement
      </Button>
    </FormLayout>
  );
}
