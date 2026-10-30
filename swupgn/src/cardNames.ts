import type { CardIndexRecord } from './types';

/** Resolves a SET#NUM[:copy] id to a display name. Copy suffixes are stripped before lookup. */
export interface NameResolver {
    nameOf(id: string): string;

    /** The card's other side's name (`CardIndexRecord.backSideName`), if it has one. */
    backNameOf?(id: string): string | undefined;
}

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
    // The index comes from the file: skip an entry that is not a card record instead of throwing,
    // and shorten a name no card has, which a story repeats on every line that names the card.
    cards = cards.filter((c) => typeof c?.id === 'string' && typeof c?.name === 'string');
    const byId = new Map(cards.map((c) => [c.id, shorten(c.name)]));
    const backById = new Map(cards.filter((c) => typeof c.backSideName === 'string').map((c) => [c.id, shorten(c.backSideName as string)]));
    return {
        nameOf: (id: string) => byId.get(baseId(id)) ?? baseId(id),
        backNameOf: (id: string) => backById.get(baseId(id)),
    };
}

/** Longer than any printed card's `Title, Subtitle`. */
const MAX_NAME_LENGTH = 120;

/** Line breaks, other control characters and bidirectional controls, which a story line never holds (spec §16, §23). */
const NOT_ON_A_LINE = /[\u0000-\u001f\u007f-\u009f\u061c\u200e\u200f\u2028\u2029\u202a-\u202e\u2066-\u2069]/g;

/**
 * `name` as one story line (spec §16): each line break or other control character becomes a space,
 * then a result longer than 120 UTF-16 code units is cut to 119 and `…`.
 */
export function shorten(name: string): string {
    const flat = flatten(name);
    return flat.length > MAX_NAME_LENGTH ? `${flat.slice(0, MAX_NAME_LENGTH - 1)}…` : flat;
}

/** `text` with each line break, other control character and bidirectional control turned into a space (spec §16, R-04). */
export function flatten(text: string): string {
    return text.replace(NOT_ON_A_LINE, ' ');
}
