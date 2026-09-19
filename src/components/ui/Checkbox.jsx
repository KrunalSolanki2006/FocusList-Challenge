import React, { useRef, useEffect } from 'react';
import { Check, Minus } from 'lucide-react';
import { VisuallyHidden } from './VisuallyHidden';

/**
 * Custom accessible Checkbox component
 * @param {{
 *  checked: boolean,
 *  indeterminate?: boolean,
 *  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void,
 *  id?: string,
 *  'aria-labelledby'?: string,
 *  'aria-label'?: string,
 *  disabled?: boolean,
 *  className?: string
 * }} props
 */
export function Checkbox({
  checked,
  indeterminate = false,
  onChange,
  id,
  'aria-labelledby': ariaLabelledby,
  'aria-label': ariaLabel,
  disabled = false,
  className = '',
  'data-testid': dataTestId,
  ...rest
}) {
  const inputRef = useRef(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.indeterminate = Boolean(indeterminate);
    }
  }, [indeterminate]);

  return (
    <label
      className={`task-checkbox-wrap ${className}`.trim()}
      htmlFor={id}
      data-testid={dataTestId ? `${dataTestId}-wrap` : undefined}
    >
      <VisuallyHidden>
        <input
          ref={inputRef}
          type="checkbox"
          id={id}
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          aria-labelledby={ariaLabelledby}
          aria-label={ariaLabel}
          data-testid={dataTestId}
          {...rest}
        />
      </VisuallyHidden>
      <span
        aria-hidden="true"
        className={`custom-checkbox ${checked ? 'is-checked' : ''} ${indeterminate ? 'is-indeterminate' : ''}`}
      >
        {indeterminate ? (
          <Minus className="custom-checkbox-icon" size={14} strokeWidth={3} />
        ) : (
          <Check className="custom-checkbox-icon" size={14} strokeWidth={3} />
        )}
      </span>
    </label>
  );
}
