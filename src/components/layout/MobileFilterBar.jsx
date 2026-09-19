import React from 'react';
import { List, Circle, CheckCircle2, Eraser } from 'lucide-react';
import { FILTER_ALL, FILTER_ACTIVE, FILTER_COMPLETED } from '../../constants/filters';

/**
 * MobileFilterBar component
 * Horizontal scrollable filter bar for mobile (<640px)
 * @param {{
 *  currentFilter: string,
 *  onFilterChange: (filter: string) => void,
 *  counts: { total: number, active: number, completed: number },
 *  onClearCompleted: () => void
 * }} props
 */
export function MobileFilterBar({
  currentFilter,
  onFilterChange,
  counts,
  onClearCompleted
}) {
  return (
    <div className="mobile-filter-bar" role="navigation" aria-label="Mobile task filters">
      <button
        type="button"
        className={`mobile-filter-btn ${currentFilter === FILTER_ALL ? 'active' : ''}`}
        onClick={() => onFilterChange(FILTER_ALL)}
        aria-pressed={currentFilter === FILTER_ALL}
      >
        <List size={16} />
        <span>All</span>
        <span className="tabular-nums">({counts.total})</span>
      </button>

      <button
        type="button"
        className={`mobile-filter-btn ${currentFilter === FILTER_ACTIVE ? 'active' : ''}`}
        onClick={() => onFilterChange(FILTER_ACTIVE)}
        aria-pressed={currentFilter === FILTER_ACTIVE}
      >
        <Circle size={16} />
        <span>Active</span>
        <span className="tabular-nums">({counts.active})</span>
      </button>

      <button
        type="button"
        className={`mobile-filter-btn ${currentFilter === FILTER_COMPLETED ? 'active' : ''}`}
        onClick={() => onFilterChange(FILTER_COMPLETED)}
        aria-pressed={currentFilter === FILTER_COMPLETED}
      >
        <CheckCircle2 size={16} />
        <span>Done</span>
        <span className="tabular-nums">({counts.completed})</span>
      </button>

      {counts.completed > 0 && (
        <button
          type="button"
          className="mobile-filter-btn"
          onClick={onClearCompleted}
          style={{ color: 'var(--error)' }}
        >
          <Eraser size={16} />
          <span>Clear ({counts.completed})</span>
        </button>
      )}
    </div>
  );
}
