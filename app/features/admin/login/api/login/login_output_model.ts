/**
 * Login API Output Model
 * Defines data schema and security rules for login_api_output API
 */
"use client";

import { z } from "zod";
import { createSchemaBundle } from "@/core/utility";


// Define nested schemas for complex objects (internal use only)



// Define the main login_api_output data schema with persistence flags
export const loginOutputDataSchema = z.object({
  loading: z.boolean().default(false),
  data: z.object({
    login: z.object({
      token: z.string().optional(),
      user: z.object({
        updatedAt: z.string().optional(),
        id: z.string().optional(),
        createdAt: z.string().optional(),
        USER_ID: z.string().optional(),
        USERNAME: z.string().optional(),
        TIME: z.string().optional()
      })
    })
  })
});


// Define persistence configuration for each field (loading is not hydrated)
export const loginOutputPersistenceConfig = {
  loading: false,
  data: true
};


// Create complete schema bundle with auto-generated persistence, meta, and model schemas
export const loginOutputSchemas = createSchemaBundle(loginOutputDataSchema, {
  dataPath: "loginOutputData",
  persistenceConfig: loginOutputPersistenceConfig,
});


// Export types for TypeScript usage (only used types)
export type loginOutputData = z.infer<typeof loginOutputDataSchema>;
