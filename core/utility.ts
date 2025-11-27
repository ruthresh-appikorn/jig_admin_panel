import { create, StateCreator, StoreApi, UseBoundStore } from "zustand";
import { persist, createJSONStorage, StateStorage } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { shallow } from "zustand/shallow";
import { subscribeWithSelector } from "zustand/middleware";
import { z } from "zod";

/**
 * Recursively normalizes null values to undefined in objects
 * Also ensures nested objects are properly initialized
 * Enhanced to handle all edge cases including empty strings, NaN, and deeply nested structures
 */
function normalizeNullsToUndefined(obj: any): any {
  // Handle null values
  if (obj === null) return undefined;
  
  // Handle undefined, functions, symbols - return as is
  if (obj === undefined || typeof obj === "function" || typeof obj === "symbol") return obj;
  
  // Handle primitive types
  if (typeof obj !== "object") {
    // Convert null-like values to undefined for strings
    if (typeof obj === "string" && (obj === "null" || obj === "NULL")) return undefined;
    return obj;
  }
  
  // Handle arrays
  if (Array.isArray(obj)) {
    return obj.map(normalizeNullsToUndefined).filter(item => item !== undefined);
  }
  
  // Handle Date objects and other special objects
  if (obj instanceof Date || obj instanceof RegExp || obj instanceof Error) {
    return obj;
  }
  
  // Handle plain objects
  const result: any = {};
  for (const [key, value] of Object.entries(obj)) {
    const normalizedValue = normalizeNullsToUndefined(value);
    // Only include non-undefined values to clean up the object
    if (normalizedValue !== undefined) {
      result[key] = normalizedValue;
    }
  }
  return result;
}

/**
 * Global preprocessing function for Zod schemas to handle null values.
 * This creates a wrapper that automatically normalizes null to undefined.
 */

// Enhanced null-to-undefined normalization for primitive values
// Handles all primitive null scenarios including string representations
function normalizeNullsForPrimitive(value: any): any {
  // Handle explicit null
  if (value === null) return undefined;
  
  // Handle string representations of null
  if (typeof value === "string") {
    const trimmed = value.trim().toLowerCase();
    if (trimmed === "null" || trimmed === "undefined" || trimmed === "") return undefined;
  }
  
  // Handle NaN
  if (typeof value === "number" && isNaN(value)) return undefined;
  
  return value;
}

/**
 * Wrapper function to create null-safe Zod schemas
 * This is a safer approach than patching prototypes
 */
export function nullSafe<T extends z.ZodTypeAny>(schema: T): z.ZodEffects<T, z.infer<T>, any> {
  return z.preprocess((data: any) => {
    if (typeof data === 'object' && data !== null) {
      return normalizeNullsToUndefined(data);
    }
    return normalizeNullsForPrimitive(data);
  }, schema);
}

/**
 * Alternative approach: Transform function that can be applied to any schema
 */
export function withNullHandling<T extends z.ZodTypeAny>(schema: T): z.ZodEffects<T, z.infer<T>, any> {
  return schema.transform((data: any) => {
    if (typeof data === 'object' && data !== null) {
      return normalizeNullsToUndefined(data);
    }
    return normalizeNullsForPrimitive(data);
  });
}

// Global Zod enhancement for automatic null handling
// This extends all Zod schemas to automatically handle null values
const originalParse = z.ZodType.prototype.parse;
const originalSafeParse = z.ZodType.prototype.safeParse;

z.ZodType.prototype.parse = function(data: any, params?: any) {
  // Apply null normalization before parsing
  const normalizedData = typeof data === 'object' && data !== null 
    ? normalizeNullsToUndefined(data) 
    : normalizeNullsForPrimitive(data);
  
  return originalParse.call(this, normalizedData, params);
};

z.ZodType.prototype.safeParse = function(data: any, params?: any) {
  // Apply null normalization before safe parsing
  const normalizedData = typeof data === 'object' && data !== null 
    ? normalizeNullsToUndefined(data) 
    : normalizeNullsForPrimitive(data);
  
  return originalSafeParse.call(this, normalizedData, params);
};

import { mergeWith } from "lodash";
import { useShallow } from "zustand/react/shallow";

/**
 * Array manipulation helper class for type-safe array operations
 */
export class ArrayHelper<T> {
  private currentArray: T[];
  private operations: Array<(arr: T[]) => T[]> = [];

  constructor(array: T[]) {
    this.currentArray = [...array];
  }

  /**
   * Static method to create ArrayHelper with type inference from first addAll operation
   */
  static from<T>(items: T[]): ArrayHelper<T> {
    return new ArrayHelper<T>([]).addAll(items);
  }

  /**
   * Add an item to the array
   */
  add(item: T): ArrayHelper<T> {
    this.operations.push((arr) => [...arr, item]);

    return this;
  }

  /**
   * Add multiple items to the array
   */
  addAll(items: T[]): ArrayHelper<T> {
    this.operations.push((arr) => [...arr, ...items]);

    return this;
  }

  /**
   * Remove item at specific index
   */
  remove(index: number): ArrayHelper<T> {
    this.operations.push((arr) => {
      if (index < 0 || index >= arr.length) {
        console.warn(
          `Index ${index} out of bounds for array of length ${arr.length}`,
        );

        return arr;
      }

      return arr.filter((_, i) => i !== index);
    });

    return this;
  }

