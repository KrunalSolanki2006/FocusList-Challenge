import React from 'react';
import PropTypes from 'prop-types';
import { List, Circle, CheckCircle2, Calendar, Clock, AlertTriangle, Eraser } from 'lucide-react';
import {
  FILTER_ALL,
  FILTER_ACTIVE,
  FILTER_COMPLETED,
  FILTER_TODAY,
  FILTER_UPCOMING,
  FILTER_OVERDUE
} from '../../constants/filters';

/**
 * MobileFilterBar component
 * Horizontal scrollable filter bar for mobile (<768px)
 * @param {{
 *  currentFilter: string,
 *  onFilterChange: (filter: string) => void,
 *  counts: { total: number, active: number, completed: number, today?: number, upcoming?: number, overdue?: number },
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
        data-testid="mobile-filter-all"
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
        data-testid="mobile-filter-active"
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
        data-testid="mobile-filter-completed"
      >
        <CheckCircle2 size={16} />
        <span>Done</span>
        <span className="tabular-nums">({counts.completed})</span>
      </button>

      <button
        type="button"
        className={`mobile-filter-btn ${currentFilter === FILTER_TODAY ? 'active' : ''}`}
        onClick={() => onFilterChange(FILTER_TODAY)}
        aria-pressed={currentFilter === FILTER_TODAY}
        data-testid="mobile-filter-today"
      >
        <Calendar size={16} />
        <span>Today</span>
        <span className="tabular-nums">({counts.today || 0})</span>
      </button>

      <button
        type="button"
        className={`mobile-filter-btn ${currentFilter === FILTER_UPCOMING ? 'active' : ''}`}
        onClick={() => onFilterChange(FILTER_UPCOMING)}
        aria-pressed={currentFilter === FILTER_UPCOMING}
        data-testid="mobile-filter-upcoming"
      >
        <Clock size={16} />
        <span>Upcoming</span>
        <span className="tabular-nums">({counts.upcoming || 0})</span>
      </button>

      <button
        type="button"
        className={`mobile-filter-btn ${currentFilter === FILTER_OVERDUE ? 'active' : ''}`}
        onClick={() => onFilterChange(FILTER_OVERDUE)}
        aria-pressed={currentFilter === FILTER_OVERDUE}
        data-testid="mobile-filter-overdue"
      >
        <AlertTriangle size={16} />
        <span>Overdue</span>
        <span className="tabular-nums">({counts.overdue || 0})</span>
      </button>

      {counts.completed > 0 && (
        <button
          type="button"
          className="mobile-filter-btn"
          onClick={onClearCompleted}
          style={{ color: 'var(--error)' }}
          data-testid="mobile-clear-completed-button"
        >
          <Eraser size={16} />
          <span>Clear ({counts.completed})</span>
        </button>
      )}
    </div>
  );
}

MobileFilterBar.propTypes = {
  currentFilter: PropTypes.string.isRequired,
  onFilterChange: PropTypes.func.isRequired,
  counts: PropTypes.shape({
    total: PropTypes.number.isRequired,
    active: PropTypes.number.isRequired,
    completed: PropTypes.number.isRequired,
    today: PropTypes.number,
    upcoming: PropTypes.number,
    overdue: PropTypes.number
  }).isRequired,
  onClearCompleted: PropTypes.func.isRequired
};
