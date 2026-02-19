import { useState, useRef, useCallback } from 'react';
import useStore from '../store/useStore';
import { parseScript } from '../lib/parser';

export default function DropZone() {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);
  const setScript = useStore((s) => s.setScript);
  const setAppState = useStore((s) => s.setAppState);

  const processFile = useCallback(
    async (file) => {
      if (!file.name.endsWith('.md')) {
        setError('Please upload a markdown (.md) file');
        return;
      }

      setError(null);
      setAppState('PARSING');

      try {
        const text = await file.text();
        const script = parseScript(text);

        if (script.sections.length === 0) {
          setError('No sections found. Use ## headers to define sections.');
          setAppState('EMPTY');
          return;
        }

        setScript(script);

        // Check if any narration sections need AI analysis
        const narrationSections = script.sections.filter((s) => s.type === 'narration');
        const needsAnalysis = narrationSections.some((s) => s.brollIdeas.length === 0);

        if (needsAnalysis) {
          setAppState('ANALYZING');
        } else {
          setAppState('CURATING');
        }
      } catch (err) {
        console.error('Parse error:', err);
        setError('Failed to parse the script file');
        setAppState('EMPTY');
      }
    },
    [setScript, setAppState]
  );

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) processFile(file);
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold text-gray-100 mb-2">B-Roll Curator</h1>
          <p className="text-sm text-gray-500">
            Upload your script to discover and curate B-roll footage
          </p>
        </div>

        <div
          onClick={handleClick}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            relative border-2 border-dashed rounded-lg p-12 text-center cursor-pointer
            transition-all duration-200
            ${
              isDragging
                ? 'border-accent-green bg-accent-green/5'
                : 'border-border-light hover:border-gray-600 hover:bg-white/[0.02]'
            }
          `}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".md"
            onChange={handleFileChange}
            className="hidden"
          />

          <div className="mb-4">
            <svg
              className={`w-12 h-12 mx-auto ${isDragging ? 'text-accent-green' : 'text-gray-600'}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m6.75 12l-3-3m0 0l-3 3m3-3v6m-1.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
              />
            </svg>
          </div>

          <p className="text-sm text-gray-400 mb-1">
            {isDragging ? 'Drop your script here' : 'Drag & drop your .md script'}
          </p>
          <p className="text-xs text-gray-600">or click to browse</p>
        </div>

        {error && (
          <div className="mt-4 px-4 py-3 rounded-md bg-accent-red/10 border border-accent-red/20">
            <p className="text-sm text-accent-red">{error}</p>
          </div>
        )}

        <div className="mt-8 text-xs text-gray-600 space-y-1">
          <p>Expected format: Markdown with ## section headers</p>
          <p>Sections named SOURCE_CLIP are excluded from B-roll analysis</p>
        </div>
      </div>
    </div>
  );
}
