import { useState, useRef, useEffect, useCallback } from "react";

const MOCK_SCRIPT = {
  title: "Jensen Huang이 프로그래밍의 종말을 선언한 이유",
  sections: [
    {
      id: "s1",
      type: "narration",
      text: "2026년 3월, NVIDIA CEO Jensen Huang은 GTC 키노트에서 충격적인 발언을 했다. 프로그래밍은 끝났다. 미래의 프로그래밍 언어는 인간의 언어다.",
      textEn: "In March 2026, NVIDIA CEO Jensen Huang made a shocking statement at the GTC keynote. Programming is over. The programming language of the future is human language.",
      brolls: [
        {
          id: "b1",
          query: "Jensen Huang GTC 2025 keynote stage",
          videoId: "e1LFbG4LpEE",
          videoTitle: "NVIDIA GTC 2025 Keynote - Jensen Huang",
          channel: "NVIDIA",
          start: 245,
          end: 268,
          duration: 23,
          note: "Jensen walking on stage, crowd reaction",
        },
      ],
    },
  ],
};

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function RangeSlider({ start, end, videoDuration, onChange }) {
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
    setDragging(handle);
  };

  useEffect(() => {
    if (!dragging) return;
    const onMove = (e) => {
      const t = pxToTime(e.clientX);
      if (dragging === "start") onChange(Math.min(t, end - 2), end);
      else onChange(start, Math.max(t, start + 2));
    };
    const onUp = () => setDragging(null);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [dragging, start, end, pxToTime, onChange]);

  const leftPct = (start / videoDuration) * 100;
  const rightPct = (end / videoDuration) * 100;

  return (
    <div style={{ padding: "8px 0" }}>
      <div
        ref={trackRef}
        style={{
          position: "relative",
          height: 28,
          background: "rgba(255,255,255,0.04)",
          borderRadius: 4,
          cursor: "pointer",
          userSelect: "none",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: `${leftPct}%`,
            width: `${rightPct - leftPct}%`,
            top: 0,
            bottom: 0,
            background: "rgba(16,185,129,0.2)",
            borderLeft: "2px solid #10b981",
            borderRight: "2px solid #10b981",
            borderRadius: 2,
          }}
        />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
        <span style={{ fontSize: 10, color: "#10b981", fontFamily: "monospace" }}>
          {formatTime(start)}
        </span>
        <span style={{ fontSize: 10, color: "#555", fontFamily: "monospace" }}>
          {formatTime(end - start)}s selected
        </span>
        <span style={{ fontSize: 10, color: "#10b981", fontFamily: "monospace" }}>
          {formatTime(end)}
        </span>
      </div>
    </div>
  );
}

export default function BrollCurator() {
  const [sections, setSections] = useState(MOCK_SCRIPT.sections);
  const [markedForDownload, setMarkedForDownload] = useState(new Set());

  const allBrolls = sections.flatMap((s) =>
    s.brolls.map((b) => ({ ...b, sectionId: s.id, sectionText: s.text }))
  );

  const handleSearchFromText = (sectionId, query) => {
    const newBroll = {
      id: `b_new_${Date.now()}`,
      query,
      videoId: "dQw4w9WgXcQ",
      videoTitle: `Search result for: \"${query}\"`,
      channel: "YouTube Search",
      start: 0,
      end: 30,
      duration: 30,
      note: `Searched from script: \"${query}\"`,
    };
    setSections((prev) =>
      prev.map((s) =>
        s.id === sectionId ? { ...s, brolls: [...s.brolls, newBroll] } : s
      )
    );
  };

  return <div>{allBrolls.length} clips selected, {markedForDownload.size} marked</div>;
}
