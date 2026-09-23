import React from 'react';
import { ShieldAlert, BookOpen, GitCompare, FileCheck2 } from 'lucide-react';

/**
 * Molecule: TaskTabNav
 * Accessible tab navigation for the 4 CLAIM analysis modes.
 */
export default function TaskTabNav({
  activeTaskType,
  cachedTabs = {},
  onTaskChange,
  isPaper = false,
  className = '',
}) {
  const tabs = [
    {
      id: 'tab-risk-review',
      type: 'risk_review',
      label: 'Risk Review',
      icon: ShieldAlert,
      title: 'Contract Risk Review (Alt + 1)',
    },
    {
      id: 'tab-simplification',
      type: 'simplification',
      label: 'Plain English',
      icon: BookOpen,
      title: 'Plain-English Simplification (Alt + 2)',
    },
    {
      id: 'tab-redline',
      type: 'redline',
      label: 'Contract Redlines',
      icon: GitCompare,
      title: 'Side-by-Side Redlines (Alt + 3)',
    },
    {
      id: 'tab-consultation-brief',
      type: 'consultation_brief',
      label: 'Attorney Brief',
      icon: FileCheck2,
      title: 'Attorney Consultation Brief (Alt + 4)',
    },
  ];

  return (
    <div
      role="tablist"
      aria-label="CLAIM Legal Analysis Tasks"
      className={`flex items-center gap-1.5 overflow-x-auto text-xs ${className}`}
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTaskType === tab.type;
        const isPreloaded = Boolean(cachedTabs[tab.type]);

        return (
          <button
            key={tab.type}
            role="tab"
            id={tab.id}
            aria-selected={isActive}
            aria-controls="claim-analysis-panel"
            onClick={() => onTaskChange(tab.type)}
            title={isPreloaded ? `${tab.title} (Preloaded & Ready)` : tab.title}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 flex-shrink-0 relative ${
              isActive
                ? 'bg-indigo-600 text-white shadow-sm font-bold'
                : isPaper
                ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Icon className="h-3.5 w-3.5 flex-shrink-0" />
            <span>{tab.label}</span>
            {isPreloaded && !isActive && (
              <span
                className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"
                title="Analysis cached & ready instantly"
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
