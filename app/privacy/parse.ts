export type PrivacyBlock =
  | { type: "paragraph"; text: string }
  | { type: "heading"; text: string }
  | { type: "list"; items: string[] };

export interface PrivacySection {
  id: string;
  number: number;
  title: string;
  blocks: PrivacyBlock[];
}

export interface PrivacyDocument {
  title: string;
  subtitle: string;
  lastUpdated: string;
  sections: PrivacySection[];
  closing: string;
}

const SECTION_RE = /^(\d+)\.\s+(.+)$/;
const SUBSECTION_RE = /^(\d+)\.(\d+)\s+(.+)$/;
const BULLET_RE = /^\*\s+(.+)$/;
const SEPARATOR = "\u2e3b"; // ⸻

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function isHeadingLine(line: string): boolean {
  // Short, title-like line with no terminal punctuation (e.g. "Service Providers").
  if (line.length === 0 || line.length > 60) return false;
  if (/[.:;!?]$/.test(line)) return false;
  return line.split(/\s+/).length <= 6;
}

export function parsePrivacyPolicy(markdown: string): PrivacyDocument {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");

  let title = "Privacy Policy";
  let subtitle = "";
  let lastUpdated = "";
  let closing = "";

  const sections: PrivacySection[] = [];
  let current: PrivacySection | null = null;
  let pendingList: string[] | null = null;

  const flushList = () => {
    if (current && pendingList && pendingList.length > 0) {
      current.blocks.push({ type: "list", items: pendingList });
    }
    pendingList = null;
  };

  for (const raw of lines) {
    const line = raw.trim();

    if (line.length === 0) {
      flushList();
      continue;
    }
    if (line === SEPARATOR) {
      flushList();
      continue;
    }

    // Document title (H1)
    if (line.startsWith("# ")) {
      title = line.slice(2).trim();
      continue;
    }

    // Header metadata before the first section.
    if (!current) {
      if (/^last updated:/i.test(line)) {
        lastUpdated = line.replace(/^last updated:\s*/i, "").trim();
        continue;
      }
      if (line === title) continue;
      // First non-title line becomes the subtitle.
      if (!subtitle && !SECTION_RE.test(line)) {
        subtitle = line;
        continue;
      }
    }

    const sectionMatch = line.match(SECTION_RE);
    const subsectionMatch = line.match(SUBSECTION_RE);

    // New top-level section (but not a subsection like "2.1 ...").
    if (sectionMatch && !subsectionMatch) {
      flushList();
      current = {
        id: slugify(sectionMatch[2]),
        number: Number(sectionMatch[1]),
        title: sectionMatch[2].trim(),
        blocks: []
      };
      sections.push(current);
      continue;
    }

    if (!current) continue;

    // Subsection becomes a heading within the current section.
    if (subsectionMatch) {
      flushList();
      current.blocks.push({ type: "heading", text: subsectionMatch[3].trim() });
      continue;
    }

    const bulletMatch = line.match(BULLET_RE);
    if (bulletMatch) {
      if (!pendingList) pendingList = [];
      pendingList.push(bulletMatch[1].trim());
      continue;
    }

    flushList();

    // Closing statement after the final section.
    if (/^by using/i.test(line)) {
      closing = line;
      continue;
    }

    if (isHeadingLine(line)) {
      current.blocks.push({ type: "heading", text: line });
    } else {
      current.blocks.push({ type: "paragraph", text: line });
    }
  }

  flushList();

  return { title, subtitle, lastUpdated, sections, closing };
}
