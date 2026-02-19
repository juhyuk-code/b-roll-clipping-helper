import ConfidenceBadge from './ConfidenceBadge';

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function TranscriptMatches({ matches, loading, onPick }) {
  if (loading) {
    return (
      <div className="py-6 text-center">
        <div className="w-5 h-5 border-2 border-accent-amber border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-gray-500 mt-2">Finding best segments...</p>
      </div>
    );
  }

  if (!matches || matches.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      <div className="text-[11px] text-gray-500 font-medium uppercase tracking-wide">
        Matching Segments
      </div>
      {matches.map((match, i) => (
        <div
          key={i}
          className="p-3 rounded border border-border bg-surface hover:border-border-light transition-colors"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-[12px] text-accent-green font-mono">
                {formatTime(match.start)} - {formatTime(match.end)}
              </span>
              <ConfidenceBadge confidence={match.confidence} />
            </div>
            <button
              onClick={() => onPick(match)}
              className="text-[11px] px-3 py-1 rounded bg-accent-green/10 text-accent-green border border-accent-green/20 hover:bg-accent-green/20 transition-colors"
            >
              Pick
            </button>
          </div>

          <p className="text-[11px] text-gray-400">{match.description}</p>

          {match.excerpt && (
            <p className="text-[10px] text-gray-600 mt-1 italic line-clamp-2">
              &ldquo;{match.excerpt}&rdquo;
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
