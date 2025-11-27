// TabsAppi.tsx
import { Tabs, Tab } from "@heroui/tabs";
import { extendVariants } from "@heroui/system";
import React from "react";

// Extend HeroUI Tabs variants
export const TabsAppiWrapper = extendVariants(Tabs, {
  variants: {
    color: {
      default: {},
      primary: {},
      secondary: {},
      success: {},
      warning: {},
      danger: {},
    },
    variant: {
      solid: {},
      bordered: {},
      light: {},
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
    isDisabled: {
      true: {},
      false: {},
    },
  },
  defaultVariants: {
    size: "lg",
    color: "primary",
    variant: "bordered",
    radius: "md",
    isDisabled: false,
  },
  compoundVariants: [
    {
      color: "primary",
      variant: "bordered",
      class: "border-primary-500 data-[hover=true]:border-primary-600 data-[focus=true]:border-primary-600 transition-colors",
    },
    {
      color: "secondary",
      variant: "bordered",
      class: "border-secondary-500 data-[hover=true]:border-secondary-600 data-[focus=true]:border-secondary-600 transition-colors",
    },
    {
      variant: "bordered",
      class: "bg-white data-[hover=true]:bg-gray-50 shadow-sm",
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

// Interface for tab items
export interface TabItem {
  key: string;
  title: string;
  content?: React.ReactNode;
  isDisabled?: boolean;
}

// ✅ Wrapper component with tabs array and onChange
export const TabsAppi: React.FC<{
  defaultValue?: string;
  onChange: (selectedKey: string) => void;
  tabs: string[]; // Array of tab strings
  label?: string;
  isRequired?: boolean;
  isActive?: string | boolean | number | null; // optional - controls if tabs are active
  [key: string]: any;
}> = ({ defaultValue, onChange, tabs, label, isRequired = false, isActive, ...props }) => {
  // Determine if the tabs should be active
  const isTabsActive = isActive === undefined ? true : Boolean(isActive);

  const handleSelectionChange = (key: any) => {
    if (!isTabsActive) return;
    onChange(String(key));
  };

  return (
    <div className="flex flex-col gap-2">
      {/* Label */}
      {label && (
        <label className="text-[12px] font-normal text-[#11181C] font-inter">
          {label}
          {isRequired && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      
      {/* Tabs */}
      <TabsAppiWrapper
        {...props}
        selectedKey={defaultValue}
        isDisabled={!isTabsActive}
        className={`${props.className || ""} ${!isTabsActive ? "opacity-50 cursor-not-allowed" : ""}`}
        onSelectionChange={handleSelectionChange}
      >
        {tabs.map((tab) => (
          <Tab
            key={tab}
            title={tab}
            isDisabled={!isTabsActive}
          >
          </Tab>
        ))}
      </TabsAppiWrapper>
    </div>
  );
};

export default TabsAppi;
