import { useState, useCallback, useEffect } from "react";
import type {
  DesignConfig,
  ColorHSBA,
  PositioningType,
  BackgroundType,
} from "../types/timer";
import { hexToHsb } from "../utils/timer/color";

interface UseDesignStateProps {
  timerType: "product" | "top-bottom-bar";
  initialConfig?: DesignConfig;
  onConfigChange?: (config: DesignConfig) => void;
}

export function useDesignState({
  timerType,
  initialConfig = {},
  onConfigChange,
}: UseDesignStateProps) {
  // Positioning (for top-bottom-bar)
  const [positioning, setPositioning] = useState<PositioningType>(
    initialConfig.positioning || "top",
  );

  // Background
  const [backgroundType, setBackgroundType] = useState<BackgroundType>(
    initialConfig.backgroundType || "single",
  );
  const [backgroundColor, setBackgroundColor] = useState(
    initialConfig.backgroundColor || "#ffffff",
  );

  // Border
  const [borderRadius, setBorderRadius] = useState(
    String(initialConfig.borderRadius || 8),
  );
  const [borderSize, setBorderSize] = useState(
    String(initialConfig.borderSize || 0),
  );
  const [borderColor, setBorderColor] = useState(
    initialConfig.borderColor || "#d1d5db",
  );

  // Spacing
  const [insideTop, setInsideTop] = useState(
    String(initialConfig.paddingTop || 30),
  );
  const [insideBottom, setInsideBottom] = useState(
    String(initialConfig.paddingBottom || 30),
  );
  const [outsideTop, setOutsideTop] = useState(
    String(initialConfig.marginTop || 0),
  );
  const [outsideBottom, setOutsideBottom] = useState(
    String(initialConfig.marginBottom || 0),
  );

  // Typography - Title
  const [titleSize, setTitleSize] = useState(
    String(
      initialConfig.titleSize || (timerType === "top-bottom-bar" ? 18 : 32),
    ),
  );
  const [titleColor, setTitleColor] = useState(
    initialConfig.titleColor || "#212121",
  );

  // Typography - Subheading
  const [subheadingSize, setSubheadingSize] = useState(
    String(
      initialConfig.subheadingSize ||
        (timerType === "top-bottom-bar" ? 14 : 16),
    ),
  );
  const [subheadingColor, setSubheadingColor] = useState(
    initialConfig.subheadingColor || "#212121",
  );

  // Typography - Timer
  const [timerSize, setTimerSize] = useState(
    String(
      initialConfig.timerSize || (timerType === "top-bottom-bar" ? 22 : 48),
    ),
  );
  const [timerColor, setTimerColor] = useState(
    initialConfig.timerColor || "#212121",
  );

  // Typography - Legend
  const [legendSize, setLegendSize] = useState(
    String(
      initialConfig.legendSize || (timerType === "top-bottom-bar" ? 10 : 14),
    ),
  );
  const [legendColor, setLegendColor] = useState(
    initialConfig.legendColor || "#707070",
  );

  // Button (for CTA)
  const [buttonFontSize, setButtonFontSize] = useState(
    String(initialConfig.buttonFontSize || 16),
  );
  const [cornerRadius, setCornerRadius] = useState(
    String(initialConfig.buttonCornerRadius || 4),
  );
  const [buttonColor, setButtonColor] = useState(
    initialConfig.buttonColor || "#ffffff",
  );
  const [buttonBackgroundColor, setButtonBackgroundColor] = useState(
    initialConfig.buttonBackgroundColor || "#202223",
  );

  // Update config whenever any value changes
  useEffect(() => {
    const newConfig: DesignConfig = {
      // Positioning
      positioning,
      // Background
      backgroundType,
      backgroundColor,
      // Border
      borderRadius: parseInt(borderRadius) || 8,
      borderSize: parseInt(borderSize) || 0,
      borderColor,
      // Spacing
      paddingTop: parseInt(insideTop) || 30,
      paddingBottom: parseInt(insideBottom) || 30,
      marginTop: parseInt(outsideTop) || 0,
      marginBottom: parseInt(outsideBottom) || 0,
      // Typography
      titleSize: parseInt(titleSize) || 33,
      titleColor,
      subheadingSize: parseInt(subheadingSize) || 16,
      subheadingColor,
      timerSize:
        parseInt(timerSize) || (timerType === "top-bottom-bar" ? 22 : 48),
      timerColor,
      legendSize: parseInt(legendSize) || 14,
      legendColor,
      // Button
      buttonFontSize: parseInt(buttonFontSize) || 14,
      buttonCornerRadius: parseInt(cornerRadius) || 4,
      buttonColor,
      buttonBackgroundColor,
    };

    onConfigChange?.(newConfig);
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
    onConfigChange,
    timerType,
  ]);

  // Helper to handle hex text input
  const handleHexChange = useCallback(
    (
      value: string,
      setter: (color: ColorHSBA) => void,
      textSetter: (text: string) => void,
    ) => {
      textSetter(value);

      if (!value.startsWith("#") && value.length > 0) {
        value = "#" + value;
      }

      const hexPattern = /^#([A-Fa-f0-9]{6})$/;
      const match = value.match(hexPattern);

      if (match) {
        const hsb = hexToHsb(value);
        setter(hsb);
      }
    },
    [],
  );

  return {
    // Positioning
    positioning,
    setPositioning,

    // Background
    backgroundType,
    setBackgroundType,
    backgroundColor,
    setBackgroundColor,

    // Border
    borderRadius,
    setBorderRadius,
    borderSize,
    setBorderSize,
    borderColor,
    setBorderColor,

    // Spacing
    insideTop,
    setInsideTop,
    insideBottom,
    setInsideBottom,
    outsideTop,
    setOutsideTop,
    outsideBottom,
    setOutsideBottom,

    // Title
    titleSize,
    setTitleSize,
    titleColor,
    setTitleColor,

    // Subheading
    subheadingSize,
    setSubheadingSize,
    subheadingColor,
    setSubheadingColor,

    // Timer
    timerSize,
    setTimerSize,
    timerColor,
    setTimerColor,

    // Legend
    legendSize,
    setLegendSize,
    legendColor,
    setLegendColor,

    // Button
    buttonFontSize,
    setButtonFontSize,
    cornerRadius,
    setCornerRadius,
    buttonColor,
    setButtonColor,
    buttonBackgroundColor,
    setButtonBackgroundColor,

    // Utility
    handleHexChange,
  };
}
