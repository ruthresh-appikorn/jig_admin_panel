/**
 * Global toast utilities for calling toast from anywhere in the app
 * Can be used from controllers, API functions, or any other non-component code
 */

import { ToastAppiProps } from "./toast_appi";

// Global toast function that can be called from anywhere
let globalToast: {
  success: (message: string, options?: Partial<ToastAppiProps>) => void;
  error: (message: string, options?: Partial<ToastAppiProps>) => void;
  warning: (message: string, options?: Partial<ToastAppiProps>) => void;
  info: (message: string, options?: Partial<ToastAppiProps>) => void;
  custom: (toast: Omit<ToastAppiProps, "onClose" | "isVisible">) => void;
  clearAllToasts: () => void;
} | null = null;

/**
 * Set the global toast functions
 * This should be called from a component that has access to useToast
 */
export function setGlobalToast(toastFunctions: {
  success: (message: string, options?: Partial<ToastAppiProps>) => void;
  error: (message: string, options?: Partial<ToastAppiProps>) => void;
  warning: (message: string, options?: Partial<ToastAppiProps>) => void;
  info: (message: string, options?: Partial<ToastAppiProps>) => void;
  custom: (toast: Omit<ToastAppiProps, "onClose" | "isVisible">) => void;
  clearAllToasts: () => void;
}) {
  globalToast = toastFunctions;
}

/**
 * Simple toast functions that can be called from anywhere
 * Each function automatically clears previous toasts before showing the new one
 */
export const toast = {
  success: (message: string, options?: Partial<ToastAppiProps>) => {
    if (!globalToast) {
      console.error(
        "Global toast not initialized. Make sure ToastProvider is set up properly."
      );
      return;
    }
    // Clear previous toasts before showing new one
    globalToast.clearAllToasts();
    globalToast.success(message, options);
  },

  error: (message: string, options?: Partial<ToastAppiProps>) => {
    if (!globalToast) {
      console.error(
        "Global toast not initialized. Make sure ToastProvider is set up properly."
      );
      return;
    }
    // Clear previous toasts before showing new one
    globalToast.clearAllToasts();
    globalToast.error(message, options);
  },

  warning: (message: string, options?: Partial<ToastAppiProps>) => {
    if (!globalToast) {
      console.error(
        "Global toast not initialized. Make sure ToastProvider is set up properly."
      );
      return;
    }
    // Clear previous toasts before showing new one
    globalToast.clearAllToasts();
    globalToast.warning(message, options);
  },

  info: (message: string, options?: Partial<ToastAppiProps>) => {
    if (!globalToast) {
      console.error(
        "Global toast not initialized. Make sure ToastProvider is set up properly."
      );
      return;
    }
    // Clear previous toasts before showing new one
    globalToast.clearAllToasts();
    globalToast.info(message, options);
  },

  custom: (toastConfig: Omit<ToastAppiProps, "onClose" | "isVisible">) => {
    if (!globalToast) {
      console.error(
        "Global toast not initialized. Make sure ToastProvider is set up properly."
      );
      return;
    }
    // Clear previous toasts before showing new one
    globalToast.clearAllToasts();
    globalToast.custom(toastConfig);
  },

  clearAll: () => {
    if (!globalToast) {
      console.error(
        "Global toast not initialized. Make sure ToastProvider is set up properly."
      );
      return;
    }
    globalToast.clearAllToasts();
  },
};
