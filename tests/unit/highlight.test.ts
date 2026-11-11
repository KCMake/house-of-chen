import { describe, expect, it } from 'vitest';
import { dedent, highlight, highlightLines } from '../../src/lib/highlight';

describe('highlight', () => {
  it('escapes HTML', () => {
    expect(highlight('a < b && c > d', 'ts')).toBe('a &lt; b &amp;&amp; c &gt; d');
  });

  it('marks keywords but not words that contain them', () => {
    const html = highlight('const constant = 1', 'ts');
    expect(html).toContain('<span class="k">const</span> constant');
    expect(html).toContain('<span class="n">1</span>');
  });

  it('marks Python strings and comments', () => {
    const html = highlight('x = "for"  # for each block', 'python');
    expect(html).toContain('<span class="s">"for"</span>');
    expect(html).toContain('<span class="c"># for each block</span>');
  });

  it('marks Swift doc comments', () => {
    expect(highlight('/// A palm\nvar palm = 18.0', 'swift')).toContain('<span class="c">/// A palm</span>');
  });
});

describe('highlightLines', () => {
  it('closes and reopens a docstring on every line it spans', () => {
    const lines = highlightLines('def f():\n    """one\n    two"""\n    return 1', 'python');
    expect(lines[1]).toBe('    <span class="s">"""one</span>');
    expect(lines[2]).toBe('<span class="s">    two"""</span>');
    expect(lines[3]).toContain('<span class="k">return</span>');
  });
});

describe('dedent', () => {
  it('removes shared indentation and trailing blank lines', () => {
    expect(dedent('    a\n      b\n\n')).toBe('a\n  b');
  });
});
