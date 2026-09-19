import { useState, useCallback, useRef } from 'react';
import { generateId } from '../utils/id';

/**
 * Toast management hook
 * Handles max 3 stacked toasts, 6-second auto-dismiss, and action callbacks.
 */
export function useToast() {
  const [toasts, setToasts] = useState([]);
  const timersRef = useRef({});

  const dismissToast = useCallback((id) => {
    if (timersRef.current[id]) {
      clearTimeout(timersRef.current[id]);
      delete timersRef.current[id];
    }
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((toastData) => {
    const id = generateId();
    const newToast = {
      id,
      message: toastData.message,
      type: toastData.type || 'info', // 'info' | 'success' | 'warning' | 'error'
      action: toastData.action || null, // { label: string, onClick: Function }
      duration: toastData.duration || 6000
    };

    setToasts((prev) => {
      const updated = [...prev, newToast];
      // Keep max 3 toasts
      if (updated.length > 3) {
        const removed = updated.shift();
        if (timersRef.current[removed.id]) {
          clearTimeout(timersRef.current[removed.id]);
          delete timersRef.current[removed.id];
        }
      }
      return updated;
    });

    // Auto dismiss after duration
    timersRef.current[id] = setTimeout(() => {
      dismissToast(id);
    }, newToast.duration);

    return id;
  }, [dismissToast]);

  const pauseTimer = useCallback((id) => {
    if (timersRef.current[id]) {
      clearTimeout(timersRef.current[id]);
      delete timersRef.current[id];
    }
  }, []);

  const resumeTimer = useCallback((id, remaining = 3000) => {
    if (!timersRef.current[id]) {
      timersRef.current[id] = setTimeout(() => {
        dismissToast(id);
      }, remaining);
    }
  }, [dismissToast]);

  return {
    toasts,
    showToast,
    dismissToast,
    pauseTimer,
    resumeTimer
  };
}