  /**
   * Remove items that match the predicate
   */
  removeWhere(predicate: (item: T, index: number) => boolean): ArrayHelper<T> {
    this.operations.push((arr) =>
      arr.filter((item, index) => !predicate(item, index)),
    );

    return this;
  }

  /**
   * Update items that match the predicate
   */
  updateWhere(
    predicate: (item: T, index: number) => boolean,
    updates: Partial<T>,
  ): ArrayHelper<T> {
    this.operations.push((arr) =>
      arr.map((item, index) =>
        predicate(item, index) ? { ...item, ...updates } : item,
      ),
    );

    return this;
  }

  /**
   * Update item at specific index
   */
  updateAt(index: number, updates: Partial<T>): ArrayHelper<T> {
    this.operations.push((arr) => {
      if (index < 0 || index >= arr.length) {
        console.warn(
          `Index ${index} out of bounds for array of length ${arr.length}`,
        );

        return arr;
      }

      return arr.map((item, i) =>
        i === index ? { ...item, ...updates } : item,
      );
    });

    return this;
  }

  /**
   * Replace item at specific index
   */
  replaceAt(index: number, newItem: T): ArrayHelper<T> {
    this.operations.push((arr) => {
      if (index < 0 || index >= arr.length) {
        console.warn(
          `Index ${index} out of bounds for array of length ${arr.length}`,
        );

        return arr;
      }

      return arr.map((item, i) => (i === index ? newItem : item));
    });

    return this;
  }

  /**
   * Insert item at specific index
   */
  insertAt(index: number, item: T): ArrayHelper<T> {
    this.operations.push((arr) => {
      const newArr = [...arr];

      newArr.splice(index, 0, item);

      return newArr;
    });

    return this;
  }

  /**
   * Clear all items from the array
   */
  clear(): ArrayHelper<T> {
    this.operations.push(() => []);

    return this;
  }

  /**
   * Sort the array using a comparator function
   */
  sort(compareFn?: (a: T, b: T) => number): ArrayHelper<T> {
    this.operations.push((arr) => [...arr].sort(compareFn));

    return this;
  }

  /**
   * Reverse the array
   */
  reverse(): ArrayHelper<T> {
    this.operations.push((arr) => [...arr].reverse());

    return this;
  }

  /**
   * Execute all operations and return the final array
   */
  build(): T[] {
    return this.operations.reduce(
      (acc, operation) => operation(acc),
      this.currentArray,
    );
  }

  /**
   * Get the current array without executing pending operations
   */
  peek(): T[] {
    return [...this.currentArray];
  }

  /**
   * Reset all pending operations
   */
  reset(): ArrayHelper<T> {
    this.operations = [];

    return this;
  }
}

/**
 * Factory function to create an ArrayHelper instance
 * Use array<Type>() for empty arrays with explicit type
 * Use array(existingArray) for arrays with initial data
 */
export function array<T>(initialArray?: T[]): ArrayHelper<T> {
  if (typeof initialArray === "undefined") {
    // Handle empty array case with type inference from subsequent operations
    return new ArrayHelper<T>([]);
  }

  return new ArrayHelper<T>(initialArray || []);
}

/**
 * Creates an ArrayHelper with better type inference for update operations
 * This function helps TypeScript infer types from the update operations
 */
export function arrayHelper<T = any>(): ArrayHelper<T> {
  return new ArrayHelper<T>([]);
}

/**
 * Alternative factory function that infers type from the provided items
 * Usage: arrayFrom(items).sort(...)
 */
export function arrayFrom<T>(items: T[]): ArrayHelper<T> {
  return ArrayHelper.from(items);
}

/**
 * Type utility to convert ArrayHelper types to array types
 */
type ProcessArrayHelpers<T> = {
  [K in keyof T]: T[K] extends ArrayHelper<infer U>
    ? U[]
    : T[K] extends object
      ? ProcessArrayHelpers<T[K]>
      : T[K];
};

/**
 * Process ArrayHelper instances in update objects
 */
function processArrayHelpers<T>(obj: T): ProcessArrayHelpers<T> {
  if (obj instanceof ArrayHelper) {
    return obj.build() as any;
  }

  if (Array.isArray(obj)) {
    return obj.map(processArrayHelpers) as any;
  }

  if (obj && typeof obj === "object") {
    const processed: any = {};

    for (const [key, value] of Object.entries(obj)) {
      processed[key] = processArrayHelpers(value);
    }

    return processed;
  }

  return obj as any;
}

/**
 * Defines the structure of a model store, including data and actions.
 */
export type ModelStore<T> = T & {
  update: (updates: any) => void;
  copyWith: (updater: (draft: T) => void) => void;
  reset: () => void;
};

/**
 * Configuration for persisting the model's state.
 */
export type PersistenceConfig = {
  name: string;
  storage?: () => StateStorage;
};

/**
 * Creates a generic, type-safe Zustand store with Zod validation and Immer integration.
 */

export type CreatedModel<T> = {
  [x: string]: any;
  useStore: UseBoundStore<StoreApi<ModelStore<T>>>;
  state: () => T;
  update: (updates: Partial<T>) => void;
  copyWith: (updater: (draft: T) => void) => void;
  reset: () => void;
  selector: <TSlice>(selector: (state: T) => TSlice) => () => TSlice;
  useSelector: <TSlice>(
    selector: (state: T) => TSlice,
    equalityFn?: (a: TSlice, b: TSlice) => boolean,
  ) => TSlice;
};

