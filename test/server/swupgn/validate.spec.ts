import { MAX_ISSUES, validate } from '../../../swupgn/src/validate';
import * as fs from 'fs';
import * as path from 'path';

const good = fs.readFileSync(
    path.resolve(__dirname, '../../../../swupgn/test-vectors/minimal.swupgn'), 'utf8');

describe('validate', function () {
    it('accepts a conformant minimal file', function () {
        const report = validate(good);
        expect(report.valid).toBe(true);
        expect(report.formatVersion).toBe('SWU-PGN/1.0');
        expect(report.issues.filter((i) => i.severity === 'error')).toEqual([]);
    });

    // Value: protects=a %%% CARDS entry that is not a card record fails validation instead of crashing render later; fails_when=validate() skips the card index; why_new=no spec put a bad entry in the index; seam=none; no_claim=render's own tolerance
    it('rejects a card index entry that is not a card record', function () {
        const bad = good.replace('%%% CARDS\n', '%%% CARDS\nnull\n');
        expect(bad).not.toBe(good);
        const report = validate(bad);
        expect(report.valid).toBe(false);
        expect(report.issues.some((i) => (/card index entry/).test(i.message))).toBe(true);
    });

    it('rejects a file missing a required header tag', function () {
        const bad = good.replace('[Result "Incomplete"]', '');
        const report = validate(bad);
        expect(report.valid).toBe(false);
        expect(report.issues.some((i) => (/Result/).test(i.message))).toBe(true);
    });

    // DEFEAT.reason is the one CLOSED vocabulary in the format (spec §6.4): a reader is meant to
    // branch on it, so a value outside the set is a file defect, not a forward-compatibility
    // case. Every other small vocabulary stays open.
    it('accepts every DEFEAT reason in the closed set and rejects one outside it', function () {
        const withDefeat = (reason: string) => good.replace(
            '%%% EVENTS',
            `%%% EVENTS\n{"seq":"R1.A.9","t":"DEFEAT","card":"SOR#108","reason":"${reason}"}`);
        for (const reason of ['attack', 'ability', 'nonCombatDamage', 'uniqueRule', 'frameworkEffect', 'unknown']) {
            const report = validate(withDefeat(reason));
            expect(report.issues.filter((i) => i.severity === 'error'))
                .withContext(`reason "${reason}" should be accepted`)
                .toEqual([]);
        }
        const bad = validate(withDefeat('vaporised'));
        expect(bad.valid).toBe(false);
        expect(bad.issues.some((i) => i.severity === 'error' && (/reason/).test(i.message))).toBe(true);
    });

    // An UNDO note is an ordinary record with an extraordinary seq: it hangs a `-undo` suffix off
    // the seq it reached back to, because the recorder's counters were rewound and the replay
    // re-issues the original number.
    it('accepts an UNDO note, including one that reached back to a round boundary', function () {
        for (const at of ['R1.A.2', 'R1.start']) {
            const withUndo = good.replace(
                '%%% EVENTS', `%%% EVENTS\n{"seq":"${at}-undo","t":"UNDO","at":"${at}","by":2}`);
            const report = validate(withUndo);
            expect(report.issues.filter((i) => i.severity === 'error'))
                .withContext(`UNDO at "${at}" should be accepted`)
                .toEqual([]);
            expect(report.issues.some((i) => (/UNDO/).test(i.message))).toBe(false);
        }
    });

    // `kind` is answered from the ability OBJECT precisely so a reader can trust a fixed
    // vocabulary instead of regexing the engine's own identifier; a value outside it is a file
    // defect the schema should catch.
    it('accepts every ABILITY_ACTIVATE kind and rejects one outside the set', function () {
        const withKind = (kind: string) => good.replace(
            '%%% EVENTS',
            `%%% EVENTS\n{"seq":"R1.A.9","t":"ABILITY_ACTIVATE","p":1,"card":"SOR#010","kind":"${kind}"}`);
        for (const kind of ['action', 'epic', 'triggered', 'keyword', 'replacement', 'constant']) {
            const report = validate(withKind(kind));
            expect(report.issues.filter((i) => i.severity === 'error'))
                .withContext(`kind "${kind}" should be accepted`)
                .toEqual([]);
        }
        const bad = validate(withKind('mystical'));
        expect(bad.valid).toBe(false);
        expect(bad.issues.some((i) => i.severity === 'error' && (/kind/).test(i.message))).toBe(true);
    });

    // parse() ignores an unrecognized section (§18 forward compatibility), which also means a
    // typo'd banner would parse to zero events and say nothing. It stays visible here.
    it('warns on an unrecognized %%% banner without erroring', function () {
        const typo = good.replace('%%% CARDS', '%%% CARD');
        const report = validate(typo);
        expect(report.issues.filter((i) => i.severity === 'error')).toEqual([]);
        expect(report.issues.some((i) => i.severity === 'warning' && (/unknown section/).test(i.message))).toBe(true);
        expect(report.valid).toBe(true);
    });

    // These arrive from an untrusted file. The loops read rec['seq'] before the schema ran, so a
    // single `null` line under %%% EVENTS threw out of the validator itself -- turning "tell me
    // if this file is conformant" into a crash for the caller asking the question.
    it('reports a non-object record instead of crashing on it', function () {
        for (const junk of ['null', '42', '"a string"', '[1,2,3]']) {
            const bad = good.replace('%%% EVENTS', `%%% EVENTS\n${junk}`);
            let report;
            expect(() => {
                report = validate(bad);
            }).withContext(`record ${junk} must not throw`).not.toThrow();
            expect(report.valid).withContext(`record ${junk} must be invalid`)
                .toBe(false);
        }
    });

    it('tolerates an unknown event type as a warning, not an error', function () {
        const withUnknown = good.replace('%%% EVENTS', '%%% EVENTS\n{"seq":"R1.A.9","t":"FUTURE_THING","p":1}');
        const report = validate(withUnknown);
        expect(report.issues.some((i) => i.severity === 'warning' && (/FUTURE_THING/).test(i.message))).toBe(true);
        expect(report.valid).toBe(true);
    });
});

