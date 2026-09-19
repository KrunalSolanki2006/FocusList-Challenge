import React from 'react';
import { TaskItem } from './TaskItem';

/**
 * TaskList component — Professional SaaS Table Form
 * @param {{
 *  tasks: Array,
 *  onToggle: (id: string) => void,
 *  onEdit: (task: any, triggerRef: React.RefObject<HTMLButtonElement>) => void,
 *  onDelete: (id: string) => void
 * }} props
 */
export function TaskList({ tasks, onToggle, onEdit, onDelete }) {
  const completedCount = tasks.filter((t) => t.completed).length;
  const activeCount = tasks.length - completedCount;

  return (
    <div className="table-card">
      <div className="table-responsive-wrapper">
        <table className="tasks-table" aria-label="Tasks list">
          <thead>
            <tr>
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
}

