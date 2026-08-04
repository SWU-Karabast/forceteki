import type { SwuPgnDocument, Header, DeckRecord, GameEvent, Annotation, SetupInitRecord } from './types';

function parseHeaderLine(line: string, raw: Record<string, string>): void {
    // A line may contain multiple [Tag "Value"] pairs.
    const re = /\[([A-Za-z0-9]+)\s+"((?:[^"\\]|\\.)*)"\]/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(line)) !== null) {
        raw[m[1]] = m[2].replace(/\\(.)/g, '$1');
    }
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
        rounds: Number(req('Rounds')),
    };
}

type Section = 'NONE' | 'UNKNOWN' | 'DECKS' | 'SETUP' | 'EVENTS' | 'ANNOTATIONS';

export function parse(text: string): SwuPgnDocument {
    const raw: Record<string, string> = {};
    const decks: DeckRecord[] = [];
    const setup: (SetupInitRecord | GameEvent)[] = [];
    const events: GameEvent[] = [];
    const annotations: Annotation[] = [];
    let section: Section = 'NONE';

    const lines = text.split('\n');
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line.length === 0) {
            continue;
        }
        if (line.startsWith('[')) {
            parseHeaderLine(line, raw);
            continue;
        }
        if (line.startsWith('%%%')) {
            const name = line.slice(3).trim().toUpperCase();
            section = (['DECKS', 'SETUP', 'EVENTS', 'ANNOTATIONS'].includes(name) ? name : 'UNKNOWN') as Section;
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
            case 'SETUP': setup.push(rec as SetupInitRecord | GameEvent); break;
            case 'EVENTS': events.push(rec as GameEvent); break;
            case 'ANNOTATIONS': annotations.push(rec as Annotation); break;
            case 'UNKNOWN': throw new Error(`SWU-PGN: JSON record in unrecognized section on line ${i + 1}`);
            default: throw new Error(`SWU-PGN: record before any %%% section on line ${i + 1}`);
        }
    }

    return { header: buildHeader(raw), decks, setup, events, annotations };
}
