import { LABELS, MOVES, allowed, apply, block, naiveOpen, ping, state, type Move, type Seats } from './model';

/** Runs CourseSniper's seat rule on one example section. Every button is something that happens at registration. */
export function initSniper(root: HTMLElement): void {
  const name = root.dataset.section!;
  const start: Seats = JSON.parse(root.dataset.seats!);
  const stateEl = root.querySelector<HTMLElement>('[data-sniper-state]')!;
  const blockEl = root.querySelector<HTMLElement>('[data-sniper-block]')!;
  const logEl = root.querySelector<HTMLElement>('[data-sniper-log]')!;
  const emptyEl = root.querySelector<HTMLElement>('[data-sniper-empty]')!;
  const seatsEl = root.querySelector<HTMLElement>('[data-sniper-seats]')!;
  const waitEl = root.querySelector<HTMLElement>('[data-sniper-wait]')!;
  const buttons = [...root.querySelectorAll<HTMLButtonElement>('[data-sniper-move]')];
  let seats = start;
  let checks = 0;

  function dots(host: HTMLElement, total: number, filled: number): void {
    host.replaceChildren(...Array.from({ length: total }, (_, i) => {
      const dot = document.createElement('i');
      if (i < filled) dot.className = 'on';
      return dot;
    }));
  }

  function render(): void {
    const now = state(seats);
    stateEl.textContent = LABELS[now];
    stateEl.dataset.state = now;
    blockEl.textContent = block(name, seats);
    dots(seatsEl, seats.capacity, seats.taken);
    dots(waitEl, seats.waitCapacity, seats.waitTaken);
    for (const button of buttons) button.disabled = !allowed(seats, button.dataset.sniperMove as Move);
  }

  function say(kind: 'ping' | 'quiet', title: string, body?: string): void {
    emptyEl.hidden = true;
    const item = document.createElement('li');
    item.className = `sniper-msg is-${kind}`;
    const head = document.createElement('p');
    head.textContent = title;
    item.append(head);
    if (body) {
      const pre = document.createElement('pre');
      pre.textContent = body;
      item.append(pre);
    }
    logEl.prepend(item);
    while (logEl.children.length > 6) logEl.lastElementChild!.remove();
  }

  function act(move: Move): void {
    const before = seats;
    seats = apply(seats, move);
    checks += 1;
    const change = ping(before, seats);
    if (change) say('ping', `@you course status changed: ${change}`, block(name, seats));
    else if (naiveOpen(seats) && state(seats) !== 'open') say('quiet', `Check ${checks}: ${MOVES[move].toLowerCase()}. A seat is empty, but it belongs to the waitlist, so no ping.`);
    else say('quiet', `Check ${checks}: ${MOVES[move].toLowerCase()}. Nothing you can act on changed, so no ping.`);
    render();
  }

  for (const button of buttons) button.addEventListener('click', () => act(button.dataset.sniperMove as Move));
  root.querySelector<HTMLButtonElement>('[data-sniper-reset]')!.addEventListener('click', () => {
    seats = start;
    checks = 0;
    logEl.replaceChildren();
    emptyEl.hidden = false;
    render();
  });

  root.classList.add('is-running');
  render();
}
