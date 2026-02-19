import { useState, useCallback, useRef } from 'react';
import useStore from '../store/useStore';
import TextSelectPopover from './TextSelectPopover';

export default function ScriptPanel() {
  const script = useStore((s) => s.script);
  const scriptPanelOpen = useStore((s) => s.scriptPanelOpen);
  const setScriptPanelOpen = useStore((s) => s.setScriptPanelOpen);

  const [selection, setSelection] = useState(null); // { text, sectionId, position }
  const panelRef = useRef(null);

  const handleTextSelect = useCallback(() => {
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed || !sel.toString().trim()) {
      return;
    }

    const selectedText = sel.toString().trim();
    if (selectedText.length < 5) return;

    // Find the section this selection belongs to
    const range = sel.getRangeAt(0);
    const sectionEl = range.startContainer.parentElement?.closest('[data-section-id]');
    if (!sectionEl) return;

    const sectionId = sectionEl.dataset.sectionId;
    const rect = range.getBoundingClientRect();
    const panelRect = panelRef.current?.getBoundingClientRect() || { left: 0, top: 0 };

    setSelection({
      text: selectedText,
      sectionId,
      position: {
        x: rect.left - panelRect.left,
        y: rect.bottom - panelRect.top,
      },
    });
  }, []);

  const handleClosePopover = useCallback(() => {
    setSelection(null);
    window.getSelection()?.removeAllRanges();
  }, []);

  if (!script) return null;

  const narrationSections = script.sections.filter((s) => s.type === 'narration');

  return (
    <>
      {/* Backdrop */}
      {scriptPanelOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40"
          onClick={() => setScriptPanelOpen(false)}
        />
      )}

      {/* Panel */}
      <div
        ref={panelRef}
        className={`fixed right-0 top-0 bottom-0 z-40 w-[460px] bg-bg border-l border-border-light shadow-2xl transform transition-transform duration-300 ${
          scriptPanelOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h3 className="text-sm font-semibold text-gray-200">Script</h3>
          <button
            onClick={() => setScriptPanelOpen(false)}
            className="p-1.5 rounded text-gray-500 hover:text-gray-300 hover:bg-white/[0.06] transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Script content */}
        <div
          className="flex-1 overflow-y-auto px-5 py-4 relative"
          style={{ height: 'calc(100vh - 57px)' }}
          onMouseUp={handleTextSelect}
        >
          {narrationSections.map((section) => {
            const visibleBrolls = section.brolls.filter((b) => !b.removed);
            return (
              <div
                key={section.id}
                data-section-id={section.id}
                className="mb-6"
              >
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="text-[12px] font-semibold text-gray-300 uppercase tracking-wide">
                    {section.heading}
                  </h4>
                  <span className="text-[10px] text-gray-600 font-mono">
                    {visibleBrolls.length} clips
                  </span>
                </div>
                <p className="text-[13px] text-gray-400 leading-relaxed whitespace-pre-wrap selection:bg-accent-amber/30 selection:text-accent-amber">
                  {section.text}
                </p>
              </div>
            );
          })}

          {/* Text select popover */}
          {selection && (
            <TextSelectPopover
              selectedText={selection.text}
              position={selection.position}
              sectionId={selection.sectionId}
              onClose={handleClosePopover}
            />
          )}
        </div>
      </div>
    </>
  );
}
