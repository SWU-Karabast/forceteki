import type { SwuPgnDocument, Header, DeckRecord, GameEvent, Annotation, SetupInitRecord, CardIndexRecord } from './types';

function parseHeaderLine(line: string, raw: Record<string, string>): void {
    // A line may contain multiple [Tag "Value"] pairs.
    const re = /\[([A-Za-z0-9]+)\s+"((?:[^"\\]|\\.)*)"\]/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(line)) !== null) {
        raw[m[1]] = m[2].replace(/\\(.)/g, '$1');
    }
}

/**
 * Parse a numeric tag, falling back when it isn't a number.
 *
 * `[Rounds "seven"]` used to yield NaN, which is not an error anywhere and so propagated
 * silently into whatever consumed it. A wrong-but-finite value fails loudly at the point of
 * use; NaN fails nowhere and corrupts everything downstream.
 */
function finiteOr(value: string, fallback: number): number {
    const n = Number(value);
    return Number.isFinite(n) ? n : fallback;
}

function buildHeader(raw: Record<string, string>): Header {
    const req = (k: string): string => {
        if (!(k in raw)) {
            throw new Error(`SWU-PGN: missing required header tag [${k}]`);
        }
        return raw[k];
    };
    return {
        game: req('Game'), gameId: req('GameId'), date: req('Date'),
        format: raw['Format'], cardPool: req('CardPool'), engine: req('Engine'),
        seed: req('Seed'),
        // The 'as' casts below are intentional: structural parsing trusts the raw
        // string values here; enum/value validation is performed by validate() (Task 4),
        // not the parser.
        perspective: (raw['Perspective'] as Header['perspective']) ?? null,
        p1Id: req('P1Id'), p2Id: req('P2Id'), p1: req('P1'), p2: req('P2'),
        p1Leader: req('P1Leader'), p1Base: req('P1Base'),
        p2Leader: req('P2Leader'), p2Base: req('P2Base'),
        result: req('Result') as Header['result'], reason: req('Reason'),
        rounds: finiteOr(req('Rounds'), 0),
    };
}

type Section = 'NONE' | 'UNKNOWN' | 'STORY' | 'DECKS' | 'CARDS' | 'SETUP' | 'EVENTS' | 'ANNOTATIONS';

/** Sections whose lines are NDJSON records. `STORY` is deliberately not one of them. */
const JSON_SECTIONS = ['DECKS', 'CARDS', 'SETUP', 'EVENTS', 'ANNOTATIONS'];

/** Drop leading/trailing blank lines a section banner's spacing leaves around the prose. */
function trimBlankEdges(lines: string[]): string[] {
    let start = 0;
    let end = lines.length;
    while (start < end && lines[start].trim() === '') {
        start++;
    }
    while (end > start && lines[end - 1].trim() === '') {
        end--;
    }
    return lines.slice(start, end);
}

export function parse(text: string): SwuPgnDocument {
    const raw: Record<string, string> = {};
    const story: string[] = [];
    const decks: DeckRecord[] = [];
    const cards: CardIndexRecord[] = [];
    const setup: (SetupInitRecord | GameEvent)[] = [];
    const events: GameEvent[] = [];
    const annotations: Annotation[] = [];
    let section: Section = 'NONE';

    const lines = text.split('\n');
    for (let i = 0; i < lines.length; i++) {
        const rawLine = lines[i];
        const line = rawLine.trim();

        // %%% STORY is prose, not NDJSON: keep every line verbatim (blank lines included,
        // they are part of the layout) until the next banner.
        if (section === 'STORY' && !line.startsWith('%%%')) {
            story.push(rawLine.replace(/\r$/, ''));
            continue;
        }
        if (line.length === 0) {
            continue;
        }
        if (line.startsWith('[')) {
            parseHeaderLine(line, raw);
            continue;
        }
        if (line.startsWith('%%%')) {
            const name = line.slice(3).trim().toUpperCase();
            section = (name === 'STORY' || JSON_SECTIONS.includes(name) ? name : 'UNKNOWN') as Section;
            continue;
        }
        let rec: unknown;
        try {
            rec = JSON.parse(line);
        } catch {
            throw new Error(`SWU-PGN: invalid JSON on line ${i + 1}`);
        }
        switch (section) {
            case 'DECKS': decks.push(rec as DeckRecord); break;
            case 'CARDS': cards.push(rec as CardIndexRecord); break;
            case 'SETUP': setup.push(rec as SetupInitRecord | GameEvent); break;
            case 'EVENTS': events.push(rec as GameEvent); break;
            case 'ANNOTATIONS': annotations.push(rec as Annotation); break;
            case 'UNKNOWN': throw new Error(`SWU-PGN: JSON record in unrecognized section on line ${i + 1}`);
            default: throw new Error(`SWU-PGN: record before any %%% section on line ${i + 1}`);
        }
    }

    return { header: buildHeader(raw), story: trimBlankEdges(story), decks, cards, setup, events, annotations };
}
