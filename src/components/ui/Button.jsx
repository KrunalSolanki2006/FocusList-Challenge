import React from 'react';

/**
 * Reusable Button component
 * @param {{
 *  variant?: 'primary' | 'secondary' | 'ghost' | 'ghost-danger',
 *  size?: 'default' | 'sm',
 *  type?: 'button' | 'submit' | 'reset',
 *  className?: string,
 *  children: React.ReactNode,
 *  [key: string]: any
 * }} props
 */
export function Button({
  variant = 'secondary',
  size = 'default',
  type = 'button',
  className = '',
  children,
  disabled = false,
  ...props
}) {
  const variantClass = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    ghost: 'btn-ghost',
    'ghost-danger': 'btn-ghost-danger'
  }[variant] || 'btn-secondary';

  const sizeClass = size === 'sm' ? 'btn-sm' : '';

  return (
    <button
      type={type}
      disabled={disabled}
      className={`btn ${variantClass} ${sizeClass} ${className}`.trim()}
      {...props}
    >
      {children}
    </button>
  );
}
