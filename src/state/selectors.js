import {
  FILTER_ALL,
  FILTER_ACTIVE,
  FILTER_COMPLETED,
  FILTER_TODAY,
  FILTER_UPCOMING,
  FILTER_OVERDUE,
  SORT_NEWEST,
  SORT_OLDEST,
  SORT_DUE_DATE,
  SORT_PRIORITY
} from '../constants/filters';
import { PRIORITY_CONFIG } from '../constants/priorities';
import { isDueToday, isOverdue, isUpcoming } from '../utils/dates';

/**
 * Computes task counts across categories
 * @param {Array} tasks 
 * @returns {{ total: number, active: number, completed: number, today: number, upcoming: number, overdue: number }}
 */
export function selectCounts(tasks = []) {
  let active = 0;
  let completed = 0;
  let today = 0;
  let upcoming = 0;
  let overdue = 0;

  for (const task of tasks) {
    if (task.completed) {
      completed++;
    } else {
      active++;
      if (isDueToday(task.dueDate)) {
        today++;
      }
      if (isUpcoming(task.dueDate, false)) {
        upcoming++;
      }
      if (isOverdue(task.dueDate, false)) {
        overdue++;
      }
    }
  }

  return {
    total: tasks.length,
    active,
    completed,
    today,
    upcoming,
    overdue
  };
}

/**
 * Computes completion progress
 * @param {Array} tasks 
 * @returns {{ done: number, total: number, percentage: number }}
 */
export function selectProgress(tasks = []) {
  const total = tasks.length;
  if (total === 0) {
    return { done: 0, total: 0, percentage: 0 };
  }

  const done = tasks.filter((t) => t.completed).length;
  const percentage = Math.round((done / total) * 100);

  return { done, total, percentage };
}

/**
 * Filters, searches, and deterministically sorts tasks
 * Single-pass O(N) filtering with zero-allocation ISO string sorting
 * @param {Array} tasks 
 * @param {string} filter 
 * @param {string} searchQuery 
 * @param {string} sortType 
 * @returns {Array}
 */
export function selectFilteredTasks(tasks = [], filter = FILTER_ALL, searchQuery = '', sortType = SORT_NEWEST) {
  if (!Array.isArray(tasks) || tasks.length === 0) return [];

  const query = typeof searchQuery === 'string' ? searchQuery.trim().toLowerCase() : '';

  // 1. Single-pass filter combining status/view and search query
  const result = [];
  for (let i = 0; i < tasks.length; i++) {
    const task = tasks[i];
    if (!task) continue;

    // Status / View filter
    if (filter === FILTER_ACTIVE && task.completed) continue;
    if (filter === FILTER_COMPLETED && !task.completed) continue;
    if (filter === FILTER_TODAY && (task.completed || !isDueToday(task.dueDate))) continue;
    if (filter === FILTER_UPCOMING && (task.completed || !isUpcoming(task.dueDate, false))) continue;
    if (filter === FILTER_OVERDUE && (task.completed || !isOverdue(task.dueDate, false))) continue;

    // Search query filter
    if (query) {
      const matchTitle = (task.title || '').toLowerCase().includes(query);
      const matchNotes = (task.notes || '').toLowerCase().includes(query);
      if (!matchTitle && !matchNotes) continue;
    }

    result.push(task);
  }

  // 2. Deterministic Sort (never mutates input array)
  return result.sort((a, b) => {
    // In default view (FILTER_ALL + SORT_NEWEST), keep active tasks above completed tasks
    if (sortType === SORT_NEWEST && filter === FILTER_ALL && a.completed !== b.completed) {
      return a.completed ? 1 : -1;
    }

    if (sortType === SORT_DUE_DATE) {
      if (!a.dueDate && !b.dueDate) {
        const cA = a.createdAt || '';
        const cB = b.createdAt || '';
        if (cB !== cA) return cB.localeCompare(cA);
        return (a.id || '').localeCompare(b.id || '');
      }
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      const dateComparison = a.dueDate.localeCompare(b.dueDate);
      if (dateComparison !== 0) return dateComparison;

      // Tie-breaker: higher priority first
      const weightA = PRIORITY_CONFIG[a.priority]?.weight || 0;
      const weightB = PRIORITY_CONFIG[b.priority]?.weight || 0;
      if (weightB !== weightA) return weightB - weightA;

      // Tie-breaker: newest first
      const cA = a.createdAt || '';
      const cB = b.createdAt || '';
      if (cB !== cA) return cB.localeCompare(cA);
      return (a.id || '').localeCompare(b.id || '');
    }

    if (sortType === SORT_PRIORITY) {
      const weightA = PRIORITY_CONFIG[a.priority]?.weight || 0;
      const weightB = PRIORITY_CONFIG[b.priority]?.weight || 0;
      if (weightB !== weightA) {
        return weightB - weightA; // High priority first
      }

      // Tie-breaker: earlier due date first
      if (a.dueDate && b.dueDate) {
        const dateComparison = a.dueDate.localeCompare(b.dueDate);
        if (dateComparison !== 0) return dateComparison;
      } else if (a.dueDate) {
        return -1;
      } else if (b.dueDate) {
        return 1;
      }

      // Tie-breaker: newest first
      const cA = a.createdAt || '';
      const cB = b.createdAt || '';
      if (cB !== cA) return cB.localeCompare(cA);
      return (a.id || '').localeCompare(b.id || '');
    }

    if (sortType === SORT_OLDEST) {
      const cA = a.createdAt || '';
      const cB = b.createdAt || '';
      if (cA !== cB) return cA.localeCompare(cB);
      return (a.id || '').localeCompare(b.id || '');
    }

    // Default: SORT_NEWEST
    const cA = a.createdAt || '';
    const cB = b.createdAt || '';
    if (cB !== cA) return cB.localeCompare(cA);
    return (b.id || '').localeCompare(a.id || '');
  });
}

