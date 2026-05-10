export function applySenderName(text: string, name: string): string {
  if (!text || !name) return text;
  return text
    .replace(/\[Your Full Name\]/gi, name)
    .replace(/\[Your Name\]/gi, name)
    .replace(/\[Full Name\]/gi, name)
    .replace(/\[Name\]/gi, name)
    .replace(/\[Sender Name\]/gi, name)
    .replace(/\[Sender's Name\]/gi, name);
}
