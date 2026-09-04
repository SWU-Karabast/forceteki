import type { CardIndexRecord } from './types';

/** Resolves a SET#NUM[:copy] id to a display name. Copy suffixes are stripped before lookup. */
export interface NameResolver { nameOf(id: string): string; }

export function baseId(ref: string): string {
    return String(ref).replace(/:\d+$/, '');
}

/**
 * A resolver backed by the file's own `%%% CARDS` index.
 *
 * This is what makes a `.swupgn` self-describing: with the index present, rendering the
 * story needs no external card database. An id the index doesn't cover falls back to the id
 * itself, so an incomplete index degrades to today's behaviour rather than losing the event.
 */
export function indexResolver(cards: readonly CardIndexRecord[] = []): NameResolver {
    const byId = new Map(cards.map((c) => [c.id, c.name]));
    return { nameOf: (id: string) => byId.get(baseId(id)) ?? baseId(id) };
}