describe('validate edge cases', function () {
    it('accepts a deck that includes a sideboard', function () {
        const withSb = good.replace(
            '{"p":1,"leader":"SOR#010","base":"SOR#028","deck":[["SOR#108",3]]}',
            '{"p":1,"leader":"SOR#010","base":"SOR#028","deck":[["SOR#108",3]],"sideboard":[["SOR#099",2]]}');
        const report = validate(withSb);
        expect(report.issues.filter((i) => i.severity === 'error')).toEqual([]);
        expect(report.valid).toBe(true);
    });

    it('flags a malformed seq in the SETUP section', function () {
        const badSetup = good.replace(
            '{"seq":"R0.S.0","t":"INIT","p1DeckOrder":["SOR#108","SOR#108:2","SOR#108:3","SOR#108:4","SOR#108:5"],"p2DeckOrder":["SOR#045","SOR#045:2","SOR#045:3","SOR#045:4","SOR#045:5"]}',
            '{"seq":"NOT-A-SEQ","t":"INIT","p1DeckOrder":[],"p2DeckOrder":[]}');
        const report = validate(badSetup);
        expect(report.valid).toBe(false);
        expect(report.issues.some((i) => (/^setup /).test(i.message))).toBe(true);
    });

    // §18 forward compatibility: an annotation field a later version adds must not make a 1.0
    // reader reject the file. The schema was closed (`additionalProperties: false`), so the
    // first annotation extension would have failed validation everywhere.
    it('accepts an annotation carrying a field this version does not know', function () {
        const forward = good.replace(
            '{"ref":"R1.A.2","nag":"?!","text":"attacking the base too early"}',
            '{"ref":"R1.A.2","nag":"?!","text":"attacking the base too early","futureField":{"a":1}}');
        const report = validate(forward);
        expect(report.issues.filter((i) => i.severity === 'error')).toEqual([]);
        expect(report.valid).toBe(true);
    });

    it('accepts a threaded annotation (spec §15 id/parent/ts)', function () {
        const threaded = good.replace(
            '{"ref":"R1.A.2","nag":"?!","text":"attacking the base too early"}',
            '{"ref":"R1.A.2","nag":"?!","text":"attacking the base too early","id":"n1","ts":1}\n' +
            '{"ref":"R1.A.2","text":"disagree, the tempo is worth it","by":"someone","id":"n2","parent":"n1","ts":2}');
        const report = validate(threaded);
        expect(report.issues.filter((i) => i.severity === 'error')).toEqual([]);
        expect(report.valid).toBe(true);
    });

    it('rejects the field shapes the fold dereferences (spec §9): a malformed keyframe, a non-array cards', function () {
        const badKeyframe = good.replace((/"keyframe":\{.*\}\}\}/), '"keyframe":{"players":{"1":{"cards":"x","hand":[],"discard":[]}}}');
        expect(badKeyframe).not.toBe(good);
        expect(validate(badKeyframe).valid).toBe(false);

        const badDraw = good.replace(
            '{"seq":"R1.A.1a","t":"EXHAUST","card":"SOR#108"}',
            '{"seq":"R1.A.1a","t":"EXHAUST","card":"SOR#108"}\n{"seq":"R1.A.1z","t":"DRAW","p":1,"count":1,"cards":5}');
        expect(badDraw).not.toBe(good);
        const report = validate(badDraw);
        expect(report.valid).toBe(false);
        expect(report.issues.some((i) => (/R1\.A\.1z/).test(i.message))).toBe(true);
    });

    // Every event type the writer can emit must be in KNOWN_EVENT_TYPES, or the validator calls
    // our own output "unknown ... tolerated for forward compatibility" -- which tells a consumer
    // the file came from a NEWER writer than their reader. LEADER_FLIP shipped without being
    // added, so every Chancellor Palpatine game validated with a spurious warning. No vector
    // contains a double-sided leader, so nothing caught it.
    it('recognises every event type the writer emits (no spurious forward-compat warning)', function () {
        const withFlip = good.replace(
            '{"seq":"R1.A.1a","t":"EXHAUST","card":"SOR#108"}',
            '{"seq":"R1.A.1a","t":"EXHAUST","card":"SOR#108"}\n' +
            '{"seq":"R1.A.1y","t":"LEADER_FLIP","p":1,"card":"TWI#017","onStartingSide":false}');
        expect(withFlip).not.toBe(good);
        expect(validate(withFlip).issues).toEqual([]);
    });
});

