import React from 'react';
import { Sparkles, RefreshCw } from 'lucide-react';
import RiskReviewList from './RiskReviewList';
import PlainEnglishList from './PlainEnglishList';
import RedlinesList from './RedlinesList';
import ConsultationBrief from '../ConsultationBrief';
import QuestionAnsweringPane from './QuestionAnsweringPane';
import PolicyComparisonList from './PolicyComparisonList';
import { getTypography } from '../../constants/typography';

/**
 * Organism: ClaimAnalysisPane
 * Right pane of DualPaneViewer: exposure score header, loading state, and dynamic router for all 6 CLAIM analysis modes.
 */
export default function ClaimAnalysisPane({
  analysisData,
  activeTaskType,
  isAnalyzing,
  rightPaneRef,
  onScroll,
  onVerifyInText,
  onAskQuestion,
  readingTheme = 'dark',
  fontSizeLevel = 'md',
}) {
  const isPaper = readingTheme === 'paper';
  const typography = getTypography(fontSizeLevel);
  const analysis = analysisData?.analysis || {};

  return (
    <section
      id="claim-analysis-panel"
      role="tabpanel"
      aria-label="CLAIM Analysis & Insights"
      className={`flex flex-col h-full overflow-hidden ${
        isPaper ? 'bg-[#F9F9F7]' : 'bg-slate-900/30'
      }`}
    >
      {/* Right Pane Header */}
      <div
        className={`p-3 p-3.5 border-b flex items-center justify-between ${
          isPaper ? 'bg-white border-slate-200' : 'bg-slate-900/80 border-slate-800'
        }`}
      >
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-amber-500" />
          <span
            className={`text-xs font-bold uppercase tracking-wider font-display ${
              isPaper ? 'text-slate-800' : 'text-slate-200'
            }`}
          >
            CLAIM Analysis & Insights
          </span>
        </div>

        {/* Contract Exposure Risk Meter */}
        {analysis.overall_risk_score !== undefined && activeTaskType === 'risk_review' && (
          <div className="flex items-center gap-2">
            <span className={`text-[11px] ${isPaper ? 'text-slate-500' : 'text-slate-400'}`}>
              Contract Exposure:
            </span>
            <span
              className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                analysis.overall_risk_score > 70
                  ? isPaper
                    ? 'bg-rose-100 text-rose-800 border border-rose-200'
                    : 'bg-rose-950/50 text-rose-300 border border-rose-800/60'
                  : isPaper
                  ? 'bg-amber-100 text-amber-800 border border-amber-200'
                  : 'bg-amber-950/50 text-amber-300 border border-amber-800/60'
              }`}
            >
              {analysis.overall_risk_score}/100
            </span>
          </div>
        )}
      </div>

      {/* Right Pane Scroll Container with cascading font size */}
      <div
        ref={rightPaneRef}
        onScroll={onScroll}
        className={`flex-1 p-5 md:p-6 overflow-y-auto space-y-4 transition-all ${typography.container}`}
      >
        {isAnalyzing ? (
          <div className="flex flex-col items-center justify-center h-64 space-y-3">
            <RefreshCw className="h-8 w-8 text-indigo-500 animate-spin" />
            <div className={`text-xs font-semibold ${isPaper ? 'text-slate-800' : 'text-slate-200'}`}>
              Decomposing Legal Data Points & Verifying Claims...
            </div>
            <div className="text-[11px] text-slate-400 max-w-xs text-center">
              Summary-Augmented Chunks are being cross-referenced with the LeMAJ fact-checking layer.
            </div>
          </div>
        ) : (
          <>
            {/* Mode 1: Contract Risk Review */}
            {activeTaskType === 'risk_review' && (
              <RiskReviewList
                analysis={analysis}
                onVerifyInText={onVerifyInText}
                readingTheme={readingTheme}
                fontSizeLevel={fontSizeLevel}
              />
            )}

            {/* Mode 2: Plain-English Simplification */}
            {activeTaskType === 'simplification' && (
              <PlainEnglishList
                simplifiedClauses={analysis.simplified_clauses}
                onVerifyInText={onVerifyInText}
                readingTheme={readingTheme}
                fontSizeLevel={fontSizeLevel}
              />
            )}

            {/* Mode 3: Side-by-Side Redlines */}
            {activeTaskType === 'redline' && (
              <RedlinesList
                redlines={analysis.redlines || analysis.proposed_redlines || analysis.redline_items || []}
                onVerifyInText={onVerifyInText}
                readingTheme={readingTheme}
                fontSizeLevel={fontSizeLevel}
              />
            )}

            {/* Mode 4: Attorney Consultation Brief */}
            {activeTaskType === 'consultation_brief' && (
              <ConsultationBrief
                brief={analysis}
                onVerifyClause={onVerifyInText}
                themeMode={readingTheme}
                fontSizeLevel={fontSizeLevel}
              />
            )}

            {/* Mode 5: Interactive Contract Q&A */}
            {activeTaskType === 'qa_query' && (
              <QuestionAnsweringPane
                analysisData={analysisData}
                onAskQuestion={onAskQuestion}
                onVerifyInText={onVerifyInText}
                isAnalyzing={isAnalyzing}
                readingTheme={readingTheme}
                fontSizeLevel={fontSizeLevel}
              />
            )}

            {/* Mode 6: Contract & Policy Baseline Comparison */}
            {activeTaskType === 'comparison' && (
              <PolicyComparisonList
                comparisonData={analysis}
                onVerifyInText={onVerifyInText}
                readingTheme={readingTheme}
                fontSizeLevel={fontSizeLevel}
              />
            )}
          </>
        )}
      </div>
    </section>
  );
}
