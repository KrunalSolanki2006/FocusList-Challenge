import React from 'react';
import PropTypes from 'prop-types';
import { CheckSquare, Sun, Moon, Database } from 'lucide-react';
import { formatHeaderDate } from '../../utils/dates';

/**
 * AppHeader component — Premium glassmorphic header with glowing brand & theme toggle
 */
export function AppHeader({
  theme,
  resolvedTheme,
  onToggleTheme,
  onOpenImportExport
}) {
  const formattedDate = formatHeaderDate();

  return (
    <header className="app-header">
      <div className="header-container">
        <div className="header-brand">
          <div className="brand-icon-wrap" aria-hidden="true">
            <CheckSquare size={22} strokeWidth={2.5} />
          </div>
          <h1 className="wordmark">
            FocusList
          </h1>
        </div>

        <div className="header-right">
          <div className="header-status-pill" title="All data is encrypted and saved in your local browser">
            <span className="status-dot-pulse" aria-hidden="true" />
            <span>Local Secure</span>
          </div>

          <time className="header-date" dateTime={new Date().toISOString().split('T')[0]}>
            {formattedDate}
          </time>

          {/* Theme Toggle Button */}
          {onToggleTheme && (
            <button
              type="button"
              className="icon-btn theme-toggle-btn"
              onClick={onToggleTheme}
              aria-label={`Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} mode`}
              title={`Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} mode`}
              data-testid="theme-toggle"
            >
              {resolvedTheme === 'dark' ? (
                <Sun size={18} className="theme-icon-sun" />
              ) : (
                <Moon size={18} className="theme-icon-moon" />
              )}
            </button>
          )}

          {/* Header Backup & Restore Button */}
          {onOpenImportExport && (
            <button
              type="button"
              className="icon-btn header-backup-btn"
              onClick={onOpenImportExport}
              aria-label="Backup and restore data"
              title="Backup & Restore Data"
              data-testid="header-backup-button"
            >
              <Database size={17} />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

AppHeader.propTypes = {
  theme: PropTypes.oneOf(['light', 'dark', 'system']),
  resolvedTheme: PropTypes.oneOf(['light', 'dark']),
  onToggleTheme: PropTypes.func,
  onOpenImportExport: PropTypes.func
};
