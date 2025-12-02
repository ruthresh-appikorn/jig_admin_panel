"use client";

import { usePathname } from "next/navigation";
import { LogOut, Moon, Sun } from "lucide-react";
import { navigate } from "@/core/navigation/simplified_router";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

interface ConditionalAdminLayoutProps {
  children: React.ReactNode;
}

export function ConditionalAdminLayout({
  children,
}: ConditionalAdminLayoutProps) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Check if we're on the login page
  const isLoginPage = pathname?.includes("/admin/login");

  // Check if we're on an admin page
  const isAdminPage = pathname?.includes("/admin/");

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = () => {
    navigate("/features/admin/login");
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <>
      {isAdminPage && !isLoginPage && (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          {/* Sticky Navigation Bar */}
          <div className="sticky top-0 z-50 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="max-w-7xl mx-auto px-6 py-4">
              <div className="flex flex-row justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Admin Dashboard
                </h1>
                <div className="flex items-center gap-3">
                  {/* Dark Mode Toggle */}
                  {mounted && (
                    <button
                      onClick={toggleTheme}
                      className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      aria-label="Toggle dark mode"
                    >
                      {theme === "dark" ? (
                        <Sun className="w-5 h-5 text-yellow-500" />
                      ) : (
                        <Moon className="w-5 h-5 text-gray-700" />
                      )}
                    </button>
                  )}

                  {/* Logout Button */}
                  <button
                    onClick={handleLogout}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    aria-label="Logout"
                  >
                    <LogOut className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="max-w-7xl mx-auto px-6 py-6">{children}</div>
        </div>
      )}
      {(!isAdminPage || isLoginPage) && children}
    </>
  );
}
