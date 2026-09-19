/**
 * Validation utilities for tasks
 */

export const MAX_TITLE_LENGTH = 200;
export const MAX_NOTES_LENGTH = 500;

/**
 * Normalizes title string by trimming outer whitespace and collapsing internal whitespace
 * @param {any} title 
 * @returns {string}
 */
export function normalizeTitle(title) {
  if (title === null || title === undefined) return '';
  const str = typeof title === 'string' ? title : String(title);
  return str.trim().replace(/\s+/g, ' ');
}

/**
 * Validates task title
 * @param {any} title 
 * @returns {{ isValid: boolean, error: string | null }}
 */
export function validateTitle(title) {
  if (title === null || title === undefined) {
    return {
      isValid: false,
      error: 'Give your task a title.'
    };
  }

  const str = typeof title === 'string' ? title : String(title);
  const trimmed = str.trim();
  if (!trimmed) {
    return {
      isValid: false,
      error: 'Give your task a title.'
    };
  }

  if (trimmed.length > MAX_TITLE_LENGTH) {
    return {
      isValid: false,
      error: 'Keep it under 200 characters.'
    };
  }

  return {
    isValid: true,
    error: null
  };
}

/**
 * Validates task notes
 * @param {any} notes 
 * @returns {{ isValid: boolean, error: string | null }}
 */
export function validateNotes(notes) {
  if (notes === null || notes === undefined || notes === '') {
    return { isValid: true, error: null };
  }

  const str = typeof notes === 'string' ? notes : String(notes);
  if (str.length > MAX_NOTES_LENGTH) {
    return {
      isValid: false,
      error: 'Notes must be 500 characters or fewer.'
    };
  }

  return {
    isValid: true,
    error: null
  };
}

