/**
 * Date utility functions working with local YYYY-MM-DD date strings
 * to avoid UTC timezone displacement bugs.
 */

/**
 * Returns today's date in local YYYY-MM-DD format
 * @returns {string}
 */
export function getTodayDateString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Checks if a given date string is today
 * @param {string|null} dateStr 
 * @returns {boolean}
 */
export function isDueToday(dateStr) {
  if (!dateStr) return false;
  return dateStr === getTodayDateString();
}

/**
 * Checks if a given date string is overdue (and not completed)
 * @param {string|null} dateStr 
 * @param {boolean} isCompleted 
 * @returns {boolean}
 */
export function isOverdue(dateStr, isCompleted = false) {
  if (!dateStr || isCompleted) return false;
  return dateStr < getTodayDateString();
}

/**
 * Formats a due date into a human-friendly label
 * e.g., "Today", "Tomorrow", "Overdue · 2 days", "Mon 22 Sep"
 * @param {string|null} dateStr 
 * @param {boolean} isCompleted 
 * @returns {string|null}
 */
export function formatDueLabel(dateStr, isCompleted = false) {
  if (!dateStr) return null;

  const todayStr = getTodayDateString();
  if (dateStr === todayStr) {
    return 'Today';
  }

  const [y, m, d] = dateStr.split('-').map(Number);
  const targetDate = new Date(y, m - 1, d);
  const today = new Date();
  const todayDateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  const diffTime = targetDate.getTime() - todayDateOnly.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 1) {
    return 'Tomorrow';
  }

  if (diffDays === -1 && !isCompleted) {
    return 'Overdue · Yesterday';
  }

  if (diffDays < -1 && !isCompleted) {
    return `Overdue · ${Math.abs(diffDays)} days`;
  }

  // Format as "Mon 22 Sep"
  return new Intl.DateTimeFormat('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short'
  }).format(targetDate);
}

/**
 * Formats current date for the app header (e.g. "Friday, 19 September")
 * @returns {string}
 */
export function formatHeaderDate() {
  return new Intl.DateTimeFormat('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  }).format(new Date());
}
