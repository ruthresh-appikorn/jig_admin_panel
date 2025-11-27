/**
 * Utility functions to access theme colors from Tailwind CSS variables
 * This allows the chart to adapt to theme changes dynamically
 */

/**
 * Get a CSS variable value from the document root
 * @param variableName The CSS variable name without the -- prefix
 * @param fallback Fallback value if the variable is not found
 * @returns The value of the CSS variable or the fallback
 */
export const getCssVariable = (
  variableName: string,
  fallback: string = "",
): string => {
  if (typeof window !== "undefined") {
    const value = getComputedStyle(document.documentElement)
      .getPropertyValue(`--${variableName}`)
      .trim();

    return value || fallback;
  }

  return fallback;
};

/**
 * Get a theme color from the Tailwind CSS variables
 * @param colorName The color name (primary, secondary, etc.)
 * @param shade The shade (500, 600, etc.) or 'DEFAULT'
 * @returns The color value or a fallback
 */
export const getThemeColor = (
  colorName: string,
  shade: string | number = "DEFAULT",
): string => {
  return getCssVariable(`colors-${colorName}-${shade}`, "#016fee"); // Default to primary blue
};

/**
 * Get the current theme mode (light or dark)
 * @returns 'light' or 'dark'
 */
export const getThemeMode = (): "light" | "dark" => {
  if (typeof window !== "undefined") {
    return document.documentElement.classList.contains("dark")
      ? "dark"
      : "light";
  }

  return "light";
};

/**
 * Get appropriate text color based on theme mode
 * @returns Text color for the current theme
 */
export const getTextColor = (): string => {
  const mode = getThemeMode();

  return mode === "dark"
    ? getCssVariable("colors-foreground", "#ffffff")
    : getCssVariable("colors-foreground", "#000000");
};

/**
 * Get appropriate background color based on theme mode
 * @returns Background color for the current theme
 */
export const getBackgroundColor = (): string => {
  const mode = getThemeMode();

  return mode === "dark"
    ? getCssVariable("colors-background", "#000000")
    : getCssVariable("colors-background", "#ffffff");
};

/**
 * Get appropriate content color based on theme mode
 * @param level Content level (1-4)
 * @returns Content color for the current theme
 */
export const getContentColor = (level: 1 | 2 | 3 | 4 = 1): string => {
  return getCssVariable(
    `colors-content${level}`,
    level === 1 ? "#ffffff" : "#f4f4f5",
  );
};
