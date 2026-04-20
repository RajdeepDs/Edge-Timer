import { useState, useCallback } from "react";

interface UseDateTimePickerProps {
  initialDate?: Date;
  onDateChange?: (date: Date) => void;
}

export function useDateTimePicker({
  initialDate = new Date(),
  onDateChange,
}: UseDateTimePickerProps = {}) {
  const [selectedDate, setSelectedDate] = useState({
    month: initialDate.getMonth(),
    year: initialDate.getFullYear(),
  });

  const [selectedDates, setSelectedDates] = useState({
    start: initialDate,
    end: initialDate,
  });

  const [popoverActive, setPopoverActive] = useState(false);

  const togglePopoverActive = useCallback(
    () => setPopoverActive((prev) => !prev),
    []
  );

  const handleMonthChange = useCallback(
    (month: number, year: number) => setSelectedDate({ month, year }),
    []
  );

  const handleDateChange = useCallback(
    (dates: { start: Date; end: Date }) => {
      setSelectedDates(dates);
      setPopoverActive(false);
      onDateChange?.(dates.start);
    },
    [onDateChange]
  );

  const formatDate = useCallback((date: Date) => {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }, []);

  return {
    selectedDate,
    selectedDates,
    popoverActive,
    togglePopoverActive,
    handleMonthChange,
    handleDateChange,
    formatDate,
  };
}
