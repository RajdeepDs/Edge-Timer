import { useState, useEffect, useCallback } from "react";
import type { DesignConfig } from "../../types/timer";
import { cn } from "../../utils/cn";

interface TimerPreviewProps {
  title: string;
  subheading: string;
  daysLabel?: string;
  hoursLabel?: string;
  minutesLabel?: string;
  secondsLabel?: string;
  designConfig?: DesignConfig;
  timerType?: "product" | "top-bottom-bar";
  buttonText?: string;
  endDate?: Date;
  hour?: string;
  minute?: string;
  period?: "AM" | "PM";
  timerTypeValue?: "countdown" | "fixed";
  fixedMinutes?: string;
}

export default function TimerPreview({
  title,
  subheading,
  daysLabel = "Days",
  hoursLabel = "Hrs",
  minutesLabel = "Mins",
  secondsLabel = "Secs",
  designConfig = {},
  timerType = "product",
  buttonText = "Shop now!",
  endDate,
  hour = "12",
  minute = "00",
  period = "AM",
  timerTypeValue = "countdown",
  fixedMinutes = "10",
}: TimerPreviewProps) {
  // Calculate target end date/time
  const getTargetDate = useCallback(() => {
    if (!endDate) {
      // Default to 24 hours from now
      const defaultDate = new Date();
      defaultDate.setHours(defaultDate.getHours() + 24);
      return defaultDate;
    }

    const target = new Date(endDate);
    let hours = parseInt(hour) || 12;

    // Convert 12-hour to 24-hour format
    if (period === "PM" && hours !== 12) {
      hours += 12;
    } else if (period === "AM" && hours === 12) {
      hours = 0;
    }

    target.setHours(hours, parseInt(minute) || 0, 0, 0);
    return target;
  }, [endDate, hour, minute, period]);

  // Calculate time left
  const calculateTimeLeft = useCallback(() => {
    // For fixed timer type, use fixed minutes
    if (timerTypeValue === "fixed") {
      const totalSeconds = parseInt(fixedMinutes) * 60;

      if (totalSeconds <= 0) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      }

      const days = Math.floor(totalSeconds / (60 * 60 * 24));
      const hours = Math.floor((totalSeconds / (60 * 60)) % 24);
      const minutes = Math.floor((totalSeconds / 60) % 60);
      const seconds = totalSeconds % 60;

      return { days, hours, minutes, seconds };
    }

    // For countdown timer type, calculate from end date
    const target = getTargetDate();
    const now = new Date();
    const difference = target.getTime() - now.getTime();

    if (difference <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    }

    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((difference / 1000 / 60) % 60);
    const seconds = Math.floor((difference / 1000) % 60);

    return { days, hours, minutes, seconds };
  }, [getTargetDate, timerTypeValue, fixedMinutes]);

  // Live countdown timer state
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  // Update timer every second (only for countdown, fixed timer is static in preview)
  useEffect(() => {
    if (timerTypeValue === "countdown") {
      const interval = setInterval(() => {
        setTimeLeft(calculateTimeLeft());
      }, 1000);

      return () => clearInterval(interval);
    }
    // For fixed timer, just set it once
    setTimeLeft(calculateTimeLeft());
  }, [calculateTimeLeft, timerTypeValue]);

  // Format numbers to always be 2 digits
  const formatTime = (num: number) => String(num).padStart(2, "0");

  // Extract design config values with defaults
  const {
    backgroundColor = "#ffffff",
    borderRadius = 8,
    borderSize = 0,
    borderColor = "#d1d5db",
    paddingTop = 30,
    paddingBottom = 30,
    titleSize = timerType === "top-bottom-bar" ? 18 : 28,
    titleColor = "#212121",
    subheadingSize = timerType === "top-bottom-bar" ? 14 : 16,
    subheadingColor = "#212121",
    timerSize = timerType === "top-bottom-bar" ? 22 : 40,
    timerColor = "#212121",
    legendSize = timerType === "top-bottom-bar" ? 10 : 14,
    legendColor = "#707070",
    buttonFontSize = 16,
    buttonCornerRadius = 4,
    buttonColor = "#ffffff",
    buttonBackgroundColor = "#202223",
  } = designConfig;

  // Simple CSS (inline) for primary styling
  const cardStyle: React.CSSProperties = {
    backgroundColor,
    borderRadius: `${borderRadius}px`,
    border: borderSize > 0 ? `${borderSize}px solid ${borderColor}` : "none",
    paddingTop: `${paddingTop}px`,
    paddingBottom: `${paddingBottom}px`,
  };

  const titleStyle: React.CSSProperties = {
    fontSize: `${titleSize}px`,
    color: titleColor,
    fontWeight: 600,
    lineHeight: 1.2,
  };

  const subheadingStyle: React.CSSProperties = {
    fontSize: `${subheadingSize}px`,
    color: subheadingColor,
    lineHeight: 1.4,
  };

  const timerDigitStyle: React.CSSProperties = {
    fontSize: `${timerSize}px`,
    color: timerColor,
    fontWeight: 700,
    lineHeight: 1,
  };

  const legendStyle: React.CSSProperties = {
    fontSize: `${legendSize}px`,
    color: legendColor,
    lineHeight: 1.2,
  };

  const buttonStyle: React.CSSProperties = {
    fontSize: `${buttonFontSize}px`,
    color: buttonColor,
    backgroundColor: buttonBackgroundColor,
    borderRadius: `${buttonCornerRadius}px`,
    padding: "12px 24px",
    border: "none",
    cursor: "pointer",
    fontWeight: 500,
    display: "inline-block",
  };

  if (timerType === "top-bottom-bar") {
    const barTitleStyle: React.CSSProperties = {
      fontSize: `${Math.min(titleSize, 18)}px`,
      color: titleColor,
      fontWeight: 600,
      lineHeight: 1.2,
    };

    return (
      <div
        style={{
          ...cardStyle,
          paddingLeft: "24px",
          paddingRight: "24px",
          paddingTop: `${Math.min(paddingTop, 16)}px`,
          paddingBottom: `${Math.min(paddingBottom, 16)}px`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "16px",
        }}
        className="select-none"
      >
        {/* Left side: Title and subheading in one line */}
        <div style={{ ...barTitleStyle, whiteSpace: "nowrap" }}>
          {title || "Hurry up! Sale ends in:"}{" "}
        </div>

        {/* Right side: Timer and button */}
        <div className={cn("flex items-center gap-3 shrink-0")}>
          {/* Timer - Horizontal layout with colons */}
          <div className={cn("flex items-start gap-1 shrink-0")}>
            <div style={{ textAlign: "center" }}>
              <div style={timerDigitStyle}>{formatTime(timeLeft.days)}</div>
              <div style={{ ...legendStyle, marginTop: "2px" }}>
                {daysLabel}
              </div>
            </div>
            <div style={{ ...timerDigitStyle, lineHeight: `${timerSize}px` }}>
              :
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={timerDigitStyle}>{formatTime(timeLeft.hours)}</div>
              <div style={{ ...legendStyle, marginTop: "2px" }}>
                {hoursLabel}
              </div>
            </div>
            <div style={{ ...timerDigitStyle, lineHeight: `${timerSize}px` }}>
              :
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={timerDigitStyle}>{formatTime(timeLeft.minutes)}</div>
              <div style={{ ...legendStyle, marginTop: "2px" }}>
                {minutesLabel}
              </div>
            </div>
            <div style={{ ...timerDigitStyle, lineHeight: `${timerSize}px` }}>
              :
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={timerDigitStyle}>{formatTime(timeLeft.seconds)}</div>
              <div style={{ ...legendStyle, marginTop: "2px" }}>
                {secondsLabel}
              </div>
            </div>
          </div>

          {/* Button */}
          <button
            style={{
              ...buttonStyle,
              padding: "8px 16px",
              fontSize: `${Math.min(buttonFontSize, 14)}px`,
            }}
          >
            {buttonText}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={cardStyle} className={cn("sticky select-none")}>
      <div className="flex items-center flex-col gap-0.5">
        <div style={{ ...titleStyle, textAlign: "center" }}>
          {title || "Hurry up!"}
        </div>
        <div style={{ ...subheadingStyle, textAlign: "center" }}>
          {subheading || "Sale ends in:"}
        </div>
        <div className={cn("flex items-center gap-1 justify-center")}>
          <div style={{ textAlign: "center" }}>
            <div style={timerDigitStyle}>{formatTime(timeLeft.days)}</div>
            <div style={{ ...legendStyle, marginTop: "4px" }}>{daysLabel}</div>
          </div>
          <div style={timerDigitStyle} className={cn("-translate-y-3.5")}>
            :
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={timerDigitStyle}>{formatTime(timeLeft.hours)}</div>
            <div style={{ ...legendStyle, marginTop: "4px" }}>{hoursLabel}</div>
          </div>
          <div style={timerDigitStyle} className={cn("-translate-y-3.5")}>
            :
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={timerDigitStyle}>{formatTime(timeLeft.minutes)}</div>
            <div style={{ ...legendStyle, marginTop: "4px" }}>
              {minutesLabel}
            </div>
          </div>
          <div style={timerDigitStyle} className={cn("-translate-y-3.5")}>
            :
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={timerDigitStyle}>{formatTime(timeLeft.seconds)}</div>
            <div style={{ ...legendStyle, marginTop: "4px" }}>
              {secondsLabel}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
