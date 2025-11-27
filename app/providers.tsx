"use client";

import type { ThemeProviderProps } from "next-themes";

import * as React from "react";
import { HeroUIProvider } from "@heroui/system";
import { Suspense } from "react";
import { useRouter } from "next/navigation";
import { ThemeProvider as NextThemesProvider } from "next-themes";

import { initApiMiddleware } from "../core/api/middleware";
import { ToastProvider } from "@/components/appikorn-components/toast_appi";
import { NavigationProvider } from "@/core/navigation/navigation_provider";

export interface ProvidersProps {
  children: React.ReactNode;
  themeProps?: ThemeProviderProps;
}

declare module "@react-types/shared" {
  interface RouterConfig {
    routerOptions: NonNullable<
      Parameters<ReturnType<typeof useRouter>["push"]>[1]
    >;
  }
}

export function Providers({ children, themeProps }: ProvidersProps) {
  // Initialize global API middleware once on the client
  React.useEffect(() => {
    initApiMiddleware();
  }, []);

  const router = useRouter();

  return (
    <HeroUIProvider navigate={router.push} locale="en-GB">
      <NextThemesProvider {...themeProps}>
        {/* <Suspense fallback={<div className="p-4"></div>}> */}
        <NavigationProvider>
          <ToastProvider maxToasts={3}>{children}</ToastProvider>
        </NavigationProvider>
        {/* </Suspense> */}
      </NextThemesProvider>
    </HeroUIProvider>
  );
}
