import { isSpace, tokens } from '../lib/words';

/**
 * The home page is one paragraph, and its highlighted phrases open more text in place. This
 * script opens and closes them, and slides the words that have to move instead of letting them
 * jump.
 *
 * Words stay inline. As inline-blocks they could slide with transforms, but a browser may break
 * a line after any inline-block, which once left a comma alone at the start of a line. So they
 * move with relative left and top offsets instead.
 */

const GLIDE = 'cubic-bezier(.22, .8, .24, 1)';
const FADE = 'cubic-bezier(.2, .7, .2, 1)';
const MOVE_MS = 480;

/** Wraps each word in a span so it can move on its own. Inside a phrase the spaces get spans too, so the highlight runs under them. */
export function wrapWords(node: Node, inPhrase: boolean): void {
  for (const child of [...node.childNodes]) {
    if (child.nodeType === Node.TEXT_NODE) {
      const parts = tokens(child.textContent ?? '');
      if (!inPhrase && parts.every(isSpace)) continue;
      const pieces = document.createDocumentFragment();
      for (const part of parts) {
        if (!inPhrase && isSpace(part)) {
          pieces.append(part);
          continue;
        }
        const span = document.createElement('span');
        span.className = isSpace(part) ? 'gap' : 'word';
        span.textContent = part;
        pieces.append(span);
      }
      child.replaceWith(pieces);
    } else if (child instanceof HTMLElement && !child.hasAttribute('data-figure')) {
      wrapWords(child, inPhrase || child.hasAttribute('data-phrase'));
    }
  }
}

/** Everything in the paragraph that can move: words, the spaces inside phrases, and open code excerpts. */
function movable(text: HTMLElement): HTMLElement[] {
  return [...text.querySelectorAll<HTMLElement>('.word, .gap, [data-figure]')].filter((el) => el.getClientRects().length > 0);
}

/** Runs `change`, then slides every word that moved from where it was to where it is now. New words fade in. */
export function glide(text: HTMLElement, change: () => void, fadeIn = true): void {
  const before = new Map(movable(text).map((el) => [el, el.getBoundingClientRect()]));
  const fromHeight = text.getBoundingClientRect().height;
  change();
  text.getAnimations().forEach((a) => a.cancel());
  const after = movable(text);
  after.forEach((el) => el.getAnimations().forEach((a) => a.cancel()));
  const toHeight = text.getBoundingClientRect().height;
  if (Math.abs(toHeight - fromHeight) > 1) {
    text.animate([{ height: `${fromHeight}px` }, { height: `${toHeight}px` }], { duration: MOVE_MS, easing: GLIDE });
  }
  let fresh = 0;
  for (const el of after) {
    const was = before.get(el);
    if (was) {
      const now = el.getBoundingClientRect();
      const dx = was.left - now.left;
      const dy = was.top - now.top;
      if (Math.abs(dx) > 0.5 || Math.abs(dy) > 0.5) {
        el.animate([{ left: `${dx}px`, top: `${dy}px` }, { left: '0px', top: '0px' }], { duration: MOVE_MS, easing: GLIDE });
      }
    } else if (fadeIn) {
      const delay = 90 + Math.min(fresh++, 70) * 8;
      el.animate([{ opacity: 0, top: '0.4em' }, { opacity: 1, top: '0em' }], { duration: 340, delay, easing: FADE, fill: 'backwards' });
    }
  }
}

export function initSentence(root: HTMLElement): void {
  const text = root.querySelector<HTMLElement>('[data-sentence-text]');
  const count = root.querySelector<HTMLElement>('[data-open-count]');
  const everything = root.querySelector<HTMLButtonElement>('[data-open-all]');
  if (!text || !count || !everything) return;

  wrapWords(text, false);
  const phrases = [...text.querySelectorAll<HTMLElement>('[data-phrase]')];
  for (const phrase of phrases) {
    phrase.setAttribute('role', 'button');
    phrase.setAttribute('tabindex', '0');
    phrase.setAttribute('aria-expanded', 'false');
    phrase.setAttribute('aria-controls', phrase.dataset.controls ?? '');
  }

  const moreOf = (phrase: HTMLElement) => document.getElementById(phrase.dataset.controls ?? '');
  const isOpen = (phrase: HTMLElement) => phrase.getAttribute('aria-expanded') === 'true';
  const still = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function setOpen(phrase: HTMLElement, open: boolean): void {
    phrase.setAttribute('aria-expanded', String(open));
    const more = moreOf(phrase);
    if (!more) return;
    more.classList.toggle('is-open', open);
    // Closing a phrase closes everything that opened inside it.
    if (!open) more.querySelectorAll<HTMLElement>('[data-phrase]').forEach((inner) => setOpen(inner, false));
  }

  function update(): void {
    const open = phrases.filter(isOpen).length;
    count!.textContent = String(open);
    everything!.textContent = open === phrases.length ? 'Close everything' : 'Open everything';
  }

  function change(edit: () => void, fadeIn = true): void {
    if (still()) edit();
    else glide(text!, edit, fadeIn);
    update();
  }

  let closing = false;
  async function toggle(phrase: HTMLElement): Promise<void> {
    if (closing) return;
    if (!isOpen(phrase)) return change(() => setOpen(phrase, true));
    const more = moreOf(phrase);
    if (still() || !more) return change(() => setOpen(phrase, false));
    // Fade out what is closing, then let the rest of the paragraph close the gap.
    closing = true;
    const inner = [...more.querySelectorAll<HTMLElement>('[data-phrase]')].filter(isOpen).map(moreOf);
    const fades = [more, ...inner]
      .filter((el): el is HTMLElement => el !== null)
      .map((el) => el.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 130, easing: 'ease-out', fill: 'forwards' }));
    await Promise.all(fades.map((f) => f.finished.catch(() => undefined)));
    change(() => setOpen(phrase, false), false);
    fades.forEach((f) => f.cancel());
    closing = false;
  }

  text.addEventListener('click', (event) => {
    const target = event.target as Element;
    if (target.closest('a')) return;
    const phrase = target.closest<HTMLElement>('[data-phrase]');
    if (phrase) void toggle(phrase);
  });
  text.addEventListener('keydown', (event) => {
    const phrase = (event.target as Element).closest<HTMLElement>('[data-phrase]');
    if (!phrase || (event.key !== 'Enter' && event.key !== ' ')) return;
    event.preventDefault();
    void toggle(phrase);
  });
  everything.addEventListener('click', () => {
    const allOpen = phrases.every(isOpen);
    change(() => phrases.forEach((phrase) => setOpen(phrase, !allOpen)), !allOpen);
  });

  update();
  document.documentElement.classList.add('sentence-ready');
}
