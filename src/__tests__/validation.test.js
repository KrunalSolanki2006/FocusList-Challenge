import { describe, it, expect } from 'vitest';
import {
  normalizeTitle,
  validateTitle,
  validateNotes,
  MAX_TITLE_LENGTH,
  MAX_NOTES_LENGTH
} from '../utils/validation';
import { isValidDateString } from '../utils/dates';
import { isValidPriority, sanitizeTaskRecord } from '../utils/migration';
import { PRIORITY_HIGH, PRIORITY_NONE } from '../constants/priorities';

describe('validation & sanitization', () => {
  describe('normalizeTitle', () => {
    it('trims leading/trailing whitespace and collapses inner spaces', () => {
      expect(normalizeTitle('   Hello    World   ')).toBe('Hello World');
      expect(normalizeTitle('\n\tTask   Item\t')).toBe('Task Item');
    });

    it('returns empty string for null/undefined/empty input', () => {
      expect(normalizeTitle('')).toBe('');
      expect(normalizeTitle(null)).toBe('');
      expect(normalizeTitle(undefined)).toBe('');
    });
  });

  describe('validateTitle', () => {
    it('validates non-empty title under limit', () => {
      const res = validateTitle('Ship new feature');
      expect(res.isValid).toBe(true);
      expect(res.error).toBeNull();
    });

    it('rejects empty or whitespace title', () => {
      expect(validateTitle('').isValid).toBe(false);
      expect(validateTitle('   ').isValid).toBe(false);
    });

    it('rejects title exceeding MAX_TITLE_LENGTH', () => {
      const longTitle = 'A'.repeat(MAX_TITLE_LENGTH + 1);
      const res = validateTitle(longTitle);
      expect(res.isValid).toBe(false);
      expect(res.error).toContain('under 200 characters');
    });

    it('safely handles non-string primitives without throwing', () => {
      expect(validateTitle(12345).isValid).toBe(true);
      expect(validateTitle(null).isValid).toBe(false);
      expect(validateTitle(undefined).isValid).toBe(false);
    });
  });

  describe('validateNotes', () => {
    it('allows empty or null notes', () => {
      expect(validateNotes('').isValid).toBe(true);
      expect(validateNotes(null).isValid).toBe(true);
      expect(validateNotes(undefined).isValid).toBe(true);
    });

    it('handles numeric notes safely', () => {
      expect(validateNotes(12345).isValid).toBe(true);
    });

    it('rejects notes exceeding MAX_NOTES_LENGTH', () => {
      const longNotes = 'B'.repeat(MAX_NOTES_LENGTH + 1);
      const res = validateNotes(longNotes);
      expect(res.isValid).toBe(false);
      expect(res.error).toContain('500 characters');
    });
  });

  describe('isValidDateString', () => {
    it('accepts null or empty as valid (optional date)', () => {
      expect(isValidDateString(null)).toBe(true);
      expect(isValidDateString('')).toBe(true);
    });

    it('validates YYYY-MM-DD format correctly', () => {
      expect(isValidDateString('2026-09-19')).toBe(true);
      expect(isValidDateString('2026-02-28')).toBe(true);
    });

    it('rejects malformed date strings', () => {
      expect(isValidDateString('invalid-date')).toBe(false);
      expect(isValidDateString('09-19-2026')).toBe(false);
      expect(isValidDateString('2026-02-31')).toBe(false); // Invalid Feb day
    });
  });

  describe('isValidPriority', () => {
    it('validates allowed priority values', () => {
      expect(isValidPriority(PRIORITY_HIGH)).toBe(true);
      expect(isValidPriority(PRIORITY_NONE)).toBe(true);
      expect(isValidPriority('urgent')).toBe(false);
      expect(isValidPriority(null)).toBe(false);
    });
  });

  describe('sanitizeTaskRecord', () => {
    it('sanitizes and preserves valid task structure', () => {
      const raw = {
        id: 'task-123',
        title: '  Finish audit  ',
        notes: '  Some notes  ',
        completed: true,
        priority: 'high',
        dueDate: '2026-09-30',
        createdAt: '2026-09-01T00:00:00.000Z',
        completedAt: '2026-09-02T00:00:00.000Z',
        unknownProperty: 'should be stripped'
      };
      const sanitized = sanitizeTaskRecord(raw);

      expect(sanitized).toEqual({
        id: 'task-123',
        title: 'Finish audit',
        notes: 'Some notes',
        completed: true,
        priority: 'high',
        dueDate: '2026-09-30',
        createdAt: '2026-09-01T00:00:00.000Z',
        completedAt: '2026-09-02T00:00:00.000Z'
      });
      expect(sanitized.unknownProperty).toBeUndefined();
    });

    it('returns null for task without valid title', () => {
      expect(sanitizeTaskRecord({ id: '1', title: '   ' })).toBeNull();
      expect(sanitizeTaskRecord(null)).toBeNull();
    });

    it('falls back gracefully on invalid priority and dates', () => {
      const sanitized = sanitizeTaskRecord({
        title: 'Clean room',
        priority: 'invalid-priority',
        dueDate: 'invalid-date'
      });
      expect(sanitized.priority).toBe(PRIORITY_NONE);
      expect(sanitized.dueDate).toBeNull();
    });
  });
});
