"use client";

import { loginOutputModel } from "@/app/features/admin/login/api/login/login_store";
import { adminLoginInputModel } from "@/app/features/admin/login/store/admin_login_store";
import { navigate } from "@/core/navigation/simplified_router";
import { LogOut, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

interface AdminNavProps {
  title?: string;
  onLogout?: () => void;
  showThemeToggle?: boolean;
}

export function AdminNav({
  title = "Admin Dashboard",
  onLogout,
  showThemeToggle = true,
}: AdminNavProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const name = mounted
    ? loginOutputModel.useStore.getState().loginData.data.login.user.USERNAME
    : "";

  const handleLogout = () => {
    console.log("///////////", name);

    if (onLogout) {
      onLogout();
    } else {
      adminLoginInputModel.reset();
      navigate("/features/admin/login");
    }
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <div className="sticky top-0 z-50 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-row justify-between items-center">
          <h1 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white truncate">
            Welcome {name || title}
          </h1>
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Theme Toggle */}
            {showThemeToggle && mounted && (
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
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
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
              aria-label="Logout"
            >
              <LogOut className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
