"use client";

import React from "react";

import AreaChart from "./area_chart";

export default function AreaChartExample() {
  // Sample data for the chart
  const salesData = [
    {
      name: "Sales",
      data: [24, 41, 16, 30, 25, 47, 100],
    },
  ];

  // Categories for x-axis
  const categories = ["Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  // Calculate appropriate y-axis range based on data
  const maxValue = Math.max(...salesData[0].data);
  const yaxisConfig = {
    min: 0,
    max: Math.ceil(maxValue / 10) * 10, // Round up to nearest 10
    tickAmount: 5,
  };

  return (
    <div className="h-full w-full pt-10 bg-black">
      <AreaChart
        categories={categories}
        colors={{
          tooltipBg: "#333333", // Custom tooltip background
          gridDivider: "#333333",
          tooltipText: "#ffffff", // Controls all text in tooltip

          line: "#2563eb",
          gradient: {
            from: "#2563eb",
            opacityFrom: 0.6,
            opacityTo: 0.1,
            to: "#2563eb",
          },
          text: "#ffffff", // Custom text color for axis labels
        }}
        height={380}
        series={salesData}
        width="1050px"
        yaxis={yaxisConfig}
      />
    </div>
  );
}
