import { create } from 'zustand';

/**
 * App states: EMPTY → PARSING → ANALYZING → CURATING
 */

let brollIdCounter = 0;
export function generateBrollId() {
  return `broll_${Date.now()}_${++brollIdCounter}`;
}

const useStore = create((set, get) => ({
  // App state
  appState: 'EMPTY', // EMPTY | PARSING | ANALYZING | CURATING
  setAppState: (state) => set({ appState: state }),

  // Script data
  script: null, // { title, sections }
  setScript: (script) => set({ script }),

  // Analysis progress per section
  // { [sectionId]: 'idle' | 'analyzing' | 'searching' | 'transcribing' | 'done' | 'error' }
  analysisProgress: {},
  setAnalysisProgress: (sectionId, status) =>
    set((state) => ({
      analysisProgress: { ...state.analysisProgress, [sectionId]: status },
    })),

  // Update a section's brollIdeas
  setSectionBrollIdeas: (sectionId, ideas) =>
    set((state) => ({
      script: state.script
        ? {
            ...state.script,
            sections: state.script.sections.map((s) =>
              s.id === sectionId ? { ...s, brollIdeas: ideas } : s
            ),
          }
        : null,
    })),

  // Add a broll clip to a section
  addBroll: (sectionId, broll) =>
    set((state) => ({
      script: state.script
        ? {
            ...state.script,
            sections: state.script.sections.map((s) =>
              s.id === sectionId ? { ...s, brolls: [...s.brolls, broll] } : s
            ),
          }
        : null,
    })),

  // Update a broll clip
  updateBroll: (brollId, updates) =>
    set((state) => ({
      script: state.script
        ? {
            ...state.script,
            sections: state.script.sections.map((s) => ({
              ...s,
              brolls: s.brolls.map((b) =>
                b.id === brollId ? { ...b, ...updates } : b
              ),
            })),
          }
        : null,
    })),

  // Soft-remove a broll clip
  removeBroll: (brollId) =>
    set((state) => ({
      script: state.script
        ? {
            ...state.script,
            sections: state.script.sections.map((s) => ({
              ...s,
              brolls: s.brolls.map((b) =>
                b.id === brollId ? { ...b, removed: true } : b
              ),
            })),
          }
        : null,
    })),

  // Toggle mark for download
  toggleMarkForDownload: (brollId) =>
    set((state) => ({
      script: state.script
        ? {
            ...state.script,
            sections: state.script.sections.map((s) => ({
              ...s,
              brolls: s.brolls.map((b) =>
                b.id === brollId
                  ? { ...b, markedForDownload: !b.markedForDownload }
                  : b
              ),
            })),
          }
        : null,
    })),

  // Update broll timestamps
  updateBrollTimestamps: (brollId, start, end) =>
    set((state) => ({
      script: state.script
        ? {
            ...state.script,
            sections: state.script.sections.map((s) => ({
              ...s,
              brolls: s.brolls.map((b) =>
                b.id === brollId ? { ...b, start, end } : b
              ),
            })),
          }
        : null,
    })),

  // Swap alternative segment into primary
  swapAlternative: (brollId) =>
    set((state) => ({
      script: state.script
        ? {
            ...state.script,
            sections: state.script.sections.map((s) => ({
              ...s,
              brolls: s.brolls.map((b) => {
                if (b.id !== brollId || !b.alternative) return b;
                return {
                  ...b,
                  start: b.alternative.start,
                  end: b.alternative.end,
                  description: b.alternative.description,
                  alternative: {
                    start: b.start,
                    end: b.end,
                    description: b.description,
                  },
                };
              }),
            })),
          }
        : null,
    })),

  // Script panel visibility
  scriptPanelOpen: false,
  setScriptPanelOpen: (open) => set({ scriptPanelOpen: open }),
  toggleScriptPanel: () => set((state) => ({ scriptPanelOpen: !state.scriptPanelOpen })),

  // Computed: all marked brolls
  getMarkedBrolls: () => {
    const state = get();
    if (!state.script) return [];
    return state.script.sections.flatMap((s) =>
      s.brolls.filter((b) => b.markedForDownload && !b.removed)
    );
  },

  // Computed: marked count and total duration
  getMarkedStats: () => {
    const marked = get().getMarkedBrolls();
    const count = marked.length;
    const totalDuration = marked.reduce((acc, b) => acc + (b.end - b.start), 0);
    return { count, totalDuration };
  },
}));

export default useStore;