export function createModel<T extends z.ZodTypeAny>(
  schema: T,
  initialData: z.infer<T>,
  persistConfig?: PersistenceConfig,
) {
  // Create a null-safe version of the schema that automatically handles null values
  const nullSafeSchema = z.preprocess((data: any) => {
    if (typeof data === 'object' && data !== null) {
      return normalizeNullsToUndefined(data);
    }
    return normalizeNullsForPrimitive(data);
  }, schema);
  
  // Apply null handling to initial data
  const normalizedInitialData = typeof initialData === 'object' && initialData !== null 
    ? normalizeNullsToUndefined(initialData) 
    : normalizeNullsForPrimitive(initialData);
  
  const validatedInitialData = nullSafeSchema.parse(normalizedInitialData);

  type StoreType = ModelStore<z.infer<T>>;

  const immerCreator: StateCreator<
    StoreType,
    [["zustand/immer", never]],
    []
  > = (set) => ({
    ...validatedInitialData,
    update: (updates: Partial<z.infer<T>>) => {
      set((state) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { update, reset, copyWith, ...currentData } = state;

        // Process ArrayHelper instances before merging
        const processedUpdates = processArrayHelpers(updates);

        // Apply null handling to updates
        const normalizedUpdates = typeof processedUpdates === 'object' && processedUpdates !== null 
          ? normalizeNullsToUndefined(processedUpdates) 
          : normalizeNullsForPrimitive(processedUpdates);

        // Deep merge the updates with current data
        // This handles nested objects automatically without manual spreading
        const mergedData = mergeWith(
          {},
          currentData,
          normalizedUpdates,
          (objValue, srcValue) => {
            if (Array.isArray(srcValue)) {
              return srcValue;
            }
          },
        );
        const validatedData = nullSafeSchema.parse(mergedData);

        // Apply the merged data to the state
        Object.assign(state, validatedData);
      });
    },
    reset: () => {
      set(validatedInitialData);
    },
    copyWith: (producer: (draft: z.infer<T>) => void) => {
      set((state) => {
        producer(state as z.infer<T>);
      });
    },
  });

  const creator = persistConfig
    ? persist(subscribeWithSelector(immer(immerCreator)), {
        name: persistConfig.name,
        storage: createJSONStorage(() =>
          persistConfig.storage ? persistConfig.storage() : sessionStorage,
        ),
        partialize: (state) => {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { update, reset, copyWith, ...rest } = state;

          // Check if state has persistence configuration
          if (rest._meta?.persistenceConfig) {
            const persistConfig = rest._meta.persistenceConfig;

            // Helper function to convert field name to match persistence config generation
            // This should match the logic in createPersistenceConfig: key.charAt(0).toUpperCase() + key.slice(1)
            const fieldToPersistenceCase = (str: string) => {
              return str.charAt(0).toUpperCase() + str.slice(1);
            };

            // Generic function to filter any object based on persistence configuration
            const filterObjectByPersistence = (
              obj: any,
              configPrefix: string = "",
            ) => {
              const filtered: any = {};

              for (const [key, value] of Object.entries(obj)) {
                // Convert field name to match persistence config generation
                const persistenceKey = fieldToPersistenceCase(key);
                const persistKey = `persist${configPrefix}${persistenceKey}`;

                if (persistConfig[persistKey] && value !== undefined) {
                  filtered[key] = value;
                }
              }

              return filtered;
            };

            // Create a new filtered state object
            const filteredState: any = { ...rest };

            // Apply filtering to all data objects in the state
            for (const [key, value] of Object.entries(rest)) {
              if (
                key !== "_meta" &&
                typeof value === "object" &&
                value !== null &&
                !Array.isArray(value)
              ) {
                // Use the object key as prefix for nested persistence configuration
                const configPrefix = key.charAt(0).toUpperCase() + key.slice(1);

                filteredState[key] = filterObjectByPersistence(
                  value,
                  configPrefix,
                );
              }
            }

            return filteredState;
          }

          return rest;
        },
      })
    : subscribeWithSelector(immer(immerCreator));

  const useStore = create<StoreType>()(creator as any);

  const model: CreatedModel<z.infer<T>> = {
    useStore: useStore as unknown as UseBoundStore<
      StoreApi<ModelStore<z.infer<T>>>
    >,
    state: (): z.infer<T> => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { update, reset, copyWith, ...data } = useStore.getState();

      return data as z.infer<T>;
    },
    update: (updates: Partial<z.infer<T>>) =>
      useStore.getState().update(updates),
    copyWith: (updater: (draft: z.infer<T>) => void) =>
      useStore.getState().copyWith(updater),
    reset: () => useStore.getState().reset(),
    selector: <TSlice>(selector: (state: z.infer<T>) => TSlice) => {
      return () => useStore(selector as (state: StoreType) => TSlice);
    },
    useSelector: <TSlice>(
      selector: (state: z.infer<T>) => TSlice,
      equalityFn?: (a: TSlice, b: TSlice) => boolean,
    ): TSlice => {
      // Create an optimized selector that extracts only the needed data
      const optimizedSelector = (state: StoreType): TSlice => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { update, reset, copyWith, ...data } = state;

        return selector(data as z.infer<T>);
      };

      // Use shallow comparison by default for better performance in Zustand v5
      // This prevents re-renders when the selected data hasn't actually changed
      if (equalityFn) {
        // If custom equality function is provided, use it directly
        return useStore(optimizedSelector);
      } else {
        // Use shallow comparison by default for object/array selections
        return useStore(useShallow(optimizedSelector));
      }
    },
  };

  return model;
}

