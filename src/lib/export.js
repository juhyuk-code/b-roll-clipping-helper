/**
 * Export utilities for generating .sh and .json download files.
 */

function formatTimeForYtdlp(seconds) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function sanitizeForFilename(str) {
  return str.replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase().substring(0, 30);
}

/**
 * Generate a shell script with yt-dlp commands for all marked clips.
 * @param {string} scriptTitle - Title of the script
 * @param {Array} sections - All sections from the script
 * @returns {string} Shell script content
 */
export function generateShellScript(scriptTitle, sections) {
  const lines = ['#!/bin/bash', `# B-Roll downloads for: ${scriptTitle}`, 'mkdir -p broll_clips', ''];

  for (const section of sections) {
    const markedBrolls = section.brolls.filter((b) => b.markedForDownload && !b.removed);
    for (const broll of markedBrolls) {
      const channel = sanitizeForFilename(broll.channel);
      const startFormatted = formatTimeForYtdlp(broll.start);
      const endFormatted = formatTimeForYtdlp(broll.end);
      const filename = `s${section.index + 1}_${broll.ideaType}_${channel}_${broll.start}-${broll.end}.mp4`;

      lines.push(
        `yt-dlp --download-sections "*${startFormatted}-${endFormatted}" \\`,
        `  -o "broll_clips/${filename}" \\`,
        `  "https://youtube.com/watch?v=${broll.videoId}"`,
        ''
      );
    }
  }

  lines.push('echo "Done. Downloaded $(ls broll_clips/*.mp4 2>/dev/null | wc -l) clips."');

  return lines.join('\n');
}

/**
 * Generate a manifest JSON with full metadata for all marked clips.
 * @param {string} scriptTitle - Title of the script
 * @param {Array} sections - All sections from the script
 * @returns {string} JSON string
 */
export function generateManifestJSON(scriptTitle, sections) {
  const clips = [];

  for (const section of sections) {
    const markedBrolls = section.brolls.filter((b) => b.markedForDownload && !b.removed);
    for (const broll of markedBrolls) {
      const channel = sanitizeForFilename(broll.channel);
      clips.push({
        sectionIndex: section.index,
        sectionHeading: section.heading,
        sectionText: section.text.substring(0, 200),
        ideaType: broll.ideaType,
        searchQuery: broll.searchQuery,
        videoId: broll.videoId,
        videoTitle: broll.videoTitle,
        channel: broll.channel,
        start: broll.start,
        end: broll.end,
        confidence: broll.confidence,
        description: broll.description,
        filename: `s${section.index + 1}_${broll.ideaType}_${channel}_${broll.start}-${broll.end}.mp4`,
      });
    }
  }

  return JSON.stringify(
    {
      scriptTitle,
      exportedAt: new Date().toISOString(),
      clips,
    },
    null,
    2
  );
}

/**
 * Trigger a file download in the browser.
 * @param {string} content - File content
 * @param {string} filename - Download filename
 * @param {string} mimeType - MIME type
 */
export function downloadFile(content, filename, mimeType = 'text/plain') {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
