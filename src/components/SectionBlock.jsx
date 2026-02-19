import { useState } from 'react';
import BrollCard from './BrollCard';

const IDEA_TYPE_COLORS = {
  literal: 'bg-accent-blue/10 text-accent-blue border-accent-blue/20',
  abstract: 'bg-accent-purple/10 text-accent-purple border-accent-purple/20',
  entity: 'bg-accent-teal/10 text-accent-teal border-accent-teal/20',
};

export default function SectionBlock({ section, onAddBroll, onAddFromUrl }) {
  const [collapsed, setCollapsed] = useState(false);
  const visibleBrolls = section.brolls.filter((b) => !b.removed);
  const markedCount = visibleBrolls.filter((b) => b.markedForDownload).length;

  return (
    <div className="mb-6">
      {/* Section header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="flex items-center gap-2 text-left group"
          >
            <svg
              className={`w-3.5 h-3.5 text-gray-500 transition-transform ${collapsed ? '' : 'rotate-90'}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
            <h2 className="text-sm font-semibold text-gray-200 group-hover:text-gray-100 transition-colors">
              {section.heading}
            </h2>
          </button>

          <span className="text-[11px] text-gray-500 font-mono">
            {visibleBrolls.length} clip{visibleBrolls.length !== 1 ? 's' : ''}
            {markedCount > 0 && (
              <span className="text-accent-green ml-1">({markedCount} marked)</span>
            )}
          </span>

          {/* Idea type tags */}
          <div className="flex items-center gap-1">
            {section.brollIdeas.map((idea) => (
              <span
                key={idea.id}
                className={`px-1.5 py-0.5 text-[9px] font-mono rounded border ${
                  IDEA_TYPE_COLORS[idea.type] || ''
                }`}
              >
                {idea.type}
              </span>
            ))}
          </div>
        </div>

        {/* Add buttons */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => onAddBroll(section)}
            className="flex items-center gap-1 px-2 py-1 text-[11px] text-gray-500 hover:text-accent-amber hover:bg-accent-amber/10 rounded transition-colors"
            title="Search for more B-roll"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Add
          </button>
          <button
            onClick={() => onAddFromUrl(section)}
            className="flex items-center gap-1 px-2 py-1 text-[11px] text-gray-500 hover:text-accent-amber hover:bg-accent-amber/10 rounded transition-colors"
            title="Add from YouTube URL"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m9.86-1.06a4.5 4.5 0 00-1.242-7.244l-4.5-4.5a4.5 4.5 0 00-6.364 6.364L4.34 8.342" />
            </svg>
            URL
          </button>
        </div>
      </div>

      {/* Section text preview */}
      {!collapsed && (
        <div className="mb-3 pl-5">
          <p className="text-[11px] text-gray-600 line-clamp-2">{section.text}</p>
        </div>
      )}

      {/* B-roll cards */}
      {!collapsed && (
        <div className="space-y-3 pl-5">
          {visibleBrolls.length === 0 && (
            <div className="py-6 text-center text-[12px] text-gray-600 border border-dashed border-border rounded-lg">
              No B-roll clips yet. Click (+) to add.
            </div>
          )}
          {visibleBrolls.map((broll) => (
            <BrollCard
              key={broll.id}
              broll={broll}
              sectionText={section.text}
            />
          ))}
        </div>
      )}
    </div>
  );
}
