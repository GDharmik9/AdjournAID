import React from 'react';
import { GitCompare, Scale, AlertTriangle, CheckCircle, Info, ShieldAlert } from 'lucide-react';
import { getTypography } from '../../constants/typography';

export default function PolicyComparisonList({
  comparisonData,
  onVerifyInText,
  readingTheme = 'dark',
  fontSizeLevel = 'md',
}) {
  const isPaper = readingTheme === 'paper';
  const typography = getTypography(fontSizeLevel);
  const data = comparisonData || {};
  const items = data.comparison_items || [];

  const getVarianceBadge = (variance) => {
    const v = (variance || '').toUpperCase();
    if (v === 'HOSTILE') {
      return isPaper
        ? 'bg-rose-100 text-rose-800 border-rose-200'
        : 'bg-rose-950/50 text-rose-300 border-rose-800/80';
    } else if (v === 'OFF-MARKET') {
      return isPaper
        ? 'bg-amber-100 text-amber-800 border-amber-200'
        : 'bg-amber-950/50 text-amber-300 border-amber-800/80';
    } else if (v === 'FAVORABLE') {
      return isPaper
        ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
        : 'bg-emerald-950/50 text-emerald-300 border-emerald-800/80';
    }
    return isPaper
      ? 'bg-slate-100 text-slate-700 border-slate-200'
      : 'bg-slate-800 text-slate-300 border-slate-700';
  };

  return (
    <div className="space-y-4">
      {/* Overview Card */}
      <div className={`p-4 rounded-xl border ${
        isPaper ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-800/50 border-slate-700/80'
      }`}>
        <div className="flex items-center justify-between gap-3 mb-1.5">
          <div className="flex items-center gap-2">
            <Scale className="h-4 w-4 text-indigo-500" />
            <h3 className={`${typography.title} ${isPaper ? 'text-slate-900' : 'text-slate-100'}`}>
              {data.comparison_title || 'Market Baseline Benchmark'}
            </h3>
          </div>
          {data.market_alignment_score !== undefined && (
            <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
              data.market_alignment_score > 70
                ? isPaper ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : 'bg-emerald-950/50 text-emerald-300 border-emerald-800'
                : isPaper ? 'bg-amber-100 text-amber-800 border-amber-200' : 'bg-amber-950/50 text-amber-300 border-amber-800'
            }`}>
              Market Alignment: {data.market_alignment_score}%
            </span>
          )}
        </div>
        <p className={`${typography.body} ${isPaper ? 'text-slate-600' : 'text-slate-300'}`}>
          {data.summary || 'Comparative evaluation of contract provisions against commercial baseline standards.'}
        </p>
      </div>

      {/* Comparison Items Table / Cards */}
      <div className="space-y-3">
        {items.map((item, idx) => (
          <div
            key={idx}
            className={`p-4 rounded-xl border space-y-3 transition-all ${
              isPaper ? 'bg-white border-slate-200 shadow-2xs' : 'bg-slate-800/40 border-slate-700/70'
            }`}
          >
            {/* Card Header */}
            <div className="flex items-center justify-between gap-2">
              <span className={`font-bold ${typography.title} ${isPaper ? 'text-slate-900' : 'text-slate-100'}`}>
                {item.term_category}
              </span>
              <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border uppercase tracking-wider ${getVarianceBadge(item.variance_rating)}`}>
                {item.variance_rating || 'STANDARD'}
              </span>
            </div>

            {/* Comparison Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
              {/* This Contract's Term */}
              <div className={`p-3 rounded-lg border ${
                isPaper ? 'bg-rose-50/50 border-rose-100 text-slate-800' : 'bg-rose-950/20 border-rose-900/30 text-slate-200'
              }`}>
                <div className="text-[10px] uppercase font-bold text-rose-500 mb-1 flex items-center justify-between">
                  <span>This Contract</span>
                  {item.clause_ref && (
                    <button
                      type="button"
                      onClick={() => onVerifyInText(item.clause_ref, item.clause_ref)}
                      className="text-blue-500 hover:underline"
                    >
                      {item.clause_ref}
                    </button>
                  )}
                </div>
                <p className={typography.detail}>{item.this_contract_term}</p>
              </div>

              {/* Fair Market Standard */}
              <div className={`p-3 rounded-lg border ${
                isPaper ? 'bg-emerald-50/50 border-emerald-100 text-slate-800' : 'bg-emerald-950/20 border-emerald-900/30 text-slate-200'
              }`}>
                <div className="text-[10px] uppercase font-bold text-emerald-500 mb-1">
                  Fair Market Standard
                </div>
                <p className={typography.detail}>{item.market_standard_term}</p>
              </div>
            </div>

            {/* Negotiation Recommendation */}
            {item.negotiation_tip && (
              <div className={`p-2.5 rounded-lg border text-xs flex items-start gap-2 ${
                isPaper ? 'bg-amber-50/60 border-amber-200 text-amber-900' : 'bg-amber-950/20 border-amber-900/40 text-amber-200'
              }`}>
                <Info className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
                <span className={typography.detail}>
                  <strong>Negotiation Strategy:</strong> {item.negotiation_tip}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
