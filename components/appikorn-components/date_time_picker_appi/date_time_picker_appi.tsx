import React, { useState, useEffect } from "react";
import { DateRangePicker } from "@heroui/react";
import {
  parseZonedDateTime,
  ZonedDateTime,
  now,
} from "@internationalized/date";
import { extendVariants } from "@heroui/system";

interface DateRangeValue {
  start: ZonedDateTime;
  end: ZonedDateTime;
}

export interface DateRangeValidationRule {
  minDays?: number;
  maxDays?: number;
  message?: string;
}

interface DateTimeRangePickerAppiProps {
  label?: string;
  defaultStartDate?: string;
  defaultEndDate?: string;
  defaultDurationDays?: number;
  visibleMonths?: number;
  hideTimeZone?: boolean;
  isDisabled?: boolean;
  isReadOnly?: boolean;
  isRequired?: boolean;
  description?: string;
  errorMessage?: string;
  className?: string;
  onChange?: (value: any) => void;
  onComplete?: (value: any) => void;
  granularity?: "day" | "hour" | "minute" | "second";
  validation?: DateRangeValidationRule[];
  color?:
    | "default"
    | "primary"
    | "secondary"
    | "success"
    | "warning"
    | "danger";
  size?: "sm" | "md" | "lg";
  variant?: "flat" | "bordered" | "faded" | "underlined";
  validate?: (value: DateRangeValue | null) => string | null;
  [key: string]: any;
}

export const DateTimeRangePickerAppiBase = extendVariants(DateRangePicker, {
  variants: {
    color: {
      default: {},
      primary: {},
      secondary: {},
      success: {},
      warning: {},
      danger: {},
    },
    size: { md: {}, sm: { label: "text-sm" } },
    fullWidth: { true: { base: "w-full" }, false: {} },
  },
  defaultVariants: {
    size: "md",
    color: "primary",
    variant: "bordered",
    labelPlacement: "inside",
    fullWidth: true,
  },
  compoundVariants: [
    {
      color: "primary",
      variant: "bordered",
      class:
        " border-primary-500 data-[hover=true]:border-primary-600 data-[focus=true]:border-primary-700 transition-colors",
    },
    {
      color: "secondary",
      variant: "bordered",
      class:
        " border-secondary-500 data-[hover=true]:border-secondary-600 data-[focus=true]:border-secondary-700 transition-colors",
    },
    {
      color: "danger",
      variant: "bordered",
      class:
        " border-danger-500 data-[hover=true]:border-danger-600 data-[focus=true]:border-danger-700 transition-colors",
    },
  ],
});

// 🔥 Utility: Detect valid ISO Zoned format
const isValidISOZoned = (str?: string) =>
  !!str?.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\[.+\]$/);

// 🔥 Utility: Fix old "YYYY-MM-DD HH:mm:ss" format → Proper ISO Zoned
const fixOldFormat = (str?: string) => {
  if (!str) return "";
  if (isValidISOZoned(str)) return str;

  // Convert "2025-11-03 14:08:33" → "2025-11-03T14:08:33[Asia/Kolkata]"
  if (str.includes(" ")) {
    return str.replace(" ", "T") + "[Asia/Kolkata]";
  }

  return str;
};

