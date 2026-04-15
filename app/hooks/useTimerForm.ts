import { useState, useCallback, useMemo } from "react";
import type {
  TimerTypeValue,
  TimerStarts,
  OnExpiryAction,
  CallToActionType,
  DesignConfig,
  PlacementConfig,
  Timer,
} from "../types/timer";

interface UseTimerFormProps {
  existingTimer?: Timer | null;
  timerType: "product-page" | "top-bottom-bar";
}

export function useTimerForm({ existingTimer, timerType }: UseTimerFormProps) {
  const getDefaultEndDate = () => {
    const date = new Date();
    date.setHours(date.getHours() + 24);
    return date;
  };

  const initialState = useMemo(() => {
    const endDate = existingTimer?.endDate
      ? new Date(existingTimer.endDate)
      : getDefaultEndDate();
    const hours = endDate.getHours();
    const mins = endDate.getMinutes();

    return {
      timerName: existingTimer?.name || "Timer name",
      title: existingTimer?.title || "Hurry up!",
      subheading:
        existingTimer?.subheading ||
        (timerType === "product-page" ? "Sale ends in:" : ""),
      timerTypeValue:
        (existingTimer?.timerType as TimerTypeValue) || "countdown",
      timerStarts: "now" as TimerStarts,
      endDate,
      hour: hours > 12 ? String(hours - 12) : String(hours || 12),
      minute: String(mins).padStart(2, "0"),
      period: (hours >= 12 ? "PM" : "AM") as "AM" | "PM",
      fixedMinutes: String(existingTimer?.fixedMinutes || "10"),
      daysLabel: existingTimer?.daysLabel || "Days",
      hoursLabel: existingTimer?.hoursLabel || "Hrs",
      minutesLabel: existingTimer?.minutesLabel || "Mins",
      secondsLabel: existingTimer?.secondsLabel || "Secs",
      onceItEnds: (existingTimer?.onExpiry as OnExpiryAction) || "unpublish",
      callToAction: (existingTimer?.ctaType as CallToActionType) || "no",
      buttonText: existingTimer?.buttonText || "Shop now!",
      buttonLink: existingTimer?.buttonLink || "",
      designConfig: existingTimer?.designConfig || {},
      placementConfig: existingTimer?.placementConfig || {},
      isPublished: existingTimer?.isPublished || false,
    };
  }, [existingTimer, timerType]);

  // Basic Information
  const [timerName, setTimerName] = useState(initialState.timerName);
  const [title, setTitle] = useState(initialState.title);
  const [subheading, setSubheading] = useState(initialState.subheading);

  // Timer Type Settings
  const [timerTypeValue, setTimerTypeValue] = useState<TimerTypeValue>(
    initialState.timerTypeValue,
  );
  const [timerStarts, setTimerStarts] = useState<TimerStarts>(
    initialState.timerStarts,
  );

  // Date & Time
  const [endDate, setEndDate] = useState<Date>(initialState.endDate);
  const [hour, setHour] = useState(initialState.hour);
  const [minute, setMinute] = useState(initialState.minute);
  const [period, setPeriod] = useState<"AM" | "PM">(initialState.period);

  // Fixed Minutes
  const [fixedMinutes, setFixedMinutes] = useState(initialState.fixedMinutes);

  // Timer Labels
  const [daysLabel, setDaysLabel] = useState(initialState.daysLabel);
  const [hoursLabel, setHoursLabel] = useState(initialState.hoursLabel);
  const [minutesLabel, setMinutesLabel] = useState(initialState.minutesLabel);
  const [secondsLabel, setSecondsLabel] = useState(initialState.secondsLabel);

  // Once It Ends
  const [onceItEnds, setOnceItEnds] = useState<OnExpiryAction>(
    initialState.onceItEnds,
  );

  // Call to Action (for top-bottom-bar)
  const [callToAction, setCallToAction] = useState<CallToActionType>(
    initialState.callToAction,
  );
  const [buttonText, setButtonText] = useState(initialState.buttonText);
  const [buttonLink, setButtonLink] = useState(initialState.buttonLink);

  // Design Configuration
  const [designConfig, setDesignConfig] = useState<DesignConfig>(
    initialState.designConfig,
  );

  // Placement Configuration
  const [placementConfig, setPlacementConfig] = useState<PlacementConfig>(
    initialState.placementConfig,
  );

  // Published State
  const [isPublished, setIsPublished] = useState(initialState.isPublished);

  // Update design config
  const updateDesignConfig = useCallback((updates: Partial<DesignConfig>) => {
    setDesignConfig((prev) => ({ ...prev, ...updates }));
  }, []);

  // Update placement config
  const updatePlacementConfig = useCallback(
    (updates: Partial<PlacementConfig>) => {
      setPlacementConfig((prev) => ({ ...prev, ...updates }));
    },
    [],
  );

  // Reset form
  const resetForm = useCallback(() => {
    setTimerName(initialState.timerName);
    setTitle(initialState.title);
    setSubheading(initialState.subheading);
    setTimerTypeValue(initialState.timerTypeValue);
    setTimerStarts(initialState.timerStarts);
    setEndDate(new Date(initialState.endDate));
    setHour(initialState.hour);
    setMinute(initialState.minute);
    setPeriod(initialState.period);
    setFixedMinutes(initialState.fixedMinutes);
    setDaysLabel(initialState.daysLabel);
    setHoursLabel(initialState.hoursLabel);
    setMinutesLabel(initialState.minutesLabel);
    setSecondsLabel(initialState.secondsLabel);
    setOnceItEnds(initialState.onceItEnds);
    setCallToAction(initialState.callToAction);
    setButtonText(initialState.buttonText);
    setButtonLink(initialState.buttonLink);
    setDesignConfig(initialState.designConfig);
    setPlacementConfig(initialState.placementConfig);
    setIsPublished(initialState.isPublished);
  }, [initialState]);

  // Get form data for submission
  const getFormData = useCallback(() => {
    return {
      timerName,
      title,
      subheading,
      timerTypeValue,
      timerStarts,
      endDate,
      hour,
      minute,
      period,
      fixedMinutes,
      daysLabel,
      hoursLabel,
      minutesLabel,
      secondsLabel,
      onceItEnds,
      callToAction,
      buttonText,
      buttonLink,
      designConfig,
      placementConfig,
      isPublished,
    };
  }, [
    timerName,
    title,
    subheading,
    timerTypeValue,
    timerStarts,
    endDate,
    hour,
    minute,
    period,
    fixedMinutes,
    daysLabel,
    hoursLabel,
    minutesLabel,
    secondsLabel,
    onceItEnds,
    callToAction,
    buttonText,
    buttonLink,
    designConfig,
    placementConfig,
    isPublished,
  ]);

  return {
    // Basic Info
    timerName,
    setTimerName,
    title,
    setTitle,
    subheading,
    setSubheading,

    // Timer Type
    timerTypeValue,
    setTimerTypeValue,
    timerStarts,
    setTimerStarts,

    // Date & Time
    endDate,
    setEndDate,
    hour,
    setHour,
    minute,
    setMinute,
    period,
    setPeriod,

    // Fixed Minutes
    fixedMinutes,
    setFixedMinutes,

    // Labels
    daysLabel,
    setDaysLabel,
    hoursLabel,
    setHoursLabel,
    minutesLabel,
    setMinutesLabel,
    secondsLabel,
    setSecondsLabel,

    // Once It Ends
    onceItEnds,
    setOnceItEnds,

    // CTA
    callToAction,
    setCallToAction,
    buttonText,
    setButtonText,
    buttonLink,
    setButtonLink,

    // Design & Placement
    designConfig,
    setDesignConfig,
    updateDesignConfig,
    placementConfig,
    setPlacementConfig,
    updatePlacementConfig,

    // Published
    isPublished,
    setIsPublished,

    // Utility methods
    resetForm,
    getFormData,
  };
}
