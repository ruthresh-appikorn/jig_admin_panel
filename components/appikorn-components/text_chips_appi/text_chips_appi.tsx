// TextChipsAppi.tsx
import { Input } from "@heroui/input";
import { Chip } from "@heroui/chip";
import { extendVariants } from "@heroui/system";
import React, { useState, KeyboardEvent, useEffect } from "react";
import { X } from "lucide-react";

// Extend HeroUI Input variants
export const TextChipsInputWrapper = extendVariants(Input, {
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
    size: "sm",
    variant: "bordered",
    labelPlacement: "inside",
    fullWidth: "true",
  },

  // 👇 Border and color styles go here
  compoundVariants: [
    {
      color: "primary",
      variant: "bordered",
      class:
        "rounded-sm border-primary-500 data-[hover=true]:border-primary-600 data-[focus=true]:border-primary-700 transition-colors",
    },
    {
      color: "secondary",
      variant: "bordered",
      class:
        "rounded-sm border-secondary-500 data-[hover=true]:border-secondary-600 data-[focus=true]:border-secondary-700 transition-colors",
    },
    {
      color: "danger",
      variant: "bordered",
      class:
        "rounded-sm border-danger-500 data-[hover=true]:border-danger-600 data-[focus=true]:border-danger-700 transition-colors",
    },
  ],
});

// Main component interface
export interface TextChipsAppiProps {
  defaultValues?: string[]; // Array of default chip values
  onChange: (chips: string[]) => void;
  isActive?: string | boolean | number | null;
  placeholder?: string;
  label?: string;
  className?: string;
  isRequired?: boolean;
  chipColor?:
    | "default"
    | "primary"
    | "secondary"
    | "success"
    | "warning"
    | "danger";
  chipVariant?:
    | "solid"
    | "bordered"
    | "light"
    | "flat"
    | "faded"
    | "shadow"
    | "dot";
  maxChips?: number; // Optional limit on number of chips
  allowDuplicates?: boolean; // Allow duplicate chip values
  validate?: (chips: string[]) => string | null;
  allowEmpty?: boolean; // Allow adding empty values
  [key: string]: any;
}

export const TextChipsAppi: React.FC<TextChipsAppiProps> = ({
  defaultValues = [],
  onChange,
  isActive,
  placeholder = "Type and press Enter to add",
  label = "Add Items",
  className = "",
  isRequired = false,
  chipColor = "primary",
  chipVariant = "solid",
  maxChips,
  allowDuplicates = false,
  validate,
  allowEmpty = false,
  ...props
}) => {
  const isInputActive = isActive === undefined ? true : Boolean(isActive);

  // Initialize state with defaultValues
  const [chips, setChips] = useState<string[]>(defaultValues);
  const [inputValue, setInputValue] = useState<string>("");
  const [error, setError] = useState<string>("");

  // Sync state if defaultValues changes externally
  useEffect(() => {
    if (defaultValues && defaultValues.length > 0) {
      setChips(defaultValues);
    } else {
      setChips([]);
    }
  }, [defaultValues]);

  // Validation function
  const validateChips = (currentChips: string[]) => {
    if (isRequired && currentChips.length === 0) {
      return "Please fill in this field.";
    }

    if (validate && typeof validate === "function") {
      return validate(currentChips) || "";
    }

    return "";
  };

  // Handle adding a chip when Enter is pressed
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addChip();
    }
  };

  // Add chip logic
  const addChip = () => {
    const trimmedValue = inputValue.trim();

    // Don't add if value is empty (unless allowEmpty is true)
    if (!trimmedValue && !allowEmpty) {
      return;
    }

    // Check for duplicates if not allowed
    if (!allowDuplicates && chips.includes(trimmedValue)) {
      return;
    }

    // Check max chips limit
    if (maxChips && chips.length >= maxChips) {
      return;
    }

    const newChips = [...chips, trimmedValue];
    setChips(newChips);
    setInputValue("");

    // Validate
    const validationError = validateChips(newChips);
    setError(validationError);

    // Call onChange callback
    onChange(newChips);
  };

  // Handle chip removal
  const handleChipRemove = (index: number) => {
    const newChips = chips.filter((_, i) => i !== index);
    setChips(newChips);

    // Validate
    const validationError = validateChips(newChips);
    setError(validationError);

    // Call onChange callback
    onChange(newChips);
  };

  const isInvalid =
    (isRequired && chips.length === 0 && error !== "") ||
    !!error ||
    props.isInvalid;
  const displayErrorMessage =
    error ||
    props.errorMessage ||
    (isRequired && chips.length === 0 ? "Please fill in this field." : "");

  return (
    <div className={`relative min-h-[45px] ${className}`}>
      <div className="space-y-2">
        {/* Input Field */}
        <TextChipsInputWrapper
          {...props}
          labelPlacement="inside"
          aria-label={!label ? "Type and press Enter to add" : undefined}
          className={`${!isInputActive ? "opacity-50 cursor-not-allowed" : ""}`}
          classNames={{
            label:
              "text-[14px] font-medium text-gray-700 dark:text-gray-300 my-auto",
            inputWrapper: "!h-14 !min-h-[56px]",
            trigger:
              "!h-14 !min-h-[56px] text-[16px] placeholder:text-[16px] dark:text-gray-200",
          }}
          errorMessage={displayErrorMessage}
          isDisabled={
            !isInputActive || (maxChips ? chips.length >= maxChips : false)
          }
          isInvalid={isInvalid}
          isReadOnly={!isInputActive}
          isRequired={isRequired}
          label={label}
          placeholder={placeholder}
          type="text"
          value={inputValue}
          onBlur={(e) => {
            // Trigger validation on blur
            const validationError = validateChips(chips);
            setError(validationError);

            if (props.onBlur) {
              props.onBlur(e);
            }
          }}
          onChange={(e) => setInputValue(e.target.value)}
          onFocus={(e) => {
            if (!isInputActive) {
              e.preventDefault();
              return;
            }
            if (props.onFocus) {
              props.onFocus(e);
            }
          }}
          onKeyDown={handleKeyDown}
        />

        {/* Chips Display */}
        {chips.length > 0 && (
          <div
            aria-label="Added items"
            className="flex flex-wrap gap-0.5"
            role="list"
          >
            {chips.map((chip, index) => (
              <Chip
                key={`${chip}-${index}`}
                className="h-7 text-xs font-medium rounded-sm"
                color={chipColor}
                endContent={
                  <button
                    aria-label={`Remove ${chip}`}
                    className="ml-1 hover:bg-black/20 dark:hover:bg-white/20 rounded-full p-0.5 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleChipRemove(index);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === " " || e.key === "Enter") {
                        e.preventDefault();
                        e.stopPropagation();
                        handleChipRemove(index);
                      }
                    }}
                  >
                    <X size={10} />
                  </button>
                }
                size="md"
                variant={chipVariant}
                onClose={() => handleChipRemove(index)}
              >
                {chip}
              </Chip>
            ))}
          </div>
        )}

        {/* Max chips indicator */}
        {maxChips && (
          <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">
            {chips.length}/{maxChips} items added
          </div>
        )}
      </div>
    </div>
  );
};

export default TextChipsAppi;
