import React, { useRef, useState, useEffect } from "react";
import { extendVariants } from "@heroui/system";
import { Input } from "@heroui/react";

export const InputAppiBase = extendVariants(Input, {
  variants: {
    color: {
      // default: {},
      // primary: {},
      // secondary: {},
      // success: {},
      // warning: {},
      // danger: {},
    },
    isDisabled: {},
    size: {
      lg: { label: "text-lg", input: "text-base" },
      md: { label: "text-base", input: "text-sm" },
      sm: { label: "text-sm", input: "text-xs" },
    },
    fontFamily: {},
  },
  defaultVariants: {
    size: "md",
    // color: "primary",
    variant: "flat",
    labelPlacement: "inside",
    fullWidth: "true",
  },

  // 👇 Border and color styles go here
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

export const InputAppi = (props: any) => {
  const { defaultValue = "", onComplete, onChange, validate, ...rest } = props;
  const [value, setValue] = useState(defaultValue || "");
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setValue(defaultValue || "");
  }, [defaultValue]);

  const handleValueChange = (val: string) => {
    setValue(val);

    // Handle custom validation
    if (validate && typeof validate === "function") {
      const validationError = validate(val);
      setError(validationError || null);
    }

    if (onChange) onChange(val);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (onComplete) onComplete(val);
    }, 500);
  };

  return (
    <InputAppiBase
      {...rest}
      errorMessage={error || rest.errorMessage}
      isInvalid={!!error || rest.isInvalid}
      value={value}
      onValueChange={handleValueChange}
    />
  );
};
