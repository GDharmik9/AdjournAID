import React from 'react';
import { AlertCircle } from 'lucide-react';

/**
 * Template: MainLayout
 * Application-level layout shell: Skip link, Navbar slot, Error notification banner,
 * Main Content viewport slot, and Modal mount slot.
 */
export default function MainLayout({
  navbar,
  errorMessage,
  onDismissError,
  children,
  modals = null,
}) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 font-sans">
      {/* WCAG Accessibility Skip Link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[9999] focus:px-4 focus:py-2 focus:bg-indigo-600 focus:text-white focus:rounded-lg focus:shadow-xl text-xs font-bold outline-none ring-2 ring-white"
      >
        Skip to main content
      </a>

      {/* Navigation Bar Slot */}
      {navbar}

      {/* Error Alert Bar */}
      {errorMessage && (
        <div
          role="alert"
          aria-live="assertive"
          className="bg-rose-950/70 border-b border-rose-800/80 px-4 py-2 text-xs text-rose-200 flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-rose-400 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button
            onClick={onDismissError}
            className="text-rose-300 hover:text-white underline text-xs font-medium focus:outline-none focus:ring-1 focus:ring-rose-400 rounded px-1"
            aria-label="Dismiss error notification"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Screen Reader Status Announcer (WCAG 2.1 AA) */}
      <div
        id="a11y-status-announcer"
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      />

      {/* Main Content Area */}
      <main id="main-content" className="flex-1 overflow-hidden" tabIndex="-1">
        {children}
      </main>

      {/* Modals Slot */}
      {modals}
    </div>
  );
}
