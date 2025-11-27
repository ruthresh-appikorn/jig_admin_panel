import { Card, CardBody } from "@heroui/card";
import { memo } from "react";
import { adminDashboardInputModel } from "../store/admin_dashboard_store";
import {
  TableAppi,
  TableColumn,
  TableRowData,
} from "@/components/appikorn-components/table/table_appi";

/**
 * Admin Dashboard Component
 */

// Stat Card Component
interface StatCardProps {
  title: string;
  value: number;
  bgColor: string;
  textColor: string;
}

const StatCard = ({ title, value, bgColor, textColor }: StatCardProps) => {
  return (
    <Card className={`${bgColor} border-none shadow-md`}>
      <CardBody className="p-6">
        <div className="flex flex-col items-center justify-center space-y-2">
          <h3
            className={`text-sm font-semibold ${textColor} uppercase tracking-wide`}
          >
            {title}
          </h3>
          <p className={`text-4xl font-bold ${textColor}`}>{value}</p>
        </div>
      </CardBody>
    </Card>
  );
};

// Stats Row Component
export const StatsRow = memo(() => {
  const passedLogs = adminDashboardInputModel.useSelector(
    (state) => state.adminDashboardData.passedLogs || 0
  );
  const failedLogs = adminDashboardInputModel.useSelector(
    (state) => state.adminDashboardData.failedLogs || 0
  );
  const totalLogs = adminDashboardInputModel.useSelector(
    (state) => state.adminDashboardData.totalLogs || 0
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <StatCard
        title="Passed Logs"
        value={passedLogs}
        bgColor="bg-green-50 dark:bg-green-900/20"
        textColor="text-green-600 dark:text-green-400"
      />
      <StatCard
        title="Failed Logs"
        value={failedLogs}
        bgColor="bg-red-50 dark:bg-red-900/20"
        textColor="text-red-600 dark:text-red-400"
      />
      <StatCard
        title="Total Logs"
        value={totalLogs}
        bgColor="bg-blue-50 dark:bg-blue-900/20"
        textColor="text-blue-600 dark:text-blue-400"
      />
    </div>
  );
});

// Table Component with Dummy Data
export const LogsTable = memo(() => {
  // Define table columns
  const columns: TableColumn[] = [
    { name: "ID", uid: "id" },
    { name: "Test Name", uid: "testName" },
    { name: "Status", uid: "status" },
    { name: "Duration", uid: "duration" },
    { name: "Date", uid: "date" },
    { name: "Tester", uid: "tester" },
  ];

  // Dummy data
  const rows: TableRowData[] = [
    {
      id: "1",
      testName: "Login Functionality Test",
      status: "Passed",
      duration: "2.5s",
      date: "2025-11-27",
      tester: "John Doe",
    },
    {
      id: "2",
      testName: "Dashboard Load Test",
      status: "Failed",
      duration: "5.2s",
      date: "2025-11-27",
      tester: "Jane Smith",
    },
    {
      id: "3",
      testName: "API Integration Test",
      status: "Passed",
      duration: "1.8s",
      date: "2025-11-26",
      tester: "Bob Johnson",
    },
    {
      id: "4",
      testName: "Form Validation Test",
      status: "Passed",
      duration: "3.1s",
      date: "2025-11-26",
      tester: "Alice Williams",
    },
    {
      id: "5",
      testName: "Database Connection Test",
      status: "Failed",
      duration: "8.7s",
      date: "2025-11-25",
      tester: "Charlie Brown",
    },
    {
      id: "6",
      testName: "Authentication Test",
      status: "Passed",
      duration: "2.2s",
      date: "2025-11-25",
      tester: "Diana Prince",
    },
    {
      id: "7",
      testName: "File Upload Test",
      status: "Passed",
      duration: "4.5s",
      date: "2025-11-24",
      tester: "Eve Adams",
    },
    {
      id: "8",
      testName: "Email Notification Test",
      status: "Failed",
      duration: "6.3s",
      date: "2025-11-24",
      tester: "Frank Miller",
    },
    {
      id: "9",
      testName: "Search Functionality Test",
      status: "Passed",
      duration: "1.9s",
      date: "2025-11-23",
      tester: "Grace Lee",
    },
    {
      id: "10",
      testName: "Export Data Test",
      status: "Passed",
      duration: "3.7s",
      date: "2025-11-23",
      tester: "Henry Wilson",
    },
  ];

  // Custom cell renderer for status column
  const renderCell = (column: TableColumn, value: any) => {
    if (column.uid === "status") {
      const isPassed = value === "Passed";
      return (
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold ${
            isPassed
              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
              : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
          }`}
        >
          {value}
        </span>
      );
    }
    return value;
  };

  return (
    <div className="w-full">
      <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
        Test Logs
      </h2>
      <TableAppi
        columns={columns}
        rows={rows}
        renderCell={renderCell}
        ariaLabel="Test logs table"
        isPaginated={true}
        rowsPerPage={10}
        selectionMode="none"
      />
    </div>
  );
});
