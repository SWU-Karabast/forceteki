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
                    if (!ownNames.some((n) => n.includes(c.name))) {
                        expect(text).withContext(`${v.name}.${profile} names ${c.name}`).not.toContain(c.name);
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
});
