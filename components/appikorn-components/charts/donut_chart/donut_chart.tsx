"use client";

import { ApexOptions } from "apexcharts";
import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Lottie from "lottie-react";

// local utilities

import ErrorBoundary from "../area_chart/error_boundary";
import { getTextColor, getContentColor } from "../area_chart/theme-utils";

import pdfLoadingAnim from "@/public/assets/common/animation/pdf_loading_anim.json";

// Import ApexCharts in a way that's compatible with Next.js SSR
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

// Define the props interface for our reusable component
interface DonutChartProps {
  /** Show loading placeholder instead of chart */
  isLoading?: boolean;
  // Data series for the chart
  series: number[];
  // Labels for each series
  labels: string[];
  // Color settings
  colors?: string[];
  // Font sizes
  fontSize?: {
    labels?: string;
    total?: string;
    totalNumber?: string; // New property for total number font size
    legend?: string;
  };
  // Chart dimensions
  height?: number | string;
  width?: number | string;
  // Chart title (not currently used but kept for API consistency)
  title?: string;
  // Whether to show the toolbar
  showToolbar?: boolean;
  // Whether to show the total in the center
  showTotal?: boolean;
  // Custom total formatter
  totalFormatter?: (total: number) => string;
  // Container styling
  containerStyle?: React.CSSProperties;
  // Legend position
  legendPosition?: "top" | "right" | "bottom" | "left";
  // Donut size (percentage of chart size)
  donutSize?: string;
  textColor?: string;
}

