import React from 'react';
import MarginRiskCard from '../MarginRiskCard';
import { getTypography } from '../../constants/typography';

/**
 * Organism: RiskReviewList
 * Mode 1: Executive Risk Overview summary + MarginRiskCard list.
 */
export default function RiskReviewList({
  analysis,
  onVerifyInText,
  readingTheme = 'dark',
  fontSizeLevel = 'md',
}) {
  const isPaper = readingTheme === 'paper';
  const typography = getTypography(fontSizeLevel);
  const riskItems = analysis?.risk_items || [];

  return (
    <div className="space-y-4">
      {/* Executive Risk Overview */}
      {analysis?.document_summary && (
        <div
          className={`p-6 rounded-xl border leading-relaxed ${typography.cardBody} ${
            isPaper
              ? 'bg-white border-slate-200 text-slate-700 shadow-sm'
              : 'bg-slate-800/50 border-slate-700 text-slate-300'
          }`}
        >
          <strong
            className={`block mb-1.5 ${typography.cardTitle} ${
              isPaper ? 'text-slate-900' : 'text-white'
            }`}
          >
            Executive Risk Overview:
          </strong>
          <p className={typography.cardBody}>{analysis.document_summary}</p>
        </div>
      )}

      {/* Risk Items Cards */}
      {riskItems.length > 0 ? (
        riskItems.map((item, idx) => (
          <MarginRiskCard
            key={idx}
            item={item}
            onVerifyClick={onVerifyInText}
            themeMode={readingTheme}
            fontSizeLevel={fontSizeLevel}
          />
        ))
      ) : (
        <div className="text-center py-12 text-slate-400 text-xs">
          No high or off-market risks detected in current contract view.
        </div>
      )}
    </div>
  );
}
