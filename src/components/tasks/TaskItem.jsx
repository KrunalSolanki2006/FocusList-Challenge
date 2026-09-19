import React, { memo, useRef } from 'react';
import PropTypes from 'prop-types';
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
 *  isSelected?: boolean,
 *  onToggleSelect?: (id: string) => void,
 *  onToggle: (id: string) => void,
 *  onEdit: (task: any, triggerRef: React.RefObject<HTMLButtonElement>) => void,
 *  onDelete: (id: string) => void
 * }} props
 */
export const TaskItem = memo(function TaskItem({
  task,
  index,
  isSelected = false,
  onToggleSelect,
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
      className={`task-table-row ${task.completed ? 'is-completed' : ''} ${isSelected ? 'is-selected' : ''}`}
      id={`task-item-${task.id}`}
      data-testid="task-item"
    >
      {/* 0. SELECTION CHECKBOX */}
      <td className="td-select">
        <Checkbox
          id={`task-select-${task.id}`}
          checked={isSelected}
          onChange={() => onToggleSelect && onToggleSelect(task.id)}
          aria-label={`Select task: ${task.title}`}
          data-testid="task-select-checkbox"
        />
      </td>

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
            data-testid="task-checkbox"
          />
          <div className="task-cell-text">
            <span
              id={`task-title-${task.id}`}
              className="task-table-title"
              data-testid="task-title"
            >
              {task.title}
            </span>
            {task.notes && (
              <span className="task-table-notes" title={task.notes} data-testid="task-notes">
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
          <span className={`table-pill-priority priority-${task.priority}`} data-testid="task-priority-badge">
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
            data-testid="task-due-badge"
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
            data-testid="task-edit-button"
          >
            <Pencil size={14} />
          </IconButton>

          <IconButton
            isDanger
            aria-label={`Delete "${task.title}"`}
            onClick={() => onDelete(task.id)}
            className="table-action-btn delete-btn"
            data-testid="task-delete-button"
          >
            <Trash2 size={14} />
          </IconButton>
        </div>
      </td>
    </tr>
  );
});

TaskItem.propTypes = {
  task: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    completed: PropTypes.bool.isRequired,
    priority: PropTypes.string,
    dueDate: PropTypes.string,
    notes: PropTypes.string
  }).isRequired,
  index: PropTypes.number.isRequired,
  isSelected: PropTypes.bool,
  onToggleSelect: PropTypes.func,
  onToggle: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired
};
