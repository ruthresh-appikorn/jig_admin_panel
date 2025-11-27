/**
 * Admin_dashboard Store
 * Simplified store with only used exports
 */
"use client";

import { z } from "zod";
import { createCompleteStore } from "@/core/utility";
import { 
  adminDashboardDataSchema,
  adminDashboardPersistenceConfig,
} from "../model/admin_dashboard_input_model";

// Create complete store with data schema and persistence configuration
export const adminDashboardStore = createCompleteStore(adminDashboardDataSchema, {
  name: "admin_dashboard_storage",
  dataPath: "adminDashboardData",
  persistenceConfig: adminDashboardPersistenceConfig, // Use new boolean persistence mechanism
});

// Extract only the used exports from the store object:
export const {
  model: adminDashboardInputModel,
  formSchema: adminDashboardFormSchema,
} = adminDashboardStore;

// Export only the used type definitions
export type adminDashboardFormData = z.infer<typeof adminDashboardFormSchema>;
