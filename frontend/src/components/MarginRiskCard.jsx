import React from 'react';
import { AlertCircle, AlertTriangle, CheckCircle2, ArrowRight, BookOpen, ExternalLink } from 'lucide-react';

import { getTypography } from '../constants/typography';

export default function MarginRiskCard({
  item,
  onVerifyClick,
  isHighlighted,
  themeMode = 'dark',
  fontSizeLevel = 'md',
}) {
  const isPaper = themeMode === 'paper';
  const riskLevel = item.risk_level?.toUpperCase() || 'BLUE';
  const typography = getTypography(fontSizeLevel);


  const riskConfig = {
    RED: {
      label: 'High Risk • Unilateral Terms',
      badgeClass: isPaper
        ? 'bg-rose-50 text-rose-700 border-rose-200'
        : 'bg-rose-950/40 text-rose-300 border-rose-800/50',
      borderClass: isPaper
        ? 'border-l-4 border-l-rose-500 bg-white border-slate-200'
        : 'border-l-4 border-l-rose-500 bg-slate-800/40 border-slate-700/70',
      icon: <AlertCircle className="h-4 w-4 text-rose-500 flex-shrink-0" />,
      accentText: isPaper ? 'text-rose-800 font-semibold' : 'text-rose-300 font-medium',
    },
    AMBER: {
      label: 'Off-Market • Review Advised',
      badgeClass: isPaper
        ? 'bg-amber-50 text-amber-800 border-amber-200'
        : 'bg-amber-950/40 text-amber-300 border-amber-800/50',
      borderClass: isPaper
        ? 'border-l-4 border-l-amber-500 bg-white border-slate-200'
        : 'border-l-4 border-l-amber-500 bg-slate-800/40 border-slate-700/70',
      icon: <AlertTriangle className="h-4 w-4 text-amber-500 flex-shrink-0" />,
      accentText: isPaper ? 'text-amber-900 font-semibold' : 'text-amber-300 font-medium',
    },
    BLUE: {
      label: 'Standard Boilerplate',
      badgeClass: isPaper
        ? 'bg-sky-50 text-sky-700 border-sky-200'
        : 'bg-sky-950/40 text-sky-300 border-sky-800/50',
      borderClass: isPaper
        ? 'border-l-4 border-l-sky-500 bg-white border-slate-200'
        : 'border-l-4 border-l-sky-500 bg-slate-800/40 border-slate-700/70',
      icon: <CheckCircle2 className="h-4 w-4 text-sky-500 flex-shrink-0" />,
      accentText: isPaper ? 'text-sky-800 font-semibold' : 'text-sky-300 font-medium',
    },
  };

  const config = riskConfig[riskLevel] || riskConfig.BLUE;

  return (
    <div
      tabIndex={0}
      role="button"
      aria-label={`Risk Card: ${item.clause_title || item.clause_ref}. Severity: ${config.label}. Press Enter or Space to highlight clause in text.`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onVerifyClick(item.clause_ref, item.section_id);
        }
      }}
      className={`rounded-xl border p-6 transition-all duration-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${config.borderClass} ${
        isHighlighted
          ? 'ring-2 ring-indigo-500 shadow-lg shadow-indigo-500/10'
          : isPaper
          ? 'hover:shadow-md hover:border-slate-300'
          : 'hover:border-slate-600'
      }`}
    >

      {/* Top Bar: Risk Tag & Action Button */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          {config.icon}
          <span className={`${typography.badge} font-semibold tracking-wide px-2.5 py-0.5 rounded-full border ${config.badgeClass}`}>
            {config.label}
          </span>
        </div>

        {/* Click to Verify in Source Document */}
        <button
          onClick={() => onVerifyClick(item.clause_ref, item.section_id)}
          className={`${typography.btn} font-semibold px-2.5 py-1 rounded-lg flex items-center gap-1.5 transition-all ${
            isPaper
              ? 'bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-600 border border-slate-200'
              : 'bg-slate-700/50 hover:bg-indigo-950/60 text-slate-300 hover:text-indigo-300 border border-slate-600/60'
          }`}
          title="Scroll and highlight clause in original contract"
        >
          <span>Find in Text</span>
          <ExternalLink className="h-3 w-3 opacity-75" />
        </button>
      </div>

      {/* Clause Title */}
      <h4 className={`${typography.title} mb-2 ${isPaper ? 'text-slate-900' : 'text-slate-100'}`}>
        {item.clause_title || item.clause_ref}
      </h4>

      {/* Plain-English Explanation */}
      <p className={`${typography.body} mb-3 ${isPaper ? 'text-slate-700' : 'text-slate-300'}`}>
        {item.summary || item.plain_english}
      </p>

      {/* Legal Implication & Financial Exposure */}
      {item.implication && (
        <div className={`mb-3 p-3.5 rounded-lg ${typography.box} ${
          isPaper
            ? 'bg-amber-50/70 border border-amber-200/80 text-amber-900'
            : 'bg-slate-900/70 border border-slate-700/70 text-slate-300'
        }`}>
          <div className={`flex items-center gap-1.5 font-semibold ${typography.tag} uppercase tracking-wider mb-1 text-amber-600 dark:text-amber-400`}>
            <span>What This Means For You:</span>
          </div>
          <span>{item.implication}</span>
        </div>
      )}

      {/* Counter-Proposal & Attorney Talking Point */}
      {item.counter_proposal && (
        <div className={`p-3.5 rounded-lg ${typography.box} ${
          isPaper
            ? 'bg-indigo-50/70 border border-indigo-200/80 text-indigo-950'
            : 'bg-indigo-950/30 border border-indigo-800/40 text-indigo-200'
        }`}>
          <div className={`flex items-center gap-1 font-semibold ${typography.tag} uppercase tracking-wider mb-1 text-indigo-600 dark:text-indigo-400`}>
            <ArrowRight className="h-3.5 w-3.5 flex-shrink-0" />
            <span>Recommended Counter-Proposal:</span>
          </div>
          <span className="italic">{item.counter_proposal}</span>
        </div>
      )}


      {/* Atomic LDP Grounded indicator */}
      {item.ldps && item.ldps.length > 0 && (
        <div className={`mt-3 pt-2.5 border-t flex items-center justify-between ${typography.tag} ${
          isPaper ? 'border-slate-100 text-slate-500' : 'border-slate-700/50 text-slate-400'
        }`}>
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
            <span>LeMAJ Grounded ({item.ldps.filter(l => l.tag === '<Correct>').length}/{item.ldps.length} facts verified)</span>
          </span>
          <span className={`${typography.tag} uppercase font-semibold text-slate-400`}>Fact-Checked</span>
        </div>
      )}
    </div>
  );
}
