// DatePickerAppi.tsx
import { DatePicker } from "@heroui/date-picker";
import { extendVariants } from "@heroui/system";
import { parseDate, DateValue, CalendarDate } from "@internationalized/date";
import React, { useState, useEffect } from "react";

// Extend HeroUI DatePicker variants
export const DatePickerAppiWrapper = extendVariants(DatePicker, {
  variants: {
    color: {
      // default: {},
      // primary: {},
      // secondary: {},
      // success: {},
      // warning: {},
      // danger: {},
    },
    // variant: {
    //   flat: {},
    //   bordered: {},
    //   faded: {},
    //   underlined: {},
    // },
    size: {
      sm: {},
      md: {},
      lg: {},
    },
    // radius: {
    //   none: {},
    //   sm: {},
    //   md: {},
    //   lg: {},
    //   full: {},
    // },
    labelPlacement: {
      inside: {},
      // outside: {},
      "inside-left": {},
    },
    isDisabled: {
      true: {},
      false: {},
    },
    isRequired: {
      true: {},
      false: {},
    },
    isReadOnly: {
      true: {},
      false: {},
    },
    isInvalid: {
      true: {},
      false: {},
    },
  },
  defaultVariants: {
    size: "md",
    variant: "bordered",
    labelPlacement: "inside",
    fullWidth: "true",
    // radius: "md",
    isDisabled: false,
    isRequired: true,
    isReadOnly: false,
    isInvalid: false,
  },
  compoundVariants: [
    // {
    //   color: "primary",
    //   variant: "bordered",
    //   class: "border-primary-500 data-[hover=true]:border-primary-600 data-[focus=true]:border-primary-600 transition-colors",
    // },
    // {
    //   color: "secondary",
    //   variant: "bordered",
    //   class: "border-secondary-500 data-[hover=true]:border-secondary-600 data-[focus=true]:border-secondary-600 transition-colors",
    // },
    // {
    //   variant: "bordered",
    //   class: "data-[hover=true]:bg-gray-50 ",
    // },
    // {
    //   labelPlacement: "inside",
    //   class: "[&>label]:!text-[12px] [&>label]:!font-normal [&>label]:!text-[#11181C] [&>label]:!font-inter",
    // },
    // {
    //   size: "sm",
    //   class: "text-sm min-h-10",
    // },
    // {
    //   size: "lg",
    //   class: "text-sm min-h-12 [&>label]:!text-[12px] [&>label]:!font-normal [&>label]:!text-[#11181C] [&>label]:!font-inter",
    // },
  ],
});

