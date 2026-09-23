import React, { useState, useEffect } from 'react';
import DualPaneTemplate from './templates/DualPaneTemplate';
import ViewerToolbar from './organisms/ViewerToolbar';
import ContractSourcePane from './organisms/ContractSourcePane';
import ClaimAnalysisPane from './organisms/ClaimAnalysisPane';
import ShortcutsModal from './organisms/ShortcutsModal';
import { useSyncScroll } from '../hooks/useSyncScroll';

/**
 * DualPaneViewer Orchestrator Component
 * Refactored to Atomic Design: Coordinates the DualPaneTemplate with
 * ContractSourcePane, ClaimAnalysisPane, ViewerToolbar, and useSyncScroll hook.
 */
export default function DualPaneViewer({
  documentData,
  analysisData,
  activeTaskType = 'risk_review',
  onTaskChange,
  isAnalyzing = false,
  onRefreshAnalysis,
}) {
  // Reading comfort theme: 'paper' (Warm Paper ☀️) or 'dark' (Soft Dark 🌙)
  const [readingTheme, setReadingTheme] = useState('paper');
  // Typography font scaling: 'sm', 'md', 'lg'
  const [fontSizeLevel, setFontSizeLevel] = useState('md');
  // Keyboard shortcuts dialog state
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);

  const isPaper = readingTheme === 'paper';

  // Proportional scroll synchronization & reactive clause finding hook
  const {
    leftPaneRef,
    rightPaneRef,
    isSyncEnabled,
    setIsSyncEnabled,
    handleLeftScroll,
    handleRightScroll,
    scrollToClause,
    highlightedClauseId,
  } = useSyncScroll();

  // Accessible keyboard hotkeys listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;

      if (e.altKey && e.key.toLowerCase() === 's') {
        e.preventDefault();
        setIsSyncEnabled((prev) => !prev);
      } else if (e.altKey && e.key.toLowerCase() === 't') {
        e.preventDefault();
        setReadingTheme((prev) => (prev === 'paper' ? 'dark' : 'paper'));
      } else if (e.key === '?' || (e.shiftKey && e.key === '/')) {
        e.preventDefault();
        setShowShortcutsModal((prev) => !prev);
      } else if (e.key === 'Escape') {
        setShowShortcutsModal(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setIsSyncEnabled]);

  return (
    <DualPaneTemplate
      isPaper={isPaper}
      toolbar={
        <ViewerToolbar
          activeTaskType={activeTaskType}
          onTaskChange={onTaskChange}
          readingTheme={readingTheme}
          onThemeChange={setReadingTheme}
          fontSizeLevel={fontSizeLevel}
          onFontSizeChange={setFontSizeLevel}
          isSyncEnabled={isSyncEnabled}
          onToggleSync={() => setIsSyncEnabled((prev) => !prev)}
          lemajVerification={analysisData?.lemaj_verification}
          onOpenShortcuts={() => setShowShortcutsModal(true)}
        />
      }
      leftPane={
        <ContractSourcePane
          documentData={documentData}
          leftPaneRef={leftPaneRef}
          onScroll={handleLeftScroll}
          highlightedClauseId={highlightedClauseId}
          readingTheme={readingTheme}
          fontSizeLevel={fontSizeLevel}
        />
      }
      rightPane={
        <ClaimAnalysisPane
          analysisData={analysisData}
          activeTaskType={activeTaskType}
          isAnalyzing={isAnalyzing}
          rightPaneRef={rightPaneRef}
          onScroll={handleRightScroll}
          onVerifyInText={scrollToClause}
          readingTheme={readingTheme}
          fontSizeLevel={fontSizeLevel}
        />
      }
      modal={
        <ShortcutsModal
          isOpen={showShortcutsModal}
          onClose={() => setShowShortcutsModal(false)}
          isPaper={isPaper}
        />
      }
    />
  );
}
