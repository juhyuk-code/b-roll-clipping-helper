import { useState, useEffect, useRef } from 'react';
import { suggestSearchTerms, findSegment } from '../lib/claude';
import { searchYouTube } from '../lib/youtube';
import { fetchTranscript } from '../lib/transcript';
import useStore, { generateBrollId } from '../store/useStore';

export default function TextSelectPopover({ selectedText, position, sectionId, onClose }) {
  const addBroll = useStore((s) => s.addBroll);
  const ref = useRef(null);

  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [customQuery, setCustomQuery] = useState('');
  const [searching, setSearching] = useState(null); // query being searched

  // Load AI suggestions
  useEffect(() => {
    async function load() {
      try {
        const terms = await suggestSearchTerms(selectedText);
        setSuggestions(terms);
      } catch (err) {
        console.error('Failed to get search suggestions:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [selectedText]);

  // Close on click outside
  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        onClose();
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [onClose]);

  const runPipeline = async (query) => {
    setSearching(query);
    try {
      // YouTube search
      const results = await searchYouTube(query, 3);
      if (results.length === 0) {
        setSearching(null);
        return;
      }

      const topResult = results[0];

      // Fetch transcript and find segment
      const transcript = await fetchTranscript(topResult.videoId);
      const segment = await findSegment('', query, '', transcript);

      addBroll(sectionId, {
        id: generateBrollId(),
        sectionId,
        source: 'text_select',
        ideaType: 'manual',
        searchQuery: query,
        videoId: topResult.videoId,
        videoTitle: topResult.title,
        channel: topResult.channel,
        start: segment.start,
        end: segment.end,
        confidence: segment.confidence,
        description: segment.description,
        alternative: segment.alternative || null,
        note: `From text: "${selectedText.substring(0, 50)}..."`,
        markedForDownload: false,
        removed: false,
      });

      onClose();
    } catch (err) {
      console.error('Text select pipeline error:', err);
      setSearching(null);
    }
  };

  const handleCustomSearch = () => {
    if (customQuery.trim()) {
      runPipeline(customQuery.trim());
    }
  };

  return (
    <div
      ref={ref}
      className="absolute z-40 w-72 bg-bg border border-border-light rounded-lg shadow-2xl"
      style={{
        top: position.y + 8,
        left: Math.min(position.x, window.innerWidth - 300),
      }}
    >
      {/* Selected text preview */}
      <div className="px-3 py-2 border-b border-border">
        <p className="text-[10px] text-gray-600 uppercase tracking-wide mb-1">Selected</p>
        <p className="text-[11px] text-gray-400 line-clamp-2">{selectedText}</p>
      </div>

      {/* Suggestions */}
      <div className="px-3 py-2 space-y-1.5">
        {loading ? (
          <div className="flex items-center gap-2 text-[11px] text-gray-500 py-2">
            <div className="w-3 h-3 border border-accent-amber border-t-transparent rounded-full animate-spin" />
            Generating suggestions...
          </div>
        ) : (
          suggestions.map((s, i) => (
            <button
              key={i}
              onClick={() => runPipeline(s.query)}
              disabled={!!searching}
              className="w-full text-left px-2 py-1.5 text-[11px] text-accent-amber hover:bg-accent-amber/10 rounded transition-colors disabled:opacity-50 disabled:cursor-wait"
              title={s.reasoning}
            >
              {searching === s.query ? (
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 border border-accent-amber border-t-transparent rounded-full animate-spin" />
                  Searching...
                </span>
              ) : (
                s.query
              )}
            </button>
          ))
        )}
      </div>

      {/* Custom search */}
      <div className="px-3 py-2 border-t border-border">
        <div className="flex gap-1.5">
          <input
            type="text"
            value={customQuery}
            onChange={(e) => setCustomQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCustomSearch()}
            placeholder="Custom search..."
            className="flex-1 px-2 py-1 text-[11px] bg-surface border border-border rounded text-gray-300 placeholder-gray-600 focus:outline-none focus:border-border-light"
            disabled={!!searching}
          />
          <button
            onClick={handleCustomSearch}
            disabled={!!searching || !customQuery.trim()}
            className="px-2 py-1 text-[11px] text-accent-amber hover:bg-accent-amber/10 rounded transition-colors disabled:opacity-50"
          >
            Go
          </button>
        </div>
      </div>
    </div>
  );
}
