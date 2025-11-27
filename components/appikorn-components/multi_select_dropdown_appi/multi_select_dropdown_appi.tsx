import React, { memo, useEffect, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";

interface MultiSelectDropdownProps {
  label: string;
  options: { CODE: string; DESC: string }[];
  selectedKeys: string[];
  onSelectionChange: (keys: string[]) => void;
}

export const MultiSelectDropdownAppi = memo(
  ({
    label,
    options,
    selectedKeys,
    onSelectionChange,
  }: MultiSelectDropdownProps) => {
    const [open, setOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          dropdownRef.current &&
          !dropdownRef.current.contains(event.target as Node)
        ) {
          setOpen(false);
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, []);

    const toggleSelection = (code: string) => {
      const newKeys = selectedKeys.includes(code)
        ? selectedKeys.filter((k) => k !== code)
        : [...selectedKeys, code];
      onSelectionChange(newKeys);
    };

    return (
      <div className="relative inline-block text-right" ref={dropdownRef}>
        <button
          onClick={() => setOpen((p) => !p)}
          className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition h-10"
          aria-haspopup="true"
          aria-expanded={open}
        >
          <span className="text-gray-700 dark:text-gray-300">{label}</span>
          <ChevronDown size={16} className="text-gray-500" />
        </button>

        {open && (
          <div
            className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-50 origin-top-right"
            style={{ minWidth: 100, maxWidth: 150 }}
          >
            <div className="py-1 max-h-68 overflow-y-auto">
              {options.map((item) => {
                const active = selectedKeys.includes(item.CODE);
                return (
                  <button
                    key={item.CODE}
                    onClick={() => toggleSelection(item.CODE)}
                    className="flex items-center w-full px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 transition text-left"
                  >
                    {active ? (
                      <Check size={16} className="mr-2 text-primary" />
                    ) : (
                      <span className="mr-6" />
                    )}
                    {item.DESC}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }
);
