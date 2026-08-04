import { parse, fold, render, validate, stateAt } from '../../../swupgn/src/index';
import * as fs from 'fs';
import * as path from 'path';

const text = fs.readFileSync(path.resolve(__dirname, '../../../../swupgn/test-vectors/minimal.swupgn'), 'utf8');

describe('swupgn public API', function () {
    it('round-trips parse -> validate -> fold -> render', function () {
        expect(validate(text).valid).toBe(true);
        const doc = parse(text);
        const s = fold(doc.events);
        expect(s.round).toBe(1);
        const story = render(doc, { nameOf: (id) => id });
        expect(story.length).toBeGreaterThan(0);
        const mid = stateAt(doc.events, 'R1.A.1');
        expect(mid.players[2]!.baseHp).toBe(30);
    });
});
