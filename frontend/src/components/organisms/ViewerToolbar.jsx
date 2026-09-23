import React from 'react';
import { HelpCircle } from 'lucide-react';
import TaskTabNav from '../molecules/TaskTabNav';
import ThemeToggle from '../molecules/ThemeToggle';
import FontSizeSelector from '../molecules/FontSizeSelector';
import SyncScrollToggle from '../molecules/SyncScrollToggle';
import LeMAJBadge from '../LeMAJBadge';

/**
 * Organism: ViewerToolbar
 * Composes TaskTabNav, ThemeToggle, FontSizeSelector, LeMAJBadge, SyncScrollToggle, and Shortcuts trigger.
 */
export default function ViewerToolbar({
  activeTaskType,
  onTaskChange,
  readingTheme,
  onThemeChange,
  fontSizeLevel,
  onFontSizeChange,
  isSyncEnabled,
  onToggleSync,
  lemajVerification,
  onOpenShortcuts,
}) {
  const isPaper = readingTheme === 'paper';

  return (
    <div
      className={`px-4 py-2 border-b flex flex-wrap items-center justify-between gap-3 transition-colors ${
        isPaper ? 'bg-white border-slate-200 shadow-2xs' : 'bg-slate-900 border-slate-800'
      }`}
    >
      {/* 4 CLAIM Navigation Tabs */}
      <TaskTabNav
        activeTaskType={activeTaskType}
        onTaskChange={onTaskChange}
        isPaper={isPaper}
      />

      {/* Center/Right Controls: Theme, Font Scale, LeMAJ, Sync, Shortcuts */}
      <div className="flex items-center gap-2.5 flex-wrap">
        <ThemeToggle
          readingTheme={readingTheme}
          onChange={onThemeChange}
        />

        <FontSizeSelector
          fontSizeLevel={fontSizeLevel}
          onChange={onFontSizeChange}
          isPaper={isPaper}
        />

        {lemajVerification && <LeMAJBadge verification={lemajVerification} />}

        <SyncScrollToggle
          isSyncEnabled={isSyncEnabled}
          onToggle={onToggleSync}
          isPaper={isPaper}
        />

        <button
          type="button"
          onClick={onOpenShortcuts}
          className={`p-1.5 rounded-lg border transition-all ${
            isPaper
              ? 'bg-slate-100 hover:bg-slate-200 text-slate-600 border-slate-200'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
          }`}
          title="Keyboard Shortcuts (?)"
          aria-label="View Keyboard Shortcuts"
        >
          <HelpCircle className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
