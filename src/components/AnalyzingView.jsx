import { useEffect } from 'react';
import useStore, { generateBrollId } from '../store/useStore';
import { analyzeSections, findSegment } from '../lib/claude';
import { searchYouTube } from '../lib/youtube';
import { fetchTranscript } from '../lib/transcript';

const STATUS_LABELS = {
  idle: 'Waiting...',
  analyzing: 'Analyzing with AI...',
  searching: 'Searching YouTube...',
  transcribing: 'Finding timestamps...',
  done: 'Complete',
  error: 'Error',
};

const STATUS_COLORS = {
  idle: 'text-gray-600',
  analyzing: 'text-accent-amber',
  searching: 'text-accent-amber',
  transcribing: 'text-accent-amber',
  done: 'text-accent-green',
  error: 'text-accent-red',
};

function SectionProgress({ section, status }) {
  return (
    <div className="flex items-center gap-3 py-3 px-4 rounded-md bg-surface border border-border">
      <div className="flex-1">
        <div className="text-sm text-gray-300 font-medium">{section.heading}</div>
        <div className={`text-xs mt-0.5 ${STATUS_COLORS[status] || 'text-gray-600'}`}>
          {STATUS_LABELS[status] || status}
        </div>
      </div>

      {(status === 'analyzing' || status === 'searching' || status === 'transcribing') && (
        <div className="w-4 h-4 border-2 border-accent-amber border-t-transparent rounded-full animate-spin" />
      )}

      {status === 'done' && (
        <svg className="w-5 h-5 text-accent-green" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      )}

      {status === 'error' && (
        <svg className="w-5 h-5 text-accent-red" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      )}
    </div>
  );
}

export default function AnalyzingView() {
  const script = useStore((s) => s.script);
  const analysisProgress = useStore((s) => s.analysisProgress);
  const setAnalysisProgress = useStore((s) => s.setAnalysisProgress);
  const setSectionBrollIdeas = useStore((s) => s.setSectionBrollIdeas);
  const addBroll = useStore((s) => s.addBroll);
  const setAppState = useStore((s) => s.setAppState);

  useEffect(() => {
    if (!script) return;

    const narrationSections = script.sections.filter(
      (s) => s.type === 'narration' && s.brollIdeas.length === 0
    );

    async function processSections() {
      // Process all sections in parallel
      await Promise.all(narrationSections.map((section) => processSection(section)));

      // All done, move to curating
      setAppState('CURATING');
    }

    async function processSection(section) {
      try {
        // Stage 1: Claude analysis
        setAnalysisProgress(section.id, 'analyzing');
        const ideas = await analyzeSections(section.text);
        const brollIdeas = ideas.map((idea, i) => ({
          id: `idea_${section.id}_${i}`,
          type: idea.type,
          searchQuery: idea.query,
          reasoning: idea.reasoning,
          searched: false,
        }));
        setSectionBrollIdeas(section.id, brollIdeas);

        // Stage 2: YouTube search (parallel for all 3 ideas)
        setAnalysisProgress(section.id, 'searching');
        const searchResults = await Promise.all(
          brollIdeas.map(async (idea) => {
            try {
              const results = await searchYouTube(idea.searchQuery, 5);
              return { idea, results };
            } catch {
              return { idea, results: [] };
            }
          })
        );

        // Stage 3: Transcript + timestamp (parallel for top results)
        setAnalysisProgress(section.id, 'transcribing');
        await Promise.all(
          searchResults.map(async ({ idea, results }) => {
            if (results.length === 0) return;
            const topResult = results[0];

            try {
              const transcript = await fetchTranscript(topResult.videoId);
              const segment = await findSegment(
                section.text,
                idea.searchQuery,
                idea.reasoning,
                transcript
              );

              addBroll(section.id, {
                id: generateBrollId(),
                sectionId: section.id,
                source: 'initial',
                ideaType: idea.type,
                searchQuery: idea.searchQuery,
                videoId: topResult.videoId,
                videoTitle: topResult.title,
                channel: topResult.channel,
                start: segment.start,
                end: segment.end,
                confidence: segment.confidence,
                description: segment.description,
                alternative: segment.alternative || null,
                note: idea.reasoning,
                markedForDownload: false,
                removed: false,
              });
            } catch {
              // Fallback: add with default timestamps and unverified
              addBroll(section.id, {
                id: generateBrollId(),
                sectionId: section.id,
                source: 'initial',
                ideaType: idea.type,
                searchQuery: idea.searchQuery,
                videoId: topResult.videoId,
                videoTitle: topResult.title,
                channel: topResult.channel,
                start: 0,
                end: 30,
                confidence: 'unverified',
                description: 'Transcript unavailable — default timestamps',
                alternative: null,
                note: idea.reasoning,
                markedForDownload: false,
                removed: false,
              });
            }
          })
        );

        setAnalysisProgress(section.id, 'done');
      } catch (err) {
        console.error(`Error processing section ${section.heading}:`, err);
        setAnalysisProgress(section.id, 'error');
      }
    }

    processSections();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (!script) return null;

  const narrationSections = script.sections.filter((s) => s.type === 'narration');
  const totalDone = narrationSections.filter(
    (s) => analysisProgress[s.id] === 'done' || analysisProgress[s.id] === 'error'
  ).length;

  return (
    <div className="flex items-center justify-center min-h-screen px-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <h1 className="text-xl font-semibold text-gray-100 mb-1">{script.title}</h1>
          <p className="text-sm text-gray-500">
            Analyzing {narrationSections.length} sections... ({totalDone}/{narrationSections.length})
          </p>
        </div>

        {/* Progress bar */}
        <div className="w-full h-1 bg-surface rounded-full mb-6 overflow-hidden">
          <div
            className="h-full bg-accent-green transition-all duration-500"
            style={{ width: `${(totalDone / narrationSections.length) * 100}%` }}
          />
        </div>

        <div className="space-y-2">
          {narrationSections.map((section) => (
            <SectionProgress
              key={section.id}
              section={section}
              status={analysisProgress[section.id] || 'idle'}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
