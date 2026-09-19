import React from 'react';
import { Check } from 'lucide-react';
import { VisuallyHidden } from './VisuallyHidden';

/**
 * Custom accessible Checkbox component
 * @param {{
 *  checked: boolean,
 *  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void,
 *  id?: string,
 *  'aria-labelledby'?: string,
 *  'aria-label'?: string,
 *  disabled?: boolean
 * }} props
 */
export function Checkbox({
  checked,
  onChange,
  id,
  'aria-labelledby': ariaLabelledby,
  'aria-label': ariaLabel,
  disabled = false
}) {
  return (
    <label className="task-checkbox-wrap" htmlFor={id}>
      <VisuallyHidden>
        <input
          type="checkbox"
          id={id}
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          aria-labelledby={ariaLabelledby}
          aria-label={ariaLabel}
        />
      </VisuallyHidden>
      <span
        aria-hidden="true"
        className={`custom-checkbox ${checked ? 'is-checked' : ''}`}
      >
        <Check className="custom-checkbox-icon" size={14} strokeWidth={3} />
      </span>
    </label>
  );
}
