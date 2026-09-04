import { parse, fold, render, validate } from '../../../swupgn/src/index';
import * as fs from 'fs';
import * as path from 'path';

const dir = path.resolve(__dirname, '../../../../swupgn/test-vectors');

describe('canonical vectors', function () {
    const names = fs.readdirSync(dir).filter((f) => f.endsWith('.swupgn')).map((f) => f.replace('.swupgn', ''));
    for (const name of names) {
        it(`${name}: validates`, function () {
            const text = fs.readFileSync(path.join(dir, `${name}.swupgn`), 'utf8');
            expect(validate(text).valid).toBe(true);
        });
        it(`${name}: folds to the expected state`, function () {
            const text = fs.readFileSync(path.join(dir, `${name}.swupgn`), 'utf8');
            const expected = JSON.parse(fs.readFileSync(path.join(dir, `${name}.fold.json`), 'utf8'));
            const got = fold(parse(text).events);
            expect(JSON.parse(JSON.stringify(got))).toEqual(expected);
        });
        // Rendered with NO injected resolver: the file's own %%% CARDS index supplies the
        // names, which is the point of the index — a .swupgn is self-describing.
        it(`${name}: renders to the expected story`, function () {
            const text = fs.readFileSync(path.join(dir, `${name}.swupgn`), 'utf8');
            const expected = fs.readFileSync(path.join(dir, `${name}.render.txt`), 'utf8').trim();
            expect(render(parse(text)).trim()).toBe(expected);
        });

        // The embedded %%% STORY must be exactly what the renderer produces, so the prose a
        // human reads can never drift from the events a machine folds.
        it(`${name}: embedded STORY matches the renderer`, function () {
            const doc = parse(fs.readFileSync(path.join(dir, `${name}.swupgn`), 'utf8'));
            expect((doc.story ?? []).join('\n').trim()).toBe(render(doc).trim());
        });
    }
});
