import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { sectionText } = req.body;
  if (!sectionText) {
    return res.status(400).json({ error: 'sectionText is required' });
  }

  try {
    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: `You are a B-roll researcher for a Korean YouTube channel.

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

Return as JSON array. No markdown fences.`,
        },
      ],
    });

    const text = message.content[0].text.trim();
    const ideas = JSON.parse(text);
    return res.status(200).json(ideas);
  } catch (err) {
    console.error('Claude analyze error:', err);
    return res.status(500).json({ error: 'Failed to analyze section' });
  }
}
