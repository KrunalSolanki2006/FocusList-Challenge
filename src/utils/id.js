/**
 * Generates a unique task ID using crypto.randomUUID() with a timestamp fallback.
 * @returns {string} Unique identifier
 */
export function generateId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'task_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 9);
}
