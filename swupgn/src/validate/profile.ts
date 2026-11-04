import type { Audience, DeckLine, SwuPgnFile } from '../generated/types.js';
import type { FileLines } from '../parse.js';
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

/** Every card id the file mentions outside `CARDS`: header, `DECKS`, and `RECORDS` ([W-51]). */
function mentionedIds(file: SwuPgnFile): Set<string> {
    const ids = new Set<string>();
    for (const tag of ['P1Leader', 'P2Leader']) {
        for (const id of (file.header[tag] ?? '').split(',')) {
            ids.add(id);
        }
    }
    ids.add(file.header.P1Base);
    ids.add(file.header.P2Base);
    for (const deck of file.decks as unknown[]) {
        if (!isObject(deck)) {
            continue;
        }
        const strings = (v: unknown) => (Array.isArray(v) ? v : []);
        for (const id of strings(deck.leaders)) {
            ids.add(String(id));
        }
        ids.add(String(deck.base));
        for (const list of [deck.main, deck.sideboard]) {
            for (const entry of strings(list)) {
                ids.add(String(Array.isArray(entry) ? entry[0] : entry));
            }
        }
        for (const id of strings(deck.order)) {
            ids.add(String(id));
        }
    }
    for (const rec of file.records as unknown[]) {
        if (!isObject(rec)) {
            continue;
        }
        if (typeof rec.card === 'string') {
            ids.add(rec.card);
        }
        if (isObject(rec.a) && typeof rec.a.copyOf === 'string') {
            ids.add(rec.a.copyOf);
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
    file.decks.forEach((d: DeckLine, i) => {
        const deck = d as unknown;
        if (!isObject(deck)) {
            return;
        }
        const line = lines.decks[i];
        if (deck.order !== undefined) {
            out.add('profile', line, `a ${what} file has no DECKS line with order`);
        }
        if (typeof deck.p === 'number') {
            const wantComplete = seat !== null && deck.p === seat;
            if (typeof deck.complete === 'boolean' && deck.complete !== wantComplete) {
                out.add('profile', line, `in a ${what} file the DECKS line of seat ${String(deck.p)} must have complete ${String(wantComplete)}`);
            }
        }
    });
    if (lines.banners.has('DECKS') === false) {
        out.add('profile', lines.tags.get('Visibility'), `a ${what} file needs a DECKS line for each seat`);
    }
    file.records.forEach((r, i) => {
        const rec = r as unknown;
        if (!isObject(rec) || (rec.t !== 'create' && rec.t !== 'reveal') || typeof rec.card !== 'string') {
            return;
        }
        const to: Audience | unknown = rec.to === undefined && rec.t === 'create' ? 'all' : rec.to;
        if (!holds(to, seat)) {
            out.add('profile', lines.records[i], `a ${rec.t} of a card that ${seat === null ? 'is not shown to everyone' : `seat ${seat} does not know`} has no place in a ${what} file`);
        }
    });
    if (file.cards.length > 0 || lines.banners.has('CARDS')) {
        const ids = mentionedIds(file);
        file.cards.forEach((c, i) => {
            const card = c as unknown;
            if (isObject(card) && typeof card.id === 'string' && !ids.has(card.id)) {
                out.add('profile', lines.cards[i], `CARDS line ${card.id} names a card the ${what} file does not mention`);
            }
        });
    }
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
