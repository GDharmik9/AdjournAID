import React, { useState } from 'react';
import { Clock, DollarSign, AlertOctagon, HelpCircle, Check, Copy, Printer, Award } from 'lucide-react';
import MetricStat from './atoms/MetricStat';
import { getTypography } from '../constants/typography';

export default function ConsultationBrief({
  brief,
  onVerifyClause,
  themeMode = 'dark',
  fontSizeLevel = 'md',
}) {
  const isPaper = themeMode === 'paper';
  const [copied, setCopied] = useState(false);
  const typography = getTypography(fontSizeLevel);

  if (!brief) return null;

  const handleCopy = () => {
    const text = `
# ATTORNEY CONSULTATION PREPARATION BRIEF
${brief.brief_title || 'Contract Review Brief'}

CLIENT SUMMARY:
${brief.client_summary || ''}

ESTIMATED SAVINGS:
- Hours Saved: ${brief.estimated_hours_saved || '2-3 hours'}
- Cost Savings: ${brief.estimated_cost_savings || '$700+'}

TOP RED FLAGS:
${(brief.top_red_flags || []).map((r, i) => `${i + 1}. [${r.severity || 'CRITICAL'}] ${r.clause_ref}: ${r.issue}\n   Talking Point: ${r.counsel_talking_point}`).join('\n\n')}

KEY QUESTIONS FOR COUNSEL:
${(brief.questions_for_attorney || []).map((q, i) => `${i + 1}. ${q}`).join('\n')}

CLIENT NEGOTIATION LEVERAGE:
${(brief.client_leverage_points || []).map((l, i) => `• ${l}`).join('\n')}
    `.trim();

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Savings & Efficiency Metric Bar */}
      <div className="grid grid-cols-2 gap-3">
        <MetricStat
          icon={<Clock className="h-5 w-5" />}
          label="Estimated Time Saved"
          value={brief.estimated_hours_saved || '2.5 - 3.5 Hours'}
          isPaper={isPaper}
          variant="indigo"
          typography={typography}
        />
        <MetricStat
          icon={<DollarSign className="h-5 w-5" />}
          label="Estimated Fee Savings"
          value={brief.estimated_cost_savings || '$875 - $1,225'}
          isPaper={isPaper}
          variant="emerald"
          typography={typography}
        />
      </div>

      {/* Brief Header & Export Controls */}
      <div className={`p-5 rounded-xl border ${
        isPaper ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-800/50 border-slate-700/80'
      }`}>
        <div className="flex items-center justify-between gap-3 mb-2">
          <div className="flex items-center gap-2">
            <Award className="h-4 w-4 text-amber-500" />
            <h3 className={`${typography.title} ${isPaper ? 'text-slate-900' : 'text-slate-100'}`}>
              {brief.brief_title || 'Attorney Consultation Preparation Brief'}
            </h3>
          </div>
          <button
            onClick={handleCopy}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg ${typography.btn} font-semibold border transition-all ${
              isPaper
                ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                : 'bg-slate-700/60 hover:bg-slate-700 text-slate-200 border-slate-600'
            }`}
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5 opacity-70" />}
            <span>{copied ? 'Copied to Clipboard' : 'Copy Brief'}</span>
          </button>
        </div>
        <p className={`${typography.body} ${isPaper ? 'text-slate-600' : 'text-slate-300'}`}>
          {brief.client_summary}
        </p>
      </div>

      {/* Top Red Flags Section */}
      <div className="space-y-2.5">
        <div className={`flex items-center gap-1.5 ${typography.sectionTitle} uppercase tracking-wider ${
          isPaper ? 'text-rose-700' : 'text-rose-400'
        }`}>
          <AlertOctagon className="h-4 w-4" />
          <span>Priority Red Flags to Contest</span>
        </div>

        {brief.top_red_flags && brief.top_red_flags.map((flag, idx) => (
          <div
            key={idx}
            className={`p-4 rounded-xl border space-y-1.5 ${typography.detail} ${
              isPaper
                ? 'bg-white border-rose-200 shadow-sm text-slate-800'
                : 'bg-rose-950/20 border-rose-900/40 text-slate-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className={`font-bold ${typography.title} ${isPaper ? 'text-rose-900' : 'text-rose-300'}`}>
                {flag.clause_ref}
              </span>
              <span className={`px-2 py-0.5 rounded-full ${typography.tag} font-extrabold border ${
                isPaper
                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                  : 'bg-rose-500/20 text-rose-400 border-rose-500/30'
              }`}>
                {flag.severity || 'CRITICAL'}
              </span>
            </div>
            <p className={`${typography.body} ${isPaper ? 'text-slate-700' : 'text-slate-300'}`}>{flag.issue}</p>
            {flag.counsel_talking_point && (
              <div className={`pt-1.5 ${typography.detail} font-medium ${
                isPaper ? 'text-amber-800' : 'text-amber-300/90'
              }`}>
                <strong>Counsel Talking Point:</strong> {flag.counsel_talking_point}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* High-Value Questions for Legal Counsel */}
      <div className="space-y-2.5">
        <div className={`flex items-center gap-1.5 ${typography.sectionTitle} uppercase tracking-wider ${
          isPaper ? 'text-indigo-800' : 'text-indigo-400'
        }`}>
          <HelpCircle className="h-4 w-4" />
          <span>Prioritized Questions for Your Attorney</span>
        </div>

        <div className={`p-4 rounded-xl border space-y-2.5 ${
          isPaper ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-800/40 border-slate-700/70'
        }`}>
          {brief.questions_for_attorney && brief.questions_for_attorney.map((q, idx) => (
            <div key={idx} className={`flex items-start gap-2 ${typography.body} ${
              isPaper ? 'text-slate-700' : 'text-slate-300'
            }`}>
              <span className={`font-bold flex-shrink-0 ${isPaper ? 'text-indigo-600' : 'text-indigo-400'}`}>
                {idx + 1}.
              </span>
              <span>{q}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Negotiation Leverage Points */}
      {brief.client_leverage_points && brief.client_leverage_points.length > 0 && (
        <div className="space-y-2.5">
          <div className={`${typography.sectionTitle} uppercase tracking-wider ${
            isPaper ? 'text-emerald-800' : 'text-emerald-400'
          }`}>
            Client Negotiation Leverage
          </div>
          <div className={`p-4 rounded-xl border space-y-2 ${
            isPaper ? 'bg-emerald-50/60 border-emerald-200 shadow-sm' : 'bg-emerald-950/20 border-emerald-900/40'
          }`}>
            {brief.client_leverage_points.map((pt, idx) => (
              <div key={idx} className={`flex items-start gap-2 ${typography.body} ${
                isPaper ? 'text-emerald-950' : 'text-emerald-200'
              }`}>
                <span className="text-emerald-600 font-bold">•</span>
                <span>{pt}</span>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
