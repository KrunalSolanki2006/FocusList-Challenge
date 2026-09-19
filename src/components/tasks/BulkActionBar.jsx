import React from 'react';
import PropTypes from 'prop-types';
import { CheckCircle2, Trash2, X, CheckSquare } from 'lucide-react';
import { Button } from '../ui/Button';

/**
 * BulkActionBar Component
 * Elevated action bar displayed when one or more tasks are selected
 * @param {{
 *  selectedCount: number,
 *  onCompleteSelected: () => void,
 *  onDeleteSelected: () => void,
 *  onClearSelection: () => void
 * }} props
 */
export function BulkActionBar({
  selectedCount,
  onCompleteSelected,
  onDeleteSelected,
  onClearSelection
}) {
  if (selectedCount === 0) return null;

  return (
    <section
      className="bulk-action-bar"
      aria-label="Bulk task actions"
      role="region"
    >
      <div className="bulk-action-content">
        <div className="bulk-count-badge" aria-live="polite">
          <CheckSquare size={16} className="bulk-badge-icon" />
          <span className="bulk-count-text">
            <strong>{selectedCount}</strong> {selectedCount === 1 ? 'task' : 'tasks'} selected
          </span>
        </div>

        <div className="bulk-actions-group">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={onCompleteSelected}
            aria-label={`Mark ${selectedCount} selected tasks as completed`}
            className="bulk-btn-complete"
            data-testid="bulk-complete-button"
          >
            <CheckCircle2 size={15} />
            <span>Complete</span>
          </Button>

          <Button
            type="button"
            variant="ghost-danger"
            size="sm"
            onClick={onDeleteSelected}
            aria-label={`Delete ${selectedCount} selected tasks`}
            className="bulk-btn-delete"
            data-testid="bulk-delete-button"
          >
            <Trash2 size={15} />
            <span>Delete</span>
          </Button>

          <button
            type="button"
            className="bulk-btn-clear"
            onClick={onClearSelection}
            aria-label="Clear selection"
            title="Clear selection (Esc)"
            data-testid="bulk-clear-button"
          >
            <X size={15} />
            <span>Deselect</span>
          </button>
        </div>
      </div>
    </section>
  );
}

BulkActionBar.propTypes = {
  selectedCount: PropTypes.number.isRequired,
  onCompleteSelected: PropTypes.func.isRequired,
  onDeleteSelected: PropTypes.func.isRequired,
  onClearSelection: PropTypes.func.isRequired
};