/**
 * Field accessor type definition with improved type safety
 */
export type FieldAccessor<TValue> = {
  get: (state: any) => TValue;
  set: (value: TValue) => void;
  name: string;
  // Add type information for runtime validation
  _valueType?: string;
};

/**
 * Helper function to parse path with array notation support
 * Supports paths like: 'users[0].profile.name', 'data.items[2].value'
 */
function parsePath(path: string): Array<string | number> {
  const segments: Array<string | number> = [];
  let current = "";
  let i = 0;

  while (i < path.length) {
    const char = path[i];

    if (char === ".") {
      if (current) {
        segments.push(current);
        current = "";
      }
    } else if (char === "[") {
      if (current) {
        segments.push(current);
        current = "";
      }
      // Find the closing bracket
      let j = i + 1;
      let bracketContent = "";

      while (j < path.length && path[j] !== "]") {
        bracketContent += path[j];
        j++;
      }
      // Parse as number if it's a valid number, otherwise as string
      const index = /^\d+$/.test(bracketContent)
        ? parseInt(bracketContent, 10)
        : bracketContent;

      segments.push(index);
      i = j; // Skip to after the closing bracket
    } else {
      current += char;
    }
    i++;
  }

  if (current) {
    segments.push(current);
  }

  return segments;
}

/**
 * Helper function to get nested value from object using dot notation and array indices
 * Supports complex paths like: 'user.addresses[0].street', 'data.items[1].metadata.tags[2]'
 */
function getNestedValue(obj: any, path: string): any {
  if (!obj || typeof path !== "string") return undefined;

  const segments = parsePath(path);
  let current = obj;

  for (const segment of segments) {
    if (current == null) return undefined;

    if (typeof segment === "number") {
      // Array access
      if (!Array.isArray(current)) return undefined;
      current = current[segment];
    } else {
      // Object property access
      current = current[segment];
    }
  }

  return current;
}

/**
 * Helper function to set nested value in object using dot notation and array indices
 * Automatically creates missing objects and arrays as needed
 */
function setNestedValue(obj: any, path: string, value: any): any {
  if (!obj || typeof path !== "string") return obj;

  const segments = parsePath(path);

  if (segments.length === 0) return obj;

  let current = obj;

  // Navigate to the parent of the target
  for (let i = 0; i < segments.length - 1; i++) {
    const segment = segments[i];
    const nextSegment = segments[i + 1];

    if (typeof segment === "number") {
      // Current should be an array
      if (!Array.isArray(current)) {
        throw new Error(
          `Expected array at path segment ${i}, but found ${typeof current}`,
        );
      }

      // Ensure array has enough elements
      while (current.length <= segment) {
        current.push(undefined);
      }

      // Initialize the element if it doesn't exist
      if (current[segment] == null) {
        current[segment] = typeof nextSegment === "number" ? [] : {};
      }

      current = current[segment];
    } else {
      // Object property access
      if (current[segment] == null) {
        // Create array if next segment is a number, otherwise create object
        current[segment] = typeof nextSegment === "number" ? [] : {};
      }

      current = current[segment];
    }
  }

  // Set the final value
  const lastSegment = segments[segments.length - 1];

  if (typeof lastSegment === "number") {
    if (!Array.isArray(current)) {
      throw new Error(
        `Expected array for final segment, but found ${typeof current}`,
      );
    }
    // Ensure array has enough elements
    while (current.length <= lastSegment) {
      current.push(undefined);
    }
    current[lastSegment] = value;
  } else {
    current[lastSegment] = value;
  }

  return obj;
}

/**
 * Helper function to validate path structure against current object
 */
function validatePath(
  obj: any,
  path: string,
): { isValid: boolean; error?: string } {
  try {
    const segments = parsePath(path);
    let current = obj;

    for (let i = 0; i < segments.length - 1; i++) {
      const segment = segments[i];

      if (current == null) {
        return {
          isValid: false,
          error: `Path segment '${segment}' accessed on null/undefined value`,
        };
      }

      if (typeof segment === "number") {
        if (!Array.isArray(current)) {
          return {
            isValid: false,
            error: `Expected array at '${segment}', but found ${typeof current}`,
          };
        }
        if (segment < 0 || segment >= current.length) {
          return {
            isValid: false,
            error: `Array index ${segment} out of bounds (length: ${current.length})`,
          };
        }
      } else {
        if (typeof current !== "object") {
          return {
            isValid: false,
            error: `Expected object at '${segment}', but found ${typeof current}`,
          };
        }
      }

      current = current[segment];
    }

    return { isValid: true };
  } catch (error) {
    return {
      isValid: false,
      error:
        error instanceof Error ? error.message : "Unknown validation error",
    };
  }
}

/**
 * Creates field accessors for a model with automatic get/set functionality and improved type safety
 * Supports nested field access using dot notation and array indices (e.g., 'flight_details.flight_name', 'users[0].profile')
 */
