import React, { useState, useRef } from 'react';
import { Download, Upload, AlertCircle, CheckCircle2, FileText, ArrowRight } from 'lucide-react';
import { Dialog } from '../ui/Dialog';
import { Button } from '../ui/Button';
import { exportTasksToJson, validateAndParseImportJson } from '../../utils/importExport';

/**
 * ImportExportDialog Component
 * Secure modal for exporting backup JSON and previewing/importing tasks
 * @param {{
 *  isOpen: boolean,
 *  onClose: () => void,
 *  tasks: Array,
 *  onImport: (payload: { tasks: Array, mode: 'merge' | 'replace' }) => void,
 *  triggerRef?: React.RefObject<HTMLElement>
 * }} props
 */
export function ImportExportDialog({
  isOpen,
  onClose,
  tasks = [],
  onImport,
  triggerRef
}) {
  const [importResult, setImportResult] = useState(null); // { tasks: Array, count: number }
  const [importError, setImportError] = useState(null);
  const [importMode, setImportMode] = useState('merge'); // 'merge' | 'replace'
  const [selectedFileName, setSelectedFileName] = useState('');
  const fileInputRef = useRef(null);

  function resetState() {
    setImportResult(null);
    setImportError(null);
    setImportMode('merge');
    setSelectedFileName('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }

  function handleClose() {
    resetState();
    onClose();
  }

  function handleExport() {
    exportTasksToJson(tasks);
  }

  function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFileName(file.name);
    setImportError(null);
    setImportResult(null);

    // Validate extension
    if (!file.name.toLowerCase().endsWith('.json') && file.type !== 'application/json') {
      setImportError('Please select a valid .json file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content !== 'string') {
        setImportError('Failed to read file content.');
        return;
      }

      const result = validateAndParseImportJson(content);
      if (result.success) {
        setImportResult(result);
        setImportError(null);
      } else {
        setImportError(result.error || 'Failed to parse file.');
        setImportResult(null);
      }
    };

    reader.onerror = () => {
      setImportError('An error occurred while reading the file.');
    };

    reader.readAsText(file);
  }

  function handleConfirmImport() {
    if (!importResult || !importResult.tasks) return;
    onImport({
      tasks: importResult.tasks,
      mode: importMode
    });
    handleClose();
  }

  return (
    <Dialog
      isOpen={isOpen}
      onClose={handleClose}
      title="Backup & Restore Data"
      triggerRef={triggerRef}
    >
      <div className="import-export-dialog">
        {/* Export Section */}
        <div className="import-export-section">
          <div className="section-header">
            <h3 className="section-title">
              <Download size={16} />
              <span>Export Tasks</span>
            </h3>
            <p className="section-desc">
              Download your current tasks as a secure, portable JSON backup file.
            </p>
          </div>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={handleExport}
            disabled={tasks.length === 0}
            aria-label={`Export ${tasks.length} tasks to JSON`}
            className="export-download-btn"
          >
            <Download size={15} />
            <span>Download Backup ({tasks.length} {tasks.length === 1 ? 'task' : 'tasks'})</span>
          </Button>
        </div>

        <div className="dialog-divider" role="separator" />

        {/* Import Section */}
        <div className="import-export-section">
          <div className="section-header">
            <h3 className="section-title">
              <Upload size={16} />
              <span>Import Tasks from JSON</span>
            </h3>
            <p className="section-desc">
              Select a previously exported FocusList JSON file to restore your tasks.
            </p>
          </div>

          <div className="file-upload-zone">
            <input
              ref={fileInputRef}
              type="file"
              id="focuslist-json-import-input"
              accept=".json,application/json"
              onChange={handleFileChange}
              className="visually-hidden-file-input"
              aria-label="Upload JSON file"
            />
            <label htmlFor="focuslist-json-import-input" className="file-upload-label">
              <FileText size={20} className="upload-icon" />
              <span className="upload-label-text">
                {selectedFileName ? (
                  <strong>{selectedFileName}</strong>
                ) : (
                  'Choose a .json file to inspect and preview'
                )}
              </span>
              <span className="upload-label-subtext">Maximum file size: 2MB</span>
            </label>
          </div>

          {/* Validation Error Alert */}
          {importError && (
            <div className="import-error-alert" role="alert">
              <AlertCircle size={16} />
              <span>{importError}</span>
            </div>
          )}

          {/* Valid Import Preview */}
          {importResult && (
            <div className="import-preview-card" role="region" aria-label="Import preview">
              <div className="preview-header">
                <CheckCircle2 size={16} className="preview-success-icon" />
                <span className="preview-heading">
                  Found <strong>{importResult.count}</strong> valid {importResult.count === 1 ? 'task' : 'tasks'} ready to import
                </span>
              </div>

              {/* Sample Preview List */}
              <ul className="preview-sample-list">
                {importResult.tasks.slice(0, 3).map((task) => (
                  <li key={task.id} className="preview-sample-item">
                    <ArrowRight size={12} />
                    <span>{task.title}</span>
                  </li>
                ))}
                {importResult.count > 3 && (
                  <li className="preview-more-count">
                    + {importResult.count - 3} more tasks
                  </li>
                )}
              </ul>

              {/* Import Strategy Options */}
              <div className="import-strategy-options" role="radiogroup" aria-label="Import strategy">
                <label className="import-radio-label">
                  <input
                    type="radio"
                    name="import-strategy"
                    value="merge"
                    checked={importMode === 'merge'}
                    onChange={() => setImportMode('merge')}
                  />
                  <span>
                    <strong>Merge</strong> (Keep current tasks, add new unique tasks)
                  </span>
                </label>

                <label className="import-radio-label">
                  <input
                    type="radio"
                    name="import-strategy"
                    value="replace"
                    checked={importMode === 'replace'}
                    onChange={() => setImportMode('replace')}
                  />
                  <span>
                    <strong>Replace</strong> (Overwrite current tasks with imported tasks)
                  </span>
                </label>
              </div>

              <div className="preview-actions">
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={handleConfirmImport}
                  aria-label={`Confirm import of ${importResult.count} tasks`}
                >
                  <CheckCircle2 size={15} />
                  <span>Confirm & Import ({importResult.count})</span>
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Dialog>
  );
}
