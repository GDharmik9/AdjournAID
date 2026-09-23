import React from 'react';
import { Link2, Unlink2 } from 'lucide-react';

/**
 * Molecule: SyncScrollToggle
 * Button to toggle linked proportional synchronized scrolling.
 */
export default function SyncScrollToggle({
  isSyncEnabled,
  onToggle,
  isPaper = false,
  className = '',
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={isSyncEnabled}
      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
        isSyncEnabled
          ? isPaper
            ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
            : 'bg-indigo-950/40 text-indigo-300 border-indigo-800/60'
          : isPaper
          ? 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
          : 'bg-slate-800/60 text-slate-400 border-slate-700 hover:bg-slate-800'
      } ${className}`}
      title="Toggle Linked Synchronized Scrolling (Alt + S)"
      aria-label="Toggle linked synchronized scrolling"
    >
      {isSyncEnabled ? (
        <>
          <Link2 className="h-3.5 w-3.5 text-indigo-500" />
          <span className="hidden md:inline">Linked Scroll</span>
        </>
      ) : (
        <>
          <Unlink2 className="h-3.5 w-3.5 text-slate-400" />
          <span className="hidden md:inline">Unlinked</span>
        </>
      )}
    </button>
  );
}
