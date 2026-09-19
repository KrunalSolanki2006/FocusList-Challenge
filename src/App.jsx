import React, { useState, useMemo, useRef, useCallback } from 'react';
import { Search, X, ArrowUpDown, Clock, CheckCircle2, AlertTriangle, Sparkles } from 'lucide-react';
import { useTasks } from './hooks/useTasks';
import { useToast } from './hooks/useToast';
import { useMediaQuery } from './hooks/useMediaQuery';
import { useHotkeys } from './hooks/useHotkeys';
import { selectCounts, selectProgress, selectFilteredTasks } from './state/selectors';
import { loadPrefsFromStorage, savePrefsToStorage } from './utils/storage';
import { FILTER_ALL, SORT_NEWEST, SORT_DUE_DATE, SORT_PRIORITY } from './constants/filters';

import { AppHeader } from './components/layout/AppHeader';
import { Sidebar } from './components/layout/Sidebar';
import { MobileFilterBar } from './components/layout/MobileFilterBar';

import { TaskComposer } from './components/tasks/TaskComposer';
import { TaskList } from './components/tasks/TaskList';
import { TaskEditDialog } from './components/tasks/TaskEditDialog';
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
    clearCompleted,
    restoreDeleted,
    restoreCleared,
    importTasks,
    dismissNotice
  } = useTasks();

  const { toasts, showToast, dismissToast, pauseTimer, resumeTimer } = useToast();

  const isMobile = useMediaQuery('(max-width: 767px)');

  // Initialise preferences from storage
  const [prefs, setPrefs] = useState(() => loadPrefsFromStorage());
  const filter = prefs.filter;
  const sort = prefs.sort;

  const [searchQuery, setSearchQuery] = useState('');
  const [editingTask, setEditingTask] = useState(null);
  const editTriggerRef = useRef(null);

  const composerInputRef = useRef(null);
  const searchInputRef = useRef(null);

  // Derived calculations with useMemo
  const counts = useMemo(() => selectCounts(state.tasks), [state.tasks]);
  const progress = useMemo(() => selectProgress(state.tasks), [state.tasks]);
  const filteredTasks = useMemo(
    () => selectFilteredTasks(state.tasks, filter, searchQuery, sort),
    [state.tasks, filter, searchQuery, sort]
  );

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

  // Action handlers
  const handleAddTask = useCallback((taskData) => {
    addTask(taskData);
  }, [addTask]);

  const handleToggle = useCallback((id) => {
    toggleTask(id);
  }, [toggleTask]);

  const handleDelete = useCallback((id) => {
    const task = state.tasks.find((t) => t.id === id);
    deleteTask(id);

    showToast({
      message: `Deleted "${task?.title || 'task'}"`,
      action: {
        label: 'Undo',
        onClick: () => restoreDeleted()
      }
    });
  }, [state.tasks, deleteTask, showToast, restoreDeleted]);

  const handleClearCompleted = useCallback(() => {
    const completedCount = counts.completed;
    if (completedCount === 0) return;

    clearCompleted();

    showToast({
      message: `Cleared ${completedCount} completed ${completedCount === 1 ? 'task' : 'tasks'}`,
      action: {
        label: 'Undo',
        onClick: () => restoreCleared()
      }
    });
  }, [counts.completed, clearCompleted, showToast, restoreCleared]);

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

  // Global keyboard shortcuts: N, /, Esc
  useHotkeys({
    onNewTask: () => {
      composerInputRef.current?.focus();
    },
    onSearch: () => {
      searchInputRef.current?.focus();
    },
    onEscape: () => {
      if (searchQuery) {
        setSearchQuery('');
        searchInputRef.current?.blur();
      } else if (editingTask) {
        setEditingTask(null);
      }
    }
  });

  return (
    <div className="app-shell">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      <AppHeader />

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
        />

        {/* Main Column */}
        <main id="main-content" className="main-column" tabIndex={-1}>
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

          {/* List Toolbar (Search & Sort) */}
          <div className="list-toolbar">
            <div className="search-box">
              <Search size={16} className="search-icon" />
              <input
                ref={searchInputRef}
                type="search"
                className="search-input"
                placeholder="Search tasks… (Press /)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Search tasks by title or notes"
              />
              {searchQuery && (
                <button
                  type="button"
                  className="search-clear-btn"
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search input"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <div className="sort-select-wrap">
              <select
                className="sort-select"
                value={sort}
                onChange={(e) => updateSort(e.target.value)}
                aria-label="Sort tasks by"
              >
                <option value={SORT_NEWEST}>Newest first</option>
                <option value={SORT_DUE_DATE}>Due date</option>
                <option value={SORT_PRIORITY}>Priority</option>
              </select>
              <ArrowUpDown size={14} className="sort-icon" />
            </div>
          </div>

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
    </div>
  );
}
