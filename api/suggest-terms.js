import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { selectedText } = req.body;
  if (!selectedText) {
    return res.status(400).json({ error: 'selectedText is required' });
  }

  try {
    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: `The user selected this text from a Korean YouTube script:
"${selectedText}"

Suggest 4 YouTube search queries that would find good B-roll footage related to this text. Queries should be in English, 3-6 words, and specific enough to find relevant video footage (not news anchors talking).

Return JSON array (no markdown fences):
[
  { "query": "<search query>", "reasoning": "<why this works>" }
]`,
        },
      ],
    });

    const text = message.content[0].text.trim();
    const suggestions = JSON.parse(text);
    return res.status(200).json(suggestions);
  } catch (err) {
    console.error('Claude suggest-terms error:', err);
    return res.status(500).json({ error: 'Failed to suggest search terms' });
  }
}
