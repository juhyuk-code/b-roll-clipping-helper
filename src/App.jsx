import { useState } from 'react';
import { analyzeScript } from './lib/gemini';
import ApiKeyInput from './components/ApiKeyInput';
import ScriptEditor from './components/ScriptEditor';
import MetaPromptInput from './components/MetaPromptInput';
import AnalyzeButton from './components/AnalyzeButton';
import ResultsList from './components/ResultsList';

export default function App() {
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('gemini-api-key') || '');
  const [script, setScript] = useState('');
  const [metaPrompt, setMetaPrompt] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [error, setError] = useState(null);

  function handleApiKeyChange(key) {
    setApiKey(key);
    localStorage.setItem('gemini-api-key', key);
  }

  async function handleAnalyze() {
    setLoading(true);
    setError(null);
    setResults(null);
    try {
      const data = await analyzeScript(apiKey, script, metaPrompt, setProgress);
      setResults(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const canAnalyze = apiKey.trim().length > 0 && script.trim().length > 0;

  return (
    <div className="min-h-screen bg-bg">
      {/* Header */}
      <header className="border-b border-border px-6 py-3 flex items-center justify-between">
        <h1 className="text-sm font-semibold text-gray-200">B-Roll Script Analyzer</h1>
        <ApiKeyInput apiKey={apiKey} onApiKeyChange={handleApiKeyChange} />
      </header>

      {/* Main */}
      <main className="max-w-4xl mx-auto px-6 py-8 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ScriptEditor script={script} onScriptChange={setScript} />
          <MetaPromptInput metaPrompt={metaPrompt} onMetaPromptChange={setMetaPrompt} />
        </div>

        <AnalyzeButton
          disabled={!canAnalyze}
          loading={loading}
          progress={progress}
          onClick={handleAnalyze}
        />

        {error && (
          <div className="bg-accent-red/10 border border-accent-red/30 rounded-lg px-4 py-3 text-sm text-accent-red">
            {error}
          </div>
        )}

        <ResultsList results={results} />
      </main>
    </div>
  );
}
