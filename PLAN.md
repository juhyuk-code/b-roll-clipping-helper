# B-Roll Script Analyzer — MVP Rehaul Plan

## Overview

Strip the app down to a **pure client-side** script analysis tool. No backend. User pastes script + meta prompt, clicks Analyze, Gemini returns per-sentence search terms and Veo3 prompts.

---

## Architecture

- **No backend** — call Gemini API directly from browser via `@google/generative-ai` SDK
- **No Zustand** — plain React `useState` is enough
- **Keep** React + Vite + Tailwind + existing dark theme

---

## 1. Files to Delete

**Entire `api/` directory** (6 serverless functions — all gone):
- `api/analyze.js`, `api/find-segment.js`, `api/search-in-video.js`
- `api/suggest-terms.js`, `api/transcript.js`, `api/youtube-search.js`

**All current components** (`src/components/*` — 15 files):
- DropZone, AnalyzingView, CuratorView, BrollCard, ScriptPanel, etc.

**All current libs** (`src/lib/*`):
- `claude.js`, `transcript.js`, `youtube.js`, `parser.js`, `export.js`

**Other**:
- `src/store/useStore.js` (+ remove `src/store/` dir)
- `src/BrollCurator.jsx`
- `src/hooks/` directory
- `vercel.json`, `.env.local.example`

**Dependencies to remove**: `zustand`, `youtube-transcript`

---

## 2. New File Structure

```
src/
  App.jsx                    — Main app, all state via useState
  main.jsx                   — (keep as-is)
  index.css                  — (keep as-is)
  lib/
    gemini.js                — Gemini SDK client: splitIntoSentences + analyzeScript
  components/
    ApiKeyInput.jsx          — Password input, persists to localStorage
    ScriptEditor.jsx         — Textarea for pasting script
    MetaPromptInput.jsx      — Textarea + .txt/.md file upload
    AnalyzeButton.jsx        — Button with loading/progress state
    ResultCard.jsx           — Single sentence result with copy buttons
    ResultsList.jsx          — Renders array of ResultCards + "Copy All"
```

---

## 3. Component Tree

```
App
├── Header (title + ApiKeyInput)
├── Main area
│   ├── ScriptEditor (textarea)
│   ├── MetaPromptInput (textarea + file upload)
│   └── AnalyzeButton
└── ResultsList
    └── ResultCard[] (one per sentence)
        ├── Sentence text
        ├── Search term pills (each with copy btn)
        └── Veo3 prompt block (with copy btn)
```

---

## 4. Data Flow

```
API Key (localStorage) ─┐
Script (textarea)       ─┼──→ analyzeScript() ──→ results[]
Meta Prompt (text/file) ─┘    (gemini.js)          └→ ResultCard[]
                               - split into sentences     - searchTerms[] (copy)
                               - call Gemini per sentence - veo3Prompt (copy)
                               - parse JSON responses
```

---

## 5. Key Implementation Details

### `src/lib/gemini.js`

**`splitIntoSentences(text)`** — Split on sentence-ending punctuation (`.!?。！？`), trim, filter empty.

**`analyzeScript(apiKey, scriptText, metaPrompt, onProgress)`**:
- Creates `GoogleGenerativeAI` instance with user's key
- Uses `gemini-2.5-flash` model
- Processes sentences in **batches of 5** (parallel within batch, sequential between) to avoid rate limits
- Per sentence, builds prompt: meta prompt + sentence + output format instruction
- Parses JSON response: `{ searchTerms: string[], veo3Prompt: string }`
- Returns `{ sentence, searchTerms, veo3Prompt, error? }[]`

### Per-sentence Gemini prompt structure:
```
{metaPrompt}

---
Analyze this sentence from a video script. Return JSON with:
- "searchTerms": array of 2-4 search terms for stock footage / b-roll
- "veo3Prompt": a detailed Veo3 video generation prompt

SENTENCE: "{sentence}"

Return ONLY valid JSON. No markdown fences.
```

### Copy mechanism
- `navigator.clipboard.writeText()` with fallback
- Each search term pill: individual copy button
- Veo3 prompt block: copy button
- ResultsList: "Copy All" exports formatted text

---

## 6. Implementation Steps

### Phase 1: Clean Slate
1. Delete all files listed above
2. Remove `zustand` and `youtube-transcript` from `package.json`
3. Run `npm install`
4. Simplify `vite.config.js` (remove server.proxy)

### Phase 2: Core Logic
5. Create `src/lib/gemini.js` (sentence splitting + Gemini API calls)

### Phase 3: UI Components (bottom-up)
6. Create `ApiKeyInput.jsx`
7. Create `ScriptEditor.jsx`
8. Create `MetaPromptInput.jsx`
9. Create `AnalyzeButton.jsx`
10. Create `ResultCard.jsx`
11. Create `ResultsList.jsx`

### Phase 4: Integration
12. Rewrite `App.jsx` — wire everything together
13. Update `index.html` title

### Phase 5: Test
14. Full flow test: key → script → meta prompt → analyze → copy results
15. Build and verify (`npm run build`)

---

## Not in Scope (MVP)

- No YouTube integration
- No video preview/playback
- No download/export of clips
- No complex state management
- No backend / serverless functions
- No persistence of results (refresh clears)
