import React, { useState, useEffect, useCallback } from 'react';
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

  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isPurging, setIsPurging] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [activeProvider, setActiveProvider] = useState('fallback');

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
      if (sessionId) {
        runAnalysis(sessionId, activeTaskType);
      }
    } catch (e) {
      console.error('Failed to change provider:', e);
      setErrorMessage(e.message || 'Failed to change provider.');
    }
  };

  // Fetch or trigger analysis when document or task changes
  const runAnalysis = async (docId, taskType) => {
    if (!docId) return;
    setIsAnalyzing(true);
    setErrorMessage(null);
    try {
      const data = await api.analyzeDocument(docId, taskType);
      setAnalysisData(data);
    } catch (err) {
      console.error('Analysis error:', err);
      setErrorMessage(err.message || 'Failed to complete CLAIM analysis.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleTaskChange = (newTaskType) => {
    setActiveTaskType(newTaskType);
    if (sessionId) {
      runAnalysis(sessionId, newTaskType);
    }
  };

  const handleLoadSample = async (sampleId) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const data = await api.loadSampleContract(sampleId);
      setSessionId(data.session_id);
      setDocumentData(data);

      // Trigger default risk review analysis
      await runAnalysis(data.session_id, activeTaskType);
    } catch (err) {
      console.error('Load sample error:', err);
      setErrorMessage(err.message || 'Failed to load sample contract.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadFile = async (file, docTitle) => {
    setIsLoading(true);
    setIsUploadModalOpen(false);
    setErrorMessage(null);

    try {
      const data = await api.uploadFile(file, docTitle);
      setSessionId(data.document_id);
      setDocumentData(data);

      // Run analysis
      await runAnalysis(data.document_id, activeTaskType);
    } catch (err) {
      console.error('Upload error:', err);
      setErrorMessage(err.message || 'Failed to process contract.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadText = async (text, docTitle) => {
    setIsLoading(true);
    setIsUploadModalOpen(false);
    setErrorMessage(null);

    try {
      const data = await api.uploadRawText(text, docTitle);
      setSessionId(data.document_id);
      setDocumentData(data);

      // Run analysis
      await runAnalysis(data.document_id, activeTaskType);
    } catch (err) {
      console.error('Upload text error:', err);
      setErrorMessage(err.message || 'Failed to process contract.');
    } finally {
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
          onTaskChange={handleTaskChange}
          isAnalyzing={isAnalyzing}
          onRefreshAnalysis={() => runAnalysis(sessionId, activeTaskType)}
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

