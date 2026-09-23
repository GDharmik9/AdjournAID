import React from 'react';

/**
 * Molecule: CalloutBox
 * Reusable insight container for takeaways, counter-proposals, tips, and legal implications.
 */
export default function CalloutBox({
  title,
  children,
  icon = null,
  variant = 'amber', // 'amber', 'indigo', 'emerald', 'slate'
  isPaper = false,
  typography = {},
  className = '',
}) {
  const variantStyles = {
    amber: isPaper
      ? 'bg-amber-50/70 border-amber-200/80 text-amber-900'
      : 'bg-slate-900/70 border-slate-700/70 text-slate-300',
    indigo: isPaper
      ? 'bg-indigo-50/70 border-indigo-200/80 text-indigo-950'
      : 'bg-indigo-950/30 border-indigo-800/40 text-indigo-200',
    emerald: isPaper
      ? 'bg-emerald-50/70 border-emerald-200/80 text-emerald-950'
      : 'bg-emerald-950/20 border-emerald-900/30 text-emerald-200',
    slate: isPaper
      ? 'bg-slate-100/80 border-slate-200 text-slate-700'
      : 'bg-slate-900/60 border-slate-800 text-slate-300',
  }[variant] || variantStyles.slate;

  const headerColors = {
    amber: 'text-amber-600 dark:text-amber-400',
    indigo: 'text-indigo-600 dark:text-indigo-400',
    emerald: 'text-emerald-600 dark:text-emerald-400',
    slate: isPaper ? 'text-slate-900' : 'text-white',
  }[variant] || 'text-slate-500';

  return (
    <div className={`p-3.5 rounded-lg border ${variantStyles} ${typography.box || ''} ${className}`}>
      {title && (
        <div
          className={`flex items-center gap-1.5 font-semibold ${typography.tag || 'text-xs'} uppercase tracking-wider mb-1 ${headerColors}`}
        >
          {icon && <span className="flex-shrink-0">{icon}</span>}
          <span>{title}</span>
        </div>
      )}
      <div>{children}</div>
    </div>
  );
}
