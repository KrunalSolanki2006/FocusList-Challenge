import { describe, it, expect } from 'vitest';
import { selectCounts, selectProgress, selectFilteredTasks } from '../state/selectors';
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
} from '../constants/filters';
import { PRIORITY_HIGH, PRIORITY_MEDIUM, PRIORITY_LOW, PRIORITY_NONE } from '../constants/priorities';
import { getTodayDateString } from '../utils/dates';

describe('selectors', () => {
  const today = getTodayDateString();
  const sampleTasks = [
    {
      id: 't1',
      title: 'Design Wireframes',
      notes: 'Figma prototypes',
      completed: false,
      priority: PRIORITY_HIGH,
      dueDate: today,
      createdAt: '2026-09-01T10:00:00.000Z'
    },
    {
      id: 't2',
      title: 'Fix Safari Bug',
      notes: 'Flexbox alignment',
      completed: false,
      priority: PRIORITY_LOW,
      dueDate: '2026-01-01', // overdue
      createdAt: '2026-09-02T10:00:00.000Z'
    },
    {
      id: 't3',
      title: 'Plan Sprint Roadmap',
      notes: 'Q4 deliverables',
      completed: false,
      priority: PRIORITY_MEDIUM,
      dueDate: '2026-12-31', // upcoming
      createdAt: '2026-09-03T10:00:00.000Z'
    },
    {
      id: 't4',
      title: 'Send Invoice',
      notes: '',
      completed: true,
      priority: PRIORITY_NONE,
      dueDate: today,
      createdAt: '2026-09-04T10:00:00.000Z'
    }
  ];

  describe('selectCounts', () => {
    it('computes correct counts across all quick view categories', () => {
      const counts = selectCounts(sampleTasks);
      expect(counts.total).toBe(4);
      expect(counts.active).toBe(3);
      expect(counts.completed).toBe(1);
      expect(counts.today).toBe(1); // only active tasks due today
      expect(counts.overdue).toBe(1); // t2 is overdue
      expect(counts.upcoming).toBe(1); // t3 is upcoming
    });

    it('handles empty task list gracefully', () => {
      const counts = selectCounts([]);
      expect(counts).toEqual({
        total: 0,
        active: 0,
        completed: 0,
        today: 0,
        upcoming: 0,
        overdue: 0
      });
    });
  });

  describe('selectProgress', () => {
    it('calculates progress percentage accurately', () => {
      expect(selectProgress(sampleTasks)).toEqual({
        done: 1,
        total: 4,
        percentage: 25
      });
    });

    it('returns zero for empty array', () => {
      expect(selectProgress([])).toEqual({ done: 0, total: 0, percentage: 0 });
    });
  });

  describe('selectFilteredTasks', () => {
    it('filters by status: ACTIVE and COMPLETED', () => {
      const active = selectFilteredTasks(sampleTasks, FILTER_ACTIVE);
      expect(active).toHaveLength(3);
      expect(active.every((t) => !t.completed)).toBe(true);

      const completed = selectFilteredTasks(sampleTasks, FILTER_COMPLETED);
      expect(completed).toHaveLength(1);
      expect(completed[0].id).toBe('t4');
    });

    it('filters by quick view: TODAY, UPCOMING, OVERDUE', () => {
      const todayTasks = selectFilteredTasks(sampleTasks, FILTER_TODAY);
      expect(todayTasks).toHaveLength(1);
      expect(todayTasks[0].id).toBe('t1');

      const upcomingTasks = selectFilteredTasks(sampleTasks, FILTER_UPCOMING);
      expect(upcomingTasks).toHaveLength(1);
      expect(upcomingTasks[0].id).toBe('t3');

      const overdueTasks = selectFilteredTasks(sampleTasks, FILTER_OVERDUE);
      expect(overdueTasks).toHaveLength(1);
      expect(overdueTasks[0].id).toBe('t2');
    });

    it('searches both title and notes case-insensitively', () => {
      const matchTitle = selectFilteredTasks(sampleTasks, FILTER_ALL, 'wireframes');
      expect(matchTitle).toHaveLength(1);
      expect(matchTitle[0].id).toBe('t1');

      const matchNotes = selectFilteredTasks(sampleTasks, FILTER_ALL, 'flexbox');
      expect(matchNotes).toHaveLength(1);
      expect(matchNotes[0].id).toBe('t2');
    });

    it('sorts by newest first by default', () => {
      const sorted = selectFilteredTasks(sampleTasks, FILTER_ACTIVE, '', SORT_NEWEST);
      expect(sorted[0].id).toBe('t3'); // 2026-09-03
      expect(sorted[1].id).toBe('t2'); // 2026-09-02
      expect(sorted[2].id).toBe('t1'); // 2026-09-01
    });

    it('sorts by oldest first', () => {
      const sorted = selectFilteredTasks(sampleTasks, FILTER_ACTIVE, '', SORT_OLDEST);
      expect(sorted[0].id).toBe('t1');
      expect(sorted[1].id).toBe('t2');
      expect(sorted[2].id).toBe('t3');
    });

    it('sorts by priority descending (High -> Medium -> Low -> None)', () => {
      const sorted = selectFilteredTasks(sampleTasks, FILTER_ACTIVE, '', SORT_PRIORITY);
      expect(sorted[0].priority).toBe(PRIORITY_HIGH);
      expect(sorted[1].priority).toBe(PRIORITY_MEDIUM);
      expect(sorted[2].priority).toBe(PRIORITY_LOW);
    });

    it('sorts strictly by priority across all tasks including completed tasks', () => {
      const tasksWithCompletedHigh = [
        { id: 'c1', title: 'Low Active', priority: PRIORITY_LOW, completed: false, createdAt: '2026-09-01T00:00:00.000Z' },
        { id: 'c2', title: 'High Completed', priority: PRIORITY_HIGH, completed: true, createdAt: '2026-09-02T00:00:00.000Z' }
      ];
      const sorted = selectFilteredTasks(tasksWithCompletedHigh, FILTER_ALL, '', SORT_PRIORITY);
      expect(sorted[0].id).toBe('c2'); // High Completed task must come first in priority sort
      expect(sorted[1].id).toBe('c1');
    });

    it('sorts by due date', () => {
      const sorted = selectFilteredTasks(sampleTasks, FILTER_ACTIVE, '', SORT_DUE_DATE);
      expect(sorted[0].id).toBe('t2'); // 2026-01-01
      expect(sorted[1].id).toBe('t1'); // today
      expect(sorted[2].id).toBe('t3'); // 2026-12-31
    });

    it('handles combined filter + search + sort correctly', () => {
      const results = selectFilteredTasks(sampleTasks, FILTER_ACTIVE, 'prototypes', SORT_PRIORITY);
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe('t1');
    });
  });
});

