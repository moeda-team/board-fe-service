export interface TermsSection {
  heading: string;
  body: string[];
}

export interface TermsDocument {
  title: string;
  subtitle: string;
  lastUpdated: string;
  sections: TermsSection[];
}

export function parseTerms(markdown: string): TermsDocument {
  const lines = markdown.split("\n");
  const title = lines[0]?.replace(/^#\s*/, "") ?? "Terms of Service";
  const subtitle = lines[3]?.trim() ?? "";
  const lastUpdated = lines[5]?.replace(/^Last Updated:\s*/, "") ?? "";

  const sections: TermsSection[] = [];
  let current: TermsSection | null = null;

  for (let i = 7; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line || line === "---" || line.startsWith("⸻")) continue;

    if (/^\d+\.\s/.test(line)) {
      if (current) sections.push(current);
      current = { heading: line, body: [] };
    } else if (/^\d+\.\d+/.test(line)) {
      if (current) current.body.push(line);
    } else if (current) {
      current.body.push(line);
    }
  }
  if (current) sections.push(current);

  return { title, subtitle, lastUpdated, sections };
}
