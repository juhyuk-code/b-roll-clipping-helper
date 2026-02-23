import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { selectedText } = req.body;
  if (!selectedText) {
    return res.status(400).json({ error: 'selectedText is required' });
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const result = await model.generateContent(
      `The user selected this text from a Korean YouTube script:
"${selectedText}"

Suggest 4 YouTube search queries that would find good B-roll footage related to this text. Queries should be in English, 3-6 words, and specific enough to find relevant video footage (not news anchors talking).

Return JSON array (no markdown fences):
[
  { "query": "<search query>", "reasoning": "<why this works>" }
]`
    );

    let text = result.response.text().trim();
    // Strip markdown code fences that Gemini sometimes adds
    text = text.replace(/^```(?:json)?\s*\n?/i, '').replace(/\n?\s*```$/i, '');
    const suggestions = JSON.parse(text);
    return res.status(200).json(suggestions);
  } catch (err) {
    console.error('Gemini suggest-terms error:', err);
    return res.status(500).json({ error: 'Failed to suggest search terms' });
  }
}
