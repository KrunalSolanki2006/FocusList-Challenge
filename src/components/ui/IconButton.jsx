import React from 'react';

/**
 * Accessible Icon Button component
 * @param {{
 *  'aria-label': string,
 *  isDanger?: boolean,
 *  className?: string,
 *  children: React.ReactNode,
 *  title?: string,
 *  [key: string]: any
 * }} props
 */
export function IconButton({
  'aria-label': ariaLabel,
  isDanger = false,
  className = '',
  children,
  title,
  type = 'button',
  disabled = false,
  ...props
}) {
  if (!ariaLabel) {
    console.warn('IconButton requires an aria-label for accessibility');
  }

  const dangerClass = isDanger ? 'icon-btn-danger' : '';

  return (
    <button
      type={type}
      aria-label={ariaLabel}
      title={title || ariaLabel}
      disabled={disabled}
      className={`icon-btn ${dangerClass} ${className}`.trim()}
      {...props}
    >
      {children}
    </button>
  );
}
