import React, { useState, useMemo } from 'react';
import { FileText, ChevronDown } from 'lucide-react';
import SearchInput from '../atoms/SearchInput';
import { getTypography } from '../../constants/typography';

/**
 * Organism: ContractSourcePane
 * Left pane of DualPaneViewer: search bar, clause counter, and scrolling contract text with reactive clause highlighting.
 */
export default function ContractSourcePane({
  documentData,
  leftPaneRef,
  onScroll,
  highlightedClauseId,
  readingTheme = 'dark',
  fontSizeLevel = 'md',
}) {
  const isPaper = readingTheme === 'paper';
  const typography = getTypography(fontSizeLevel);

  const [searchTerm, setSearchTerm] = useState('');
  const sections = documentData?.sections || [];

  // Filter sections by search term
  const filteredSections = useMemo(() => {
    if (!searchTerm.trim()) return sections;
    const term = searchTerm.toLowerCase();
    return sections.filter(
      (s) =>
        s.title?.toLowerCase().includes(term) ||
        s.content?.toLowerCase().includes(term)
    );
  }, [sections, searchTerm]);

  return (
    <section
      aria-label="Original Contract Text"
      className={`flex flex-col h-full overflow-hidden border-r ${
        isPaper ? 'bg-[#FAF8F5] border-slate-200' : 'bg-slate-900/50 border-slate-800'
      }`}
    >
      {/* Left Pane Header */}
      <div
        className={`p-3 border-b flex items-center justify-between gap-3 ${
          isPaper ? 'bg-white border-slate-200' : 'bg-slate-900/80 border-slate-800'
        }`}
      >
        <div className="flex items-center gap-2 min-w-0">
          <FileText className="h-4 w-4 text-indigo-500 flex-shrink-0" />
          <span
            className={`text-xs font-bold uppercase tracking-wider truncate font-display ${
              isPaper ? 'text-slate-800' : 'text-slate-200'
            }`}
          >
            {documentData?.doc_title || 'Original Contract Document'}
          </span>
        </div>

        {/* Search in Contract */}
        <div className="flex items-center gap-2">
          <SearchInput
            value={searchTerm}
            onChange={setSearchTerm}
            onClear={() => setSearchTerm('')}
            placeholder="Search clause..."
            ariaLabel="Search in contract text"
            matchCount={searchTerm ? filteredSections.length : null}
            isPaper={isPaper}
            className="w-40 sm:w-48"
          />

          <span
            className={`text-[11px] font-mono px-2 py-0.5 rounded border flex-shrink-0 ${
              isPaper
                ? 'bg-slate-100 border-slate-200 text-slate-600'
                : 'bg-slate-800 border-slate-700 text-slate-400'
            }`}
          >
            {filteredSections.length} clauses
          </span>
        </div>
      </div>

      {/* Contract Scroll Container */}
      <div
        ref={leftPaneRef}
        onScroll={onScroll}
        className="flex-1 p-6 md:p-8 overflow-y-auto space-y-6"
      >
        {filteredSections.length === 0 ? (
          <div className="text-center py-16 text-slate-400 text-xs">
            No contract clauses matching &quot;{searchTerm}&quot;.
          </div>
        ) : (
          filteredSections.map((sec, idx) => {
            const sectionKey = sec.id || `clause-${idx}`;
            const isHighlighted =
              highlightedClauseId === sectionKey ||
              highlightedClauseId === `section-${idx}`;

            return (
              <article
                key={sectionKey}
                id={`section-${idx}`}
                data-clause-id={sec.id}
                data-clause-title={sec.title}
                className={`p-5 rounded-xl border transition-all duration-300 ${
                  isHighlighted ? 'clause-highlight-active' : ''
                } ${
                  isPaper
                    ? isHighlighted
                      ? 'border-indigo-500 shadow-md bg-indigo-50/20'
                      : 'border-slate-200/80 bg-white/90 shadow-2xs'
                    : isHighlighted
                    ? 'border-indigo-500 shadow-lg shadow-indigo-500/10 bg-indigo-950/20'
                    : 'border-slate-800/80 bg-slate-900/40'
                }`}
              >
                {/* Clause Header & Jump Button */}
                <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-slate-100 dark:border-slate-800/60">
                  <h3
                    className={`font-semibold text-xs tracking-wide uppercase font-display ${
                      isPaper ? 'text-indigo-950' : 'text-indigo-300'
                    }`}
                  >
                    {sec.title}
                  </h3>
                  {sec.page_number && (
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                        isPaper
                          ? 'bg-slate-100 text-slate-500'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      Pg. {sec.page_number}
                    </span>
                  )}
                </div>

                {/* Clause Legal Text */}
                <div
                  className={`${typography.leftPane} font-legal whitespace-pre-wrap leading-relaxed transition-all duration-150 ${
                    isPaper ? 'text-slate-800' : 'text-slate-200'
                  }`}
                >
                  {sec.content}
                </div>
              </article>
            );
          })
        )}
      </div>
    </section>
  );
}