export function createFieldAccessors<T extends Record<string, any>>(
  model: CreatedModel<T>,
  dataPath: keyof T,
) {
  // Use a proxy to dynamically create accessors for any field
  return new Proxy({} as Record<string, FieldAccessor<any>>, {
    get(target, fieldName: string | symbol) {
      if (typeof fieldName !== "string") return undefined;

      return {
        get: (state: T) => {
          try {
            const dataObject = state[dataPath] as any;

            if (!dataObject) return undefined;

            return getNestedValue(dataObject, fieldName);
          } catch (error) {
            console.error(
              `Error getting value for field '${fieldName}':`,
              error,
            );

            return undefined;
          }
        },
        set: (value: any) => {
          try {
            const currentState = model.state();
            const currentData = currentState[dataPath] as any;

            if (!currentData) {
              console.error(
                `Data path '${String(dataPath)}' is null or undefined`,
              );

              return;
            }

            // Validate path structure before setting
            const validation = validatePath(currentData, fieldName);

            if (!validation.isValid && value !== undefined) {
              console.warn(
                `Path validation warning for '${fieldName}': ${validation.error}. Attempting to create structure.`,
              );
            }

            // Type checking for existing values
            if (value !== null && value !== undefined) {
              const currentValue = getNestedValue(currentData, fieldName);

              if (
                currentValue !== undefined &&
                typeof value !== typeof currentValue
              ) {
                console.warn(
                  `Type mismatch for field '${fieldName}': expected ${typeof currentValue}, got ${typeof value}`,
                );
              }
            }

            // Use copyWith for immutable updates
            model.copyWith((draft) => {
              try {
                const draftData = draft[dataPath] as any;

                if (!draftData) {
                  // Initialize the data path if it doesn't exist
                  (draft as any)[dataPath] = {};
                }
                setNestedValue(draft[dataPath] as any, fieldName, value);
              } catch (setError) {
                console.error(
                  `Error setting value for field '${fieldName}':`,
                  setError,
                );
                throw setError;
              }
            });
          } catch (error) {
            console.error(`Failed to set field '${fieldName}':`, error);
            throw error;
          }
        },
        name: fieldName,
        _valueType: (() => {
          try {
            const currentState = model.state();
            const dataObject = currentState[dataPath] as any;
            const value = getNestedValue(dataObject, fieldName);

            return typeof value;
          } catch {
            return "unknown";
          }
        })(),
      } as FieldAccessor<any>;
    },
  });
}

/**
 * Creates a typed field accessor with enhanced type safety and runtime validation.
 * This is a generic utility that can be used across different stores.
 */
export function createTypedFieldAccessor<T>(
  baseAccessor: FieldAccessor<T>,
  fieldName: string,
  expectedType: string,
): FieldAccessor<T> {
  return {
    ...baseAccessor,
    set: (value: T) => {
      // Enhanced type checking
      if (
        value !== null &&
        value !== undefined &&
        typeof value !== expectedType
      ) {
        throw new Error(
          `Type error: Field '${fieldName}' expects ${expectedType}, but received ${typeof value}`,
        );
      }
      baseAccessor.set(value);
    },
    _valueType: expectedType,
  } as FieldAccessor<T>;
}

/**
 * Enhanced update function that supports ArrayHelper operations
 */
export function createEnhancedUpdate<T extends z.ZodTypeAny>(
  model: CreatedModel<z.infer<T>>,
  schema: T,
) {
  return (
    updates:
      | Partial<z.infer<T>>
      | ((current: z.infer<T>) => Partial<z.infer<T>>),
  ) => {
    if (typeof updates === "function") {
      const currentState = model.state();
      const computedUpdates = updates(currentState);
      
      // Apply null handling to computed updates
      const normalizedUpdates = typeof computedUpdates === 'object' && computedUpdates !== null 
        ? normalizeNullsToUndefined(computedUpdates) 
        : normalizeNullsForPrimitive(computedUpdates);

      return model.update(processArrayHelpers(normalizedUpdates));
    }

    // Apply null handling to direct updates
    const normalizedUpdates = typeof updates === 'object' && updates !== null 
      ? normalizeNullsToUndefined(updates) 
      : normalizeNullsForPrimitive(updates);

    return model.update(processArrayHelpers(normalizedUpdates));
  };
}

/**
 * Enhanced model creation with array helper support
 */
export function createEnhancedModel<T extends z.ZodTypeAny>(
  schema: T,
  initialData: z.infer<T>,
  persistConfig?: PersistenceConfig,
) {
  const baseModel = createModel(schema, initialData, persistConfig);

  return {
    ...baseModel,
    updateWithArrays: createEnhancedUpdate(baseModel, schema),
    // Convenience method for array operations
    arrayOp: <TArray>(currentArray: TArray[]): ArrayHelper<TArray> => {
      return array(currentArray);
    },
  };
}

/**
 * Creates a type-safe selector hook for a specific part of the model's state.
 */

/**
 * Defines the structure for an API call, including its data, loading state, and error state.
 */
export type ApiModel<T> = {
  data: T | null;
  isLoading: boolean;
  error: string | null;
};

/**
 * Creates a fully managed API utility that handles data fetching, state management, and error handling.
 */
