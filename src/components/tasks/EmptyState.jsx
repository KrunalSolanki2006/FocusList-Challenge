import React from 'react';
import PropTypes from 'prop-types';
import { CheckCircle2, Search, Sparkles, FolderCheck } from 'lucide-react';
import { FILTER_ACTIVE, FILTER_COMPLETED } from '../../constants/filters';

/**
 * EmptyState component — Colorful, modern empty states
 * @param {{
 *  filter: string,
 *  searchQuery: string,
 *  totalTasks: number,
 *  onClearSearch: () => void
 * }} props
 */
export function EmptyState({ filter, searchQuery, totalTasks, onClearSearch }) {
  // Case 1: Search returned no results
  if (searchQuery.trim()) {
    return (
      <div className="empty-state" role="status">
        <div className="empty-state-icon-wrap" style={{ background: 'var(--surface-hover)', color: 'var(--text-muted)' }}>
          <Search size={32} />
        </div>
        <h3 className="empty-state-title">No matching tasks found</h3>
        <p className="empty-state-description">
          We couldn't find any tasks matching &ldquo;{searchQuery}&rdquo;. Try another keyword.
        </p>
        <button
          type="button"
          className="clear-search-link"
          onClick={onClearSearch}
        >
          Clear search query
        </button>
      </div>
    );
  }

  // Case 2: All tasks completed in Active view
  if (filter === FILTER_ACTIVE && totalTasks > 0) {
    return (
      <div className="empty-state" role="status">
        <div className="empty-state-icon-wrap" style={{ background: 'var(--emerald-soft)', color: 'var(--emerald)' }}>
          <CheckCircle2 size={36} />
        </div>
        <h3 className="empty-state-title">You're all caught up! 🎉</h3>
        <p className="empty-state-description">
          Every active task has been checked off. Take a breather or add new goals above.
        </p>
      </div>
    );
  }

  // Case 3: No completed tasks in Completed view
  if (filter === FILTER_COMPLETED) {
    return (
      <div className="empty-state" role="status">
        <div className="empty-state-icon-wrap" style={{ background: 'var(--primary-soft)', color: 'var(--primary)' }}>
          <FolderCheck size={36} />
        </div>
        <h3 className="empty-state-title">No completed tasks yet</h3>
        <p className="empty-state-description">
          Tasks you complete will be archived here so you can review your accomplishments.
        </p>
      </div>
    );
  }

  // Case 4: Initial empty state
  return (
    <div className="empty-state" role="status">
      <div className="empty-state-icon-wrap">
        <Sparkles size={36} />
      </div>
      <h3 className="empty-state-title">Plan your focus for today</h3>
      <p className="empty-state-description">
        Capture your first task above and press <kbd style={{ background: 'var(--surface-hover)', padding: '2px 6px', borderRadius: '4px', border: '1px solid var(--border)', fontSize: '12px' }}>Enter ↵</kbd> to get started.
      </p>
    </div>
  );
}

EmptyState.propTypes = {
  filter: PropTypes.string.isRequired,
  searchQuery: PropTypes.string.isRequired,
  totalTasks: PropTypes.number.isRequired,
  onClearSearch: PropTypes.func.isRequired
};
