/**
 * Admin_login Store
 * Simplified store with only used exports
 */
"use client";

import { z } from "zod";
import { createCompleteStore } from "@/core/utility";
import { 
  adminLoginDataSchema,
  adminLoginPersistenceConfig,
} from "../model/admin_login_input_model";

// Create complete store with data schema and persistence configuration
export const adminLoginStore = createCompleteStore(adminLoginDataSchema, {
  name: "admin_login_storage",
  dataPath: "adminLoginData",
  persistenceConfig: adminLoginPersistenceConfig, // Use new boolean persistence mechanism
});

// Extract only the used exports from the store object:
export const {
  model: adminLoginInputModel,
  formSchema: adminLoginFormSchema,
} = adminLoginStore;

// Export only the used type definitions
export type adminLoginFormData = z.infer<typeof adminLoginFormSchema>;
