import { describe, it, expect } from 'vitest';
import { taskReducer, INITIAL_STATE } from '../state/taskReducer';
import { PRIORITY_HIGH, PRIORITY_LOW } from '../constants/priorities';

describe('taskReducer', () => {
  it('should initialize state correctly', () => {
    expect(INITIAL_STATE.tasks).toEqual([]);
    expect(INITIAL_STATE.lastAction).toBeNull();
  });

  it('should add a new task and normalize title', () => {
    const action = {
      type: 'ADD',
      payload: {
        title: '   Buy  groceries   ',
        priority: PRIORITY_HIGH,
        dueDate: '2026-09-20',
        notes: 'Milk and eggs'
      }
    };
    const nextState = taskReducer(INITIAL_STATE, action);

    expect(nextState.tasks).toHaveLength(1);
    expect(nextState.tasks[0].title).toBe('Buy groceries');
    expect(nextState.tasks[0].priority).toBe(PRIORITY_HIGH);
    expect(nextState.tasks[0].dueDate).toBe('2026-09-20');
    expect(nextState.tasks[0].notes).toBe('Milk and eggs');
    expect(nextState.tasks[0].completed).toBe(false);
  });

  it('should reject empty or whitespace-only task title on ADD', () => {
    const action = { type: 'ADD', payload: { title: '   ' } };
    const nextState = taskReducer(INITIAL_STATE, action);
    expect(nextState.tasks).toHaveLength(0);
  });

  it('should toggle task completion and track completedAt timestamp', () => {
    const task = { id: 't1', title: 'Test Task', completed: false, completedAt: null };
    const state = { ...INITIAL_STATE, tasks: [task] };

    const toggled = taskReducer(state, { type: 'TOGGLE', payload: { id: 't1' } });
    expect(toggled.tasks[0].completed).toBe(true);
    expect(toggled.tasks[0].completedAt).toBeDefined();

    const untoggled = taskReducer(toggled, { type: 'TOGGLE', payload: { id: 't1' } });
    expect(untoggled.tasks[0].completed).toBe(false);
    expect(untoggled.tasks[0].completedAt).toBeNull();
  });

  it('should update task details', () => {
    const task = { id: 't1', title: 'Old Title', priority: PRIORITY_LOW, dueDate: null, notes: '' };
    const state = { ...INITIAL_STATE, tasks: [task] };

    const action = {
      type: 'UPDATE',
      payload: {
        id: 't1',
        title: 'New Title',
        priority: PRIORITY_HIGH,
        dueDate: '2026-10-01',
        notes: 'Updated notes'
      }
    };
    const nextState = taskReducer(state, action);
    expect(nextState.tasks[0].title).toBe('New Title');
    expect(nextState.tasks[0].priority).toBe(PRIORITY_HIGH);
    expect(nextState.tasks[0].dueDate).toBe('2026-10-01');
    expect(nextState.tasks[0].notes).toBe('Updated notes');
  });

  it('should delete a task and support undo restoration at original index', () => {
    const tasks = [
      { id: '1', title: 'Task 1' },
      { id: '2', title: 'Task 2' },
      { id: '3', title: 'Task 3' }
    ];
    const state = { ...INITIAL_STATE, tasks };

    const deleteState = taskReducer(state, { type: 'DELETE', payload: { id: '2' } });
    expect(deleteState.tasks.map((t) => t.id)).toEqual(['1', '3']);
    expect(deleteState.lastAction).toBeDefined();
    expect(deleteState.lastAction.type).toBe('DELETE');

    const restoredState = taskReducer(deleteState, { type: 'RESTORE_LAST_ACTION' });
    expect(restoredState.tasks.map((t) => t.id)).toEqual(['1', '2', '3']);
    expect(restoredState.lastAction).toBeNull();
  });

  it('should bulk complete selected tasks', () => {
    const tasks = [
      { id: '1', title: 'Task 1', completed: false },
      { id: '2', title: 'Task 2', completed: false },
      { id: '3', title: 'Task 3', completed: true }
    ];
    const state = { ...INITIAL_STATE, tasks };

    const nextState = taskReducer(state, {
      type: 'BULK_COMPLETE',
      payload: { ids: ['1', '2'] }
    });
    expect(nextState.tasks.every((t) => t.completed)).toBe(true);
  });

  it('should bulk delete selected tasks and restore on undo', () => {
    const tasks = [
      { id: '1', title: 'Task 1' },
      { id: '2', title: 'Task 2' },
      { id: '3', title: 'Task 3' },
      { id: '4', title: 'Task 4' }
    ];
    const state = { ...INITIAL_STATE, tasks };

    const bulkDeletedState = taskReducer(state, {
      type: 'BULK_DELETE',
      payload: { ids: ['2', '4'] }
    });
    expect(bulkDeletedState.tasks.map((t) => t.id)).toEqual(['1', '3']);
    expect(bulkDeletedState.lastAction.type).toBe('BULK_DELETE');

    const restoredState = taskReducer(bulkDeletedState, { type: 'RESTORE_LAST_ACTION' });
    expect(restoredState.tasks.map((t) => t.id)).toEqual(['1', '2', '3', '4']);
  });

  it('should clear completed tasks and support undo', () => {
    const tasks = [
      { id: '1', title: 'Active 1', completed: false },
      { id: '2', title: 'Done 1', completed: true },
      { id: '3', title: 'Active 2', completed: false },
      { id: '4', title: 'Done 2', completed: true }
    ];
    const state = { ...INITIAL_STATE, tasks };

    const cleared = taskReducer(state, { type: 'CLEAR_COMPLETED' });
    expect(cleared.tasks.map((t) => t.id)).toEqual(['1', '3']);
    expect(cleared.lastAction.type).toBe('CLEAR_COMPLETED');

    const restored = taskReducer(cleared, { type: 'RESTORE_LAST_ACTION' });
    expect(restored.tasks.map((t) => t.id)).toEqual(['1', '2', '3', '4']);
  });

  it('should support both replace and merge modes in IMPORT', () => {
    const existing = [{ id: '1', title: 'Existing Task' }];
    const state = { ...INITIAL_STATE, tasks: existing };

    // Merge mode
    const imported = [
      { id: '1', title: 'Existing Duplicate' },
      { id: '2', title: 'New Imported' }
    ];
    const mergeState = taskReducer(state, {
      type: 'IMPORT',
      payload: { tasks: imported, mode: 'merge' }
    });
    expect(mergeState.tasks).toHaveLength(2);
    expect(mergeState.tasks.map((t) => t.id)).toEqual(['1', '2']);

    // Replace mode
    const replaceState = taskReducer(state, {
      type: 'IMPORT',
      payload: { tasks: imported, mode: 'replace' }
    });
    expect(replaceState.tasks).toHaveLength(2);
    expect(replaceState.tasks[0].title).toBe('Existing Duplicate');
  });
});
