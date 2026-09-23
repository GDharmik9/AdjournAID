import React from 'react';

/**
 * Molecule: ThemeToggle
 * Segmented button for toggling between Warm Paper (☀️) and Soft Dark (🌙) reading modes.
 */
export default function ThemeToggle({
  readingTheme = 'dark',
  onChange,
  className = '',
}) {
  const isPaper = readingTheme === 'paper';

  return (
    <div
      role="group"
      aria-label="Reading theme toggle"
      className={`flex items-center rounded-lg p-0.5 border text-xs ${
        isPaper
          ? 'bg-slate-100 border-slate-200 text-slate-700'
          : 'bg-slate-800/80 border-slate-700 text-slate-300'
      } ${className}`}
    >
      <button
        type="button"
        onClick={() => onChange('paper')}
        aria-pressed={isPaper}
        className={`px-2.5 py-1 rounded-md transition-all font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
          isPaper
            ? 'bg-white text-slate-900 shadow-sm font-semibold'
            : 'text-slate-400 hover:text-white'
        }`}
        title="Warm Paper Mode (Alt + T)"
        aria-label="Switch to Warm Paper reading theme"
      >
        ☀️ Warm Paper
      </button>
      <button
        type="button"
        onClick={() => onChange('dark')}
        aria-pressed={!isPaper}
        className={`px-2.5 py-1 rounded-md transition-all font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
          !isPaper
            ? 'bg-slate-700 text-white shadow-sm font-semibold'
            : 'text-slate-600 hover:text-slate-900'
        }`}
        title="Soft Dark Mode (Alt + T)"
        aria-label="Switch to Soft Dark reading theme"
      >
        🌙 Soft Dark
      </button>
    </div>
  );
}
