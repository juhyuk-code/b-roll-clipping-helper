export default function ScriptEditor({ script, onScriptChange }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-gray-400">Script</label>
      <textarea
        value={script}
        onChange={(e) => onScriptChange(e.target.value)}
        placeholder="Paste your script here..."
        rows={12}
        className="w-full bg-surface border border-border rounded-lg p-3 text-sm text-gray-200 font-mono resize-y focus:outline-none focus:border-border-light placeholder:text-gray-600"
      />
    </div>
  );
}
