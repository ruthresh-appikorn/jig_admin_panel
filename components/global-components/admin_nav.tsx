"use client";

import { navigate } from "@/core/navigation/simplified_router";
import { LogOut } from "lucide-react";

interface AdminNavProps {
  title?: string;
  onLogout?: () => void;
}

export function AdminNav({
  title = "Admin Dashboard",
  onLogout,
}: AdminNavProps) {
  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      navigate("/features/admin/login");
    }
  };

  return (
    <div className="flex flex-row justify-between items-center mb-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
        {title}
      </h1>
      <button
        onClick={handleLogout}
        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        aria-label="Logout"
      >
        <LogOut className="w-6 h-6 text-gray-700 dark:text-gray-300" />
      </button>
    </div>
  );
}
