"use client";

import { useEffect } from "react";
import { adminDashboardInputModel } from "./store/admin_dashboard_store";
import { onInit, onDestroy } from "./controller/admin_dashboard_controller";
import { StatsRow, LogsTable } from "./components/admin_dashboard_component";

export default function Admin_dashboardPage() {
  // Initialize page on mount
  useEffect(() => {
    onInit();

    return () => {
      onDestroy();
    };
  }, []);

  return (
    <>
      {/* Stats Row */}
      <StatsRow />

      {/* Logs Table */}
      <LogsTable />
    </>
  );
}