// ✅ Wrapper component with string defaultValue + optional noOfDays + isActive control
export const DatePickerAppi: React.FC<{
  defaultValue?: string | null;
  onChange: (value: string | null) => void;
  startDate?: string;
  endDate?: string;
  noOfDays?: number; // optional
  isActive?: string | boolean | number | null; // optional - controls if picker is active
  yearOffset?: string | number; // optional - years to subtract from current date (e.g., "18" or 18)
  showYearPicker?: boolean; // optional - enable modern year picker with range 1900-2100
  isRequired?: boolean;
  validate?: (value: string | null) => string | null;
  [key: string]: any;
}> = ({
  defaultValue,
  onChange,
  startDate,
  endDate,
  noOfDays,
  isActive,
  yearOffset,
  showYearPicker = true,
  isRequired = false,
  validate,
  ...props
}) => {
  // Determine if the picker should be active
  // If isActive is not provided (undefined), default to active (true)
  // Only apply inactive behavior when isActive is explicitly provided and falsy
  const isPickerActive = isActive === undefined ? true : Boolean(isActive);

  // State to manage the current date value
  const [currentDateValue, setCurrentDateValue] = useState<DateValue | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);

  // Function to calculate date based on year offset
  const calculateDateFromOffset = (
    offset: string | number
  ): DateValue | null => {
    try {
      const offsetYears =
        typeof offset === "string" ? parseInt(offset, 10) : offset;
      if (isNaN(offsetYears)) return null;

      const currentDate = new Date();
      const targetYear = currentDate.getFullYear() - offsetYears;
      const targetMonth = currentDate.getMonth() + 1; // getMonth() is 0-based
      const targetDay = currentDate.getDate();

      const calculatedDateString = `${targetYear}-${targetMonth.toString().padStart(2, "0")}-${targetDay.toString().padStart(2, "0")}`;
      console.log(
        `📅 DatePicker yearOffset calculation: ${offsetYears} years ago from ${currentDate.getFullYear()}-${targetMonth}-${targetDay} = ${calculatedDateString}`
      );

      return parseDate(calculatedDateString);
    } catch (error) {
      console.warn("Failed to calculate date from offset:", offset, error);
      return null;
    }
  };

  // Function to parse date string to DateValue
  const parseDateString = (dateString: string | null): DateValue | null => {
    try {
      if (dateString && dateString.trim() !== "") {
        // Check if it's a numeric string (year offset)
        const numericValue = parseInt(dateString.trim(), 10);
        if (!isNaN(numericValue) && dateString.trim().length <= 3) {
          // Treat as year offset (e.g., "18", "25")
          return calculateDateFromOffset(numericValue);
        }

        // Ensure the date string is in the correct format (YYYY-MM-DD)
        const normalizedDate = dateString.includes("T")
          ? dateString.split("T")[0]
          : dateString;
        return parseDate(normalizedDate);
      }
    } catch (error) {
      console.warn("Failed to parse date:", dateString, error);
    }
    return null;
  };

  // Calculate focused date (where calendar opens) based on yearOffset
  const focusedDate = React.useMemo(() => {
    if (yearOffset !== undefined) {
      const calculated = calculateDateFromOffset(yearOffset);
      console.log(
        `📅 DatePicker focusedDate with yearOffset ${yearOffset}:`,
        calculated?.toString()
      );
      return calculated;
    }
    // If no yearOffset, focus on current date
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1;
    const currentDay = today.getDate();
    try {
      const currentDateValue = parseDate(
        `${currentYear}-${currentMonth.toString().padStart(2, "0")}-${currentDay.toString().padStart(2, "0")}`
      );
      console.log(
        `📅 DatePicker focusedDate (current):`,
        currentDateValue?.toString()
      );
      return currentDateValue;
    } catch {
      return null;
    }
  }, [yearOffset]);

  // Update internal state when defaultValue changes (actual selected value)
  useEffect(() => {
    if (defaultValue) {
      // Only parse actual date strings, not numeric offsets
      const numericValue = parseInt(defaultValue.trim(), 10);
      if (!isNaN(numericValue) && defaultValue.trim().length <= 3) {
        // If defaultValue is numeric offset, don't set as selected value
        setCurrentDateValue(null);
      } else {
        const parsedDate = parseDateString(defaultValue);
        setCurrentDateValue(parsedDate);
      }
    } else {
      setCurrentDateValue(null);
    }
  }, [defaultValue]);

  // Convert startDate to DateValue
  let minValue: DateValue | undefined;

  try {
    if (startDate) {
      minValue = parseDate(startDate);
    } else if (showYearPicker) {
      // Set minimum year to 1900 for modern year picker
      minValue = parseDate("1900-01-01");
    }
  } catch {
    minValue = undefined;
  }

  // Calculate maxValue if noOfDays is provided
  let maxValue: DateValue | undefined;

  if (minValue && noOfDays) {
    if (minValue instanceof CalendarDate) {
      maxValue = addDaysToDate(minValue, noOfDays);
    }
  } else if (endDate) {
    try {
      maxValue = parseDate(endDate);
    } catch {
      maxValue = undefined;
    }
  } else if (showYearPicker) {
    // Set maximum year to 2100 for modern year picker
    try {
      maxValue = parseDate("2100-12-31");
    } catch {
      maxValue = undefined;
    }
  }

  return (
    <DatePickerAppiWrapper
      {...props}
      className={`${props.className || ""} ${!isPickerActive ? "opacity-50 cursor-not-allowed" : ""}}`}
      value={currentDateValue}
      defaultValue={currentDateValue || focusedDate} // Use focusedDate as fallback for navigation
      placeholderValue={focusedDate} // Alternative prop for initial calendar view
      // Enhanced year picker properties
      errorMessage={error || props.errorMessage}
      isDisabled={!isPickerActive}
      isRequired={isRequired}
      isDateUnavailable={(date) => {
        if (!isPickerActive) return true; // All dates unavailable when inactive
        if (minValue && date.compare(minValue) < 0) return true;
        if (maxValue && date.compare(maxValue) > 0) return true;

        return false;
      }}
      isInvalid={!!error || props.isInvalid}
      isReadOnly={!isPickerActive}
      maxValue={maxValue}
      minValue={minValue}
      showMonthAndYearPickers={showYearPicker}
      onBlur={(e) => {
        // Call original onBlur if provided
        if (props.onBlur) {
          props.onBlur(e);
        }
      }}
      onChange={(date: DateValue | null) => {
        if (!isPickerActive) return; // Prevent onChange when inactive

        // Validate date is within allowed range before accepting
        if (date) {
          // Check if date is before minValue (startDate)
          if (minValue && date.compare(minValue) < 0) {
            console.warn(
              "Selected date is before startDate, ignoring:",
              date.toString()
            );

            return; // Don't accept the date
          }

          // Check if date is after maxValue (endDate or calculated from noOfDays)
          if (maxValue && date.compare(maxValue) > 0) {
            console.warn(
              "Selected date is after endDate/maxValue, ignoring:",
              date.toString()
            );

            return; // Don't accept the date
          }
        }

        // Update internal state
        setCurrentDateValue(date);

        const dateStr = date ? date.toString() : null;

        // Custom validation
        if (validate && typeof validate === "function") {
          const validationError = validate(dateStr);
          setError(validationError || null);
        }

        // Call the onChange callback
        onChange(dateStr);
      }}
      onFocus={(e) => {
        // Prevent focus if picker is inactive
        if (!isPickerActive) {
          e.preventDefault();

          // e.target.blur();
          return;
        }
        // Call original onFocus if provided
        if (props.onFocus) {
          props.onFocus(e);
        }
      }}
    />
  );
};

function addDaysToDate(date: CalendarDate, days: number): CalendarDate {
  const newDate = new Date(date.year, date.month - 1, date.day + days);

  return new CalendarDate(
    newDate.getFullYear(),
    newDate.getMonth() + 1,
    newDate.getDate()
  );
}
