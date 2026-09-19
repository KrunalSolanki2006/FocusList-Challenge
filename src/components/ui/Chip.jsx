import React from 'react';

/**
 * Chip component for tags and interactive filter badges
 * @param {{
 *  active?: boolean,
 *  onClick?: () => void,
 *  children: React.ReactNode,
 *  className?: string
 * }} props
 */
export function Chip({
  active = false,
  onClick,
  children,
  className = '',
  ...props
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`chip ${active ? 'is-active' : ''} ${className}`.trim()}
      {...props}
    >
      {children}
    </button>
  );
}
