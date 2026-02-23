import ResultCard from './ResultCard';

function formatAllResults(results) {
  return results
    .map((r, i) => {
      const terms = r.searchTerms.join(', ');
      return `#${i + 1}: ${r.sentence}\nSearch Terms: ${terms}\nVeo3 Prompt: ${r.veo3Prompt}`;
    })
    .join('\n\n---\n\n');
}

export default function ResultsList({ results }) {
  if (!results) return null;

  const successCount = results.filter((r) => !r.error).length;
  const totalTerms = results.reduce((sum, r) => sum + r.searchTerms.length, 0);

  async function copyAll() {
    const text = formatAllResults(results);
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          {successCount} sentences analyzed &middot; {totalTerms} search terms &middot; {successCount} Veo3 prompts
        </p>
        <button
          onClick={copyAll}
          className="text-xs px-3 py-1.5 rounded border border-border hover:border-border-light text-gray-400 hover:text-gray-200 transition-colors"
        >
          Copy All
        </button>
      </div>

      {/* Cards */}
      {results.map((result, i) => (
        <ResultCard key={i} result={result} index={i} />
      ))}
    </div>
  );
}
