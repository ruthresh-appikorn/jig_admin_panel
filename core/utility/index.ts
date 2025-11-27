/**
 * Core Utility Functions
 * Provides store creation and schema bundling utilities
 */
"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { z } from "zod";

/**
 * Creates a Zustand store with persistence support
 * @param dataSchema - Zod schema for the data
 * @param config - Store configuration including name, dataPath, and persistence config
 */
export function createCompleteStore<T extends z.ZodTypeAny>(
  dataSchema: T,
  config: {
    name: string;
    dataPath: string;
    persistenceConfig: Record<string, boolean>;
  }
) {
  type DataType = z.infer<typeof dataSchema>;

  // Create the form schema that wraps the data
  const formSchema = z.object({
    [config.dataPath]: dataSchema,
  });

  type FormData = z.infer<typeof formSchema>;

  // Get default values from schema
  const getDefaultData = (): DataType => {
    const shape = (dataSchema as any)._def.shape();
    const defaults: any = {};

    for (const key in shape) {
      const field = shape[key];
      if (field._def.typeName === "ZodString") {
        defaults[key] = "";
      } else if (field._def.typeName === "ZodBoolean") {
        defaults[key] = false;
      } else if (field._def.typeName === "ZodNumber") {
        defaults[key] = 0;
      } else if (field._def.typeName === "ZodArray") {
        defaults[key] = [];
      } else if (field._def.typeName === "ZodObject") {
        defaults[key] = {};
      } else if (field._def.typeName === "ZodOptional") {
        defaults[key] = undefined;
      }
    }

    return defaults as DataType;
  };

  const defaultData = getDefaultData();

  // Create the store with persistence
  const useStore = create<
    FormData & {
      reset: () => void;
      updateField: (field: keyof DataType, value: any) => void;
    }
  >()(
    persist(
      (set) => ({
        [config.dataPath]: defaultData,
        reset: () => set({ [config.dataPath]: defaultData } as any),
        updateField: (field : keyof DataType, value : any) =>
          set((state: any) => ({
            [config.dataPath]: {
              ...state[config.dataPath],
              [field]: value,
            },
          })),
      }),
      {
        name: config.name,
        storage: createJSONStorage(() => localStorage),
        partialize: (state: any) => {
          const persistedData: any = {};
          const currentData = state[config.dataPath];

          // Only persist fields marked as true in persistenceConfig
          for (const key in config.persistenceConfig) {
            if (config.persistenceConfig[key] === true && key in currentData) {
              persistedData[key] = currentData[key];
            }
          }

          return { [config.dataPath]: persistedData };
        },
      }
    )
  );

  // Create the model object with useSelector helper
  const model = {
    useStore,
    useSelector: <R>(selector: (state: FormData) => R): R => {
      return useStore(selector);
    },
    reset: () => useStore.getState().reset(),
    updateField: (field: keyof DataType, value: any) =>
      useStore.getState().updateField(field, value),
  };

  return {
    model,
    formSchema,
    useStore,
  };
}

/**
 * Creates a schema bundle with persistence configuration
 * @param dataSchema - Zod schema for the data
 * @param config - Configuration including dataPath and persistence config
 */
export function createSchemaBundle<T extends z.ZodTypeAny>(
  dataSchema: T,
  config: {
    dataPath: string;
    persistenceConfig: Record<string, boolean>;
  }
) {
  type DataType = z.infer<typeof dataSchema>;

  // Create meta schema (for UI state, not persisted)
  const metaSchema = z.object({
    loading: z.boolean().optional(),
    error: z.string().optional(),
  });

  // Create model schema (combines data and meta)
  const modelSchema = z.object({
    [config.dataPath]: dataSchema,
    meta: metaSchema.optional(),
  });

  // Create persistence schema (only fields marked for persistence)
  const persistenceShape: any = {};
  const shape = (dataSchema as any)._def.shape();

  for (const key in config.persistenceConfig) {
    if (config.persistenceConfig[key] === true && key in shape) {
      persistenceShape[key] = shape[key];
    }
  }

  const persistenceSchema = z.object(persistenceShape);

  return {
    dataSchema,
    metaSchema,
    modelSchema,
    persistenceSchema,
  };
}
