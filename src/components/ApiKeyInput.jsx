import { useState } from 'react';

export default function ApiKeyInput({ apiKey, onApiKeyChange }) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="flex items-center gap-2">
      <label className="text-xs text-gray-500 whitespace-nowrap">API Key</label>
      <input
        type={visible ? 'text' : 'password'}
        value={apiKey}
        onChange={(e) => onApiKeyChange(e.target.value)}
        placeholder="Gemini API key"
        className="bg-surface border border-border rounded px-2 py-1 text-sm text-gray-300 w-56 focus:outline-none focus:border-border-light"
      />
      <button
        onClick={() => setVisible(!visible)}
        className="text-xs text-gray-500 hover:text-gray-300"
      >
        {visible ? 'Hide' : 'Show'}
      </button>
      {apiKey && <span className="w-2 h-2 rounded-full bg-accent-green" title="Key saved" />}
    </div>
  );
}
