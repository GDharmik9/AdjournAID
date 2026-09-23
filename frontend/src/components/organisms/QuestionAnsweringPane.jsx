import React, { useState } from 'react';
import { MessageCircleQuestion, Search, Sparkles, ArrowRight, ShieldCheck, HelpCircle } from 'lucide-react';
import { getTypography } from '../../constants/typography';

export default function QuestionAnsweringPane({
  analysisData,
  onAskQuestion,
  onVerifyInText,
  isAnalyzing,
  readingTheme = 'dark',
  fontSizeLevel = 'md',
}) {
  const isPaper = readingTheme === 'paper';
  const typography = getTypography(fontSizeLevel);
  const [questionInput, setQuestionInput] = useState('');

  const quickPills = [
    "What are my termination and notice rights?",
    "Am I liable for landlord's negligence?",
    "How does the automatic renewal work?",
    "Are operating expenses capped?",
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (questionInput.trim() && !isAnalyzing) {
      onAskQuestion(questionInput.trim());
    }
  };

  const handlePillClick = (q) => {
    setQuestionInput(q);
    onAskQuestion(q);
  };

  const qa = analysisData?.analysis || {};

  return (
    <div className="space-y-4">
      {/* Search / Ask Input Header */}
      <form onSubmit={handleSubmit} className="space-y-2">
        <div className="relative">
          <input
            type="text"
            value={questionInput}
            onChange={(e) => setQuestionInput(e.target.value)}
            placeholder="Ask anything about this contract (e.g. 'Can I terminate early?')..."
            className={`w-full pl-9 pr-24 py-2.5 rounded-xl border text-xs transition-all focus:outline-none focus:ring-2 ${
              isPaper
                ? 'bg-white border-slate-300 text-slate-800 placeholder-slate-400 focus:ring-blue-500/20 focus:border-blue-500 shadow-xs'
                : 'bg-slate-800/80 border-slate-700 text-slate-100 placeholder-slate-400 focus:ring-indigo-500/30 focus:border-indigo-500'
            }`}
          />
          <Search className="h-4 w-4 absolute left-3 top-3 text-slate-400" />
          <button
            type="submit"
            disabled={!questionInput.trim() || isAnalyzing}
            className={`absolute right-1.5 top-1.5 px-3 py-1.5 rounded-lg font-semibold text-[11px] transition-all flex items-center gap-1 ${
              questionInput.trim() && !isAnalyzing
                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs'
                : 'bg-slate-700/40 text-slate-400 cursor-not-allowed'
            }`}
          >
            <span>Ask AI</span>
            <ArrowRight className="h-3 w-3" />
          </button>
        </div>

        {/* Quick Suggestion Pills */}
        <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
          <span className="text-[10px] text-slate-400 font-medium">Try asking:</span>
          {quickPills.map((pill, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handlePillClick(pill)}
              className={`text-[10px] px-2 py-0.5 rounded-full border transition-all ${
                isPaper
                  ? 'bg-slate-100 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 text-slate-600 border-slate-200'
                  : 'bg-slate-800/60 hover:bg-indigo-900/30 hover:text-indigo-300 hover:border-indigo-700 text-slate-400 border-slate-700'
              }`}
            >
              {pill}
            </button>
          ))}
        </div>
      </form>

      {/* Answer Display */}
      {qa.direct_answer ? (
        <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className={`p-5 rounded-xl border ${
            isPaper ? 'bg-white border-blue-200 shadow-sm' : 'bg-slate-800/50 border-slate-700/80'
          }`}>
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-blue-500" />
                <span className={`text-xs font-bold uppercase tracking-wider ${isPaper ? 'text-blue-900' : 'text-blue-300'}`}>
                  Direct Legal Finding
                </span>
              </div>
              {qa.confidence_rating && (
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  isPaper ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-emerald-950/50 text-emerald-300 border-emerald-800'
                }`}>
                  {qa.confidence_rating} CONFIDENCE
                </span>
              )}
            </div>

            <p className={`${typography.body} ${isPaper ? 'text-slate-800' : 'text-slate-200'} leading-relaxed mb-3`}>
              {qa.direct_answer}
            </p>

            {/* Click-to-Verify Clause Citation Badge */}
            {qa.primary_clause_ref && (
              <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => onVerifyInText(qa.section_id || qa.primary_clause_ref, qa.primary_clause_ref)}
                  className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg border transition-all ${
                    isPaper
                      ? 'bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200'
                      : 'bg-indigo-950/60 hover:bg-indigo-900/80 text-indigo-300 border-indigo-700/60'
                  }`}
                  title="Click to locate and highlight this clause in the contract"
                >
                  <ShieldCheck className="h-3.5 w-3.5 text-blue-500" />
                  <span>Verify in Text: {qa.primary_clause_ref}</span>
                </button>
              </div>
            )}
          </div>

          {/* Supporting Evidence Excerpt */}
          {qa.supporting_snippet && (
            <div className={`p-4 rounded-xl border ${
              isPaper ? 'bg-slate-50 border-slate-200 text-slate-700' : 'bg-slate-900/60 border-slate-800 text-slate-300'
            }`}>
              <div className="text-[10px] uppercase font-bold text-slate-400 mb-1">
                Supporting Contract Excerpt:
              </div>
              <blockquote className="italic text-xs border-l-2 border-blue-500 pl-3 py-0.5">
                "{qa.supporting_snippet}"
              </blockquote>
            </div>
          )}

          {/* Practical Advice */}
          {qa.practical_advice && (
            <div className={`p-4 rounded-xl border ${
              isPaper ? 'bg-amber-50/70 border-amber-200 text-amber-900' : 'bg-amber-950/20 border-amber-900/40 text-amber-200'
            }`}>
              <div className="text-[10px] uppercase font-bold text-amber-600 mb-1 flex items-center gap-1">
                <HelpCircle className="h-3.5 w-3.5" />
                <span>Practical Recommendation:</span>
              </div>
              <p className={typography.detail}>{qa.practical_advice}</p>
            </div>
          )}

          {/* Suggested Follow-ups */}
          {qa.suggested_followups && qa.suggested_followups.length > 0 && (
            <div className="space-y-1.5 pt-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Follow-up Inquiries:
              </span>
              <div className="space-y-1">
                {qa.suggested_followups.map((f, i) => (
                  <button
                    key={i}
                    onClick={() => handlePillClick(f)}
                    className={`w-full text-left p-2 rounded-lg text-xs border transition-all flex items-center justify-between ${
                      isPaper
                        ? 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                        : 'bg-slate-800/40 hover:bg-slate-800 border-slate-700 text-slate-300'
                    }`}
                  >
                    <span>{f}</span>
                    <ArrowRight className="h-3 w-3 text-slate-400" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-10 space-y-2">
          <MessageSquareQuestion className="h-10 w-10 text-slate-400 mx-auto opacity-40" />
          <h4 className={`text-xs font-semibold ${isPaper ? 'text-slate-700' : 'text-slate-300'}`}>
            Ask Any Question About Your Agreement
          </h4>
          <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
            AdjournAID uses Summary-Augmented Chunking to extract grounded answers with verified clause references.
          </p>
        </div>
      )}
    </div>
  );
}
