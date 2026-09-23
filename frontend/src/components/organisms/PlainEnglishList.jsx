import React from 'react';
import CalloutBox from '../molecules/CalloutBox';
import { getTypography } from '../../constants/typography';

/**
 * Organism: PlainEnglishList
 * Mode 2: Simplified clause translations + key takeaways + actionable negotiation tips.
 */
export default function PlainEnglishList({
  simplifiedClauses = [],
  onVerifyInText,
  readingTheme = 'dark',
  fontSizeLevel = 'md',
}) {
  const isPaper = readingTheme === 'paper';
  const typography = getTypography(fontSizeLevel);

  if (!simplifiedClauses || simplifiedClauses.length === 0) {
    return (
      <div className="text-center py-12 text-slate-400 text-xs">
        No plain-English clause simplifications available for this contract.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {simplifiedClauses.map((clause, idx) => (
        <div
          key={idx}
          className={`p-5 rounded-xl border space-y-2.5 transition-all ${
            isPaper
              ? 'bg-white border-slate-200 shadow-sm'
              : 'bg-slate-800/40 border-slate-700/70'
          }`}
        >
          <div className="flex items-center justify-between">
            <span
              className={`font-bold ${typography.cardTitle} ${
                isPaper ? 'text-indigo-900' : 'text-indigo-300'
              }`}
            >
              {clause.clause_ref}
            </span>
            <button
              onClick={() => onVerifyInText(clause.clause_ref, clause.section_id)}
              className={`${typography.cardTag} font-semibold text-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-300 flex items-center gap-1`}
            >
              <span>View Clause</span> →
            </button>
          </div>

          <p
            className={`leading-relaxed font-medium ${typography.cardBody} ${
              isPaper ? 'text-slate-800' : 'text-slate-200'
            }`}
          >
            {clause.plain_english}
          </p>

          {clause.key_takeaway && (
            <CalloutBox
              title="Key Takeaway"
              variant="slate"
              isPaper={isPaper}
              typography={typography}
            >
              <span>{clause.key_takeaway}</span>
            </CalloutBox>
          )}

          {clause.actionable_tip && (
            <div
              className={`font-semibold flex items-center gap-1.5 ${typography.cardSub} ${
                isPaper ? 'text-emerald-700' : 'text-emerald-400'
              }`}
            >
              <span>💡 Tip:</span>
              <span>{clause.actionable_tip}</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
