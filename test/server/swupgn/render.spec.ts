import { render } from '../../../swupgn/src/render';
import { parse } from '../../../swupgn/src/parse';
import * as fs from 'fs';
import * as path from 'path';

const text = fs.readFileSync(path.resolve(__dirname, '../../../../swupgn/test-vectors/minimal.swupgn'), 'utf8');

describe('render', function () {
    it('renders a round banner, a phase banner and numbered top-level actions', function () {
        const out = render(parse(text), { nameOf: (id) => id });   // identity name resolver
        expect(out).toContain('ROUND 1');
        expect(out).toContain('── action ──');
        expect(out).toMatch(/1\. Player 1 plays SOR#108/);
    });

    it('indents consequences under the numbered action they belong to', function () {
        const out = render(parse(text), { nameOf: (id) => id });
        // The DAMAGE caused by action 2 is indented under it, not numbered itself. The
        // seq scheme already groups them (R1.A.2 -> R1.A.2a); the indent shows it.
        expect(out).toMatch(/2\. Player 1 attacks[^\n]*\n {7}↳ 2 damage to Player 2's base/);
    });

    it('uses the document\'s own CARDS index when no resolver is given', function () {
        // The whole point of the index: a file is readable with no external card database.
        const out = render(parse(text));
        expect(out).toContain('Player 1 plays Wampa to ground');
        expect(out).not.toContain('SOR#108');
    });

    it('shows the board from the round keyframe', function () {
        const out = render(parse(text));
        expect(out).toContain('P1  base 30/30   hand 1   resources 2');
        expect(out).toContain('initiative: Player 1');
    });
});

describe('render base phrasing', function () {
    const nm = { nameOf: (id: string) => id };
    it('names the relevant player base on DAMAGE/OVERWHELM/HEAL', function () {
        const events = [
            { seq: 'R1.A.1a', t: 'DAMAGE', src: 'SOR#108', tgt: 'base@2', amt: 2, damageType: 'combat', hp: 28 },
            { seq: 'R1.A.1b', t: 'OVERWHELM', p: 1, tgt: 'base@2', amt: 3, hp: 25 },
            { seq: 'R1.A.2a', t: 'HEAL', tgt: 'base@1', amt: 1, hp: 30 },
        ];
        const out = render({ header: {} as any, decks: [], setup: [], events: events as any, annotations: [] }, nm);
        expect(out).toContain("2 damage to Player 2's base — 28 HP left");
        expect(out).toContain("3 Overwhelm damage to Player 2's base — 25 HP left");
        expect(out).toContain("1 healed on Player 1's base — 30 HP left");
    });
});
