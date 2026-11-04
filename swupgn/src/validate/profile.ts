import type { SwuPgnFile } from '../generated/types.js';
import type { FileLines } from '../parse.js';
import { isFaceDownAttribute } from '../registry.js';
import type { Collector } from './issues.js';

function isObject(v: unknown): v is Record<string, unknown> {
    return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function holds(to: unknown, seat: number | null): boolean {
    if (to === 'all') {
        return true;
    }
    return seat !== null && Array.isArray(to) && (to as unknown[]).includes(seat);
}

function strings(v: unknown): unknown[] {
    return Array.isArray(v) ? v : [];
}

function deckIds(deck: Record<string, unknown>, withMain: boolean): string[] {
    const ids = [String(deck.base), ...strings(deck.leaders).map(String)];
    if (withMain) {
        for (const list of [deck.main, deck.sideboard]) {
            for (const entry of strings(list)) {
                ids.push(String(Array.isArray(entry) ? entry[0] : entry));
            }
        }
    }
    return ids;
}

/** The profile rules of SPEC 10.4 ([V-08]). */
export function checkProfile(file: SwuPgnFile, lines: FileLines, out: Collector): void {
    const vis = file.header.Visibility;
    const seat = vis === 'perspective:1' ? 1 : vis === 'perspective:2' ? 2 : null;
    if (seat === null && vis !== 'public') {
        return;   // full, or a Visibility the schema already rejected
    }
    const what = vis;
    if (file.header.Seed !== undefined) {
        out.add('profile', lines.tags.get('Seed'), `a ${what} file has no Seed tag`);
    }

    // The cards the viewer may see: those a create or reveal gives with an audience that holds it.
    const shown = new Set<string>();
    file.records.forEach((r, i) => {
        const rec = r as unknown;
        if (!isObject(rec) || (rec.t !== 'create' && rec.t !== 'reveal') || typeof rec.card !== 'string') {
            return;
        }
        const to: unknown = rec.to === undefined && rec.t === 'create' ? 'all' : rec.to;
        if (holds(to, seat)) {
            shown.add(rec.card);
        } else {
            out.add('profile', lines.records[i], `a ${rec.t} of a card that ${seat === null ? 'is not shown to everyone' : `seat ${seat} does not know`} has no place in a ${what} file`);
        }
    });

    // DECKS: who is complete, no order, and the partial line lists only shown cards.
    const justified = new Set<string>();
    for (const tag of ['P1Leader', 'P2Leader']) {
        for (const id of (file.header[tag] ?? '').split(',')) {
            justified.add(id);
        }
    }
    justified.add(file.header.P1Base);
    justified.add(file.header.P2Base);
    file.decks.forEach((d, i) => {
        const deck = d as unknown;
        if (!isObject(deck)) {
            return;
        }
        const line = lines.decks[i];
        if (deck.order !== undefined) {
            out.add('profile', line, `a ${what} file has no DECKS line with order`);
        }
        const own = seat !== null && deck.p === seat;
        if (typeof deck.p === 'number' && typeof deck.complete === 'boolean' && deck.complete !== own) {
            out.add('profile', line, `in a ${what} file the DECKS line of seat ${String(deck.p)} must have complete ${String(own)}`);
        }
        if (!own) {
            for (const id of deckIds(deck, true).slice(1 + strings(deck.leaders).length)) {
                if (!shown.has(id)) {
                    out.add('profile', line, `DECKS lists ${id}, which the ${what} file does not reveal`);
                }
            }
        }
        for (const id of deckIds(deck, own)) {
            justified.add(id);
        }
    });

    // CARDS: only ids the header, DECKS or a shown create or reveal justify.
    file.cards.forEach((c, i) => {
        const card = c as unknown;
        if (isObject(card) && typeof card.id === 'string' && !justified.has(card.id) && !shown.has(card.id)) {
            out.add('profile', lines.cards[i], `CARDS line ${card.id} names a card the ${what} file does not reveal`);
        }
    });

    // Entities with no card in the file carry only face-down attributes (effects excepted, [W-31]).
    const anonymous = new Set<string>();
    const faceDownOnly = (a: unknown): boolean => !isObject(a) || Object.keys(a).every((k) => isFaceDownAttribute(k));
    file.records.forEach((r, i) => {
        const rec = r as unknown;
        if (!isObject(rec)) {
            return;
        }
        const key = String(rec.e);
        const attrs = rec.a;
        if (rec.t === 'create' && rec.card === undefined && !(isObject(attrs) && attrs.kind === 'effect')) {
            anonymous.add(key);
            if (!faceDownOnly(attrs)) {
                out.add('profile', lines.records[i], `an entity with no card in a ${what} file carries only face-down attributes`);
            }
        } else if (rec.t === 'reveal') {
            anonymous.delete(key);
        } else if (rec.t === 'set' && anonymous.has(key) && !faceDownOnly(attrs)) {
            out.add('profile', lines.records[i], `an entity with no card in a ${what} file carries only face-down attributes`);
        } else if (rec.t === 'remove') {
            anonymous.delete(key);
        }
    });
}

/** `card-not-indexed` ([V-09]): when the file has a `CARDS` section, every created or revealed card needs a line. */
export function checkCardIndex(file: SwuPgnFile, lines: FileLines, out: Collector): void {
    if (!lines.banners.has('CARDS')) {
        return;
    }
    const indexed = new Set<string>();
    for (const c of file.cards as unknown[]) {
        if (isObject(c) && typeof c.id === 'string') {
            indexed.add(c.id);
        }
    }
    file.records.forEach((r, i) => {
        const rec = r as unknown;
        if (isObject(rec) && (rec.t === 'create' || rec.t === 'reveal') && typeof rec.card === 'string' && !indexed.has(rec.card)) {
            out.add('card-not-indexed', lines.records[i], `card ${rec.card} has no CARDS line`);
        }
    });
}
