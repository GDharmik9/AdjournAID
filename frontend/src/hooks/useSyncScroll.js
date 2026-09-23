import { useState, useRef, useCallback } from 'react';

/**
 * useSyncScroll Hook
 * Manages proportional synchronized scrolling between the original
 * contract pane (left) and the CLAIM analysis insights pane (right),
 * plus reactive clause finding and highlighting.
 */
export function useSyncScroll() {
  const leftPaneRef = useRef(null);
  const rightPaneRef = useRef(null);
  const isSyncingLeft = useRef(false);
  const isSyncingRight = useRef(false);

  const [isSyncEnabled, setIsSyncEnabled] = useState(true);
  const [highlightedClauseId, setHighlightedClauseId] = useState(null);

  const handleLeftScroll = useCallback(() => {
    if (!isSyncEnabled || isSyncingLeft.current) return;
    isSyncingRight.current = true;

    const left = leftPaneRef.current;
    const right = rightPaneRef.current;
    if (left && right) {
      const scrollPercentage = left.scrollTop / (left.scrollHeight - left.clientHeight || 1);
      right.scrollTop = scrollPercentage * (right.scrollHeight - right.clientHeight);
    }

    setTimeout(() => {
      isSyncingRight.current = false;
    }, 50);
  }, [isSyncEnabled]);

  const handleRightScroll = useCallback(() => {
    if (!isSyncEnabled || isSyncingRight.current) return;
    isSyncingLeft.current = true;

    const left = leftPaneRef.current;
    const right = rightPaneRef.current;
    if (left && right) {
      const scrollPercentage = right.scrollTop / (right.scrollHeight - right.clientHeight || 1);
      left.scrollTop = scrollPercentage * (left.scrollHeight - left.clientHeight);
    }

    setTimeout(() => {
      isSyncingLeft.current = false;
    }, 50);
  }, [isSyncEnabled]);

  const scrollToClause = useCallback((clauseRef, sectionId) => {
    let targetEl = null;

    if (sectionId) {
      targetEl = document.querySelector(`[data-clause-id="${sectionId}"]`);
    }

    if (!targetEl && clauseRef) {
      const sections = document.querySelectorAll('[data-clause-title]');
      for (let sec of sections) {
        if (sec.getAttribute('data-clause-title')?.toLowerCase().includes(clauseRef.toLowerCase())) {
          targetEl = sec;
          break;
        }
      }
    }

    if (targetEl && leftPaneRef.current) {
      targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      const activeId = targetEl.id;
      setHighlightedClauseId(activeId);

      setTimeout(() => {
        setHighlightedClauseId(null);
      }, 3000);
    }
  }, []);

  return {
    leftPaneRef,
    rightPaneRef,
    isSyncEnabled,
    setIsSyncEnabled,
    handleLeftScroll,
    handleRightScroll,
    scrollToClause,
    highlightedClauseId,
  };
}
