// ToastProvider.tsx
import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { ToastAppi, ToastAppiProps } from "./toast_appi";
import { setGlobalToast } from "./toast_utils";

interface Toast extends Omit<ToastAppiProps, "onClose" | "isVisible"> {
  id: string;
}

interface ToastContextType {
  showToast: (toast: Omit<Toast, "id">) => void;
  hideToast: (id: string) => void;
  clearAllToasts: () => void;
}

export const ToastContext = createContext<ToastContextType | undefined>(
  undefined
);

interface ToastProviderProps {
  children: React.ReactNode;
  maxToasts?: number; // Maximum number of toasts to show at once
}

export const ToastProvider: React.FC<ToastProviderProps> = ({
  children,
  maxToasts = 1, // Changed default to 1 to show only latest toast
}) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((toast: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast: Toast = { ...toast, id };

    setToasts((prev) => {
      // Clear all previous toasts and show only the latest one
      return [newToast];
    });
  }, []);

  const hideToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const clearAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  // Initialize global toast functions
  useEffect(() => {
    const globalToastFunctions = {
      success: (message: string, options?: Partial<ToastAppiProps>) => {
        showToast({
          message,
          level: "success",
          ...options,
        });
      },
      error: (message: string, options?: Partial<ToastAppiProps>) => {
        showToast({
          message,
          level: "error",
          duration: 7000, // Error messages stay longer by default
          ...options,
        });
      },
      warning: (message: string, options?: Partial<ToastAppiProps>) => {
        showToast({
          message,
          level: "warning",
          duration: 6000, // Warning messages stay a bit longer
          ...options,
        });
      },
      info: (message: string, options?: Partial<ToastAppiProps>) => {
        showToast({
          message,
          level: "info",
          ...options,
        });
      },
      custom: (toast: Omit<ToastAppiProps, "onClose" | "isVisible">) => {
        showToast(toast);
      },
      clearAllToasts,
    };

    setGlobalToast(globalToastFunctions);

    // Cleanup on unmount
    return () => {
      setGlobalToast(null as any);
    };
  }, [showToast, clearAllToasts]);

  return (
    <ToastContext.Provider value={{ showToast, hideToast, clearAllToasts }}>
      {children}

      {/* Render toasts */}
      <div className="fixed top-0 left-0 right-0 z-50 pointer-events-none">
        <div className="flex flex-col items-center pt-4">
          {toasts.map((toast) => (
            <div key={toast.id} className="pointer-events-auto">
              <ToastAppi
                message={toast.message}
                {...toast}
                isVisible={true}
                onClose={() => hideToast(toast.id)}
              />
            </div>
          ))}
        </div>
      </div>
    </ToastContext.Provider>
  );
};
