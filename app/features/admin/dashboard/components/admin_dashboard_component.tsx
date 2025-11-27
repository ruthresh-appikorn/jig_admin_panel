"use client";

import { memo } from "react";
import { adminDashboardInputModel } from "../store/admin_dashboard_store";

/**
 * Admin_dashboard Component
 */

export const TotalLogsField = memo(() => {
  const totalLogs = adminDashboardInputModel.useSelector(
    (state) => state.adminDashboardData.totalLogs || ""
  );

  console.log("🔥 TotalLogsField value changed:", totalLogs);

  return <div></div>;
});

export const PassedLogsField = memo(() => {
  const passedLogs = adminDashboardInputModel.useSelector(
    (state) => state.adminDashboardData.passedLogs || ""
  );

  console.log("🔥 PassedLogsField value changed:", passedLogs);

  return <div></div>;
});

export const FailedLogsField = memo(() => {
  const failedLogs = adminDashboardInputModel.useSelector(
    (state) => state.adminDashboardData.failedLogs || ""
  );

  console.log("🔥 FailedLogsField value changed:", failedLogs);

  return <div></div>;
});

export const TableField = memo(() => {
  const table = adminDashboardInputModel.useSelector(
    (state) => state.adminDashboardData.table || ""
  );

  console.log("🔥 TableField value changed:", table);

  return <div></div>;
});
