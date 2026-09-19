import { useReducer, useEffect, useCallback } from 'react';
import { taskReducer, INITIAL_STATE } from '../state/taskReducer';
import { loadTasksFromStorage } from '../utils/storage';
import { useLocalStorageSync } from './useLocalStorage';

export function useTasks() {
  const [state, dispatch] = useReducer(taskReducer, INITIAL_STATE);

  // Hydrate on mount
  useEffect(() => {
    const { tasks, isCorrupted, isBlocked } = loadTasksFromStorage();
    dispatch({
      type: 'HYDRATE',
      payload: { tasks, isCorrupted, isBlocked }
    });
  }, []);

  // Cross-tab sync callback
  const handleExternalUpdate = useCallback((newTasks) => {
    dispatch({
      type: 'HYDRATE',
      payload: { tasks: newTasks, isCorrupted: false, isBlocked: false }
    });
  }, []);

  // Sync to localStorage
  useLocalStorageSync(state.tasks, state.hasHydrated, handleExternalUpdate);

  // Action dispatchers
  const addTask = useCallback((taskData) => {
    dispatch({ type: 'ADD', payload: taskData });
  }, []);

  const toggleTask = useCallback((id) => {
    dispatch({ type: 'TOGGLE', payload: { id } });
  }, []);

  const updateTask = useCallback((taskData) => {
    dispatch({ type: 'UPDATE', payload: taskData });
  }, []);

  const deleteTask = useCallback((id) => {
    dispatch({ type: 'DELETE', payload: { id } });
  }, []);

  const bulkComplete = useCallback((ids) => {
    dispatch({ type: 'BULK_COMPLETE', payload: { ids } });
  }, []);

  const bulkDelete = useCallback((ids) => {
    dispatch({ type: 'BULK_DELETE', payload: { ids } });
  }, []);

  const clearCompleted = useCallback(() => {
    dispatch({ type: 'CLEAR_COMPLETED' });
  }, []);

  const restoreLastAction = useCallback(() => {
    dispatch({ type: 'RESTORE_LAST_ACTION' });
  }, []);

  const restoreDeleted = useCallback(() => {
    dispatch({ type: 'RESTORE_LAST_ACTION' });
  }, []);

  const restoreCleared = useCallback(() => {
    dispatch({ type: 'RESTORE_LAST_ACTION' });
  }, []);

  const importTasks = useCallback((payload) => {
    dispatch({ type: 'IMPORT', payload });
  }, []);

  const dismissNotice = useCallback(() => {
    dispatch({ type: 'DISMISS_NOTICE' });
  }, []);

  return {
    state,
    addTask,
    toggleTask,
    updateTask,
    deleteTask,
    bulkComplete,
    bulkDelete,
    clearCompleted,
    restoreLastAction,
    restoreDeleted,
    restoreCleared,
    importTasks,
    dismissNotice
  };
}
