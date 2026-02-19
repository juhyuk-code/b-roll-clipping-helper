export default function SearchResults({ results, loading, onSelect }) {
  if (loading) {
    return (
      <div className="py-6 text-center">
        <div className="w-5 h-5 border-2 border-accent-amber border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-gray-500 mt-2">Searching YouTube...</p>
      </div>
    );
  }

  if (!results || results.length === 0) {
    return null;
  }

  return (
    <div className="space-y-1">
      {results.map((result) => (
        <button
          key={result.videoId}
          onClick={() => onSelect(result)}
          className="w-full flex items-start gap-3 p-2 rounded hover:bg-white/[0.04] transition-colors text-left group"
        >
          {result.thumbnail && (
            <img
              src={result.thumbnail}
              alt=""
              className="w-28 h-16 object-cover rounded bg-black/40 shrink-0"
            />
          )}
          <div className="flex-1 min-w-0">
            <div className="text-[12px] text-gray-300 group-hover:text-gray-100 line-clamp-2 transition-colors">
              {result.title}
            </div>
            <div className="text-[11px] text-gray-500 mt-0.5">{result.channel}</div>
          </div>
        </button>
      ))}
    </div>
  );
}
