/**
 * GetAllTests Store
 * Simplified store with only used exports
 */
"use client";

import { z } from "zod";
import { createCompleteStore } from "@/core/utility";
import {
  getAllTestsOutputDataSchema,
  getAllTestsOutputPersistenceConfig,
} from "./get_all_tests_output_model";

// Create complete store with data schema and persistence configuration
export const getAllTestsStore = createCompleteStore(getAllTestsOutputDataSchema, {
  name: "get_all_tests_storage",
  dataPath: "getAllTestsData",
  persistenceConfig: getAllTestsOutputPersistenceConfig, // Use new boolean persistence mechanism
});

// Extract only the used exports from the store object:
export const {
  model: getAllTestsOutputModel,
  formSchema: getAllTestsFormSchema,
} = getAllTestsStore;

// Export only the used type definitions
export type getAllTestsFormData = z.infer<typeof getAllTestsFormSchema>;
