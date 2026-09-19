import { generateId } from '../utils/id';
import { normalizeTitle } from '../utils/validation';
import { PRIORITY_NONE } from '../constants/priorities';

export const INITIAL_STATE = {
  tasks: [],
  lastAction: null, // { type: string, tasksWithIndices: Array<{ task, index }>, message: string }
  lastDeleted: null, // backward compatibility
  lastCleared: null, // backward compatibility
  isCorrupted: false,
  isBlocked: false,
  hasHydrated: false
};

/**
 * Task Reducer - Pure function for managing task state
 * @param {typeof INITIAL_STATE} state 
 * @param {{ type: string, payload?: any }} action 
 * @returns {typeof INITIAL_STATE}
 */
export function taskReducer(state, action) {
  switch (action.type) {
    case 'HYDRATE': {
      const { tasks, isCorrupted, isBlocked } = action.payload || {};
      return {
        ...state,
        tasks: Array.isArray(tasks) ? tasks : [],
        isCorrupted: Boolean(isCorrupted),
        isBlocked: Boolean(isBlocked),
        hasHydrated: true
      };
    }

    case 'ADD': {
      const { title, priority = PRIORITY_NONE, dueDate = null, notes = '' } = action.payload || {};
      const normalizedTitle = normalizeTitle(title);
      if (!normalizedTitle) return state;

      const newTask = {
        id: generateId(),
        title: normalizedTitle,
        notes: (notes || '').trim(),
        completed: false,
        priority: priority || PRIORITY_NONE,
        dueDate: dueDate || null,
        createdAt: new Date().toISOString(),
        completedAt: null
      };

      return {
        ...state,
        tasks: [newTask, ...state.tasks]
      };
    }

    case 'TOGGLE': {
      const { id } = action.payload || {};
      const now = new Date().toISOString();

      return {
        ...state,
        tasks: state.tasks.map((task) => {
          if (task.id !== id) return task;
          const nextCompleted = !task.completed;
          return {
            ...task,
            completed: nextCompleted,
            completedAt: nextCompleted ? now : null
          };
        })
      };
    }

    case 'UPDATE': {
      const { id, title, priority, dueDate, notes } = action.payload || {};
      const normalizedTitle = normalizeTitle(title);
      if (!normalizedTitle) return state;

      return {
        ...state,
        tasks: state.tasks.map((task) => {
          if (task.id !== id) return task;
          return {
            ...task,
            title: normalizedTitle,
            priority: priority !== undefined ? priority : task.priority,
            dueDate: dueDate !== undefined ? dueDate : task.dueDate,
            notes: notes !== undefined ? (notes || '').trim() : task.notes
          };
        })
      };
    }

    case 'DELETE': {
      const { id } = action.payload || {};
      const index = state.tasks.findIndex((t) => t.id === id);
      if (index === -1) return state;

      const taskToDelete = state.tasks[index];
      const remainingTasks = state.tasks.filter((t) => t.id !== id);

      return {
        ...state,
        tasks: remainingTasks,
        lastAction: {
          type: 'DELETE',
          tasksWithIndices: [{ task: taskToDelete, index }],
          message: `Deleted "${taskToDelete.title}"`
        },
        lastDeleted: { task: taskToDelete, index },
        lastCleared: null
      };
    }

    case 'BULK_COMPLETE': {
      const { ids } = action.payload || {};
      if (!Array.isArray(ids) || ids.length === 0) return state;
      const idSet = new Set(ids);
      const now = new Date().toISOString();

      return {
        ...state,
        tasks: state.tasks.map((task) => {
          if (idSet.has(task.id) && !task.completed) {
            return {
              ...task,
              completed: true,
              completedAt: now
            };
          }
          return task;
        })
      };
    }

    case 'BULK_DELETE': {
      const { ids } = action.payload || {};
      if (!Array.isArray(ids) || ids.length === 0) return state;
      const idSet = new Set(ids);

      const deletedWithIndices = [];
      state.tasks.forEach((task, index) => {
        if (idSet.has(task.id)) {
          deletedWithIndices.push({ task, index });
        }
      });

      if (deletedWithIndices.length === 0) return state;

      const remainingTasks = state.tasks.filter((t) => !idSet.has(t.id));

      return {
        ...state,
        tasks: remainingTasks,
        lastAction: {
          type: 'BULK_DELETE',
          tasksWithIndices: deletedWithIndices,
          message: `Deleted ${deletedWithIndices.length} ${deletedWithIndices.length === 1 ? 'task' : 'tasks'}`
        },
        lastDeleted: null,
        lastCleared: null
      };
    }

    case 'CLEAR_COMPLETED': {
      const completedWithIndices = [];
      state.tasks.forEach((task, index) => {
        if (task.completed) {
          completedWithIndices.push({ task, index });
        }
      });

      if (completedWithIndices.length === 0) return state;

      const remainingTasks = state.tasks.filter((t) => !t.completed);

      return {
        ...state,
        tasks: remainingTasks,
        lastAction: {
          type: 'CLEAR_COMPLETED',
          tasksWithIndices: completedWithIndices,
          message: `Cleared ${completedWithIndices.length} completed ${completedWithIndices.length === 1 ? 'task' : 'tasks'}`
        },
        lastCleared: completedWithIndices,
        lastDeleted: null
      };
    }

    case 'RESTORE_LAST_ACTION':
    case 'RESTORE_DELETED':
    case 'RESTORE_CLEARED': {
      // Check lastAction first
      if (state.lastAction && Array.isArray(state.lastAction.tasksWithIndices)) {
        const updatedTasks = [...state.tasks];
        const sorted = [...state.lastAction.tasksWithIndices].sort((a, b) => a.index - b.index);
        sorted.forEach(({ task, index }) => {
          const insertIndex = Math.min(Math.max(0, index), updatedTasks.length);
          updatedTasks.splice(insertIndex, 0, task);
        });

        return {
          ...state,
          tasks: updatedTasks,
          lastAction: null,
          lastDeleted: null,
          lastCleared: null
        };
      }

      // Backward compatibility fallbacks
      if (state.lastDeleted) {
        const { task, index } = state.lastDeleted;
        const updatedTasks = [...state.tasks];
        const insertIndex = Math.min(Math.max(0, index), updatedTasks.length);
        updatedTasks.splice(insertIndex, 0, task);
        return { ...state, tasks: updatedTasks, lastDeleted: null };
      }

      if (state.lastCleared && state.lastCleared.length > 0) {
        const updatedTasks = [...state.tasks];
        state.lastCleared.forEach(({ task, index }) => {
          const insertIndex = Math.min(Math.max(0, index), updatedTasks.length);
          updatedTasks.splice(insertIndex, 0, task);
        });
        return { ...state, tasks: updatedTasks, lastCleared: null };
      }

      return state;
    }

    case 'IMPORT': {
      const payload = action.payload;
      let tasksToImport = null;
      let mode = 'replace';

      if (Array.isArray(payload)) {
        tasksToImport = payload;
      } else if (payload && typeof payload === 'object') {
        tasksToImport = Array.isArray(payload.tasks) ? payload.tasks : null;
        mode = payload.mode || 'replace';
      }

      if (!tasksToImport) return state;

      if (mode === 'merge') {
        const existingIds = new Set(state.tasks.map((t) => t.id));
        const newUniqueTasks = tasksToImport.filter((t) => !existingIds.has(t.id));
        return {
          ...state,
          tasks: [...state.tasks, ...newUniqueTasks],
          lastAction: null
        };
      }

      return {
        ...state,
        tasks: tasksToImport,
        lastAction: null
      };
    }

    case 'DISMISS_NOTICE': {
      return {
        ...state,
        isCorrupted: false,
        isBlocked: false
      };
    }

    default:
      return state;
  }
}
