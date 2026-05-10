export function applySenderName(text: string, name: string): string {
  if (!text) return text;
  let out = text;
  if (name) {
    out = out
      .replace(/\[Your Full Name\]/gi, name)
      .replace(/\[Your Name\]/gi, name)
      .replace(/\[Full Name\]/gi, name)
      .replace(/\[Name\]/gi, name)
      .replace(/\[Sender Name\]/gi, name)
      .replace(/\[Sender's Name\]/gi, name);
  }
  return stripPlaceholderLines(out);
}

/**
 * Drop any line whose only meaningful content is a bracketed placeholder
 * like "[Your Address]" or "[Your Email]". Models occasionally insert these
 * even when told not to — this keeps them from leaking into the final letter.
 */
export function stripPlaceholderLines(text: string): string {
  if (!text) return text;
  return text
    .split('\n')
    .filter((line) => {
      const trimmed = line.trim();
      if (!trimmed) return true; // preserve blank lines for paragraph spacing
      // Drop lines that are only bracketed placeholders (with optional punctuation/whitespace)
      return !/^[\s,]*\[[^\]]+\][\s,]*$/.test(trimmed);
    })
    .join('\n')
    // Collapse triple+ newlines that may result from removed lines
    .replace(/\n{3,}/g, '\n\n');
}
