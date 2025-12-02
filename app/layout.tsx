/* eslint-disable prettier/prettier */
import "@/styles/globals.css";
import { Metadata, Viewport } from "next";
import { Suspense } from "react";
import clsx from "clsx";
import { siteConfig } from "@/config/site";
import { fontSans } from "@/config/fonts";
import { Providers } from "./providers";
import { NavbarProvider } from "./context/NavbarContext";
import { ConditionalAdminLayout } from "@/components/global-components/conditional_admin_layout";

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s - ${siteConfig.name}`,
  },
  description: siteConfig.description,
  icons: { icon: "/assets/logo/appikorn-logo.png" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html suppressHydrationWarning lang="en">
      <head />
      <body
        suppressHydrationWarning
        className={clsx(
          "min-h-screen text-foreground bg-background font-sans antialiased overflow-x-hidden",
          fontSans.variable
        )}
      >
        <Providers themeProps={{ attribute: "class", defaultTheme: "light" }}>
          <NavbarProvider>
            <Suspense fallback={<div className="p-4">Loading...</div>}>
              {/* Ensure ConditionalLayout doesn’t depend on window during SSR */}
              {children}
            </Suspense>
          </NavbarProvider>
        </Providers>
      </body>
    </html>
  );
}