// 🔥 Convert ZonedDateTime → ISO string
const toISO = (d: ZonedDateTime) => {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.year}-${pad(d.month)}-${pad(d.day)}T${pad(d.hour)}:${pad(
    d.minute
  )}:${pad(d.second)}[${d.timeZone}]`;
};

export const DateTimeRangePickerAppi = (
  props: DateTimeRangePickerAppiProps
) => {
  const {
    label = "Select date range",
    defaultStartDate,
    defaultEndDate,
    defaultDurationDays = 7,
    visibleMonths = 2,
    hideTimeZone = true,
    isDisabled = false,
    isReadOnly = false,
    isRequired = false,
    description,
    errorMessage = "",
    className = "w-full",
    onChange,
    onComplete,
    granularity = "minute",
    validation,
    color = "primary",
    validate,
    ...rest
  } = props;

  const currentDateTime = now("Asia/Kolkata");

  // ⭐ SAFE Default value generator
  const getDefaultValue = (): DateRangeValue | null => {
    if (defaultStartDate && defaultEndDate) {
      const startISO = fixOldFormat(defaultStartDate);
      const endISO = fixOldFormat(defaultEndDate);

      try {
        return {
          start: parseZonedDateTime(startISO),
          end: parseZonedDateTime(endISO),
        };
      } catch (e) {
        console.warn("Invalid date passed, falling back to NOW:", e);
      }
    }

    return null;
  };

  // Initialize state with default value immediately to prevent clearing on reload
  const [value, setValue] = useState<DateRangeValue | null>(() =>
    getDefaultValue()
  );
  const [error, setError] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [touched, setTouched] = useState(false);

  // Update value when defaultStartDate or defaultEndDate changes
  useEffect(() => {
    if (defaultStartDate && defaultEndDate) {
      const startISO = fixOldFormat(defaultStartDate);
      const endISO = fixOldFormat(defaultEndDate);

      try {
        const newValue = {
          start: parseZonedDateTime(startISO),
          end: parseZonedDateTime(endISO),
        };
        setValue(newValue);
      } catch (e) {
        console.warn("Invalid date passed in useEffect:", e);
        setValue(null);
      }
    } else if (!defaultStartDate && !defaultEndDate) {
      setValue(null);
    }
  }, [defaultStartDate, defaultEndDate]);

  const validateValue = (val: DateRangeValue | null) => {
    if (!val && isRequired) return "Date range is required";

    // Custom validation callback
    if (validate && typeof validate === "function") {
      const customError = validate(val);
      if (customError) return customError;
    }

    if (!val || !validation) return "";

    const start = val.start.toDate();
    const end = val.end.toDate();
    const daysDiff = Math.ceil((end.getTime() - start.getTime()) / 86400000);

    for (const rule of validation) {
      if (rule.minDays && daysDiff < rule.minDays)
        return rule.message || `Minimum ${rule.minDays} days required`;
      if (rule.maxDays && daysDiff > rule.maxDays)
        return rule.message || `Maximum ${rule.maxDays} days allowed`;
    }

    return "";
  };

  const handleValueChange = (val: any) => {
    setTouched(true);
    const dateRangeValue = val as DateRangeValue | null;
    setValue(dateRangeValue);

    if (validation || isRequired || validate) {
      setError(validateValue(dateRangeValue));
    }

    if (dateRangeValue?.start && dateRangeValue?.end) {
      const output = {
        startDate: toISO(dateRangeValue.start),
        endDate: toISO(dateRangeValue.end),
      };

      onChange?.(output);
      onComplete?.(output);
    } else {
      onChange?.(null);
      onComplete?.(null);
    }
  };

  const displayError = errorMessage || error;
  const shouldShowError = touched && !!displayError;

  return (
    <div className={`relative min-h-[45px] mb-1 ${className}`}>
      <DateTimeRangePickerAppiBase
        {...rest}
        classNames={{
          label: "truncate",
          input:
            "truncate max-w-full overflow-hidden text-ellipsis text-[12px]",
          inputWrapper: "overflow-hidden",
          base: "overflow-hidden",
        }}
        label={
          label ? (
            <span>
              {label}
              {isRequired && <span className="text-danger ml-0.5">*</span>}
            </span>
          ) : undefined
        }
        value={value || undefined}
        onChange={handleValueChange}
        onBlur={() => setTouched(true)}
        isOpen={isOpen}
        onOpenChange={(open) => {
          setIsOpen(open);
          if (!open) setTouched(true);
        }}
        visibleMonths={visibleMonths}
        hideTimeZone={hideTimeZone}
        isDisabled={isDisabled}
        isReadOnly={isReadOnly}
        isRequired={false} // Suppress native required validation
        description={description}
        granularity={granularity}
        hourCycle={12} // Enable 12-hour format with AM/PM
        color={shouldShowError ? "danger" : color}
        size="md"
        isInvalid={shouldShowError}
        className="rounded-sm 
        [&.text-foreground-500]:text-[10px] md:[&.text-foreground-500]:text-sm"
        errorMessage=""
        CalendarBottomContent={
          <div className="flex justify-end gap-2 px-3 py-2 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setIsOpen(false)}
              className="px-4 py-1.5 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-md transition-colors"
            >
              Apply
            </button>
          </div>
        }
      />

      {shouldShowError && (
        <div className="absolute left-0 top-full text-xs mt-0.5 text-danger-500 z-10">
          {displayError}
        </div>
      )}
    </div>
  );
};

export default DateTimeRangePickerAppi;
