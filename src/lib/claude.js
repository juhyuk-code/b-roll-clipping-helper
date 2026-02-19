/**
 * Client-side wrappers for Claude API routes.
 * All calls go through Vercel serverless functions to keep API keys server-side.
 */

/**
 * Analyze a script section and get 3 B-roll ideas (literal, abstract, entity).
 * @param {string} sectionText - The narration section text
 * @returns {Promise<Array<{type: string, query: string, reasoning: string}>>}
 */
export async function analyzeSections(sectionText) {
  const res = await fetch('/api/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sectionText }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(err.error || `API error: ${res.status}`);
  }
  return res.json();
}

/**
 * Find the best segment in a transcript for a given search intent.
 * @param {string} sectionText - The narration context
 * @param {string} searchQuery - The search intent
 * @param {string} reasoning - Why this visual works
 * @param {Array} transcript - Timestamped transcript segments
 * @returns {Promise<{start: number, end: number, confidence: string, description: string, alternative: object}>}
 */
export async function findSegment(sectionText, searchQuery, reasoning, transcript) {
  const res = await fetch('/api/find-segment', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sectionText, searchQuery, reasoning, transcript }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(err.error || `API error: ${res.status}`);
  }
  return res.json();
}

/**
 * Get AI-suggested search terms from selected script text.
 * @param {string} selectedText - User-selected text from script
 * @returns {Promise<Array<{query: string, reasoning: string}>>}
 */
export async function suggestSearchTerms(selectedText) {
  const res = await fetch('/api/suggest-terms', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ selectedText }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(err.error || `API error: ${res.status}`);
  }
  return res.json();
}

/**
 * Search within a specific video using a natural-language prompt.
 * @param {string} userPrompt - What the user is looking for
 * @param {Array} transcript - Timestamped transcript segments
 * @returns {Promise<Array<{start: number, end: number, confidence: string, description: string, excerpt: string}>>}
 */
export async function searchInVideo(userPrompt, transcript) {
  const res = await fetch('/api/search-in-video', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userPrompt, transcript }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(err.error || `API error: ${res.status}`);
  }
  return res.json();
}
