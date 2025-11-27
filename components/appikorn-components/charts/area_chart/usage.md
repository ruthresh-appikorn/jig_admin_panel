# AreaChart Component Usage Guide

The AreaChart component is a customizable area chart built on top of ApexCharts for Next.js applications. It supports both light and dark themes, responsive design, and various customization options.

## Basic Usage

```tsx
import AreaChart from "path/to/components/ui/charts/area_chart/area_chart";

// Inside your component
const data = [
  {
    name: "Sales",
    data: [24, 41, 16, 30, 25, 47, 33],
  },
];

const categories = ["Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// Calculate appropriate y-axis range based on data
const maxValue = Math.max(...data[0].data);
const yaxisConfig = {
  min: 0,
  max: Math.ceil(maxValue / 10) * 10, // Round up to nearest 10
  tickAmount: 5,
};

return (
  <AreaChart
    series={data}
    categories={categories}
    yaxis={yaxisConfig}
    colors={{
      line: "#2563eb",
      tooltipBg: "#333333",
      tooltipText: "#ffffff",
      gridDivider: "#333333",
    }}
  />
);
```

## Props Reference

### Required Props

| Prop | Type | Description |
|------|------|-------------|
| `series` | `Array<{name: string, data: number[]}>` | Data series for the chart. Each object should have a name (for the legend) and a data array of numeric values. |
| `categories` | `string[]` | X-axis categories/labels that correspond to each data point. |

### Optional Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `yaxis` | `{min?: number, max?: number, tickAmount?: number}` | `{min: 10, max: 50, tickAmount: 4}` | Y-axis configuration including min/max values and number of tick marks. |
| `colors` | `object` | See below | Color settings for various chart elements. |
| `fontSize` | `{axis?: string}` | `{axis: "13px"}` | Font size settings for chart elements. |
| `height` | `number \| string` | `280` | Height of the chart in pixels or as a string (e.g., "100%"). |
| `width` | `number \| string` | `"100%"` | Width of the chart in pixels or as a string (e.g., "100%"). |
| `title` | `string` | `""` | Chart title. |
| `showToolbar` | `boolean` | `false` | Whether to show the ApexCharts toolbar. |
| `tooltipFormat` | `(value: number, seriesName: string) => string` | `undefined` | Custom tooltip formatter function. |
| `containerStyle` | `React.CSSProperties` | `{}` | Additional styles for the chart container. |

### Color Options

The `colors` prop accepts the following properties:

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `line` | `string` | Theme primary color | Color of the chart line. |
| `gradient.from` | `string` | Same as line color | Start color for the gradient fill. |
| `gradient.to` | `string` | Same as line color | End color for the gradient fill. |
| `gradient.opacityFrom` | `number` | `0.6` | Starting opacity for the gradient fill. |
| `gradient.opacityTo` | `number` | `0.15` | Ending opacity for the gradient fill. |
| `text` | `string` | Theme text color | Color for axis labels. |
| `tooltipText` | `string` | Theme foreground color | Text color for tooltip content. |
| `tooltipBg` | `string` | Theme content color | Background color for tooltip. |
| `gridDivider` | `string` | Theme default color | Color for horizontal grid dividers. |

## Examples

### Custom Styling

```tsx
<AreaChart
  series={data}
  categories={categories}
  colors={{
    line: "#ff5722",
    gradient: {
      opacityFrom: 0.8,
      opacityTo: 0.2,
    },
    text: "#ffffff",
    tooltipText: "#ffffff",
    tooltipBg: "#333333",
    gridDivider: "#444444",
  }}
  fontSize={{
    axis: "14px",
  }}
  height={400}
/>
```

### Custom Y-Axis Range

```tsx
<AreaChart
  series={data}
  categories={categories}
  yaxis={{
    min: 0,
    max: 100,
    tickAmount: 5,
  }}
/>
```

### Custom Tooltip Format

```tsx
<AreaChart
  series={data}
  categories={categories}
  tooltipFormat={(value, seriesName) => {
    return `<div style="padding:10px;">
      <strong>${seriesName}</strong>: $${value.toFixed(2)}
    </div>`;
  }}
/>
```

## Theme Support

The AreaChart component automatically adapts to light and dark themes by observing changes to the document's class list. It uses utility functions from `theme-utils.ts` to get appropriate colors based on the current theme.

## Error Handling

The component includes an ErrorBoundary to gracefully handle any rendering errors that might occur with the chart.

## Changelog

- Added `fontSize` parameter to customize axis label font sizes
- Added `tooltipBg` parameter for tooltip background color customization
- Added `tooltipText` parameter for tooltip text color customization
- Added `gridDivider` parameter for horizontal grid divider color customization
- Made `categories` a required parameter instead of using hardcoded defaults
