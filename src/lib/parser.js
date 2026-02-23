/**
 * Markdown script parser with BROLL block detection.
 * Supports multiple formats:
 *   - ## headers as section delimiters
 *   - --- horizontal rules as section delimiters
 *   - Plain paragraphs separated by blank lines (fallback)
 */

let idCounter = 0;

function generateId() {
  return `section_${Date.now()}_${++idCounter}`;
}

function generateBrollIdeaId() {
  return `idea_${Date.now()}_${++idCounter}`;
}

const SECTION_LABELS = [
  'SECTION 1', 'SECTION 2', 'SECTION 3', 'SECTION 4',
  'SECTION 5', 'SECTION 6', 'SECTION 7', 'SECTION 8',
  'SECTION 9', 'SECTION 10', 'SECTION 11', 'SECTION 12',
];

/**
 * Parse a <!-- BROLL ... --> HTML comment block containing YAML-like content.
 */
function parseBrollBlock(yamlContent) {
  const ideas = [];
  const entries = yamlContent.split(/\n\s*-\s+/).filter(Boolean);

  for (const entry of entries) {
    const typeMatch = entry.match(/type:\s*(\w+)/);
    const queryMatch = entry.match(/query:\s*["']?([^"'\n]+)["']?/);
    const reasoningMatch = entry.match(/reasoning:\s*["']?([^"'\n]+)["']?/);

    if (typeMatch && queryMatch) {
      ideas.push({
        id: generateBrollIdeaId(),
        type: typeMatch[1],
        searchQuery: queryMatch[1].trim(),
        reasoning: reasoningMatch ? reasoningMatch[1].trim() : '',
        searched: false,
      });
    }
  }

  return ideas;
}

/**
 * Create a section object.
 */
function createSection(heading, index) {
  const isSourceClip = heading.toUpperCase() === 'SOURCE_CLIP';
  return {
    id: generateId(),
    index,
    type: isSourceClip ? 'source_clip' : 'narration',
    heading,
    text: '',
    brollIdeas: [],
    brolls: [],
  };
}

/**
 * Try parsing with ## headers. Returns sections array or empty if no ## found.
 */
function parseWithHeaders(lines, startIndex) {
  const sections = [];
  let currentSection = null;

  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i];
    const sectionMatch = line.match(/^##\s+(.+)$/);
    if (sectionMatch) {
      if (currentSection) sections.push(currentSection);
      currentSection = createSection(sectionMatch[1].trim(), sections.length);
      continue;
    }
    if (currentSection) {
      currentSection.text += line + '\n';
    }
  }
  if (currentSection) sections.push(currentSection);
  return sections;
}

/**
 * Try parsing with --- dividers. Returns sections array or empty if no --- found.
 */
function parseWithDividers(lines, startIndex) {
  // Check if there are any --- dividers
  const hasDividers = lines.slice(startIndex).some((l) => /^-{3,}\s*$/.test(l));
  if (!hasDividers) return [];

  const sections = [];
  let currentText = '';

  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i];
    if (/^-{3,}\s*$/.test(line)) {
      const trimmed = currentText.trim();
      if (trimmed) {
        const section = createSection(SECTION_LABELS[sections.length] || `SECTION ${sections.length + 1}`, sections.length);
        section.text = trimmed;
        sections.push(section);
      }
      currentText = '';
      continue;
    }
    currentText += line + '\n';
  }

  // Last chunk after final ---
  const trimmed = currentText.trim();
  if (trimmed) {
    const section = createSection(SECTION_LABELS[sections.length] || `SECTION ${sections.length + 1}`, sections.length);
    section.text = trimmed;
    sections.push(section);
  }

  return sections;
}

/**
 * Fallback: split by blank-line-separated paragraphs.
 */
function parseByParagraphs(lines, startIndex) {
  const sections = [];
  let currentText = '';

  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i];
    if (line.trim() === '' && currentText.trim()) {
      const section = createSection(SECTION_LABELS[sections.length] || `SECTION ${sections.length + 1}`, sections.length);
      section.text = currentText.trim();
      sections.push(section);
      currentText = '';
      continue;
    }
    currentText += line + '\n';
  }

  const trimmed = currentText.trim();
  if (trimmed) {
    const section = createSection(SECTION_LABELS[sections.length] || `SECTION ${sections.length + 1}`, sections.length);
    section.text = trimmed;
    sections.push(section);
  }

  // Merge very short sections (< 20 chars) into the next section
  const merged = [];
  for (let i = 0; i < sections.length; i++) {
    if (sections[i].text.length < 20 && i + 1 < sections.length) {
      sections[i + 1].text = sections[i].text + '\n\n' + sections[i + 1].text;
    } else {
      merged.push(sections[i]);
    }
  }

  // Re-index
  merged.forEach((s, i) => {
    s.index = i;
    s.heading = SECTION_LABELS[i] || `SECTION ${i + 1}`;
  });

  return merged;
}

/**
 * Parse a markdown script into structured sections.
 *
 * @param {string} markdown - Raw markdown content
 * @returns {{ title: string, sections: Section[] }}
 */
export function parseScript(markdown) {
  const lines = markdown.split('\n');
  let title = '';
  let bodyStartIndex = 0;

  // Extract title from first # header
  for (let i = 0; i < lines.length; i++) {
    const titleMatch = lines[i].match(/^#\s+(.+)$/);
    if (titleMatch) {
      title = titleMatch[1].trim();
      bodyStartIndex = i + 1;
      break;
    }
  }

  // If no title found, use first non-empty line
  if (!title) {
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].trim()) {
        title = lines[i].trim();
        bodyStartIndex = i + 1;
        break;
      }
    }
  }

  // Try parsing strategies in order of specificity
  let sections = parseWithHeaders(lines, bodyStartIndex);

  if (sections.length === 0) {
    sections = parseWithDividers(lines, bodyStartIndex);
  }

  if (sections.length === 0) {
    sections = parseByParagraphs(lines, bodyStartIndex);
  }

  // Post-process: extract BROLL blocks and clean text
  for (const section of sections) {
    const brollRegex = /<!--\s*BROLL\s*([\s\S]*?)-->/g;
    let match;
    while ((match = brollRegex.exec(section.text)) !== null) {
      const ideas = parseBrollBlock(match[1]);
      section.brollIdeas.push(...ideas);
    }
    section.text = section.text.replace(/<!--\s*BROLL\s*[\s\S]*?-->/g, '').trim();
  }

  // Filter out empty sections
  const filtered = sections.filter((s) => s.text.length > 0);
  filtered.forEach((s, i) => { s.index = i; });

  return { title, sections: filtered };
}
