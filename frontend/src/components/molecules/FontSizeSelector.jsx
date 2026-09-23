import React from 'react';

/**
 * Molecule: FontSizeSelector
 * Accessible button group for toggling font scaling (Small / Medium / Large).
 */
export default function FontSizeSelector({
  fontSizeLevel = 'md',
  onChange,
  isPaper = false,
  className = '',
}) {
  const options = [
    { level: 'sm', label: 'A', title: 'Small text size (12px)', class: 'text-xs' },
    { level: 'md', label: 'A', title: 'Medium text size (14px - Default)', class: 'text-sm' },
    { level: 'lg', label: 'A', title: 'Large text size (16-18px - Magnified)', class: 'text-base' },
  ];

  return (
    <div
      role="group"
      aria-label="Text size selector"
      className={`flex items-center gap-1 px-2 py-1 rounded-lg border text-xs ${
        isPaper
          ? 'bg-slate-100 border-slate-200 text-slate-600'
          : 'bg-slate-800/80 border-slate-700 text-slate-300'
      } ${className}`}
    >
      <span className="text-[10px] uppercase font-bold text-slate-400 mr-0.5">Text:</span>
      {options.map((opt) => (
        <button
          key={opt.level}
          onClick={() => onChange(opt.level)}
          aria-pressed={fontSizeLevel === opt.level}
          title={opt.title}
          aria-label={opt.title}
          className={`px-1.5 py-0.5 rounded font-bold transition-all ${opt.class} ${
            fontSizeLevel === opt.level
              ? isPaper
                ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-slate-200'
                : 'bg-slate-700 text-indigo-400 shadow-sm'
              : 'hover:text-indigo-500'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
