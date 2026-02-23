import { useState } from 'react';

function CopyButton({ text, label }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
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
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <button
      onClick={handleCopy}
      className="text-xs px-1.5 py-0.5 rounded border border-border hover:border-border-light text-gray-500 hover:text-gray-300 transition-colors shrink-0"
    >
      {copied ? 'Copied!' : label || 'Copy'}
    </button>
  );
}

export default function ResultCard({ result, index }) {
  if (result.error) {
    return (
      <div className="bg-surface border border-border rounded-lg p-4">
        <div className="flex items-start gap-2 mb-2">
          <span className="text-xs text-gray-600 font-mono shrink-0">#{index + 1}</span>
          <p className="text-sm text-gray-300">{result.sentence}</p>
        </div>
        <p className="text-xs text-accent-red mt-2">Error: {result.error}</p>
      </div>
    );
  }

  return (
    <div className="bg-surface border border-border rounded-lg p-4">
      {/* Sentence */}
      <div className="flex items-start gap-2 mb-3">
        <span className="text-xs text-gray-600 font-mono shrink-0">#{index + 1}</span>
        <p className="text-sm text-gray-400">{result.sentence}</p>
      </div>

      {/* Search Terms */}
      <div className="mb-3">
        <div className="text-xs text-gray-500 mb-1.5">Search Terms</div>
        <div className="flex flex-wrap gap-1.5">
          {result.searchTerms.map((term, i) => (
            <span key={i} className="inline-flex items-center gap-1 bg-accent-purple/10 text-accent-purple text-xs px-2 py-1 rounded">
              {term}
              <CopyButton text={term} label="Copy" />
            </span>
          ))}
        </div>
      </div>

      {/* Veo3 Prompt */}
      {result.veo3Prompt && (
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-gray-500">Veo3 Prompt</span>
            <CopyButton text={result.veo3Prompt} label="Copy" />
          </div>
          <div className="bg-bg border border-border rounded p-2.5 text-xs text-gray-300 leading-relaxed">
            {result.veo3Prompt}
          </div>
        </div>
      )}
    </div>
  );
}
