import React, { useState, useEffect } from 'react';
import { Dialog } from '../ui/Dialog';
import { Button } from '../ui/Button';
import { validateTitle, validateNotes, MAX_TITLE_LENGTH, MAX_NOTES_LENGTH } from '../../utils/validation';
import { PRIORITY_NONE, PRIORITY_LOW, PRIORITY_MEDIUM, PRIORITY_HIGH } from '../../constants/priorities';
import { AlertCircle, Flag, Calendar, AlignLeft } from 'lucide-react';

/**
 * TaskEditDialog component — Modern elevated modal dialog
 * @param {{
 *  isOpen: boolean,
 *  onClose: () => void,
 *  task: any,
 *  onSave: (updatedData: any) => void,
 *  triggerRef?: React.RefObject<HTMLElement>
 * }} props
 */
export function TaskEditDialog({
  isOpen,
  onClose,
  task,
  onSave,
  triggerRef
}) {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState(PRIORITY_NONE);
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    if (task) {
      setTitle(task.title || '');
      setPriority(task.priority || PRIORITY_NONE);
      setDueDate(task.dueDate || '');
      setNotes(task.notes || '');
      setError(null);
    }
  }, [task, isOpen]);

  function handleSubmit(e) {
    e.preventDefault();

    const titleValidation = validateTitle(title);
    if (!titleValidation.isValid) {
      setError(titleValidation.error);
      return;
    }

    const notesValidation = validateNotes(notes);
    if (!notesValidation.isValid) {
      setError(notesValidation.error);
      return;
    }

    onSave({
      id: task.id,
      title,
      priority,
      dueDate: dueDate || null,
      notes
    });

    onClose();
  }

  const isTitleOver = title.length > MAX_TITLE_LENGTH;
  const isNotesOver = notes.length > MAX_NOTES_LENGTH;

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Task Details"
      triggerRef={triggerRef}
    >
      <form onSubmit={handleSubmit} className="dialog-form">
        {/* Title Field */}
        <div className="form-group">
          <label htmlFor="edit-task-title" className="form-label">
            Task Title
          </label>
          <input
            id="edit-task-title"
            type="text"
            className="composer-input"
            style={{
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              padding: '0 14px',
              height: '42px',
              backgroundColor: 'var(--bg)'
            }}
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (error) setError(null);
            }}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? 'edit-dialog-error' : undefined}
          />
          {title.length > 160 && (
            <span className={`composer-counter ${isTitleOver ? 'is-limit' : ''}`}>
              {title.length}/{MAX_TITLE_LENGTH}
            </span>
          )}
        </div>

        {/* Priority Field */}
        <div className="form-group">
          <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Flag size={14} color="var(--primary)" />
            <span>Priority Level</span>
          </label>
          <div className="segmented-control" role="group" aria-label="Edit priority">
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
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Due Date Field */}
        <div className="form-group">
          <label htmlFor="edit-task-due" className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Calendar size={14} color="var(--primary)" />
            <span>Due Date</span>
          </label>
          <input
            id="edit-task-due"
            type="date"
            className="date-input-field"
            style={{ width: '100%', height: '40px', paddingLeft: '14px', backgroundColor: 'var(--bg)' }}
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </div>

        {/* Notes Field */}
        <div className="form-group">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label htmlFor="edit-task-notes" className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <AlignLeft size={14} color="var(--primary)" />
              <span>Notes (optional)</span>
            </label>
            <span className={`composer-counter ${isNotesOver ? 'is-limit' : ''}`}>
              {notes.length}/{MAX_NOTES_LENGTH}
            </span>
          </div>
          <textarea
            id="edit-task-notes"
            rows={3}
            style={{
              padding: '10px 14px',
              fontSize: 'var(--font-size-base)',
              width: '100%',
              resize: 'vertical',
              backgroundColor: 'var(--bg)',
              borderRadius: 'var(--radius-md)'
            }}
            value={notes}
            onChange={(e) => {
              setNotes(e.target.value);
              if (error) setError(null);
            }}
            placeholder="Add any extra context, checklist, or links…"
          />
        </div>

        {error && (
          <div id="edit-dialog-error" className="composer-error" role="alert">
            <AlertCircle size={15} />
            <span>{error}</span>
          </div>
        )}

        <div className="dialog-actions">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={isTitleOver || isNotesOver}
          >
            Save Changes
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
