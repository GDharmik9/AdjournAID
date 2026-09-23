import React from 'react';

/**
 * Template: DualPaneTemplate
 * 2-column split layout scaffolding for contract review.
 * Contains toolbar slot, left contract slot, right analysis slot, and modal slot.
 */
export default function DualPaneTemplate({
  toolbar,
  leftPane,
  rightPane,
  modal = null,
  isPaper = false,
}) {
  return (
    <div
      className={`flex flex-col h-[calc(100vh-96px)] ${
        isPaper ? 'bg-[#F5F5F0] text-slate-900' : 'bg-slate-950 text-slate-100'
      }`}
    >
      {/* Sub-Header Toolbar Slot */}
      {toolbar}

      {/* 2-Column Split Content Grid */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 overflow-hidden">
        {leftPane}
        {rightPane}
      </div>

      {/* Optional Modal Slot */}
      {modal}
    </div>
  );
}
