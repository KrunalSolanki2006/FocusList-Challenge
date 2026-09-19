import React from 'react';
import PropTypes from 'prop-types';
import { Search, X, ArrowUpDown, Database } from 'lucide-react';
import {
  SORT_NEWEST,
  SORT_OLDEST,
  SORT_DUE_DATE,
  SORT_PRIORITY
} from '../../constants/filters';

/**
 * ListToolbar component — Search input, sort select dropdown, and mobile backup trigger
 */
export function ListToolbar({
  searchQuery,
  onSearchChange,
  onClearSearch,
  sort,
  onSortChange,
  isMobile,
  onOpenImportExport,
  searchInputRef
}) {
  return (
    <section className="list-toolbar" aria-label="Task search and sorting">
      <div className="search-box">
        <Search size={16} className="search-icon" aria-hidden="true" />
        <input
          ref={searchInputRef}
          type="search"
          id="search-input"
          data-testid="search-input"
          className="search-input"
          placeholder="Search tasks… (Press /)"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          aria-label="Search tasks by title or notes"
        />
        {searchQuery && (
          <button
            type="button"
            className="search-clear-btn"
            onClick={onClearSearch}
            aria-label="Clear search input"
            data-testid="search-clear-button"
          >
            <X size={14} />
          </button>
        )}
      </div>

      <div className="toolbar-actions" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div className="sort-select-wrap">
          <select
            id="sort-select"
            data-testid="sort-select"
            className="sort-select"
            value={sort}
            onChange={(e) => onSortChange(e.target.value)}
            aria-label="Sort tasks by"
          >
            <option value={SORT_NEWEST}>Newest first</option>
            <option value={SORT_OLDEST}>Oldest first</option>
            <option value={SORT_DUE_DATE}>Due date</option>
            <option value={SORT_PRIORITY}>Priority</option>
          </select>
          <ArrowUpDown size={14} className="sort-icon" aria-hidden="true" />
        </div>

        {/* Mobile Backup Button trigger */}
        {isMobile && (
          <button
            type="button"
            className="icon-btn mobile-backup-trigger"
            onClick={onOpenImportExport}
            aria-label="Backup and Restore Data"
            title="Backup & Restore Data"
            data-testid="mobile-backup-button"
          >
            <Database size={16} />
          </button>
        )}
      </div>
    </section>
  );
}

ListToolbar.propTypes = {
  searchQuery: PropTypes.string.isRequired,
  onSearchChange: PropTypes.func.isRequired,
  onClearSearch: PropTypes.func.isRequired,
  sort: PropTypes.string.isRequired,
  onSortChange: PropTypes.func.isRequired,
  isMobile: PropTypes.bool,
  onOpenImportExport: PropTypes.func,
  searchInputRef: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.shape({ current: PropTypes.any })
  ])
};
