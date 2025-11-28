"use client";

import { useEffect } from "react";
import { adminDashboardInputModel } from "./store/admin_dashboard_store";
import { onInit, onDestroy } from "./controller/admin_dashboard_controller";
import { StatsRow, LogsTable } from "./components/admin_dashboard_component";
import { LogOut } from "lucide-react";
import { navigate } from "@/core/navigation/simplified_router";

export default function Admin_dashboardPage() {
  // Initialize page on mount
  useEffect(() => {
    onInit();

    // Set dummy data for stats
    adminDashboardInputModel.update({
      adminDashboardData: {
        passedLogs: 7,
        failedLogs: 3,
        totalLogs: 10,
      },
    });

    return () => {
      onDestroy();
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-row justify-between">
          <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">
            Admin Dashboard
          </h1>
          <LogOut
            onClick={() => {
              navigate("/features/admin/login");
            }}
          />
        </div>

        {/* Stats Row */}
        <StatsRow />

        {/* Logs Table */}
        <LogsTable />
      </div>
    </div>
  );
}
