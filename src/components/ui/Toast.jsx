import React from 'react';
import { Undo2, X } from 'lucide-react';
import { IconButton } from './IconButton';

/**
 * Single Toast Notification
 * @param {{
 *  toast: { id: string, message: string, type: string, action?: { label: string, onClick: Function } },
 *  onDismiss: (id: string) => void,
 *  onMouseEnter?: () => void,
 *  onMouseLeave?: () => void
 * }} props
 */
export function Toast({ toast, onDismiss, onMouseEnter, onMouseLeave }) {
  return (
    <div
      role="status"
      className="toast-item"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <span>{toast.message}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {toast.action && (
          <button
            type="button"
            className="toast-undo-btn"
            onClick={() => {
              toast.action.onClick();
              onDismiss(toast.id);
            }}
          >
            <Undo2 size={14} />
            {toast.action.label}
          </button>
        )}
        <IconButton
          aria-label="Dismiss notification"
          onClick={() => onDismiss(toast.id)}
          style={{ color: '#ffffff', opacity: 0.8, width: '24px', height: '24px' }}
        >
          <X size={14} />
        </IconButton>
      </div>
    </div>
  );
}
