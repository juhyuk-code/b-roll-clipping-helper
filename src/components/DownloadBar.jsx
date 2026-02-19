import useStore from '../store/useStore';
import { generateShellScript, generateManifestJSON, downloadFile } from '../lib/export';

function formatDuration(seconds) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  if (m === 0) return `${s}s`;
  return `${m}m ${s}s`;
}

export default function DownloadBar() {
  const script = useStore((s) => s.script);
  const { count, totalDuration } = useStore((s) => s.getMarkedStats());

  if (!script || count === 0) return null;

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
    <div className="fixed bottom-0 left-0 right-0 z-20 bg-bg/95 backdrop-blur border-t border-border">
      <div className="max-w-content mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-sm text-accent-green font-medium">{count} clips marked</span>
          <span className="text-[11px] text-gray-500 font-mono">{formatDuration(totalDuration)} total</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportSh}
            className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] bg-accent-green/10 text-accent-green border border-accent-green/20 rounded hover:bg-accent-green/20 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            Export .sh
          </button>
          <button
            onClick={handleExportJson}
            className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] bg-white/[0.06] text-gray-400 border border-border rounded hover:bg-white/[0.1] transition-colors"
          >
            Export .json
          </button>
        </div>
      </div>
    </div>
  );
}
