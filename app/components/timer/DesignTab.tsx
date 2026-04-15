import {
  BlockStack,
  Text,
  Box,
  FormLayout,
  Button,
  RadioButton,
  InlineGrid,
  InlineStack,
  Divider,
  Bleed,
} from "@shopify/polaris";
import type { DesignConfig } from "../../types/timer";
import { useDesignState } from "../../hooks/useDesignState";
import { isValidHex, normalizeHex } from "../../utils/timer/color";

interface DesignTabProps {
  timerType: "product" | "top-bottom-bar";
  designConfig: DesignConfig;
  setDesignConfig: (config: DesignConfig) => void;
  onContinue: () => void;
  callToAction?: "no" | "button" | "clickable";
}

export default function DesignTab({
  timerType,
  designConfig,
  setDesignConfig,
  onContinue,
  callToAction,
}: DesignTabProps) {
  const {
    positioning,
    setPositioning,
    backgroundType,
    setBackgroundType,
    backgroundColor,
    setBackgroundColor,
    borderRadius,
    setBorderRadius,
    borderSize,
    setBorderSize,
    borderColor,
    setBorderColor,
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
    titleColor,
    setTitleColor,
    timerSize,
    setTimerSize,
    timerColor,
    setTimerColor,
    legendSize,
    setLegendSize,
    legendColor,
    setLegendColor,
    buttonFontSize,
    setButtonFontSize,
    buttonColor,
    setButtonColor,
    buttonBackgroundColor,
    setButtonBackgroundColor,
    cornerRadius,
    setCornerRadius,
  } = useDesignState({
    timerType,
    initialConfig: designConfig,
    onConfigChange: setDesignConfig,
  });

  const getValue = (event: any) =>
    event?.detail?.value ??
    event?.currentTarget?.value ??
    event?.target?.value ??
    "";

  const normalizeColorValue = (value: string) => {
    const trimmed = value.trim();

    if (trimmed === "") {
      return "";
    }

    return isValidHex(trimmed) ? normalizeHex(trimmed) : trimmed;
  };

  const handleColorChange =
    (setter: (color: string) => void) => (value: any) => {
      const colorValue = typeof value === "string" ? value : getValue(value);
      setter(normalizeColorValue(colorValue));
    };

  return (
    <FormLayout>
      {timerType === "top-bottom-bar" && (
        <BlockStack gap="400">
          <s-select
            label="Positioning"
            value={positioning}
            onInput={(e) => setPositioning(getValue(e))}
          >
            <s-option value="top">Top page</s-option>
            <s-option value="bottom">Bottom page</s-option>
          </s-select>
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
              value={backgroundColor}
              onInput={handleColorChange(setBackgroundColor)}
              autocomplete="off"
            />
          )}
        </BlockStack>
        <InlineGrid columns={2} gap="200">
          <s-number-field
            label="Border radius"
            value={borderRadius}
            defaultValue={borderRadius}
            onInput={(e) => setBorderRadius(getValue(e))}
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
            onInput={(e) => setBorderSize(getValue(e))}
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
              value={borderColor}
              onInput={handleColorChange(setBorderColor)}
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
                onInput={(e) => setInsideTop(getValue(e))}
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
                onInput={(e) => setInsideBottom(getValue(e))}
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
                onInput={(e) => setOutsideTop(getValue(e))}
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
                onInput={(e) => setOutsideBottom(getValue(e))}
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
              onInput={(e) => setTitleSize(getValue(e))}
              autocomplete="off"
              suffix="px"
              inputMode="numeric"
              min={0}
              max={100}
            />
            <s-color-field
              name="titleColor"
              value={titleColor}
              onInput={handleColorChange(setTitleColor)}
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
              onInput={(e) => setTimerSize(getValue(e))}
              autocomplete="off"
              suffix="px"
              inputMode="numeric"
              min={0}
              max={120}
            />
            <s-color-field
              name="timerColor"
              value={timerColor}
              onInput={handleColorChange(setTimerColor)}
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
              onInput={(e) => setLegendSize(getValue(e))}
              autocomplete="off"
              suffix="px"
              inputMode="numeric"
              min={0}
              max={100}
            />
            <s-color-field
              name="legendColor"
              value={legendColor}
              onInput={handleColorChange(setLegendColor)}
              autocomplete="off"
            />
          </InlineStack>
        </BlockStack>
      </BlockStack>
      {timerType === "top-bottom-bar" && callToAction === "button" && (
        <BlockStack gap="400">
          <Bleed marginInline={"400"}>
            <Divider />
          </Bleed>
          <Text as="h4" variant="headingSm" fontWeight="semibold">
            Button
          </Text>
          <s-color-field
            name="Button background color"
            value={buttonBackgroundColor}
            onInput={handleColorChange(setButtonBackgroundColor)}
            autocomplete="off"
          />
          <BlockStack gap="100">
            <Text as="p" variant="bodyMd">
              Button font size and color
            </Text>
            <InlineStack gap="200" blockAlign="stretch" wrap={false}>
              <s-number-field
                label="Button font size"
                labelAccessibilityVisibility="exclusive"
                value={buttonFontSize}
                defaultValue={buttonFontSize}
                onInput={(e) => setButtonFontSize(getValue(e))}
                autocomplete="off"
                suffix="px"
                inputMode="numeric"
                min={0}
                max={100}
              />
              <s-color-field
                name="Button Color"
                labelAccessibilityVisibility="exclusive"
                value={buttonColor}
                onInput={handleColorChange(setButtonColor)}
                autocomplete="off"
              />
            </InlineStack>
          </BlockStack>
          <BlockStack gap="100">
            <InlineStack gap="200" blockAlign="stretch" wrap={false}>
              <s-number-field
                label="Corner radius"
                value={cornerRadius}
                defaultValue={cornerRadius}
                onInput={(e) => setCornerRadius(getValue(e))}
                autocomplete="off"
                suffix="px"
                inputMode="numeric"
                min={0}
                max={100}
              />
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
