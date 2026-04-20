import { useState, useEffect, useRef } from "react";
import type {
  DesignConfig,
  PositioningType,
  BackgroundType,
} from "../types/timer";

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
  // Template selection
  const [selectedTemplate, setSelectedTemplate] = useState(
    initialConfig.selectedTemplate ?? "Custom",
  );

  // Global font
  const [fontFamily, setFontFamily] = useState(
    initialConfig.fontFamily || "theme",
  );

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
  const [gradientStartColor, setGradientStartColor] = useState(
    initialConfig.gradientStartColor || "#ffffff",
  );
  const [gradientEndColor, setGradientEndColor] = useState(
    initialConfig.gradientEndColor || "#DDDDDD",
  );
  const [gradientAngle, setGradientAngle] = useState(
    initialConfig.gradientAngle ?? 90,
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
      initialConfig.titleSize || (timerType === "top-bottom-bar" ? 18 : 28),
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
      initialConfig.timerSize || (timerType === "top-bottom-bar" ? 22 : 40),
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

  // Track the last config we emitted so we can distinguish our own updates
  // bouncing back (internal cycle) from genuine external resets like Discard.
  const lastEmittedConfig = useRef<DesignConfig | null>(null);

  useEffect(() => {
    // Skip if this incoming config is the same object we just emitted —
    // that means it's our own onConfigChange call reflecting back, not an
    // external reset. Only sync when it's truly a new external config.
    if (initialConfig === lastEmittedConfig.current) return;

    setSelectedTemplate(initialConfig.selectedTemplate ?? "Custom");
    setFontFamily(initialConfig.fontFamily || "theme");
    setPositioning(initialConfig.positioning || "top");
    setBackgroundType(initialConfig.backgroundType || "single");
    setBackgroundColor(initialConfig.backgroundColor || "#ffffff");
    setGradientStartColor(initialConfig.gradientStartColor || "#ffffff");
    setGradientEndColor(initialConfig.gradientEndColor || "#dddddd");
    setGradientAngle(initialConfig.gradientAngle ?? 90);
    setBorderRadius(String(initialConfig.borderRadius || 8));
    setBorderSize(String(initialConfig.borderSize ?? 0));
    setBorderColor(initialConfig.borderColor || "#d1d5db");
    setInsideTop(String(initialConfig.paddingTop || 30));
    setInsideBottom(String(initialConfig.paddingBottom || 30));
    setOutsideTop(String(initialConfig.marginTop || 0));
    setOutsideBottom(String(initialConfig.marginBottom || 0));
    setTitleSize(
      String(
        initialConfig.titleSize || (timerType === "top-bottom-bar" ? 18 : 28),
      ),
    );
    setTitleColor(initialConfig.titleColor || "#212121");
    setSubheadingSize(
      String(
        initialConfig.subheadingSize ||
          (timerType === "top-bottom-bar" ? 14 : 16),
      ),
    );
    setSubheadingColor(initialConfig.subheadingColor || "#212121");
    setTimerSize(
      String(
        initialConfig.timerSize || (timerType === "top-bottom-bar" ? 22 : 40),
      ),
    );
    setTimerColor(initialConfig.timerColor || "#212121");
    setLegendSize(
      String(
        initialConfig.legendSize || (timerType === "top-bottom-bar" ? 10 : 14),
      ),
    );
    setLegendColor(initialConfig.legendColor || "#707070");
    setButtonFontSize(String(initialConfig.buttonFontSize || 16));
    setCornerRadius(String(initialConfig.buttonCornerRadius || 4));
    setButtonColor(initialConfig.buttonColor || "#ffffff");
    setButtonBackgroundColor(initialConfig.buttonBackgroundColor || "#202223");
  }, [initialConfig, timerType]);

  // Update config whenever any value changes
  useEffect(() => {
    const newConfig: DesignConfig = {
      // Template
      selectedTemplate,
      // Global font
      fontFamily,
      // Positioning
      positioning,
      // Background
      backgroundType,
      backgroundColor,
      gradientStartColor,
      gradientEndColor,
      gradientAngle,
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
      titleSize:
        parseInt(titleSize) || (timerType === "top-bottom-bar" ? 18 : 28),
      titleColor,
      subheadingSize: parseInt(subheadingSize) || 16,
      subheadingColor,
      timerSize:
        parseInt(timerSize) || (timerType === "top-bottom-bar" ? 22 : 40),
      timerColor,
      legendSize: parseInt(legendSize) || 14,
      legendColor,
      // Button
      buttonFontSize: parseInt(buttonFontSize) || 14,
      buttonCornerRadius: parseInt(cornerRadius) || 4,
      buttonColor,
      buttonBackgroundColor,
    };

    lastEmittedConfig.current = newConfig;
    onConfigChange?.(newConfig);
  }, [
    selectedTemplate,
    fontFamily,
    positioning,
    backgroundType,
    backgroundColor,
    gradientStartColor,
    gradientEndColor,
    gradientAngle,
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

  return {
    // Template
    selectedTemplate,
    setSelectedTemplate,

    // Font
    fontFamily,
    setFontFamily,

    // Positioning
    positioning,
    setPositioning,

    // Background
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
  };
}
