/**
 * Markdown script parser with BROLL block detection.
 * Splits markdown into sections by ## headers and extracts
 * optional <!-- BROLL --> YAML blocks.
 */

let idCounter = 0;

function generateId() {
  return `section_${Date.now()}_${++idCounter}`;
}

function generateBrollIdeaId() {
  return `idea_${Date.now()}_${++idCounter}`;
}

/**
 * Parse a <!-- BROLL ... --> HTML comment block containing YAML-like content.
 * Returns an array of BrollIdea objects.
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
 * Parse a markdown script into structured sections.
 *
 * @param {string} markdown - Raw markdown content
 * @returns {{ title: string, sections: Section[] }}
 */
export function parseScript(markdown) {
  const lines = markdown.split('\n');
  let title = '';
  const sections = [];
  let currentSection = null;

  for (const line of lines) {
    // Extract title from # header
    const titleMatch = line.match(/^#\s+(.+)$/);
    if (titleMatch && !title) {
      title = titleMatch[1].trim();
      continue;
    }

    // Detect ## section headers
    const sectionMatch = line.match(/^##\s+(.+)$/);
    if (sectionMatch) {
      if (currentSection) {
        sections.push(currentSection);
      }
      const heading = sectionMatch[1].trim();
      const isSourceClip = heading.toUpperCase() === 'SOURCE_CLIP';
      currentSection = {
        id: generateId(),
        index: sections.length,
        type: isSourceClip ? 'source_clip' : 'narration',
        heading,
        text: '',
        brollIdeas: [],
        brolls: [],
      };
      continue;
    }

    // Accumulate body text for current section
    if (currentSection) {
      currentSection.text += line + '\n';
    }
  }

  // Push last section
  if (currentSection) {
    sections.push(currentSection);
  }

  // Post-process sections: extract BROLL blocks and clean text
  for (const section of sections) {
    // Extract <!-- BROLL ... --> blocks
    const brollRegex = /<!--\s*BROLL\s*([\s\S]*?)-->/g;
    let match;
    while ((match = brollRegex.exec(section.text)) !== null) {
      const ideas = parseBrollBlock(match[1]);
      section.brollIdeas.push(...ideas);
    }

    // Remove BROLL comment blocks from the text
    section.text = section.text.replace(/<!--\s*BROLL\s*[\s\S]*?-->/g, '').trim();

    // Update index
    section.index = sections.indexOf(section);
  }

  return { title, sections };
}
