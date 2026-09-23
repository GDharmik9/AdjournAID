import React from 'react';
import { Search, X } from 'lucide-react';

/**
 * Atomic SearchInput Component
 * Text search input with integrated search icon, clear button, match counter, and accessible label.
 */
export default function SearchInput({
  value,
  onChange,
  onClear,
  placeholder = 'Search...',
  ariaLabel = 'Search text',
  matchCount = null,
  isPaper = false,
  className = '',
}) {
  return (
    <div className={`relative flex items-center ${className}`}>
      <Search className="absolute left-2.5 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={ariaLabel}
        className={`w-full pl-8 pr-8 py-1 text-xs rounded-lg border transition-all focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
          isPaper
            ? 'bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400'
            : 'bg-slate-800/80 border-slate-700 text-slate-200 placeholder:text-slate-500'
        }`}
      />
      {value && (
        <button
          onClick={onClear}
          aria-label="Clear search"
          className="absolute right-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
      {matchCount !== null && value && (
        <span className="absolute right-7 text-[10px] font-bold text-indigo-500 pointer-events-none">
          {matchCount}
        </span>
      )}
    </div>
  );
}
