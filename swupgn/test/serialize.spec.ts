import * as fs from 'fs';
import * as path from 'path';
import { parse } from '../src/parse';
import { serialize } from '../src/serialize';
import type { SwuPgnFile } from '../src/generated/types';

const vectorsDir = path.resolve(__dirname, '..', '..', 'vectors');
const manifest: { vectors: { name: string; profiles: string[] }[] } =
    JSON.parse(fs.readFileSync(path.join(vectorsDir, 'manifest.json'), 'utf8'));

function emptyFile(header: Record<string, string>): SwuPgnFile {
    return { header, decks: [], cards: [], records: [], annotations: [], unknownSections: [] };
}

describe('serialize', () => {
    it('round-trips every positive vector byte for byte', () => {
        for (const v of manifest.vectors) {
            for (const profile of v.profiles) {
                const name = `${v.name}.${profile}.swupgn`;
                const text = fs.readFileSync(path.join(vectorsDir, name), 'utf8');
                expect(serialize(parse(text))).withContext(name)
                    .toBe(text);
            }
        }
    });

    it('is stable: parse(serialize(f)) deep-equals f', () => {
        const text = fs.readFileSync(path.join(vectorsDir, 'attachments.full.swupgn'), 'utf8');
        const file = parse(text);
        expect(parse(serialize(file))).toEqual(file);
    });

    it('writes Game first, then the canonical tag order, then unknown tags ascending', () => {
        const out = serialize(emptyFile({
            Zulu: '1', Rounds: '3', Alpha: '2', GameId: 'x', Steps: 'event', Visibility: 'full', P1Base: 'b', Game: 'SWU-PGN/0.1', Seed: 's', Date: 'd',
        }));
        const tags = out.split('\n').filter((l) => l.startsWith('['))
            .map((l) => l.slice(1, l.indexOf(' ')));
        expect(tags).toEqual(['Game', 'Visibility', 'Steps', 'GameId', 'Date', 'Rounds', 'P1Base', 'Seed', 'Alpha', 'Zulu']);
    });

    it('writes a Game tag when the header has none', () => {
        expect(serialize(emptyFile({})).startsWith('[Game "SWU-PGN/0.1"]\n')).toBe(true);
    });

    it('escapes quotes and backslashes in header values', () => {
        const out = serialize(emptyFile({ Game: 'SWU-PGN/0.1', Reason: 'say "hi" \\ done' }));
        expect(out).toContain('[Reason "say \\"hi\\" \\\\ done"]\n');
    });

    it('refuses a header value with a line break', () => {
        expect(() => serialize(emptyFile({ Game: 'SWU-PGN/0.1', Reason: 'a\nb' }))).toThrow();
    });

    it('writes DECKS and RECORDS even when empty, and omits other empty sections', () => {
        expect(serialize(emptyFile({ Game: 'SWU-PGN/0.1' }))).toBe('[Game "SWU-PGN/0.1"]\n\n%%% DECKS\n\n%%% RECORDS\n');
    });

    it('orders sections STORY, DECKS, CARDS, RECORDS, ANNOTATIONS, then unknown ones', () => {
        const file = emptyFile({ Game: 'SWU-PGN/0.1' });
        file.story = 'hello';
        file.cards = [{ id: 'SOR#001', name: 'N' }];
        file.annotations = [{ seq: 0, text: 't' }];
        file.unknownSections = [{ name: 'ZED', lines: ['z'] }, { name: 'ALPHA', lines: ['a'] }];
        const banners = serialize(file).split('\n')
            .filter((l) => l.startsWith('%%%'));
        expect(banners).toEqual(['%%% STORY', '%%% DECKS', '%%% CARDS', '%%% RECORDS', '%%% ANNOTATIONS', '%%% ZED', '%%% ALPHA']);
    });

    it('writes JSON keys in schema order and attributes in registry order', () => {
        const file = emptyFile({ Game: 'SWU-PGN/0.1' });
        file.records = [
            { a: { zz: 1, hp: 3, damage: 1, x_b: 2, aa: 0 }, card: 'SOR#001', owner: 1, zone: 'base', e: 4, t: 'create' },
            { a: {}, owner: 1, e: 5, zone: 'hand', t: 'create' },
            { ms: 5, seq: 1, t: 'step' },
        ] as never;
        const lines = serialize(file).split('\n');
        expect(lines).toContain('{"t":"create","e":4,"zone":"base","owner":1,"card":"SOR#001","a":{"damage":1,"hp":3,"aa":0,"x_b":2,"zz":1}}');
        expect(lines).toContain('{"t":"create","e":5,"zone":"hand","owner":1}');
        expect(lines).toContain('{"t":"step","seq":1,"ms":5}');
    });

    it('writes strings with every character as itself', () => {
        const file = emptyFile({ Game: 'SWU-PGN/0.1' });
        file.cards = [{ name: 'Ré/ú"\\\n\u0001', id: 'SOR#001' }];
        expect(serialize(file)).toContain('{"id":"SOR#001","name":"Ré/ú\\"\\\\\\n\\u0001"}');
    });
});
