import type { CodeLang } from '../data/types';

/**
 * A small highlighter for the code excerpts. Keywords are bold, comments are faint, and strings
 * and numbers get one color. Everything else stays plain.
 */

const KEYWORDS: Record<CodeLang, string[]> = {
  python: ['def', 'return', 'for', 'in', 'if', 'else', 'elif', 'import', 'from', 'as', 'class', 'raise',
    'with', 'not', 'and', 'or', 'is', 'None', 'True', 'False', 'lambda', 'while', 'try', 'except', 'self'],
  swift: ['func', 'var', 'let', 'case', 'switch', 'guard', 'return', 'if', 'else', 'struct', 'class', 'final',
    'private', 'enum', 'protocol', 'init', 'self', 'true', 'false', 'nil', 'where', 'import', 'in'],
  ts: ['import', 'export', 'const', 'let', 'function', 'return', 'type', 'interface', 'as', 'from', 'new',
    'if', 'else', 'true', 'false'],
};

const COMMENT: Record<CodeLang, string> = {
  python: String.raw`#[^\n]*`,
  swift: String.raw`\/\/[^\n]*`,
  ts: String.raw`\/\*[\s\S]*?\*\/|\/\/[^\n]*`,
};

const STRING: Record<CodeLang, string> = {
  python: String.raw`[rbf]?"""[\s\S]*?"""|[rbf]?"(?:\\.|[^"\\\n])*"|[rbf]?'(?:\\.|[^'\\\n])*'`,
  swift: String.raw`"(?:\\.|[^"\\\n])*"`,
  ts: String.raw`'(?:\\.|[^'\\\n])*'|"(?:\\.|[^"\\\n])*"`,
};

const CLASS = ['c', 's', 'k', 'n'] as const;

export function escapeHtml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/** Removes the indentation every line shares, and trailing blank lines. */
export function dedent(code: string): string {
  const lines = code.replace(/\s+$/, '').split('\n');
  while (lines.length && lines[0].trim() === '') lines.shift();
  const indents = lines.filter((l) => l.trim()).map((l) => l.match(/^ */)![0].length);
  const cut = indents.length ? Math.min(...indents) : 0;
  return lines.map((l) => l.slice(cut)).join('\n');
}

/** Returns HTML with spans for comments (c), strings (s), keywords (k), and numbers (n). */
export function highlight(code: string, lang: CodeLang): string {
  const pattern = new RegExp(
    `(${COMMENT[lang]})|(${STRING[lang]})|\\b(${KEYWORDS[lang].join('|')})\\b|\\b(\\d+(?:\\.\\d+)?)\\b`,
    'g',
  );
  let out = '';
  let last = 0;
  for (const m of code.matchAll(pattern)) {
    const index = m.index ?? 0;
    out += escapeHtml(code.slice(last, index));
    const group = [m[1], m[2], m[3], m[4]].findIndex((g) => g !== undefined);
    out += `<span class="${CLASS[group]}">${escapeHtml(m[0])}</span>`;
    last = index + m[0].length;
  }
  return out + escapeHtml(code.slice(last));
}

/**
 * Highlights, then splits into numbered lines for an excerpt. A span that runs across a
 * line break, like a Python docstring, is closed at the end of the line and reopened on the next.
 */
export function highlightLines(code: string, lang: CodeLang): string[] {
  const lines = highlight(code, lang).split('\n');
  let open: string | null = null;
  return lines.map((line) => {
    let text = open ? `<span class="${open}">${line}` : line;
    const tags = [...line.matchAll(/<span class="(\w)">|<\/span>/g)];
    for (const tag of tags) open = tag[1] ?? null;
    if (open) text += '</span>';
    return text;
  });
}
