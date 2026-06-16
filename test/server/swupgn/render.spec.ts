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
