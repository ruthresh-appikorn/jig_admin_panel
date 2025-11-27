// DropdownAppi.tsx
import { Select, SelectItem } from "@heroui/select";
import { extendVariants } from "@heroui/system";
import React, { useState, useEffect } from "react";

// Extend HeroUI Select variants
export const DropdownAppiWrapper = extendVariants(Select, {
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
  },
  defaultVariants: {
    size: "md",
    variant: "bordered",
    labelPlacement: "inside",
    isDisabled: false,
    isRequired: false,
    isReadOnly: false,
  },
  compoundVariants: [
    {
      variant: "bordered",
      class: "data-[hover=true]:bg-gray-50",
    },
    {
      size: "sm",
      class: "text-sm min-h-10",
    },
    {
      size: "lg",
      class: "text-sm min-h-12",
    },
  ],
});

// Interface
export interface DropdownItem {
  label: string;
  code?: string;
}

// FINAL DROPDOWN WITH REQUIRED VALIDATION

export const DropdownAppi: React.FC<{
  defaultValue?: string | null;
  onChange: (
    selectedLabel: string | null,
    selectedCode?: string | null,
  ) => void;
  list: string[];
  listOfCode?: string[];
  isActive?: string | boolean | number | null;
  isRequired?: boolean;
  validate?: (label: string | null, code?: string | null) => string | null;
  [key: string]: any;
}> = ({
  defaultValue,
  onChange,
  list,
  listOfCode,
  isActive,
  isRequired,
  validate,
  ...props
}) => {
  const [invalid, setInvalid] = useState(false);
  const [error, setError] = useState<string>("");
  const [touched, setTouched] = useState(false);

  const isDropdownActive = isActive === undefined ? true : Boolean(isActive);

  // Validate when value changes AFTER user interaction OR when parent triggers validation
  useEffect(() => {
    // If there's a value, clear validation errors
    if (defaultValue) {
      setInvalid(false);
      setError("");

      return;
    }

    // Show validation error if:
    // 1. User has interacted (touched) AND field is required, OR
    // 2. Parent is explicitly setting isInvalid (form submit validation)
    if (isRequired && (touched || props.isInvalid)) {
      setInvalid(true);
      setError("Please fill in this field.");
    } else {
      setInvalid(false);
      setError("");
    }
  }, [defaultValue, isRequired, touched, props.isInvalid]);

  const dropdownItems: DropdownItem[] = list.map((label, index) => ({
    label,
    code: listOfCode?.[index] || label,
  }));

  // map defaultValue to selected key
  const getSelectedKeys = () => {
    if (!defaultValue) return [];

    const matched = dropdownItems.find(
      (item) => item.code === defaultValue || item.label === defaultValue,
    );

    return matched ? [matched.code || matched.label] : [];
  };

  // handle user selecting value
  const handleSelectionChange = (keys: any) => {
    setTouched(true);
    const selectedKey = Array.from(keys)[0] as string;

    if (!selectedKey || selectedKey === "") {
      if (isRequired) {
        setInvalid(true);
        setError("Please fill in this field.");
      } else {
        setInvalid(false);
        setError("");
      }
      onChange(null, null);

      return;
    }

    const selected = dropdownItems.find(
      (item) => (item.code || item.label) === selectedKey,
    );

    const label = selected?.label || null;
    const code = selected?.code || null;

    // Custom validation
    if (validate && typeof validate === "function") {
      const validationError = validate(label, code);

      if (validationError) {
        setInvalid(true);
        setError(validationError);
      } else {
        // Clear error if validation passes
        setInvalid(false);
        setError("");
      }
    } else {
      // Clear error if no custom validation and value is selected
      setInvalid(false);
      setError("");
    }

    onChange(label, code);
  };

  // when user blurs without selecting → required error
  const triggerRequiredCheck = () => {
    setTouched(true);

    if (isRequired && getSelectedKeys().length === 0) {
      setInvalid(true);
      setError("Please fill in this field.");
    }
  };

  // Always show validation errors (matching InputAppi and DatePickerAppi behavior)
  const finalIsInvalid = invalid || props.isInvalid;
  const finalErrorMessage =
    error ||
    props.errorMessage ||
    (invalid ? "Please fill in this field." : "");

  return (
    <DropdownAppiWrapper
      {...props}
      disallowEmptySelection={true}
      className={`${props.className || ""} ${!isDropdownActive ? "opacity-50 cursor-not-allowed" : ""}`}
      errorMessage={finalErrorMessage}
      isDisabled={!isDropdownActive}
      isInvalid={finalIsInvalid}
      isReadOnly={!isDropdownActive}
      isRequired={isRequired}
      label={
        isRequired ? (
          <span>
            {props.label} 
          </span>
        ) : (
          props.label
        )
      }
      selectedKeys={getSelectedKeys()}
      onBlur={triggerRequiredCheck}
      onSelectionChange={handleSelectionChange}
    >
      {dropdownItems.map((item) => (
        <SelectItem key={item.code || item.label}>{item.label}</SelectItem>
      ))}
    </DropdownAppiWrapper>
  );
};
