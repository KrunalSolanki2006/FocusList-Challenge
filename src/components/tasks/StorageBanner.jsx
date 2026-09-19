import React from 'react';
import { AlertCircle, X } from 'lucide-react';
import { IconButton } from '../ui/IconButton';

/**
 * StorageBanner component
 * Non-blocking notice for corrupted data or blocked browser storage
 * @param {{
 *  isCorrupted: boolean,
 *  isBlocked: boolean,
 *  onDismiss: () => void
 * }} props
 */
export function StorageBanner({ isCorrupted, isBlocked, onDismiss }) {
  if (!isCorrupted && !isBlocked) return null;

  return (
    <div className="storage-banner" role="alert">
      <div className="storage-banner-content">
        <AlertCircle size={16} />
        <span>
          {isCorrupted
            ? "We couldn't read your saved tasks and started fresh. A backup was kept in browser storage."
            : "Changes won't be saved in this browser mode (private browsing or storage disabled)."}
        </span>
      </div>
      <IconButton
        aria-label="Dismiss storage notice"
        onClick={onDismiss}
        style={{ width: '24px', height: '24px', color: 'inherit' }}
      >
        <X size={14} />
      </IconButton>
    </div>
  );
}