export function createApi<T, TRequest = void>(
  apiCall: (request: TRequest) => Promise<T>,
  initialData: T | null = null,
) {
  const apiSchema = z.object({
    data: z.any().nullable(),
    isLoading: z.boolean(),
    error: z.string().nullable(),
  });

  const model = createModel(apiSchema, {
    data: initialData,
    isLoading: false,
    error: null,
  });

  return {
    ...model,
    /**
     * Executes the API call and updates the state accordingly.
     */
    call: async (request: TRequest) => {
      model.update({ isLoading: true, error: null });
      try {
        const data = await apiCall(request);

        model.update({ data, isLoading: false });

        return { success: true, data };
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "An unknown error occurred";

        model.update({ error: errorMessage, isLoading: false });

        return { success: false, error: errorMessage };
      }
    },
  };
}

/**
 * Enhanced Utilities for Reducing Boilerplate Code
 */

/**
 * Security rules for persistence configuration - Type-safe version
 */
export type SecurityRules<T extends z.ZodRawShape = any> = {
  dontPersist?: Partial<Record<keyof T, boolean>>; // Type-safe field selection
  alwaysPersist?: Partial<Record<keyof T, boolean>>; // Type-safe field selection
  defaultPersist?: boolean; // Default persistence behavior for other fields
};

/**
 * Legacy string-based security rules for backward compatibility
 */
export type LegacySecurityRules = {
  dontPersist?: string[];
  alwaysPersist?: string[];
  defaultPersist?: boolean;
};

/**
 * Options for creating schema bundles
 */
export type SchemaBundle<T extends z.ZodRawShape> = {
  dataSchema: z.ZodObject<T>;
  persistenceSchema: z.ZodType<any>;
  metaSchema: z.ZodType<any>;
  modelSchema: z.ZodType<any>;
  types: {
    Data: z.infer<z.ZodObject<T>>;
    Persistence: any;
    Meta: any;
    Model: any;
  };
  defaultPersistenceConfig: any;
  createInitialState: (overrides?: Partial<z.infer<z.ZodObject<T>>>) => any;
};

/**
 * Creates a complete schema bundle with data, persistence, meta, and model schemas
 * Eliminates the need to manually define related schemas and types
 */
export function createSchemaBundle<T extends z.ZodRawShape>(
  dataSchema: z.ZodObject<T>,
  options: {
    securityRules?: SecurityRules<T> | LegacySecurityRules;
    persistenceConfig?: Record<keyof T, boolean>;
    dataPath?: string;
    enableNullHandling?: boolean;
  } = {},
): SchemaBundle<T> {
  const { securityRules = {}, persistenceConfig, dataPath = "data", enableNullHandling = true } = options;

  // Store the original schema for use in the bundle
  const processedDataSchema = dataSchema;

  // Auto-generate persistence schema based on data schema fields
  const persistenceFields: Record<string, z.ZodBoolean> = {};
  const dataKeys = Object.keys(dataSchema.shape);

  dataKeys.forEach((key) => {
    const persistKey = `persist${dataPath.charAt(0).toUpperCase() + dataPath.slice(1)}${key.charAt(0).toUpperCase() + key.slice(1)}`;

    persistenceFields[persistKey] = z.boolean();
  });

  const persistenceSchema = z.object(persistenceFields);

  // Create meta schema
  const metaSchema = z.object({
    persistenceConfig: persistenceSchema,
    validation: z.record(z.string(), z.unknown()).optional(),
  });

  // Create model schema
  const modelSchema = z.object({
    [dataPath]: dataSchema,
    _meta: metaSchema.optional(),
  });

  // Helper function to check if a field should not be persisted
  const shouldNotPersist = (key: string): boolean => {
    if (!securityRules.dontPersist) return false;

    // Handle both object-based (type-safe) and array-based (legacy) formats
    if (Array.isArray(securityRules.dontPersist)) {
      return (securityRules.dontPersist as string[]).includes(key);
    } else {
      return Boolean(
        (securityRules.dontPersist as Record<string, boolean>)[key],
      );
    }
  };

  // Helper function to check if a field should always be persisted
  const shouldAlwaysPersist = (key: string): boolean => {
    if (!securityRules.alwaysPersist) return false;

    // Handle both object-based (type-safe) and array-based (legacy) formats
    if (Array.isArray(securityRules.alwaysPersist)) {
      return (securityRules.alwaysPersist as string[]).includes(key);
    } else {
      return Boolean(
        (securityRules.alwaysPersist as Record<string, boolean>)[key],
      );
    }
  };

  // Generate default persistence configuration
  const defaultPersistenceConfig: Record<string, boolean> = {};

  dataKeys.forEach((key) => {
    const persistKey = `persist${dataPath.charAt(0).toUpperCase() + dataPath.slice(1)}${key.charAt(0).toUpperCase() + key.slice(1)}`;

    // Use new persistenceConfig if provided, otherwise fall back to securityRules
    if (persistenceConfig) {
      defaultPersistenceConfig[persistKey] =
        persistenceConfig[key as keyof T] ?? true;
    } else {
      // Legacy securityRules logic
      if (shouldNotPersist(key)) {
        defaultPersistenceConfig[persistKey] = false;
      } else if (shouldAlwaysPersist(key)) {
        defaultPersistenceConfig[persistKey] = true;
      } else {
        defaultPersistenceConfig[persistKey] =
          securityRules.defaultPersist ?? true;
      }
    }
  });

  // Helper function to recursively create default values for nested objects
  const createDefaultValue = (schema: z.ZodTypeAny): any => {
    if (schema instanceof z.ZodString) {
      return "";
    } else if (schema instanceof z.ZodBoolean) {
      return false;
    } else if (schema instanceof z.ZodNumber) {
      return 0;
    } else if (schema instanceof z.ZodArray) {
      return [];
    } else if (schema instanceof z.ZodObject) {
      const nestedDefaults: Record<string, any> = {};
      Object.keys(schema.shape).forEach((nestedKey) => {
        nestedDefaults[nestedKey] = createDefaultValue(schema.shape[nestedKey]);
      });
      return nestedDefaults;
    } else if (schema instanceof z.ZodOptional) {
      return createDefaultValue(schema._def.innerType);
    } else if (schema instanceof z.ZodDefault) {
      return schema._def.defaultValue();
    } else {
      return undefined;
    }
  };

  // Create initial state factory
  const createInitialState = (
    overrides: Partial<z.infer<z.ZodObject<T>>> = {},
  ) => {
    // Create default data structure using the recursive helper
    const defaultData = createDefaultValue(dataSchema);

    return {
      [dataPath]: { ...defaultData, ...overrides },
      _meta: {
        persistenceConfig: defaultPersistenceConfig,
      },
    };
  };

  return {
    dataSchema,
    persistenceSchema,
    metaSchema,
    modelSchema,
    types: {} as any, // Types are inferred at compile time
    defaultPersistenceConfig,
    createInitialState,
  };
}

