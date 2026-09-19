import React, { useState, useRef } from 'react';
import { Plus, Calendar, AlertCircle, Check, Flag } from 'lucide-react';
import { validateTitle, MAX_TITLE_LENGTH } from '../../utils/validation';
import { PRIORITY_NONE, PRIORITY_LOW, PRIORITY_MEDIUM, PRIORITY_HIGH } from '../../constants/priorities';
import { getTodayDateString } from '../../utils/dates';
import { Button } from '../ui/Button';

/**
 * TaskComposer component — Modern, elevated task capture bar
 * @param {{
 *  onAddTask: (task: { title: string, priority: string, dueDate: string|null }) => void,
 *  inputRef: React.RefObject<HTMLInputElement>
 * }} props
 */
export function TaskComposer({ onAddTask, inputRef }) {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState(PRIORITY_NONE);
  const [dueDate, setDueDate] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [error, setError] = useState(null);
  const [isJustAdded, setIsJustAdded] = useState(false);

  const containerRef = useRef(null);

  function handleSubmit(e) {
    if (e) e.preventDefault();

    const validation = validateTitle(title);
    if (!validation.isValid) {
      setError(validation.error);
      return;
    }

    onAddTask({
      title,
      priority,
      dueDate: dueDate || null
    });

    setTitle('');
    setPriority(PRIORITY_NONE);
    setDueDate('');
    setError(null);

    setIsJustAdded(true);
    setTimeout(() => setIsJustAdded(false), 700);

    if (inputRef && inputRef.current) {
      inputRef.current.focus();
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  }

  function handleTitleChange(e) {
    setTitle(e.target.value);
    if (error) {
      setError(null);
    }
  }

  function handleSetToday() {
    setDueDate(getTodayDateString());
  }

  function handleSetTomorrow() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const y = tomorrow.getFullYear();
    const m = String(tomorrow.getMonth() + 1).padStart(2, '0');
    const d = String(tomorrow.getDate()).padStart(2, '0');
    setDueDate(`${y}-${m}-${d}`);
  }

  const showCounter = title.length > 160;
  const isOverLimit = title.length > MAX_TITLE_LENGTH;

  return (
    <div
      ref={containerRef}
      className={`task-composer ${isFocused ? 'is-focused' : ''}`}
      onBlur={(e) => {
        if (!containerRef.current?.contains(e.relatedTarget) && !title) {
          setIsFocused(false);
        }
      }}
    >
      <form onSubmit={handleSubmit}>
        <div className="composer-input-row">
          <input
            ref={inputRef}
            type="text"
            className="composer-input"
            placeholder="Add a new task… (e.g. Design homepage hero)"
            value={title}
            onChange={handleTitleChange}
            onFocus={() => setIsFocused(true)}
            onKeyDown={handleKeyDown}
            aria-label="New task title"
            aria-invalid={Boolean(error)}
            aria-describedby={error ? 'composer-error-msg' : undefined}
          />

          {showCounter && (
            <span className={`composer-counter ${isOverLimit ? 'is-limit' : ''}`}>
              {title.length}/{MAX_TITLE_LENGTH}
            </span>
          )}

          <Button
            type="submit"
            variant="primary"
            size="sm"
            disabled={isOverLimit}
            aria-label="Add task"
          >
            {isJustAdded ? (
              <>
                <Check size={16} />
                <span>Added!</span>
              </>
            ) : (
              <>
                <Plus size={16} />
                <span>Add Task</span>
              </>
            )}
          </Button>
        </div>

        {error && (
          <div id="composer-error-msg" className="composer-error" role="alert">
            <AlertCircle size={15} />
            <span>{error}</span>
          </div>
        )}

        {/* Revealed options row on focus or when input has content */}
        {(isFocused || title.length > 0 || priority !== PRIORITY_NONE || dueDate) && (
          <div className="composer-options">
            <div className="composer-options-left">
              {/* Priority Segmented Control */}
              <div className="segmented-control" role="group" aria-label="Task priority">
                {[
                  { value: PRIORITY_NONE, label: 'None' },
                  { value: PRIORITY_LOW, label: 'Low' },
                  { value: PRIORITY_MEDIUM, label: 'Medium' },
                  { value: PRIORITY_HIGH, label: 'High' }
                ].map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    className={`segmented-button ${priority === item.value ? 'active' : ''} ${
                      item.value === PRIORITY_HIGH ? 'priority-high' : ''
                    } ${item.value === PRIORITY_MEDIUM ? 'priority-medium' : ''} ${
                      item.value === PRIORITY_LOW ? 'priority-low' : ''
                    }`}
                    onClick={() => setPriority(item.value)}
                    aria-pressed={priority === item.value}
                  >
                    <Flag size={12} />
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>

              {/* Quick Due Date Selectors */}
              <div className="date-picker-wrap">
                <Calendar size={14} className="date-input-icon" />
                <input
                  type="date"
                  className="date-input-field"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  aria-label="Due date"
                />
              </div>

              <div style={{ display: 'flex', gap: '4px' }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  style={{ height: '30px', padding: '0 8px', fontSize: '11px' }}
                  onClick={handleSetToday}
                >
                  Today
                </button>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  style={{ height: '30px', padding: '0 8px', fontSize: '11px' }}
                  onClick={handleSetTomorrow}
                >
                  Tomorrow
                </button>
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
