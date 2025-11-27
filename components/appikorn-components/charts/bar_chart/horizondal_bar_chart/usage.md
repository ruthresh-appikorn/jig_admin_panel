# HorizontalBarChart Component Usage Guide

The `HorizontalBarChart` component provides a responsive and customizable horizontal bar chart. It can be used to display simple data series or to visualize progress towards a maximum value using a "tracked" bar style. It's built with ApexCharts and integrates with your project's Tailwind CSS theme for default styling.

## Basic Usage

This example shows a simple horizontal bar chart with default styling.

```tsx
import HorizontalBarChart from "path/to/components/ui/charts/bar_chart/horizondal_bar_chart/horizontal_bar_chart";

// Inside your component
const series = [{
  data: [400, 430, 448, 470, 540, 580, 690, 720, 780]
}];
const categories = ["USA", "Canada", "Mexico", "Brazil", "UK", "Germany", "France", "India", "China"];

return (
  <HorizontalBarChart
    series={series}
    categories={categories}
    height={400}
  />
);
```

## Tracked Bar Chart

By providing a `maxValue` prop, the chart enters a "tracked" mode. This displays the bar's value against a gray background representing the maximum value. This is useful for visualizing progress, quotas, or limits.

```tsx
import HorizontalBarChart from "path/to/components/ui/charts/bar_chart/horizondal_bar_chart/horizontal_bar_chart";

const series = [{
  data: [750]
}];
const categories = ["Project Alpha Revenue"];

return (
  <HorizontalBarChart
    series={series}
    categories={categories}
    maxValue={1000} // Set a max value to enable tracked mode
    height={150}
  />
);
```

## Customization (Dark Theme)

The component's appearance can be fully customized using the `colors` prop. This example demonstrates how to create a dark-themed chart.

```tsx
import HorizontalBarChart from "path/to/components/ui/charts/bar_chart/horizondal_bar_chart/horizontal_bar_chart";

const series = [{
  data: [400, 430, 448, 470, 540]
}];
const categories = ["Q1", "Q2", "Q3", "Q4", "Q5"];

return (
  <div style={{ backgroundColor: '#111827', padding: '20px' }}>
    <HorizontalBarChart
      series={series}
      categories={categories}
      maxValue={1000}
      colors={{
        bar: "#3b82f6",
        background: "#374151",
        grid: "#4b5563",
        text: "#d1d5db",
        dataLabel: "#ffffff",
        tooltip: {
          background: "#1f2937",
          text: "#f9fafb",
        },
      }}
    />
  </div>
);
```

## Props Reference

### Required Props

| Prop         | Type                     | Description                                                              |
|--------------|--------------------------|--------------------------------------------------------------------------|
| `series`     | `{ data: number[] }[]`   | Data series for the chart. Expects an array containing a single object with a `data` array. |
| `categories` | `string[]`               | Categories/labels for the y-axis that correspond to each data point.     |

### Optional Props

| Prop       | Type               | Default                                  | Description                                                                                                                                                             |
|------------|--------------------|------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `height`   | `number \| string` | `350`                                    | Height of the chart in pixels or as a string (e.g., `"100%"`).                                                                                                          |
| `width`    | `number \| string` | `"100%"`                                 | Width of the chart in pixels or as a string (e.g., `"100%"`).                                                                                                           |
| `maxValue` | `number`           | `undefined`                              | If provided, enables "tracked" mode, showing a background bar up to this value. Also enables data labels on the bar.                                                    |
| `colors`   | `object`           | See `tailwind.config.js` theme defaults. | An object to customize the chart's colors. See the **Color Options** section below for details. If a color is not provided, it falls back to a default value from the theme. |

## Color Options

The `colors` prop accepts an object with the following optional properties:

| Property           | Type     | Default (`tailwind.config.js`) | Description                                         |
|--------------------|----------|--------------------------------|-----------------------------------------------------|
| `bar`              | `string` | `#016fee` (primary)             | The color of the main data bar.                     |
| `background`       | `string` | `#ebebec` (default-200)          | The color of the background bar in "tracked" mode.  |
| `grid`             | `string` | `#e3e3e6` (default-300)          | The color of the vertical grid lines.               |
| `text`             | `string` | `#8a8a8c` (default-700)          | The color of the x-axis and y-axis labels.          |
| `dataLabel`        | `string` | `#ffffff`                        | The color of the data label text shown on the bar in "tracked" mode. |
| `tooltip.background` | `string` | `#404041` (default-900)          | The background color of the custom tooltip.         |
| `tooltip.text`     | `string` | `#fafafa` (default-50)           | The text color of the custom tooltip.               |
<HorizontalBarChart
  series={[
    {
      name: "Q1",
      data: [44, 55, 41]
    },
    {
      name: "Q2",
      data: [53, 32, 33]
    },
    {
      name: "Q3",
      data: [12, 17, 11]
    },
    {
      name: "Q4",
      data: [9, 7, 5]
    }
  ]}
  categories={["2022", "2023", "2024"]}
  stacked={true}
  showDataLabels={true}
/>
```

### 100% Stacked Horizontal Bar Chart

```tsx
<HorizontalBarChart
  series={[
    {
      name: "Product A",
      data: [44, 55, 41]
    },
    {
      name: "Product B",
      data: [53, 32, 33]
    },
    {
      name: "Product C",
      data: [12, 17, 11]
    }
  ]}
  categories={["2022", "2023", "2024"]}
  stacked100={true}
  showDataLabels={true}
  dataLabelsFormatter={(val) => `${val.toFixed(0)}%`}
/>
```

### With Target Markers

```tsx
<HorizontalBarChart
  series={[
    {
      name: "Actual",
      data: [44, 55, 41, 64, 22, 43]
    }
  ]}
  categories={["Product A", "Product B", "Product C", "Product D", "Product E", "Product F"]}
  markers={[
    { seriesIndex: 0, categoryIndex: 0, value: 50, label: "Target", color: "#FF4560" },
    { seriesIndex: 0, categoryIndex: 2, value: 45, label: "Target", color: "#FF4560" },
    { seriesIndex: 0, categoryIndex: 5, value: 50, label: "Target", color: "#FF4560" }
  ]}
/>
```

## Features

### Auto-Generated Colors

If no colors are provided, the chart will automatically generate visually distinct colors using a golden angle approximation (137.5°) in HSL color space. This ensures good color distribution and contrast between series.

### Responsive Design

The chart is fully responsive and will adapt to different screen sizes. On smaller screens, the legend will automatically move to the bottom for better readability.

### Theme Support

The HorizontalBarChart component automatically adapts to light and dark themes by observing changes to the document's class list. It uses utility functions from `theme-utils.ts` to get appropriate colors based on the current theme.

### Marker Support

You can add target markers to your chart to indicate goals or targets. Each marker can have its own color and label.

### Error Handling

The component includes an ErrorBoundary to gracefully handle any rendering errors that might occur with the chart.

## Changelog

### 2025-07-03
- Initial implementation of HorizontalBarChart component
- Added support for stacked and 100% stacked bar charts
- Added marker support for target indicators
- Added auto-generated colors with golden angle distribution
- Added customizable bar styling (padding, border radius)
- Added responsive design for mobile devices
- Added theme support for light and dark modes
