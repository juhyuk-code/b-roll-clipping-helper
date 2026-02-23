import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userPrompt, transcript } = req.body;
  if (!userPrompt || !transcript) {
    return res.status(400).json({ error: 'userPrompt and transcript are required' });
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
      `The user wants to find a specific moment in this YouTube video.

USER PROMPT: "${userPrompt}"

VIDEO TRANSCRIPT (timestamped):
${formattedTranscript}

Find 1-3 segments that best match what the user is looking for. Each segment should be 10-60 seconds.

Return JSON array (no markdown fences):
[
  {
    "start": <seconds>,
    "end": <seconds>,
    "confidence": "high" | "medium" | "low",
    "description": "<what happens>",
    "excerpt": "<relevant transcript text>"
  }
]

Rules:
- Return up to 3 matches, ranked by relevance
- If nothing matches, return empty array
- Include the actual transcript text in "excerpt"`
    );

    let text = result.response.text().trim();
    // Strip markdown code fences that Gemini sometimes adds
    text = text.replace(/^```(?:json)?\s*\n?/i, '').replace(/\n?\s*```$/i, '');
    const results = JSON.parse(text);
    return res.status(200).json(results);
  } catch (err) {
    console.error('Gemini search-in-video error:', err);
    return res.status(500).json({ error: 'Failed to search in video' });
  }
}
