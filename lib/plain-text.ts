// Best-effort Markdown → plain text for text-to-speech.
// Strips syntax that would otherwise be read aloud literally (fences, headers,
// emphasis markers, link URLs, list bullets, etc.). Not a full parser.

function stripCodeBlocks(text: string): string {
  return text.replace(/```[\s\S]*?```/g, " ").replace(/`([^`]+)`/g, "$1");
}

function stripImagesAndLinks(text: string): string {
  return text
    .replace(/!\[([^\]]*)\][^)]*/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
}

function stripMarkup(text: string): string {
  return text
    .replace(/^\s{0,3}#{1,6}\s+/gm, "")
    .replace(/^\s{0,3}>\s?/gm, "")
    .replace(/^\s{0,3}[-*+]\s+/gm, "")
    .replace(/^\s{0,3}\d+\.\s+/gm, "")
    .replace(/^\s{0,3}[-*_]{3,}\s*$/gm, " ")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/__([^_]+)__/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/_([^_]+)_/g, "$1");
}

function collapseWhitespace(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

export function toPlainText(markdown: string): string {
  return collapseWhitespace(
    stripMarkup(stripImagesAndLinks(stripCodeBlocks(markdown))),
  );
}
