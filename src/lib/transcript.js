/**
 * Client-side wrapper for transcript fetching with caching.
 */

const transcriptCache = new Map();

/**
 * Fetch a YouTube video transcript by video ID.
 * Results are cached in-memory for the session.
 *
 * @param {string} videoId - YouTube video ID
 * @returns {Promise<Array<{start: number, duration: number, text: string}>>}
 */
export async function fetchTranscript(videoId) {
  if (transcriptCache.has(videoId)) {
    return transcriptCache.get(videoId);
  }

  const res = await fetch(`/api/transcript?videoId=${encodeURIComponent(videoId)}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(err.error || `Transcript fetch error: ${res.status}`);
  }

  const data = await res.json();
  transcriptCache.set(videoId, data);
  return data;
}

/**
 * Format a transcript array into a readable timestamped string for Claude.
 * @param {Array<{start: number, duration: number, text: string}>} transcript
 * @returns {string}
 */
export function formatTranscriptForAI(transcript) {
  return transcript
    .map((seg) => {
      const mins = Math.floor(seg.start / 60);
      const secs = Math.floor(seg.start % 60);
      const timestamp = `${mins}:${secs.toString().padStart(2, '0')}`;
      return `[${timestamp}] ${seg.text}`;
    })
    .join('\n');
}

/**
 * Clear the transcript cache.
 */
export function clearTranscriptCache() {
  transcriptCache.clear();
}
