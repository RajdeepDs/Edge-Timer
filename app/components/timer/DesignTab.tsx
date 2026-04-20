import { useState, useCallback, useRef } from "react";
import {
  BlockStack,
  Text,
  Card,
  Button,
  RadioButton,
  RangeSlider,
  InlineGrid,
  InlineStack,
} from "@shopify/polaris";
import type { DesignConfig } from "../../types/timer";
import { useDesignState } from "../../hooks/useDesignState";
import ColorField from "../ui/ColorField";

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
    selectedTemplate,
    setSelectedTemplate,
    fontFamily,
    setFontFamily,
    positioning,
    setPositioning,
    backgroundType,
    setBackgroundType,
    backgroundColor,
    setBackgroundColor,
    gradientStartColor,
    setGradientStartColor,
    gradientEndColor,
    setGradientEndColor,
    gradientAngle,
    setGradientAngle,
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

  // Local state for slider — decoupled from hook to avoid re-render feedback jitter
  const [localAngle, setLocalAngle] = useState(gradientAngle);

  const isApplyingTemplate = useRef(false);

  type TemplateConfig = {
    backgroundType?: "single" | "gradient";
    backgroundColor?: string;
    gradientStartColor?: string;
    gradientEndColor?: string;
    gradientAngle?: number;
    titleColor?: string;
    subheadingColor?: string;
    timerColor?: string;
    legendColor?: string;
    borderRadius?: string;
    borderSize?: string;
    borderColor?: string;
  };

  const TEMPLATES: Record<string, TemplateConfig> = {
    Custom: {
      backgroundType: "single",
      backgroundColor: "#ffffff",
      gradientStartColor: "#ffffff",
      gradientEndColor: "#dddddd",
      gradientAngle: 90,
      titleColor: "#212121",
      subheadingColor: "#212121",
      timerColor: "#212121",
      legendColor: "#707070",
      borderRadius: "8",
      borderSize: "0",
      borderColor: "#d1d5db",
    },
    Dawn: {
      backgroundType: "gradient",
      gradientStartColor: "#fff7ed",
      gradientEndColor: "#fed7aa",
      gradientAngle: 135,
      titleColor: "#c2410c",
      subheadingColor: "#9a3412",
      timerColor: "#ea580c",
      legendColor: "#9a3412",
      borderRadius: "12",
      borderSize: "0",
    },
    Forest: {
      backgroundType: "single",
      backgroundColor: "#14532d",
      titleColor: "#ffffff",
      subheadingColor: "#bbf7d0",
      timerColor: "#4ade80",
      legendColor: "#86efac",
      borderRadius: "8",
      borderSize: "0",
    },
    "Shades of Gray": {
      backgroundType: "single",
      backgroundColor: "#f3f4f6",
      titleColor: "#111827",
      subheadingColor: "#374151",
      timerColor: "#4b5563",
      legendColor: "#9ca3af",
      borderRadius: "8",
      borderSize: "1",
      borderColor: "#d1d5db",
    },
    Neon: {
      backgroundType: "single",
      backgroundColor: "#0a0a0a",
      titleColor: "#39ff14",
      subheadingColor: "#ffffff",
      timerColor: "#00ffff",
      legendColor: "#ff00ff",
      borderRadius: "4",
      borderSize: "1",
      borderColor: "#39ff14",
    },
    "Black and Yellow": {
      backgroundType: "single",
      backgroundColor: "#000000",
      titleColor: "#fde047",
      subheadingColor: "#fde047",
      timerColor: "#fde047",
      legendColor: "#ffffff",
      borderRadius: "4",
      borderSize: "0",
    },
  };

  const handleTemplateChange = useCallback(
    (template: string) => {
      setSelectedTemplate(template);
      const t = TEMPLATES[template];
      if (!t) return;
      isApplyingTemplate.current = true;
      if (t.backgroundType !== undefined) setBackgroundType(t.backgroundType);
      if (t.backgroundColor !== undefined)
        setBackgroundColor(t.backgroundColor);
      if (t.gradientStartColor !== undefined)
        setGradientStartColor(t.gradientStartColor);
      if (t.gradientEndColor !== undefined)
        setGradientEndColor(t.gradientEndColor);
      if (t.gradientAngle !== undefined) {
        setGradientAngle(t.gradientAngle);
        setLocalAngle(t.gradientAngle);
      }
      if (t.titleColor !== undefined) setTitleColor(t.titleColor);
      if (t.subheadingColor !== undefined)
        setSubheadingColor(t.subheadingColor);
      if (t.timerColor !== undefined) setTimerColor(t.timerColor);
      if (t.legendColor !== undefined) setLegendColor(t.legendColor);
      if (t.borderRadius !== undefined) setBorderRadius(t.borderRadius);
      if (t.borderSize !== undefined) setBorderSize(t.borderSize);
      if (t.borderColor !== undefined) setBorderColor(t.borderColor);
      isApplyingTemplate.current = false;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      setBackgroundType,
      setBackgroundColor,
      setGradientStartColor,
      setGradientEndColor,
      setGradientAngle,
      setTitleColor,
      setSubheadingColor,
      setTimerColor,
      setLegendColor,
      setBorderRadius,
      setBorderSize,
      setBorderColor,
    ],
  );

  const handleAngleChange = useCallback(
    (value: number | [number, number]) => {
      const v = value as number;
      setLocalAngle(v);
      setGradientAngle(v);
    },
    [setGradientAngle],
  );

  const getValue = (event: any) =>
    event?.detail?.value ??
    event?.currentTarget?.value ??
    event?.target?.value ??
    "";

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
            Template
          </Text>
          <s-select
            label="Style"
            value={selectedTemplate}
            onInput={(e) => handleTemplateChange(getValue(e))}
          >
            <s-option value="Custom">Custom</s-option>
            <s-option value="Dawn">Dawn</s-option>
            <s-option value="Forest">Forest</s-option>
            <s-option value="Shades of Gray">Shades of Gray</s-option>
            <s-option value="Neon">Neon</s-option>
            <s-option value="Black and Yellow">Black and Yellow</s-option>
          </s-select>
        </BlockStack>
      </Card>

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
              <ColorField value={backgroundColor} onChange={setBackgroundColor} />
            )}
            <RadioButton
              label="Gradient background"
              checked={backgroundType === "gradient"}
              id="gradient"
              name="backgroundType"
              onChange={() => setBackgroundType("gradient")}
            />
            {backgroundType === "gradient" && (
              <BlockStack gap="300">
                <RangeSlider
                  label="Gradient angle"
                  value={localAngle}
                  min={0}
                  step={1}
                  max={360}
                  onChange={handleAngleChange}
                  output
                />
                <InlineGrid columns={2} gap="200">
                  <BlockStack gap="100">
                    <Text as="p" variant="bodySm">
                      Start color
                    </Text>
                    <ColorField value={gradientStartColor} onChange={setGradientStartColor} />
                  </BlockStack>
                  <BlockStack gap="100">
                    <Text as="p" variant="bodySm">
                      End color
                    </Text>
                    <ColorField value={gradientEndColor} onChange={setGradientEndColor} />
                  </BlockStack>
                </InlineGrid>
              </BlockStack>
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
            <ColorField value={borderColor} onChange={setBorderColor} />
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
              <ColorField value={titleColor} onChange={setTitleColor} />
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
                <ColorField value={subheadingColor} onChange={setSubheadingColor} />
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
              <ColorField value={timerColor} onChange={setTimerColor} />
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
              <ColorField value={legendColor} onChange={setLegendColor} />
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
            <ColorField value={buttonBackgroundColor} onChange={setButtonBackgroundColor} label="Button background color" />
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
                <ColorField value={buttonColor} onChange={setButtonColor} />
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
