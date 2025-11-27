# DropdownAppi Component

A flexible dropdown component built on top of HeroUI Select with support for both display labels and API codes.

## Features

- **Dual Value Support**: Supports both display labels and optional API codes
- **Flexible Data**: Works with simple string arrays or arrays with corresponding codes
- **Active/Inactive State**: Can be controlled via `isActive` prop
- **HeroUI Integration**: Extends HeroUI Select with custom variants
- **TypeScript Support**: Full TypeScript support with proper interfaces

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `defaultValue` | `string \| null` | No | Default selected value (can be label or code) |
| `onChange` | `(label: string \| null, code?: string \| null) => void` | Yes | Callback when selection changes |
| `list` | `string[]` | Yes | Array of display labels |
| `listOfCode` | `string[]` | No | Optional array of codes corresponding to labels |
| `isActive` | `string \| boolean \| number \| null` | No | Controls if dropdown is active |
| `...props` | `any` | No | All other HeroUI Select props |

## Usage Examples

### Basic Usage (Labels Only)
```tsx
import { DropdownAppi } from "@/components/appikorn-components/dropdown_appi";

const BasicExample = () => {
  const fruits = ["Apple", "Banana", "Orange", "Mango"];

  const handleChange = (selectedLabel: string | null, selectedCode?: string | null) => {
    console.log("Selected:", selectedLabel);
    // selectedCode will be the same as selectedLabel when no codes provided
  };

  return (
    <DropdownAppi
      label="Select Fruit"
      placeholder="Choose a fruit"
      list={fruits}
      onChange={handleChange}
      variant="bordered"
      isRequired
    />
  );
};
```

### Advanced Usage (Labels + Codes)
```tsx
import { DropdownAppi } from "@/components/appikorn-components/dropdown_appi";

const AdvancedExample = () => {
  const countryLabels = ["United States", "United Kingdom", "Canada", "Australia"];
  const countryCodes = ["US", "GB", "CA", "AU"];

  const handleChange = (selectedLabel: string | null, selectedCode?: string | null) => {
    console.log("Selected Country:", selectedLabel);
    console.log("Country Code:", selectedCode); // Will be the corresponding code
    // Save selectedCode to API, show selectedLabel to user
  };

  return (
    <DropdownAppi
      label="Country"
      placeholder="Select Country"
      defaultValue="US" // Can match by code or label
      list={countryLabels}
      listOfCode={countryCodes}
      onChange={handleChange}
      variant="bordered"
      color="secondary"
      size="lg"
      isRequired
    />
  );
};
```

### With Active/Inactive State
```tsx
const ConditionalExample = () => {
  const [isEnabled, setIsEnabled] = useState(true);

  return (
    <DropdownAppi
      label="Conditional Dropdown"
      list={["Option 1", "Option 2", "Option 3"]}
      onChange={handleChange}
      isActive={isEnabled} // Dropdown will be disabled when false
      variant="bordered"
    />
  );
};
```

## How It Works

1. **Display**: Shows the labels from the `list` array to users
2. **Selection**: When user selects an item, `onChange` receives both the label and corresponding code
3. **Default Value**: Can match `defaultValue` against either labels or codes
4. **Fallback**: If no `listOfCode` is provided, codes default to the same values as labels

## Integration with Forms

The component is designed to work seamlessly with form state management:

```tsx
const FormExample = () => {
  const [formData, setFormData] = useState({ nationality: "" });

  const handleNationalityChange = (label: string | null, code?: string | null) => {
    setFormData(prev => ({
      ...prev,
      nationality: code || label || "" // Store code for API, fallback to label
    }));
  };

  return (
    <DropdownAppi
      label="Nationality"
      defaultValue={formData.nationality}
      list={nationalityLabels}
      listOfCode={nationalityCodes}
      onChange={handleNationalityChange}
      variant="bordered"
      isRequired
    />
  );
};
```

This component provides a clean separation between what users see (labels) and what gets sent to APIs (codes), while maintaining flexibility for simple use cases where codes aren't needed.
