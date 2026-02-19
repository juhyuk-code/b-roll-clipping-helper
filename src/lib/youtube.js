/**
 * Client-side wrapper for YouTube search route.
 * Proxied through serverless function to protect API key.
 */

/**
 * Search YouTube for videos matching a query.
 * @param {string} query - Search query string
 * @param {number} maxResults - Maximum number of results (default 5)
 * @returns {Promise<Array<{videoId: string, title: string, channel: string, thumbnail: string}>>}
 */
export async function searchYouTube(query, maxResults = 5) {
  const params = new URLSearchParams({ q: query, maxResults: String(maxResults) });
  const res = await fetch(`/api/youtube-search?${params}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(err.error || `YouTube search error: ${res.status}`);
  }
  return res.json();
}

/**
 * Extract a YouTube video ID from various URL formats.
 * @param {string} url - YouTube URL
 * @returns {string|null} Video ID or null
 */
export function extractVideoId(url) {
  if (!url) return null;
  // Standard watch URL
  const watchMatch = url.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
  if (watchMatch) return watchMatch[1];
  // Short URL
  const shortMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
  if (shortMatch) return shortMatch[1];
  // Embed URL
  const embedMatch = url.match(/embed\/([a-zA-Z0-9_-]{11})/);
  if (embedMatch) return embedMatch[1];
  // Just the ID itself
  if (/^[a-zA-Z0-9_-]{11}$/.test(url)) return url;
  return null;
}
