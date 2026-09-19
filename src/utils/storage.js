import {
  STORAGE_KEY_TASKS,
  STORAGE_KEY_PREFS,
  STORAGE_KEY_BACKUP,
  SCHEMA_VERSION
} from '../constants/storageKeys';
import { FILTER_ALL, SORT_NEWEST } from '../constants/filters';
import { migrateStoredData, sanitizeTaskRecord } from './migration';

/**
 * Checks if localStorage is available and writable
 * @returns {boolean}
 */
export function isStorageAvailable() {
  try {
    const testKey = '__focuslist_storage_test__';
    window.localStorage.setItem(testKey, testKey);
    window.localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validates whether a task object matches the required schema
 * @param {any} task 
 * @returns {boolean}
 */
export function isValidTask(task) {
  return (
    task &&
    typeof task === 'object' &&
    typeof task.id === 'string' &&
    typeof task.title === 'string' &&
    typeof task.completed === 'boolean'
  );
}

/**
 * Loads tasks from localStorage with migration, schema validation and corruption protection
 * @returns {{ tasks: Array, isCorrupted: boolean, isBlocked: boolean }}
 */
export function loadTasksFromStorage() {
  if (!isStorageAvailable()) {
    return { tasks: [], isCorrupted: false, isBlocked: true };
  }

  try {
    const rawData = window.localStorage.getItem(STORAGE_KEY_TASKS);
    if (!rawData) {
      return { tasks: [], isCorrupted: false, isBlocked: false };
    }

    const parsed = JSON.parse(rawData);
    const { tasks: validTasks } = migrateStoredData(parsed);

    return { tasks: validTasks, isCorrupted: false, isBlocked: false };
  } catch (error) {
    console.warn('[FocusList Storage] Corrupt tasks detected, keeping backup.', error);
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY_TASKS);
      if (raw) {
        window.localStorage.setItem(STORAGE_KEY_BACKUP, raw);
      }
      window.localStorage.removeItem(STORAGE_KEY_TASKS);
    } catch {
      // Ignore backup write failure
    }
    return { tasks: [], isCorrupted: true, isBlocked: false };
  }
}

/**
 * Saves tasks to localStorage
 * @param {Array} tasks 
 * @returns {{ success: boolean, isBlocked: boolean }}
 */
export function saveTasksToStorage(tasks) {
  if (!isStorageAvailable()) {
    return { success: false, isBlocked: true };
  }

  try {
    const sanitizedTasks = Array.isArray(tasks) ? tasks.map(sanitizeTaskRecord).filter(Boolean) : [];
    const payload = JSON.stringify({
      version: SCHEMA_VERSION,
      tasks: sanitizedTasks
    });
    window.localStorage.setItem(STORAGE_KEY_TASKS, payload);
    return { success: true, isBlocked: false };
  } catch (error) {
    console.warn('[FocusList Storage] Save failed (quota or access issue)', error);
    return { success: false, isBlocked: true };
  }
}

/**
 * Loads UI preferences (filter and sort)
 * @returns {{ filter: string, sort: string }}
 */
export function loadPrefsFromStorage() {
  const defaults = { filter: FILTER_ALL, sort: SORT_NEWEST };
  if (!isStorageAvailable()) return defaults;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY_PREFS);
    if (!raw) return defaults;
    const parsed = JSON.parse(raw);
    return {
      filter: parsed.filter || FILTER_ALL,
      sort: parsed.sort || SORT_NEWEST
    };
  } catch {
    return defaults;
  }
}

/**
 * Saves UI preferences to storage
 * @param {{ filter: string, sort: string }} prefs 
 */
export function savePrefsToStorage(prefs) {
  if (!isStorageAvailable()) return;
  try {
    window.localStorage.setItem(STORAGE_KEY_PREFS, JSON.stringify(prefs));
  } catch {
    // Ignore preferences write failure
  }
}
