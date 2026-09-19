/**
 * Validation utilities for tasks
 */

export const MAX_TITLE_LENGTH = 200;
export const MAX_NOTES_LENGTH = 500;

/**
 * Normalizes title string by trimming outer whitespace and collapsing internal whitespace
 * @param {string} title 
 * @returns {string}
 */
export function normalizeTitle(title) {
  if (!title) return '';
  return title.trim().replace(/\s+/g, ' ');
}

/**
 * Validates task title
 * @param {string} title 
 * @returns {{ isValid: boolean, error: string | null }}
 */
export function validateTitle(title) {
  const trimmed = (title || '').trim();
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
 * @param {string} notes 
 * @returns {{ isValid: boolean, error: string | null }}
 */
export function validateNotes(notes) {
  if (!notes) return { isValid: true, error: null };

  if (notes.length > MAX_NOTES_LENGTH) {
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
