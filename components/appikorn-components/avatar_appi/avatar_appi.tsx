// AvatarAppi.tsx
import { Avatar } from "@heroui/avatar";
import { extendVariants } from "@heroui/system";
import React from "react";

// Extend HeroUI Avatar variants for consistent sizing
export const AvatarAppiWrapper = extendVariants(Avatar, {
  variants: {
    size: {
      xs: {
        base: "w-4 h-4 text-xs",
      },
      sm: {
        base: "w-6 h-6 text-xs",
      },
      md: {
        base: "w-8 h-8 text-sm",
      },
      lg: {
        base: "w-10 h-10 text-sm",
      },
      xl: {
        base: "w-12 h-12 text-base",
      },
    },
  },
  defaultVariants: {
    size: "sm",
  },
});

// Interface for avatar props
export interface AvatarAppiProps {
  src?: string;
  alt?: string;
  name?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
  [key: string]: any;
}

export const AvatarAppi: React.FC<AvatarAppiProps> = ({
  src,
  alt,
  name,
  size = "sm",
  className = "",
  ...props
}) => {
  return (
    <AvatarAppiWrapper
      {...props}
      src={src}
      alt={alt || name}
      name={name}
      size={size}
      className={`flex-shrink-0 ${className}`}
    />
  );
};

export default AvatarAppi;
