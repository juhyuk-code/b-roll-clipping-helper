/**
 * Proxy for YouTube Data API v3 search.
 * Keeps API key server-side.
 */
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { q, maxResults = '5' } = req.query;
  if (!q) {
    return res.status(400).json({ error: 'q query parameter is required' });
  }

  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'YouTube API key not configured' });
  }

  try {
    const params = new URLSearchParams({
      part: 'snippet',
      q,
      maxResults,
      type: 'video',
      key: apiKey,
    });

    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?${params}`
    );

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      console.error('YouTube API error:', err);
      return res.status(response.status).json({
        error: err.error?.message || 'YouTube API error',
      });
    }

    const data = await response.json();
    const results = (data.items || []).map((item) => ({
      videoId: item.id.videoId,
      title: item.snippet.title,
      channel: item.snippet.channelTitle,
      thumbnail: item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url,
    }));

    return res.status(200).json(results);
  } catch (err) {
    console.error('YouTube search error:', err);
    return res.status(500).json({ error: 'Failed to search YouTube' });
  }
}
