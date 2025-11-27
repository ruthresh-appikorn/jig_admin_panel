/* eslint-disable padding-line-between-statements */
/* eslint-disable react/jsx-sort-props */
/* eslint-disable prettier/prettier */

import React from "react";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/dropdown";
import { ChevronDown, Filter as FilterIcon, SearchIcon } from "lucide-react";
import {
  DateRangePickerAppi,
  DateRange,
} from "../date_range_picker_appi/date_range_picker";

export interface TopContentOneProps {
  onClear: (data: any) => void;
  onSearchChange: (data: any) => void;
  columns: { name: string; uid: React.Key }[];
  visibleColumns: Set<React.Key> | "all";
  onVisibleColumnsChange: (selection: Set<React.Key> | "all") => void;
  searchPlaceholder?: string;
  isFilterable?: boolean;
  searchColumnUid?: React.Key;
  onSearchColumnChange?: (uid: React.Key) => void;
  onSearchSubmit?: () => void; // New prop for search submission
  showColumnVisibility?: boolean;
  // Date range picker props
  showDateRangePicker?: boolean;
  dateRangeLabel?: string;
  dateRangeDefaultValue?: DateRange | null;
  onDateRangeChange?: (range: DateRange | null) => void;
}

export function TopContentOne({
  onClear,
  onSearchChange,
  columns,
  visibleColumns,
  onVisibleColumnsChange,
  onSearchSubmit, // Pass this down
  searchPlaceholder,
  isFilterable,
  searchColumnUid,
  onSearchColumnChange,
  showColumnVisibility = true,
  showDateRangePicker = false,
  dateRangeLabel,
  dateRangeDefaultValue,
  onDateRangeChange,
}: TopContentOneProps) {
  if (typeof onSearchSubmit === "function") {
    isFilterable = false;
  }

  return (
    <div className="flex flex-col gap-4 mb-4 w-full">
      {/* Search and Filter Controls */}
      <div className="flex justify-end w-full">
        <TableSearchFilter
          columns={columns}
          isFilterable={isFilterable}
          searchColumnUid={searchColumnUid}
          searchPlaceholder={searchPlaceholder}
          showColumnVisibility={showColumnVisibility}
          visibleColumns={visibleColumns}
          onClear={onClear}
          onSearchChange={onSearchChange}
          onSearchSubmit={onSearchSubmit} // Pass it here
          onSearchColumnChange={onSearchColumnChange}
          onVisibleColumnsChange={onVisibleColumnsChange}
          // Date range picker props
          showDateRangePicker={showDateRangePicker}
          dateRangeLabel={dateRangeLabel}
          dateRangeDefaultValue={dateRangeDefaultValue}
          onDateRangeChange={onDateRangeChange}
        />
      </div>
    </div>
  );
}

export function TableSearchFilter({
  columns = [],
  visibleColumns,
  onClear,
  onSearchChange,
  onSearchSubmit, // Add this
  onVisibleColumnsChange,
  searchPlaceholder = "Search by name...",
  isFilterable = false,
  searchColumnUid,
  onSearchColumnChange,
  showColumnVisibility = true,
  showDateRangePicker = false,
  dateRangeLabel,
  dateRangeDefaultValue,
  onDateRangeChange,
}: {
  columns?: { name: string; uid: React.Key }[];
  visibleColumns: Set<React.Key> | "all";
  onClear: (data: any) => void;
  onSearchChange: (data: any) => void;
  onSearchSubmit?: () => void; // Add this type
  onVisibleColumnsChange: (selection: Set<React.Key> | "all") => void;
  searchPlaceholder?: string;
  isFilterable?: boolean;
  searchColumnUid?: React.Key;
  onSearchColumnChange?: (uid: React.Key) => void;
  showColumnVisibility?: boolean;
  showDateRangePicker?: boolean;
  dateRangeLabel?: string;
  dateRangeDefaultValue?: DateRange | null;
  onDateRangeChange?: (range: DateRange | null) => void;
}) {
  const selectedKeys = React.useMemo(() => {
    if (visibleColumns === "all") {
      return new Set(columns.map((column) => column.uid.toString()));
    }
    if (!visibleColumns) {
      return new Set<string>();
    }
    return new Set(Array.from(visibleColumns).map((key) => key.toString()));
  }, [visibleColumns, columns]);

  const selectedSearchColumnKey = React.useMemo(() => {
    return searchColumnUid ? [searchColumnUid.toString()] : [];
  }, [searchColumnUid]);

  const selectedColumnName = React.useMemo(() => {
    if (!searchColumnUid || !columns.length) return "Filter By";
    const column = columns.find((c) => c.uid === searchColumnUid);
    return column ? column.name : "Filter By";
  }, [searchColumnUid, columns]);

  if (typeof onSearchSubmit === "function") {
    isFilterable = false;
  }

  return (
    <div className="flex flex-row w-full items-center justify-between gap-3 flex-wrap">
      {/* Search Input with Enter key support */}

      <Input
        isClearable
        className="w-full sm:max-w-[40%] text-black"
        placeholder={searchPlaceholder}
        startContent={<SearchIcon color="black" size={16} />}
        type="search"
        variant="bordered"
        onClear={() => onClear("clear")}
        onValueChange={onSearchChange}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault(); // ⭐ FIX
            if (onSearchSubmit) {
              onSearchSubmit();
            }
          }
        }}
      />

      <div className="flex gap-3 items-center flex-wrap justify-end">
        {/* Always visible Date Range Picker */}
        {showDateRangePicker && (
          <DateRangePickerAppi
            label={dateRangeLabel}
            defaultValue={dateRangeDefaultValue}
            onChange={onDateRangeChange || (() => {})}
            className="max-w-xs [&>div]:h-[43px] mt-2 [&_input]:h-[43px]"
          />
        )}

        {/* Filter Dropdown */}
        {isFilterable && (
          <Dropdown>
            <DropdownTrigger>
              <Button startContent={<FilterIcon size={16} />} variant="solid">
                <span className="hidden sm:inline ml-2">
                  {selectedColumnName}
                </span>
              </Button>
            </DropdownTrigger>
            <DropdownMenu
              disallowEmptySelection
              aria-label="Filter by column"
              closeOnSelect
              selectedKeys={selectedSearchColumnKey}
              selectionMode="single"
              onSelectionChange={(keys: "all" | Set<React.Key>) => {
                if (onSearchColumnChange && keys !== "all" && keys.size > 0) {
                  const key: React.Key | undefined = keys.values().next().value;
                  if (key !== undefined) onSearchColumnChange(key);
                }
              }}
            >
              {(columns || []).map((column) => (
                <DropdownItem
                  key={column.uid.toString()}
                  className="capitalize"
                >
                  {column.name}
                </DropdownItem>
              ))}
            </DropdownMenu>
          </Dropdown>
        )}

        {/* Column Visibility Dropdown */}
        {showColumnVisibility && (
          <Dropdown>
            <DropdownTrigger>
              <Button endContent={<ChevronDown size={16} />} variant="solid">
                Columns
              </Button>
            </DropdownTrigger>
            <DropdownMenu
              disallowEmptySelection
              aria-label="Table Columns"
              closeOnSelect={false}
              selectedKeys={selectedKeys}
              selectionMode="multiple"
              onSelectionChange={onVisibleColumnsChange}
            >
              {(columns || []).map((column) => (
                <DropdownItem
                  key={column.uid.toString()}
                  className="capitalize"
                >
                  {column.name}
                </DropdownItem>
              ))}
            </DropdownMenu>
          </Dropdown>
        )}
      </div>
    </div>
  );
}
