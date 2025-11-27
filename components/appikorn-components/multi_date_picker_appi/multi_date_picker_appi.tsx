"use client";

import React, { useEffect, useState } from "react";
import { Popover, PopoverTrigger, PopoverContent, Button } from "@heroui/react";
import { Calendar } from "@heroui/calendar";
import { parseDate, DateValue } from "@internationalized/date";
import { CalendarIcon, ChevronDown } from "lucide-react";

export const MultiDatePickerAppi: React.FC<{
  defaultValues?: string[] | null;
  onChange: (values: string[]) => void;
  maxSelections?: number;
  label?: string;
  placeholder?: string;
  labelPlacement?: "inside" | "outside";
  validate?: (values: string[]) => string | null;
  [key: string]: any;
}> = ({
  defaultValues,
  onChange,
  maxSelections,
  label,
  placeholder = "Select dates",
  labelPlacement = "outside",
  validate,
  ...props
}) => {
  const [selectedDates, setSelectedDates] = useState<DateValue[]>([]);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const calendarRef = React.useRef<HTMLDivElement>(null);

  // Convert string → DateValue
  const parseDateString = (s?: string | null): DateValue | null => {
    if (!s) return null;
    const dateStr = s.split("T")[0];
    try {
      return parseDate(dateStr);
    } catch {
      return null;
    }
  };

  /** Load defaultValues - sync whenever they change */
  useEffect(() => {
    if (
      defaultValues &&
      Array.isArray(defaultValues) &&
      defaultValues.length > 0
    ) {
      const parsed = defaultValues
        .map(parseDateString)
        .filter(Boolean) as DateValue[];
      setSelectedDates(parsed);
    } else {
      setSelectedDates([]);
    }
  }, [defaultValues]);

  /** Mark selected dates in the DOM */
  useEffect(() => {
    if (!calendarRef.current) return;

    // Reset all cells first
    const allCells = calendarRef.current.querySelectorAll('[role="gridcell"]');
    allCells.forEach((cell) => {
      cell.removeAttribute("data-selected");
    });

    // Mark selected dates
    selectedDates.forEach((date) => {
      const dateStr = date.toString();
      const day = parseInt(dateStr.split("-")[2], 10);

      // Find cells with the matching day number
      allCells.forEach((cell) => {
        const cellText = cell.textContent?.trim();
        if (cellText === day.toString()) {
          // Check if it's in the current month view
          const isCurrentMonth = !cell.getAttribute("aria-disabled");
          if (isCurrentMonth) {
            cell.setAttribute("data-selected", "true");
          }
        }
      });
    });
  }, [selectedDates, open]);

  /** Handle single change but apply multi-select logic */
  const handleSingleSelect = (value: DateValue) => {
    const exists = selectedDates.some((d) => d.toString() === value.toString());

    let updated: DateValue[];

    if (exists) {
      // Remove if clicked again
      updated = selectedDates.filter((d) => d.toString() !== value.toString());
    } else {
      // Add new selection
      if (maxSelections && selectedDates.length >= maxSelections) {
        return;
      }
      updated = [...selectedDates, value];
    }

    setSelectedDates(updated);

    // Call onChange with the updated array
    const dateStrings = updated.map((d) => d.toString());
    
    if (validate) {
      setError(validate(dateStrings));
    }

    onChange(dateStrings);
  };

  const triggerText =
    selectedDates.length === 0
      ? placeholder
      : `${selectedDates.length} dates selected`;

  const isInvalid = !!error || props.isInvalid;
  const errorMessage = error || props.errorMessage;

  return (
    <div className="relative w-full">
      {/* HERO UI STYLE INPUT FIELD */}
      <div className="space-y-2">
        {label && (
          <label className={`block text-sm font-medium ${isInvalid ? "text-danger-500" : "text-gray-700 dark:text-gray-300"}`}>
            {label}
          </label>
        )}

        <div
          className={`w-full px-3 py-2 border-2 rounded-md cursor-pointer transition-all duration-200 
            ${isInvalid 
              ? "border-danger-500 hover:border-danger-600" 
              : "border-[#E4E4E7] dark:border-[#3F3F46] hover:border-[#A1A1AA] dark:hover:border-[#71717A]"
            }`}
          onClick={() => setOpen(true)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              setOpen(true);
            }
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${isInvalid ? "bg-danger-50 dark:bg-danger-900/20" : "bg-blue-50 dark:bg-blue-900/20"}`}>
                <CalendarIcon className={`w-4 h-4 ${isInvalid ? "text-danger-600 dark:text-danger-400" : "text-blue-600 dark:text-blue-400"}`} />
              </div>
              <div className="flex flex-col">
                <span className={`text-sm font-medium ${isInvalid ? "text-danger-600 dark:text-danger-400" : "text-gray-900 dark:text-white"}`}>
                  {triggerText}
                </span>
                <span className={`text-xs ${isInvalid ? "text-danger-400" : "text-gray-500 dark:text-gray-400"}`}>
                  {selectedDates.length === 0
                    ? "Select multiple dates"
                    : "Dates selected"}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {selectedDates.length > 0 && (
                <div className={`px-2 py-1 rounded-md ${isInvalid ? "bg-danger-100 dark:bg-danger-900/40" : "bg-green-50 dark:bg-green-900/20"}`}>
                  <span className={`text-xs font-medium ${isInvalid ? "text-danger-700 dark:text-danger-300" : "text-green-700 dark:text-green-400"}`}>
                    {selectedDates.length}
                  </span>
                </div>
              )}
              <ChevronDown className="w-5 h-5 text-gray-400 dark:text-gray-500" />
            </div>
          </div>
        </div>
        {isInvalid && (
          <div className="text-tiny text-danger">
            {errorMessage}
          </div>
        )}
      </div>

      {/* POPOVER CONTENT */}
      <Popover isOpen={open} onOpenChange={setOpen} placement="bottom">
        <PopoverTrigger>
          <div className=""></div>
        </PopoverTrigger>

        <PopoverContent className="p-0 shadow-xl border border-gray-200 dark:border-gray-700">
          <div className="bg-white dark:bg-gray-900 rounded-lg w-[320px] overflow-hidden">
            <div className="text-center font-semibold py-4 border-b bg-gray-50 dark:bg-gray-800">
              {selectedDates.length} dates selected
            </div>

            <div className="appi-calendar-wrapper" ref={calendarRef}>
              <Calendar
                {...props}
                value={null}
                onChange={handleSingleSelect}
                showMonthAndYearPickers={true}
                className="appi-calendar"
              />
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* CUSTOM SELECTED DATE STYLES */}
      <style>{`
        .appi-calendar-wrapper {
          padding: 0 !important;
          overflow: hidden !important;
        }

        .appi-calendar-wrapper * {
          overflow-x: hidden !important;
        }

        .appi-calendar [role="grid"] {
          gap: 0 !important;
          margin: 0 !important;
          padding: 0 !important;
          width: 100% !important;
        }

        .appi-calendar [role="row"] {
          gap: 0 !important;
          margin: 0 !important;
          padding: 0 !important;
        }

        .appi-calendar {
          width: 100%;
          min-width: 280px !important;
          padding: 16px !important;
          margin: 0 !important;
          overflow: hidden !important;
          background: white !important;
        }

        .dark .appi-calendar {
          background: #1f2937 !important;
        }

        .appi-calendar > div {
          width: 100% !important;
          min-width: auto !important;
          overflow: hidden !important;
          margin: 0 !important;
          padding: 0 !important;
        }

        .appi-calendar [role="grid"] {
          width: 100% !important;
          min-width: auto !important;
          table-layout: fixed !important;
        }

        .appi-calendar [role="gridcell"] {
          cursor: pointer;
          width: 36px !important;
          height: 36px !important;
          border-radius: 50% !important;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          font-weight: 500;
          padding: 0 !important;
          margin: 2px !important;
          color: #374151 !important;
          background: transparent !important;
        }

        .dark .appi-calendar [role="gridcell"] {
          color: #d1d5db !important;
        }

        .appi-calendar [role="columnheader"] {
          width: 36px !important;
          font-weight: 600 !important;
          color: #374151 !important;
          font-size: 12px !important;
          text-transform: uppercase;
          padding: 8px 0 !important;
        }

        .dark .appi-calendar [role="columnheader"] {
          color: #d1d5db !important;
        }

        .appi-calendar [role="gridcell"][aria-current="date"]:not([data-selected="true"]) {
          border: 2px solid #0066ff !important;
          border-radius: 50% !important;
        }

        .appi-calendar [role="gridcell"][aria-disabled="true"] {
          color: #9ca3af !important;
          cursor: not-allowed !important;
        }

        .dark .appi-calendar [role="gridcell"][aria-disabled="true"] {
          color: #4b5563 !important;
        }

        .appi-calendar [role="heading"] {
          font-weight: 600 !important;
          color: #0066ff !important;
          font-size: 16px !important;
          margin: 8px 0 !important;
        }

        .appi-calendar button[aria-label*="Previous"],
        .appi-calendar button[aria-label*="Next"] {
          color: #0066ff !important;
          margin: 4px !important;
          padding: 6px !important;
          background: none !important;
          border: none !important;
          text-transform: uppercase;
          padding: 8px 0 !important;
        }

        [data-slot="popover-content"] {
          width: auto !important;
          min-width: auto !important;
          max-width: none !important;
          overflow: hidden !important;
        }

        .appi-calendar > div > div {
          width: 100% !important;
          overflow: hidden !important;
        }

        .appi-calendar ::-webkit-scrollbar {
          display: none !important;
        }

        .appi-calendar {
          -ms-overflow-style: none !important;
          scrollbar-width: none !important;
        }

        .appi-calendar [role="navigation"] {
          display: flex !important;
          align-items: center !important;
          justify-content: space-between !important;
          padding: 0 8px !important;
          margin-bottom: 12px !important;
        }

        .appi-calendar [role="grid"] [role="rowgroup"] {
          overflow: hidden !important;
          margin: 0 !important;
          padding: 0 !important;
        }

        /* Selected date styles */
        .appi-calendar [role="gridcell"][data-selected="true"] {
          background: #0066ff !important;
          color: white !important;
          font-weight: 600 !important;
        }

        .appi-calendar [role="gridcell"][data-selected="true"]:hover {
          background: #0052cc !important;
        }

        .appi-calendar [role="gridcell"]:hover:not([aria-disabled="true"]):not([data-selected="true"]) {
          background: #f3f4f6 !important;
          color: #374151 !important;
        }

        .dark .appi-calendar [role="gridcell"]:hover:not([aria-disabled="true"]):not([data-selected="true"]) {
          background: #374151 !important;
          color: #d1d5db !important;
        }
      `}</style>
    </div>
  );
};

export default MultiDatePickerAppi;
