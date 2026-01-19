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
} from "@shopify/polaris";
import { useState, useCallback } from "react";

interface DesignTabProps {
  onContinue: () => void;
}

export default function DesignTab({ onContinue }: DesignTabProps) {
  const [backgroundType, setBackgroundType] = useState("single");
  const [backgroundColor, setBackgroundColor] = useState({
    hue: 0,
    saturation: 0,
    brightness: 1,
    alpha: 1,
  });
  const [bgColorPopover, setBgColorPopover] = useState(false);

  const [borderRadius, setBorderRadius] = useState("8");
  const [borderSize, setBorderSize] = useState("0");
  const [borderColor, setBorderColor] = useState({
    hue: 220,
    saturation: 0.16,
    brightness: 0.82,
    alpha: 1,
  });
  const [borderColorPopover, setBorderColorPopover] = useState(false);

  const [insideTop, setInsideTop] = useState("30");
  const [insideBottom, setInsideBottom] = useState("30");
  const [outsideTop, setOutsideTop] = useState("20");
  const [outsideBottom, setOutsideBottom] = useState("20");

  const toggleBgColorPopover = useCallback(
    () => setBgColorPopover((active) => !active),
    [],
  );

  const toggleBorderColorPopover = useCallback(
    () => setBorderColorPopover((active) => !active),
    [],
  );

  const hsbToHex = (hsb: {
    hue: number;
    saturation: number;
    brightness: number;
    alpha?: number;
  }) => {
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

  return (
    <FormLayout>
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
                    allowAlpha
                  />
                </Box>
              </Popover>
              <div className="flex-1">
                <TextField
                  label="Color"
                  labelHidden
                  value={hsbToHex(backgroundColor)}
                  onChange={(value) => {
                    // Handle hex input if needed
                  }}
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
                  <ColorPicker
                    color={borderColor}
                    onChange={setBorderColor}
                    allowAlpha
                  />
                </Box>
              </Popover>
              <Box width="100%">
                <TextField
                  label="Border color"
                  labelHidden
                  value={hsbToHex(borderColor)}
                  onChange={(value) => {
                    // Handle hex input if needed
                  }}
                  autoComplete="off"
                />
              </Box>
            </InlineStack>
          </BlockStack>
        </Box>

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

      <Box paddingBlockStart="400">
        <Button fullWidth onClick={onContinue}>
          Continue to Placement
        </Button>
      </Box>
    </FormLayout>
  );
}
