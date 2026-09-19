import { describe, it, expect } from 'vitest';
import {
  validateAndParseImportJson,
  MAX_IMPORT_SIZE_BYTES,
  MAX_IMPORT_TASK_COUNT
} from '../utils/importExport';

describe('import & export security', () => {
  it('rejects empty or whitespace input', () => {
    expect(validateAndParseImportJson('').success).toBe(false);
    expect(validateAndParseImportJson('   ').success).toBe(false);
  });

  it('rejects malformed JSON syntax', () => {
    const res = validateAndParseImportJson('{"tasks": [unterminated');
    expect(res.success).toBe(false);
    expect(res.error).toContain('Invalid JSON format');
  });

  it('rejects oversized JSON input (> 2MB)', () => {
    const hugeString = ' '.repeat(MAX_IMPORT_SIZE_BYTES + 1);
    const res = validateAndParseImportJson(hugeString);
    expect(res.success).toBe(false);
    expect(res.error).toContain('safety limit');
  });

  it('parses valid backup structure successfully', () => {
    const backupJson = JSON.stringify({
      version: 1,
      exportedAt: '2026-09-19T10:00:00.000Z',
      tasks: [
        { id: '1', title: 'Task One', completed: false, priority: 'high', dueDate: '2026-09-25' },
        { id: '2', title: 'Task Two', completed: true, priority: 'none', dueDate: null }
      ]
    });

    const res = validateAndParseImportJson(backupJson);
    expect(res.success).toBe(true);
    expect(res.count).toBe(2);
    expect(res.tasks[0].title).toBe('Task One');
    expect(res.tasks[0].priority).toBe('high');
    expect(res.tasks[1].completed).toBe(true);
  });

  it('parses direct array of tasks successfully', () => {
    const arrayJson = JSON.stringify([
      { id: '1', title: 'Direct Array Task', completed: false }
    ]);
    const res = validateAndParseImportJson(arrayJson);
    expect(res.success).toBe(true);
    expect(res.count).toBe(1);
    expect(res.tasks[0].title).toBe('Direct Array Task');
  });

  it('filters out malformed or title-less records', () => {
    const mixedJson = JSON.stringify({
      tasks: [
        { id: '1', title: 'Valid Task' },
        { id: '2', title: '   ' }, // empty title
        { notEvenATask: true },
        null
      ]
    });

    const res = validateAndParseImportJson(mixedJson);
    expect(res.success).toBe(true);
    expect(res.count).toBe(1);
    expect(res.tasks[0].title).toBe('Valid Task');
  });

  it('enforces character limits and sanitizes incoming fields', () => {
    const maliciousJson = JSON.stringify({
      tasks: [
        {
          id: 'xss-1',
          title: '<script>alert("xss")</script> ' + 'A'.repeat(300),
          notes: 'B'.repeat(700),
          priority: 'super-urgent', // invalid priority
          dueDate: 'invalid-date-format' // invalid date
        }
      ]
    });

    const res = validateAndParseImportJson(maliciousJson);
    expect(res.success).toBe(true);
    const task = res.tasks[0];
    expect(task.title.length).toBeLessThanOrEqual(200);
    expect(task.notes.length).toBeLessThanOrEqual(500);
    expect(task.priority).toBe('none'); // defaulted to safe priority
    expect(task.dueDate).toBeNull(); // defaulted to null
  });

  it('rejects files with excessive task count (> 1000)', () => {
    const tasks = Array.from({ length: MAX_IMPORT_TASK_COUNT + 1 }, (_, i) => ({
      id: `t-${i}`,
      title: `Task ${i}`
    }));
    const excessiveJson = JSON.stringify({ tasks });

    const res = validateAndParseImportJson(excessiveJson);
    expect(res.success).toBe(false);
    expect(res.error).toContain('exceeding maximum allowed limit');
  });
});
