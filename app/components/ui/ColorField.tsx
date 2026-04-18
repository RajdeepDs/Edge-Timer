import { useState, useCallback, useRef, useEffect } from "react";
import { ColorPicker, Popover, TextField } from "@shopify/polaris";
import type { ColorHSBA } from "../../types/timer";
import {
  hexToHsb,
  hsbToHex,
  isValidHex,
  normalizeHex,
} from "../../utils/timer/color";

interface ColorFieldProps {
  value: string;
  onChange: (color: string) => void;
  label?: string;
}

export default function ColorField({
  value,
  onChange,
  label,
}: ColorFieldProps) {
  const [popoverActive, setPopoverActive] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const [hsb, setHsb] = useState<ColorHSBA>(() =>
    isValidHex(value)
      ? hexToHsb(normalizeHex(value))
      : { hue: 0, saturation: 0, brightness: 1, alpha: 1 },
  );

  const prevValidHex = useRef(
    isValidHex(value) ? normalizeHex(value) : "#ffffff",
  );

  // A hidden native input that we drive directly so App Bridge's data-save-bar
  // detects picker-driven changes (React controlled inputs don't fire native events).
  const hiddenInputRef = useRef<HTMLInputElement>(null);

  const notifySaveBar = useCallback((hex: string) => {
    const el = hiddenInputRef.current;
    if (!el) return;
    const nativeSetter = Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype,
      "value",
    )?.set;
    nativeSetter?.call(el, hex);
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
  }, []);

  // Sync when parent changes value externally (e.g. template preset)
  useEffect(() => {
    if (value !== prevValidHex.current) {
      setInputValue(value);
      if (isValidHex(value)) {
        const normalized = normalizeHex(value);
        prevValidHex.current = normalized;
        setHsb(hexToHsb(normalized));
      }
    }
  }, [value]);

  const handlePickerChange = useCallback(
    (color: ColorHSBA) => {
      setHsb(color);
      const hex = hsbToHex(color);
      prevValidHex.current = hex;
      setInputValue(hex);
      onChange(hex);
      notifySaveBar(hex);
    },
    [onChange, notifySaveBar],
  );

  const handleTextChange = useCallback((val: string) => {
    setInputValue(val);
  }, []);

  const handleTextBlur = useCallback(() => {
    const trimmed = inputValue.trim();
    if (isValidHex(trimmed)) {
      const normalized = normalizeHex(trimmed);
      prevValidHex.current = normalized;
      setHsb(hexToHsb(normalized));
      setInputValue(normalized);
      onChange(normalized);
    } else {
      setInputValue(prevValidHex.current);
    }
  }, [inputValue, onChange]);

  const swatch = prevValidHex.current;

  const swatchButton = (
    <button
      type="button"
      aria-label="Pick color"
      onClick={() => setPopoverActive((v) => !v)}
      style={{
        width: "24px",
        height: "20px",
        borderRadius: "3px",
        background: swatch,
        border: "1px solid rgba(0,0,0,0.2)",
        cursor: "pointer",
        padding: 0,
        flexShrink: 0,
        display: "block",
        marginLeft: "-6px",
      }}
    />
  );

  const activator = (
    <TextField
      label={label || "Color"}
      labelHidden={!label}
      value={inputValue}
      onChange={handleTextChange}
      onBlur={handleTextBlur}
      autoComplete="off"
      maxLength={7}
      prefix={swatchButton}
    />
  );

  return (
    <>
      {/* Hidden native input inside the form — gives App Bridge something real to track */}
      <input
        ref={hiddenInputRef}
        type="text"
        defaultValue={prevValidHex.current}
        aria-hidden="true"
        tabIndex={-1}
        readOnly
        style={{
          position: "absolute",
          opacity: 0,
          pointerEvents: "none",
          width: 0,
          height: 0,
          padding: 0,
          border: 0,
        }}
      />
      <Popover
        active={popoverActive}
        activator={activator}
        onClose={() => setPopoverActive(false)}
        preferredAlignment="left"
      >
        <div style={{ padding: "12px" }}>
          <ColorPicker onChange={handlePickerChange} color={hsb} />
        </div>
      </Popover>
    </>
  );
}
