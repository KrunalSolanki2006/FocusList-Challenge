import { generateId } from '../utils/id';
import { normalizeTitle } from '../utils/validation';
import { PRIORITY_NONE } from '../constants/priorities';

export const INITIAL_STATE = {
  tasks: [],
  lastDeleted: null, // { task, index }
  lastCleared: null, // Array<{ task, index }>
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
      const { tasks, isCorrupted, isBlocked } = action.payload;
      return {
        ...state,
        tasks: Array.isArray(tasks) ? tasks : [],
        isCorrupted: Boolean(isCorrupted),
        isBlocked: Boolean(isBlocked),
        hasHydrated: true
      };
    }

    case 'ADD': {
      const { title, priority = PRIORITY_NONE, dueDate = null, notes = '' } = action.payload;
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
      const { id } = action.payload;
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
      const { id, title, priority, dueDate, notes } = action.payload;
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
      const { id } = action.payload;
      const index = state.tasks.findIndex((t) => t.id === id);
      if (index === -1) return state;

      const taskToDelete = state.tasks[index];
      const remainingTasks = state.tasks.filter((t) => t.id !== id);

      return {
        ...state,
        tasks: remainingTasks,
        lastDeleted: { task: taskToDelete, index },
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
        lastCleared: completedWithIndices,
        lastDeleted: null
      };
    }

    case 'RESTORE_DELETED': {
      if (!state.lastDeleted) return state;
      const { task, index } = state.lastDeleted;

      // Restore task at its original index or clamp
      const updatedTasks = [...state.tasks];
      const insertIndex = Math.min(Math.max(0, index), updatedTasks.length);
      updatedTasks.splice(insertIndex, 0, task);

      return {
        ...state,
        tasks: updatedTasks,
        lastDeleted: null
      };
    }

    case 'RESTORE_CLEARED': {
      if (!state.lastCleared || state.lastCleared.length === 0) return state;

      // Reinsert all cleared tasks
      const updatedTasks = [...state.tasks];
      state.lastCleared.forEach(({ task, index }) => {
        const insertIndex = Math.min(Math.max(0, index), updatedTasks.length);
        updatedTasks.splice(insertIndex, 0, task);
      });

      return {
        ...state,
        tasks: updatedTasks,
        lastCleared: null
      };
    }

    case 'IMPORT': {
      const importedTasks = action.payload;
      if (!Array.isArray(importedTasks)) return state;

      return {
        ...state,
        tasks: importedTasks
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
