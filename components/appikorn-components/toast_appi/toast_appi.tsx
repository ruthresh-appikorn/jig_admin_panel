// ToastAppi.tsx
import React, { useEffect, useState } from "react";
import { Card, CardBody } from "@heroui/card";
import { Button } from "@heroui/button";
import { CheckCircle, XCircle, AlertTriangle, Info, X } from "lucide-react";
import { extendVariants } from "@heroui/system";

// Toast wrapper with clean, flat styles
export const ToastAppiWrapper = extendVariants(Card, {
  variants: {
    level: {
      success: {
        base: "border border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800",
      },
      error: {
        base: "border border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800",
      },
      warning: {
        base: "border border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-800",
      },
      info: {
        base: "border border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800",
      },
    },
    size: {
      sm: { base: "max-w-sm" },
      md: { base: "max-w-md" },
      lg: { base: "max-w-lg" },
      xl: { base: "max-w-xl" },
    },
  },
  defaultVariants: {
    level: "info",
    size: "md",
  },
});

// Props interface
export interface ToastAppiProps {
  message: string;
  level?: "success" | "error" | "warning" | "info";
  size?: "sm" | "md" | "lg" | "xl";
  duration?: number;
  onClose?: () => void;
  showCloseButton?: boolean;
  className?: string;
  isVisible?: boolean;
  [key: string]: any;
}

// Icon by level
const getToastIcon = (level: string) => {
  switch (level) {
    case "success":
      return <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 dark:text-green-400" />;
    case "error":
      return <XCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 dark:text-red-400" />;
    case "warning":
      return <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600 dark:text-yellow-400" />;
    case "info":
    default:
      return <Info className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400" />;
  }
};

// Text color by level
const getTextColor = (level: string) => {
  switch (level) {
    case "success":
      return "text-green-700 dark:text-green-300";
    case "error":
      return "text-red-700 dark:text-red-300";
    case "warning":
      return "text-yellow-700 dark:text-yellow-300";
    case "info":
    default:
      return "text-blue-700 dark:text-blue-300";
  }
};

export const ToastAppi: React.FC<ToastAppiProps> = ({
  message,
  level = "info",
  size = "md",
  duration = 5000,
  onClose,
  showCloseButton = true,
  className = "",
  isVisible = true,
  ...props
}) => {
  const [visible, setVisible] = useState(isVisible);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setVisible(true);
      setIsAnimating(true);

      // Auto-dismiss
      if (duration > 0) {
        const timer = setTimeout(() => handleClose(), duration);
        return () => clearTimeout(timer);
      }
    }
  }, [isVisible, duration]);

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => {
      setVisible(false);
      onClose?.();
    }, 300);
  };

  if (!visible) return null;

  return (
    <div
      className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-200 ease-out
      ${isAnimating ? "translate-y-0 opacity-100" : "-translate-y-2 opacity-0"}
      px-2 sm:px-0 w-full flex justify-center`}
    >
      <ToastAppiWrapper
        level={level}
        size={size}
        className={`shadow-sm w-full mx-auto sm:w-auto ${className}`}
        {...props}
      >
        {/* ✅ Responsive padding and text */}
        <CardBody className="p-2 sm:px-3 sm:py-2">
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Icon */}
            <div className="flex-shrink-0">{getToastIcon(level)}</div>

            {/* Message */}
            <div className={`flex-1 ${getTextColor(level)}`}>
              <p className="text-[10px] sm:text-sm font-medium leading-snug break-words">
                {message}
              </p>
            </div>

            {/* Close Button */}
            {showCloseButton && (
              <Button
                isIconOnly
                size="sm"
                variant="light"
                className={`flex-shrink-0 min-w-5 w-5 h-5 sm:w-6 sm:h-6 ${getTextColor(level)} 
                hover:bg-black/5 dark:hover:bg-white/5`}
                onPress={handleClose}
              >
                <X className="w-3 h-3 sm:w-4 sm:h-4" />
              </Button>
            )}
          </div>
        </CardBody>
      </ToastAppiWrapper>
    </div>
  );
};

export default ToastAppi;
