# DonutChart Component Usage Guide

The DonutChart component is a customizable donut chart built on top of ApexCharts for Next.js applications. It supports both light and dark themes, responsive design, and various customization options.

## Basic Usage

```tsx
import DonutChart from "path/to/components/ui/charts/donut_chart";

// Inside your component
const data = [100, 45, 30, 22, 21, 20];
const labels = ["Espresso", "Latte machitano", "Cappucino", "Americano", "Product 5", "Product 6"];

return (
  <DonutChart
    series={data}
    labels={labels}
    showTotal={true}
    legendPosition="bottom"
  />
);
```

## Props Reference

### Required Props

| Prop | Type | Description |
|------|------|-------------|
| `series` | `number[]` | Data series for the chart. Each number represents a value for the corresponding label. |
| `labels` | `string[]` | Labels for each series that correspond to each data point. |

### Optional Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `colors` | `string[]` | Auto-generated | Custom colors for each segment of the donut. If not provided, visually distinct colors will be auto-generated. |
| `fontSize` | `{labels?: string, total?: string, totalNumber?: string, legend?: string}` | `{labels: "14px", total: "24px", totalNumber: "32px", legend: "13px"}` | Font size settings for chart elements. The `totalNumber` property controls the size of the number in the center. |
| `height` | `number \| string` | `350` | Height of the chart in pixels or as a string (e.g., "100%"). |
| `width` | `number \| string` | `"100%"` | Width of the chart in pixels or as a string (e.g., "100%"). |
| `title` | `string` | `""` | Chart title. |
| `showToolbar` | `boolean` | `false` | Whether to show the ApexCharts toolbar. |
| `showTotal` | `boolean` | `true` | Whether to show the total value in the center of the donut. |
| `totalFormatter` | `(total: number) => string` | `undefined` | Custom formatter function for the total value. |
| `containerStyle` | `React.CSSProperties` | `{}` | Additional styles for the chart container. |
| `legendPosition` | `"top" \| "right" \| "bottom" \| "left"` | `"bottom"` | Position of the legend. |
| `donutSize` | `string` | `"65%"` | Size of the donut hole as a percentage of the chart size. |

## Examples

### Custom Colors

```tsx
<DonutChart
  series={[100, 45, 30, 22, 21, 20]}
  labels={["Espresso", "Latte machitano", "Cappucino", "Americano", "Product 5", "Product 6"]}
  colors={["#2563eb", "#22d3ee", "#7c3aed", "#a855f7", "#ec4899", "#bae6fd"]}
/>
```

### Custom Total Formatter and Font Size

```tsx
<DonutChart
  series={[100, 45, 30, 22, 21, 20]}
  labels={["Espresso", "Latte machitano", "Cappucino", "Americano", "Product 5", "Product 6"]}
  totalFormatter={(total) => `$${total}`}
  fontSize={{
    labels: "14px",
    total: "24px",
    totalNumber: "36px", // Larger font size for the total number
    legend: "13px"
  }}
  donutSize="55%" // Smaller donut hole for better visibility
/>
```

### Custom Legend Position

```tsx
<DonutChart
  series={[100, 45, 30, 22, 21, 20]}
  labels={["Espresso", "Latte machitano", "Cappucino", "Americano", "Product 5", "Product 6"]}
  legendPosition="right"
/>
```

## Theme Support

The DonutChart component automatically adapts to light and dark themes by observing changes to the document's class list. It uses utility functions from `theme-utils.ts` to get appropriate colors based on the current theme.

## Error Handling

The component includes an ErrorBoundary to gracefully handle any rendering errors that might occur with the chart.

## Features

### Interactive Hover Effects

The DonutChart includes interactive hover effects that enhance user experience:

- When hovering over a segment, it scales up by 15% for emphasis
- The hovered segment gets a drop shadow for depth
- The hovered segment moves to the front of the visual stack
- Non-hovered segments become slightly transparent

### Auto-Generated Colors

If no colors are provided, the chart will automatically generate visually distinct colors using a golden angle approximation (137.5°) in HSL color space. This ensures good color distribution and contrast between segments.

### Customizable Total Number

The total number displayed in the center of the donut can be customized with:
- Separate font size control via `fontSize.totalNumber`
- Custom formatter function via `totalFormatter`
- Vertical positioning adjustment based on font size

### Legend Customization

The legend has been enhanced with:
- Optimized marker size and spacing
- Better alignment between markers and labels
- Customizable position (top, right, bottom, left)

## Changelog

### 2025-07-03
- Added segment-specific scaling effect on hover (15% larger)
- Added drop shadow and z-index for hovered segments
- Improved visual hierarchy with transparency for non-hovered segments
- Added separate font size control for the total number
- Enhanced legend marker spacing and sizing
- Fixed TypeScript errors and improved type safety
- Added auto-generated colors with golden angle distribution

### Initial Release
- Initial implementation of DonutChart component
- Added support for customizing colors, font sizes, and legend position
- Added option to show/hide total in the center
- Added custom formatter for total value
- Added responsive design for mobile devices
