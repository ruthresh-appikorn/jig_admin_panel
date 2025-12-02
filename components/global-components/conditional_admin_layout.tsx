"use client";

import { usePathname } from "next/navigation";
import { AdminNav } from "./admin_nav";

interface ConditionalAdminLayoutProps {
  children: React.ReactNode;
}

export function ConditionalAdminLayout({
  children,
}: ConditionalAdminLayoutProps) {
  const pathname = usePathname();

  // Check if we're on the login page
  const isLoginPage = pathname?.includes("/admin/login");

  // Check if we're on an admin page
  const isAdminPage = pathname?.includes("/admin/");

  return (
    <>
      {isAdminPage && !isLoginPage && (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          {/* Sticky Navigation Bar */}
          <AdminNav title="Admin Dashboard" />

          {/* Main Content */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">{children}</div>
        </div>
      )}
      {(!isAdminPage || isLoginPage) && children}
    </>
  );
}
