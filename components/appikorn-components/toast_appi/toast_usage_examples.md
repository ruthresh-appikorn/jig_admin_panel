# Global Toast Usage Examples

Now you can use toast from anywhere in your app without React hooks!

## 🚀 **Usage in API Functions:**

```tsx
import { toast } from "@/components/appikorn-components/toast_appi";

export async function someApiFunction() {
  try {
    const result = await fetch('/api/data');
    
    if (result.ok) {
      toast.success("Data loaded successfully!");
    } else {
      toast.error("Failed to load data");
    }
  } catch (error) {
    toast.error("Network error occurred");
  }
}
```

## 🎯 **Usage in Controllers:**

```tsx
import { toast } from "@/components/appikorn-components/toast_appi";

export const handleFormSubmit = async (data: any) => {
  try {
    await saveData(data);
    toast.success("Form submitted successfully!");
  } catch (error) {
    toast.error("Failed to submit form");
  }
};
```

## 📝 **All Available Methods:**

```tsx
import { toast } from "@/components/appikorn-components/toast_appi";

// Simple success toast
toast.success("Operation completed!");

// Error toast (stays longer by default)
toast.error("Something went wrong!");

// Warning toast
toast.warning("Please check your input");

// Info toast
toast.info("Here's some information");

// Custom toast with options
toast.custom({
  message: "Custom message",
  level: "success",
  duration: 10000,
  size: "lg"
});

// Clear all toasts
toast.clearAll();
```

## 🔧 **Usage in Utility Functions:**

```tsx
import { toast } from "@/components/appikorn-components/toast_appi";

export const validateAndSave = (data: any) => {
  if (!data.name) {
    toast.warning("Name is required");
    return false;
  }
  
  if (!data.email) {
    toast.warning("Email is required");
    return false;
  }
  
  // Save data
  toast.success("Data saved successfully!");
  return true;
};
```

## ✅ **No More Hook Restrictions!**

You can now call toast from:
- ✅ API functions
- ✅ Controllers
- ✅ Utility functions
- ✅ Event handlers
- ✅ Async functions
- ✅ Anywhere in your codebase!

The toast system is automatically initialized when your app starts with the ToastProvider.
