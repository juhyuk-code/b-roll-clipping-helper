import { useState, useEffect } from 'react';
import useStore, { generateBrollId } from '../store/useStore';
import { analyzeSections, findSegment } from '../lib/claude';
import { searchYouTube } from '../lib/youtube';
import { fetchTranscript } from '../lib/transcript';
import SearchResults from './SearchResults';
import TranscriptMatches from './TranscriptMatches';

export default function AddBrollModal({ section, onClose }) {
  const addBroll = useStore((s) => s.addBroll);

  const [suggestedQueries, setSuggestedQueries] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [transcriptMatches, setTranscriptMatches] = useState(null);
  const [transcriptLoading, setTranscriptLoading] = useState(false);

  // Load AI-suggested queries on mount
  useEffect(() => {
    async function loadSuggestions() {
      try {
        const ideas = await analyzeSections(section.text);
        setSuggestedQueries(ideas.map((i) => ({ query: i.query, type: i.type, reasoning: i.reasoning })));
      } catch (err) {
        console.error('Failed to get suggestions:', err);
      } finally {
        setLoadingSuggestions(false);
      }
    }
    loadSuggestions();
  }, [section.text]);

  const handleSearch = async (query) => {
    setSearchQuery(query);
    setSearchResults(null);
    setSelectedVideo(null);
    setTranscriptMatches(null);
    setSearchLoading(true);

    try {
      const results = await searchYouTube(query, 5);
      setSearchResults(results);
    } catch (err) {
      console.error('YouTube search error:', err);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSelectVideo = async (video) => {
    setSelectedVideo(video);
    setTranscriptLoading(true);
    setTranscriptMatches(null);

    try {
      const transcript = await fetchTranscript(video.videoId);
      const segment = await findSegment(section.text, searchQuery, '', transcript);

      // Convert to matches format
      const matches = [
        {
          start: segment.start,
          end: segment.end,
          confidence: segment.confidence,
          description: segment.description,
        },
      ];

      if (segment.alternative) {
        matches.push({
          start: segment.alternative.start,
          end: segment.alternative.end,
          confidence: 'medium',
          description: segment.alternative.description,
        });
      }

      setTranscriptMatches(matches);
    } catch (err) {
      console.error('Transcript analysis error:', err);
      // Fallback to default timestamps
      setTranscriptMatches([
        {
          start: 0,
          end: 30,
          confidence: 'unverified',
          description: 'Transcript unavailable — default timestamps',
        },
      ]);
    } finally {
      setTranscriptLoading(false);
    }
  };

  const handlePick = (match) => {
    addBroll(section.id, {
      id: generateBrollId(),
      sectionId: section.id,
      source: 'added',
      ideaType: 'manual',
      searchQuery,
      videoId: selectedVideo.videoId,
      videoTitle: selectedVideo.title,
      channel: selectedVideo.channel,
      start: match.start,
      end: match.end,
      confidence: match.confidence,
      description: match.description,
      alternative: null,
      note: '',
      markedForDownload: false,
      removed: false,
    });
    onClose();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      handleSearch(searchQuery.trim());
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-xl mx-4 max-h-[75vh] bg-bg border border-border-light rounded-xl shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div>
            <h3 className="text-sm font-semibold text-gray-200">Add B-Roll</h3>
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
          {/* Suggested queries */}
          {loadingSuggestions ? (
            <div className="flex items-center gap-2 text-[11px] text-gray-500">
              <div className="w-3 h-3 border border-accent-amber border-t-transparent rounded-full animate-spin" />
              Generating search ideas...
            </div>
          ) : (
            suggestedQueries.length > 0 && (
              <div>
                <div className="text-[11px] text-gray-500 font-medium uppercase tracking-wide mb-2">
                  Suggested Searches
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {suggestedQueries.map((sq, i) => (
                    <button
                      key={i}
                      onClick={() => handleSearch(sq.query)}
                      className="px-2.5 py-1.5 text-[11px] text-accent-amber bg-accent-amber/10 border border-accent-amber/20 rounded hover:bg-accent-amber/20 transition-colors"
                      title={sq.reasoning}
                    >
                      {sq.query}
                    </button>
                  ))}
                </div>
              </div>
            )
          )}

          {/* Manual search */}
          <div>
            <div className="flex gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search YouTube..."
                className="flex-1 px-3 py-2 text-sm bg-surface border border-border rounded text-gray-300 placeholder-gray-600 focus:outline-none focus:border-border-light"
              />
              <button
                onClick={() => searchQuery.trim() && handleSearch(searchQuery.trim())}
                className="px-4 py-2 text-sm bg-accent-amber/10 text-accent-amber border border-accent-amber/20 rounded hover:bg-accent-amber/20 transition-colors"
              >
                Search
              </button>
            </div>
          </div>

          {/* YouTube results */}
          <SearchResults
            results={searchResults}
            loading={searchLoading}
            onSelect={handleSelectVideo}
          />

          {/* Selected video info */}
          {selectedVideo && (
            <div className="px-3 py-2 rounded bg-white/[0.03] border border-border">
              <div className="text-[11px] text-gray-500">Selected:</div>
              <div className="text-[12px] text-gray-300">{selectedVideo.title}</div>
            </div>
          )}

          {/* Transcript matches */}
          <TranscriptMatches
            matches={transcriptMatches}
            loading={transcriptLoading}
            onPick={handlePick}
          />
        </div>
      </div>
    </div>
  );
}
