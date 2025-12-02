/**
 * Login Store
 * Simplified store with only used exports
 */
"use client";

import { z } from "zod";
import { createCompleteStore } from "@/core/utility";
import {
  loginOutputDataSchema,
  loginOutputPersistenceConfig,
} from "./login_output_model";

// Create complete store with data schema and persistence configuration
export const loginStore = createCompleteStore(loginOutputDataSchema, {
  name: "login_storage",
  dataPath: "loginData",
  persistenceConfig: loginOutputPersistenceConfig, // Use new boolean persistence mechanism
});

// Extract only the used exports from the store object:
export const {
  model: loginOutputModel,
  formSchema: loginFormSchema,
} = loginStore;

// Export only the used type definitions
export type loginFormData = z.infer<typeof loginFormSchema>;
