import { render } from '../../../swupgn/src/render';
import { parse } from '../../../swupgn/src/parse';
import * as fs from 'fs';
import * as path from 'path';

const text = fs.readFileSync(path.resolve(__dirname, '../../../../swupgn/test-vectors/minimal.swupgn'), 'utf8');

describe('render', function () {
    it('renders a phase banner and numbered top-level actions', function () {
        const doc = parse(text);
        const out = render(doc, { nameOf: (id) => id });   // identity name resolver
        expect(out).toContain('─── action ───');
        expect(out).toMatch(/1\. Player 1 plays SOR#108/);
    });

    it('renders sub-events unnumbered beneath their action', function () {
        const doc = parse(text);
        const out = render(doc, { nameOf: (id) => id });
        // a DAMAGE sub-event line has no "N." prefix
        expect(out).toMatch(/\n[^0-9].*deals 2 damage/);
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
        expect(out).toContain("deals 2 damage to Player 2's base (28 remaining HP)");
        expect(out).toContain("Overwhelm damage dealt to Player 2's base (25 remaining HP)");
        expect(out).toContain("damage healed from Player 1's base (30 remaining HP)");
    });
});
