import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { sectionText, searchQuery, reasoning, transcript } = req.body;
  if (!transcript || !searchQuery) {
    return res.status(400).json({ error: 'transcript and searchQuery are required' });
  }

  // Format transcript
  const formattedTranscript = transcript
    .map((seg) => {
      const mins = Math.floor(seg.start / 60);
      const secs = Math.floor(seg.start % 60);
      return `[${mins}:${secs.toString().padStart(2, '0')}] ${seg.text}`;
    })
    .join('\n');

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const result = await model.generateContent(
      `You are analyzing a YouTube video transcript to find the best B-roll segment for a Korean YouTube video.

CONTEXT: The script section this B-roll is for:
"${sectionText || 'N/A'}"

SEARCH INTENT: "${searchQuery}"
We want footage of: ${reasoning || searchQuery}

VIDEO TRANSCRIPT (timestamped):
${formattedTranscript}

Find the single best segment (10-60 seconds) that matches the search intent. Prioritize visual moments over talking.

Return JSON (no markdown fences):
{
  "start": <seconds>,
  "end": <seconds>,
  "confidence": "high" | "medium" | "low",
  "description": "<what happens in this segment>",
  "alternative": {
    "start": <seconds>,
    "end": <seconds>,
    "description": "<what happens in this segment>"
  }
}

Rules:
- Always return a primary pick AND one alternative
- Prefer moments with visual action over static talking
- Confidence: "high" if transcript clearly matches, "medium" if likely but uncertain, "low" if guessing
- If nothing matches well, say so in description`
    );

    const text = result.response.text().trim();
    const parsed = JSON.parse(text);
    return res.status(200).json(parsed);
  } catch (err) {
    console.error('Gemini find-segment error:', err);
    return res.status(500).json({ error: 'Failed to find segment' });
  }
}
