import * as fs from 'fs';
import * as path from 'path';

describe('swupgn module isolation', function () {
    it('contains no imports from the engine (server/game)', function () {
        // At runtime, __dirname is build/test/server/swupgn/ (4 levels below repo root).
        // path.resolve(__dirname, '../../../../swupgn/src') reaches the actual source tree.
        const srcDir = path.resolve(__dirname, '../../../../swupgn/src');
        const offenders: string[] = [];
        for (const file of fs.readdirSync(srcDir)) {
            if (!file.endsWith('.ts')) {
                continue;
            }
            const text = fs.readFileSync(path.join(srcDir, file), 'utf8');
            if (/from ['"].*server\/game/.test(text)) {
                offenders.push(file);
            }
        }
        expect(offenders).toEqual([]);
    });
});
