import { useState } from 'react';
import useStore from '../store/useStore';
import SectionBlock from './SectionBlock';
import AddBrollModal from './AddBrollModal';
import UrlSearchModal from './UrlSearchModal';
import ScriptPanel from './ScriptPanel';
import DownloadBar from './DownloadBar';
import { generateShellScript, generateManifestJSON, downloadFile } from '../lib/export';

export default function CuratorView() {
  const script = useStore((s) => s.script);
  const toggleScriptPanel = useStore((s) => s.toggleScriptPanel);
  const { count: markedCount } = useStore((s) => s.getMarkedStats());

  const [addBrollSection, setAddBrollSection] = useState(null); // section for AddBrollModal
  const [urlSearchSection, setUrlSearchSection] = useState(null); // section for UrlSearchModal

  if (!script) return null;

  const narrationSections = script.sections.filter((s) => s.type === 'narration');
  const totalBrolls = narrationSections.reduce(
    (sum, s) => sum + s.brolls.filter((b) => !b.removed).length,
    0
  );

  const handleExportSh = () => {
    const content = generateShellScript(script.title, script.sections);
    const safeName = script.title.replace(/[^a-zA-Z0-9가-힣_-]/g, '_').substring(0, 50);
    downloadFile(content, `broll_${safeName}.sh`, 'text/x-shellscript');
  };

  const handleExportJson = () => {
    const content = generateManifestJSON(script.title, script.sections);
    const safeName = script.title.replace(/[^a-zA-Z0-9가-힣_-]/g, '_').substring(0, 50);
    downloadFile(content, `broll_${safeName}.json`, 'application/json');
  };

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-bg/95 backdrop-blur border-b border-border">
        <div className="max-w-content mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-sm font-semibold text-gray-200 truncate max-w-[400px]">
              {script.title}
            </h1>
            <div className="flex items-center gap-3 mt-0.5">
              <span className="text-[11px] text-gray-500 font-mono">
                {narrationSections.length} sections
              </span>
              <span className="text-[11px] text-gray-500 font-mono">
                {totalBrolls} clips
              </span>
              {markedCount > 0 && (
                <span className="text-[11px] text-accent-green font-mono">
                  {markedCount} marked
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleScriptPanel}
              className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] text-gray-400 bg-white/[0.04] border border-border rounded hover:bg-white/[0.08] hover:text-gray-300 transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
              Script
            </button>

            {markedCount > 0 && (
              <>
                <button
                  onClick={handleExportSh}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] bg-accent-green/10 text-accent-green border border-accent-green/20 rounded hover:bg-accent-green/20 transition-colors"
                >
                  Export .sh
                </button>
                <button
                  onClick={handleExportJson}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] bg-white/[0.06] text-gray-400 border border-border rounded hover:bg-white/[0.1] transition-colors"
                >
                  Export .json
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Section list */}
      <main className="max-w-content mx-auto px-4 py-6">
        {narrationSections.map((section) => (
          <SectionBlock
            key={section.id}
            section={section}
            onAddBroll={(s) => setAddBrollSection(s)}
            onAddFromUrl={(s) => setUrlSearchSection(s)}
          />
        ))}
      </main>

      {/* Download bar */}
      <DownloadBar />

      {/* Script panel */}
      <ScriptPanel />

      {/* Modals */}
      {addBrollSection && (
        <AddBrollModal
          section={addBrollSection}
          onClose={() => setAddBrollSection(null)}
        />
      )}

      {urlSearchSection && (
        <UrlSearchModal
          section={urlSearchSection}
          onClose={() => setUrlSearchSection(null)}
        />
      )}
    </div>
  );
}
