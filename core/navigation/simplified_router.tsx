"use client";

/**
 * MADX Simplified Navigation Router
 *
 * A lightweight, optimized navigation system that allows passing data between routes
 * with support for type safety and persistence options.
 */"use client";

import { useEffect, useState, useCallback, useMemo, Suspense } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

// Type definitions
export type RouteParams = Record<string, string | number | boolean>;

export interface NavigationOptions {
  replace?: boolean; // Replace current history entry instead of pushing new one
  persist?: boolean; // Store data in sessionStorage for retrieval after page refresh
  clearHistory?: boolean; // Clear navigation history
}

// Storage key for persisted navigation data
const STORAGE_KEY = "madx-navigation-state";

// Maximum size for navigation data in bytes (1MB)
const MAX_DATA_SIZE = 1024 * 1024;

// List of sensitive fields that should not be persisted
const SENSITIVE_FIELDS = [
  "password",
  "token",
  "secret",
  "auth",
  "key",
  "credential",
];

/**
 * Safe hook for useSearchParams that handles Suspense boundary
 */
function useSafeSearchParams(): URLSearchParams | null {
  const [searchParams, setSearchParams] = useState<URLSearchParams | null>(null);
  
  useEffect(() => {
    // Only access searchParams on the client side after hydration
    if (typeof window !== 'undefined') {
      try {
        setSearchParams(new URLSearchParams(window.location.search));
      } catch (error) {
        console.error('Failed to get search params:', error);
        setSearchParams(new URLSearchParams());
      }
    }
  }, []);
  
  return searchParams;
}

// Navigation state interface for storing route data
interface NavigationState<T = unknown> {
  data?: T;
  timestamp: number;
  source: string;
}

/**
 * Sanitize navigation data to remove sensitive information
 *
 * @param data Data to sanitize
 * @returns Sanitized data
 */
function sanitizeNavigationData<T>(data: T): T {
  if (!data || typeof data !== "object") return data;

  try {
    // Create a shallow copy to avoid mutating the original
    let sanitized: T;

    if (Array.isArray(data)) {
      sanitized = [...data] as unknown as T;
    } else {
      // Create a safe copy of the object
      const objCopy = { ...(data as Record<string, unknown>) };

      // Remove sensitive fields
      for (const field of SENSITIVE_FIELDS) {
        if (objCopy && typeof objCopy === "object" && field in objCopy) {
          delete objCopy[field];
        }
      }

      sanitized = objCopy as unknown as T;
    }

    return sanitized;
  } catch (error) {
    console.error("Error sanitizing navigation data:", error);

    return data; // Return original data if sanitization fails
  }
}

/**
 * Check if data size exceeds the maximum allowed
 *
 * @param data Data to check
 * @returns True if data size is acceptable, false otherwise
 */
function checkDataSize(data: unknown): boolean {
  if (!data) return true;

  try {
    const serialized = JSON.stringify(data);

    return serialized.length <= MAX_DATA_SIZE;
  } catch (error) {
    console.error("Failed to check data size:", error);

    return false;
  }
}

/**
 * React hook for navigation with data passing capabilities
 *
 * @returns Navigation utilities for React components
 */
export function useNavigation() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSafeSearchParams();

  /**
   * Navigate to a route with optional data
   */
  const navigate = useCallback(
    <T = unknown,>(
      route: string,
      data?: T,
      options: NavigationOptions = {},
    ) => {
      const opts = {
        replace: false,
        persist: false,
        clearHistory: false,
        ...options,
      };

      // Check data size
      if (data && !checkDataSize(data)) {
        console.error("Navigation data exceeds maximum size limit of 1MB");

        return;
      }

      // Sanitize data if it will be persisted
      const sanitizedData = opts.persist ? sanitizeNavigationData(data) : data;

      // Prepare the state object
      const state: NavigationState<T> = {
        data: sanitizedData,
        timestamp: Date.now(),
        source:
          typeof window !== "undefined"
            ? window.location.pathname
            : pathname || "/",
      };

      // Handle persistence if enabled
      if (opts.persist && sanitizedData) {
        try {
          sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        } catch (error) {
          console.error("Failed to persist navigation state:", error);
        }
      }

      // Perform the navigation using Next.js router
      if (opts.replace) {
        router.replace(route);
      } else {
        router.push(route);
      }
    },
    [router, pathname],
  );

  /**
   * Navigate back to the previous route
   */
  const goBack = useCallback(() => {
    router.back();
  }, [router]);

  /**
   * Create a route with parameters
   */
  const createRoute = useCallback(
    (baseRoute: string, params?: RouteParams): string => {
      if (!params) return baseRoute;

      const queryParams = new URLSearchParams();

      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });

      const queryString = queryParams.toString();

      return queryString ? `${baseRoute}?${queryString}` : baseRoute;
    },
    [],
  );

  return useMemo(
    () => ({
      navigate,
      goBack,
      createRoute,
      pathname,
      searchParams,
    }),
    [navigate, goBack, createRoute, pathname, searchParams],
  );
}

/**
 * Standalone navigate function for non-React contexts
 *
 * @param route The route path to navigate to
 * @param data Optional data to pass to the destination route
 * @param options Navigation options
 */
export function navigate<T = unknown>(
  route: string,
  data?: T,
  options: NavigationOptions = {},
): void {
  const opts = {
    replace: false,
    persist: false,
    clearHistory: false,
    ...options,
  };

  // Check data size
  if (data && !checkDataSize(data)) {
    console.error("Navigation data exceeds maximum size limit of 1MB");

    return;
  }

  // Sanitize data if it will be persisted
  const sanitizedData = opts.persist ? sanitizeNavigationData(data) : data;

  // Prepare the state object
  const state: NavigationState<T> = {
    data: sanitizedData,
    timestamp: Date.now(),
    source: typeof window !== "undefined" ? window.location.pathname : "/",
  };

  // Handle persistence if enabled
  if (opts.persist && sanitizedData) {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error("Failed to persist navigation state:", error);
    }
  }

  // Clear history if requested
  if (opts.clearHistory && typeof window !== "undefined" && window.history) {
    window.history.replaceState(null, "", window.location.pathname);
  }

  // Perform the navigation
  if (typeof window !== "undefined") {
    if (opts.replace) {
      window.location.replace(route);
    } else {
      window.location.href = route;
    }
  }
}

/**
 * React hook to access navigation data in functional components
 *
 * @returns The data object passed during navigation
 */
export function useNavigationData<T = unknown>(): T | undefined {
  const [data, setData] = useState<T | undefined>(undefined);

  useEffect(() => {
    // Check sessionStorage for persisted data
    try {
      const storedData = sessionStorage.getItem(STORAGE_KEY);

      if (storedData) {
        const state = JSON.parse(storedData) as NavigationState<T>;

        // Clear the stored data to prevent it from being used again
        sessionStorage.removeItem(STORAGE_KEY);

        setData(state.data);
      }
    } catch (error) {
      console.error("Failed to retrieve navigation state:", error);
    }
  }, []);

  return data;
}

/**
 * Extract and parse query parameters from the URL
 */
export function parseQueryParams(
  searchParams: URLSearchParams,
): Record<string, string | string[]> {
  const params: Record<string, string | string[]> = {};

  searchParams.forEach((value, key) => {
    if (params[key]) {
      // If the parameter already exists, convert it to an array
      if (Array.isArray(params[key])) {
        (params[key] as string[]).push(value);
      } else {
        params[key] = [params[key] as string, value];
      }
    } else {
      params[key] = value;
    }
  });

  return params;
}
