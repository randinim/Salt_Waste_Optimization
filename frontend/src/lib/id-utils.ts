/**
 * Utility functions for generating stable IDs that work consistently across SSR and CSR
 */

let counter = 0;

/**
 * Generates a simple sequential ID that's consistent across server and client
 */
export function generateId(): string {
  return `id_${++counter}`;
}

/**
 * Generates a UUID v4 (random) that's safe for hydration
 * This should only be used in client-side code or with proper hydration handling
 */
export function generateUuid(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  
  // Fallback for environments without crypto.randomUUID
  return 'xxxx-xxxx-4xxx-yxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Creates a stable ID generator that uses a prefix and counter
 */
export function createIdGenerator(prefix: string = 'item') {
  let localCounter = 0;
  return () => `${prefix}_${++localCounter}`;
}

/**
 * Generates a timestamp-based ID that's safe for hydration
 * Only use this in useEffect or other client-side only contexts
 */
export function generateTimestampId(): string {
  return `ts_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}