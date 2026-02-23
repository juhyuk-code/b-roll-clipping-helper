import { useState, useRef } from 'react';

export default function MetaPromptInput({ metaPrompt, onMetaPromptChange }) {
  const [collapsed, setCollapsed] = useState(false);
  const fileRef = useRef(null);

  async function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    onMetaPromptChange(text);
    // Reset input so the same file can be re-uploaded
    e.target.value = '';
  }

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-400">Meta Prompt</label>
        <div className="flex items-center gap-2">
          <button
            onClick={() => fileRef.current?.click()}
            className="text-xs text-accent-blue hover:text-accent-blue/80"
          >
            Upload .txt / .md
          </button>
          <input
            ref={fileRef}
            type="file"
            accept=".txt,.md,.text"
            onChange={handleFile}
            className="hidden"
          />
          {metaPrompt && (
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="text-xs text-gray-500 hover:text-gray-300"
            >
              {collapsed ? 'Expand' : 'Collapse'}
            </button>
          )}
        </div>
      </div>
      {!collapsed && (
        <textarea
          value={metaPrompt}
          onChange={(e) => onMetaPromptChange(e.target.value)}
          placeholder="Define how Gemini should analyze your script. E.g.: For each sentence, suggest visual search terms for stock footage and create a Veo3 prompt for AI-generated video..."
          rows={6}
          className="w-full bg-surface border border-border rounded-lg p-3 text-sm text-gray-200 font-mono resize-y focus:outline-none focus:border-border-light placeholder:text-gray-600"
        />
      )}
      {collapsed && (
        <div className="bg-surface border border-border rounded-lg px-3 py-2 text-xs text-gray-500 truncate">
          {metaPrompt.slice(0, 100)}...
        </div>
      )}
    </div>
  );
}
