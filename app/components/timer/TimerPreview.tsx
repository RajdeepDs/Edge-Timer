import { Box, BlockStack, Card } from "@shopify/polaris";
import type { DesignConfig } from "../../types/timer";

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
}: TimerPreviewProps) {
  // Extract design config values with defaults
  const {
    backgroundColor = "#ffffff",
    borderRadius = 8,
    borderSize = 0,
    borderColor = "#d1d5db",
    paddingTop = 30,
    paddingBottom = 30,
    titleSize = 28,
    titleColor = "#212121",
    subheadingSize = 16,
    subheadingColor = "#212121",
    timerSize = 40,
    timerColor = "#212121",
    legendSize = 14,
    legendColor = "#707070",
    buttonFontSize = 16,
    buttonCornerRadius = 4,
    buttonColor = "#ffffff",
    buttonBackgroundColor = "#5c6ac4",
  } = designConfig;

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
    return (
      <Box position="sticky" insetBlockStart="400">
        <Card padding="0">
          <div
            style={{
              ...cardStyle,
              padding: "16px 24px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "16px",
            }}
          >
            <div style={{ flex: 1 }}>
              <div style={titleStyle}>{title || "Hurry up!"}</div>
              <div style={{ ...subheadingStyle, marginTop: "4px" }}>
                {subheading || "Sale ends in:"}
              </div>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                flexShrink: 0,
              }}
            >
              <div style={{ textAlign: "center" }}>
                <div style={timerDigitStyle}>00</div>
                <div style={{ ...legendStyle, marginTop: "2px" }}>
                  {daysLabel}
                </div>
              </div>
              <div style={timerDigitStyle}>:</div>
              <div style={{ textAlign: "center" }}>
                <div style={timerDigitStyle}>23</div>
                <div style={{ ...legendStyle, marginTop: "2px" }}>
                  {hoursLabel}
                </div>
              </div>
              <div style={timerDigitStyle}>:</div>
              <div style={{ textAlign: "center" }}>
                <div style={timerDigitStyle}>59</div>
                <div style={{ ...legendStyle, marginTop: "2px" }}>
                  {minutesLabel}
                </div>
              </div>
              <div style={timerDigitStyle}>:</div>
              <div style={{ textAlign: "center" }}>
                <div style={timerDigitStyle}>53</div>
                <div style={{ ...legendStyle, marginTop: "2px" }}>
                  {secondsLabel}
                </div>
              </div>
            </div>
            <button style={buttonStyle}>{buttonText}</button>
          </div>
        </Card>
      </Box>
    );
  }

  return (
    <Box position="sticky" insetBlockStart="400">
      <Card padding="0">
        <div style={cardStyle}>
          <BlockStack gap="400" align="center">
            <div style={{ ...titleStyle, textAlign: "center" }}>
              {title || "Hurry up!"}
            </div>
            <div style={{ ...subheadingStyle, textAlign: "center" }}>
              {subheading || "Sale ends in:"}
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                justifyContent: "center",
              }}
            >
              <div style={{ textAlign: "center" }}>
                <div style={timerDigitStyle}>00</div>
                <div style={{ ...legendStyle, marginTop: "4px" }}>
                  {daysLabel}
                </div>
              </div>
              <div style={timerDigitStyle}>:</div>
              <div style={{ textAlign: "center" }}>
                <div style={timerDigitStyle}>23</div>
                <div style={{ ...legendStyle, marginTop: "4px" }}>
                  {hoursLabel}
                </div>
              </div>
              <div style={timerDigitStyle}>:</div>
              <div style={{ textAlign: "center" }}>
                <div style={timerDigitStyle}>59</div>
                <div style={{ ...legendStyle, marginTop: "4px" }}>
                  {minutesLabel}
                </div>
              </div>
              <div style={timerDigitStyle}>:</div>
              <div style={{ textAlign: "center" }}>
                <div style={timerDigitStyle}>53</div>
                <div style={{ ...legendStyle, marginTop: "4px" }}>
                  {secondsLabel}
                </div>
              </div>
            </div>
          </BlockStack>
        </div>
      </Card>
    </Box>
  );
}
