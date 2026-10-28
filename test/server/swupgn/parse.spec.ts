import { parse, SwuPgnError } from '../../../swupgn/src/parse';
import { validate } from '../../../swupgn/src/validate';

const SAMPLE = [
    '[Game "SWU-PGN/1.0"]',
    '[GameId "g1"]',
    '[Date "2026-06-16T00:00:00Z"]',
    '[CardPool "LOF"] [Engine "forceteki@2.3.1"]',
    '[Seed "abc"] [Perspective "P1"]',
    '[P1Id "sha256:a"] [P2Id "sha256:b"] [P1 "Player 1"] [P2 "Player 2"]',
    '[P1Leader "SOR#010"] [P1Base "SOR#028"] [P2Leader "SOR#005"] [P2Base "SOR#020"]',
    '[Result "P1"] [Reason "BaseDestroyed"] [Rounds "4"]',
    '',
    '%%% DECKS',
    '{"p":1,"leader":"SOR#010","base":"SOR#028","deck":[["SOR#087",2]]}',
    '',
    '%%% SETUP',
    '{"seq":"R0.S.0","t":"INIT","p1DeckOrder":["SOR#087"],"p2DeckOrder":["SOR#045"]}',
    '',
    '%%% EVENTS',
    '{"seq":"R1.A.1","t":"PLAY","p":1,"card":"SOR#108","zone":"ground","cost":2}',
    '',
    '%%% ANNOTATIONS',
    '{"ref":"R1.A.1","nag":"?!","text":"too greedy"}',
].join('\n');

describe('parse', function () {
    it('parses header tags including multiple tags per line', function () {
        const doc = parse(SAMPLE);
        expect(doc.header.game).toBe('SWU-PGN/1.0');
        expect(doc.header.rounds).toBe(4);
        expect(doc.header.perspective).toBe('P1');
        expect(doc.header.result).toBe('P1');
    });

    it('parses each section into typed records', function () {
        const doc = parse(SAMPLE);
        expect(doc.decks.length).toBe(1);
        expect(doc.decks[0].deck[0]).toEqual(['SOR#087', 2]);
        expect(doc.setup.length).toBe(1);
        expect(doc.events.length).toBe(1);
        expect(doc.events[0].t).toBe('PLAY');
        expect(doc.annotations[0].nag).toBe('?!');
    });

    it('ignores blank lines and tolerates trailing whitespace', function () {
        const doc = parse(SAMPLE + '\n\n   \n');
        expect(doc.events.length).toBe(1);
    });
});

describe('parse error paths', function () {
    const HEAD = [
        '[Game "SWU-PGN/1.0"]', '[GameId "g1"]', '[Date "2026-06-16T00:00:00Z"]',
        '[CardPool "LOF"] [Engine "e"] [Seed "s"]',
        '[P1Id "a"] [P2Id "b"] [P1 "Player 1"] [P2 "Player 2"]',
        '[P1Leader "SOR#010"] [P1Base "SOR#028"] [P2Leader "SOR#005"] [P2Base "SOR#020"]',
        '[Result "P1"] [Reason "X"] [Rounds "1"]',
    ].join('\n');

    it('throws on a missing required header tag', function () {
        const bad = HEAD.replace('[Result "P1"] ', '');
        expect(() => parse(bad)).toThrowError(/required header tag \[Result\]/);
    });

    it('throws with a line number on invalid JSON in a body section', function () {
        const bad = HEAD + '\n%%% EVENTS\n{not json}';
        expect(() => parse(bad)).toThrowError(/invalid JSON on line/);
    });

    it('throws when a record appears before any section', function () {
        const bad = HEAD + '\n{"seq":"R1.A.1","t":"PASS","p":1}';
        expect(() => parse(bad)).toThrowError(/before any %%% section/);
    });

    // §18: a section this reader does not know belongs to a LATER version, not to a broken
    // file. Throwing here made every 1.0 reader hard-fail on the first file carrying a new
    // section — the exact forward compatibility the spec promises in writing. The records are
    // skipped and everything the reader DOES understand still parses.
    it('ignores a record under an unrecognized section instead of throwing', function () {
        const forward = HEAD + '\n%%% BOGUS\n{"x":1}\n\n%%% EVENTS\n{"seq":"R1.A.1","t":"PASS","p":1}';
        let doc;
        expect(() => {
            doc = parse(forward);
        }).not.toThrow();
        expect(doc.events.map((e) => e.seq)).toEqual(['R1.A.1']);
    });
});

