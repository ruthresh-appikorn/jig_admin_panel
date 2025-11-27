"use client";

import React, { useEffect } from "react";
import { useNavigation } from "./simplified_router";
import { setGlobalNavigate } from "./navigation_utils";

interface NavigationProviderProps {
  children: React.ReactNode;
}

/**
 * Navigation Provider that initializes global navigation
 * This should be wrapped around your app to enable programmatic navigation from anywhere
 */
export const NavigationProvider: React.FC<NavigationProviderProps> = ({
  children,
}) => {
  const { navigate } = useNavigation();

  useEffect(() => {
    // Set the global navigation function so it can be used from anywhere
    setGlobalNavigate(navigate);

    // Cleanup on unmount
    return () => {
      setGlobalNavigate(null as any);
    };
  }, [navigate]);

  return <>{children}</>;
};
