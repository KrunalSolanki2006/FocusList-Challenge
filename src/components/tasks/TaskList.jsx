import React from 'react';
import PropTypes from 'prop-types';
import { TaskItem } from './TaskItem';
import { Checkbox } from '../ui/Checkbox';

/**
 * TaskList component — Professional SaaS Table Form with Multi-Select
 * @param {{
 *  tasks: Array,
 *  selectedIds?: Set<string>,
 *  onToggleSelect?: (id: string) => void,
 *  onToggleSelectAll?: () => void,
 *  onToggle: (id: string) => void,
 *  onEdit: (task: any, triggerRef: React.RefObject<HTMLButtonElement>) => void,
 *  onDelete: (id: string) => void
 * }} props
 */
export const TaskList = React.memo(function TaskList({
  tasks,
  selectedIds = new Set(),
  onToggleSelect,
  onToggleSelectAll,
  onToggle,
  onEdit,
  onDelete
}) {
  let completedCount = 0;
  let selectedVisibleCount = 0;
  const visibleCount = tasks.length;

  for (let i = 0; i < visibleCount; i++) {
    const t = tasks[i];
    if (t.completed) completedCount++;
    if (selectedIds.has(t.id)) selectedVisibleCount++;
  }

  const activeCount = visibleCount - completedCount;
  const allVisibleSelected = visibleCount > 0 && selectedVisibleCount === visibleCount;
  const someVisibleSelected = selectedVisibleCount > 0 && selectedVisibleCount < visibleCount;

  return (
    <div className="table-card">
      <div className="table-responsive-wrapper">
        <table className="tasks-table" aria-label="Tasks list">
          <thead>
            <tr>
              <th className="th-select" scope="col">
                <Checkbox
                  id="select-all-visible-tasks"
                  checked={allVisibleSelected}
                  indeterminate={someVisibleSelected}
                  onChange={onToggleSelectAll}
                  aria-label={allVisibleSelected ? 'Deselect all visible tasks' : 'Select all visible tasks'}
                  disabled={tasks.length === 0}
                />
              </th>
              <th className="th-num" scope="col">No.</th>
              <th className="th-task" scope="col">Task ({tasks.length})</th>
              <th className="th-priority" scope="col">Priority</th>
              <th className="th-due" scope="col">Due Date</th>
              <th className="th-actions" scope="col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task, index) => (
              <TaskItem
                key={task.id}
                index={index + 1}
                task={task}
                isSelected={selectedIds.has(task.id)}
                onToggleSelect={onToggleSelect}
                onToggle={onToggle}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </tbody>
        </table>
      </div>

      <div className="table-footer">
        <div className="table-footer-summary">
          <span>{tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}</span>
          <span className="footer-dot">•</span>
          <span className="footer-active">{activeCount} pending</span>
          <span className="footer-dot">•</span>
          <span className="footer-done">{completedCount} completed</span>
        </div>
      </div>
    </div>
  );
});

TaskList.propTypes = {
  tasks: PropTypes.arrayOf(PropTypes.object).isRequired,
  selectedIds: PropTypes.instanceOf(Set),
  onToggleSelect: PropTypes.func,
  onToggleSelectAll: PropTypes.func,
  onToggle: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired
};

