import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { IconButton } from './IconButton';

/**
 * Accessible Modal Dialog / Bottom Sheet
 * @param {{
 *  isOpen: boolean,
 *  onClose: () => void,
 *  title: string,
 *  children: React.ReactNode,
 *  triggerRef?: React.RefObject<HTMLElement>
 * }} props
 */
export function Dialog({
  isOpen,
  onClose,
  title,
  children,
  triggerRef
}) {
  const dialogRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    // Lock body scroll
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Focus trap and key listener
    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }

      if (e.key === 'Tab') {
        if (!dialogRef.current) return;
        const focusableElements = dialogRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown);

    // Initial focus into dialog
    const timer = setTimeout(() => {
      if (dialogRef.current) {
        const firstInput = dialogRef.current.querySelector('input, textarea, button');
        if (firstInput) {
          firstInput.focus();
        }
      }
    }, 50);

    return () => {
      document.body.style.overflow = originalOverflow;
      document.removeEventListener('keydown', handleKeyDown);
      clearTimeout(timer);

      // Return focus to trigger element
      if (triggerRef && triggerRef.current) {
        triggerRef.current.focus();
      }
    };
  }, [isOpen, onClose, triggerRef]);

  if (!isOpen) return null;

  return (
    <div
      className="dialog-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      role="presentation"
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-heading"
        className="dialog-modal"
      >
        <div className="dialog-header">
          <h2 id="dialog-heading" className="dialog-title">
            {title}
          </h2>
          <IconButton
            aria-label="Close dialog"
            onClick={onClose}
          >
            <X size={18} />
          </IconButton>
        </div>
        {children}
      </div>
    </div>
  );
}
