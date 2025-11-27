// useToast.ts
import { useContext } from "react";
import { ToastContext } from "./toast_provider";
import { ToastAppiProps } from "./toast_appi";

export const useToast = () => {
  const context = useContext(ToastContext);
  
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }

  const { showToast, hideToast, clearAllToasts } = context;

  // Convenience methods for different toast levels
  const success = (message: string, options?: Partial<ToastAppiProps>) => {
    showToast({
      message,
      level: "success",
      ...options,
    });
  };

  const error = (message: string, options?: Partial<ToastAppiProps>) => {
    showToast({
      message,
      level: "error",
      duration: 7000, // Error messages stay longer by default
      ...options,
    });
  };

  const warning = (message: string, options?: Partial<ToastAppiProps>) => {
    showToast({
      message,
      level: "warning",
      duration: 6000, // Warning messages stay a bit longer
      ...options,
    });
  };

  const info = (message: string, options?: Partial<ToastAppiProps>) => {
    showToast({
      message,
      level: "info",
      ...options,
    });
  };

  const custom = (toast: Omit<ToastAppiProps, 'onClose' | 'isVisible'>) => {
    showToast(toast);
  };

  return {
    // Convenience methods
    success,
    error,
    warning,
    info,
    custom,
    
    // Direct methods
    showToast,
    hideToast,
    clearAllToasts,
  };
};
