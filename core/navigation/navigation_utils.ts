/**
 * Navigation utilities for programmatic navigation
 * Can be used from anywhere in the app, including controllers and API functions
 */

import { NavigationOptions } from "./simplified_router";

// Global navigation function that can be called from anywhere
let globalNavigate:
  | (<T = unknown>(
      route: string,
      data?: T,
      options?: NavigationOptions
    ) => void)
  | null = null;

/**
 * Set the global navigation function
 * This should be called from a component that has access to useNavigation
 */
export function setGlobalNavigate(
  navigateFn: <T = unknown>(
    route: string,
    data?: T,
    options?: NavigationOptions
  ) => void
) {
  globalNavigate = navigateFn;
}

/**
 * Navigate programmatically from anywhere in the app
 * This can be used in controllers, API functions, or any other non-component code
 */
export function navigateTo<T = unknown>(
  route: string,
  data?: T,
  options?: NavigationOptions
) {
  if (!globalNavigate) {
    console.error(
      "Global navigation not initialized. Make sure to call setGlobalNavigate from a component with useNavigation."
    );
    // Fallback to window.location if available
    if (typeof window !== "undefined") {
      window.location.href = route;
    }
    return;
  }

  globalNavigate(route, data, options);
}

/**
 * Simple navigate function with default options (replace: true)
 * Just pass the route and it handles the rest
 */
export function navigate(route: string) {
  navigateTo(route, null, { replace: true });
}

/**
 * Convenience functions for common navigation patterns
 */
export const navigationUtils = {
  // Navigate and replace current history entry
  replace: <T = unknown>(route: string, data?: T) => {
    navigateTo(route, data, { replace: true });
  },

  // Navigate with data persistence
  navigateWithData: <T = unknown>(route: string, data: T) => {
    navigateTo(route, data, { persist: true });
  },

  // Navigate and clear history
  navigateAndClearHistory: <T = unknown>(route: string, data?: T) => {
    navigateTo(route, data, { clearHistory: true });
  },

  // Common app routes
  goToLogin: () => navigateTo("/features/authentication/login"),
  goToHRDashboard: () =>
    navigateTo("/features/hr/dashboard", null, { replace: true }),
  goToStaffDashboard: () =>
    navigateTo("/features/landing/staff_dashboard", null, { replace: true }),
  goToHome: () => navigateTo("/", null, { replace: true }),

  // Navigation with success/error handling
  navigateOnSuccess: <T = unknown>(route: string, data?: T) => {
    navigateTo(route, data, { replace: true });
  },

  navigateOnError: (route: string = "/features/authentication/login") => {
    navigateTo(route, null, { replace: true, clearHistory: true });
  },
};
