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
  callToAction?: "no" | "button" | "clickable";
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
  callToAction = "button",
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
    backgroundType = "single",
    backgroundColor = "#ffffff",
    gradientStartColor = "#ffffff",
    gradientEndColor = "#DDDDDD",
    gradientAngle = 90,
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
    fontFamily = "theme",
    positioning = "top",
  } = designConfig;

  const resolvedFont =
    fontFamily === "theme" ? "inherit" : `"${fontFamily}", sans-serif`;
  const resolvedBackground =
    backgroundType === "gradient"
      ? {
          background: `linear-gradient(${gradientAngle}deg, ${gradientStartColor}, ${gradientEndColor})`,
        }
      : { backgroundColor };

  // Simple CSS (inline) for primary styling
  const cardStyle: React.CSSProperties = {
    ...resolvedBackground,
    borderRadius: `${borderRadius}px`,
    border: borderSize > 0 ? `${borderSize}px solid ${borderColor}` : "none",
    paddingTop: `${paddingTop}px`,
    paddingBottom: `${paddingBottom}px`,
  };

  const titleStyle: React.CSSProperties = {
    fontSize: `${titleSize}px`,
    color: titleColor,
    fontWeight: 800,
    lineHeight: 1.2,
    fontFamily: resolvedFont,
  };

  const subheadingStyle: React.CSSProperties = {
    fontSize: `${subheadingSize}px`,
    color: subheadingColor,
    lineHeight: 1.4,
    marginBottom: "12px",
    fontFamily: resolvedFont,
  };

  const timerDigitStyle: React.CSSProperties = {
    fontSize: `${timerSize}px`,
    color: timerColor,
    fontWeight: 700,
    lineHeight: 1,
    fontVariantNumeric: "tabular-nums",
    fontFeatureSettings: '"tnum"',
    fontFamily: resolvedFont,
  };

  const colonStyle: React.CSSProperties = {
    fontSize: `${timerSize * 0.7}px`,
    color: timerColor,
    fontWeight: 700,
    lineHeight: 1,
    fontFamily: resolvedFont,
  };

  // Fixed cell width prevents layout shift when digit count changes (e.g. "10" → "9")
  const digitCellStyle: React.CSSProperties = {
    textAlign: "center",
    width: `${timerSize * 1.4}px`,
    flexShrink: 0,
  };

  const legendStyle: React.CSSProperties = {
    fontSize: `${legendSize}px`,
    color: legendColor,
    lineHeight: 1.2,
    fontFamily: resolvedFont,
  };

  const typeLabel =
    timerType === "product" ? "Product page" : "Top / bottom bar";

  const barTitleStyle: React.CSSProperties = {
    fontSize: `${Math.min(titleSize, 18)}px`,
    color: titleColor,
    fontWeight: 600,
    lineHeight: 1.2,
    fontFamily: resolvedFont,
  };

  const timerBar = (
    <div
      style={{
        ...cardStyle,
        paddingLeft: "24px",
        paddingRight: "24px",
        paddingTop: `${Math.min(paddingTop, 16)}px`,
        paddingBottom: `${Math.min(paddingBottom, 16)}px`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
        borderRadius: 0,
      }}
    >
      <div style={{ ...barTitleStyle, textAlign: "center" }}>
        {title || "Hurry up! Sale ends in:"}
      </div>
      <div className={cn("flex items-center gap-3 shrink-0")}>
        <div className={cn("flex items-start gap-1 shrink-0")}>
          <div style={{ textAlign: "center" }}>
            <div style={timerDigitStyle}>{formatTime(timeLeft.days)}</div>
            <div style={{ ...legendStyle, marginTop: "2px" }}>{daysLabel}</div>
          </div>
          <div style={{ ...timerDigitStyle, lineHeight: `${timerSize}px` }}>
            :
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={timerDigitStyle}>{formatTime(timeLeft.hours)}</div>
            <div style={{ ...legendStyle, marginTop: "2px" }}>{hoursLabel}</div>
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
      </div>
    </div>
  );

  const productTimer = (
    <div style={{ ...cardStyle, padding: "40px 24px" }}>
      <div className="flex items-center flex-col gap-0.5">
        <div style={{ ...titleStyle, textAlign: "center" }}>
          {title || "Hurry up!"}
        </div>
        <div style={{ ...subheadingStyle, textAlign: "center" }}>
          {subheading || "Sale ends in:"}
        </div>
        <div className={cn("flex items-start gap-1 justify-center")}>
          <div style={digitCellStyle}>
            <div style={timerDigitStyle}>{formatTime(timeLeft.days)}</div>
            <div style={{ ...legendStyle, marginTop: "4px" }}>{daysLabel}</div>
          </div>
          <div
            style={{
              height: `${timerSize}px`,
              display: "flex",
              alignItems: "center",
            }}
          >
            <div style={colonStyle}>:</div>
          </div>
          <div style={digitCellStyle}>
            <div style={timerDigitStyle}>{formatTime(timeLeft.hours)}</div>
            <div style={{ ...legendStyle, marginTop: "4px" }}>{hoursLabel}</div>
          </div>
          <div
            style={{
              height: `${timerSize}px`,
              display: "flex",
              alignItems: "center",
            }}
          >
            <div style={colonStyle}>:</div>
          </div>
          <div style={digitCellStyle}>
            <div style={timerDigitStyle}>{formatTime(timeLeft.minutes)}</div>
            <div style={{ ...legendStyle, marginTop: "4px" }}>
              {minutesLabel}
            </div>
          </div>
          <div
            style={{
              height: `${timerSize}px`,
              display: "flex",
              alignItems: "center",
            }}
          >
            <div style={colonStyle}>:</div>
          </div>
          <div style={digitCellStyle}>
            <div style={timerDigitStyle}>{formatTime(timeLeft.seconds)}</div>
            <div style={{ ...legendStyle, marginTop: "4px" }}>
              {secondsLabel}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div
      className="select-none"
      style={{
        fontFamily: resolvedFont,
        borderRadius: "10px",
        overflow: "hidden",
        border: "1px solid #e1e3e5",
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        display: "flex",
        flexDirection: "column",
        minHeight: "calc(100vh - 12rem)",
      }}
    >
      {/* Browser chrome header */}
      <div
        style={{
          backgroundColor: "#f1f2f3",
          borderBottom: "1px solid #e1e3e5",
          padding: "12px 16px",
          display: "flex",
          alignItems: "center",
          position: "relative",
        }}
      >
        {/* Window control dots */}
        <div style={{ display: "flex", gap: "6px", zIndex: 1 }}>
          {["#d9d9d9", "#d9d9d9", "#d9d9d9"].map((color, i) => (
            <div
              key={i}
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                backgroundColor: color,
              }}
            />
          ))}
        </div>
        {/* Centered label */}
        <div
          style={{
            position: "absolute",
            left: "50%",
            transform: "translateX(-50%)",
            fontSize: "12px",
            color: "#6d7175",
            fontWeight: 400,
            whiteSpace: "nowrap",
          }}
        >
          {typeLabel}
        </div>
      </div>

      {/* Page body */}
      <div
        style={{
          backgroundColor: "#ffffff",
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent:
            timerType === "top-bottom-bar" && positioning === "bottom"
              ? "flex-end"
              : "flex-start",
        }}
      >
        {timerType === "top-bottom-bar" ? (
          <>{timerBar}</>
        ) : (
          <div style={{ padding: "24px" }}>
            <div
              style={{
                maxWidth: "420px",
                minWidth: "320px",
                marginInline: "auto",
              }}
            >
              {productTimer}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
