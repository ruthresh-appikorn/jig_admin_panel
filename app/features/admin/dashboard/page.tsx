"use client";

import { useEffect, useState } from "react";
import { adminDashboardInputModel } from "./store/admin_dashboard_store";
import { onInit, onDestroy } from "./controller/admin_dashboard_controller";
import { StatsRow, LogsTable } from "./components/admin_dashboard_component";

export const dynamic = "force-dynamic";

export default function Admin_dashboardPage() {
  const [isClient, setIsClient] = useState(false);

  // Initialize page on mount
  useEffect(() => {
    setIsClient(true);
    onInit();

    return () => {
      onDestroy();
    };
  }, []);

  // Don't render anything until client-side to avoid hydration issues
  if (!isClient) {
    return null;
  }

  return (
    <>
      {/* Stats Row */}
      <StatsRow />

      {/* Logs Table */}
      <LogsTable />
    </>
  );
}