describe('parse header numbers', function () {
    const header = (rounds: string) => [
        '[Game "SWU-PGN/1.0"] [GameId "g"] [Date "2026-06-16T00:00:00Z"] [CardPool "SOR"] [Engine "e"] [Seed "s"]',
        '[P1Id "sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"] [P2Id "sha256:bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb"] [P1 "Player 1"] [P2 "Player 2"]',
        '[P1Leader "SOR#010"] [P1Base "SOR#028"] [P2Leader "SOR#005"] [P2Base "SOR#020"]',
        `[Result "P1"] [Reason "r"] [Rounds "${rounds}"]`,
        '', '%%% EVENTS',
    ].join('\n');

    it('parses a numeric Rounds tag', function () {
        expect(parse(header('7')).header.rounds).toBe(7);
    });

    // Rounds is required, so a corrupt value cannot fall back to "absent" the way an optional
    // count does. It used to read as 0 and validate clean; now the file is not well-formed.
    it('rejects a Rounds tag that is not base-10 digits', function () {
        for (const bad of ['seven', '-1', '1.5', ' 4', '']) {
            expect(() => parse(header(bad))).withContext(`Rounds "${bad}"`)
                .toThrowMatching((e) => e instanceof SwuPgnError && e.code === 'bad-count');
        }
    });

    it('reads RecorderErrors when present and leaves it absent otherwise', function () {
        expect(parse(header('4')).header.recorderErrors).toBeUndefined();
        const withErrors = header('4').replace('[Rounds "4"]', '[Rounds "4"] [RecorderErrors "2"]');
        expect(withErrors).not.toBe(header('4'));
        expect(parse(withErrors).header.recorderErrors).toBe(2);
    });

    // A count that is not digits is CORRUPT, not zero. finiteOr ran before any schema saw the
    // value, so `[Undos "garbage"]` became `undos: 0` and validated clean -- a mangled audit
    // trail reporting, confidently, that no undo ever happened.
    it('drops a non-numeric count tag rather than reading it as zero', function () {
        for (const bad of ['garbage', '1e309', '-1', '']) {
            const text = header('4').replace('[Rounds "4"]', `[Rounds "4"] [Undos "${bad}"]`);
            expect(parse(text).header.undos)
                .withContext(`Undos "${bad}" must not parse to a number`)
                .toBeUndefined();
        }
        const good = header('4').replace('[Rounds "4"]', '[Rounds "4"] [Undos "3"]');
        expect(parse(good).header.undos).toBe(3);
    });

    // A pilot file has no WriterRevision; a current one says which writer revision made it.
    it('reads WriterRevision as a count, absent on a file written before the tag existed', function () {
        expect(parse(header('4')).header.writerRevision).toBeUndefined();
        const stamped = header('4').replace('[Rounds "4"]', '[Rounds "4"] [WriterRevision "1"]');
        expect(parse(stamped).header.writerRevision).toBe(1);
        expect(validate(stamped).issues.filter((i) => i.severity === 'error')).toEqual([]);
        const zero = header('4').replace('[Rounds "4"]', '[Rounds "4"] [WriterRevision "0"]');
        expect(validate(zero).issues.map((i) => i.message).join(' ')).toContain('WriterRevision');
    });

    it('does not mistake a [-prefixed record inside a JSON section for a header line', function () {
        const text = header('4') + '\n["not","an","event"]\n';
        const doc = parse(text);
        expect(doc.events.length).toBe(1); // it reached the record path (validate() rejects it)
    });
});

describe('parse grammar (spec §4, Appendix B)', function () {
    const HEAD = [
        '[Game "SWU-PGN/1.0"] [GameId "g"] [Date "2026-06-16T00:00:00Z"] [CardPool "SOR"] [Engine "e"] [Seed "s"]',
        '[P1Id "p"] [P2Id "q"] [P1 "Player 1"] [P2 "Player 2"]',
        '[P1Leader "SOR#010"] [P1Base "SOR#028"] [P2Leader "SOR#005"] [P2Base "SOR#020"]',
        '[Result "P1"] [Reason "r"] [Rounds "1"]',
    ].join('\n');
    const code = (text: string, limits = {}) => {
        try {
            parse(text, limits);
            return 'ok';
        } catch (e) {
            return e instanceof SwuPgnError ? e.code : `untyped: ${(e as Error).message}`;
        }
    };

    it('strips a leading byte order mark', function () {
        expect(code('\uFEFF' + HEAD)).toBe('ok');
    });

    it('requires the first line to be the Game tag', function () {
        expect(code('[GameId "g"]\n' + HEAD)).toBe('not-swupgn');
        expect(code('hello\n' + HEAD)).toBe('not-swupgn');
        expect(code('')).toBe('not-swupgn');
    });

    it('rejects text outside the brackets of a header line', function () {
        expect(code(HEAD.replace('[Rounds "1"]', '[Rounds "1"] trailing'))).toBe('bad-header-line');
    });

    it('rejects an escape other than \\\\ and \\" instead of dropping the backslash', function () {
        expect(code(HEAD.replace('[Reason "r"]', '[Reason "a\\nb"]'))).toBe('bad-escape');
        const ok = parse(HEAD.replace('[Reason "r"]', '[Reason "say \\"hi\\" \\\\ n"]'));
        expect(ok.header.reason).toBe('say "hi" \\ n');
    });

    it('rejects a tag given twice and a section given twice', function () {
        expect(code(HEAD + '\n[Rounds "2"]')).toBe('duplicate-tag');
        expect(code(HEAD + '\n%%% EVENTS\n%%% EVENTS')).toBe('duplicate-section');
    });

    it('skips an unknown section unread, even when its lines are not JSON', function () {
        expect(code(HEAD + '\n%%% X_NOTES\nfree text, not JSON\n%%% EVENTS')).toBe('ok');
    });

    it('rejects input over a limit rather than reading part of it', function () {
        const events = HEAD + '\n%%% EVENTS\n' + '{"seq":"R1.A.1","t":"PASS","p":1}\n'.repeat(3);
        expect(code(events, { maxRecords: 2 })).toBe('too-many-records');
        expect(code(events, { maxBytes: 100 })).toBe('too-large');
        expect(code(events, { maxLineLength: 20 })).toBe('line-too-long');
        expect(code(HEAD + '\n%%% EVENTS\n' + '['.repeat(70) + ']'.repeat(70))).toBe('too-deep');
    });
});
