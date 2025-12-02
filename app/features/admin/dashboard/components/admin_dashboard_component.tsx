import { Card, CardBody } from "@heroui/card";
import { memo } from "react";
import { adminDashboardInputModel } from "../store/admin_dashboard_store";
import {
  TableAppi,
  TableColumn,
  TableRowData,
} from "@/components/appikorn-components/table/table_appi";
import { getAllTestsOutputModel } from "../api/get_all_tests/get_all_tests_store";
import {
  isPumpComponent,
  isBoilerComponent,
  is3In1Component,
  processPumpTestData,
  processBoilerTestData,
  process3In1TestData,
} from "../utils/test_data_processor";

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

// Table Component with Component-Specific Processing
export const LogsTable = memo(() => {
  const getAllTestsData = getAllTestsOutputModel.useSelector(
    (state) => state.getAllTestsData.data.getTests || []
  );

  // Define table columns
  const columns: TableColumn[] = [
    { name: "Sr No.", uid: "srNo" },
    { name: "Component Name", uid: "componentName" },
    { name: "Test Name", uid: "testName" },
    { name: "Date & Time", uid: "dateTime" },
    { name: "QC Status", uid: "qcStatus" },
    { name: "Actions", uid: "actions" },
  ];

  // Build table data from API response
  const tableData: any[] = [];

  for (const test of getAllTestsData) {
    // Check component type and process accordingly
    if (isPumpComponent(test)) {
      const pumpData = processPumpTestData(test);
      tableData.push(...pumpData);
    } else if (isBoilerComponent(test)) {
      const boilerData = processBoilerTestData(test);
      tableData.push(...boilerData);
    } else if (is3In1Component(test)) {
      const threeInOneData = process3In1TestData(test);
      tableData.push(...threeInOneData);
    }
  }

  // Handle view action
  const handleView = async (downloadData: any) => {
    const { type, data } = downloadData;

    try {
      // Dynamic import of PDF generators
      const { downloadPumpPdf, downloadBoilerPdf, download3In1Pdf } =
        await import("../utils/pdf_generator");

      // Call appropriate PDF generator based on type with 'view' mode
      if (type === "pump") {
        await downloadPumpPdf(data, "view");
      } else if (type === "boiler") {
        await downloadBoilerPdf(data, "view");
      } else if (type === "3-in-1") {
        await download3In1Pdf(data, "view");
      } else {
        console.warn("Unknown component type:", type);
        alert(`View for ${type} is not yet implemented`);
      }
    } catch (error) {
      console.error("Error viewing PDF:", error);
      alert("Failed to generate PDF preview. Please try again.");
    }
  };

  const handleDownload = async (downloadData: any) => {
    const { type, data } = downloadData;

    try {
      // Dynamic import of PDF generators
      const { downloadPumpPdf, downloadBoilerPdf, download3In1Pdf } =
        await import("../utils/pdf_generator");

      // Call appropriate PDF generator based on type
      if (type === "pump") {
        await downloadPumpPdf(data);
      } else if (type === "boiler") {
        await downloadBoilerPdf(data);
      } else if (type === "3-in-1") {
        await download3In1Pdf(data);
      } else {
        console.warn("Unknown component type:", type);
        alert(`PDF generation for ${type} is not yet implemented`);
      }
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF. Please try again.");
    }
  };

  // Map table data to table rows
  const rows: TableRowData[] = tableData.map((data, index) => ({
    id: `row-${index}`,
    srNo: data.srNo,
    componentName: data.componentName,
    testName: data.testName,
    dateTime: data.dateTime,
    qcStatus: data.qcStatus,
    actions: data.downloadData,
  }));

  // Custom cell renderer
  const renderCell = (column: TableColumn, value: any, rowIndex: number) => {
    if (column.uid === "qcStatus") {
      const isPassed = value === "PASSED";
      const isFailed = value === "FAIL";
      const isIdle = value === "IDLE";

      return (
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold ${
            isPassed
              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
              : isFailed
              ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
              : "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400"
          }`}
        >
          {value}
        </span>
      );
    }

    if (column.uid === "actions") {
      return (
        <div className="flex items-center justify-center gap-2">
          {/* View Icon */}
          <button
            onClick={() => handleView(value)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="View Details"
            title="View Details"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-blue-600 dark:text-blue-400"
            >
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </button>

          {/* Download Icon */}
          <button
            onClick={() => handleDownload(value)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Download PDF"
            title="Download PDF"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-blue-600 dark:text-blue-400"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
          </button>
        </div>
      );
    }

    return value;
  };

  return (
    <div className="w-full">
      <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
        Test Logs
      </h2>

      {rows.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          No test data available
        </div>
      ) : (
        <TableAppi
          columns={columns}
          rows={rows}
          renderCell={renderCell}
          ariaLabel="Test logs table"
          isPaginated={true}
          isFilterable={true}
          searchColumnUid="componentName"
          selectionMode="none"
        />
      )}
    </div>
  );
});
