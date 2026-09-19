import React, { useState, useMemo, useRef, useCallback } from 'react';
import { Search, X, ArrowUpDown, Clock, CheckCircle2, AlertTriangle, Sparkles, Database } from 'lucide-react';
import { useTasks } from './hooks/useTasks';
import { useToast } from './hooks/useToast';
import { useTheme } from './hooks/useTheme';
import { useMediaQuery } from './hooks/useMediaQuery';
import { useHotkeys } from './hooks/useHotkeys';
import { selectCounts, selectProgress, selectFilteredTasks } from './state/selectors';
import { loadPrefsFromStorage, savePrefsToStorage } from './utils/storage';
import {
  FILTER_ALL,
  FILTER_ACTIVE,
  FILTER_COMPLETED,
  FILTER_TODAY,
  FILTER_UPCOMING,
  FILTER_OVERDUE,
  SORT_NEWEST,
  SORT_OLDEST,
  SORT_DUE_DATE,
  SORT_PRIORITY
} from './constants/filters';

import { AppHeader } from './components/layout/AppHeader';
import { Sidebar } from './components/layout/Sidebar';
import { MobileFilterBar } from './components/layout/MobileFilterBar';
import { ListToolbar } from './components/layout/ListToolbar';

import { TaskComposer } from './components/tasks/TaskComposer';
import { TaskList } from './components/tasks/TaskList';
import { TaskEditDialog } from './components/tasks/TaskEditDialog';
import { ImportExportDialog } from './components/tasks/ImportExportDialog';
import { BulkActionBar } from './components/tasks/BulkActionBar';
import { EmptyState } from './components/tasks/EmptyState';
import { ProgressSummary } from './components/tasks/ProgressSummary';
import { StorageBanner } from './components/tasks/StorageBanner';
import { ToastRegion } from './components/ui/ToastRegion';

