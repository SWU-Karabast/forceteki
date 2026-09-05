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
        expect(report.issues.some((i) => /Result/.test(i.message))).toBe(true);
    });

    it('tolerates an unknown event type as a warning, not an error', function () {
        const withUnknown = good.replace('%%% EVENTS', '%%% EVENTS\n{"seq":"R1.A.9","t":"FUTURE_THING","p":1}');
        const report = validate(withUnknown);
        expect(report.issues.some((i) => i.severity === 'warning' && /FUTURE_THING/.test(i.message))).toBe(true);
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
            '{"seq":"R1.S.0","t":"INIT","p1DeckOrder":["SOR#108","SOR#108:2","SOR#108:3"],"p2DeckOrder":["SOR#045","SOR#045:2","SOR#045:3"]}',
            '{"seq":"NOT-A-SEQ","t":"INIT","p1DeckOrder":[],"p2DeckOrder":[]}');
        const report = validate(badSetup);
        expect(report.valid).toBe(false);
        expect(report.issues.some((i) => /^setup /.test(i.message))).toBe(true);
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
            '{"seq":"R1.A.1a","t":"EXHAUST","card":"SOR#108"}\n{"seq":"R1.A.2c","t":"DRAW","p":1,"count":1,"cards":5}');
        expect(badDraw).not.toBe(good);
        const report = validate(badDraw);
        expect(report.valid).toBe(false);
        expect(report.issues.some((i) => (/R1\.A\.2c/).test(i.message))).toBe(true);
    });
});
