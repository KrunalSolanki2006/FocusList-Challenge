import React from 'react';

/**
 * ProgressSummary component
 * Thin animated progress indicator
 * @param {{
 *  progress: { done: number, total: number, percentage: number }
 * }} props
 */
export function ProgressSummary({ progress }) {
  if (progress.total === 0) return null;

  return (
    <div
      className="progress-track"
      role="progressbar"
      aria-valuenow={progress.percentage}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`Task progress: ${progress.done} of ${progress.total} completed (${progress.percentage}%)`}
      style={{ height: '3px', margin: '0' }}
    >
      <div
        className="progress-fill"
        style={{ width: `${progress.percentage}%` }}
      />
    </div>
  );
}