describe('validate conformance levels and cross-record rules (spec §2.1)', function () {
    const codes = (text: string) => validate(text).issues.map((i) => `${i.severity}:${i.code}`);
    const addEvent = (json: string) => good.replace('%%% EVENTS', `%%% EVENTS\n${json}`);

    it('rates the minimal vector complete, and says why when a file falls short', function () {
        expect(validate(good).level).toBe('complete');
        expect(validate('not a file').level).toBe('malformed');
        expect(validate(good.replace('[WriterRevision "3"]\n', '')).level).toBe('well-formed');
        expect(codes(good.replace('[WriterRevision "3"]\n', ''))).toEqual(['warning:pre-release']);
        expect(validate(good.replace('[Rounds "2"]', '[Rounds "2"] [RecorderErrors "1"]')).level).toBe('verified');
        expect(validate(addEvent('{"seq":"R1.A.9","t":"DEFEAT","card":"SOR#108","reason":"unknown"}')).level).toBe('verified');
    });

    it('drops to valid, not invalid, when the stream does not account for a keyframe', function () {
        const damaged = good.replace('"baseHp":30', '"baseHp":29');
        expect(damaged).not.toBe(good);
        const report = validate(damaged);
        expect(report.valid).toBe(true);
        expect(report.level).toBe('valid');
        expect(codes(damaged)).toContain('warning:keyframe-mismatch');
    });

    it('rejects a seq used twice, and a for or ref that names nothing', function () {
        expect(codes(addEvent('{"seq":"R1.A.1","t":"PASS","p":1}'))).toContain('error:duplicate-seq');
        expect(codes(addEvent('{"seq":"R1.A.9","t":"PASS","p":1,"for":"R9.A.9"}'))).toContain('error:dangling-ref');
        expect(codes(good.replace('{"ref":"R2.A.1"', '{"ref":"R9.A.9"'))).toContain('error:dangling-ref');
        // A reply whose parent is gone is still shown (§15), so that one is only a warning.
        expect(codes(good.replace('{"ref":"R2.A.1"', '{"parent":"nobody","ref":"R2.A.1"'))).toEqual(['warning:dangling-parent']);
    });

    // UNDO.at names a record the undo DELETED, so it normally names nothing left in the file.
    it('does not require UNDO.at to resolve', function () {
        expect(codes(addEvent('{"seq":"R1.A.7-undo","t":"UNDO","at":"R1.A.7"}'))).toEqual([]);
    });

    it('rejects a zone outside the vocabulary, and a MOVE into its own zone outside an arena', function () {
        expect(codes(addEvent('{"seq":"R1.A.9","t":"MOVE","card":"SOR#108","from":"hand","to":"limbo","p":1}'))).toContain('error:bad-zone');
        expect(codes(addEvent('{"seq":"R1.A.9","t":"MOVE","card":"SOR#108","from":"hand","to":"hand","p":1}'))).toContain('error:same-zone-move');
        // An attachment changing in place is a MOVE from an arena to the same arena (§10.1).
        expect(codes(addEvent('{"seq":"R1.A.9","t":"MOVE","card":"SOR#108","from":"ground","to":"ground","p":1,"kind":"unit"}'))).not.toContain('error:same-zone-move');
    });

    // Value: protects=a keyframe card in a zone outside the vocabulary is an error, not a silently folded board; fails_when=the keyframe card zone check is dropped from validate(); why_new=bad-zone was only tested on record zone and MOVE from/to; seam=none; no_claim=the fold's own handling of such a card
    it('rejects a keyframe card whose zone is outside the vocabulary', function () {
        const bad = good.replace('"cards":[{"id":"SOR#108","zone":"ground"', '"cards":[{"id":"SOR#108","zone":"limbo"');
        expect(bad).not.toBe(good);
        expect(codes(bad)).toContain('error:bad-zone');
        expect(validate(bad).level).toBe('well-formed');
    });

    // Value: protects=an annotation is walked for unsafe numbers like a record is, and a reserved key in one is refused; fails_when=validate() stops calling walkValues on annotations, or the parser stops checking ANNOTATIONS keys; why_new=number-range was tested on events only; seam=none; no_claim=none
    it('rejects reserved keys and unsafe integers inside an annotation', function () {
        const ann = (extra: string) => good.replace('{"ref":"R2.A.1"', `{${extra},"ref":"R2.A.1"`);
        expect(codes(ann('"x":{"__proto__":{"polluted":true}}'))).toContain('error:reserved-key');
        expect(codes(ann('"x":9007199254740993'))).toContain('error:number-range');
    });

    // Value: protects=a malformed file reports the parser's stable code and line to the consumer; fails_when=validate() maps every parse failure to 'malformed' or drops SwuPgnError.line; why_new=the manifest checks codes only, never the line; seam=none; no_claim=the message wording
    it('reports a parse failure with its error code and line number', function () {
        const lines = good.split('\n');
        const at = lines.indexOf('%%% EVENTS') + 1;
        lines.splice(at, 0, '{not json}');
        const report = validate(lines.join('\n'));
        expect(report.level).toBe('malformed');
        expect(report.valid).toBe(false);
        expect(report.issues.map((i) => ({ severity: i.severity, code: i.code, line: i.line })))
            .toEqual([{ severity: 'error', code: 'bad-json', line: at + 1 }]);
    });

    it('rejects reserved keys and integers a JSON reader cannot hold exactly', function () {
        expect(codes(addEvent('{"seq":"R1.A.9","t":"PASS","p":1,"x":{"__proto__":{"polluted":true}}}'))).toContain('error:reserved-key');
        expect(codes(addEvent('{"seq":"R1.A.9","t":"DAMAGE","tgt":"base@1","amt":9007199254740993,"hp":1}'))).toContain('error:number-range');
        expect(codes(addEvent('{"seq":"R1.A.9","t":"DAMAGE","tgt":"base@1","amt":1.5,"hp":1}'))).toContain('error:number-range');
    });

    // §18: a 1.1 file may use a closed-vocabulary value 1.0 has never seen. That is the newer
    // writer's business; rejecting it would make every 1.0 validator reject every 1.1 file.
    it('downgrades an unknown closed-vocabulary value to a warning in a newer minor version', function () {
        const defeat = '{"seq":"R1.A.9","t":"DEFEAT","card":"SOR#108","reason":"vaporised"}';
        expect(codes(addEvent(defeat))).toContain('error:schema');
        const newer = codes(addEvent(defeat).replace('SWU-PGN/1.0', 'SWU-PGN/1.1'));
        expect(newer).toContain('warning:newer-minor');
        expect(newer).toContain('warning:unknown-value');
        expect(newer.filter((c) => c.startsWith('error'))).toEqual([]);
        // §18: a reason this version does not know reads as `unknown`, so the file is at most verified.
        expect(newer).toContain('warning:unknown-defeat');
        expect(validate(addEvent(defeat).replace('SWU-PGN/1.0', 'SWU-PGN/1.1')).level).toBe('verified');
    });

    // §18: seat values are not a vocabulary a minor version may grow, so a bad seat is an error
    // in a file of any minor version.
    it('keeps an unknown seat an error in a newer minor version', function () {
        const newer = codes(addEvent('{"seq":"R1.A.9","t":"PASS","p":3}').replace('SWU-PGN/1.0', 'SWU-PGN/1.1'));
        expect(newer).toContain('error:schema');
        expect(newer).not.toContain('warning:unknown-value');
        // The header names seats as strings: a third one is not a new vocabulary name either.
        for (const tag of ['[Result "Incomplete"]', '[Perspective "P1"]']) {
            const base = tag.startsWith('[Perspective') ? good.replace('[Rounds "2"]', '[Rounds "2"] [Perspective "P1"]') : good;
            const bad = base.replace(tag, tag.replace(/"[^"]+"\]$/, '"P3"]')).replace('SWU-PGN/1.0', 'SWU-PGN/1.1');
            expect(bad).toContain('"P3"]');
            expect(codes(bad)).withContext(tag)
                .toContain('error:schema');
            expect(codes(bad)).withContext(tag).not.toContain('warning:unknown-value');
        }
    });

    // A minor version may add names to a vocabulary, never change its type.
    it('keeps a wrong-typed vocabulary value an error in a newer minor version', function () {
        const newer = codes(addEvent('{"seq":"R1.A.9","t":"DEFEAT","card":"SOR#108","reason":5}').replace('SWU-PGN/1.0', 'SWU-PGN/1.1'));
        expect(newer).toContain('error:schema');
        expect(newer).not.toContain('warning:unknown-value');
    });

    // Cross-record rule 5 covers every record. A deck record is open (§7), so its schema alone
    // no longer rejects an unknown key.
    it('rejects unsafe integers in DECKS and CARDS records, and a reserved key there as malformed', function () {
        const deck = good.replace('"deck":[["SOR#108",5]]}', '"deck":[["SOR#108",5]],"x":{"__proto__":{"polluted":true}}}');
        expect(deck).not.toBe(good);
        expect(codes(deck)).toContain('error:reserved-key');
        expect(validate(deck).level).toBe('malformed');
        expect(codes(good.replace('"deck":[["SOR#108",5]]}', '"deck":[["SOR#108",9007199254740993]]}'))).toContain('error:number-range');
        expect(codes(good.replace('%%% CARDS', '%%% CARDS\n{"id":"SOR#999","name":"X","n":1.5}'))).toContain('error:number-range');
        const card = good.replace('%%% CARDS', '%%% CARDS\n{"id":"SOR#999","name":"X","x":{"constructor":1}}');
        expect(card).not.toBe(good);
        expect(codes(card)).toContain('error:reserved-key');
    });

    // §24: a validator reports every issue it finds, so a file below valid still says the
    // writer lost records.
    it('reports recorder-errors and unknown-defeat even when the file has errors', function () {
        const broken = addEvent('{"seq":"R1.A.1","t":"PASS","p":1}\n{"seq":"R1.A.9","t":"DEFEAT","card":"SOR#108","reason":"unknown"}')
            .replace('[Rounds "2"]', '[Rounds "2"] [RecorderErrors "2"]');
        expect(codes(broken)).toContain('error:duplicate-seq');
        expect(codes(broken)).toContain('warning:recorder-errors');
        expect(codes(broken)).toContain('warning:unknown-defeat');
        expect(validate(broken).level).toBe('well-formed');
        // A DEFEAT in SETUP counts too.
        const inSetup = good.replace('%%% SETUP', '%%% SETUP\n{"seq":"R0.S.9","t":"DEFEAT","card":"SOR#108","reason":"unknown"}');
        expect(inSetup).not.toBe(good);
        expect(codes(inSetup)).toContain('warning:unknown-defeat');
    });

    // A hostile file can break a rule on every record; the list stops at the cap, the level
    // still counts every issue.
    it('stops listing issues at the cap and says so', function () {
        const flood = good.replace('%%% EVENTS', '%%% EVENTS\n' + '{}\n'.repeat(2000));
        const report = validate(flood);
        expect(report.issues.length).toBe(MAX_ISSUES + 1);
        expect(report.issues[MAX_ISSUES].code).toBe('too-many-issues');
        expect(report.level).toBe('well-formed');
        expect(report.valid).toBe(false);

        // With no errors at all, a warning that lowers the level can arrive after the cap. It is
        // not listed, and the level still counts it.
        const newTypes = Array.from({ length: MAX_ISSUES + 1 }, (_, n) => `{"seq":"R2.A.${100 + n}","t":"FUTURE_THING"}`).join('\n');
        const late = good.replace('%%% EVENTS', `%%% EVENTS\n${newTypes}`)
            .replace('[Rounds "2"]', '[Rounds "2"] [RecorderErrors "1"]')
            .replace('SWU-PGN/1.0', 'SWU-PGN/1.1');
        const lateReport = validate(late);
        expect(lateReport.issues.filter((i) => i.severity === 'error')).toEqual([]);
        expect(lateReport.issues.map((i) => i.code)).not.toContain('recorder-errors');
        expect(lateReport.issues[MAX_ISSUES].code).toBe('too-many-issues');
        expect(lateReport.level).toBe('verified');
    });

    it('skips X_ extension events and sections without a warning, and accepts new deck fields', function () {
        expect(codes(addEvent('{"seq":"R1.A.9","t":"X_SWUFORGE_NOTE","p":1}'))).toEqual([]);
        expect(codes(good.replace('%%% ANNOTATIONS', '%%% X_VENDOR\nanything at all\n\n%%% ANNOTATIONS'))).toEqual([]);
        const deck = good.replace('"deck":[["SOR#108",5]]}', '"deck":[["SOR#108",5]],"x_name":"Wampa Rush"}');
        expect(deck).not.toBe(good);
        expect(codes(deck)).toEqual([]);
    });

    it('rejects header values outside their formats (spec §5.1)', function () {
        expect(codes(good.replace('2026-06-16T00:00:00Z', '16/06/2026'))).toContain('error:schema');
        expect(codes(good.replace('sha256:' + 'a'.repeat(64), 'sha256:aaaa'))).toContain('error:schema');
        expect(codes(good.replace('[Result "Incomplete"]', '[Result "incomplete"]'))).toContain('error:schema');
    });
});
