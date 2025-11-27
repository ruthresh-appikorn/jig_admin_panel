// DateRangePickerAppi.tsx
import { DateRangePicker } from "@heroui/date-picker";
import { extendVariants } from "@heroui/system";
import { parseDate, DateValue } from "@internationalized/date";
import { RangeValue } from "@react-types/shared";
import React, { useState, useEffect } from "react";

// Validation rule interface
export interface ValidationRule {
  required?: boolean;
  message?: string;
}

// Extend HeroUI DateRangePicker variants
export const DateRangePickerAppiWrapper = extendVariants(DateRangePicker, {
  variants: {
    color: {},
    size: {
      sm: {},
      md: {},
      lg: {},
    },
    labelPlacement: {
      inside: {},
      outside: {},
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
    isDisabled: false,
    isRequired: false,
    isReadOnly: false,
    isInvalid: false,
  },
  compoundVariants: [
    {
      color: "primary",
      variant: "bordered",
      class:
        "border-primary-500 data-[hover=true]:border-primary-600 data-[focus=true]:border-primary-600 transition-colors",
    },
    {
      color: "secondary",
      variant: "bordered",
      class:
        "border-secondary-500 data-[hover=true]:border-secondary-600 data-[focus=true]:border-secondary-600 transition-colors",
    },
    {
      variant: "bordered",
      class: "data-[hover=true]:bg-gray-50 transition-colors",
    },
    {
      labelPlacement: "outside",
      class:
        "[&>label]:!text-[12px] [&>label]:!font-normal [&>label]:!text-[#11181C] [&>label]:!font-inter",
    },
    {
      size: "sm",
      class: "text-sm min-h-10",
    },
    {
      size: "lg",
      class:
        "text-sm min-h-12 [&>label]:!text-[12px] [&>label]:!font-normal [&>label]:!text-[#11181C] [&>label]:!font-inter",
    },
  ],
});

// Interface for date range
export interface DateRange {
  start: string;
  end: string;
}

// Main component interface
export interface DateRangePickerAppiProps {
  defaultValue?: DateRange | null;
  onChange: (range: DateRange | null) => void;
  startDate?: string; // Minimum allowed date
  endDate?: string; // Maximum allowed date
  isActive?: string | boolean | number | null; // Controls if picker is active
  label?: string;
  placeholder?: string;
  isRequired?: boolean;
  validation?: ValidationRule[];
  errorMessage?: string;
  isInvalid?: boolean;
  className?: string;
  validate?: (value: DateRange | null) => string | null;
  [key: string]: any;
}

export const DateRangePickerAppi: React.FC<DateRangePickerAppiProps> = ({
  defaultValue,
  onChange,
  startDate,
  endDate,
  isActive,
  label = "",
  placeholder,
  isRequired = false,
  validation,
  errorMessage = "",
  isInvalid = false,
  className = "",
  validate,
  ...props
}) => {
  const isPickerActive = isActive === undefined ? true : Boolean(isActive);

  const [currentRangeValue, setCurrentRangeValue] = useState<RangeValue<DateValue> | null>(null);
  const [error, setError] = useState<string>("");

  // Validation logic
  const validateValue = (range: DateRange | null) => {
    if (isRequired && (!range || !range.start || !range.end)) {
      return "This field is required";
    }

    // Custom validation callback
    if (validate && typeof validate === "function") {
      const customError = validate(range);
      if (customError) return customError;
    }

    if (!validation) return "";

    for (const rule of validation) {
      if (rule.required && (!range || !range.start || !range.end)) {
        return rule.message || "This field is required";
      }
    }
    return "";
  };

  // Convert string to DateValue safely
  const parseDateString = (dateString: string | null): DateValue | null => {
    try {
      if (dateString && dateString.trim() !== "") {
        const normalized = dateString.includes("T")
          ? dateString.split("T")[0]
          : dateString;
        return parseDate(normalized);
      }
    } catch (error) {
      console.warn("Failed to parse date:", dateString, error);
    }
    return null;
  };

  // Sync defaultValue
  useEffect(() => {
    if (defaultValue?.start && defaultValue?.end) {
      const start = parseDateString(defaultValue.start);
      const end = parseDateString(defaultValue.end);
      if (start && end) setCurrentRangeValue({ start, end });
    } else {
      setCurrentRangeValue(null);
    }
  }, [defaultValue]);

  // Min/max dates
  let minValue: DateValue | undefined;
  let maxValue: DateValue | undefined;
  try {
    if (startDate) minValue = parseDate(startDate);
    if (endDate) maxValue = parseDate(endDate);
  } catch {
    // ignore
  }

  const displayError = errorMessage || error;
  const isFieldInvalid = isInvalid || !!error;

  return (
    <div className={`relative min-h-[45px] mb-1 ${className}`}>
      <DateRangePickerAppiWrapper
        {...props}
        // Hide label if it's empty or whitespace
        label={label?.trim() ? label : undefined}
        className={`${!isPickerActive ? "opacity-50 cursor-not-allowed" : ""}`}
        value={currentRangeValue}
        isDisabled={!isPickerActive}
        isReadOnly={!isPickerActive}
        isInvalid={isFieldInvalid}
        errorMessage=""
        maxValue={maxValue}
        minValue={minValue}
        isRequired={isRequired}
        onBlur={(e) => props.onBlur?.(e)}
        onChange={(range: RangeValue<DateValue> | null) => {
          if (!isPickerActive) return;

          setCurrentRangeValue(range);

          let dateRange: DateRange | null = null;
          if (range?.start && range?.end) {
            dateRange = {
              start: range.start.toString(),
              end: range.end.toString(),
            };
          }

          if (validation || isRequired || validate) {
            const validationError = validateValue(dateRange);
            setError(validationError);
          }

          onChange(dateRange);
        }}
        onFocus={(e) => {
          if (!isPickerActive) {
            e.preventDefault();
            return;
          }
          props.onFocus?.(e);
        }}
      />

      {displayError && (
        <div className="absolute left-0 top-full mt-0.5 text-xs text-danger-500 z-10">
          {displayError}
        </div>
      )}
    </div>
  );
};

export default DateRangePickerAppi;
