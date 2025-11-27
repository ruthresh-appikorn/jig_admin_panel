/**
 * Admin_dashboard Input Model
 * Defines data schema and security rules for admin_dashboard feature
 */
"use client";

import { z } from "zod";
import { createSchemaBundle } from "@/core/utility";


// Define nested schemas for complex objects (internal use only)



// Define the main admin_dashboard data schema with persistence flags
export const adminDashboardDataSchema = z.object({
  loading: z.boolean().optional(),
  totalLogs: z.string(),
  passedLogs: z.string(),
  failedLogs: z.string(),
  table: z.string(),
});


// Define persistence configuration for each field
export const adminDashboardPersistenceConfig = {
  loading: false,
  totalLogs: true,
  passedLogs: true,
  failedLogs: true,
  table: true,
};


// Create complete schema bundle with auto-generated persistence, meta, and model schemas
export const adminDashboardSchemas = createSchemaBundle(adminDashboardDataSchema, {
  dataPath: "adminDashboardData",
  persistenceConfig: adminDashboardPersistenceConfig,
});


// Export types for TypeScript usage (only used types)
export type adminDashboardData = z.infer<typeof adminDashboardDataSchema>;
