import React from 'react';
import { getTypography } from '../../constants/typography';

/**
 * Organism: RedlinesList
 * Mode 3: Side-by-side original disproportionate clauses vs recommended balanced redlines.
 */
export default function RedlinesList({
  redlines = [],
  onVerifyInText,
  readingTheme = 'dark',
  fontSizeLevel = 'md',
}) {
  const isPaper = readingTheme === 'paper';
  const typography = getTypography(fontSizeLevel);

  if (!redlines || redlines.length === 0) {
    return (
      <div className="text-center py-12 text-slate-400 text-xs">
        No redline counter-proposals suggested for this contract.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {redlines.map((redline, idx) => (
        <div
          key={idx}
          className={`p-5 rounded-xl border space-y-3.5 ${
            isPaper
              ? 'bg-white border-slate-200 shadow-sm'
              : 'bg-slate-800/40 border-slate-700/70'
          }`}
        >
          <div className="flex items-center justify-between">
            <span
              className={`font-bold ${typography.cardTitle} ${
                isPaper ? 'text-slate-900' : 'text-slate-100'
              }`}
            >
              {redline.clause_ref || redline.clause_title || redline.title || 'Target Clause'}
            </span>
            <button
              onClick={() => onVerifyInText(redline.clause_ref || redline.clause_title, redline.section_id)}
              className={`${typography.cardTag} font-semibold text-indigo-500 hover:underline`}
            >
              Highlight Original →
            </button>
          </div>

          <div>
            <div
              className={`${typography.cardTag} uppercase font-bold text-rose-500 mb-1 tracking-wider`}
            >
              Original Disproportionate Clause
            </div>
            <div
              className={`p-3.5 rounded-lg line-through ${typography.cardSub} ${
                isPaper
                  ? 'bg-rose-50 border border-rose-200 text-rose-900'
                  : 'bg-rose-950/20 border border-rose-900/30 text-rose-300/80'
              }`}
            >
              {redline.original_text || redline.original || redline.current_text || 'Original clause text referenced'}
            </div>
          </div>

          <div>
            <div
              className={`${typography.cardTag} uppercase font-bold text-emerald-600 dark:text-emerald-400 mb-1 tracking-wider`}
            >
              Recommended Balanced Redline
            </div>
            <div
              className={`p-3.5 rounded-lg underline decoration-emerald-500/70 font-medium ${typography.cardBody} ${
                isPaper
                  ? 'bg-emerald-50 border border-emerald-200 text-emerald-950'
                  : 'bg-emerald-950/20 border border-emerald-900/30 text-emerald-200'
              }`}
            >
              {redline.proposed_redline || redline.redline || redline.counter_proposal || redline.recommended_text}
            </div>
          </div>

          <div
            className={`italic leading-relaxed ${typography.cardSub} ${
              isPaper ? 'text-slate-600' : 'text-slate-400'
            }`}
          >
            <strong>Negotiation Rationale:</strong> {redline.rationale || redline.implication || redline.explanation || 'Provides commercially balanced protections.'}
          </div>
        </div>
      ))}
    </div>
  );
}
