import React from 'react';

/**
 * Atomic Kbd Component
 * Styled keyboard shortcut badge.
 */
export default function Kbd({ children, className = '' }) {
  return (
    <kbd
      className={`px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono text-xs font-bold text-slate-700 dark:text-slate-300 shadow-2xs ${className}`}
    >
      {children}
    </kbd>
  );
}
