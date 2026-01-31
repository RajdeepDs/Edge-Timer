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
    subheadingSize,
    setSubheadingSize,
    subheadingColor,
    setSubheadingColor,
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
    event?.detail?.value ?? event?.target?.value ?? "";

  return (
    <FormLayout>
      {timerType === "top-bottom-bar" && (
        <BlockStack gap="400">
          <s-select
            label="Positioning"
            value={positioning}
            onChange={(value) => setPositioning(value as any)}
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
              defaultValue={backgroundColor}
              onChange={(value) => setBackgroundColor(getValue(value))}
              autocomplete="off"
            />
          )}
        </BlockStack>
        <InlineGrid columns={2} gap="200">
          <s-number-field
            label="Border radius"
            value={borderRadius}
            defaultValue={borderRadius}
            onChange={(e) => setBorderRadius(getValue(e))}
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
            onChange={(e) => setBorderSize(getValue(e))}
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
              defaultValue={borderColor}
              onChange={(e) => setBorderColor(getValue(e))}
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
                onChange={(e) => setInsideTop(getValue(e))}
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
                onChange={(e) => setInsideBottom(getValue(e))}
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
                onChange={(e) => setOutsideTop(getValue(e))}
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
                onChange={(e) => setOutsideBottom(getValue(e))}
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
              onChange={(e) => setTitleSize(getValue(e))}
              autocomplete="off"
              suffix="px"
              inputMode="numeric"
              min={0}
              max={100}
            />
            <s-color-field
              name="titleColor"
              value={titleColor}
              defaultValue={titleColor}
              onChange={(e) => setTitleColor(getValue(e))}
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
              onChange={(e) => setSubheadingSize(getValue(e))}
              autocomplete="off"
              suffix="px"
              inputMode="numeric"
              min={0}
              max={100}
            />
            <s-color-field
              name="subHeadingColor"
              value={subheadingColor}
              defaultValue={subheadingColor}
              onChange={(e) => setSubheadingColor(getValue(e))}
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
              onChange={(e) => setTimerSize(getValue(e))}
              autocomplete="off"
              suffix="px"
              inputMode="numeric"
              min={0}
              max={120}
            />
            <s-color-field
              name="timerColor"
              value={timerColor}
              defaultValue={timerColor}
              onChange={(e) => setTimerColor(getValue(e))}
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
              onChange={(e) => setLegendSize(getValue(e))}
              autocomplete="off"
              suffix="px"
              inputMode="numeric"
              min={0}
              max={100}
            />
            <s-color-field
              name="legendColor"
              value={legendColor}
              defaultValue={legendColor}
              onChange={(e) => setLegendColor(getValue(e))}
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
          <s-color-field
            name="Button background color"
            value={buttonBackgroundColor}
            defaultValue={buttonBackgroundColor}
            onChange={(e) => setButtonBackgroundColor(getValue(e))}
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
                onChange={(e) => setButtonFontSize(getValue(e))}
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
                defaultValue={buttonColor}
                onChange={(e) => setButtonColor(getValue(e))}
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
                onChange={(e) => setCornerRadius(getValue(e))}
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
