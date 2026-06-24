import * as fs from 'fs';
import * as path from 'path';

// NOTE: This spec deliberately scans TypeScript SOURCE files (not compiled build
// output) so the regex matches `from '…'` import syntax directly. The path
// '../../../../swupgn/src' is correct because the compiled spec runs from
// build/test/server/swupgn/ (4 levels below repo root).

function walk(dir: string): string[] {
    const out: string[] = [];
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) { out.push(...walk(full)); }
        else if (entry.name.endsWith('.ts')) { out.push(full); }
    }
    return out;
}

describe('swupgn module isolation', function () {
    it('contains no imports from the engine (server/game)', function () {
        // At runtime, __dirname is build/test/server/swupgn/ (4 levels below repo root).
        // path.resolve(__dirname, '../../../../swupgn/src') reaches the actual source tree.
        const srcDir = path.resolve(__dirname, '../../../../swupgn/src');
        const offenders: string[] = [];
        for (const file of walk(srcDir)) {
            const text = fs.readFileSync(file, 'utf8');
            if (/from ['"].*server\/game/.test(text)) {
                offenders.push(file);
            }
        }
        expect(offenders).toEqual([]);
    });
});
