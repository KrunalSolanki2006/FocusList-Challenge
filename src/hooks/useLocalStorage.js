import { useEffect, useRef } from 'react';
import { saveTasksToStorage } from '../utils/storage';
import { STORAGE_KEY_TASKS } from '../constants/storageKeys';

/**
 * Debounced storage sync hook with cross-tab listener
 * @param {Array} tasks 
 * @param {boolean} hasHydrated 
 * @param {Function} onExternalUpdate 
 */
export function useLocalStorageSync(tasks, hasHydrated, onExternalUpdate) {
  const timeoutRef = useRef(null);
  const isInitialMount = useRef(true);

  // Debounced save
  useEffect(() => {
    if (!hasHydrated) return;

    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      saveTasksToStorage(tasks);
    }, 150);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [tasks, hasHydrated]);

  // Cross-tab sync via storage event
  useEffect(() => {
    function handleStorageEvent(e) {
      if (e.key === STORAGE_KEY_TASKS && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          const newTasks = parsed.tasks || (Array.isArray(parsed) ? parsed : null);
          if (Array.isArray(newTasks) && typeof onExternalUpdate === 'function') {
            onExternalUpdate(newTasks);
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
