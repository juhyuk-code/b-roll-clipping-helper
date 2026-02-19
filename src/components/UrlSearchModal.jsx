import { useState } from 'react';
import useStore, { generateBrollId } from '../store/useStore';
import { searchInVideo } from '../lib/claude';
import { fetchTranscript } from '../lib/transcript';
import { extractVideoId } from '../lib/youtube';
import TranscriptMatches from './TranscriptMatches';

export default function UrlSearchModal({ section, onClose }) {
  const addBroll = useStore((s) => s.addBroll);

  const [url, setUrl] = useState('');
  const [prompt, setPrompt] = useState('');
  const [matches, setMatches] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [videoInfo, setVideoInfo] = useState(null);

  const handleSearch = async () => {
    const videoId = extractVideoId(url);
    if (!videoId) {
      setError('Invalid YouTube URL');
      return;
    }
    if (!prompt.trim()) {
      setError('Please describe what you are looking for');
      return;
    }

    setError(null);
    setLoading(true);
    setMatches(null);
    setVideoInfo({ videoId });

    try {
      const transcript = await fetchTranscript(videoId);
      const results = await searchInVideo(prompt.trim(), transcript);
      setMatches(results);
    } catch (err) {
      console.error('URL search error:', err);
      setError('Failed to search video. It may not have captions available.');
    } finally {
      setLoading(false);
    }
  };

  const handlePick = (match) => {
    addBroll(section.id, {
      id: generateBrollId(),
      sectionId: section.id,
      source: 'url_search',
      ideaType: 'manual',
      searchQuery: prompt,
      videoId: videoInfo.videoId,
      videoTitle: url,
      channel: 'Manual URL',
      start: match.start,
      end: match.end,
      confidence: match.confidence,
      description: match.description,
      alternative: null,
      note: prompt,
      markedForDownload: false,
      removed: false,
    });
    onClose();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-xl mx-4 max-h-[75vh] bg-bg border border-border-light rounded-xl shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div>
            <h3 className="text-sm font-semibold text-gray-200">Add from URL</h3>
            <p className="text-[11px] text-gray-500 mt-0.5">Section: {section.heading}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded text-gray-500 hover:text-gray-300 hover:bg-white/[0.06] transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {/* URL input */}
          <div>
            <label className="block text-[11px] text-gray-500 font-medium uppercase tracking-wide mb-1.5">
              YouTube URL
            </label>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://youtube.com/watch?v=..."
              className="w-full px-3 py-2 text-sm bg-surface border border-border rounded text-gray-300 placeholder-gray-600 focus:outline-none focus:border-border-light"
            />
          </div>

          {/* Prompt input */}
          <div>
            <label className="block text-[11px] text-gray-500 font-medium uppercase tracking-wide mb-1.5">
              What are you looking for?
            </label>
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Find the part where Jensen talks about sovereign AI"
              className="w-full px-3 py-2 text-sm bg-surface border border-border rounded text-gray-300 placeholder-gray-600 focus:outline-none focus:border-border-light"
            />
          </div>

          {/* Search button */}
          <button
            onClick={handleSearch}
            disabled={loading}
            className="w-full py-2 text-sm bg-accent-amber/10 text-accent-amber border border-accent-amber/20 rounded hover:bg-accent-amber/20 transition-colors disabled:opacity-50"
          >
            {loading ? 'Searching...' : 'Search in Video'}
          </button>

          {/* Error */}
          {error && (
            <div className="px-3 py-2 rounded bg-accent-red/10 border border-accent-red/20">
              <p className="text-[12px] text-accent-red">{error}</p>
            </div>
          )}

          {/* Results */}
          <TranscriptMatches
            matches={matches}
            loading={loading}
            onPick={handlePick}
          />
        </div>
      </div>
    </div>
  );
}
