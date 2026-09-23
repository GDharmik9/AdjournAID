import React, { useState } from 'react';
import { CheckCircle2, AlertTriangle, HelpCircle, ShieldAlert, ChevronDown } from 'lucide-react';

export default function LeMAJBadge({ verification }) {
  const [showDetails, setShowDetails] = useState(false);

  if (!verification) return null;

  const isGrounded = verification.grounded_status;
  const scorePercent = Math.round((verification.score || 0) * 100);
  const counts = verification.counts || { correct: 0, incorrect: 0, irrelevant: 0 };
  const totalLdps = verification.total_ldps || 0;

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setShowDetails(!showDetails)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
          isGrounded
            ? 'bg-emerald-950/40 text-emerald-300 border-emerald-700/50 hover:bg-emerald-900/40'
            : 'bg-amber-950/40 text-amber-300 border-amber-700/50 hover:bg-amber-900/40'
        }`}
      >
        {isGrounded ? (
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
        ) : (
          <AlertTriangle className="h-4 w-4 text-amber-400" />
        )}
        <span>{verification.badge_text || (isGrounded ? 'Verified Grounded' : 'Verification Required')}</span>
        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
          isGrounded ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
        }`}>
          {scorePercent}%
        </span>
        <ChevronDown className="h-3 w-3 opacity-70" />
      </button>

      {/* LeMAJ LDP Fact-Checking Audit Tooltip / Modal */}
      {showDetails && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-3 z-50 text-left">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
            <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              LeMAJ Verification Layer
            </span>
            <span className="text-[10px] text-slate-400">Legal LLM-as-a-Judge</span>
          </div>

          <p className="text-[11px] text-slate-300 mb-3">
            Decomposed AI claims into <strong className="text-white">{totalLdps} atomic Legal Data Points (LDPs)</strong> checked directly against source clauses to prevent hallucination.
          </p>

          <div className="grid grid-cols-3 gap-2 mb-3 text-center">
            <div className="p-2 rounded-lg bg-emerald-950/40 border border-emerald-900/50">
              <div className="text-xs font-bold text-emerald-400">{counts.correct}</div>
              <div className="text-[10px] text-emerald-300/70">Correct</div>
            </div>
            <div className="p-2 rounded-lg bg-red-950/40 border border-red-900/50">
              <div className="text-xs font-bold text-red-400">{counts.incorrect}</div>
              <div className="text-[10px] text-red-300/70">Incorrect</div>
            </div>
            <div className="p-2 rounded-lg bg-slate-800/60 border border-slate-700/50">
              <div className="text-xs font-bold text-slate-300">{counts.irrelevant}</div>
              <div className="text-[10px] text-slate-400">Irrelevant</div>
            </div>
          </div>

          <div className="text-[10px] text-slate-400 border-t border-slate-800/80 pt-2 flex items-center justify-between">
            <span>Threshold for Grounded: 85%</span>
            <button
              onClick={() => setShowDetails(false)}
              className="text-blue-400 hover:underline text-[10px]"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
