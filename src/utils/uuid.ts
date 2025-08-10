/**
 * Utility functions for UUID generation
 */

/**
 * Generate a simple UUID v4
 * @returns {string} UUID string
 */
export function generateUUID(): string {
  // Simple UUID v4 implementation
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Generate a shorter ID for database use
 * @returns {string} Short ID string
 */
export function generateShortId(): string {
  return Date.now().toString() + '-' + Math.random().toString(36).substr(2, 9);
}

/**
 * Generate a numeric ID (for compatibility with existing records)
 * @returns {string} Numeric ID as string
 */
export function generateNumericId(): string {
  return Date.now().toString();
}
