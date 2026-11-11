/** Splits text into words and the whitespace between them. Joining the result gives the text back. */
export function tokens(text: string): string[] {
  return text.split(/(\s+)/).filter((token) => token.length > 0);
}

export function isSpace(token: string): boolean {
  return token.trim().length === 0;
}
