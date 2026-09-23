import React from 'react';

/**
 * Atomic MetricStat Component
 * Displays key analytical figures (time saved, fee savings) with custom icon and typography tokens.
 */
export default function MetricStat({
  icon,
  label,
  value,
  isPaper = false,
  variant = 'indigo', // 'indigo' or 'emerald'
  typography = {},
  className = '',
}) {
  const iconThemes = {
    indigo: isPaper
      ? 'bg-indigo-50 text-indigo-600'
      : 'bg-indigo-950/60 text-indigo-400 border border-indigo-800/40',
    emerald: isPaper
      ? 'bg-emerald-50 text-emerald-600'
      : 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/40',
  }[variant] || 'bg-indigo-50 text-indigo-600';

  const valueThemes = {
    indigo: isPaper ? 'text-slate-900' : 'text-white',
    emerald: isPaper ? 'text-emerald-700' : 'text-emerald-400',
  }[variant] || (isPaper ? 'text-slate-900' : 'text-white');

  return (
    <div
      className={`p-4 rounded-xl border flex items-center gap-3.5 transition-all ${
        isPaper
          ? 'bg-white border-slate-200 shadow-sm'
          : 'bg-slate-800/50 border-slate-700/70'
      } ${className}`}
    >
      <div className={`h-11 w-11 rounded-xl flex items-center justify-center flex-shrink-0 ${iconThemes}`}>
        {icon}
      </div>
      <div>
        <div
          className={`${typography.tag || 'text-[11px]'} uppercase tracking-wider font-semibold ${
            isPaper ? 'text-slate-500' : 'text-slate-400'
          }`}
        >
          {label}
        </div>
        <div className={`${typography.metricVal || 'text-xl font-bold'} ${valueThemes}`}>
          {value}
        </div>
      </div>
    </div>
  );
}
