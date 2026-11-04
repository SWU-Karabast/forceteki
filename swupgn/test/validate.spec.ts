import * as fs from 'fs';
import * as path from 'path';
import { validate } from '../src/validate/index';
import type { Issue } from '../src/validate/index';

const packageDir = path.resolve(__dirname, '..', '..');
const vectorsDir = path.join(packageDir, 'vectors');
const manifest: { vectors: { name: string; profiles: string[] }[]; negative: { file: string; code: string; line: number }[] } =
    JSON.parse(fs.readFileSync(path.join(vectorsDir, 'manifest.json'), 'utf8'));

function read(rel: string): string {
    return fs.readFileSync(path.join(vectorsDir, rel), 'utf8');
}

function codes(issues: Issue[]): string[] {
    return issues.map((i) => i.code);
}

/** The hand-sized game the edits below start from (same as the `tiny` shape, minimal). */
const HEADER = (extra = '', vis = 'full') => `[Game "SWU-PGN/0.1"]
[Visibility "${vis}"]
[Steps "decision"]
[GameId "t"]
[Date "2026-11-03T12:00:00Z"]
[CardPool "SOR"]
[Engine "examplewriter@0.1.0"]
[P1Id "sha256:91f2049e8d2099e727801519bfa488ad5db4edcdde37ed9c8769abe0a10396f1"]
[P2Id "sha256:23c0c1f42e0c03a276c7a337804026b4f5e2314cf50971e2747dd24100673030"]
[P1 "Player 1"]
[P2 "Player 2"]
[Result "Incomplete"]
[Reason "Game not finished"]
[Rounds "1"]
[P1Leader "SOR#005"]
[P2Leader "SOR#010"]
[P1Base "SOR#026"]
[P2Base "SOR#029"]
${extra}`;
const DECKS = `
%%% DECKS
{"p":1,"leaders":["SOR#005"],"base":"SOR#026","complete":true,"main":[["SOR#095",3]]}
{"p":2,"leaders":["SOR#010"],"base":"SOR#029","complete":true,"main":[["SOR#130",3]]}
`;

function file(records: string[], opts: { head?: string; extra?: string; decks?: string } = {}): string {
    return `${opts.head ?? HEADER(opts.extra)}${opts.decks ?? DECKS}\n%%% RECORDS\n${records.join('\n')}\n`;
}

/** The 1-based line of the first line of `text` that contains `needle`. */
function at(text: string, needle: string): number {
    const i = text.split('\n').findIndex((l) => l.includes(needle));
    if (i < 0) {
        throw new Error(`no line with ${needle}`);
    }
    return i + 1;
}

