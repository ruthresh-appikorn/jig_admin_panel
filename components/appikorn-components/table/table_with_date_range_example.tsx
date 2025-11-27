// Example usage of TableAppi with DateRangePickerAppi
import React, { useState } from "react";
import { TableAppi } from "./table_appi";
import { DateRange } from "../date_range_picker_appi";

// Example data structure
const sampleData = [
  {
    id: "1",
    name: "John Doe",
    email: "john@example.com",
    date: "2024-01-15",
    status: "Active",
  },
  {
    id: "2", 
    name: "Jane Smith",
    email: "jane@example.com",
    date: "2024-02-20",
    status: "Inactive",
  },
  {
    id: "3",
    name: "Bob Johnson", 
    email: "bob@example.com",
    date: "2024-03-10",
    status: "Active",
  },
];

const columns = [
  { name: "Name", uid: "name" },
  { name: "Email", uid: "email" },
  { name: "Date", uid: "date" },
  { name: "Status", uid: "status" },
];

export function TableWithDateRangeExample() {
  const [dateRange, setDateRange] = useState<DateRange | null>(null);

  const handleDateRangeChange = (range: DateRange | null) => {
    setDateRange(range);
    console.log("Date range changed:", range);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Table with Date Range Filter Example</h1>
      
      <TableAppi
        columns={columns}
        rows={sampleData}
        ariaLabel="Example table with date range filter"
        
        // Enable filtering
        isFilterable={true}
        searchColumnUid="name"
        
        // Enable pagination
        isPaginated={true}
        rowsPerPage={10}
        
        // Enable date range picker
        showDateRangePicker={true}
        dateRangeColumnUid="date" // Filter by the 'date' column
        dateRangeLabel="Filter by Date Range"
        dateRangeDefaultValue={{
          start: "2024-01-01",
          end: "2024-12-31"
        }}
        onDateRangeChange={handleDateRangeChange}
        
        // Optional: Custom cell rendering
        renderCell={(column, value, rowIndex) => {
          if (column.uid === "status") {
            return (
              <span className={`px-2 py-1 rounded-full text-xs ${
                value === "Active" 
                  ? "bg-green-100 text-green-800" 
                  : "bg-red-100 text-red-800"
              }`}>
                {value}
              </span>
            );
          }
          return value;
        }}
      />
      
      {/* Display current date range */}
      {dateRange && (
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-medium text-blue-900">Current Date Range:</h3>
          <p className="text-blue-700">
            From: {dateRange.start} | To: {dateRange.end}
          </p>
        </div>
      )}
    </div>
  );
}

export default TableWithDateRangeExample;
