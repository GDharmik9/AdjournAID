import React from 'react';
import { HelpCircle } from 'lucide-react';
import Kbd from '../atoms/Kbd';

/**
 * Organism: ShortcutsModal
 * Accessible dialog explaining keyboard shortcuts available in AdjournAID.
 */
export default function ShortcutsModal({ isOpen, onClose, isPaper = false }) {
  if (!isOpen) return null;

  const shortcuts = [
    { label: 'Risk Review Tab', shortcut: 'Alt + 1' },
    { label: 'Plain English Tab', shortcut: 'Alt + 2' },
    { label: 'Contract Redlines Tab', shortcut: 'Alt + 3' },
    { label: 'Attorney Consultation Brief', shortcut: 'Alt + 4' },
    { label: 'Toggle Linked Scroll Sync', shortcut: 'Alt + S' },
    { label: 'Toggle Reading Theme (Warm / Dark)', shortcut: 'Alt + T' },
    { label: 'Find & Highlight Source Clause', shortcut: 'Enter / Space' },
    { label: 'Open / Close Shortcuts Dialog', shortcut: '?' },
    { label: 'Dismiss Dialogs / Clear Focus', shortcut: 'Esc' },
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="shortcuts-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className={`w-full max-w-md rounded-2xl border p-6 shadow-2xl transition-all ${
          isPaper
            ? 'bg-white border-slate-200 text-slate-900'
            : 'bg-slate-900 border-slate-800 text-slate-100'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b pb-3 mb-4">
          <h3 id="shortcuts-dialog-title" className="text-sm font-bold flex items-center gap-2">
            <HelpCircle className="h-4 w-4 text-indigo-500" />
            <span>AdjournAID Keyboard Shortcuts</span>
          </h3>
          <button
            onClick={onClose}
            className="text-xs px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-white"
            aria-label="Close shortcuts dialog"
          >
            Esc
          </button>
        </div>

        <div className="space-y-2.5 text-xs">
          {shortcuts.map((s, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800/80"
            >
              <span className="text-slate-500 dark:text-slate-400">{s.label}</span>
              <Kbd>{s.shortcut}</Kbd>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
