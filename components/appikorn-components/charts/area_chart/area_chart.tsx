"use client";

import { ApexOptions } from "apexcharts";
import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Lottie from "lottie-react";

import ErrorBoundary from "./error_boundary";
import { getThemeColor, getTextColor, getContentColor } from "./theme-utils";

import graphLoadingAnim from "@/public/assets/common/animation/graph_loading_anim.json";

// Import ApexCharts in a way that's compatible with Next.js SSR
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

// Define the props interface for our reusable component
interface AreaChartProps {
  // Data series for the chart
  series: Array<{
    name: string;
    data: number[];
  }>;
  // X-axis categories (labels) - required
  categories: string[];
  // Y-axis configuration
  yaxis?: {
    min?: number;
    max?: number;
    tickAmount?: number;
  };
  // Color settings
  colors?: {
    line?: string;
    gradient?: {
      from?: string;
      to?: string;
      opacityFrom?: number;
      opacityTo?: number;
    };
    text?: string; // Text color for axis labels
    tooltipText?: string; // Text color for tooltip content
    tooltipBg?: string; // Background color for tooltip

    // Loading state
    isLoading?: boolean;
    gridDivider?: string; // Color for horizontal grid dividers
  };
  // Font sizes
  fontSize?: {
    axis?: string; // Font size for axis labels
  };
  // Chart dimensions
  height?: number | string;
  width?: number | string;
  // Chart title
  title?: string;
  // Whether to show the toolbar
  showToolbar?: boolean;
  // Custom tooltip format
  tooltipFormat?: (value: number, seriesName: string) => string;
  // Container styling
  containerStyle?: React.CSSProperties;
  // Loading state
  isLoading?: boolean;
}

