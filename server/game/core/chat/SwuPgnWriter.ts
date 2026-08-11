import type { SwuPgnDocument, Header } from '../../../../swupgn/src/types';

/** Order of header tags in the emitted file (mirrors the spec §6 table). */
const HEADER_TAG_ORDER: [keyof Header, string][] = [
    ['game', 'Game'], ['gameId', 'GameId'], ['date', 'Date'], ['format', 'Format'],
    ['cardPool', 'CardPool'], ['engine', 'Engine'], ['seed', 'Seed'], ['perspective', 'Perspective'],
    ['p1Id', 'P1Id'], ['p2Id', 'P2Id'], ['p1', 'P1'], ['p2', 'P2'],
    ['p1Leader', 'P1Leader'], ['p1Base', 'P1Base'], ['p2Leader', 'P2Leader'], ['p2Base', 'P2Base'],
    ['result', 'Result'], ['reason', 'Reason'], ['rounds', 'Rounds'],
];

function escapeTag(value: string): string {
    return value
        .replace(/[\r\n]+/g, ' ')
        .replace(/\\/g, '\\\\')
        .replace(/"/g, '\\"');
}

export class SwuPgnWriter {
    public write(doc: SwuPgnDocument): string {
        const lines: string[] = [];

        for (const [key, tag] of HEADER_TAG_ORDER) {
            const v = doc.header[key];
            if (v == null || v === '') {
                continue; // optional tags (Format, Perspective) omitted when absent
            }
            lines.push(`[${tag} "${escapeTag(String(v))}"]`);
        }

        lines.push('', '%%% DECKS');
        for (const d of doc.decks) {
            lines.push(JSON.stringify(d));
        }
        lines.push('', '%%% SETUP');
        for (const s of doc.setup) {
            lines.push(JSON.stringify(s));
        }
        lines.push('', '%%% EVENTS');
        for (const e of doc.events) {
            lines.push(JSON.stringify(e));
        }
        lines.push('', '%%% ANNOTATIONS');
        for (const a of doc.annotations) {
            lines.push(JSON.stringify(a));
        }

        return lines.join('\n') + '\n';
    }
}
