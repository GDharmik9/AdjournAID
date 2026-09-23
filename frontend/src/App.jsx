import React, { useState, useEffect, useCallback, useRef } from 'react';
import api from './services/api';
import Navbar from './components/Navbar';
import DualPaneViewer from './components/DualPaneViewer';
import UploadModal from './components/UploadModal';
import MainLayout from './components/templates/MainLayout';
import { AlertCircle, FileText, CheckCircle2, ShieldAlert } from 'lucide-react';

export default function App() {
  const [sessionId, setSessionId] = useState(null);
  const [documentData, setDocumentData] = useState(null);
  const [analysisData, setAnalysisData] = useState(null);
  const [activeTaskType, setActiveTaskType] = useState('risk_review');
  const [analysisCache, setAnalysisCache] = useState({});

  // Synchronous refs to prevent closure staleness and race conditions across tab clicks
  const analysisCacheRef = useRef({});
  const activeTaskTypeRef = useRef('risk_review');
  const activeDocIdRef = useRef(null);
  const inFlightRef = useRef({});

  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isPurging, setIsPurging] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [activeProvider, setActiveProvider] = useState('fallback');

  const resetAllCaches = () => {
    analysisCacheRef.current = {};
    inFlightRef.current = {};
    activeDocIdRef.current = null;
    setAnalysisCache({});
    try {
      sessionStorage.clear();
    } catch {}
  };

  // Fetch active provider and auto-load sample Commercial Lease contract on initial startup
  useEffect(() => {
    fetchProvider();
    handleLoadSample('commercial-lease');
  }, []);

  // Global accessibility keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignore when typing inside input or textarea
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;

      if (e.altKey && e.key === '1') {
        e.preventDefault();
        handleTaskChange('risk_review');
      } else if (e.altKey && e.key === '2') {
        e.preventDefault();
        handleTaskChange('simplification');
      } else if (e.altKey && e.key === '3') {
        e.preventDefault();
        handleTaskChange('redline');
      } else if (e.altKey && e.key === '4') {
        e.preventDefault();
        handleTaskChange('consultation_brief');
      } else if (e.altKey && e.key === '5') {
        e.preventDefault();
        handleTaskChange('qa_query');
      } else if (e.altKey && e.key === '6') {
        e.preventDefault();
        handleTaskChange('comparison');
      } else if (e.key === 'Escape') {
        if (isUploadModalOpen) setIsUploadModalOpen(false);
        if (errorMessage) setErrorMessage(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [sessionId, isUploadModalOpen, errorMessage]);

  const fetchProvider = async () => {
    try {
      const data = await api.getProvider();
      if (data?.active_provider) {
        setActiveProvider(data.active_provider);
      }
    } catch (e) {
      console.warn('Could not fetch provider status:', e);
    }
  };

  const handleProviderChange = async (newProvider) => {
    try {
      await api.setProvider(newProvider);
      setActiveProvider(newProvider);
      resetAllCaches();
      if (sessionId) {
        runAnalysis(sessionId, activeTaskTypeRef.current, true);
      }
    } catch (e) {
      console.error('Failed to change provider:', e);
      setErrorMessage(e.message || 'Failed to change provider.');
    }
  };

  // Robust analysis runner with in-memory caching and deduplication
  const runAnalysis = async (docId, taskType, forceRefresh = false, isBackground = false, customQuery = null) => {
    if (!docId) return null;

    // 1. Instant cache hit (0ms latency, zero API calls)
    if (!forceRefresh && !customQuery && analysisCacheRef.current[taskType]) {
      console.log(`%c⚡ [AdjournAID Cache HIT] ${taskType} retrieved instantly from session cache (0ms latency)`, 'color: #10b981; font-weight: bold; background: #064e3b; padding: 2px 6px; border-radius: 4px;');
      if (activeTaskTypeRef.current === taskType) {
        setAnalysisData(analysisCacheRef.current[taskType]);
        setIsAnalyzing(false);
      }
      return analysisCacheRef.current[taskType];
    }

    // 2. Deduplicate: if already fetching in background or foreground, return existing promise
    if (inFlightRef.current[taskType] && !forceRefresh && !customQuery) {
      if (!isBackground && activeTaskTypeRef.current === taskType) {
        setIsAnalyzing(true);
      }
      return inFlightRef.current[taskType];
    }

    if (!isBackground && activeTaskTypeRef.current === taskType) {
      setIsAnalyzing(true);
    }
    setErrorMessage(null);

    const promise = api.analyzeDocument(docId, taskType, customQuery, forceRefresh);
    inFlightRef.current[taskType] = promise;

    try {
      const data = await promise;
      // Store in synchronous ref cache
      analysisCacheRef.current[taskType] = data;
      setAnalysisCache({ ...analysisCacheRef.current });

      // Mirror to browser sessionStorage for visual inspection in DevTools
      try {
        sessionStorage.setItem(`adjournaid_cache_${taskType}`, JSON.stringify({
          task_type: taskType,
          doc_id: docId,
          cached_at: new Date().toLocaleTimeString(),
          overall_risk_score: data?.analysis?.overall_risk_score,
          provider_used: data?.analysis?._provider_used,
          data: data,
        }));
      } catch (e) {
        console.warn('sessionStorage write error:', e);
      }

      // Only update UI if user is STILL viewing this task type (prevents race overwrites)
      if (activeTaskTypeRef.current === taskType) {
        setAnalysisData(data);
      }
      return data;
    } catch (err) {
      console.error(`Analysis error for ${taskType}:`, err);
      if (activeTaskTypeRef.current === taskType) {
        setErrorMessage(err.message || 'Failed to complete CLAIM analysis.');
      }
      throw err;
    } finally {
      delete inFlightRef.current[taskType];
      if (activeTaskTypeRef.current === taskType) {
        setIsAnalyzing(false);
      }
    }
  };

  const handleAskQuestion = (customQuery) => {
    setActiveTaskType('qa_query');
    activeTaskTypeRef.current = 'qa_query';
    if (sessionId) {
      runAnalysis(sessionId, 'qa_query', true, false, customQuery);
    }
  };

  // Preloads remaining tabs SEQUENTIALLY in background to prevent container overloading & timeouts
  const preloadOtherTabsSequentially = async (docId) => {
    const allModes = ['risk_review', 'simplification', 'redline', 'consultation_brief', 'comparison'];
    for (const mode of allModes) {
      // Abort if user switched document
      if (activeDocIdRef.current !== docId) return;

      if (mode !== activeTaskTypeRef.current && !analysisCacheRef.current[mode] && !inFlightRef.current[mode]) {
        try {
          await runAnalysis(docId, mode, false, true);
        } catch (e) {
          console.warn(`Background prefetch for ${mode} failed:`, e);
        }
      }
    }
  };

  const handleTaskChange = async (newTaskType) => {
    setActiveTaskType(newTaskType);
    activeTaskTypeRef.current = newTaskType;
    if (!sessionId) return;

    // 1. Instant switch if already cached (0ms latency, zero API calls)
    const cached = analysisCacheRef.current[newTaskType];
    if (cached) {
      console.log(`%c⚡ [AdjournAID Tab Switch] Switched to '${newTaskType}' instantly from cache (0ms, 0 API calls)`, 'color: #38bdf8; font-weight: bold;');
      setAnalysisData(cached);
      setIsAnalyzing(false);
      return;
    }

    // 2. If already fetching in flight, show loader and await the active promise
    if (inFlightRef.current[newTaskType]) {
      setAnalysisData(null);
      setIsAnalyzing(true);
      try {
        const data = await inFlightRef.current[newTaskType];
        if (activeTaskTypeRef.current === newTaskType) {
          setAnalysisData(data);
          setIsAnalyzing(false);
        }
      } catch (err) {
        if (activeTaskTypeRef.current === newTaskType) {
          setErrorMessage(err.message || 'Failed to complete analysis.');
          setIsAnalyzing(false);
        }
      }
      return;
    }

    // 3. Otherwise, fetch this tab's analysis directly
    setAnalysisData(null);
    try {
      await runAnalysis(sessionId, newTaskType, false, false);
    } catch {
      // Handled in runAnalysis
    }
  };

  const handleLoadSample = async (sampleId) => {
    setIsLoading(true);
    setErrorMessage(null);
    setAnalysisData(null);
    resetAllCaches();
    try {
      const data = await api.loadSampleContract(sampleId);
      setSessionId(data.session_id);
      activeDocIdRef.current = data.session_id;
      setDocumentData(data);
      setIsLoading(false); // Contract renders immediately

      // 1. Trigger default active tab analysis with full priority
      runAnalysis(data.session_id, activeTaskTypeRef.current)
        .then(() => {
          // 2. Once active tab completes, quietly preload remaining tabs one-by-one
          preloadOtherTabsSequentially(data.session_id);
        })
        .catch(() => {
          preloadOtherTabsSequentially(data.session_id);
        });
    } catch (err) {
      console.error('Load sample error:', err);
      setErrorMessage(err.message || 'Failed to load sample contract.');
      setIsLoading(false);
    }
  };

  const handleUploadFile = async (file, docTitle) => {
    setIsLoading(true);
    setIsUploadModalOpen(false);
    setErrorMessage(null);
    setAnalysisData(null);
    resetAllCaches();

    try {
      const data = await api.uploadFile(file, docTitle);
      setSessionId(data.document_id);
      activeDocIdRef.current = data.document_id;
      setDocumentData(data);
      setIsLoading(false); // Contract renders immediately

      // Run active tab analysis with full priority, then sequentially preload remaining tabs
      runAnalysis(data.document_id, activeTaskTypeRef.current)
        .then(() => {
          preloadOtherTabsSequentially(data.document_id);
        })
        .catch(() => {
          preloadOtherTabsSequentially(data.document_id);
        });
    } catch (err) {
      console.error('Upload error:', err);
      setErrorMessage(err.message || 'Failed to process contract.');
      setIsLoading(false);
    }
  };

  const handleUploadText = async (text, docTitle) => {
    setIsLoading(true);
    setIsUploadModalOpen(false);
    setErrorMessage(null);
    setAnalysisData(null);
    resetAllCaches();

    try {
      const data = await api.uploadRawText(text, docTitle);
      setSessionId(data.document_id);
      activeDocIdRef.current = data.document_id;
      setDocumentData(data);
      setIsLoading(false); // Contract renders immediately

      // Run active tab analysis with full priority, then sequentially preload remaining tabs
      runAnalysis(data.document_id, activeTaskTypeRef.current)
        .then(() => {
          preloadOtherTabsSequentially(data.document_id);
        })
        .catch(() => {
          preloadOtherTabsSequentially(data.document_id);
        });
    } catch (err) {
      console.error('Upload text error:', err);
      setErrorMessage(err.message || 'Failed to process contract.');
      setIsLoading(false);
    }
  };


  const handlePurgeSession = async () => {
    if (!sessionId) return;
    setIsPurging(true);
    try {
      await api.purgeSession(sessionId);
      setSessionId(null);
      setDocumentData(null);
      setAnalysisData(null);
      resetAllCaches();
    } catch (err) {
      console.error('Purge error:', err);
      setErrorMessage(err.message || 'Failed to purge session.');
    } finally {
      setIsPurging(false);
    }
  };





  return (
    <MainLayout
      errorMessage={errorMessage}
      onDismissError={() => setErrorMessage(null)}
      navbar={
        <Navbar
          documentTitle={documentData?.doc_title || documentData?.title}
          sessionId={sessionId}
          activeProvider={activeProvider}
          onProviderChange={handleProviderChange}
          onUploadClick={() => setIsUploadModalOpen(true)}
          onLoadSample={handleLoadSample}
          onPurgeSession={handlePurgeSession}
          isPurging={isPurging}
        />
      }
      modals={
        <UploadModal
          isOpen={isUploadModalOpen}
          onClose={() => setIsUploadModalOpen(false)}
          onUploadFile={handleUploadFile}
          onUploadText={handleUploadText}
          isUploading={isLoading}
        />
      }
    >
      {isLoading ? (
        <div className="flex flex-col items-center justify-center h-[calc(100vh-140px)] space-y-4">
          <div className="h-12 w-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center animate-pulse">
            <FileText className="h-6 w-6 text-indigo-400" />
          </div>
          <div className="text-sm font-semibold text-slate-200">
            Generating Summary-Augmented Chunks (SAC)...
          </div>
          <div className="text-xs text-slate-400 max-w-sm text-center">
            Extracting document-level synthetic fingerprint and indexing into ephemeral vector memory.
          </div>
        </div>
      ) : documentData ? (
        <DualPaneViewer
          documentData={documentData}
          analysisData={analysisData}
          activeTaskType={activeTaskType}
          analysisCache={analysisCache}
          onTaskChange={handleTaskChange}
          isAnalyzing={isAnalyzing}
          onRefreshAnalysis={() => runAnalysis(sessionId, activeTaskType, true)}
          onAskQuestion={handleAskQuestion}
        />

      ) : (
        <div className="flex flex-col items-center justify-center h-[calc(100vh-140px)] space-y-4">
          <div className="h-16 w-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center shadow-lg">
            <FileText className="h-8 w-8 text-slate-500" />
          </div>
          <h2 className="text-base font-bold text-slate-200 font-display">No Active Contract Loaded</h2>
          <p className="text-xs text-slate-400 max-w-sm text-center leading-relaxed">
            Upload an agreement (PDF, DOCX, or text) or click below to explore a pre-loaded lease agreement.
          </p>
          <div className="flex items-center gap-3 pt-1">
            <button
              onClick={() => handleLoadSample('commercial-lease')}
              className="px-4 py-2 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
            >
              Load Commercial Lease
            </button>
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="px-4 py-2 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md transition-colors"
            >
              Upload File
            </button>
          </div>
        </div>
      )}
    </MainLayout>
  );
}

