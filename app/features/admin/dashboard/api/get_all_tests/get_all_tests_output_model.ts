/**
 * GetAllTests API Output Model
 * Defines data schema and security rules for get_all_tests_api_output API
 */
"use client";

import { z } from "zod";
import { createSchemaBundle } from "@/core/utility";


// Define nested schemas for complex objects (internal use only)



// Define the main get_all_tests_api_output data schema with persistence flags
export const getAllTestsOutputDataSchema = z.object({
  loading: z.boolean().default(false),
  data: z.object({
    getTests: z.array(z.object({
  COMPONENT: z.object({
    COMPONENT_ID: z.string().optional(),
    NAME: z.string().optional(),
    PART_NUMBER: z.string().optional(),
    STATUS: z.string().optional(),
    TIME: z.string().optional(),
    TYPE: z.string().optional(),
    _id: z.string().optional(),
    NOTES: z.string().optional()
  }).optional(),
  TESTING_ID: z.string().optional(),
  TESTER_NAME: z.string().optional(),
  DETAILS: z.array(z.object({
    TEST_NAME: z.string().optional(),
    REMARKS: z.string().optional(),
    DATAS: z.array(z.object({
      SUB_COMPONENT_SERIAL_NO: z.string().optional(),
      REASON: z.string().optional(),
      QC_STATUS: z.string().optional(),
      INSPECTION: z.string().optional(),
      CRITERIA: z.array(z.object({
        VALUE: z.string().optional(),
        DESC: z.string().optional()
      })).optional()
    })).optional()
  })).optional(),
  TIME: z.string().optional(),
  COMPONENT_SERIAL_NO: z.string().optional(),
  COMPONENT_ID: z.string().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  id: z.string().optional()
})).optional()
  })
});


// Define persistence configuration for each field (loading is not hydrated)
export const getAllTestsOutputPersistenceConfig = {
  loading: false,
  data: true
};


// Create complete schema bundle with auto-generated persistence, meta, and model schemas
export const getAllTestsOutputSchemas = createSchemaBundle(getAllTestsOutputDataSchema, {
  dataPath: "getAllTestsOutputData",
  persistenceConfig: getAllTestsOutputPersistenceConfig,
});


// Export types for TypeScript usage (only used types)
export type getAllTestsOutputData = z.infer<typeof getAllTestsOutputDataSchema>;
