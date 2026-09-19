import React, { memo, useRef } from 'react';
import { Pencil, Trash2, Calendar, AlertCircle, Flag, FileText } from 'lucide-react';
import { Checkbox } from '../ui/Checkbox';
import { IconButton } from '../ui/IconButton';
import { formatDueLabel, isDueToday, isOverdue } from '../../utils/dates';
import { PRIORITY_CONFIG, PRIORITY_NONE } from '../../constants/priorities';


/**
 * TaskItem component — Table Row Form
 * @param {{
 *  task: {
 *    id: string,
 *    title: string,
 *    completed: boolean,
 *    priority: string,
 *    dueDate: string|null,
 *    notes?: string
 *  },
 *  index: number,
 *  onToggle: (id: string) => void,
 *  onEdit: (task: any, triggerRef: React.RefObject<HTMLButtonElement>) => void,
 *  onDelete: (id: string) => void
 * }} props
 */
export const TaskItem = memo(function TaskItem({
  task,
  index,
  onToggle,
  onEdit,
  onDelete
}) {
  const editButtonRef = useRef(null);

  const dueLabel = formatDueLabel(task.dueDate, task.completed);
  const dueToday = isDueToday(task.dueDate);
  const overdue = isOverdue(task.dueDate, task.completed);

  const priorityConfig = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG[PRIORITY_NONE];
  const hasPriority = task.priority && task.priority !== PRIORITY_NONE;

  return (
    <tr
      className={`task-table-row ${task.completed ? 'is-completed' : ''}`}
      id={`task-item-${task.id}`}
    >
      {/* 1. NO. */}
      <td className="td-num">
        <span className="table-num-badge">
          {index < 10 ? `0${index}` : index}
        </span>
      </td>

      {/* 2. TASK (Checkbox + Title + Notes) */}
      <td className="td-task">
        <div className="task-cell-content">
          <Checkbox
            id={`task-check-${task.id}`}
            checked={task.completed}
            onChange={() => onToggle(task.id)}
            aria-labelledby={`task-title-${task.id}`}
          />
          <div className="task-cell-text">
            <span id={`task-title-${task.id}`} className="task-table-title">
              {task.title}
            </span>
            {task.notes && (
              <span className="task-table-notes" title={task.notes}>
                <FileText size={11} />
                <span>{task.notes}</span>
              </span>
            )}
          </div>
        </div>
      </td>

      {/* 3. PRIORITY */}
      <td className="td-priority">
        {hasPriority ? (
          <span className={`table-pill-priority priority-${task.priority}`}>
            <Flag size={11} strokeWidth={2.2} />
            <span>{priorityConfig.label}</span>
          </span>
        ) : (
          <span className="table-pill-empty">—</span>
        )}
      </td>

      {/* 4. DUE DATE */}
      <td className="td-due">
        {dueLabel ? (
          <span
            className={`table-pill-date ${
              dueToday ? 'date-today' : overdue ? 'date-overdue' : 'date-normal'
            }`}
          >
            {overdue ? <AlertCircle size={11} strokeWidth={2.2} /> : <Calendar size={11} strokeWidth={2.2} />}
            <span>{dueLabel}</span>
          </span>
        ) : (
          <span className="table-pill-empty">—</span>
        )}
      </td>

      {/* 5. ACTIONS */}
      <td className="td-actions">
        <div className="table-actions-wrap">
          <IconButton
            ref={editButtonRef}
            aria-label={`Edit "${task.title}"`}
            onClick={() => onEdit(task, editButtonRef)}
            className="table-action-btn edit-btn"
          >
            <Pencil size={14} />
          </IconButton>

          <IconButton
            isDanger
            aria-label={`Delete "${task.title}"`}
            onClick={() => onDelete(task.id)}
            className="table-action-btn delete-btn"
          >
            <Trash2 size={14} />
          </IconButton>
        </div>
      </td>
    </tr>
  );
});
