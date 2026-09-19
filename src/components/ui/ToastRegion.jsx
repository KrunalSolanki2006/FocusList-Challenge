import React from 'react';
import { Toast } from './Toast';

/**
 * ToastRegion container with aria-live="polite"
 * @param {{
 *  toasts: Array,
 *  onDismiss: (id: string) => void,
 *  onPause: (id: string) => void,
 *  onResume: (id: string) => void
 * }} props
 */
export function ToastRegion({ toasts, onDismiss, onPause, onResume }) {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      aria-atomic="false"
      className="toast-region"
    >
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          toast={toast}
          onDismiss={onDismiss}
          onMouseEnter={() => onPause(toast.id)}
          onMouseLeave={() => onResume(toast.id)}
        />
      ))}
    </div>
  );
}
