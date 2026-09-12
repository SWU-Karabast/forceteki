import { validate } from '../../../swupgn/src/validate';
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
        const typo = good.replace('%%% EVENTS', '%%% EVENT');
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
            '{"seq":"R1.S.0","t":"INIT","p1DeckOrder":["SOR#108","SOR#108:2","SOR#108:3","SOR#108:4","SOR#108:5"],"p2DeckOrder":["SOR#045","SOR#045:2","SOR#045:3","SOR#045:4","SOR#045:5"]}',
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
