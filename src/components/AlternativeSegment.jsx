import { useState } from 'react';

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function AlternativeSegment({ alternative, onSwap }) {
  const [expanded, setExpanded] = useState(false);

  if (!alternative) return null;

  return (
    <div className="mt-2 border-t border-border pt-2">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-1.5 text-[11px] text-gray-500 hover:text-gray-300 transition-colors"
      >
        <svg
          className={`w-3 h-3 transition-transform ${expanded ? 'rotate-90' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
        Alternative segment
      </button>

      {expanded && (
        <div className="mt-2 pl-4 flex items-start gap-3">
          <div className="flex-1">
            <div className="text-[11px] text-gray-400 font-mono">
              {formatTime(alternative.start)} - {formatTime(alternative.end)}
            </div>
            <div className="text-[11px] text-gray-500 mt-0.5">{alternative.description}</div>
          </div>
          <button
            onClick={onSwap}
            className="shrink-0 text-[10px] px-2 py-1 rounded bg-white/[0.06] text-gray-400 hover:text-gray-200 hover:bg-white/[0.1] transition-colors"
          >
            Use this
          </button>
        </div>
      )}
    </div>
  );
}
