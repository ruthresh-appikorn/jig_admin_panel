/**
 * MADX Navigation System
 *
 * Exports all navigation utilities from the simplified router for easy import
 */

// Export all from the simplified router
export * from "./simplified_router";

// Export navigation utilities
export * from "./navigation_utils";
export { NavigationProvider } from "./navigation_provider";

// Export the simple navigate function for easy access
export { navigate } from "./navigation_utils";

// Default export for convenience
import * as router from "./simplified_router";
export default router;
