# B-roll Clipping Helper: Architecture Review

This review is based on the current prototype component in `src/BrollCurator.jsx` and the fuller version shared in the request.

## Executive summary

The prototype demonstrates a strong **interaction concept** (context-aware clip cards + script-driven discovery), but the architecture is still a **single-component prototype architecture**. It will be difficult to scale safely into production without separating UI, state, and integration boundaries.

Highest-risk flaws:

1. **State consistency issues** (clip timestamp edits can diverge from global state).
2. **Critical actions are UI-only** (mark/download/research are not wired to durable workflows).
3. **No domain boundary** (no typed schema or validation between OpenClaw output, UI state, and downloader input).
4. **Accessibility and input-model gaps** (slider is mouse-only; limited keyboard/screen-reader support).
5. **Scalability/performance concerns** from monolithic rendering and inline styles.

---

## Deep architecture findings

## 1) Domain model and data contracts

- The prototype relies on implicit object shapes in component state (`script -> sections -> brolls`) without runtime/schema validation. If OpenClaw output changes shape, the UI will silently break or render invalid data.
- IDs are generated with `Date.now()`, which is collision-prone in burst inserts and unsuitable for distributed or concurrent usage.
- `duration` is stored per clip, but display/selection logic can use hardcoded duration assumptions (in the full version, slider duration is fixed to 600).

**Recommendation**
- Introduce a typed domain schema and parser (e.g., Zod/io-ts) at ingestion boundaries.
- Use stable UUID/ULID IDs.
- Canonicalize clip model as `{sourceVideoId, sourceDuration, inPoint, outPoint, status}` and derive display duration.

## 2) State management and synchronization flaws

- Clip range edits are often managed in local card state in the prototype pattern, while parent state remains authoritative for rendering lists/download logic. This causes drift: UI can show updated range but downstream actions still use stale values.
- `markedForDownload` state exists but key actions are not connected end-to-end to this set.
- Temporary async states (e.g., re-search loading overlays) are not tied to cancellable requests; race conditions can overwrite newer results.

**Recommendation**
- Move clip edits to a single source of truth (store/reducer).
- Use optimistic updates with request IDs and cancellation tokens.
- Treat each clip as a small state machine: `idle -> searching -> ready -> marked -> downloading -> done/error`.

## 3) UI composition and maintainability

- A large monolithic component combines:
  - data model
  - side effects
  - interaction logic
  - rendering
  - styling
- Heavy inline style objects are recreated on each render, reducing readability and limiting theming.

**Recommendation**
- Split into modules: `domain/`, `services/`, `features/script-panel`, `features/clip-card`, `features/download-queue`.
- Extract style system (CSS modules/Tailwind/vanilla-extract) and design tokens.

## 4) Integration boundary flaws (OpenClaw/YouTube/yt-dlp)

- The flow suggests OpenClaw search and yt-dlp download, but the prototype has no durable job orchestration boundary.
- If browser UI directly triggers downloads for arbitrary URLs/timestamps, there are security and reliability risks.

**Recommendation**
- Add backend API with explicit commands:
  - `POST /scripts/:id/research`
  - `POST /clips/:id/mark`
  - `POST /downloads/jobs`
- Downloader should run server-side worker queue with allowlisted domains, bounded duration, retries, and artifact tracking.

## 5) Accessibility + UX integrity gaps

- Slider interaction is mouse-centric and does not support pointer/touch/keyboard robustly.
- Embedded iframe-heavy cards can be expensive and may reduce usability without lazy-loading/thumbnail-first strategy.

**Recommendation**
- Replace with accessible dual-range control semantics (keyboard arrows/PageUp/PageDown).
- Defer iframe loading until user intent (preview click).

## 6) Missing reliability safeguards

- No persistence strategy is shown (refresh loses user curation state).
- No autosave/versioning/conflict handling for collaborative or resumed sessions.

**Recommendation**
- Persist script+clip edits to backend or local-first DB with sync.
- Add draft version and audit log for changed timestamps and rejected suggestions.

---

## Proposed target architecture (v1)

- **Frontend (React)**
  - Feature modules per bounded context.
  - Global store (Zustand/Redux Toolkit) for script + clips + download queue.
  - API client layer isolated from components.

- **Backend API**
  - Script ingestion + OpenClaw suggestion endpoint.
  - Clip curation endpoints (create/update/remove/mark).
  - Download job orchestration endpoint.

- **Worker layer**
  - yt-dlp task executor.
  - Media clipping/normalization pipeline.
  - Artifact storage + signed URL return.

- **Data layer**
  - Tables/collections: `scripts`, `sections`, `clips`, `download_jobs`, `download_items`, `artifacts`.

---

## Priority remediation plan

1. Refactor to a single source of truth for clip edits and mark state.
2. Add typed schema validation for OpenClaw payloads.
3. Implement backend download queue; remove direct client-side download coupling.
4. Add persistence + autosave for all curation actions.
5. Improve accessibility for slider and core controls.
6. Optimize performance via component splitting + lazy media previews.

