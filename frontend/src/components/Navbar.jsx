import React from 'react';
import { Scale, ShieldCheck, Trash2, FileText, Upload, Sparkles, AlertCircle } from 'lucide-react';

export default function Navbar({
  documentTitle,
  sessionId,
  activeProvider = 'fallback',
  onProviderChange,
  onUploadClick,
  onLoadSample,
  onPurgeSession,
  isPurging,
}) {
  const providerNames = {
    gemini: { label: 'Gemini 2.0 Flash', badge: 'Vertex AI', color: 'text-sky-400 bg-sky-950/40 border-sky-800/60' },
    vertex_ai: { label: 'Gemini 2.0 Flash', badge: 'Vertex AI', color: 'text-sky-400 bg-sky-950/40 border-sky-800/60' },
    local_saul_lm: { label: 'SaulLM-7B', badge: 'vLLM Air-Gapped', color: 'text-purple-400 bg-purple-950/40 border-purple-800/60' },
    fallback: { label: 'CLAIM Legal Engine', badge: 'ZDR Offline', color: 'text-indigo-400 bg-indigo-950/40 border-indigo-800/60' },
  };

  const currentProvider = providerNames[activeProvider] || providerNames.fallback;

  return (
    <header className="border-b border-slate-800 bg-slate-900/95 backdrop-blur-md sticky top-0 z-50 px-4 lg:px-6 py-2.5">
      <div className="flex items-center justify-between gap-4">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-sky-500 flex items-center justify-center shadow-md shadow-indigo-500/20">
            <Scale className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-bold text-lg tracking-tight text-white">
                Adjourn<span className="text-indigo-400">AI</span>
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                Educational Co-Pilot
              </span>
            </div>
            <p className="text-[11px] text-slate-400 flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              <span>Zero-Data-Retention (ZDR) • HIPAA Safe Harbor</span>
            </p>
          </div>
        </div>

        {/* Center Indicators: Model Provider Selector + Current Document */}
        <div className="hidden md:flex items-center gap-2.5">
          {/* Active Model Engine Selector */}
          <div className="relative group">
            <button
              type="button"
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${currentProvider.color}`}
              title="Click to toggle between Vertex AI Gemini and SaulLM-7B"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>{currentProvider.label}</span>
              <span className="px-1.5 py-0.2 rounded text-[10px] font-mono opacity-80 border border-current">
                {currentProvider.badge}
              </span>
            </button>
            <div className="absolute left-0 top-full mt-0.5 w-72 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-2 hidden group-hover:block z-50 text-left">
              <div className="text-[10px] uppercase font-bold text-slate-400 px-2 py-1">
                Inference Architecture
              </div>
              <button
                onClick={() => onProviderChange && onProviderChange('gemini')}
                className="w-full text-left p-2 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <div className="text-xs font-bold text-sky-400 flex items-center justify-between">
                  <span>Concept B: Gemini 2.0 Flash</span>
                  <span className="text-[10px] bg-sky-500/20 px-1.5 py-0.5 rounded">Vertex AI</span>
                </div>
                <div className="text-[10px] text-slate-400">Google Cloud Run & Vertex AI Hackathon Stack</div>
              </button>
              <button
                onClick={() => onProviderChange && onProviderChange('local_saul_lm')}
                className="w-full text-left p-2 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <div className="text-xs font-bold text-purple-400 flex items-center justify-between">
                  <span>Concept A: SaulLM-7B</span>
                  <span className="text-[10px] bg-purple-500/20 px-1.5 py-0.5 rounded">Air-Gapped</span>
                </div>
                <div className="text-[10px] text-slate-400">30B-token Legal Model in Local vLLM Container</div>
              </button>
              <button
                onClick={() => onProviderChange && onProviderChange('fallback')}
                className="w-full text-left p-2 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <div className="text-xs font-bold text-slate-300 flex items-center justify-between">
                  <span>Deterministic Fallback</span>
                  <span className="text-[10px] bg-slate-700 px-1.5 py-0.5 rounded">Offline</span>
                </div>
                <div className="text-[10px] text-slate-400">Rule-grounded zero-dependency legal engine</div>
              </button>
            </div>
          </div>

          {/* Current Document Indicator */}
          {documentTitle && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/80 text-xs text-slate-200 max-w-xs truncate">
              <FileText className="h-3.5 w-3.5 text-indigo-400 flex-shrink-0" />
              <span className="truncate font-medium">{documentTitle}</span>
            </div>
          )}
        </div>

        {/* Actions & Sample Contract Dropdown */}
        <div className="flex items-center gap-3">
          {/* Sample Contracts Selector */}
          <div className="relative group">
            <button
              type="button"
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors flex items-center gap-1.5"
            >
              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              <span>Sample Contracts</span>
            </button>
            <div className="absolute right-0 top-full mt-1.5 w-64 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-1.5 hidden group-hover:block z-50">
              <button
                onClick={() => onLoadSample('commercial-lease')}
                className="w-full text-left p-2 rounded-lg hover:bg-slate-800/80 transition-colors"
              >
                <div className="text-xs font-semibold text-slate-200">Commercial Office Lease</div>
                <div className="text-[10px] text-slate-400">Aggressive unilateral indemnity & renewal traps</div>
              </button>
              <button
                onClick={() => onLoadSample('saas-msa')}
                className="w-full text-left p-2 rounded-lg hover:bg-slate-800/80 transition-colors"
              >
                <div className="text-xs font-semibold text-slate-200">SaaS Master Services Agreement</div>
                <div className="text-[10px] text-slate-400">$50 liability cap & IP AI training assignment</div>
              </button>
            </div>
          </div>

          {/* Upload Button */}
          <button
            onClick={onUploadClick}
            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm shadow-indigo-600/20 transition-all flex items-center gap-1.5"
          >
            <Upload className="h-3.5 w-3.5" />
            <span>Upload Contract</span>
          </button>

          {/* Purge Session (ZDR) */}
          {sessionId && (
            <button
              onClick={onPurgeSession}
              disabled={isPurging}
              title="Purge session from volatile RAM (Zero Data Retention)"
              className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/50 transition-colors flex items-center gap-1"
            >
              <Trash2 className="h-3.5 w-3.5 text-rose-400" />
              <span className="hidden xl:inline">{isPurging ? 'Purging...' : 'Purge Data'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Non-UPL Legal Disclaimer Banner */}
      <div className="mt-2 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
        <div className="flex items-center gap-1.5 text-amber-300/90 font-medium">
          <AlertCircle className="h-3.5 w-3.5 flex-shrink-0 text-amber-400" />
          <span>Educational Legal Co-Pilot: Not legal advice. Does not create an attorney-client relationship.</span>
        </div>
        <span className="hidden md:inline text-slate-500">
          Prepares actionable briefs for consultation with licensed legal counsel.
        </span>
      </div>
    </header>
  );
}
