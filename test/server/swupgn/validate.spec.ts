import { validate } from '../../../swupgn/src/validate';
import * as fs from 'fs';
import * as path from 'path';

const good = fs.readFileSync(
    path.resolve(__dirname, '../../../../swupgn/test-vectors/minimal.swupgn'), 'utf8');

describe('validate', function () {
    it('accepts a conformant minimal file', function () {
        const report = validate(good);
        expect(report.valid).toBe(true);
        expect(report.formatVersion).toBe('SWU-PGN/1.1');
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
            '{"seq":"R1.S.0","t":"INIT","p1DeckOrder":["SOR#108"],"p2DeckOrder":["SOR#045"]}',
            '{"seq":"NOT-A-SEQ","t":"INIT","p1DeckOrder":[],"p2DeckOrder":[]}');
        const report = validate(badSetup);
        expect(report.valid).toBe(false);
        expect(report.issues.some((i) => /^setup /.test(i.message))).toBe(true);
    });
});
