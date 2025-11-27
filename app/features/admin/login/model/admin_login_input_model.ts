/**
 * Admin_login Input Model
 * Defines data schema and security rules for admin_login feature
 */
"use client";

import { z } from "zod";
import { createSchemaBundle } from "@/core/utility";


// Define nested schemas for complex objects (internal use only)



// Define the main admin_login data schema with persistence flags
export const adminLoginDataSchema = z.object({
  loading: z.boolean().optional(),
  userName: z.string(),
  password: z.string(),
});


// Define persistence configuration for each field
export const adminLoginPersistenceConfig = {
  loading: false,
  userName: true,
  password: true,
};


// Create complete schema bundle with auto-generated persistence, meta, and model schemas
export const adminLoginSchemas = createSchemaBundle(adminLoginDataSchema, {
  dataPath: "adminLoginData",
  persistenceConfig: adminLoginPersistenceConfig,
});


// Export types for TypeScript usage (only used types)
export type adminLoginData = z.infer<typeof adminLoginDataSchema>;