/**
 * Complete store creation options
 */
export type CompleteStoreOptions<T extends z.ZodRawShape> = {
  name: string;
  dataPath?: string;
  formValidation?: Record<string, z.ZodType<any>>;
  securityRules?: SecurityRules<T> | LegacySecurityRules;
  persistenceConfig?: Record<keyof T, boolean>;
  storage?: () => StateStorage;
};

/**
 * Complete store bundle with all common functionality
 */
export type CompleteStore<T extends z.ZodRawShape> = {
  model: CreatedModel<any>;
  fields: Record<string, FieldAccessor<any>>;
  formSchema: z.ZodObject<any>;
  hooks: {
    useField: (fieldName: string) => any;
    useActions: () => Record<string, (value: any) => void>;
    getDefaultValues: () => Record<string, any>;
  };
  schemas: SchemaBundle<T>;
};

/**
 * Creates a complete store with model, field accessors, form schema, and convenience hooks
 * One-line store creation with all features included
 */
export function createCompleteStore<T extends z.ZodRawShape>(
  dataSchema: z.ZodObject<T>,
  options: CompleteStoreOptions<T>,
): CompleteStore<T> {
  const {
    name,
    dataPath = "data",
    formValidation = {},
    securityRules,
    persistenceConfig,
    storage,
  } = options;

  // Create schema bundle
  const schemas = createSchemaBundle(dataSchema, {
    securityRules,
    persistenceConfig,
    dataPath,
  });

  // Create initial state
  const initialState = schemas.createInitialState();

  // Create model with persistence
  const model = createModel(schemas.modelSchema, initialState, {
    name,
    storage,
  });

  // Create field accessors
  const fields = createFieldAccessors(model, dataPath as any);

  // Create form schema with validation
  const formSchemaShape: Record<string, z.ZodType<any>> = {};

  Object.keys(dataSchema.shape).forEach((key) => {
    if (formValidation[key]) {
      formSchemaShape[key] = formValidation[key];
    } else {
      // Use the original schema field as default
      formSchemaShape[key] = dataSchema.shape[key];
    }
  });
  const formSchema = z.object(formSchemaShape);

  // Create convenience hooks
  const useField = (fieldName: string) => {
    return model.useStore((state: any) => state[dataPath][fieldName]);
  };

  const useActions = () => {
    const actions: Record<string, (value: any) => void> = {};

    Object.keys(dataSchema.shape).forEach((key) => {
      actions[`set${key.charAt(0).toUpperCase() + key.slice(1)}`] = (
        value: any,
      ) => {
        (fields as any)[key].set(value);
      };
    });
    actions.reset = () => model.reset();

    return actions;
  };

  const getDefaultValues = () => {
    const state = model.state();
    const data = state[dataPath];
    const defaults: Record<string, any> = {};

    Object.keys(dataSchema.shape).forEach((key) => {
      defaults[key] = data[key] ?? "";
    });

    return defaults;
  };

  return {
    model,
    fields,
    formSchema,
    hooks: {
      useField,
      useActions,
      getDefaultValues,
    },
    schemas,
  };
}

/**
 * Creates a persistence configuration from a data schema with security rules
 * Automatically generates sensible defaults for field persistence
 */
