import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Split script text into sentences.
 * Handles English (.!?) and Korean (。！？) sentence endings.
 */
export function splitIntoSentences(text) {
  return text
    .split(/(?<=[.!?。！？])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

/**
 * Analyze a single sentence with Gemini.
 */
async function analyzeSingle(model, sentence, metaPrompt) {
  const prompt = `${metaPrompt}

---

Analyze the following sentence from a video script. Return a JSON object with:
- "searchTerms": an array of 2-4 search terms for finding stock footage or b-roll visuals
- "veo3Prompt": a detailed prompt for Veo3 AI video generation that would create a matching visual

SENTENCE:
"${sentence}"

Return ONLY valid JSON. No markdown fences, no explanation.`;

  try {
    const result = await model.generateContent(prompt);
    let text = result.response.text().trim();
    // Strip markdown code fences
    text = text.replace(/^```(?:json)?\s*\n?/i, '').replace(/\n?\s*```$/i, '');
    const parsed = JSON.parse(text);
    return {
      sentence,
      searchTerms: parsed.searchTerms || [],
      veo3Prompt: parsed.veo3Prompt || '',
    };
  } catch (err) {
    return {
      sentence,
      searchTerms: [],
      veo3Prompt: '',
      error: err.message || 'Failed to analyze',
    };
  }
}

/**
 * Analyze an entire script: split into sentences, call Gemini for each,
 * return structured results.
 *
 * @param {string} apiKey - Gemini API key
 * @param {string} scriptText - The full script text
 * @param {string} metaPrompt - User-defined meta prompt for Gemini
 * @param {(progress: {current: number, total: number}) => void} onProgress
 * @returns {Promise<Array<{sentence: string, searchTerms: string[], veo3Prompt: string, error?: string}>>}
 */
export async function analyzeScript(apiKey, scriptText, metaPrompt, onProgress) {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  const sentences = splitIntoSentences(scriptText);
  if (sentences.length === 0) {
    throw new Error('No sentences found in the script.');
  }

  onProgress?.({ current: 0, total: sentences.length });

  const results = [];
  const BATCH_SIZE = 5;

  for (let i = 0; i < sentences.length; i += BATCH_SIZE) {
    const batch = sentences.slice(i, i + BATCH_SIZE);
    const batchResults = await Promise.all(
      batch.map((sentence) => analyzeSingle(model, sentence, metaPrompt))
    );
    results.push(...batchResults);
    onProgress?.({ current: results.length, total: sentences.length });
  }

  return results;
}
