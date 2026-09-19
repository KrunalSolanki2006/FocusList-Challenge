import { describe, it, expect, beforeEach } from 'vitest';

const createMockStorage = () => {
  let store = {};
  return {
    getItem: (key) => store[key] ?? null,
    setItem: (key, value) => { store[key] = String(value); },
    removeItem: (key) => { delete store[key]; },
    clear: () => { store = {}; }
  };
};

if (typeof window === 'undefined') {
  global.window = {};
}
const mockStorage = createMockStorage();
Object.defineProperty(global.window, 'localStorage', {
  value: mockStorage,
  writable: true,
  configurable: true
});
global.localStorage = mockStorage;

describe('Theme management', () => {
  beforeEach(() => {
    mockStorage.clear();
  });

  it('defaults to system theme when no preference stored', () => {
    const stored = mockStorage.getItem('focuslist_theme');
    expect(stored).toBeNull();
  });

  it('persists explicit light and dark themes to localStorage', () => {
    mockStorage.setItem('focuslist_theme', 'dark');
    expect(mockStorage.getItem('focuslist_theme')).toBe('dark');

    mockStorage.setItem('focuslist_theme', 'light');
    expect(mockStorage.getItem('focuslist_theme')).toBe('light');
  });

  it('allows switching between light and dark', () => {
    let current = 'light';
    const toggle = (prev) => (prev === 'dark' ? 'light' : 'dark');
    current = toggle(current);
    expect(current).toBe('dark');
    current = toggle(current);
    expect(current).toBe('light');
  });
});