describe('validate', function () {
    it('every positive vector is valid with no issues', function () {
        let n = 0;
        for (const v of manifest.vectors) {
            for (const p of v.profiles) {
                const report = validate(read(`${v.name}.${p}.swupgn`));
                expect(report.issues).withContext(`${v.name}.${p}`)
                    .toEqual([]);
                expect(report.level).withContext(`${v.name}.${p}`)
                    .toBe('valid');
                n++;
            }
        }
        expect(n).toBe(24);
    });

    it('each negative vector reports exactly its manifest code at its line', function () {
        for (const neg of manifest.negative) {
            const report = validate(read(neg.file));
            expect(report.issues.map((i) => [i.code, i.line])).withContext(neg.file)
                .toEqual([[neg.code, neg.line]]);
            expect(report.level).withContext(neg.file)
                .toBe(report.issues[0].severity === 'fatal' ? 'malformed' : 'well-formed');
        }
    });

    it('never throws, on anything', function () {
        for (const text of ['', '\n', 'x', '[Game "SWU-PGN/0.1"]', '{"t":"set"}', '\u0000'.repeat(10)]) {
            expect(() => validate(text)).not.toThrow();
            expect(validate(text).level).toBe('malformed');
        }
        expect(() => validate(undefined as unknown as string)).not.toThrow();
    });

    it('reports unknown-entity as an error and keeps going', function () {
        const text = file([
            '{"t":"set","e":7,"a":{"damage":1}}',
            '{"t":"create","e":1,"zone":"nowhere","owner":1}',
            '{"t":"step","seq":0}',
        ]);
        const report = validate(text);
        expect(report.level).toBe('well-formed');
        expect(report.issues.map((i) => [i.code, i.line])).toEqual([['unknown-entity', at(text, '"e":7')], ['bad-zone', at(text, 'nowhere')]]);
    });

    it('caps issues at maxIssues and adds too-many-issues once', function () {
        const recs: string[] = [];
        for (let i = 0; i < 20; i++) {
            recs.push(`{"t":"set","e":${100 + i},"a":{}}`);
        }
        const report = validate(file(recs), { maxIssues: 5 });
        expect(report.issues.length).toBe(6);
        expect(codes(report.issues).filter((c) => c === 'too-many-issues').length).toBe(1);
        expect(report.issues[5].code).toBe('too-many-issues');
        expect(report.issues[5].line).toBeUndefined();
        expect(report.level).toBe('well-formed');
    });

    it('profile: perspective file whose opponent DECKS is complete is a profile error', function () {
        const text = file([], { head: HEADER('', 'perspective:1') });
        const report = validate(text);
        expect(report.issues.map((i) => [i.code, i.line])).toEqual([['profile', at(text, '"p":2')]]);
    });

    it('profile: Seed in a perspective file is a profile error', function () {
        const text = file([], { head: HEADER('[Seed "1"]\n', 'perspective:1'), decks: DECKS.replace('"complete":true,"main":[["SOR#130",3]]', '"complete":false,"main":[]') });
        const report = validate(text);
        expect(report.issues.map((i) => [i.code, i.line])).toEqual([['profile', at(text, '[Seed')]]);
    });

    it('profile: order in DECKS, hidden create/reveal, and unreferenced CARDS lines', function () {
        const decks = `
%%% DECKS
{"p":1,"leaders":["SOR#005"],"base":"SOR#026","complete":true,"main":[["SOR#095",3]],"order":["SOR#095"]}
{"p":2,"leaders":["SOR#010"],"base":"SOR#029","complete":false,"main":[]}

%%% CARDS
{"id":"SOR#005","name":"a"}
{"id":"SOR#010","name":"b"}
{"id":"SOR#026","name":"c"}
{"id":"SOR#029","name":"d"}
{"id":"SOR#095","name":"e"}
{"id":"SOR#999","name":"f"}
`;
        const recs = [
            '{"t":"create","e":1,"zone":"hand","owner":2,"card":"SOR#095","to":[2]}',
            '{"t":"create","e":2,"zone":"hand","owner":1,"card":"SOR#095","to":[1]}',
            '{"t":"create","e":3,"zone":"hand","owner":2,"card":"SOR#095"}',
            '{"t":"reveal","e":1,"card":"SOR#095","to":[2]}',
        ];
        const text = file(recs, { head: HEADER('', 'perspective:1'), decks });
        const report = validate(text);
        expect(report.issues.map((i) => [i.code, i.line])).toEqual([
            ['profile', at(text, '"order"')], ['profile', at(text, 'SOR#999')],
            ['profile', at(text, '"e":1,"zone"')], ['profile', at(text, '"reveal"')],
        ]);
        const pubText = file(recs, { head: HEADER('', 'public'), decks });
        const pub = validate(pubText);
        expect(pub.issues.map((i) => [i.code, i.line])).toEqual([
            ['profile', at(pubText, '"p":1')], ['profile', at(pubText, 'SOR#999')],
            ['profile', at(pubText, '"e":1,"zone"')], ['profile', at(pubText, '"e":2,"zone"')], ['profile', at(pubText, '"reveal"')],
        ]);
    });

    it('a CARDS line without a name is card-index only, not also schema', function () {
        const text = file([]).replace('%%% RECORDS', '%%% CARDS\n{"id":"SOR#005"}\n\n%%% RECORDS');
        const report = validate(text);
        expect(report.issues.map((i) => [i.code, i.line])).toEqual([['card-index', at(text, '"id":"SOR#005"}')]]);
    });

    it('seq-order: first step must be 0, then count up', function () {
        const report = validate(file(['{"t":"step","seq":1}', '{"t":"step","seq":2}', '{"t":"step","seq":4}', '{"t":"step","seq":5}']));
        expect(report.issues.map((i) => [i.code, i.line])).toEqual([['seq-order', 25], ['seq-order', 27]]);
    });

    it('parent-rel: reported once on the record that causes it, and for zone mismatches', function () {
        const report = validate(file([
            '{"t":"create","e":1,"zone":"ground","owner":1,"card":"SOR#095"}',
            '{"t":"create","e":2,"zone":"ground","owner":1,"parent":1}',
            '{"t":"set","e":2,"a":{"damage":1}}',
            '{"t":"create","e":3,"zone":"space","owner":1,"parent":1,"rel":"attached"}',
            '{"t":"create","e":4,"zone":"hand","owner":1,"card":"SOR#097"}',
            '{"t":"create","e":5,"zone":"hand","owner":1,"parent":4,"rel":"attached"}',
        ]));
        expect(report.issues.map((i) => [i.code, i.line])).toEqual([
            ['parent-rel', 26], ['parent-rel', 28], ['parent-rel', 30],
        ]);
    });

    it('moving a parent that breaks a child is reported on the move; removing a parent is unknown-entity', function () {
        const report = validate(file([
            '{"t":"create","e":1,"zone":"ground","owner":1,"card":"SOR#095"}',
            '{"t":"create","e":2,"zone":"ground","owner":1,"parent":1,"rel":"attached"}',
            '{"t":"set","e":1,"zone":"discard"}',
            '{"t":"remove","e":1}',
            '{"t":"remove","e":2}',
            '{"t":"remove","e":1}',
        ]));
        expect(report.issues.map((i) => [i.code, i.line])).toEqual([
            ['parent-rel', 27], ['unknown-entity', 28],
        ]);
    });

    it('duplicate-entity and reused-id are reported and checking continues', function () {
        const report = validate(file([
            '{"t":"create","e":1,"zone":"hand","owner":1}',
            '{"t":"create","e":1,"zone":"hand","owner":1}',
            '{"t":"remove","e":1}',
            '{"t":"create","e":1,"zone":"hand","owner":1}',
            '{"t":"set","e":9,"a":{}}',
        ]));
        expect(report.issues.map((i) => i.code)).toEqual(['duplicate-entity', 'reused-id', 'unknown-entity']);
    });

    it('bad-relation, number-range and not-object', function () {
        const report = validate(file([
            '{"t":"create","e":1,"zone":"ground","owner":1}',
            '{"t":"create","e":2,"zone":"ground","owner":1,"parent":1,"rel":"glued"}',
            '{"t":"set","e":"g","a":{"x":1.5}}',
            '7',
        ]));
        expect(report.issues.map((i) => [i.code, i.line])).toEqual([['bad-relation', 26], ['number-range', 27], ['not-object', 28]]);
    });

    it('unknown record types warn, except x_ types', function () {
        const report = validate(file(['{"t":"future"}', '{"t":"x_thing"}']));
        expect(report.issues.map((i) => [i.code, i.severity, i.line])).toEqual([['unknown-type', 'warning', 25]]);
        expect(report.level).toBe('valid');
    });

    it('warnings: writer-errors, newer-minor, unknown-section, dangling-annotation', function () {
        const text = file(['{"t":"step","seq":0}'], { extra: '[WriterErrors "2"]\n' })
            .replace('SWU-PGN/0.1', 'SWU-PGN/0.9') + '\n%%% X_MINE\nfoo\n%%% OTHER\nbar\n\n%%% ANNOTATIONS\n{"seq":0,"text":"ok"}\n{"seq":5,"text":"gone"}\n';
        const report = validate(text);
        expect(report.issues.map((i) => [i.code, i.line])).toEqual([
            ['newer-minor', 1], ['writer-errors', at(text, 'WriterErrors')], ['unknown-section', at(text, 'OTHER')], ['dangling-annotation', at(text, '"seq":5')],
        ]);
        expect(report.issues.every((i) => i.severity === 'warning')).toBe(true);
        expect(report.level).toBe('valid');
    });

    it('result-mismatch compares Result with g.result at the last step', function () {
        const done = (r: string, a: string) => file([`{"t":"set","e":"g","a":${a}}`, '{"t":"step","seq":0}']).replace('[Result "Incomplete"]', `[Result "${r}"]`);
        expect(validate(done('P1', '{"result":"p1"}')).issues).toEqual([]);
        expect(validate(done('Draw', '{"result":"draw"}')).issues).toEqual([]);
        expect(validate(done('P2', '{"result":"p1"}')).issues.map((i) => [i.code, i.line])).toEqual([['result-mismatch', 12]]);
        expect(validate(done('Incomplete', '{"result":"p1"}')).issues.map((i) => i.code)).toEqual(['result-mismatch']);
    });

    it('block-fields: contract fields, extras, and the redaction exception', function () {
        const full = validate(file(['{"t":"block","id":1,"kind":"attack","p":1}', '{"t":"block","id":2,"kind":"pass","p":1,"amount":2}', '{"t":"block","id":3,"kind":"mystery"}']));
        expect(full.issues.map((i) => [i.code, i.line])).toEqual([['block-fields', 25], ['block-fields', 26]]);
        const decks = DECKS.replace('"complete":true,"main":[["SOR#130",3]]', '"complete":false,"main":[]');
        const persp = validate(file(['{"t":"block","id":1,"kind":"attack","p":1}', '{"t":"block","id":2,"kind":"draw","amount":1}'], { head: HEADER('', 'perspective:1'), decks }));
        expect(persp.issues.map((i) => [i.code, i.line])).toEqual([['block-fields', 26]]);
    });

    it('schema: a bad record, a bad header value and a bad DECKS section', function () {
        const bad = validate(file(['{"t":"create","e":1,"zone":"hand"}', '{"zone":"hand"}']));
        expect(bad.issues.map((i) => [i.code, i.line])).toEqual([['schema', 25], ['schema', 26]]);
        const vis = validate(file([], { head: HEADER().replace('"full"', '"everyone"') }));
        expect(vis.issues.map((i) => [i.code, i.line])).toEqual([['schema', 2]]);
        const oneDeck = validate(file([], { decks: DECKS.split('\n').slice(0, 3)
            .join('\n') + '\n' }));
        expect(oneDeck.issues.map((i) => [i.code, i.line])).toEqual([['schema', 20]]);
        const counts = validate(file([], { decks: DECKS.replace('["SOR#095",3]', '["SOR#095"]') }));
        expect(counts.issues.map((i) => [i.code, i.line])).toEqual([['schema', 21]]);
    });

    it('card-not-indexed only applies when the file has CARDS', function () {
        const recs = ['{"t":"create","e":1,"zone":"hand","owner":1,"card":"SOR#095","to":[1]}'];
        expect(validate(file(recs)).issues).toEqual([]);
        const withCards = file(recs).replace('%%% RECORDS', '%%% CARDS\n{"id":"SOR#005","name":"a"}\n\n%%% RECORDS');
        expect(validate(withCards).issues.map((i) => [i.code, i.line])).toEqual([['card-not-indexed', 28]]);
    });

    it('fatal parse errors come back as malformed with their line', function () {
        const report = validate('hello');
        expect(report.level).toBe('malformed');
        expect(report.issues).toEqual([jasmine.objectContaining({ code: 'not-swupgn', severity: 'fatal', line: 1 })]);
        const limited = validate(file([]), { limits: { maxBytes: 10 } });
        expect(codes(limited.issues)).toEqual(['too-large']);
    });

    it('non-object lines in DECKS, CARDS and ANNOTATIONS are not-object, and range applies there too', function () {
        const text = `${file([]).replace('%%% RECORDS', '%%% CARDS\n[1]\n\n%%% RECORDS')}\n%%% ANNOTATIONS\n"hi"\n{"seq":9007199254740993}\n`
            .replace('{"p":2,', '5\n{"p":2,');
        const report = validate(text);
        expect(report.issues.map((i) => i.code)).toEqual(['not-object', 'not-object', 'not-object', 'number-range']);
    });

    it('header formats: a raw email in P1Id, a bad Date, a bad card id, an unknown Result are schema errors', function () {
        const bad = (from: string, to: string) => validate(file([], { head: HEADER().replace(from, to) }));
        const id = '[P1Id "sha256:91f2049e8d2099e727801519bfa488ad5db4edcdde37ed9c8769abe0a10396f1"]';
        expect(bad(id, '[P1Id "player@example.com"]').issues.map((i) => [i.code, i.line])).toEqual([['schema', 8]]);
        expect(bad('2026-11-03T12:00:00Z', '2026-11-03').issues.map((i) => [i.code, i.line])).toEqual([['schema', 5]]);
        expect(bad('[P1Base "SOR#026"]', '[P1Base "SOR#26"]').issues.map((i) => [i.code, i.line])).toEqual([['schema', 17]]);
        expect(bad('[Result "Incomplete"]', '[Result "Win"]').issues.map((i) => [i.code, i.line])).toEqual([['schema', 12]]);
        const recs = validate(file(['{"t":"create","e":1,"zone":"hand","owner":1,"card":"sor-005"}']));
        expect(recs.issues.map((i) => [i.code, i.line])).toEqual([['schema', 25]]);
    });

    it('a file with no DECKS or no RECORDS is a schema error where the header ends', function () {
        const noDecks = `${HEADER()}\n%%% RECORDS\n{"t":"step","seq":0}\n`;
        expect(validate(noDecks).issues.map((i) => [i.code, i.line])).toEqual([['schema', at(noDecks, '%%% RECORDS')]]);
        const noRecords = `${HEADER()}${DECKS}`;
        expect(validate(noRecords).issues.map((i) => [i.code, i.line])).toEqual([['schema', at(noRecords, '%%% DECKS')]]);
        const persp = `${HEADER('', 'perspective:1')}\n%%% RECORDS\n`;
        expect(validate(persp).issues.map((i) => [i.code, i.line])).toEqual([['schema', at(persp, '%%% RECORDS')]]);
    });

    it('profile: the opponent partial DECKS line lists only revealed cards, and CARDS only justified ids', function () {
        const decks = `
%%% DECKS
{"p":1,"leaders":["SOR#005"],"base":"SOR#026","complete":true,"main":[["SOR#095",3]]}
{"p":2,"leaders":["SOR#010"],"base":"SOR#029","complete":false,"main":[["SOR#130"],["SOR#132"]]}

%%% CARDS
{"id":"SOR#005","name":"a"}
{"id":"SOR#095","name":"e"}
{"id":"SOR#130","name":"g"}
{"id":"SOR#132","name":"h"}
{"id":"SOR#777","name":"only an x_ record names me"}

%%% RECORDS
`;
        const text = `${HEADER('', 'perspective:1')}${decks}{"t":"create","e":1,"zone":"hand","owner":2,"card":"SOR#130","to":"all"}\n{"t":"x_note","card":"SOR#777"}\n`;
        const report = validate(text);
        expect(report.issues.map((i) => [i.code, i.line])).toEqual([
            ['profile', at(text, '"p":2')], ['profile', at(text, '"id":"SOR#132"')], ['profile', at(text, 'SOR#777"')],
        ]);
    });

    it('profile: an anonymous entity carries only face-down attributes', function () {
        const decks = DECKS.replace('"complete":true,"main":[["SOR#130",3]]', '"complete":false,"main":[]');
        const recs = [
            '{"t":"create","e":1,"zone":"hand","owner":2,"to":[2],"a":{"copyOf":"SOR#095","cost":3}}',
            '{"t":"create","e":2,"zone":"resource","owner":2,"to":[2],"a":{"exhausted":true}}',
            '{"t":"set","e":2,"a":{"cost":2}}',
            '{"t":"create","e":3,"owner":1,"to":"all","a":{"kind":"effect","duration":"phase"}}',
        ];
        const text = file(recs, { head: HEADER('', 'perspective:1'), decks });
        expect(validate(text).issues.map((i) => [i.code, i.line])).toEqual([['profile', at(text, '"e":1')], ['profile', at(text, '"cost":2')]]);
    });

    it('profile: an unregistered header tag or attribute in a perspective or public file is a profile error', function () {
        const partial = DECKS.replace('"complete":true,"main":[["SOR#130",3]]', '"complete":false,"main":[]');
        const recs = [
            '{"t":"set","e":"p2","a":{"handCount":3,"x_examplewriter_deckName":"Wampa Rush"}}',
            '{"t":"create","e":1,"zone":"base","owner":1,"card":"SOR#026","a":{"kind":"base","zzz":1}}',
            '{"t":"set","e":1,"a":{"damage":2}}',
        ];
        const text = file(recs, { head: HEADER('[XExamplewriterTable "casual"]\n', 'perspective:1'), decks: partial });
        expect(validate(text).issues.map((i) => [i.code, i.line])).toEqual([
            ['profile', at(text, 'XExamplewriterTable')], ['profile', at(text, 'x_examplewriter_deckName')], ['profile', at(text, '"zzz"')],
        ]);
        const both = DECKS.replace(/"complete":true,"main":\[\["SOR#\d+",3\]\]/g, '"complete":false,"main":[]');
        const pubText = file(recs, { head: HEADER('[XExamplewriterTable "casual"]\n', 'public'), decks: both });
        expect(validate(pubText).issues.map((i) => [i.code, i.line])).toEqual([
            ['profile', at(pubText, 'XExamplewriterTable')], ['profile', at(pubText, 'x_examplewriter_deckName')], ['profile', at(pubText, '"zzz"')],
        ]);
        expect(validate(file(recs, { extra: '[XExamplewriterTable "casual"]\n' })).issues).toEqual([], 'a full file may carry extensions');
    });

    it('profile: a block other than a name block carries no text in a perspective or public file', function () {
        const partial = DECKS.replace('"complete":true,"main":[["SOR#130",3]]', '"complete":false,"main":[]');
        const recs = [
            '{"t":"create","e":1,"zone":"base","owner":1,"card":"SOR#026","a":{"kind":"base"}}',
            '{"t":"block","id":1,"kind":"pass","p":2,"text":"Passed, holding Wampa"}',
            '{"t":"block","id":2,"kind":"name","p":1,"src":1,"text":"Wampa"}',
        ];
        const text = file(recs, { head: HEADER('', 'perspective:1'), decks: partial });
        expect(validate(text).issues.map((i) => [i.code, i.line])).toEqual([['profile', at(text, '"kind":"pass"')]]);
        expect(validate(file(recs)).issues).toEqual([], 'a full file keeps block text');
    });

    it('parent without rel is parent-rel even when the parent is unknown, with no schema error besides', function () {
        const text = file(['{"t":"create","e":1,"zone":"ground","owner":1,"parent":99}']);
        expect(validate(text).issues.map((i) => [i.code, i.line])).toEqual([['parent-rel', 25], ['unknown-entity', 25]]);
    });

    it('a perspective block missing src is not block-fields (redaction exception); a missing p still is', function () {
        const decks = DECKS.replace('"complete":true,"main":[["SOR#130",3]]', '"complete":false,"main":[]');
        const text = file(['{"t":"block","id":1,"kind":"play","p":1}', '{"t":"block","id":2,"kind":"play","src":1}'], { head: HEADER('', 'perspective:1'), decks });
        expect(validate(text).issues.map((i) => [i.code, i.line])).toEqual([['block-fields', 26]]);
    });

    it('entity ids named like Object.prototype members are handled', function () {
        const report = validate(file(['{"t":"set","e":"constructor","a":{}}', '{"t":"set","e":"toString","a":{}}', '{"t":"remove","e":"g"}']));
        expect(report.issues.map((i) => i.code)).toEqual(['schema', 'schema', 'unknown-entity']);
    });

    it('maxIssues that is not a positive number falls back to the default', function () {
        const recs = Array.from({ length: 30 }, (_, i) => `{"t":"set","e":${100 + i},"a":{}}`);
        for (const bad of [NaN, '3', undefined, null, Infinity]) {
            const report = validate(file(recs), { maxIssues: bad as unknown as number });
            expect(report.issues.length).withContext(String(bad))
                .toBe(30);
        }
        expect(validate(file(recs), { maxIssues: 0 }).issues.length).toBe(2);
    });

    it('profile: copyOf on a shown entity is justified by its CARDS line; on an effect it is a leak', function () {
        const decks = `
%%% DECKS
{"p":1,"leaders":["SOR#005"],"base":"SOR#026","complete":true,"main":[["SOR#095",3]]}
{"p":2,"leaders":["SOR#010"],"base":"SOR#029","complete":false,"main":[]}

%%% CARDS
{"id":"SOR#005","name":"a"}
{"id":"SOR#095","name":"b"}
{"id":"SOR#200","name":"c"}

%%% RECORDS
`;
        const unit = '{"t":"create","e":1,"zone":"ground","owner":2,"card":"SOR#095","to":"all","a":{"copyOf":"SOR#200"}}\n';
        const ok = `${HEADER('', 'perspective:1')}${decks}${unit}`;
        expect(validate(ok.replace('"card":"SOR#095","to":"all"', '"card":"SOR#095","to":"all"')).issues).toEqual([]);
        const effect = `${ok}{"t":"create","e":2,"owner":2,"to":"all","a":{"kind":"effect","duration":"phase","copyOf":"SOR#200","cost":2}}\n`;
        expect(validate(effect).issues.map((i) => [i.code, i.line])).toEqual([['profile', at(effect, '"e":2')]]);
        const later = `${effect.replace(',"copyOf":"SOR#200","cost":2', '')}{"t":"set","e":2,"a":{"cost":1}}\n`;
        expect(validate(later).issues.map((i) => [i.code, i.line])).toEqual([['profile', at(later, '"cost":1')]]);
    });

    it('a file with neither DECKS nor RECORDS lists both', function () {
        const report = validate(HEADER());
        expect(report.issues.length).toBe(1);
        expect(report.issues[0].message).toMatch(/DECKS.*RECORDS/);
    });
});
