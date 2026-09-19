import React from 'react';
import { CheckSquare, Sparkles } from 'lucide-react';
import { formatHeaderDate } from '../../utils/dates';

/**
 * AppHeader component — Premium glassmorphic header with glowing brand
 */
export function AppHeader() {
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
        </div>
      </div>
    </header>
  );
}
