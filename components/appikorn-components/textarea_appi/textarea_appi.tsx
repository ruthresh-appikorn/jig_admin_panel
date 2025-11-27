/* eslint-disable prettier/prettier */
import React, { useRef, useState, useEffect } from "react";
import { Textarea } from "@heroui/input";
import { extendVariants } from "@heroui/system";

// Validation rule interface
export interface ValidationRule {
  required?: boolean;
  pattern?: RegExp;
  minLength?: number;
  maxLength?: number;
  message?: string;
}

export const TextareaAppiBase = extendVariants(Textarea, {
  variants: {
    color: {
      // default: {},
      // primary: {},
      // secondary: {},
      // success: {},
      // warning: {},
      // danger: {},
    },
    variant: {
      flat: {},
      bordered: {},
      faded: {},
      underlined: {},
    },
    size: {
      sm: {},
      md: {},
      lg: {},
    },
    radius: {
      none: {},
      sm: {},
      md: {},
      lg: {},
      full: {},
    },
    labelPlacement: {
      inside: {},
      outside: {},
      "outside-left": {},
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
    radius: "md",
    labelPlacement: "inside",
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
      color: "danger",
      variant: "bordered",
      class:
        "border-danger-500 data-[hover=true]:border-danger-600 data-[focus=true]:border-danger-600 transition-colors",
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
      class: "text-sm min-h-20",
    },
    {
      size: "md",
      class: "text-sm min-h-24",
    },
    {
      size: "lg",
      class:
        "text-sm min-h-28 [&>label]:!text-[12px] [&>label]:!font-normal [&>label]:!text-[#11181C] [&>label]:!font-inter",
    },
  ],
});

export interface TextareaAppiProps {
  defaultValue?: string;
  value?: string;
  onChange?: (value: string) => void; // Now returns string value directly
  onValueChange?: (value: string) => void;
  onComplete?: (value: string) => void;
  label?: string;
  placeholder?: string;
  description?: string;
  errorMessage?: string;
  isRequired?: boolean;
  isDisabled?: boolean;
  isReadOnly?: boolean;
  isInvalid?: boolean;
  validation?: ValidationRule[];
  minRows?: number;
  maxRows?: number;
  size?: "sm" | "md" | "lg";
  variant?: "flat" | "bordered" | "faded" | "underlined";
  color?:
    | "default"
    | "primary"
    | "secondary"
    | "success"
    | "warning"
    | "danger";
  radius?: "none" | "sm" | "md" | "lg" | "full";
  labelPlacement?: "inside" | "outside" | "outside-left";
  fullWidth?: boolean;
  className?: string;
  classNames?: {
    base?: string;
    label?: string;
    inputWrapper?: string;
    input?: string;
    description?: string;
    errorMessage?: string;
  };
  validate?: (value: string) => string | null;
  [key: string]: any;
}

export const TextareaAppi: React.FC<TextareaAppiProps> = ({
  defaultValue = "",
  value,
  onChange,
  onValueChange,
  onComplete,
  isRequired = false,
  validation,
  errorMessage = "",
  isInvalid = false,
  validate,
  ...rest
}) => {
  const [internalValue, setInternalValue] = useState(value ?? defaultValue);
  const [error, setError] = useState<string>("");
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const isControlled = value !== undefined;

  // Validation function
  const validateValue = (val: string) => {
    // Check isRequired first
    if (isRequired && !val.trim()) {
      return "This field is required";
    }

    // Custom validation callback
    if (validate && typeof validate === "function") {
      const customError = validate(val);
      if (customError) return customError;
    }

    // Then check custom validation rules
    if (!validation) return "";

    for (const rule of validation) {
      if (rule.required && !val.trim()) {
        return rule.message || "This field is required";
      }
      if (rule.pattern && val && !rule.pattern.test(val)) {
        return rule.message || "Invalid format";
      }
      if (rule.minLength && val.length < rule.minLength) {
        return rule.message || `Minimum ${rule.minLength} characters required`;
      }
      if (rule.maxLength && val.length > rule.maxLength) {
        return rule.message || `Maximum ${rule.maxLength} characters allowed`;
      }
    }
    return "";
  };

  // Sync with controlled value changes
  useEffect(() => {
    if (isControlled) {
      setInternalValue(value || "");
    }
  }, [value, isControlled]);

  // Sync with defaultValue changes for uncontrolled component
  useEffect(() => {
    if (!isControlled) {
      setInternalValue(defaultValue || "");
    }
  }, [defaultValue, isControlled]);

  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = event.target.value;

    // Update internal state for uncontrolled component
    if (!isControlled) {
      setInternalValue(newValue);
    }

    // Validate if validation rules are provided or isRequired is true
    if (validation || isRequired || validate) {
      const validationError = validateValue(newValue);
      setError(validationError);
    }

    // Call onChange if provided (now returns string value directly)
    if (onChange) {
      onChange(newValue);
    }

    // Call onValueChange if provided
    if (onValueChange) {
      onValueChange(newValue);
    }

    // Debounced onComplete callback
    if (onComplete) {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      debounceRef.current = setTimeout(() => {
        onComplete(newValue);
      }, 500);
    }
  };

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  // Use external error if provided, otherwise use internal validation error
  const displayError = errorMessage || error;
  const isFieldInvalid = isInvalid || !!error;

  return (
    <div className="relative min-h-[45px]">
      {" "}
      {/* Fixed height container to prevent layout shift */}
      <TextareaAppiBase
        {...rest}
        value={isControlled ? value : internalValue}
        onChange={handleChange}
        isInvalid={isFieldInvalid}
        errorMessage="" 
        className={"bg-transparent dark:bg-transparent   focus:border-blue-500 focus:ring-1 focus:ring-blue-400/30 transition-all"}// Don't show error in the textarea component
      />
      {/* Custom error message positioned absolutely */}
      {displayError && (
        <div className="absolute left-0 top-full mt-1 text-xs text-danger-500 z-10">
          {displayError}
        </div>
      )}
    </div>
  );
};
