import { SCHEMA_VERSION } from '../constants/storageKeys';
import { PRIORITY_NONE, PRIORITY_CONFIG } from '../constants/priorities';
import { normalizeTitle, MAX_TITLE_LENGTH, MAX_NOTES_LENGTH } from './validation';
import { isValidDateString } from './dates';
import { generateId } from './id';

/**
 * Validates whether a priority string is an allowed priority value
 * @param {any} priority 
 * @returns {boolean}
 */
export function isValidPriority(priority) {
  return priority in PRIORITY_CONFIG;
}

/**
 * Sanitizes and validates a single task record
 * @param {any} task 
 * @returns {object | null} Sanitized task or null if fatally malformed
 */
export function sanitizeTaskRecord(task) {
  if (!task || typeof task !== 'object') return null;

  // Title validation
  const rawTitle = typeof task.title === 'string' ? task.title : '';
  const normalizedTitle = normalizeTitle(rawTitle).slice(0, MAX_TITLE_LENGTH);
  if (!normalizedTitle) return null; // Task must have a title

  // ID validation
  const id = typeof task.id === 'string' && task.id.trim() ? task.id.trim() : generateId();

  // Completed status
  const completed = Boolean(task.completed);

  // Priority validation
  const priority = isValidPriority(task.priority) ? task.priority : PRIORITY_NONE;

  // Notes validation
  const rawNotes = typeof task.notes === 'string' ? task.notes.trim() : '';
  const notes = rawNotes.slice(0, MAX_NOTES_LENGTH);

  // Due date validation
  let dueDate = null;
  if (typeof task.dueDate === 'string' && task.dueDate.trim() && isValidDateString(task.dueDate.trim())) {
    dueDate = task.dueDate.trim();
  }

  // Timestamps
  let createdAt;
  if (typeof task.createdAt === 'string' && !isNaN(new Date(task.createdAt).getTime())) {
    createdAt = task.createdAt;
  } else {
    createdAt = new Date().toISOString();
  }

  let completedAt = null;
  if (completed) {
    if (typeof task.completedAt === 'string' && !isNaN(new Date(task.completedAt).getTime())) {
      completedAt = task.completedAt;
    } else {
      completedAt = createdAt;
    }
  }

  return {
    id,
    title: normalizedTitle,
    notes,
    completed,
    priority,
    dueDate,
    createdAt,
    completedAt
  };
}

/**
 * Migrates and sanitizes raw stored data across schema versions
 * @param {any} parsedData 
 * @returns {{ version: number, tasks: Array }}
 */
export function migrateStoredData(parsedData) {
  let rawTasks = [];
  let sourceVersion = 0;

  if (Array.isArray(parsedData)) {
    // Legacy unversioned format: directly array of tasks
    rawTasks = parsedData;
    sourceVersion = 0;
  } else if (parsedData && typeof parsedData === 'object') {
    sourceVersion = typeof parsedData.version === 'number' ? parsedData.version : 0;
    if (Array.isArray(parsedData.tasks)) {
      rawTasks = parsedData.tasks;
    }
  } else {
    return { version: SCHEMA_VERSION, tasks: [] };
  }

  // Sanitize all tasks
  const validTasks = [];
  for (const rawTask of rawTasks) {
    const sanitized = sanitizeTaskRecord(rawTask);
    if (sanitized) {
      validTasks.push(sanitized);
    }
  }

  return {
    version: SCHEMA_VERSION,
    tasks: validTasks
  };
}
