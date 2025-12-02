"use client";

import type { ThemeProviderProps } from "next-themes";
import * as React from "react";

import { Providers } from "./providers";

export interface ProvidersWrapperProps {
  children: React.ReactNode;
  themeProps?: ThemeProviderProps;
}

export function ProvidersWrapper({ children, themeProps }: ProvidersWrapperProps) {
  return <Providers themeProps={themeProps}>{children}</Providers>;
}
