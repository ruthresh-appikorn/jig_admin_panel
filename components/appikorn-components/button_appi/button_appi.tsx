/* eslint-disable prettier/prettier */
// ButtonAppi.tsx
import { Button } from "@heroui/button";
import { extendVariants } from "@heroui/system";

/**
 * Global reusable button for your entire application.
 * - Responsive
 * - Dark mode supported
 * - Prebuilt color + radius + size variants
 * - Works out of the box without extra classNames
 */
export const ButtonAppi = extendVariants(Button, {
  variants: {
    // 🎨 Button color schemes
    color: {
      // primary:
      //   "bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 " +
      //   "focus:ring-2 focus:ring-blue-400/50 dark:bg-blue-500 dark:hover:bg-blue-600",
      // secondary:
      //   "bg-gray-100 text-gray-800 hover:bg-gray-200 active:bg-gray-300 " +
      //   "focus:ring-2 focus:ring-gray-300 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700",
      // success:
      //   "bg-green-600 text-white hover:bg-green-700 active:bg-green-800 " +
      //   "focus:ring-2 focus:ring-green-400/50 dark:bg-green-500 dark:hover:bg-green-600",
      // danger:
      //   "bg-red-600 text-white hover:bg-red-700 active:bg-red-800 " +
      //   "focus:ring-2 focus:ring-red-400/50 dark:bg-red-500 dark:hover:bg-red-600",
      // warning:
      //   "bg-yellow-500 text-white hover:bg-yellow-600 active:bg-yellow-700 " +
      //   "focus:ring-2 focus:ring-yellow-400/50 dark:bg-yellow-400 dark:hover:bg-yellow-500",
      // outline:
      //   "border border-gray-300 text-gray-700 bg-transparent hover:bg-gray-100 " +
      //   "focus:ring-2 focus:ring-gray-300 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800",
      // gradient:
      //   "bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white " +
      //   "hover:opacity-90 focus:ring-2 focus:ring-purple-400/50",
    },

    // 📏 Sizes
    size: {
      responsive:
        "text-sm px-4 py-2 " + // default (md)
        "max-[600px]:text-xs max-[600px]:px-3 max-[600px]:py-1.5", // mobile (sm)
      sm: "text-xs sm:text-sm px-3 py-1.5",
      md: "text-sm sm:text-base px-4 py-2",
      lg: "text-base sm:text-lg px-5 py-2",
    },

    // 🟢 Border radius options
    radius: {
      none: "rounded-sm",
      sm: "rounded-sm",
      md: "rounded-sm",
      lg: "rounded-sm",
      // full: "rounded-full",
    },

    // 📱 Full-width toggle
    fullWidth: {
      // true: "w-full justify-center",
      // false: "w-fit",
    },

    // 🚫 Disabled state
    isDisabled: {
      // true: "opacity-60 cursor-not-allowed",
      // false: "",
    },
  },

  // Default look (can override per button)
  defaultVariants: {
    // size: "md",
    radius: "sm",
    // color: "primary",
    size: "responsive",
    fullWidth: "true",
    color: "primary",
  },

  // Shared styling across all buttons
  compoundVariants: [
    {
      class:
        "font-medium tracking-wide select-none transition-all duration-200 shadow-sm " +
  "hover:shadow-md active:scale-[0.98] focus:outline-none " +
  "dark:focus:ring-offset-gray-900 " +
  "gap-x-4",  
    },
  ],
});
