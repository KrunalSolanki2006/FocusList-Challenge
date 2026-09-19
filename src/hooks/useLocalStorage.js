import { useEffect, useRef } from 'react';
import { saveTasksToStorage } from '../utils/storage';
import { STORAGE_KEY_TASKS } from '../constants/storageKeys';
import { migrateStoredData } from '../utils/migration';

/**
 * Debounced storage sync hook with cross-tab listener
 * @param {Array} tasks 
 * @param {boolean} hasHydrated 
 * @param {Function} onExternalUpdate 
 */
export function useLocalStorageSync(tasks, hasHydrated, onExternalUpdate) {
  const timeoutRef = useRef(null);
  const isInitialMount = useRef(true);
  const currentTasksJsonRef = useRef('');
  currentTasksJsonRef.current = JSON.stringify(tasks);

  // Immediate synchronous persistence on task state changes
  useEffect(() => {
    if (!hasHydrated) return;

    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    // Save immediately and synchronously so automated tests and rapid refreshes never lose state
    saveTasksToStorage(tasks);
  }, [tasks, hasHydrated]);

  // Cross-tab sync via native storage event
  useEffect(() => {
    function handleStorageEvent(e) {
      if (e.key === STORAGE_KEY_TASKS && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          const { tasks: validTasks } = migrateStoredData(parsed);

          // Prevent loop or redundant state updates if identical
          if (JSON.stringify(validTasks) !== currentTasksJsonRef.current) {
            if (typeof onExternalUpdate === 'function') {
              onExternalUpdate(validTasks);
            }
          }
        } catch {
          // Ignore invalid cross-tab payload
        }
      }
    }

    window.addEventListener('storage', handleStorageEvent);
    return () => window.removeEventListener('storage', handleStorageEvent);
  }, [onExternalUpdate]);
}
