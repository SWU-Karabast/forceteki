import * as fs from 'fs';
import * as path from 'path';
import { parse } from '../src/parse';
import { render } from '../src/render';
import type { SwuPgnFile } from '../src/generated/types';

const vectorsDir = path.join(__dirname, '..', '..', 'vectors');
const fixturesDir = path.join(__dirname, '..', '..', 'test', 'fixtures');
const load = (name: string): SwuPgnFile => parse(fs.readFileSync(path.join(vectorsDir, name + '.swupgn'), 'utf8'));

describe('render', () => {
    it('renders tiny.full to the golden text', () => {
        const golden = fs.readFileSync(path.join(fixturesDir, 'tiny.full.render.txt'), 'utf8');
        expect(render(load('tiny.full'))).toBe(golden);
    });

    it('renders a perspective file without naming unknown cards', () => {
        const manifest = JSON.parse(fs.readFileSync(path.join(vectorsDir, 'manifest.json'), 'utf8')) as { vectors: { name: string; profiles: string[] }[] };
        let checked = 0;
        for (const v of manifest.vectors) {
            if (!v.profiles.includes('full')) {
                continue;
            }
            const full = load(v.name + '.full');
            for (const profile of v.profiles.filter((p) => p !== 'full')) {
                const file = load(`${v.name}.${profile}`);
                const own = new Set(file.cards.map((c) => c.id));
                const ownNames = file.cards.map((c) => c.name);
                const text = render(file);
                for (const c of full.cards) {
                    if (own.has(c.id)) {
                        continue;
                    }
                    expect(text).not.toContain(c.id);
                    if (!ownNames.includes(c.name)) {
                        const whole = new RegExp(`(^|[^A-Za-z0-9])${c.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}($|[^A-Za-z0-9])`);
                        expect(whole.test(text)).withContext(`${v.name}.${profile} names ${c.name}`)
                            .toBe(false);
                    }
                }
                checked++;
            }
        }
        expect(checked).toBeGreaterThan(0);
    });

    it('ignores unknown block kinds with a generic line', () => {
        const file = load('tiny.full');
        file.records.push({ t: 'block', id: 99, kind: 'x_flourish', p: 1, src: 5 });
        file.records.push({ t: 'block', id: 100, kind: 'x_nested', parent: 99 });
        const lines = render(file).split('\n');
        expect(lines).toContain('1. Player 1: x_flourish (Battlefield Marine).');
        expect(lines).toContain('   a. x_nested.');
    });

    it('falls back to the card id, then to "a card"', () => {
        const file = load('tiny.full');
        file.cards = file.cards.filter((c) => c.id !== 'SOR#095');
        expect(render(file)).toContain('Player 1 plays SOR#095.');
        file.records.push({ t: 'block', id: 99, kind: 'look', p: 1, targets: [9999], amount: 1 });
        expect(render(file)).toContain('Player 1 looks at a card.');
    });

    it('does not throw when a record cannot be applied', () => {
        const file = load('tiny.full');
        file.records = [{ t: 'set', e: 55, a: { x: 1 } }, { t: 'block', id: 1, kind: 'play', p: 1, src: 55 }];
        expect(render(file)).toContain('Player 1 plays a card.');
    });

    it('renders a block with an unknown parent at top level', () => {
        const file = load('tiny.full');
        file.records = [{ t: 'block', id: 5, kind: 'pass', p: 2, parent: 4 }];
        expect(render(file)).toBe('After the last step\n1. Player 2 passes.\n');
    });

    it('renders an empty records file as empty text', () => {
        const file = load('tiny.full');
        file.records = [];
        expect(render(file)).toBe('');
    });

    it('lists a block before any step under the step that closes it, and later ones after the last step', () => {
        const file = load('tiny.full');
        file.records = [
            { t: 'block', id: 1, kind: 'pass', p: 1 },
            { t: 'step', seq: 0 },
            { t: 'block', id: 2, kind: 'pass', p: 2 },
            { t: 'block', id: 3, kind: 'pass', p: 1, parent: 1 }
        ];
        expect(render(file)).toBe('Step 0\n1. Player 1 passes.\n   a. (after the last step) Player 1 passes.\nAfter the last step\n1. Player 2 passes.\n');
    });
});
