import { FILTER_ACTIVE, FILTER_COMPLETED, SORT_DUE_DATE, SORT_PRIORITY } from '../constants/filters';
import { PRIORITY_CONFIG } from '../constants/priorities';
import { isOverdue } from '../utils/dates';

/**
 * Computes task counts across categories
 * @param {Array} tasks 
 * @returns {{ total: number, active: number, completed: number, overdue: number }}
 */
export function selectCounts(tasks) {
  let active = 0;
  let completed = 0;
  let overdue = 0;

  for (const task of tasks) {
    if (task.completed) {
      completed++;
    } else {
      active++;
      if (isOverdue(task.dueDate, false)) {
        overdue++;
      }
    }
  }

  return {
    total: tasks.length,
    active,
    completed,
    overdue
  };
}

/**
 * Computes completion progress
 * @param {Array} tasks 
 * @returns {{ done: number, total: number, percentage: number }}
 */
export function selectProgress(tasks) {
  const total = tasks.length;
  if (total === 0) {
    return { done: 0, total: 0, percentage: 0 };
  }

  const done = tasks.filter((t) => t.completed).length;
  const percentage = Math.round((done / total) * 100);

  return { done, total, percentage };
}

/**
 * Filters, searches, and sorts tasks
 * @param {Array} tasks 
 * @param {string} filter 
 * @param {string} searchQuery 
 * @param {string} sortType 
 * @returns {Array}
 */
export function selectFilteredTasks(tasks, filter, searchQuery = '', sortType = 'newest') {
  // 1. Filter by status
  let result = tasks.filter((task) => {
    if (filter === FILTER_ACTIVE) return !task.completed;
    if (filter === FILTER_COMPLETED) return task.completed;
    return true; // FILTER_ALL
  });

  // 2. Filter by search query
  const trimmedQuery = searchQuery.trim().toLowerCase();
  if (trimmedQuery) {
    result = result.filter((task) => {
      const matchTitle = task.title.toLowerCase().includes(trimmedQuery);
      const matchNotes = (task.notes || '').toLowerCase().includes(trimmedQuery);
      return matchTitle || matchNotes;
    });
  }

  // 3. Sort
  result = [...result].sort((a, b) => {
    // When viewing "All", active tasks stay above completed tasks unless sorting specifically requested
    if (filter === 'all' && a.completed !== b.completed) {
      return a.completed ? 1 : -1;
    }

    if (sortType === SORT_DUE_DATE) {
      if (!a.dueDate && !b.dueDate) return 0;
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return a.dueDate.localeCompare(b.dueDate);
    }

    if (sortType === SORT_PRIORITY) {
      const weightA = PRIORITY_CONFIG[a.priority]?.weight || 0;
      const weightB = PRIORITY_CONFIG[b.priority]?.weight || 0;
      if (weightB !== weightA) {
        return weightB - weightA; // High priority first
      }
    }

    // Default: SORT_NEWEST (newest createdAt first)
    const dateA = new Date(a.createdAt || 0).getTime();
    const dateB = new Date(b.createdAt || 0).getTime();
    return dateB - dateA;
  });

  return result;
}
