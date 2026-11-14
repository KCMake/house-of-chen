import { atlNow, dow, meterState, type WallTime } from './hours';
import { PAINT_NAMES, distanceSq, hourName, nextOn, paintAt, tally, timeName, unpack, type Block, type CurbFile, type Paint } from './model';

/** Back to front, so free curbs are never hidden under a grey one. */
const ORDER: Paint[] = ['other', 'paid', 'limited', 'free'];
const WIDTH: Record<Paint, number> = { other: 1, paid: 1.8, limited: 1.8, free: 1.8 };
const PULSE_MS = 700;
const PLAY_MS = 420;

/** Runs Free Curb ATL inside `root`: draws every block and recolors it when the day or hour changes. */
export async function initCurb(root: HTMLElement): Promise<void> {
  const canvas = root.querySelector<HTMLCanvasElement>('[data-curb-canvas]')!;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const el = <T extends HTMLElement>(name: string) => root.querySelector<T>(`[data-curb-${name}]`)!;
  const kmEl = el('km'), unlockedEl = el('unlocked'), timeEl = el('time'), ruleEl = el('rule'), blockEl = el('block');
  const hourEl = el<HTMLInputElement>('hour'), hourNameEl = el('hour-name');
  const nowBtn = el<HTMLButtonElement>('now'), playBtn = el<HTMLButtonElement>('play'), liveEl = el('live');
  const dayEls = [...root.querySelectorAll<HTMLInputElement>('[data-curb-day]')];

  const response = await fetch(root.dataset.src!);
  if (!response.ok) throw new Error(`Could not load the curb data: ${response.status}`);
  const file = (await response.json()) as CurbFile;
  const blocks = unpack(file);
  const totalKm = blocks.reduce((sum, b) => sum + b.metres, 0) / 1000;

  // One degree of longitude is shorter than one of latitude this far north.
  const squash = Math.cos((((file.south + file.north) / 2) * Math.PI) / 180);
  const spanX = (file.east - file.west) * 1e5 * squash;
  const spanY = (file.north - file.south) * 1e5;
  canvas.style.aspectRatio = `${spanX} / ${spanY}`;
  // The same blocks with east-west distances shrunk to match, for finding the one under the pointer.
  const flat: Block[] = blocks.map((b) => ({ ...b, points: b.points.map((v, k) => (k % 2 === 0 ? v * squash : v)) }));

  const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let colors = readColors();
  let time: WallTime = { ...atlNow(), mi: 0 };
  let paints: Paint[] = blocks.map((b) => paintAt(b, time));
  let changedAt = new Float64Array(blocks.length).fill(-Infinity);
  let hovered = -1;
  let scale = 1, pad = 6, cssHeight = 0;
  let frame = 0;
  let timer = 0;

  function readColors(): Record<Paint | 'ink', string> {
    const style = getComputedStyle(root);
    const get = (name: string) => style.getPropertyValue(name).trim();
    return { free: get('--c-free'), limited: get('--c-limited'), paid: get('--c-paid'), other: get('--c-other'), ink: get('--ink') };
  }

  function resize(): void {
    const box = canvas.getBoundingClientRect();
    if (box.width === 0) return;
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(box.width * ratio);
    canvas.height = Math.round(box.height * ratio);
    ctx!.setTransform(ratio, 0, 0, ratio, 0, 0);
    cssHeight = box.height;
    scale = (box.width - pad * 2) / spanX;
    draw();
  }

  function trace(block: Block): void {
    const p = block.points;
    for (let i = 0; i < p.length; i += 2) {
      const x = pad + p[i] * squash * scale, y = cssHeight - pad - p[i + 1] * scale;
      if (i === 0) ctx!.moveTo(x, y);
      else ctx!.lineTo(x, y);
    }
  }

  function draw(): void {
    frame = 0;
    const now = performance.now();
    ctx!.clearRect(0, 0, canvas.width, canvas.height);
    ctx!.lineCap = 'round';
    ctx!.lineJoin = 'round';
    for (const paint of ORDER) {
      ctx!.beginPath();
      blocks.forEach((block, i) => { if (paints[i] === paint) trace(block); });
      ctx!.strokeStyle = colors[paint];
      ctx!.lineWidth = WIDTH[paint];
      ctx!.stroke();
    }
    // A block that just changed is drawn thick, then settles.
    let moving = false;
    blocks.forEach((block, i) => {
      const age = (now - changedAt[i]) / PULSE_MS;
      if (age >= 1) return;
      moving = true;
      ctx!.beginPath();
      trace(block);
      ctx!.strokeStyle = colors[paints[i]];
      ctx!.lineWidth = WIDTH[paints[i]] + 4 * (1 - age) ** 2;
      ctx!.stroke();
    });
    if (hovered >= 0) {
      ctx!.beginPath();
      trace(blocks[hovered]);
      ctx!.strokeStyle = colors.ink;
      ctx!.lineWidth = 4;
      ctx!.stroke();
    }
    if (moving) frame = requestAnimationFrame(draw);
  }

  function show(announce = true): void {
    const next = blocks.map((b) => paintAt(b, time));
    const now = performance.now();
    if (!calm) next.forEach((paint, i) => { if (paint !== paints[i]) changedAt[i] = now; });
    paints = next;

    const sums = tally(blocks, time);
    const rule = meterState(time);
    kmEl.textContent = String(Math.round(sums.freeKm));
    unlockedEl.textContent = sums.unlockedKm >= 0.5
      ? `${Math.round(sums.unlockedKm)} km of that is paid curb whose meters are off right now.`
      : `Another ${Math.round(sums.paidKm)} km is metered and charging.`;
    timeEl.textContent = timeName(time);
    ruleEl.textContent = rule.text;
    hourEl.value = String(time.h);
    hourEl.setAttribute('aria-valuetext', hourName(time.h));
    hourNameEl.textContent = hourName(time.h);
    const day = dow(time);
    dayEls.forEach((input) => { input.checked = Number(input.value) === day; });
    const summary = `${timeName(time)}: ${Math.round(sums.freeKm)} of ${Math.round(totalKm)} km of curb is free to park on. ${rule.text}`;
    canvas.setAttribute('aria-label', `Map of ${blocks.length} Atlanta street blocks. ${summary}`);
    if (announce) liveEl.textContent = summary;
    root.dataset.freeKm = String(Math.round(sums.freeKm));
    if (hovered >= 0) describe(hovered);
    if (!frame) frame = requestAnimationFrame(draw);
  }

  function describe(i: number): void {
    const block = blocks[i];
    const where = block.range ? `${block.street}, ${block.range}` : block.street;
    blockEl.textContent = `${where}: ${PAINT_NAMES[paints[i]]}`;
  }

  function stop(): void {
    if (!timer) return;
    clearInterval(timer);
    timer = 0;
    playBtn.textContent = 'Play the week';
    playBtn.setAttribute('aria-pressed', 'false');
  }

  function step(): void {
    const next = time.h === 23 ? nextOn((dow(time) + 1) % 7, 0) : { ...time, h: time.h + 1 };
    time = next;
    show(false);
  }

  hourEl.addEventListener('input', () => { stop(); time = { ...time, h: Number(hourEl.value) }; show(); });
  dayEls.forEach((input) => input.addEventListener('change', () => { stop(); time = nextOn(Number(input.value), time.h); show(); }));
  nowBtn.addEventListener('click', () => { stop(); time = { ...atlNow(), mi: 0 }; show(); });
  playBtn.addEventListener('click', () => {
    if (timer) return stop();
    timer = window.setInterval(step, PLAY_MS);
    playBtn.textContent = 'Pause';
    playBtn.setAttribute('aria-pressed', 'true');
    step();
  });

  function pick(event: PointerEvent): void {
    const box = canvas.getBoundingClientRect();
    const x = (event.clientX - box.left - pad) / scale;
    const y = (box.height - pad - (event.clientY - box.top)) / scale;
    let best = -1, bestD = (14 / scale) ** 2;
    flat.forEach((block, i) => {
      if (paints[i] === 'other') return;
      const d = distanceSq(block, x, y);
      if (d < bestD) { bestD = d; best = i; }
    });
    if (best === hovered) return;
    hovered = best;
    if (best >= 0) describe(best);
    else blockEl.textContent = blockEl.dataset.hint ?? '';
    if (!frame) frame = requestAnimationFrame(draw);
  }
  canvas.addEventListener('pointermove', pick);
  canvas.addEventListener('pointerdown', pick);
  canvas.addEventListener('pointerleave', () => {
    hovered = -1;
    blockEl.textContent = blockEl.dataset.hint ?? '';
    if (!frame) frame = requestAnimationFrame(draw);
  });

  new ResizeObserver(resize).observe(canvas);
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => { colors = readColors(); draw(); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); });

  root.classList.add('is-running');
  resize();
  show(false);
}
