// DropdownChipsAppi.tsx
import { Select, SelectItem } from "@heroui/select";
import { Chip } from "@heroui/chip";
import { extendVariants } from "@heroui/system";
import React, { useState, useEffect } from "react";
import { X } from "lucide-react";

import { AvatarAppi } from "../avatar_appi";

// Extend HeroUI Select variants (reusing from DropdownAppi)
export const DropdownChipsAppiWrapper = extendVariants(Select, {
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
    size: "lg",
    // color: "primary",
    variant: "bordered",
    // radius: "md",
    labelPlacement: "inside",
    isDisabled: false,
    isRequired: false,
    isReadOnly: false,
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
      class: " data-[hover=true]:bg-gray-50 ",
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

// Interface for dropdown items with image support
export interface DropdownChipsItem {
  label: string;
  code?: string;
  image?: string; // URL or path to image
  avatar?: string; // Alternative to image for avatar display
}

// Main component interface
export interface DropdownChipsAppiProps {
  defaultValues?: string[] | DropdownChipsItem[]; // Array of default selected codes/labels OR objects
  onChange: (selectedItems: DropdownChipsItem[]) => void;
  items: DropdownChipsItem[]; // Array of dropdown items with name and image
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
  validate?: (selectedItems: DropdownChipsItem[]) => string | null;
  [key: string]: any;
}

export const DropdownChipsAppi: React.FC<DropdownChipsAppiProps> = ({
  defaultValues = [],
  onChange,
  items,
  isActive,
  placeholder = "Select items",
  label = "Select Items",
  className = "",
  isRequired = false,
  chipColor = "primary",
  chipVariant = "solid",
  maxChips,
  validate,
  ...props
}) => {
  const isDropdownActive = isActive === undefined ? true : Boolean(isActive);

  // Initialize state with defaultValues
  const [selectedItems, setSelectedItems] = useState<DropdownChipsItem[]>(
    () => {
      if (!defaultValues || defaultValues.length === 0) return [];
      // Filter items that match defaultValues codes
      // Assuming defaultValues is an array of codes (strings) for this new implementation
      // Or it could be objects if passed that way.
      if (typeof defaultValues[0] === "object") {
        return defaultValues as DropdownChipsItem[];
      }

      return items.filter((item) =>
        (defaultValues as string[]).includes(item.code || item.label),
      );
    },
  );

  const [error, setError] = useState<string>("");

  // Sync state if defaultValues changes externally (optional, but good practice)
  useEffect(() => {
    if (defaultValues && defaultValues.length > 0) {
      let newSelection: DropdownChipsItem[] = [];

      if (typeof defaultValues[0] === "object") {
        newSelection = defaultValues as DropdownChipsItem[];
      } else {
        newSelection = items.filter((item) =>
          (defaultValues as string[]).includes(item.code || item.label),
        );
      }
      setSelectedItems(newSelection);
    } else {
      setSelectedItems([]);
    }
  }, [defaultValues, items]);

  // Validation function
  const validateSelection = (currentSelection: DropdownChipsItem[]) => {
    if (isRequired && currentSelection.length === 0) {
      return "Please fill in this field.";
    }

    if (validate && typeof validate === "function") {
      return validate(currentSelection) || "";
    }

    return "";
  };

  // Handle dropdown selection
  const handleSelectionChange = (keys: any) => {
    const selectedKey = Array.from(keys)[0] as string;

    if (!selectedKey) return;

    // Find the selected item
    const selectedItem = items.find(
      (item) => (item.code || item.label) === selectedKey,
    );

    if (selectedItem) {
      // Check for duplicates
      const isDuplicate = selectedItems.some(
        (item) =>
          (item.code || item.label) ===
          (selectedItem.code || selectedItem.label),
      );

      if (!isDuplicate) {
        // Check max chips limit
        if (maxChips && selectedItems.length >= maxChips) {
          return; // Don't add if max limit reached
        }

        const newSelectedItems = [...selectedItems, selectedItem];

        setSelectedItems(newSelectedItems);

        // Validate
        const validationError = validateSelection(newSelectedItems);

        setError(validationError);

        onChange(newSelectedItems);
      }
    }

    // Clear the selection to allow re-selection of the same item
    // This is a hack because we are using the Select as a trigger but managing selection manually
    if (keys.size > 0) {
      // We can't easily clear the internal state of HeroUI Select without controlling it fully
      // But since we pass selectedKeys={[]}, it should reset visually
    }
  };

  // Handle chip removal
  const handleChipRemove = (itemToRemove: DropdownChipsItem) => {
    const newSelectedItems = selectedItems.filter(
      (item) =>
        (item.code || item.label) !== (itemToRemove.code || itemToRemove.label),
    );

    setSelectedItems(newSelectedItems);

    // Validate
    const validationError = validateSelection(newSelectedItems);

    setError(validationError);

    onChange(newSelectedItems);
  };

  // Get available items (exclude already selected ones)
  const availableItems = items.filter(
    (item) =>
      !selectedItems.some(
        (selected) =>
          (selected.code || selected.label) === (item.code || item.label),
      ),
  );

  const isInvalid =
    (isRequired && selectedItems.length === 0 && error !== "") ||
    !!error ||
    props.isInvalid;
  const displayErrorMessage =
    error ||
    props.errorMessage ||
    (isRequired && selectedItems.length === 0
      ? "Please fill in this field."
      : "");

  return (
    <div className={`relative min-h-[45px] ${className}`}>
      <div className="space-y-2">
        {/* Dropdown */}
        <DropdownChipsAppiWrapper
          {...props}
          aria-controls="dropdown-listbox"
          aria-expanded="true"
          aria-haspopup="listbox"
          aria-label={!label ? "Select items" : undefined}
          className={`${!isDropdownActive ? "opacity-50 cursor-not-allowed" : ""}`}
          classNames={{
            label:
              "text-[14px] font-medium text-gray-700 dark:text-gray-300 my-auto",
            trigger:
              "h-14 min-h-[56px] text-[16px] placeholder:text-[16px] dark:text-gray-200",
          }}
          errorMessage={displayErrorMessage}
          isDisabled={
            !isDropdownActive ||
            (maxChips ? selectedItems.length >= maxChips : false)
          }
          isInvalid={isInvalid}
          isReadOnly={!isDropdownActive}
          isRequired={isRequired}
          label={label}
          placeholder={placeholder}
          role="combobox"
          selectedKeys={[]} // Always empty since we handle selection manually
          onBlur={(e) => {
            // Trigger validation on blur
            const validationError = validateSelection(selectedItems);

            setError(validationError);

            if (props.onBlur) {
              props.onBlur(e);
            }
          }}
          onFocus={(e) => {
            if (!isDropdownActive) {
              e.preventDefault();

              return;
            }
            if (props.onFocus) {
              props.onFocus(e);
            }
          }}
          onSelectionChange={handleSelectionChange}
        >
          {availableItems.map((item) => (
            <SelectItem key={item.code || item.label} textValue={item.label}>
              <div className="flex items-center justify-between w-full">
                <span className="flex-1">{item.label}</span>
                {(item.image || item.avatar) && (
                  <AvatarAppi
                    alt={item.label}
                    size="sm"
                    src={item.image || item.avatar}
                  />
                )}
              </div>
            </SelectItem>
          ))}
        </DropdownChipsAppiWrapper>

        {/* Selected Items as Chips */}
        {selectedItems.length > 0 && (
          <div
            aria-label="Selected items"
            className="flex flex-wrap gap-1.5"
            id="dropdown-listbox"
            role="listbox"
          >
            {selectedItems.map((item, index) => (
              <Chip
                key={`${item.code || item.label}-${index}`}
                avatar={
                  item.image || item.avatar ? (
                    <AvatarAppi
                      alt={item.label}
                      size="xs"
                      src={item.image || item.avatar}
                    />
                  ) : undefined
                }
                className="h-7 text-xs font-medium"
                color={chipColor}
                endContent={
                  <button
                    aria-label={`Remove ${item.label}`}
                    className="ml-1 hover:bg-black/20 rounded-full p-0.5 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleChipRemove(item);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === " " || e.key === "Enter") {
                        e.preventDefault();
                        e.stopPropagation();
                        handleChipRemove(item);
                      }
                    }}
                  >
                    <X size={10} />
                  </button>
                }
                size="sm"
                variant={chipVariant}
                onClose={() => handleChipRemove(item)}
              >
                {item.label}
              </Chip>
            ))}
          </div>
        )}

        {/* Max chips indicator */}
        {maxChips && (
          <div className="text-xs text-gray-500 font-medium">
            {selectedItems.length}/{maxChips} items selected
          </div>
        )}
      </div>
    </div>
  );
};

export default DropdownChipsAppi;
