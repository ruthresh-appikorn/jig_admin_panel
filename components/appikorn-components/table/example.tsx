import React from "react";

// Using type Selection from table_appi since @heroui/react may not be available
import {
  TableAppi,
  TableColumn,
  type Selection,
} from "@/components/appikorn-components/table/table_appi";

// Simple status chip component
function StatusChip({
  status,
  onClick,
}: {
  status: string;
  onClick?: () => void;
}) {
  // Determine color based on status
  let bgColor = "bg-gray-200";
  let textColor = "text-gray-800";

  if (status === "Active") {
    bgColor = "bg-green-100";
    textColor = "text-green-800";
  } else if (status === "Inactive") {
    bgColor = "bg-red-100";
    textColor = "text-red-800";
  } else if (status === "Pending") {
    bgColor = "bg-yellow-100";
    textColor = "text-yellow-800";
  }

  return (
    <button
      className={`px-2 py-1 rounded-full text-xs font-medium ${bgColor} ${textColor} cursor-pointer border-none`}
      type="button"
      onClick={onClick}
    >
      {status}
    </button>
  );
}

export function TableExample() {
  const [currentPage, setCurrentPage] = React.useState(1);

  // Handler for selection changes
  const handleSelectionChange = (keys: Selection) => {
    if (keys instanceof Set) {
      const extractedEntries = Array.from(keys);

      // eslint-disable-next-line no-console
      console.log("Extracted entries:", extractedEntries);
    }
    // setSelectedKeys(keys);
    // For production, consider removing this log or replacing with a logging service
    // Selected rows information: keys instanceof Set ? Array.from(keys) : keys
  };

  const handleFilterChange = (value: string) => {
    // eslint-disable-next-line no-console
    console.log("Filter input value:", value);
  };

  // Define columns for the table
  const columns: TableColumn[] = [
    { name: "Serial Number", uid: "serialNumber" },
    { name: "Machine Model", uid: "machineModel" },
    { name: "Employee ID", uid: "employeeId" },
    { name: "Drink", uid: "drink" },
    { name: "Building", uid: "building" },
    { name: "Floor & Wing", uid: "floorWing" },
    { name: "Reported Time", uid: "reportedTime" },
    {
      name: "Status",
      uid: "status",
      // Column-specific render function for status
      renderCell: (value, index) => (
        <StatusChip
          status={value}
          onClick={() => {
            // eslint-disable-next-line no-console
            console.log("Clicked row index:", index);
          }}
        />
      ),
    },
  ];

  // Define sample data rows
  const rows = [
    {
      id: "1",
      serialNumber: "SN12345",
      machineModel: "Model X",
      employeeId: "EMP001",
      drink: "Coffee",
      building: "Building A",
      floorWing: "Floor 3, East Wing",
      reportedTime: "2025-07-02 10:30 AM",
      status: "Active",
    },
    {
      id: "3",
      serialNumber: "SN54321",
      machineModel: "Model Z",
      employeeId: "EMP003",
      drink: "Espresso",
      building: "Building C",
      floorWing: "Floor 1, North Wing",
      reportedTime: "2025-07-02 09:15 AM",
      status: "Pending",
    },
    {
      id: "2",
      serialNumber: "SN67890",
      machineModel: "Model Y",
      employeeId: "EMP002",
      drink: "Tea",
      building: "Building B",
      floorWing: "Floor 2, West Wing",
      reportedTime: "2025-07-02 11:45 AM",
      status: "Inactive",
    },
  ];

  const handlePageChange = (page: number) => {
    console.log("Page changed to:", page);
    // setCurrentPage(page);
  };

  return (
    <TableAppi
      ariaLabel="Sales data table"
      columns={columns}
      currentPage={1}
      isFilterable={true}
      isPaginated={true}
      rows={rows}
      rowsPerPage={200}
      searchColumnUid="drink"
      selectionMode="multiple"
      totalPages={20}
      onFilterChange={handleFilterChange}
      onPageChange={handlePageChange}
      onSelectionChange={handleSelectionChange}
    />
  );
}
