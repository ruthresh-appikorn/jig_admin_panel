"use client";

import type { ThemeProviderProps } from "next-themes";
import * as React from "react";

export interface ProvidersProps {
  children: React.ReactNode;
  themeProps?: ThemeProviderProps;
}

export function Providers({ children }: ProvidersProps) {
  return <>{children}</>;
}
