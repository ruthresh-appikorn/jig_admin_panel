/* eslint-disable prettier/prettier */
import React, { useEffect, useState } from "react";
import { Button } from "@heroui/button";
import { Pagination } from "@heroui/pagination";
import { Select, SelectItem } from "@heroui/select";
import { Spinner } from "@heroui/spinner";
import { extendVariants } from "@heroui/system";
import {
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@heroui/table";

import { TopContentOne } from "./table_top_content_one_appi";
import {
  DateRangePickerAppi,
  DateRange,
} from "../date_range_picker_appi/date_range_picker";

// Define Selection type locally since @heroui/react might not be available
// This type should be compatible with @heroui/react Selection type
export type Selection = "all" | Set<string | number>;

// --- Search Filter UI and Handler ---

export const TableAppiBase = extendVariants(Table, {});

// Default slot classNames for TableAppi
export const tableAppiDefaultClassNames = {
  wrapper: [
    "bg-transparent",
    "p-1 sm:p-3 ",
    "w-full",
    "overflow-x-auto hide-horizontal-scrollbar", // ✅ UPDATED HERE
    "overflow-y-hidden",
    "border dark:border-gray-700",
    "scrollbar-thin",
    "scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600",
    "scrollbar-track-transparent",
    "rounded-sm",
  ],

  table: "  w-full min-w-[600px] sm:min-w-full border-collapse box-border", // ✅ Prevents table squishing
  th: [
    "bg-primary rounded-none",
    "dark:bg-primary-600",
    "text-white",
    "dark:text-gray-100",
    "text-xs sm:text-sm ", // ✅ Adjust font size by screen
    "py-2 sm:py-2 px-4",
    "text-center",
    "sticky top-0 z-10",
    "box-border",
    "whitespace-nowrap", // ✅ Prevents wrapping in headers
  ],
  tr: "even:bg-primary/5 dark:even:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 data-[selected=true]:bg-primary-100 dark:data-[selected=true]:bg-primary-900/30   box-border",
  td: [
    "py-1 sm:py-2  sm:px-3",
    "text-xs sm:text-sm md:text-[15px]", // ✅ Responsive text sizing
    "text-gray-900 dark:text-gray-100",
    "box-border",
    "whitespace-nowrap", // ✅ Keep cells single-line
    "max-w-[150px] sm:max-w-[300px]", // ✅ Prevent layout overflow
    "truncate", // ✅ Truncate long text gracefully
    "rounded-none",
  ],
};

// Define types for column and row data
export interface TableColumn {
  name: string;
  uid: string;
  renderCell?: (value: any, rowIndex: number) => React.ReactNode;
  className?: string;
}

export interface TableRowData {
  id: string;
  [key: string]: any;
}

// Props for the table component
export interface TableAppiProps {
  columns: TableColumn[];
  rows: TableRowData[];
  ariaLabel?: string;
  classNames?: typeof tableAppiDefaultClassNames;
  renderCell?: (
    column: TableColumn,
    value: any,
    rowIndex: number
  ) => React.ReactNode;
  // Selection props
  selectionMode?: "none" | "single" | "multiple";
  selectedKeys?: Selection;
  onSelectionChange?: (keys: Selection) => void;
  searchColumnUid?: string;
  onFilterChange?: (filterValue: string) => void;
  // New prop for search submission with column info
  onSearchSubmit?: (searchValue: string, searchColumn?: string) => void;
  isFilterable?: boolean;
  isPaginated?: boolean;
  currentPage?: number;
  rowsPerPage?: number;
  totalPages?: number;
  onPageChange?: (page: number, rowsPerPage: number) => void;
  onRowsPerPageChange?: (rowsPerPage: number) => void;
  isLoading?: boolean;
  showColumnVisibility?: boolean;
  totalLength?: number; // Total number of records (for smart pagination)
  showModernLoader?: boolean; // Show modern loader during loading
  // Date range picker props
  showDateRangePicker?: boolean; // Show/hide date range picker
  dateRangeColumnUid?: string; // Column to filter by date range
  onDateRangeChange?: (range: DateRange | null) => void; // Handle date range changes
  dateRangeLabel?: string; // Label for date range picker
  dateRangeDefaultValue?: DateRange | null; // Default date range value
}

// Table component with column visibility
export function TableAppi({
  ariaLabel = "Data table",
  classNames = tableAppiDefaultClassNames,
  columns,
  rows,
  renderCell,
  // Selection props with defaults
  selectionMode = "none",
  selectedKeys,
  onSelectionChange,
  searchColumnUid,
  onFilterChange,
  onSearchSubmit,
  isFilterable,
  isPaginated = false,
  currentPage: externalCurrentPage,
  rowsPerPage: externalRowsPerPage = 10,
  totalPages: externalTotalPages,
  onPageChange,
  onRowsPerPageChange,
  isLoading = false,
  showColumnVisibility = true,
  totalLength,
  showModernLoader = false,
  // Date range picker props
  showDateRangePicker = false,
  dateRangeColumnUid,
  onDateRangeChange,
  dateRangeLabel = "Filter by date range",
  dateRangeDefaultValue,
}: TableAppiProps) {
  // Internal pagination state
  const [internalCurrentPage, setInternalCurrentPage] = React.useState(1);
  const [internalRowsPerPage, setInternalRowsPerPage] = React.useState(10);

  // Use external pagination props if provided, otherwise use internal state
  const currentPage = externalCurrentPage || internalCurrentPage;
  const rowsPerPage = externalRowsPerPage || internalRowsPerPage;
  const totalPages = externalTotalPages;
  const [filterValue, setFilterValue] = React.useState("");
  const [dateRangeValue, setDateRangeValue] = React.useState<DateRange | null>(
    dateRangeDefaultValue || null
  );

  const [currentSearchColumnUid, setCurrentSearchColumnUid] =
    React.useState(searchColumnUid);

  const hasSearchFilter = Boolean(filterValue);
  const hasDateRangeFilter = Boolean(
    dateRangeValue && dateRangeValue.start && dateRangeValue.end
  );

  const filteredItems = React.useMemo(() => {
    let filteredRows = [...rows];

    // Apply search filter (only for client-side filtering)
    // If onSearchSubmit is provided, server handles the filtering
    if (!onSearchSubmit && hasSearchFilter && currentSearchColumnUid) {
      filteredRows = filteredRows.filter((row) =>
        String(row[currentSearchColumnUid!])
          .toLowerCase()
          .includes(filterValue.toLowerCase())
      );
    }

    // Apply date range filter
    if (hasDateRangeFilter && dateRangeColumnUid && dateRangeValue) {
      filteredRows = filteredRows.filter((row) => {
        const rowDateValue = row[dateRangeColumnUid];
        if (!rowDateValue) return false;

        try {
          // Parse the row date (handle various formats)
          const rowDate = new Date(rowDateValue);
          const startDate = new Date(dateRangeValue.start);
          const endDate = new Date(dateRangeValue.end);

          // Set time to start/end of day for proper comparison
          startDate.setHours(0, 0, 0, 0);
          endDate.setHours(23, 59, 59, 999);

          return rowDate >= startDate && rowDate <= endDate;
        } catch (error) {
          console.warn(
            "Failed to parse date for filtering:",
            rowDateValue,
            error
          );
          return false;
        }
      });
    }

    return filteredRows;
  }, [
    rows,
    filterValue,
    currentSearchColumnUid,
    hasDateRangeFilter,
    dateRangeColumnUid,
    dateRangeValue,
    onSearchSubmit,
  ]);

  // Smart pagination calculation
  const pages = React.useMemo(() => {
    if (totalPages) return totalPages;
    if (!isPaginated) return 1;

    // Use totalLength if provided (for server-side pagination)
    const totalItems = totalLength || filteredItems.length;
    return Math.ceil(totalItems / rowsPerPage);
  }, [totalPages, isPaginated, totalLength, filteredItems.length, rowsPerPage]);

  const items = React.useMemo(() => {
    if (!isPaginated) return filteredItems;

    // If totalLength is provided, assume server-side pagination
    // In this case, the rows prop already contains the correct page data
    if (totalLength) {
      return filteredItems; // Don't slice - API already returned correct page
    }

    // Client-side pagination - slice the data
    const start = (currentPage - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    return filteredItems.slice(start, end);
  }, [currentPage, filteredItems, rowsPerPage, isPaginated, totalLength]);

  // State to force re-mounting the pagination component
  const [paginationKey, setPaginationKey] = React.useState(0);

  const handlePageChange = React.useCallback(
    (page: number) => {
      // Update internal state if not externally controlled
      if (!externalCurrentPage) {
        setInternalCurrentPage(page);
      }

      // Call external handler if provided
      if (onPageChange) {
        onPageChange(page, rowsPerPage);
      }

      // By changing the key, we force the component to re-mount and respect the props
      setPaginationKey((prev) => prev + 1);
    },
    [onPageChange, externalCurrentPage, rowsPerPage]
  );

  const handleRowsPerPageChange = React.useCallback(
    (newRowsPerPage: number) => {
      // Update internal state if not externally controlled
      if (!externalRowsPerPage) {
        setInternalRowsPerPage(newRowsPerPage);
      }

      // Reset to first page when changing rows per page
      const newPage = 1;
      if (!externalCurrentPage) {
        setInternalCurrentPage(newPage);
      }

      // Call external handlers if provided
      if (onRowsPerPageChange) {
        onRowsPerPageChange(newRowsPerPage);
      }
      if (onPageChange) {
        onPageChange(newPage, newRowsPerPage);
      }

      setPaginationKey((prev) => prev + 1);
    },
    [
      onRowsPerPageChange,
      onPageChange,
      externalRowsPerPage,
      externalCurrentPage,
    ]
  );

  const onNextPage = React.useCallback(() => {
    if (currentPage < pages) {
      handlePageChange(currentPage + 1);
    }
  }, [currentPage, pages, handlePageChange]);

  const onPreviousPage = React.useCallback(() => {
    if (currentPage > 1) {
      handlePageChange(currentPage - 1);
    }
  }, [currentPage, handlePageChange]);

  const onSearchChange = React.useCallback(
    (value?: string) => {
      const newFilterValue = value || "";

      setFilterValue(newFilterValue);

      // Only call onFilterChange for immediate feedback (optional)
      if (onFilterChange) {
        onFilterChange(newFilterValue);
      }
    },
    [onFilterChange]
  );

  // Handle search submission (triggered by Enter key or search button)
  const handleSearchSubmit = React.useCallback(() => {
    if (onSearchSubmit) {
      // Pass both the search value and the current search column
      onSearchSubmit(filterValue, currentSearchColumnUid);
    }
  }, [onSearchSubmit, filterValue, currentSearchColumnUid]);

  const onClear = React.useCallback(() => {
    setFilterValue("");

    if (onFilterChange) {
      onFilterChange("");
    }

    // Trigger search with empty value when clearing
    if (onSearchSubmit) {
      onSearchSubmit("", currentSearchColumnUid);
    }
  }, [onFilterChange, onSearchSubmit, currentSearchColumnUid]);

  const handleSearchColumnChange = React.useCallback((uid: React.Key) => {
    const newColumnUid = uid as string;
    setCurrentSearchColumnUid(newColumnUid);

    // Re-trigger search with the new column if there's an active search
    // This ensures changing the filter column immediately updates results
  }, []);

  const handleDateRangeChange = React.useCallback(
    (range: DateRange | null) => {
      setDateRangeValue(range);
      if (onDateRangeChange) {
        onDateRangeChange(range);
      }
    },
    [onDateRangeChange]
  );

  const searchPlaceholder = React.useMemo(() => {
    if (!currentSearchColumnUid) return "Search...";
    const column = columns.find((c) => c.uid === currentSearchColumnUid);

    return `Search by ${column ? column.name : currentSearchColumnUid}...`;
  }, [currentSearchColumnUid, columns]);

  // State for visible columns
  const [visibleColumns, setVisibleColumns] = React.useState<
    Set<React.Key> | "all"
  >("all");

  // Internal state for selection when not controlled
  const [internalSelectedKeys, setInternalSelectedKeys] =
    React.useState<Selection>(new Set([]));

  // Use controlled or uncontrolled selection state with suppressed hydration warning
  // Using empty set for initial client render to match server render
  const selection = React.useMemo(() => {
    // Only use client-side selection after hydration
    if (typeof window === "undefined") {
      return new Set([]);
    }

    return selectedKeys !== undefined ? selectedKeys : internalSelectedKeys;
  }, [selectedKeys, internalSelectedKeys]);

  // Handle hydration mismatch by controlling client-side rendering
  const [isClient, setIsClient] = useState(false);

  // Only enable selection features after hydration is complete
  useEffect(() => {
    setIsClient(true);

    // We'll use useEffect to ensure selection state is only applied client-side
    // This approach avoids hydration mismatch warnings without suppressing errors
  }, []);

  // Handle selection changes
  const handleSelectionChange = (keys: Selection) => {
    // Update internal state if uncontrolled
    if (selectedKeys === undefined) {
      setInternalSelectedKeys(keys);
    }
    // Call external handler if provided
    if (onSelectionChange) {
      onSelectionChange(keys);
    }
  };

  // Handle visible columns change directly with setVisibleColumns

  // Generate stable keys for table rows to avoid hydration mismatch
  const getStableKey = React.useCallback((id: string | number) => {
    return `row-${String(id)}`;
  }, []);

  // To prevent hydration errors, we will only render the table on the client.
  // The server will render null, and the client will render the full table after hydration.
  if (!isClient) {
    return null; // Or a loading skeleton for better UX
  }

  // Modern Loader Component
  const ModernLoader = () => (
    <div className="w-full flex flex-col items-center justify-center py-0 px-2 sm:px-4 bg-white dark:bg-gray-900  border border-gray-200 dark:border-gray-700">
      <div className="flex flex-col items-center text-center space-y-4">
        <Spinner
          size="lg"
          color="primary"
          classNames={{
            wrapper: "w-16 h-16",
            circle1: "border-b-primary-500",
            circle2: "border-b-primary-300",
          }}
        />
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Loading Data
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm">
            Please wait while we fetch your data...
          </p>
        </div>
      </div>
    </div>
  );

  // Show modern loader if loading and showModernLoader is true
  if (isLoading && showModernLoader) {
    return (
      <div className="w-full flex flex-col pb-0 mb-0">
        {isFilterable && (
          <TopContentOne
            columns={columns}
            isFilterable={isFilterable}
            searchColumnUid={currentSearchColumnUid}
            searchPlaceholder={searchPlaceholder}
            showColumnVisibility={showColumnVisibility}
            visibleColumns={visibleColumns}
            onClear={onClear}
            onSearchChange={onSearchChange}
            onSearchSubmit={onSearchSubmit ? handleSearchSubmit : undefined}
            onSearchColumnChange={handleSearchColumnChange}
            onVisibleColumnsChange={setVisibleColumns}
            // Date range picker props
            showDateRangePicker={showDateRangePicker}
            dateRangeLabel={dateRangeLabel}
            dateRangeDefaultValue={dateRangeDefaultValue}
            onDateRangeChange={handleDateRangeChange}
          />
        )}
        <ModernLoader />
      </div>
    );
  }

  // Check if there are no rows to display
  const hasNoData = rows.length === 0;

  // If no data, show empty state
  if (hasNoData && !isLoading) {
    return (
      <div className="w-full flex flex-col pb-0 mb-0">
        {/* Show top content only if filtering is enabled */}
        {isFilterable && (
          <TopContentOne
            columns={columns}
            isFilterable={isFilterable}
            searchColumnUid={currentSearchColumnUid}
            searchPlaceholder={searchPlaceholder}
            showColumnVisibility={showColumnVisibility}
            visibleColumns={visibleColumns}
            onClear={onClear}
            onSearchChange={onSearchChange}
            onSearchSubmit={onSearchSubmit ? handleSearchSubmit : undefined}
            onSearchColumnChange={handleSearchColumnChange}
            onVisibleColumnsChange={setVisibleColumns}
            // Date range picker props
            showDateRangePicker={showDateRangePicker}
            dateRangeLabel={dateRangeLabel}
            dateRangeDefaultValue={dateRangeDefaultValue}
            onDateRangeChange={handleDateRangeChange}
          />
        )}

        {/* Empty State */}
        <div className="w-full flex flex-col items-center justify-center py-16 px-4 bg-white dark:bg-gray-900  border border-gray-200 dark:border-gray-700">
          <div className="flex flex-col items-center text-center space-y-4">
            {/* Icon */}
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-900 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-gray-400 dark:text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>

            {/* Text */}
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                No Data Available
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm">
                There are currently no records to display. Data will appear here
                once it becomes available.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col pb-0 mb-0">
      <TopContentOne
        columns={columns}
        isFilterable={isFilterable}
        searchColumnUid={currentSearchColumnUid}
        searchPlaceholder={searchPlaceholder}
        showColumnVisibility={showColumnVisibility}
        visibleColumns={visibleColumns}
        onClear={onClear}
        onSearchChange={onSearchChange}
        onSearchSubmit={onSearchSubmit ? handleSearchSubmit : undefined} // <--- FIX
        onSearchColumnChange={handleSearchColumnChange}
        onVisibleColumnsChange={setVisibleColumns}
        showDateRangePicker={showDateRangePicker}
        dateRangeLabel={dateRangeLabel}
        dateRangeDefaultValue={dateRangeDefaultValue}
        onDateRangeChange={handleDateRangeChange}
      />

      <TableAppiBase
        aria-label={ariaLabel}
        bottomContent={
          isPaginated ? (
            <div className="px-0 sm:px-2 md:px-4 py-2 sm:py-4 flex flex-col lg:flex-row justify-between items-center gap-2 sm:gap-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
              {/* Selection info - Left side on desktop, top on mobile */}
              {selectionMode === "multiple" && (
                <div className="order-2 lg:order-1 w-full lg:w-auto">
                  <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                    {selection === "all"
                      ? "All items selected"
                      : `${selection instanceof Set ? selection.size : 0} of ${
                          filteredItems.length
                        } selected`}
                  </span>
                </div>
              )}

              {/* Pagination - Center */}
              <div className="flex flex-col sm:flex-row items-center justify-between w-full gap-2">
                <div className="order-1 lg:order-2 flex items-center gap-2">
                  {pages > 1 ? (
                    <Pagination
                      key={paginationKey}
                      isCompact
                      showControls
                      color="primary"
                      page={currentPage}
                      total={pages}
                      onChange={handlePageChange}
                      classNames={{
                        wrapper:
                          "flex gap-1 items-center justify-center px-1 py-1 bg-transparent border border-gray-200 dark:border-gray-700 rounded-sm",
                        item: "w-9 h-9 sm:w-8 sm:h-8 flex items-center justify-center text-sm sm:text-xs font-medium text-gray-500 dark:text-gray-400 transition-all duration-200 bg-transparent hover:text-blue-500 dark:hover:text-blue-400 hover:scale-105",
                        cursor:
                          "text-blue-600 dark:text-blue-400 font-semibold sm:text-xs sm:w-8 sm:h-8",
                        prev: "w-9 h-9 sm:w-8 sm:h-8 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 bg-transparent transition-all duration-200 sm:text-xs",
                        next: "w-9 h-9 sm:w-8 sm:h-8 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 bg-transparent transition-all duration-200 sm:text-xs",
                      }}
                    />
                  ) : (
                    <div className="flex items-center gap-2 px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-sm border border-gray-300 dark:border-gray-600">
                      <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                        Page 1 of 1
                      </span>
                    </div>
                  )}
                </div>

                {/* Rows per page selector - Right side */}
                <div className="order-3 lg:order-3 flex items-center gap-2">
                  <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                    Rows per page:
                  </span>
                  <Select
                    size="sm"
                    selectedKeys={new Set([rowsPerPage.toString()])}
                    onSelectionChange={(keys) => {
                      const selectedKey = Array.from(keys)[0] as string;
                      if (selectedKey) {
                        handleRowsPerPageChange(parseInt(selectedKey));
                      }
                    }}
                    className="w-18 sm:w-20"
                    classNames={{
                      trigger:
                        "min-h-8 h-8 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600",
                      value: "text-sm",
                    }}
                  >
                    <SelectItem key="10">10</SelectItem>
                    <SelectItem key="15">15</SelectItem>
                    <SelectItem key="20">20</SelectItem>
                    <SelectItem key="25">25</SelectItem>
                  </Select>
                </div>
              </div>

              {/* Page info - Mobile only */}
              <div className="order-4 lg:hidden w-full text-center">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Page {currentPage} of {pages} •{" "}
                  {totalLength || filteredItems.length} total items
                </span>
              </div>
            </div>
          ) : null
        }
        bottomContentPlacement="outside"
        classNames={{
          ...classNames,
          base: "w-full box-border bg-transparent dark:bg-transparent", // Full width with proper box-sizing and transparent background
        }}
        selectedKeys={selection as any} // Type casting to avoid compatibility issues
        selectionMode={selectionMode}
        onSelectionChange={handleSelectionChange}
      >
        <TableHeader>
          {/* Render columns */}
          {[
            // Regular columns
            ...columns
              .filter(
                (column) =>
                  visibleColumns === "all" ||
                  (visibleColumns instanceof Set &&
                    visibleColumns.has(column.uid))
              )
              .map((column) => (
                <TableColumn
                  key={column.uid}
                  className={`text-center ${column.className ?? ""}`.trim()}
                >
                  {column.name}
                </TableColumn>
              )),
          ]}
        </TableHeader>
        <TableBody isLoading={isLoading}>
          {items.map((row) => (
            <TableRow
              key={getStableKey(row.id)}
              data-selected={
                isClient &&
                (selection === "all" ||
                  (selection instanceof Set && selection.has(row.id)))
              }
            >
              {[
                // Only render cells for visible columns
                ...columns
                  .filter(
                    (column) =>
                      visibleColumns === "all" ||
                      (visibleColumns instanceof Set &&
                        visibleColumns.has(column.uid))
                  )
                  .map((column) => {
                    // Safe access to row data using column uid
                    const columnKey = column.uid.toString();
                    const cellValue = row[columnKey];
                    const rowIndex = rows.findIndex((r) => r.id === row.id);

                    // Render cell content based on priority:
                    // 1. Column-specific renderCell function
                    // 2. Global renderCell function
                    // 3. Default string rendering
                    let cellContent;

                    if (column.renderCell) {
                      cellContent = column.renderCell(cellValue, rowIndex);
                    } else if (renderCell) {
                      cellContent = renderCell(column, cellValue, rowIndex);
                    } else {
                      cellContent = cellValue;
                    }

                    return (
                      <TableCell
                        key={`${row.id}-${column.uid}`}
                        className={`text-center ${
                          column.className ?? ""
                        }`.trim()}
                      >
                        {cellContent}
                      </TableCell>
                    );
                  }),
              ]}
            </TableRow>
          ))}
        </TableBody>
      </TableAppiBase>
    </div>
  );
}
