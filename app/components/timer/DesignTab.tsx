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
import { useState, useCallback, useEffect } from "react";
import type { DesignConfig, ColorHSBA } from "../../types/timer";

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
  // Helper functions for color conversion
  const hexToHsb = (hex: string): ColorHSBA => {
    // Remove # if present
    const cleanHex = hex.replace("#", "");

    // Parse hex to RGB
    const r = parseInt(cleanHex.substring(0, 2), 16) / 255;
    const g = parseInt(cleanHex.substring(2, 4), 16) / 255;
    const b = parseInt(cleanHex.substring(4, 6), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const delta = max - min;

    let hue = 0;
    let saturation = 0;
    const brightness = max;

    if (delta !== 0) {
      saturation = delta / max;

      if (max === r) {
        hue = ((g - b) / delta + (g < b ? 6 : 0)) * 60;
      } else if (max === g) {
        hue = ((b - r) / delta + 2) * 60;
      } else {
        hue = ((r - g) / delta + 4) * 60;
      }
    }

    return {
      hue: Math.round(hue),
      saturation: Math.round(saturation * 100) / 100,
      brightness: Math.round(brightness * 100) / 100,
      alpha: 1,
    };
  };

  const hsbToHex = (hsb: ColorHSBA): string => {
    const { hue, saturation, brightness } = hsb;
    const h = hue;
    const s = saturation;
    const v = brightness;

    const c = v * s;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = v - c;

    let r = 0,
      g = 0,
      b = 0;

    if (h >= 0 && h < 60) {
      r = c;
      g = x;
      b = 0;
    } else if (h >= 60 && h < 120) {
      r = x;
      g = c;
      b = 0;
    } else if (h >= 120 && h < 180) {
      r = 0;
      g = c;
      b = x;
    } else if (h >= 180 && h < 240) {
      r = 0;
      g = x;
      b = c;
    } else if (h >= 240 && h < 300) {
      r = x;
      g = 0;
      b = c;
    } else if (h >= 300 && h < 360) {
      r = c;
      g = 0;
      b = x;
    }

    const toHex = (n: number) => {
      const hex = Math.round((n + m) * 255).toString(16);
      return hex.length === 1 ? "0" + hex : hex;
    };

    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  };

  // Helper to handle hex input from text fields
  const handleHexChange = (
    value: string,
    setter: (color: ColorHSBA) => void,
  ) => {
    // Allow typing but only convert when it's a valid 6-character hex
    // This allows users to type intermediate values
    if (!value.startsWith("#") && value.length > 0) {
      value = "#" + value;
    }

    // Only process if it's a complete valid hex color
    const hexPattern = /^#([A-Fa-f0-9]{6})$/;
    const match = value.match(hexPattern);

    if (match) {
      const hsb = hexToHsb(value);
      setter(hsb);
    }
    // If not valid yet, we don't update (allows partial typing)
  };

  // Local state for UI controls
  const [positioning, setPositioning] = useState(
    designConfig.positioning || "top",
  );
  const [backgroundType, setBackgroundType] = useState(
    designConfig.backgroundType || "single",
  );
  const [backgroundColor, setBackgroundColor] = useState<ColorHSBA>(
    designConfig.backgroundColor
      ? hexToHsb(designConfig.backgroundColor)
      : { hue: 0, saturation: 0, brightness: 1, alpha: 1 },
  );
  const [bgColorPopover, setBgColorPopover] = useState(false);
  const [bgColorText, setBgColorText] = useState(
    designConfig.backgroundColor || "#ffffff",
  );

  const [borderRadius, setBorderRadius] = useState(
    designConfig.borderRadius?.toString() || "8",
  );
  const [borderSize, setBorderSize] = useState(
    designConfig.borderSize?.toString() || "0",
  );
  const [borderColor, setBorderColor] = useState<ColorHSBA>(
    designConfig.borderColor
      ? hexToHsb(designConfig.borderColor)
      : { hue: 220, saturation: 0.16, brightness: 0.82, alpha: 1 },
  );
  const [borderColorPopover, setBorderColorPopover] = useState(false);
  const [borderColorText, setBorderColorText] = useState(
    designConfig.borderColor || "#d1d5db",
  );

  const [insideTop, setInsideTop] = useState(
    designConfig.paddingTop?.toString() || "30",
  );
  const [insideBottom, setInsideBottom] = useState(
    designConfig.paddingBottom?.toString() || "30",
  );
  const [outsideTop, setOutsideTop] = useState(
    designConfig.marginTop?.toString() || "20",
  );
  const [outsideBottom, setOutsideBottom] = useState(
    designConfig.marginBottom?.toString() || "20",
  );

  // Typography states
  const [titleSize, setTitleSize] = useState(
    designConfig.titleSize?.toString() || "28",
  );
  const [titleColor, setTitleColor] = useState<ColorHSBA>(
    designConfig.titleColor
      ? hexToHsb(designConfig.titleColor)
      : { hue: 0, saturation: 0, brightness: 0.13, alpha: 1 },
  );
  const [titleColorPopover, setTitleColorPopover] = useState(false);
  const [titleColorText, setTitleColorText] = useState(
    designConfig.titleColor || "#212121",
  );

  const [subheadingSize, setSubheadingSize] = useState(
    designConfig.subheadingSize?.toString() || "16",
  );
  const [subheadingColor, setSubheadingColor] = useState<ColorHSBA>(
    designConfig.subheadingColor
      ? hexToHsb(designConfig.subheadingColor)
      : { hue: 0, saturation: 0, brightness: 0.13, alpha: 1 },
  );
  const [subheadingColorPopover, setSubheadingColorPopover] = useState(false);
  const [subheadingColorText, setSubheadingColorText] = useState(
    designConfig.subheadingColor || "#212121",
  );

  const [timerSize, setTimerSize] = useState(
    designConfig.timerSize?.toString() || "40",
  );
  const [timerColor, setTimerColor] = useState<ColorHSBA>(
    designConfig.timerColor
      ? hexToHsb(designConfig.timerColor)
      : { hue: 0, saturation: 0, brightness: 0.13, alpha: 1 },
  );
  const [timerColorPopover, setTimerColorPopover] = useState(false);
  const [timerColorText, setTimerColorText] = useState(
    designConfig.timerColor || "#212121",
  );

  const [legendSize, setLegendSize] = useState(
    designConfig.legendSize?.toString() || "14",
  );
  const [legendColor, setLegendColor] = useState<ColorHSBA>(
    designConfig.legendColor
      ? hexToHsb(designConfig.legendColor)
      : { hue: 0, saturation: 0, brightness: 0.44, alpha: 1 },
  );
  const [legendColorPopover, setLegendColorPopover] = useState(false);
  const [legendColorText, setLegendColorText] = useState(
    designConfig.legendColor || "#707070",
  );

  const [buttonFontSize, setButtonFontSize] = useState(
    designConfig.buttonFontSize?.toString() || "16",
  );
  const [cornerRadius, setCornerRadius] = useState(
    designConfig.buttonCornerRadius?.toString() || "4",
  );
  const [buttonColor, setButtonColor] = useState<ColorHSBA>(
    designConfig.buttonColor
      ? hexToHsb(designConfig.buttonColor)
      : { hue: 0, saturation: 0, brightness: 1, alpha: 1 },
  );
  const [buttonBackgroundColor, setButtonBackgroundColor] = useState<ColorHSBA>(
    designConfig.buttonBackgroundColor
      ? hexToHsb(designConfig.buttonBackgroundColor)
      : { hue: 220, saturation: 0.7, brightness: 0.95, alpha: 1 },
  );
  const [buttonColorPopover, setButtonColorPopover] = useState(false);
  const [buttonBgColorPopover, setButtonBgColorPopover] = useState(false);
  const [buttonColorText, setButtonColorText] = useState(
    designConfig.buttonColor || "#ffffff",
  );
  const [buttonBgColorText, setButtonBgColorText] = useState(
    designConfig.buttonBackgroundColor || "#5c6ac4",
  );

  // Update parent designConfig whenever local state changes
  useEffect(() => {
    const newConfig: DesignConfig = {
      positioning,
      backgroundType,
      backgroundColor: hsbToHex(backgroundColor),
      borderRadius: parseInt(borderRadius) || 0,
      borderSize: parseInt(borderSize) || 0,
      borderColor: hsbToHex(borderColor),
      paddingTop: parseInt(insideTop) || 0,
      paddingBottom: parseInt(insideBottom) || 0,
      marginTop: parseInt(outsideTop) || 0,
      marginBottom: parseInt(outsideBottom) || 0,
      titleSize: parseInt(titleSize) || 28,
      titleColor: hsbToHex(titleColor),
      subheadingSize: parseInt(subheadingSize) || 16,
      subheadingColor: hsbToHex(subheadingColor),
      timerSize: parseInt(timerSize) || 40,
      timerColor: hsbToHex(timerColor),
      legendSize: parseInt(legendSize) || 14,
      legendColor: hsbToHex(legendColor),
      buttonFontSize: parseInt(buttonFontSize) || 16,
      buttonCornerRadius: parseInt(cornerRadius) || 4,
      buttonColor: hsbToHex(buttonColor),
      buttonBackgroundColor: hsbToHex(buttonBackgroundColor),
    };
    setDesignConfig(newConfig);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    positioning,
    backgroundType,
    backgroundColor,
    borderRadius,
    borderSize,
    borderColor,
    insideTop,
    insideBottom,
    outsideTop,
    outsideBottom,
    titleSize,
    titleColor,
    subheadingSize,
    subheadingColor,
    timerSize,
    timerColor,
    legendSize,
    legendColor,
    buttonFontSize,
    cornerRadius,
    buttonColor,
    buttonBackgroundColor,
  ]);

  const toggleBgColorPopover = useCallback(
    () => setBgColorPopover((active) => !active),
    [],
  );

  const toggleBorderColorPopover = useCallback(
    () => setBorderColorPopover((active) => !active),
    [],
  );

  const toggleTitleColorPopover = useCallback(
    () => setTitleColorPopover((active) => !active),
    [],
  );

  const toggleSubheadingColorPopover = useCallback(
    () => setSubheadingColorPopover((active) => !active),
    [],
  );

  const toggleTimerColorPopover = useCallback(
    () => setTimerColorPopover((active) => !active),
    [],
  );

  const toggleLegendColorPopover = useCallback(
    () => setLegendColorPopover((active) => !active),
    [],
  );

  const toggleButtonColorPopover = useCallback(
    () => setButtonColorPopover((active) => !active),
    [],
  );

  const toggleButtonBgColorPopover = useCallback(
    () => setButtonBgColorPopover((active) => !active),
    [],
  );

  // Sync text fields with color picker changes
  useEffect(() => {
    setBgColorText(hsbToHex(backgroundColor));
  }, [backgroundColor]);

  useEffect(() => {
    setBorderColorText(hsbToHex(borderColor));
  }, [borderColor]);

  useEffect(() => {
    setTitleColorText(hsbToHex(titleColor));
  }, [titleColor]);

  useEffect(() => {
    setSubheadingColorText(hsbToHex(subheadingColor));
  }, [subheadingColor]);

  useEffect(() => {
    setTimerColorText(hsbToHex(timerColor));
  }, [timerColor]);

  useEffect(() => {
    setLegendColorText(hsbToHex(legendColor));
  }, [legendColor]);

  useEffect(() => {
    setButtonColorText(hsbToHex(buttonColor));
  }, [buttonColor]);

  useEffect(() => {
    setButtonBgColorText(hsbToHex(buttonBackgroundColor));
  }, [buttonBackgroundColor]);

  return (
    <FormLayout>
      {/* Hidden inputs for color values to track changes for save bar */}
      <input
        type="hidden"
        name="backgroundColor"
        value={hsbToHex(backgroundColor)}
      />
      <input type="hidden" name="borderColor" value={hsbToHex(borderColor)} />
      <input type="hidden" name="titleColor" value={hsbToHex(titleColor)} />
      <input
        type="hidden"
        name="subheadingColor"
        value={hsbToHex(subheadingColor)}
      />
      <input type="hidden" name="timerColor" value={hsbToHex(timerColor)} />
      <input type="hidden" name="legendColor" value={hsbToHex(legendColor)} />
      <input type="hidden" name="buttonColor" value={hsbToHex(buttonColor)} />
      <input
        type="hidden"
        name="buttonBackgroundColor"
        value={hsbToHex(buttonBackgroundColor)}
      />
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
            <InlineStack gap="200" blockAlign="stretch" wrap={false}>
              <Popover
                active={bgColorPopover}
                activator={
                  <button
                    type="button"
                    onClick={toggleBgColorPopover}
                    style={{ backgroundColor: hsbToHex(backgroundColor) }}
                    className="min-w-11 min-h-8 border border-[#e1e3e5] cursor-pointer rounded-md shrink-0"
                  />
                }
                onClose={toggleBgColorPopover}
              >
                <Box padding="400">
                  <ColorPicker
                    color={backgroundColor}
                    onChange={setBackgroundColor}
                  />
                </Box>
              </Popover>
              <div className="flex-1">
                <TextField
                  label="Color"
                  labelHidden
                  value={bgColorText}
                  onChange={setBgColorText}
                  onBlur={() =>
                    handleHexChange(bgColorText, setBackgroundColor)
                  }
                  autoComplete="off"
                />
              </div>
            </InlineStack>
          )}
        </BlockStack>
        <InlineGrid columns={2} gap="200">
          <TextField
            label="Border radius"
            value={borderRadius}
            onChange={setBorderRadius}
            autoComplete="off"
            suffix="px"
            type="number"
          />
          <TextField
            label="Border size"
            value={borderSize}
            onChange={setBorderSize}
            autoComplete="off"
            suffix="px"
            type="number"
          />
        </InlineGrid>
        <Box>
          <BlockStack gap="100">
            <Text as="p" variant="bodyMd">
              Border color
            </Text>
            <InlineStack gap="200" blockAlign="stretch" wrap={false}>
              <Popover
                active={borderColorPopover}
                activator={
                  <button
                    type="button"
                    onClick={toggleBorderColorPopover}
                    style={{ backgroundColor: hsbToHex(borderColor) }}
                    className="min-h-8 min-w-11 border border-[#e1e3e5] cursor-pointer rounded-md"
                  />
                }
                onClose={toggleBorderColorPopover}
              >
                <Box padding="400">
                  <ColorPicker color={borderColor} onChange={setBorderColor} />
                </Box>
              </Popover>
              <Box width="100%">
                <TextField
                  label="Border color"
                  labelHidden
                  value={borderColorText}
                  onChange={setBorderColorText}
                  onBlur={() =>
                    handleHexChange(borderColorText, setBorderColor)
                  }
                  autoComplete="off"
                />
              </Box>
            </InlineStack>
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
              <TextField
                label="Inside top"
                value={insideTop}
                onChange={setInsideTop}
                autoComplete="off"
                suffix="px"
                type="number"
              />
              <TextField
                label="Inside bottom"
                value={insideBottom}
                onChange={setInsideBottom}
                autoComplete="off"
                suffix="px"
                type="number"
              />
            </InlineGrid>

            <InlineGrid columns={2} gap="200">
              <TextField
                label="Outside top"
                value={outsideTop}
                onChange={setOutsideTop}
                autoComplete="off"
                suffix="px"
                type="number"
              />
              <TextField
                label="Outside bottom"
                value={outsideBottom}
                onChange={setOutsideBottom}
                autoComplete="off"
                suffix="px"
                type="number"
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
            <div style={{ width: "110px" }}>
              <TextField
                label="Title size"
                labelHidden
                value={titleSize}
                onChange={setTitleSize}
                autoComplete="off"
                suffix="px"
                type="number"
              />
            </div>
            <Popover
              active={titleColorPopover}
              activator={
                <button
                  type="button"
                  onClick={toggleTitleColorPopover}
                  style={{ backgroundColor: hsbToHex(titleColor) }}
                  className="min-h-8 min-w-11 border border-[#e1e3e5] cursor-pointer rounded-md shrink-0"
                />
              }
              onClose={toggleTitleColorPopover}
            >
              <Box padding="400">
                <ColorPicker color={titleColor} onChange={setTitleColor} />
              </Box>
            </Popover>
            <div className="flex-1">
              <TextField
                label="Title color"
                labelHidden
                value={titleColorText}
                onChange={setTitleColorText}
                onBlur={() => handleHexChange(titleColorText, setTitleColor)}
                autoComplete="off"
              />
            </div>
          </InlineStack>
        </BlockStack>

        <BlockStack gap="200">
          <Text as="p" variant="bodyMd">
            Subheading size and color
          </Text>
          <InlineStack gap="200" blockAlign="stretch" wrap={false}>
            <div style={{ width: "110px" }}>
              <TextField
                label="Subheading size"
                labelHidden
                value={subheadingSize}
                onChange={setSubheadingSize}
                autoComplete="off"
                suffix="px"
                type="number"
              />
            </div>
            <Popover
              active={subheadingColorPopover}
              activator={
                <button
                  type="button"
                  onClick={toggleSubheadingColorPopover}
                  style={{ backgroundColor: hsbToHex(subheadingColor) }}
                  className="min-h-8 min-w-11 border border-[#e1e3e5] cursor-pointer rounded-md shrink-0"
                />
              }
              onClose={toggleSubheadingColorPopover}
            >
              <Box padding="400">
                <ColorPicker
                  color={subheadingColor}
                  onChange={setSubheadingColor}
                />
              </Box>
            </Popover>
            <div className="flex-1">
              <TextField
                label="Subheading color"
                labelHidden
                value={subheadingColorText}
                onChange={setSubheadingColorText}
                onBlur={() =>
                  handleHexChange(subheadingColorText, setSubheadingColor)
                }
                autoComplete="off"
              />
            </div>
          </InlineStack>
        </BlockStack>

        <BlockStack gap="200">
          <Text as="p" variant="bodyMd">
            Timer size and color
          </Text>
          <InlineStack gap="200" blockAlign="stretch" wrap={false}>
            <div style={{ width: "110px" }}>
              <TextField
                label="Timer size"
                labelHidden
                value={timerSize}
                onChange={setTimerSize}
                autoComplete="off"
                suffix="px"
                type="number"
              />
            </div>
            <Popover
              active={timerColorPopover}
              activator={
                <button
                  type="button"
                  onClick={toggleTimerColorPopover}
                  style={{ backgroundColor: hsbToHex(timerColor) }}
                  className="min-h-8 min-w-11 border border-[#e1e3e5] cursor-pointer rounded-md shrink-0"
                />
              }
              onClose={toggleTimerColorPopover}
            >
              <Box padding="400">
                <ColorPicker color={timerColor} onChange={setTimerColor} />
              </Box>
            </Popover>
            <div className="flex-1">
              <TextField
                label="Timer color"
                labelHidden
                value={timerColorText}
                onChange={setTimerColorText}
                onBlur={() => handleHexChange(timerColorText, setTimerColor)}
                autoComplete="off"
              />
            </div>
          </InlineStack>
        </BlockStack>

        <BlockStack gap="200">
          <Text as="p" variant="bodyMd">
            Legend size and color
          </Text>
          <InlineStack gap="200" blockAlign="stretch" wrap={false}>
            <div style={{ width: "110px" }}>
              <TextField
                label="Legend size"
                labelHidden
                value={legendSize}
                onChange={setLegendSize}
                autoComplete="off"
                suffix="px"
                type="number"
              />
            </div>
            <Popover
              active={legendColorPopover}
              activator={
                <button
                  type="button"
                  onClick={toggleLegendColorPopover}
                  style={{ backgroundColor: hsbToHex(legendColor) }}
                  className="min-h-8 min-w-11 border border-[#e1e3e5] cursor-pointer rounded-md shrink-0"
                />
              }
              onClose={toggleLegendColorPopover}
            >
              <Box padding="400">
                <ColorPicker color={legendColor} onChange={setLegendColor} />
              </Box>
            </Popover>
            <div className="flex-1">
              <TextField
                label="Legend color"
                labelHidden
                value={legendColorText}
                onChange={setLegendColorText}
                onBlur={() => handleHexChange(legendColorText, setLegendColor)}
                autoComplete="off"
              />
            </div>
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
                <Box padding="400">
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
                    handleHexChange(buttonBgColorText, setButtonBackgroundColor)
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
                <Box padding="400">
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
                    handleHexChange(buttonColorText, setButtonColor)
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
