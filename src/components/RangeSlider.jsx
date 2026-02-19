import { useState, useRef, useEffect, useCallback } from 'react';

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function RangeSlider({ start, end, videoDuration = 600, onChange }) {
  const trackRef = useRef(null);
  const [dragging, setDragging] = useState(null);

  const pxToTime = useCallback(
    (clientX) => {
      const rect = trackRef.current.getBoundingClientRect();
      const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      return Math.round(pct * videoDuration);
    },
    [videoDuration]
  );

  const handleMouseDown = (handle, e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(handle);
  };

  useEffect(() => {
    if (!dragging) return;
    const onMove = (e) => {
      const t = pxToTime(e.clientX);
      if (dragging === 'start') {
        onChange(Math.min(t, end - 2), end);
      } else {
        onChange(start, Math.max(t, start + 2));
      }
    };
    const onUp = () => setDragging(null);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [dragging, start, end, pxToTime, onChange]);

  const leftPct = (start / videoDuration) * 100;
  const rightPct = (end / videoDuration) * 100;
  const duration = end - start;

  return (
    <div className="py-2">
      <div
        ref={trackRef}
        className="relative h-7 bg-white/[0.04] rounded cursor-pointer select-none"
      >
        {/* Selected range */}
        <div
          className="absolute top-0 bottom-0 bg-accent-green/20 rounded-sm"
          style={{
            left: `${leftPct}%`,
            width: `${rightPct - leftPct}%`,
          }}
        />

        {/* Start handle */}
        <div
          onMouseDown={(e) => handleMouseDown('start', e)}
          className="absolute top-0 bottom-0 w-1 bg-accent-green cursor-ew-resize hover:w-1.5 transition-all z-10"
          style={{ left: `${leftPct}%` }}
        />

        {/* End handle */}
        <div
          onMouseDown={(e) => handleMouseDown('end', e)}
          className="absolute top-0 bottom-0 w-1 bg-accent-green cursor-ew-resize hover:w-1.5 transition-all z-10"
          style={{ left: `${rightPct}%` }}
        />
      </div>

      <div className="flex justify-between mt-1.5">
        <span className="text-[10px] text-accent-green font-mono">{formatTime(start)}</span>
        <span className="text-[10px] text-gray-500 font-mono">{duration}s selected</span>
        <span className="text-[10px] text-accent-green font-mono">{formatTime(end)}</span>
      </div>
    </div>
  );
}