const AreaChart: React.FC<AreaChartProps> = ({
  series,
  categories,
  yaxis = { min: 10, max: 50, tickAmount: 4 },
  colors = {
    line: "", // Will be set dynamically from theme
    gradient: {
      from: "", // Will be set dynamically from theme
      to: "", // Will be set dynamically from theme
      opacityFrom: 0.6,
      opacityTo: 0.15,
    },
  },
  fontSize = {
    axis: "13px", // Default font size for axis labels
  },
  height = 280,
  width = "100%",
  title,
  showToolbar = false,
  tooltipFormat,
  containerStyle = {},
  isLoading = false,
}) => {
  // Series data is now passed as a prop

  // Render Chart only after mount to avoid SSR/hydration issues
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Get theme colors for the chart
  const [themeColors, setThemeColors] = useState({
    lineColor: getThemeColor("primary"),
    textColor: colors?.text || getTextColor(), // Use prop or default to black
    gridColor: colors?.gridDivider || getThemeColor("default", 300),
    tooltipBgColor: colors?.tooltipBg || getContentColor(2),
    tooltipTextColor: colors?.tooltipText || getThemeColor("foreground"), // Use prop or default to black
  });

  // Update colors when component mounts and when theme changes
  useEffect(() => {
    const updateThemeColors = () => {
      setThemeColors({
        lineColor: getThemeColor("primary"),
        textColor: colors?.text || getTextColor(), // Use prop or default to black
        gridColor: colors?.gridDivider || getThemeColor("default", 300),
        tooltipBgColor: colors?.tooltipBg || getContentColor(2),
        tooltipTextColor: colors?.tooltipText || getThemeColor("foreground"), // Use prop or default to black
      });
    };

    // Update colors on mount
    updateThemeColors();

    // Set up observer for theme changes (dark/light mode toggle)
    if (typeof window !== "undefined") {
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (
            mutation.attributeName === "class" &&
            (mutation.target as Element).classList.contains("dark") !==
              document.documentElement.classList.contains("dark")
          ) {
            updateThemeColors();
          }
        });
      });

      observer.observe(document.documentElement, { attributes: true });

      return () => observer.disconnect();
    }
  }, []);

  // Apply theme colors to the chart options
  colors.line = themeColors.lineColor;
  if (colors.gradient) {
    colors.gradient.from = themeColors.lineColor;
    colors.gradient.to = themeColors.lineColor;
  }

  // Create a simplified version of the chart options
  const safeOptions: ApexOptions = {
    chart: {
      height: height,
      type: "area",
      toolbar: { show: showToolbar },
      zoom: { enabled: showToolbar },
      background: "transparent",
    },
    title: {
      text: title,
      align: "left",
      style: {
        fontSize: "18px",
        fontWeight: "bold",
        color: themeColors.textColor,
      },
    },
    colors: [colors.line],
    stroke: { curve: "smooth", width: 3, colors: [colors.line] },
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        shade: colors.line,
        type: "vertical",
        opacityFrom: colors.gradient?.opacityFrom ?? 0.6,
        opacityTo: colors.gradient?.opacityTo ?? 0.15,
        stops: [0, 90],
      },
    },
    xaxis: {
      categories: categories,
      labels: {
        style: { colors: themeColors.textColor, fontSize: fontSize.axis },
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      min: yaxis.min,
      max: yaxis.max,
      tickAmount: yaxis.tickAmount,
      labels: {
        style: { colors: themeColors.textColor, fontSize: fontSize.axis },
      },
    },
    grid: {
      show: true,
      borderColor: themeColors.gridColor,
      strokeDashArray: 0,
      position: "back",
      xaxis: {
        lines: {
          show: false,
        },
      },
      yaxis: {
        lines: {
          show: true,
        },
      },
      padding: {
        top: 20,
        right: 20,
        bottom: 10,
        left: 20,
      },
    },
    markers: {
      size: 0,
      colors: [colors.line],
      strokeColors: "#fff",
      strokeWidth: 2,
      hover: {
        size: 8,
      },
    },
    dataLabels: { enabled: false },
    tooltip: {
      enabled: true,
      shared: true,
      intersect: false,
      followCursor: true,
      custom: function (opts) {
        const seriesIndex = opts.seriesIndex;
        const dataPointIndex = opts.dataPointIndex;
        const value = opts.series[seriesIndex][dataPointIndex];
        const seriesName = opts.w.globals.seriesNames[seriesIndex];
        const categoryLabel = opts.w.globals.categoryLabels[dataPointIndex];

        // Use custom tooltip format if provided, otherwise default
        if (tooltipFormat) {
          return tooltipFormat(value, seriesName);
        }

        return `<div style="background:${themeColors.tooltipBgColor}; color:${themeColors.tooltipTextColor}; padding:8px 12px; border-radius:5px; box-shadow: 0 0 0 1000px ${themeColors.tooltipBgColor}; clip-path: inset(0 -1000px -1000px 0);">
          <div style="margin-bottom:4px; color:${themeColors.tooltipTextColor};">${categoryLabel}</div>
          <div>
            <span style="color:${colors.line}; margin-right:5px;">●</span>
            <span style="color:${themeColors.tooltipTextColor};">${seriesName}: ${value}</span>
          </div>
        </div>`;
      },
    },
  };

  if (!mounted) return null;

  // Show placeholder while loading data
  if (isLoading) {
    return (
      <div
        className="flex items-center justify-center h-full"
        style={{
          borderRadius: "8px",
          maxWidth: typeof width === "string" ? width : `${width}px`,
          ...containerStyle,
        }}
      >
        <Lottie
          loop
          animationData={graphLoadingAnim}
          style={{ width: "40%", height: "40%", maxWidth: 180, maxHeight: 180 }}
        />
      </div>
    );
  }

  return (
    <div
      style={{
        borderRadius: "8px",
        maxWidth: typeof width === "string" ? width : `${width}px`,
        ...containerStyle,
      }}
    >
      <ErrorBoundary>
        <Chart
          height={height}
          options={safeOptions}
          series={series}
          type="area"
          width={typeof width === "string" ? undefined : width}
        />
      </ErrorBoundary>
    </div>
  );
};

export default AreaChart;
