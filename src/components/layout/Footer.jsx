import React, { useRef } from 'react';
import { Download, Upload } from 'lucide-react';
import { getTodayDateString } from '../../utils/dates';

/**
 * Footer component
 * Displays privacy notice and backup export/import tools
 * @param {{
 *  tasks: Array,
 *  onImport: (tasks: Array) => void,
 *  onNotify: (msg: string) => void
 * }} props
 */
export function Footer({ tasks, onImport, onNotify }) {
  const fileInputRef = useRef(null);

  function handleExport() {
    try {
      const dataStr = JSON.stringify(tasks, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `margin-tasks-${getTodayDateString()}.json`;
      link.click();
      URL.revokeObjectURL(url);
      onNotify('Backup file exported');
    } catch {
      onNotify('Failed to export backup');
    }
  }

  function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        if (Array.isArray(parsed)) {
          onImport(parsed);
          onNotify(`Imported ${parsed.length} tasks`);
        } else if (parsed && Array.isArray(parsed.tasks)) {
          onImport(parsed.tasks);
          onNotify(`Imported ${parsed.tasks.length} tasks`);
        } else {
          onNotify('Invalid backup file format');
        }
      } catch {
        onNotify('Could not read JSON file');
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // Reset input
  }

  return (
    <footer className="app-footer">
      <div className="footer-container">
        <span>Tasks are stored only in this browser.</span>
        <div className="footer-backup-actions">
          <button
            type="button"
            className="footer-link-btn"
            onClick={handleExport}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
          >
            <Download size={13} />
            Export backup
          </button>
          <span>·</span>
          <button
            type="button"
            className="footer-link-btn"
            onClick={() => fileInputRef.current?.click()}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
          >
            <Upload size={13} />
            Import backup
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />
        </div>
      </div>
    </footer>
  );
}
