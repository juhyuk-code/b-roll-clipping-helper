import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { sectionText } = req.body;
  if (!sectionText) {
    return res.status(400).json({ error: 'sectionText is required' });
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const result = await model.generateContent(
      `You are a B-roll researcher for a Korean YouTube channel.

Given this narration section from a script, suggest exactly 3 YouTube search queries to find good B-roll footage.

SECTION TEXT:
"${sectionText}"

Return exactly 3 suggestions:

1. LITERAL — Search for the actual subject being discussed. What would you literally see if you were there?

2. ABSTRACT — Search for a visual metaphor or conceptual image. What visual represents the IDEA being discussed?

3. ENTITY — Search for a specific person, company, or institution that is highly relevant to this section.

For each, provide:
- type: literal | abstract | entity
- query: YouTube search query (English, 3-6 words, specific enough to find relevant footage, not news anchors)
- reasoning: one sentence explaining why this visual works

Return as JSON array. No markdown fences.`
    );

    const text = result.response.text().trim();
    const ideas = JSON.parse(text);
    return res.status(200).json(ideas);
  } catch (err) {
    console.error('Gemini analyze error:', err);
    return res.status(500).json({ error: 'Failed to analyze section' });
  }
}
