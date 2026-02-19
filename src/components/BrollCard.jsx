import { useState, useCallback } from 'react';
import useStore from '../store/useStore';
import RangeSlider from './RangeSlider';
import ConfidenceBadge from './ConfidenceBadge';
import AlternativeSegment from './AlternativeSegment';

const IDEA_TYPE_COLORS = {
  literal: 'bg-accent-blue/10 text-accent-blue border-accent-blue/20',
  abstract: 'bg-accent-purple/10 text-accent-purple border-accent-purple/20',
  entity: 'bg-accent-teal/10 text-accent-teal border-accent-teal/20',
  manual: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
};

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function BrollCard({ broll, sectionText }) {
  const updateBrollTimestamps = useStore((s) => s.updateBrollTimestamps);
  const toggleMarkForDownload = useStore((s) => s.toggleMarkForDownload);
  const removeBroll = useStore((s) => s.removeBroll);
  const swapAlternative = useStore((s) => s.swapAlternative);
  const [embedLoaded, setEmbedLoaded] = useState(false);
  const [showEmbed, setShowEmbed] = useState(false);

  const handleTimestampChange = useCallback(
    (newStart, newEnd) => {
      updateBrollTimestamps(broll.id, newStart, newEnd);
    },
    [broll.id, updateBrollTimestamps]
  );

  const youtubeEmbedUrl = `https://www.youtube.com/embed/${broll.videoId}?start=${broll.start}&end=${broll.end}&autoplay=0&rel=0`;

  return (
    <div
      className={`rounded-lg border transition-all ${
        broll.markedForDownload
          ? 'border-accent-green/40 bg-accent-green/[0.03]'
          : 'border-border bg-surface'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-3 pb-2">
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono font-medium rounded border ${
              IDEA_TYPE_COLORS[broll.ideaType] || IDEA_TYPE_COLORS.manual
            }`}
          >
            {broll.ideaType}
          </span>
          <ConfidenceBadge confidence={broll.confidence} />
        </div>

        <div className="flex items-center gap-1">
          {/* Mark for download toggle */}
          <button
            onClick={() => toggleMarkForDownload(broll.id)}
            className={`p-1.5 rounded transition-colors ${
              broll.markedForDownload
                ? 'text-accent-green hover:text-accent-green/80'
                : 'text-gray-600 hover:text-gray-400'
            }`}
            title={broll.markedForDownload ? 'Unmark for download' : 'Mark for download'}
          >
            <svg className="w-4 h-4" fill={broll.markedForDownload ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
          </button>

          {/* Open on YouTube */}
          <a
            href={`https://youtube.com/watch?v=${broll.videoId}&t=${broll.start}s`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 rounded text-gray-600 hover:text-gray-400 transition-colors"
            title="Open on YouTube"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
            </svg>
          </a>

          {/* Remove */}
          <button
            onClick={() => removeBroll(broll.id)}
            className="p-1.5 rounded text-gray-600 hover:text-accent-red transition-colors"
            title="Remove clip"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Script context */}
      {sectionText && (
        <div className="mx-4 mb-2 px-3 py-2 rounded bg-white/[0.02] border-l-2 border-accent-amber/30">
          <p className="text-[11px] text-gray-500 line-clamp-2">{sectionText}</p>
        </div>
      )}

      {/* YouTube embed (lazy) */}
      <div className="mx-4 mb-2">
        {!showEmbed ? (
          <button
            onClick={() => setShowEmbed(true)}
            className="w-full aspect-video rounded bg-black/40 border border-border flex items-center justify-center group hover:border-border-light transition-colors"
          >
            <div className="text-center">
              <svg className="w-10 h-10 mx-auto text-gray-600 group-hover:text-accent-red transition-colors" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
              <p className="text-[11px] text-gray-500 mt-2">
                {formatTime(broll.start)} — {formatTime(broll.end)}
              </p>
              <p className="text-[10px] text-gray-600 mt-1">Click to preview</p>
            </div>
          </button>
        ) : (
          <div className="w-full aspect-video rounded overflow-hidden bg-black">
            {!embedLoaded && (
              <div className="w-full h-full flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-gray-600 border-t-transparent rounded-full animate-spin" />
              </div>
            )}
            <iframe
              src={youtubeEmbedUrl}
              className={`w-full h-full ${embedLoaded ? '' : 'opacity-0 absolute'}`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              onLoad={() => setEmbedLoaded(true)}
            />
          </div>
        )}
      </div>

      {/* Range slider */}
      <div className="mx-4">
        <RangeSlider
          start={broll.start}
          end={broll.end}
          videoDuration={600}
          onChange={handleTimestampChange}
        />
      </div>

      {/* Clip info */}
      <div className="mx-4 mb-3">
        <div className="text-[12px] text-gray-300 font-medium truncate" title={broll.videoTitle}>
          {broll.videoTitle}
        </div>
        <div className="text-[11px] text-gray-500 mt-0.5">{broll.channel}</div>
        {broll.description && (
          <div className="text-[11px] text-gray-500 mt-1 italic">{broll.description}</div>
        )}

        {/* Alternative segment */}
        <AlternativeSegment
          alternative={broll.alternative}
          onSwap={() => swapAlternative(broll.id)}
        />
      </div>
    </div>
  );
}
