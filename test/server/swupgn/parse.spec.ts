import { parse, RESERVED_KEYS, SwuPgnError } from '../../../swupgn/src/parse';
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
        '[CardPool "LOF"] [Engine "e@1"] [Seed "s"]',
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
        '[Game "SWU-PGN/1.0"]', '[GameId "g"] [Date "2026-06-16T00:00:00Z"] [CardPool "SOR"] [Engine "e@1"] [Seed "s"]',
        '[P1Id "sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"] [P2Id "sha256:bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb"] [P1 "Player 1"] [P2 "Player 2"]',
        '[P1Leader "SOR#010"] [P1Base "SOR#028"] [P2Leader "SOR#005"] [P2Base "SOR#020"]',
        `[Result "Incomplete"] [Reason "r"] [Rounds "${rounds}"]`,
        '', '%%% EVENTS',
    ].join('\n');

    it('parses a numeric Rounds tag', function () {
        expect(parse(header('7')).header.rounds).toBe(7);
    });

    // A corrupt Rounds used to read as 0 and validate clean; now the file is not well-formed.
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

    // A count that is not digits is a broken file, neither zero nor absent: reading
    // `[RecorderErrors "x"]` as absent would say no records were lost and let the file grade
    // complete (spec §5, §24 bad-count).
    it('rejects an optional count tag that is present but not base-10 digits', function () {
        for (const tag of ['RecorderErrors', 'Undos', 'WriterRevision', 'GameNumber']) {
            for (const bad of ['garbage', '1e309', '-1', '', '99999999999999999999']) {
                const text = header('4').replace('[Rounds "4"]', `[Rounds "4"] [${tag} "${bad}"]`);
                expect(() => parse(text))
                    .withContext(`${tag} "${bad}"`)
                    .toThrowMatching((e: unknown) => e instanceof SwuPgnError && e.code === 'bad-count');
            }
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
        '[Game "SWU-PGN/1.0"]', '[GameId "g"] [Date "2026-06-16T00:00:00Z"] [CardPool "SOR"] [Engine "e@1"] [Seed "s"]',
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
        // The Game tag stands alone, with a numeric version (Appendix B game-line).
        expect(code(HEAD.replace('[Game "SWU-PGN/1.0"]', '[Game "SWU-PGN/x"]'))).toBe('not-swupgn');
        expect(code(HEAD.replace('[Game "SWU-PGN/1.0"]', '[Game "SWU-PGN/1.0"] [Format "Premier"]'))).toBe('not-swupgn');
    });

    // §18: a different major version would be misread, so it is refused, not read as 1.x.
    it('refuses a file of another major version', function () {
        expect(code(HEAD.replace('SWU-PGN/1.0', 'SWU-PGN/2.0'))).toBe('unsupported-major');
        expect(code(HEAD.replace('SWU-PGN/1.0', 'SWU-PGN/0.9'))).toBe('unsupported-major');
        // Compared as written, as the Game tag's schema does: `01` is not `1`.
        expect(code(HEAD.replace('SWU-PGN/1.0', 'SWU-PGN/01.0'))).toBe('unsupported-major');
        expect(code(HEAD.replace('SWU-PGN/1.0', 'SWU-PGN/1.7'))).toBe('ok');
    });

    // §23: a key that names the object model is never data. `__proto__` can replace a prototype;
    // an own `toString` or `valueOf` that is not a function makes the object impossible to print,
    // so every reader that renders or compares the field throws. One check here protects them all.
    it('rejects a reserved key anywhere in any record', function () {
        const at = (section: string, line: string) => HEAD + `\n%%% ${section}\n` + line;
        for (const key of RESERVED_KEYS) {
            expect(code(at('EVENTS', `{"seq":"R1.A.1","t":"PASS","p":1,"x":{"${key}":1}}`))).withContext(`${key} nested`)
                .toBe('reserved-key');
            expect(code(at('EVENTS', `{"seq":"R1.A.1","t":"DEFEAT","card":"SOR#108","reason":{"${key}":null}}`))).withContext(`${key} as a value`)
                .toBe('reserved-key');
            expect(code(at('DECKS', `{"p":1,"${key}":1}`))).withContext(`${key} in DECKS`)
                .toBe('reserved-key');
            expect(code(at('CARDS', `{"id":"SOR#108","name":"Wampa","${key}":1}`))).withContext(`${key} in CARDS`)
                .toBe('reserved-key');
            expect(code(at('ANNOTATIONS', `{"ref":"R1.A.1","text":"t","x":[{"${key}":1}]}`))).withContext(`${key} in ANNOTATIONS`)
                .toBe('reserved-key');
            // Value: protects=P-06 refuses every reserved name as a STATUS_TOKEN token, the one value the fold makes a key; fails_when=the check drops a name, tests the wrong field or record type; why_new=the reserved-token-name vector covers toString only; seam=none; no_claim=the fold's own defineProperty guard
            expect(code(at('EVENTS', `{"seq":"R1.A.1","t":"STATUS_TOKEN","card":"SOR#108","token":"${key}","count":1}`))).withContext(`${key} as a status token`)
                .toBe('reserved-key');
        }
        // The same words as values, or inside a longer key, are ordinary data.
        expect(code(at('EVENTS', '{"seq":"R1.A.1","t":"PASS","p":1,"x_toString":"constructor"}'))).toBe('ok');
        // Value: protects=only a STATUS_TOKEN token is refused as a value (spec: no other 1.0 value becomes a key); fails_when=the check widens to any record's token or to every token name; why_new=no test parsed a non-reserved token or a CREATE_TOKEN token; seam=none; no_claim=whether the validator's schema accepts the CREATE_TOKEN
        expect(code(at('EVENTS', '{"seq":"R1.A.1","t":"STATUS_TOKEN","card":"SOR#108","token":"advantage","count":1}'))).toBe('ok');
        expect(code(at('EVENTS', '{"seq":"R1.A.1","t":"CREATE_TOKEN","p":1,"token":"toString","zone":"ground"}'))).toBe('ok');
        // Value: protects=the token check runs only where a fold reads STATUS_TOKEN records ([P-06]); fails_when=it runs on every section again; why_new=the check was narrowed to SETUP, EVENTS and annotation lines; seam=none; no_claim=none beyond protects
        expect(code(at('DECKS', '{"p":1,"t":"STATUS_TOKEN","token":"toString"}'))).toBe('ok');
    });

    // Value: protects=a header tag named by a reserved key is refused (§23), since a reader keys its header by tag name; fails_when=the tag-name check is dropped or misses a name; why_new=tag names were only checked for duplicates; seam=none; no_claim=a third-party reader's own header handling
    it('rejects a header tag named by a reserved key', function () {
        for (const key of RESERVED_KEYS) {
            if ((/^[A-Za-z0-9]+$/).test(key)) {
                expect(code(HEAD + `\n[${key} "x"]`)).withContext(key)
                    .toBe('reserved-key');
            }
        }
        expect(code(HEAD + '\n[XToString "x"]')).toBe('ok');
    });

    // The depth limit stops the scan as soon as it is passed, before any more nesting is tracked.
    it('refuses a line of a million open brackets at the depth limit', function () {
        expect(code(HEAD + '\n%%% EVENTS\n' + '{'.repeat(1_000_000))).toBe('too-deep');
    });

    // I-JSON (spec §4): JSON.parse keeps the last of two equal keys, another language's parser
    // the first, so a repeated key would fold to two different boards.
    it('rejects a record that repeats a key in one object', function () {
        const events = (line: string) => HEAD + '\n%%% EVENTS\n' + line;
        expect(code(events('{"seq":"R1.A.1","t":"MOVE","to":"hand","to":"ground"}'))).toBe('duplicate-key');
        expect(code(events('{"seq":"R1.A.1","t":"PASS","p":1,"x":{"a":1,"\\u0061":2}}'))).toBe('duplicate-key');
        // The same key in two different objects, and key-like text inside a value, are fine.
        expect(code(events('{"seq":"R1.A.1","t":"PASS","p":1,"x":{"p":1},"y":[{"p":2},{"p":3}],"z":"\\"p\\":1"}'))).toBe('ok');
        // Not JSON at all is still bad-json, not a duplicate.
        expect(code(events('{"a":1,"a":}'))).toBe('bad-json');
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

    // Value: protects=the size cap counts UTF-8 bytes, as its name and §23's 16 MiB say; fails_when=parse compares the string's length, which counts UTF-16 units, so text of multi-byte characters passes at up to 4x the cap; why_new=the limit case uses ASCII only, where the two agree; seam=none; no_claim=the cap's value
    it('measures the size cap in UTF-8 bytes, not characters', function () {
        const text = HEAD + '\n%%% EVENTS\n';
        const bytes = new TextEncoder().encode(text).length;
        const emoji = '\u{1F600}'.repeat(10);   // 20 UTF-16 units, 40 UTF-8 bytes
        const padded = text.replace('%%% EVENTS', `%%% X_PAD\n${emoji}\n%%% EVENTS`);
        expect(code(padded, { maxBytes: bytes + 40 })).toBe('too-large');
        expect(code(padded, { maxBytes: bytes + 60 })).toBe('ok');
    });

    // Value: protects=brackets inside a JSON string (free annotation text) do not count toward the depth limit; fails_when=scanJson stops tracking strings or escaped quotes and rejects a shallow record as too-deep; why_new=the too-deep case uses bare brackets only; seam=none; no_claim=the limit value itself
    it('does not count brackets inside a JSON string toward the depth limit', function () {
        // The deep `{` run sits between escaped quotes, so a scanner that ends the string at `\"` sees it.
        const text = '"' + '['.repeat(70) + ' \\"' + '{'.repeat(70) + '\\" "';
        expect(code(HEAD + '\n%%% EVENTS\n{"seq":"R1.A.1","t":"PASS","p":1}\n%%% ANNOTATIONS\n{"ref":"R1.A.1","text":' + text + '}')).toBe('ok');
    });
});
