import { describe, expect, it } from 'vitest';
import { menu } from '../../src/data/projects';
import { levenshtein, normalize, takeCall, ticketOf, type MenuItem } from '../../src/lib/order';

const items: MenuItem[] = menu.map((p) => ({
  number: p.number,
  slug: p.slug,
  name: p.name,
  short: p.short,
  result: p.result,
  combos: p.combos,
  aliases: p.aliases,
  kitchen: Boolean(p.kitchen),
}));
const facts = { email: 'kenney@example.com', seeking: 'Looking for an internship', graduation: 'May 2029' };
const call = (said: string) => takeCall(said, items, facts, () => 0);

describe('hearing', () => {
  it('normalizes what it hears', () => {
    expect(normalize("  What’s GOOD, here?! ")).toBe("what's good here");
  });

  it('measures edit distance', () => {
    expect(levenshtein('kitten', 'sitting')).toBe(3);
  });
});

describe('recommendations', () => {
  it('recommends by role', () => {
    const c = call("what's good if I need a backend intern?");
    expect(c.order.intent).toBe('recommend');
    expect(c.order.role).toBe('c1');
    expect(c.reply).toContain('S1, AI phone ordering');
  });

  it('knows the embedded dishes', () => {
    const c = call("what's good for an embedded team?");
    expect(c.order.role).toBe('c2');
    expect(c.reply).toContain('W1, AgriNexus 2.0');
  });
});

describe('orders', () => {
  it('takes an order by number', () => {
    const c = call('can I get S2');
    expect(c.order.intent).toBe('order');
    expect(c.order.items).toEqual(['S2']);
    expect(c.check.valid).toBe(true);
    expect(c.reply).toContain('S2, Free Curb ATL, heard');
  });

  it('keeps modifiers', () => {
    const c = call('I want the free curb map, hold the buzzwords');
    expect(c.order.mods).toContain('hold the buzzwords');
    expect(c.reply).toContain('Hold the buzzwords, got it.');
  });

  it('rejects more than one of a dish', () => {
    const c = call('can I get two S2');
    expect(c.check.valid).toBe(false);
    expect(c.reply).toContain("I can't do 2");
  });

  it("is 86'd on things that aren't on the menu", () => {
    const c = call("I'll have the general tso's chicken");
    expect(c.check.valid).toBe(false);
    expect(c.reply).toContain("86'd on general tso's chicken");
  });

  it("is 86'd on menu numbers that don't exist", () => {
    const c = call('tell me about S9');
    expect(c.order.missing).toContain('S9');
    expect(c.check.valid).toBe(false);
  });
});

describe('questions', () => {
  it('answers about a dish, even with a typo', () => {
    const c = call('tell me about agrinexsu');
    expect(c.order.intent).toBe('ask');
    expect(c.order.items).toEqual(['W1']);
  });

  it('gives contact details', () => {
    expect(call('how do I reach him?').reply).toContain('kenney@example.com');
  });

  it('knows when he is available', () => {
    expect(call('are you looking for an internship').order.intent).toBe('availability');
  });

  it('greets, and admits when it is lost', () => {
    expect(call('hello').order.intent).toBe('greet');
    expect(call('qwzx plorp').order.intent).toBe('unknown');
  });
});

describe('the ticket', () => {
  it('runs five timed stages and returns a structured order', () => {
    const c = call('can I get S2');
    expect(c.stages.map((s) => s.name)).toEqual(['Hear', 'Menu agent', 'Intent agent', 'Validator', 'Reply']);
    expect(ticketOf(c)).toEqual({ intent: 'order', role: null, items: ['S2'], quantity: 1, mods: [], valid: true });
  });
});
