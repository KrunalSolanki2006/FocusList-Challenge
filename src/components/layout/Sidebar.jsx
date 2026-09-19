import React from 'react';
import { List, Circle, CheckCircle2, Eraser, Sparkles, Flame } from 'lucide-react';
import { FILTER_ALL, FILTER_ACTIVE, FILTER_COMPLETED } from '../../constants/filters';

/**
 * Sidebar component — Modern navigation rail with productivity statistics
 * @param {{
 *  currentFilter: string,
 *  onFilterChange: (filter: string) => void,
 *  counts: { total: number, active: number, completed: number, overdue: number },
 *  progress: { done: number, total: number, percentage: number },
 *  onClearCompleted: () => void
 * }} props
 */
export function Sidebar({
  currentFilter,
  onFilterChange,
  counts,
  progress,
  onClearCompleted
}) {
  let motivationalText = 'Ready to tackle your day?';
  if (progress.total > 0) {
    if (progress.percentage === 100) {
      motivationalText = 'Outstanding! All tasks cleared 🎉';
    } else if (progress.percentage >= 50) {
      motivationalText = 'Great pace! More than halfway there.';
    } else if (progress.done > 0) {
      motivationalText = 'Keep the momentum going!';
    }
  }

  return (
    <aside className="sidebar-rail" aria-label="Task navigation and filters">
      <div className="sidebar-card">
        <h2 className="rail-label">Views</h2>
        <nav className="filter-nav">
          <button
            type="button"
            className={`filter-item ${currentFilter === FILTER_ALL ? 'active' : ''}`}
            onClick={() => onFilterChange(FILTER_ALL)}
            aria-pressed={currentFilter === FILTER_ALL}
          >
            <span className="filter-item-left">
              <List size={18} />
              <span>All Tasks</span>
            </span>
            <span className="filter-count tabular-nums">{counts.total}</span>
          </button>

          <button
            type="button"
            className={`filter-item ${currentFilter === FILTER_ACTIVE ? 'active' : ''}`}
            onClick={() => onFilterChange(FILTER_ACTIVE)}
            aria-pressed={currentFilter === FILTER_ACTIVE}
          >
            <span className="filter-item-left">
              <Circle size={18} />
              <span>Active</span>
            </span>
            <span className="filter-count tabular-nums">{counts.active}</span>
          </button>

          <button
            type="button"
            className={`filter-item ${currentFilter === FILTER_COMPLETED ? 'active' : ''}`}
            onClick={() => onFilterChange(FILTER_COMPLETED)}
            aria-pressed={currentFilter === FILTER_COMPLETED}
          >
            <span className="filter-item-left">
              <CheckCircle2 size={18} />
              <span>Completed</span>
            </span>
            <span className="filter-count tabular-nums">{counts.completed}</span>
          </button>
        </nav>
      </div>

      {counts.total > 0 && (
        <div className="rail-progress-card" aria-label="Task progress">
          <div className="progress-header">
            <div className="progress-title">
              {progress.percentage === 100 ? (
                <Flame size={16} color="var(--accent)" />
              ) : (
                <Sparkles size={16} color="var(--primary)" />
              )}
              <span>Daily Progress</span>
            </div>
            <span className="progress-fraction tabular-nums">
              {progress.done} / {progress.total}
            </span>
          </div>

          <div
            className="progress-track"
            role="progressbar"
            aria-valuenow={progress.percentage}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className="progress-fill"
              style={{ width: `${progress.percentage}%` }}
            />
          </div>

          <span className="progress-subtext">{motivationalText}</span>
        </div>
      )}

      {counts.completed > 0 && (
        <button
          type="button"
          className="btn btn-ghost-danger btn-sm"
          onClick={onClearCompleted}
          style={{ width: '100%', justifyContent: 'flex-start', paddingLeft: '12px' }}
        >
          <Eraser size={16} />
          <span>Clear completed ({counts.completed})</span>
        </button>
      )}
    </aside>
  );
}
