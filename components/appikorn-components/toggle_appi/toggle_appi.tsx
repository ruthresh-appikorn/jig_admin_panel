// ToggleAppi.tsx
import { Switch } from "@heroui/switch";
import { extendVariants } from "@heroui/system";
import React from "react";

// Extend HeroUI Switch variants
export const ToggleAppiWrapper = extendVariants(Switch, {
  variants: {
    color: {
      default: {},
      primary: {},
      secondary: {},
      success: {},
      warning: {},
      danger: {},
    },
    size: {
      sm: {},
      md: {},
      lg: {},
    },
    isDisabled: {
      true: {},
      false: {},
    },
    isRequired: {
      true: {},
      false: {},
    },
  },
  defaultVariants: {
    size: "lg",
    color: "primary",
    isDisabled: false,
    isRequired: false,
  },
  compoundVariants: [
    {
      color: "primary",
      class: "data-[selected=true]:bg-primary-500",
    },
    {
      color: "secondary",
      class: "data-[selected=true]:bg-secondary-500",
    },
    {
      color: "success",
      class: "data-[selected=true]:bg-success-500",
    },
    {
      color: "warning",
      class: "data-[selected=true]:bg-warning-500",
    },
    {
      color: "danger",
      class: "data-[selected=true]:bg-danger-500",
    },
    {
      size: "sm",
      class: "text-sm",
    },
    {
      size: "lg",
      class: "text-sm",
    },
  ],
});

// ✅ Wrapper component with boolean defaultValue and onChange
export const ToggleAppi: React.FC<{
  defaultValue?: boolean;
  onChange: (value: boolean) => void;
  label?: string;
  isActive?: string | boolean | number | null; // optional - controls if toggle is active
  isRequired?: boolean;
  [key: string]: any;
}> = ({ defaultValue = false, onChange, label, isActive, isRequired = false, ...props }) => {
  // Determine if the toggle should be active
  const isToggleActive = isActive === undefined ? true : Boolean(isActive);

  return (
    <div className="flex flex-col gap-1">
      {/* Label */}
      {label && (
        <label className="text-[12px] font-normal text-[#11181C] font-inter">
          {label}
          {isRequired && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      
      {/* Toggle Switch */}
      <ToggleAppiWrapper
        {...props}
        isSelected={defaultValue}
        isDisabled={!isToggleActive}
        isRequired={isRequired}
        className={`${props.className || ""} ${!isToggleActive ? "opacity-50 cursor-not-allowed" : ""}`}
        onValueChange={(value: boolean) => {
          if (!isToggleActive) return;
          onChange(value);
        }}
      />
    </div>
  );
};

export default ToggleAppi;