const DonutChart: React.FC<DonutChartProps> = ({
  series,
  labels,
  colors,
  fontSize = {},
  height = 350,
  width = "100%",
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  title = "", // Title is not currently used but kept for API consistency
  showToolbar = false,
  showTotal = true,
  totalFormatter,
  containerStyle = {},
  legendPosition = "bottom",
  donutSize = "65%",
  textColor,
  isLoading = false,
}) => {
  // Base font sizes
  const defaultFontSize = {
    labels: "12px",
    total: "15px",
    totalNumber: "20px",
    legend: "13px",
  } as const;

  // Merge defaults with user overrides
  const mergedFontSize = {
    ...defaultFontSize,
    ...fontSize,
  } as typeof defaultFontSize;
  // Render Chart only after mount to avoid SSR/hydration issues
  const [mounted, setMounted] = useState(false);
  const chartRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Apply custom styling to the total number
  useEffect(() => {
    if (mounted && chartRef.current) {
      // Wait for chart to render
      const applyTotalNumberStyle = () => {
        if (typeof document !== "undefined") {
          // Find the total value element and apply custom font size
          const totalValueEl = chartRef.current?.querySelector(
            ".apexcharts-datalabels-group .apexcharts-data-labels text:last-child",
          );

          if (
            totalValueEl instanceof SVGTextElement &&
            mergedFontSize.totalNumber
          ) {
            // Apply the font size directly to the SVG element
            totalValueEl.setAttribute(
              "style",
              `font-size: ${mergedFontSize.totalNumber}`,
            );
            // Also set the dy attribute to adjust vertical position based on font size
            const fontSizeValue = parseInt(mergedFontSize.totalNumber);

            if (!isNaN(fontSizeValue)) {
              totalValueEl.setAttribute("dy", `${fontSizeValue * 0.3}`);
            }
          }
        }
      };

      // Create an observer to watch for changes to the chart
      const observer = new MutationObserver(() => {
        applyTotalNumberStyle();
      });

      // Apply initially and observe changes
      setTimeout(() => {
        applyTotalNumberStyle();

        // Start observing the chart container for changes
        if (chartRef.current) {
          observer.observe(chartRef.current, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ["class", "style"],
          });
        }
      }, 100);

      // Also apply after a longer delay to ensure chart is fully rendered
      setTimeout(applyTotalNumberStyle, 500);
      setTimeout(applyTotalNumberStyle, 1000);

      return () => {
        observer.disconnect();
      };
    }
  }, [mounted, mergedFontSize.totalNumber]);

  // Get theme colors for the chart
  const [themeColors, setThemeColors] = useState({
    textColor: getTextColor(),
    backgroundColor: getContentColor(2),
  });

  // Update colors when component mounts and when theme changes
  useEffect(() => {
    const updateThemeColors = () => {
      setThemeColors({
        textColor: getTextColor(),
        backgroundColor: getContentColor(2),
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

  // Calculate the total value of all series
  const total = series.reduce((acc, val) => acc + val, 0);

  // Generate random colors if not provided
  const generateRandomColors = (count: number): string[] => {
    const colors: string[] = [];

    for (let i = 0; i < count; i++) {
      const hue = (i * 137) % 360; // Golden angle approximation for good distribution

      // Use vibrant colors with good distribution
      // For now, using solid colors as gradients are causing runtime errors
      colors.push(`hsl(${hue}, 80%, 60%)`);
    }

    return colors;
  };

  // Use provided colors or generate random ones
  const chartColors = colors || generateRandomColors(series.length);

  // Determine final text color
  const finalTextColor = textColor || themeColors.textColor;

  // Create chart options
  const safeOptions: ApexOptions = {
    chart: {
      type: "donut",
      toolbar: { show: showToolbar },
      background: "transparent",
      animations: {
        enabled: true,
        speed: 300,
        animateGradually: {
          enabled: true,
          delay: 150,
        },
        dynamicAnimation: {
          enabled: true,
          speed: 350,
        },
      },
    },
    colors: chartColors,
    labels: labels,
    legend: {
      position: legendPosition,
      fontSize: mergedFontSize.legend,
      labels: {
        colors: finalTextColor,
      },
      markers: {
        strokeWidth: 2,
      },
      itemMargin: {
        horizontal: 8,
        vertical: 8,
      },
    },
    plotOptions: {
      pie: {
        expandOnClick: true,
        donut: {
          size: donutSize,
          labels: {
            show: showTotal,
            name: {
              show: true,
              fontSize: fontSize.labels,
              color: finalTextColor,
            },
            value: {
              show: true,
              fontSize: mergedFontSize.totalNumber,
              color: finalTextColor,
              fontWeight: "bold",
              formatter: (val) => val.toString(),
            },
            total: {
              show: showTotal,
              label: "Total",
              fontSize: mergedFontSize.total,
              color: finalTextColor,
              formatter:
                totalFormatter ||
                ((_w) => {
                  return total.toString();
                }),
            },
          },
        },
        offsetX: 0,
        offsetY: 0,
      },
    },
    stroke: {
      width: 0, // Remove borders
      colors: ["transparent"],
    },
    dataLabels: {
      enabled: false,
    },
    responsive: [
      {
        breakpoint: 480,
        options: {
          chart: {
            width: "100%",
            margin: "auto",
          },
          legend: {
            position: "bottom",
          },
        },
      },
    ],
    tooltip: {
      enabled: true,
      theme:
        typeof document !== "undefined" &&
        document.documentElement.classList.contains("dark")
          ? "dark"
          : "light",
      style: {
        fontSize: fontSize.labels,
      },
      y: {
        formatter: (val) => val.toString(),
      },
      custom: function (opts: any) {
        // Custom tooltip to handle hover scaling effect
        const seriesIndex = opts.seriesIndex;
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const dataPointIndex = opts.dataPointIndex;
        const value = opts.series[seriesIndex];
        const label = opts.w.globals.labels[seriesIndex];

        // Trigger the hover effect by adding a class to the specific slice
        if (typeof document !== "undefined") {
          setTimeout(() => {
            const allSlices = document.querySelectorAll(
              ".apexcharts-pie-slice",
            );

            allSlices.forEach((slice, i) => {
              if (i === seriesIndex) {
                // Apply a more pronounced scale effect (1.15 = 15% larger)
                slice.setAttribute("transform", "scale(1.15)");
                // Add drop shadow for depth and emphasis
                slice.setAttribute(
                  "style",
                  "filter: drop-shadow(0px 4px 10px rgba(0,0,0,0.5)); z-index: 10;",
                );
                // Also bring the slice forward in the visual stack
                const parent = slice.parentElement;

                if (parent) {
                  parent.appendChild(slice); // Move to end (top of visual stack)
                }
              } else {
                // Reset other slices
                slice.setAttribute("transform", "scale(1)");
                slice.setAttribute("style", "filter: none; opacity: 0.85;");
              }
            });
          }, 0);
        }

        return `<div style="padding: 8px 12px; background: #333; color: #fff; border-radius: 4px;">
          <div>${label}: ${value}</div>
        </div>`;
      },
    },
  };

  // Decide what to render
  const placeholder = (
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
        animationData={pdfLoadingAnim}
        style={{ width: "40%", height: "40%", maxWidth: 180, maxHeight: 180 }}
      />
    </div>
  );

  const chartContent = (
    <div
      ref={chartRef}
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
          type="donut"
          width={typeof width === "string" ? undefined : width}
        />
      </ErrorBoundary>
    </div>
  );

  return isLoading || !mounted ? placeholder : chartContent;
};

export default DonutChart;
