"use client";

import React from "react";
import dynamic from "next/dynamic";
import { ApexOptions } from "apexcharts";
import Lottie from "lottie-react";

import pdfLoadingAnim from "@/public/assets/common/animation/pdf_loading_anim.json";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface HorizontalBarChartProps {
  // Loading state
  isLoading?: boolean;
  series: { data: number[] }[];
  categories: string[];
  height?: number | string;
  width?: number | string;
  maxValue?: number;
  colors?: {
    bar?: string;
    background?: string;
    grid?: string;
    text?: string;
    dataLabel?: string;
    tooltip?: {
      background?: string;
      text?: string;
    };
  };
}

const HorizontalBarChart: React.FC<HorizontalBarChartProps> = ({
  series,
  categories,
  height = 350,
  width = "100%",
  maxValue,
  colors: customColors,
  isLoading = false,
}) => {
  // Show loading placeholder
  if (isLoading) {
    return (
      <div
        className="flex items-center justify-center h-full"
        style={{
          borderRadius: "8px",
          maxWidth: typeof width === "string" ? width : `${width}px`,
        }}
      >
        <Lottie
          loop
          animationData={pdfLoadingAnim}
          style={{ width: "40%", height: "40%", maxWidth: 180, maxHeight: 180 }}
        />
      </div>
    );
  }

  const defaultColors = {
    bar: "#016fee",
    background: "#ebebec",
    grid: "#e3e3e6",
    text: "#8a8a8c",
    dataLabel: "#ffffff",
    tooltip: {
      background: "#404041",
      text: "#fafafa",
    },
  };

  const colors = {
    ...defaultColors,
    ...customColors,
    tooltip: {
      ...defaultColors.tooltip,
      ...customColors?.tooltip,
    },
  };
  const isTracked = maxValue !== undefined;

  const chartSeries = isTracked
    ? [
        { data: series[0].data },
        {
          data: series[0].data.map((value) => Math.max(0, maxValue - value)),
        },
      ]
    : series;

  const options: ApexOptions = {
    chart: {
      type: "bar",
      height,
      width,
      toolbar: { show: false },
      stacked: isTracked,
    },
    plotOptions: {
      bar: {
        horizontal: true,
        borderRadius: 4,
        borderRadiusApplication: "end",
      },
    },
    dataLabels: {
      enabled: isTracked,
      formatter: (val, { seriesIndex }) => {
        if (seriesIndex === 0 && (val as number) > 0) {
          return val.toString();
        }

        return "";
      },
      textAnchor: "end",
      style: {
        colors: [colors.dataLabel],
        fontSize: "12px",
        fontWeight: 600,
      },
      offsetX: -10,
    },

    xaxis: {
      categories,
      axisBorder: { show: false },
      axisTicks: { show: false },
      max: isTracked ? maxValue : undefined,
      labels: {
        style: {
          colors: colors.text,
        },
      },
    },
    yaxis: {
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: {
        style: {
          colors: colors.text,
        },
      },
    },

    grid: {
      show: true,
      borderColor: colors.grid,
      strokeDashArray: 4,
      xaxis: { lines: { show: true } },
      yaxis: { lines: { show: false } },
    },
    colors: isTracked ? [colors.bar, colors.background] : [colors.bar],
    legend: { show: false },
    tooltip: {
      enabled: true,
      custom: function ({ series, seriesIndex, dataPointIndex, w }) {
        if (isTracked && seriesIndex === 1) {
          return ""; // Don't show tooltip for the background bar
        }
        const value = series[seriesIndex][dataPointIndex];
        const category = w.globals.labels[dataPointIndex];

        return `
          <div style="padding: 8px 12px; background-color: ${colors.tooltip.background}; color: ${colors.tooltip.text}; border-radius: 4px; font-family: sans-serif; font-size: 12px;">
            <span>${category}: <b>${value}</b></span>
          </div>
        `;
      },
    },
    stroke: {
      width: 0,
    },
  };

  return (
    <Chart
      height={height}
      options={options}
      series={chartSeries}
      type="bar"
      width={width}
    />
  );
};

export default HorizontalBarChart;
