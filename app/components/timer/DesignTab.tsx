import {
  BlockStack,
  Text,
  Card,
  Button,
  RadioButton,
  InlineGrid,
  InlineStack,
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
    fontFamily,
    setFontFamily,
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

  const handleColorInput =
    (setter: (color: string) => void) => (value: any) => {
      const raw = (typeof value === "string" ? value : getValue(value)).trim();
      // Only commit to state for a complete 6-char hex — ignore partial values
      // so the initialConfig sync useEffect never sees an empty/partial color
      // and triggers the || default fallback with a wrong color
      if (/^#?[A-Fa-f0-9]{6}$/.test(raw)) {
        setter(`#${raw.replace("#", "").toLowerCase()}`);
      }
    };

  const handleColorChange =
    (setter: (color: string) => void) => (value: any) => {
      const colorValue = typeof value === "string" ? value : getValue(value);
      const normalized = normalizeColorValue(colorValue);
      if (normalized) setter(normalized);
    };

  const getColorFieldProps = (setter: (color: string) => void) => ({
    onInput: handleColorInput(setter),
    onChange: handleColorChange(setter),
  });

  return (
    <BlockStack gap="400">
      {timerType === "top-bottom-bar" && (
        <Card padding="400">
          <s-select
            label="Positioning"
            value={positioning}
            onInput={(e) => setPositioning(getValue(e))}
          >
            <s-option value="top">Top page</s-option>
            <s-option value="bottom">Bottom page</s-option>
          </s-select>
        </Card>
      )}

      <Card padding="400">
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
                autocomplete="off"
                {...getColorFieldProps(setBackgroundColor)}
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
          <BlockStack gap="100">
            <Text as="p" variant="bodyMd">
              Border color
            </Text>
            <s-color-field
              name="borderColor"
              value={borderColor}
              autocomplete="off"
              {...getColorFieldProps(setBorderColor)}
            />
          </BlockStack>
        </BlockStack>
      </Card>

      {timerType !== "top-bottom-bar" && (
        <Card padding="400">
          <BlockStack gap="400">
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
        </Card>
      )}

      <Card padding="400">
        <BlockStack gap="400">
          <Text as="h4" variant="headingSm" fontWeight="semibold">
            Typography
          </Text>
          <s-select
            label="Font"
            value={fontFamily}
            onInput={(e) => setFontFamily(getValue(e))}
          >
            <s-option value="theme">Use your theme fonts</s-option>
            <s-option value="Helvetica">Helvetica</s-option>
            <s-option value="Tahoma">Tahoma</s-option>
<s-option value="Courier New">Courier New</s-option>
          </s-select>
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
                autocomplete="off"
                {...getColorFieldProps(setTitleColor)}
              />
            </InlineStack>
          </BlockStack>

          {timerType !== "top-bottom-bar" && (
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
                  onInput={(e) => setSubheadingSize(getValue(e))}
                  autocomplete="off"
                  suffix="px"
                  inputMode="numeric"
                  min={0}
                  max={100}
                />
                <s-color-field
                  name="subheadingColor"
                  value={subheadingColor}
                  autocomplete="off"
                  {...getColorFieldProps(setSubheadingColor)}
                />
              </InlineStack>
            </BlockStack>
          )}

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
                autocomplete="off"
                {...getColorFieldProps(setTimerColor)}
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
                autocomplete="off"
                {...getColorFieldProps(setLegendColor)}
              />
            </InlineStack>
          </BlockStack>
        </BlockStack>
      </Card>

      {timerType === "top-bottom-bar" && callToAction === "button" && (
        <Card padding="400">
          <BlockStack gap="400">
            <Text as="h4" variant="headingSm" fontWeight="semibold">
              Button
            </Text>
            <s-color-field
              name="Button background color"
              value={buttonBackgroundColor}
              autocomplete="off"
              {...getColorFieldProps(setButtonBackgroundColor)}
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
                  autocomplete="off"
                  {...getColorFieldProps(setButtonColor)}
                />
              </InlineStack>
            </BlockStack>
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
          </BlockStack>
        </Card>
      )}

      <Button fullWidth onClick={onContinue} size="large">
        Continue to Placement
      </Button>
    </BlockStack>
  );
}
