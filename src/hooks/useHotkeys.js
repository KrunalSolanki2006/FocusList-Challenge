import { useEffect } from 'react';

/**
 * Global keyboard shortcuts hook
 * @param {{
 *   onNewTask?: () => void,
 *   onSearch?: () => void,
 *   onEscape?: () => void
 * }} handlers 
 */
export function useHotkeys({ onNewTask, onSearch, onEscape }) {
  useEffect(() => {
    function handleKeyDown(event) {
      const target = event.target;
      const isInput =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable;

      // Escape works everywhere
      if (event.key === 'Escape') {
        if (typeof onEscape === 'function') {
          onEscape();
        }
        return;
      }

      // If user is typing inside an input/textarea, ignore 'n' and '/'
      if (isInput) return;

      if (event.key === 'n' || event.key === 'N') {
        event.preventDefault();
        if (typeof onNewTask === 'function') {
          onNewTask();
        }
      } else if (event.key === '/') {
        event.preventDefault();
        if (typeof onSearch === 'function') {
          onSearch();
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onNewTask, onSearch, onEscape]);
}