export function App() {
  const {
    state,
    addTask,
    toggleTask,
    updateTask,
    deleteTask,
    bulkComplete,
    bulkDelete,
    clearCompleted,
    restoreLastAction,
    restoreDeleted,
    restoreCleared,
    importTasks,
    dismissNotice
  } = useTasks();

  const { toasts, showToast, dismissToast, pauseTimer, resumeTimer } = useToast();
  const { theme, resolvedTheme, toggleTheme } = useTheme();

  const isMobile = useMediaQuery('(max-width: 767px)');

  // Initialise preferences from storage
  const [prefs, setPrefs] = useState(() => loadPrefsFromStorage());
  const filter = prefs.filter;
  const sort = prefs.sort;

  const [searchQuery, setSearchQuery] = useState('');
  const [editingTask, setEditingTask] = useState(null);
  const editTriggerRef = useRef(null);

  const [isImportExportOpen, setIsImportExportOpen] = useState(false);
  const backupTriggerRef = useRef(null);

  // Multi-select state
  const [selectedIds, setSelectedIds] = useState(() => new Set());

  const composerInputRef = useRef(null);
  const searchInputRef = useRef(null);

  // Stable tasks ref to prevent handler recreation and eliminate unnecessary child re-renders
  const tasksRef = useRef(state.tasks);
  tasksRef.current = state.tasks;

  // Derived calculations with useMemo
  const counts = useMemo(() => selectCounts(state.tasks), [state.tasks]);
  const progress = useMemo(() => selectProgress(state.tasks), [state.tasks]);
  const filteredTasks = useMemo(
    () => selectFilteredTasks(state.tasks, filter, searchQuery, sort),
    [state.tasks, filter, searchQuery, sort]
  );

  // Clean up selectedIds if any selected tasks no longer exist in state.tasks
  const validSelectedIds = useMemo(() => {
    const taskIds = new Set(state.tasks.map((t) => t.id));
    const next = new Set();
    selectedIds.forEach((id) => {
      if (taskIds.has(id)) next.add(id);
    });
    return next;
  }, [state.tasks, selectedIds]);

  // Save preferences changes
  const updateFilter = useCallback((newFilter) => {
    setPrefs((prev) => {
      const next = { ...prev, filter: newFilter };
      savePrefsToStorage(next);
      return next;
    });
  }, []);

  const updateSort = useCallback((newSort) => {
    setPrefs((prev) => {
      const next = { ...prev, sort: newSort };
      savePrefsToStorage(next);
      return next;
    });
  }, []);

  // Multi-select handlers
  const handleToggleSelect = useCallback((id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const handleToggleSelectAllVisible = useCallback(() => {
    setSelectedIds((prev) => {
      const visibleIds = filteredTasks.map((t) => t.id);
      const allVisibleSelected = visibleIds.length > 0 && visibleIds.every((id) => prev.has(id));
      const next = new Set(prev);
      if (allVisibleSelected) {
        visibleIds.forEach((id) => next.delete(id));
      } else {
        visibleIds.forEach((id) => next.add(id));
      }
      return next;
    });
  }, [filteredTasks]);

  const handleClearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  // Action handlers with zero task dependencies
  const handleAddTask = useCallback((taskData) => {
    addTask(taskData);
  }, [addTask]);

  const handleToggle = useCallback((id) => {
    toggleTask(id);
  }, [toggleTask]);

  const handleDelete = useCallback((id) => {
    const task = tasksRef.current.find((t) => t.id === id);
    deleteTask(id);
    setSelectedIds((prev) => {
      if (!prev.has(id)) return prev;
      const next = new Set(prev);
      next.delete(id);
      return next;
    });

    showToast({
      message: `Deleted "${task?.title || 'task'}"`,
      action: {
        label: 'Undo',
        onClick: () => restoreLastAction()
      }
    });
  }, [deleteTask, showToast, restoreLastAction]);

  const handleBulkComplete = useCallback(() => {
    setSelectedIds((currentSelected) => {
      if (currentSelected.size === 0) return currentSelected;
      const ids = Array.from(currentSelected);
      bulkComplete(ids);
      showToast({
        message: `Marked ${ids.length} ${ids.length === 1 ? 'task' : 'tasks'} completed`
      });
      return new Set();
    });
  }, [bulkComplete, showToast]);

  const handleBulkDelete = useCallback(() => {
    setSelectedIds((currentSelected) => {
      if (currentSelected.size === 0) return currentSelected;
      const ids = Array.from(currentSelected);
      bulkDelete(ids);
      showToast({
        message: `Deleted ${ids.length} ${ids.length === 1 ? 'task' : 'tasks'}`,
        action: {
          label: 'Undo',
          onClick: () => restoreLastAction()
        }
      });
      return new Set();
    });
  }, [bulkDelete, showToast, restoreLastAction]);

  const handleClearCompleted = useCallback(() => {
    const completedCount = tasksRef.current.filter((t) => t.completed).length;
    if (completedCount === 0) return;

    clearCompleted();

    showToast({
      message: `Cleared ${completedCount} completed ${completedCount === 1 ? 'task' : 'tasks'}`,
      action: {
        label: 'Undo',
        onClick: () => restoreLastAction()
      }
    });
  }, [clearCompleted, showToast, restoreLastAction]);

  const handleOpenEdit = useCallback((task, triggerRef) => {
    editTriggerRef.current = triggerRef?.current;
    setEditingTask(task);
  }, []);

  const handleSaveEdit = useCallback((updatedData) => {
    updateTask(updatedData);
    showToast({
      message: 'Task updated'
    });
  }, [updateTask, showToast]);

  const handleOpenImportExport = useCallback((triggerRef) => {
    backupTriggerRef.current = triggerRef?.current;
    setIsImportExportOpen(true);
  }, []);

  const handleImport = useCallback((payload) => {
    importTasks(payload);
    showToast({
      message: `Successfully imported ${payload.tasks.length} tasks (${payload.mode})`
    });
  }, [importTasks, showToast]);

  // Global keyboard shortcuts: N, /, Esc
  useHotkeys({
    onNewTask: () => {
      composerInputRef.current?.focus();
    },
    onSearch: () => {
      searchInputRef.current?.focus();
    },
    onEscape: () => {
      if (validSelectedIds.size > 0) {
        setSelectedIds(new Set());
      } else if (searchQuery) {
        setSearchQuery('');
        searchInputRef.current?.blur();
      } else if (editingTask) {
        setEditingTask(null);
      } else if (isImportExportOpen) {
        setIsImportExportOpen(false);
      }
    }
  });

  return (
    <div className="app-shell">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      <AppHeader
        theme={theme}
        resolvedTheme={resolvedTheme}
        onToggleTheme={toggleTheme}
        onOpenImportExport={handleOpenImportExport}
      />

      {/* Slim progress bar on mobile directly under header */}
      {isMobile && <ProgressSummary progress={progress} />}

      <div className="workspace-container">
        {/* Left desktop rail */}
        <Sidebar
          currentFilter={filter}
          onFilterChange={updateFilter}
          counts={counts}
          progress={progress}
          onClearCompleted={handleClearCompleted}
          onOpenImportExport={handleOpenImportExport}
        />

        {/* Main Column */}
        <main id="main-content" className="main-column" tabIndex={-1} aria-label="Tasks management">
          {/* Storage recovery / private mode notice */}
          <StorageBanner
            isCorrupted={state.isCorrupted}
            isBlocked={state.isBlocked}
            onDismiss={dismissNotice}
          />

          {/* Task Composer */}
          <TaskComposer
            onAddTask={handleAddTask}
            inputRef={composerInputRef}
          />

          {/* Mobile Filter Bar */}
          {isMobile && (
            <MobileFilterBar
              currentFilter={filter}
              onFilterChange={updateFilter}
              counts={counts}
              onClearCompleted={handleClearCompleted}
            />
          )}

          {/* Quick Metrics Bar (Shown when tasks exist) */}
          {counts.total > 0 && (
            <div className="metrics-bar">
              <div className="metric-pill">
                <Clock size={13} color="var(--primary)" />
                <span>{counts.active} Pending</span>
              </div>

              <div className="metric-pill metric-completed">
                <CheckCircle2 size={13} color="var(--emerald)" />
                <span>{counts.completed} Completed</span>
              </div>

              {counts.overdue > 0 && (
                <div className="metric-pill metric-overdue">
                  <AlertTriangle size={13} />
                  <span>{counts.overdue} Overdue</span>
                </div>
              )}
            </div>
          )}

          {/* List Toolbar (Search, Sort & Backup) */}
          <ListToolbar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onClearSearch={() => setSearchQuery('')}
            sort={sort}
            onSortChange={updateSort}
            isMobile={isMobile}
            onOpenImportExport={handleOpenImportExport}
            searchInputRef={searchInputRef}
          />

          {/* Screen reader search announcement */}
          {searchQuery && (
            <div className="visually-hidden" role="status" aria-live="polite">
              {filteredTasks.length} {filteredTasks.length === 1 ? 'result' : 'results'} found for "{searchQuery}"
            </div>
          )}

          {/* Bulk Action Bar (Visible when tasks are selected) */}
          <BulkActionBar
            selectedCount={validSelectedIds.size}
            onCompleteSelected={handleBulkComplete}
            onDeleteSelected={handleBulkDelete}
            onClearSelection={handleClearSelection}
          />

          {/* Ruled Task List or Empty State */}
          {filteredTasks.length === 0 ? (
            <EmptyState
              filter={filter}
              searchQuery={searchQuery}
              totalTasks={counts.total}
              onClearSearch={() => setSearchQuery('')}
            />
          ) : (
            <TaskList
              tasks={filteredTasks}
              selectedIds={validSelectedIds}
              onToggleSelect={handleToggleSelect}
              onToggleSelectAll={handleToggleSelectAllVisible}
              onToggle={handleToggle}
              onEdit={handleOpenEdit}
              onDelete={handleDelete}
            />
          )}
        </main>
      </div>

      {/* Overlays */}
      <ToastRegion
        toasts={toasts}
        onDismiss={dismissToast}
        onPause={pauseTimer}
        onResume={resumeTimer}
      />

      <TaskEditDialog
        isOpen={Boolean(editingTask)}
        onClose={() => setEditingTask(null)}
        task={editingTask}
        onSave={handleSaveEdit}
        triggerRef={editTriggerRef}
      />

      <ImportExportDialog
        isOpen={isImportExportOpen}
        onClose={() => setIsImportExportOpen(false)}
        tasks={state.tasks}
        onImport={handleImport}
        triggerRef={backupTriggerRef}
      />
    </div>
  );
}