export function createPersistenceConfig<T extends z.ZodRawShape>(
  dataSchema: z.ZodObject<T>,
  securityRules: SecurityRules<T> | LegacySecurityRules = {},
  dataPath: string = "data",
): Record<string, boolean> {
  const config: Record<string, boolean> = {};
  const dataKeys = Object.keys(dataSchema.shape);

  // Helper function to check if a field should not be persisted
  const shouldNotPersist = (key: string): boolean => {
    if (!securityRules.dontPersist) return false;

    // Handle both object-based (type-safe) and array-based (legacy) formats
    if (Array.isArray(securityRules.dontPersist)) {
      return (securityRules.dontPersist as string[]).includes(key);
    } else {
      return Boolean(
        (securityRules.dontPersist as Record<string, boolean>)[key],
      );
    }
  };

  // Helper function to check if a field should always be persisted
  const shouldAlwaysPersist = (key: string): boolean => {
    if (!securityRules.alwaysPersist) return false;

    // Handle both object-based (type-safe) and array-based (legacy) formats
    if (Array.isArray(securityRules.alwaysPersist)) {
      return (securityRules.alwaysPersist as string[]).includes(key);
    } else {
      return Boolean(
        (securityRules.alwaysPersist as Record<string, boolean>)[key],
      );
    }
  };

  dataKeys.forEach((key) => {
    const persistKey = `persist${dataPath.charAt(0).toUpperCase() + dataPath.slice(1)}${key.charAt(0).toUpperCase() + key.slice(1)}`;

    if (shouldNotPersist(key)) {
      config[persistKey] = false;
    } else if (shouldAlwaysPersist(key)) {
      config[persistKey] = true;
    } else {
      // Smart defaults based on field names and types
      if (
        key.toLowerCase().includes("password") ||
        key.toLowerCase().includes("secret")
      ) {
        config[persistKey] = false;
      } else if (
        key.toLowerCase().includes("loading") ||
        key.toLowerCase().includes("error")
      ) {
        config[persistKey] = false;
      } else {
        config[persistKey] = securityRules.defaultPersist ?? true;
      }
    }
  });

  return config;
}

/**
 * Quick factory for common form field validation patterns
 */
/**
 * Utility function to make any Zod schema explicitly nullable
 * This is useful when you want to explicitly allow null values
 */
export function makeNullable<T extends z.ZodType<any>>(schema: T): z.ZodNullable<T> {
  return schema.nullable();
}

/**
 * Utility function to make any Zod schema accept null and convert it to undefined
 * This is automatically handled by the global patches above, but can be used explicitly
 */
export function nullToUndefined<T extends z.ZodType<any>>(schema: T): z.ZodType<z.infer<T> | undefined> {
  return schema.transform((val) => val === null ? undefined : val);
}

/**
 * Utility function to create a schema that accepts null, undefined, or the actual value
 * and normalizes null to undefined
 */
export function nullableOptional<T extends z.ZodType<any>>(schema: T): z.ZodOptional<z.ZodType<z.infer<T>>> {
  return schema.transform((val) => val === null ? undefined : val).optional();
}

export const formValidators = {
  email: (message = "Please enter a valid email address") =>
    z.preprocess((val) => normalizeNullsForPrimitive(val), z.string().email(message)),

  password: (minLength = 6, message?: string) =>
    z.preprocess((val) => normalizeNullsForPrimitive(val), z
      .string()
      .min(
        minLength,
        message || `Password must be at least ${minLength} characters`,
      )),

  required: (message = "This field is required") => 
    z.preprocess((val) => normalizeNullsForPrimitive(val), z.string().min(1, message)),

  boolean: (defaultValue = false) => 
    z.preprocess((val) => normalizeNullsForPrimitive(val), z.boolean().default(defaultValue)),

  optional: <T extends z.ZodType<any>>(schema: T) => 
    z.preprocess((val) => normalizeNullsForPrimitive(val), schema.optional()),
  
  // Enhanced validators that handle null values explicitly and comprehensively
  nullableString: (message?: string) => 
    z.preprocess((val) => {
      const normalized = normalizeNullsForPrimitive(val);
      return normalized === undefined ? undefined : String(normalized);
    }, z.string().optional()),
    
  nullableBoolean: (defaultValue = false) => 
    z.preprocess((val) => {
      const normalized = normalizeNullsForPrimitive(val);
      if (normalized === undefined) return defaultValue;
      if (typeof normalized === 'string') {
        const lower = normalized.toLowerCase();
        return lower === 'true' || lower === '1' || lower === 'yes';
      }
      return Boolean(normalized);
    }, z.boolean().default(defaultValue)),
    
  nullableNumber: (message?: string) => 
    z.preprocess((val) => {
      const normalized = normalizeNullsForPrimitive(val);
      if (normalized === undefined) return undefined;
      const num = Number(normalized);
      return isNaN(num) ? undefined : num;
    }, z.number().optional()),

  // Additional comprehensive null-safe validators
  nullSafeString: (defaultValue = "") =>
    z.preprocess((val) => {
      const normalized = normalizeNullsForPrimitive(val);
      return normalized === undefined ? defaultValue : String(normalized);
    }, z.string()),

  nullSafeNumber: (defaultValue = 0) =>
    z.preprocess((val) => {
      const normalized = normalizeNullsForPrimitive(val);
      if (normalized === undefined) return defaultValue;
      const num = Number(normalized);
      return isNaN(num) ? defaultValue : num;
    }, z.number()),

  nullSafeArray: <T>(itemSchema: z.ZodType<T>, defaultValue: T[] = []) =>
    z.preprocess((val) => {
      if (val === null || val === undefined) return defaultValue;
      if (!Array.isArray(val)) return defaultValue;
      return val.map(item => normalizeNullsToUndefined(item)).filter(item => item !== undefined);
    }, z.array(itemSchema)),
};
