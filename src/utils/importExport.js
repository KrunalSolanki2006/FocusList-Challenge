import { SCHEMA_VERSION } from '../constants/storageKeys';
import { sanitizeTaskRecord } from './migration';

export const MAX_IMPORT_SIZE_BYTES = 2 * 1024 * 1024; // 2MB safety limit
export const MAX_IMPORT_TASK_COUNT = 1000;

/**
 * Exports tasks as a downloadable JSON file
 * @param {Array} tasks 
 */
export function exportTasksToJson(tasks = []) {
  const sanitizedTasks = tasks.map(sanitizeTaskRecord).filter(Boolean);
  const payload = {
    version: SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    taskCount: sanitizedTasks.length,
    tasks: sanitizedTasks
  };

  const jsonString = JSON.stringify(payload, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  
  const todayStr = new Date().toISOString().split('T')[0];
  const filename = `focuslist-backup-${todayStr}.json`;

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Clean up blob URL after a short delay
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * Validates, parses, and sanitizes an imported JSON string
 * @param {string} rawJson 
 * @returns {{ success: boolean, tasks?: Array, count?: number, error?: string }}
 */
export function validateAndParseImportJson(rawJson) {
  if (typeof rawJson !== 'string') {
    return { success: false, error: 'File is empty or unreadable.' };
  }

  if (rawJson.length > MAX_IMPORT_SIZE_BYTES) {
    return { success: false, error: 'File exceeds the 2MB safety limit.' };
  }

  if (!rawJson.trim()) {
    return { success: false, error: 'File is empty or unreadable.' };
  }

  let parsed;
  try {
    parsed = JSON.parse(rawJson);
  } catch {
    return { success: false, error: 'Invalid JSON format. Please check the file syntax.' };
  }

  if (!parsed || (typeof parsed !== 'object' && !Array.isArray(parsed))) {
    return { success: false, error: 'Unexpected file structure. Expected a JSON object or array.' };
  }

  let candidateTasks = [];
  if (Array.isArray(parsed)) {
    candidateTasks = parsed;
  } else if (Array.isArray(parsed.tasks)) {
    candidateTasks = parsed.tasks;
  } else {
    return { success: false, error: 'No tasks list found in file. Expected a "tasks" array.' };
  }

  if (candidateTasks.length > MAX_IMPORT_TASK_COUNT) {
    return {
      success: false,
      error: `File contains ${candidateTasks.length} tasks, exceeding maximum allowed limit of ${MAX_IMPORT_TASK_COUNT}.`
    };
  }

  const validTasks = [];
  for (const candidate of candidateTasks) {
    const sanitized = sanitizeTaskRecord(candidate);
    if (sanitized) {
      validTasks.push(sanitized);
    }
  }

  if (validTasks.length === 0) {
    return { success: false, error: 'No valid task records could be parsed from this file.' };
  }

  return {
    success: true,
    tasks: validTasks,
    count: validTasks.length
  };
}
