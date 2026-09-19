import { describe, it, expect, beforeEach } from 'vitest';

// Provide a mock localStorage for Node test runner
const createMockStorage = () => {
  let store = {};
  return {
    getItem: (key) => store[key] ?? null,
    setItem: (key, value) => { store[key] = String(value); },
    removeItem: (key) => { delete store[key]; },
    clear: () => { store = {}; },
    get length() { return Object.keys(store).length; },
    key: (i) => Object.keys(store)[i] ?? null,
  };
};

if (typeof window === 'undefined') {
  global.window = {};
}
const mockStorage = createMockStorage();
Object.defineProperty(global.window, 'localStorage', {
  value: mockStorage,
  writable: true,
  configurable: true,
});

import {
  loadTasksFromStorage,
  saveTasksToStorage,
  loadPrefsFromStorage,
  savePrefsToStorage,
  isStorageAvailable
} from '../utils/storage';
import {
  STORAGE_KEY_TASKS,
  STORAGE_KEY_BACKUP,
  STORAGE_KEY_PREFS,
  SCHEMA_VERSION
} from '../constants/storageKeys';
import { FILTER_ALL, SORT_NEWEST } from '../constants/filters';

describe('storage & persistence', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('detects storage availability in environment', () => {
    expect(isStorageAvailable()).toBe(true);
  });

  it('returns empty tasks when localStorage has no data', () => {
    const res = loadTasksFromStorage();
    expect(res.tasks).toEqual([]);
    expect(res.isCorrupted).toBe(false);
    expect(res.isBlocked).toBe(false);
  });

  it('saves and loads valid tasks successfully with schema version', () => {
    const tasks = [
      { id: '1', title: 'Task One', completed: false, priority: 'none', dueDate: null }
    ];
    const saveRes = saveTasksToStorage(tasks);
    expect(saveRes.success).toBe(true);

    const loaded = loadTasksFromStorage();
    expect(loaded.tasks).toHaveLength(1);
    expect(loaded.tasks[0].title).toBe('Task One');

    const rawInStorage = JSON.parse(window.localStorage.getItem(STORAGE_KEY_TASKS));
    expect(rawInStorage.version).toBe(SCHEMA_VERSION);
  });

  it('handles corrupted JSON by backing it up and returning isCorrupted: true', () => {
    window.localStorage.setItem(STORAGE_KEY_TASKS, '{invalid-json');

    const res = loadTasksFromStorage();
    expect(res.tasks).toEqual([]);
    expect(res.isCorrupted).toBe(true);

    // Verify corrupted raw string was preserved in backup key
    expect(window.localStorage.getItem(STORAGE_KEY_BACKUP)).toBe('{invalid-json');
    // Verify main key was cleaned
    expect(window.localStorage.getItem(STORAGE_KEY_TASKS)).toBeNull();
  });

  it('migrates legacy array format seamlessly', () => {
    const legacyArray = [
      { id: 'legacy-1', title: 'Old Format Task', completed: false }
    ];
    window.localStorage.setItem(STORAGE_KEY_TASKS, JSON.stringify(legacyArray));

    const res = loadTasksFromStorage();
    expect(res.tasks).toHaveLength(1);
    expect(res.tasks[0].id).toBe('legacy-1');
    expect(res.tasks[0].title).toBe('Old Format Task');
    expect(res.isCorrupted).toBe(false);
  });

  it('persists and retrieves UI preferences', () => {
    expect(loadPrefsFromStorage()).toEqual({
      filter: FILTER_ALL,
      sort: SORT_NEWEST
    });

    savePrefsToStorage({ filter: 'completed', sort: 'priority' });
    expect(loadPrefsFromStorage()).toEqual({
      filter: 'completed',
      sort: 'priority'
    });
  });
});
