# ToastAppi Component

A beautiful, modern toast notification component for the HR System built with HeroUI and React.

## Features

- 🎨 **Beautiful Design**: Modern gradient backgrounds with level-specific colors
- 🚀 **Smooth Animations**: Slide-in/slide-out animations with scale effects
- 🎯 **Multiple Levels**: Success, Error, Warning, and Info variants
- ⏰ **Auto-dismiss**: Configurable auto-dismiss duration
- 🎛️ **Customizable**: Multiple sizes, custom styling, and flexible options
- 📱 **Responsive**: Works perfectly on all screen sizes
- 🔧 **Easy Integration**: Simple hook-based API
- 🎪 **Multiple Toasts**: Stack multiple toasts with smart positioning

## Installation

The component is already integrated into your Appikorn components. Import it like this:

```tsx
import { ToastAppi, useToast, ToastProvider } from "@/components/appikorn-components/toast_appi";
```

## Setup

1. **Wrap your app with ToastProvider** (in your main layout or app component):

```tsx
import { ToastProvider } from "@/components/appikorn-components/toast_appi";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <ToastProvider maxToasts={3}>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
```

## Usage

### Basic Usage with Hook

```tsx
import { useToast } from "@/components/appikorn-components/toast_appi";

function MyComponent() {
  const toast = useToast();

  const handleSuccess = () => {
    toast.success("Data saved successfully!");
  };

  const handleError = () => {
    toast.error("Failed to save data. Please try again.");
  };

  const handleWarning = () => {
    toast.warning("Please check your input before proceeding.");
  };

  const handleInfo = () => {
    toast.info("Here's some helpful information.");
  };

  return (
    <div>
      <button onClick={handleSuccess}>Success</button>
      <button onClick={handleError}>Error</button>
      <button onClick={handleWarning}>Warning</button>
      <button onClick={handleInfo}>Info</button>
    </div>
  );
}
```

### Advanced Usage

```tsx
// Custom toast with specific options
toast.custom({
  message: "Custom message with no auto-dismiss",
  level: "success",
  duration: 0, // Won't auto-dismiss
  size: "lg",
  showCloseButton: true
});

// Error toast with longer duration
toast.error("Critical error occurred!", {
  duration: 10000, // 10 seconds
  size: "xl"
});

// Clear all toasts
toast.clearAllToasts();
```

### Direct Component Usage

```tsx
import { ToastAppi } from "@/components/appikorn-components/toast_appi";

function MyComponent() {
  const [showToast, setShowToast] = useState(true);

  return (
    <ToastAppi
      message="Direct toast usage"
      level="success"
      isVisible={showToast}
      onClose={() => setShowToast(false)}
      duration={5000}
      size="md"
    />
  );
}
```

## Props

### ToastAppi Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `message` | `string` | - | **Required.** The toast message to display |
| `level` | `"success" \| "error" \| "warning" \| "info"` | `"info"` | Toast level determining color and icon |
| `size` | `"sm" \| "md" \| "lg" \| "xl"` | `"md"` | Toast size |
| `duration` | `number` | `5000` | Auto-dismiss duration in ms (0 = no auto-dismiss) |
| `onClose` | `() => void` | - | Callback when toast is closed |
| `showCloseButton` | `boolean` | `true` | Whether to show the close button |
| `className` | `string` | `""` | Additional CSS classes |
| `isVisible` | `boolean` | `true` | Controls toast visibility |

### ToastProvider Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | - | **Required.** Child components |
| `maxToasts` | `number` | `3` | Maximum number of toasts to show simultaneously |

## Hook Methods

The `useToast` hook provides these methods:

### Convenience Methods
- `toast.success(message, options?)` - Show success toast
- `toast.error(message, options?)` - Show error toast (7s duration)
- `toast.warning(message, options?)` - Show warning toast (6s duration)
- `toast.info(message, options?)` - Show info toast (5s duration)

### Advanced Methods
- `toast.custom(toastConfig)` - Show custom toast with full configuration
- `toast.clearAllToasts()` - Clear all visible toasts
- `toast.hideToast(id)` - Hide specific toast by ID

## Styling

The component uses these color schemes:

- **Success**: Green gradient with green border and icon
- **Error**: Red gradient with red border and icon
- **Warning**: Yellow gradient with yellow border and icon
- **Info**: Blue gradient with blue border and icon

Each toast has:
- Left border accent (4px)
- Gradient background
- Backdrop blur effect
- Smooth animations
- Responsive design

## Examples

### Form Validation
```tsx
const handleSubmit = async (data) => {
  try {
    await saveData(data);
    toast.success("Form submitted successfully!");
  } catch (error) {
    toast.error("Failed to submit form. Please check your data.");
  }
};
```

### API Calls
```tsx
const handleApiCall = async () => {
  toast.info("Processing your request...");
  
  try {
    const result = await api.call();
    toast.success("Request completed successfully!");
  } catch (error) {
    toast.error("Request failed. Please try again later.");
  }
};
```

### Validation Warnings
```tsx
const validateInput = (value) => {
  if (!value) {
    toast.warning("This field is required.");
    return false;
  }
  return true;
};
```

## Best Practices

1. **Use appropriate levels**: Match the toast level to the message importance
2. **Keep messages concise**: Short, clear messages work best
3. **Don't overuse**: Avoid showing too many toasts simultaneously
4. **Consider duration**: Error messages should stay longer than success messages
5. **Provide context**: Include actionable information when possible

## Accessibility

- Toasts are announced by screen readers
- Keyboard accessible close buttons
- High contrast colors for readability
- Proper ARIA attributes
- Focus management

The ToastAppi component is now ready to use throughout your HR system! 🎉
