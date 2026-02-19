/**
 * Serverless function to fetch YouTube video transcripts.
 * Uses the youtube-transcript library as a proxy to avoid CORS.
 */

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { videoId } = req.query;
  if (!videoId) {
    return res.status(400).json({ error: 'videoId query parameter is required' });
  }

  try {
    // Dynamically import to handle the ESM module
    const { YoutubeTranscript } = await import('youtube-transcript');
    const transcript = await YoutubeTranscript.fetchTranscript(videoId);

    // Normalize the response format
    const segments = transcript.map((seg) => ({
      start: seg.offset / 1000, // Convert ms to seconds
      duration: seg.duration / 1000,
      text: seg.text,
    }));

    return res.status(200).json(segments);
  } catch (err) {
    console.error('Transcript fetch error:', err);

    // Return empty transcript with flag if unavailable
    if (
      err.message?.includes('No transcript') ||
      err.message?.includes('disabled') ||
      err.message?.includes('not available')
    ) {
      return res.status(404).json({ error: 'No transcript available for this video' });
    }

    return res.status(500).json({ error: 'Failed to fetch transcript' });
  }
}
