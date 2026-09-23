import React from 'react';

/**
 * Atomic Badge Component
 * Handles color-coded risk tags (RED/AMBER/BLUE/CRITICAL), LeMAJ indicators, and status chips.
 */
export default function Badge({
  children,
  variant = 'default',
  size = 'md',
  className = '',
  icon = null,
}) {
  const sizeClasses = {
    sm: 'text-[10px] px-2 py-0.5',
    md: 'text-[11px] px-2.5 py-0.5',
    lg: 'text-xs px-3 py-1',
  }[size] || 'text-[11px] px-2.5 py-0.5';

  const variantClasses = {
    red: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/50',
    amber: 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/50',
    blue: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800/50',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/50',
    indigo: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800/50',
    default: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
  }[variant] || variantClasses.default;

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-semibold tracking-wide rounded-full border transition-colors ${sizeClasses} ${variantClasses} ${className}`}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
}
