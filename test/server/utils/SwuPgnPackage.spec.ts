import { execFileSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

// The @swupgn/format workspace is not used by forceteki code yet. This spec guards the hand-off: that the
// package resolves by name from this repo, and that the published tarball carries everything an integrator needs.
describe('@swupgn/format package', function () {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const format = require('@swupgn/format');
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const writer = require('@swupgn/format/writer');
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const validator = require('@swupgn/format/validate');

    const packageDir = path.dirname(require.resolve('@swupgn/format/package.json'));

    it('forceteki resolves @swupgn/format by package name', function () {
        expect(typeof format.parse).toBe('function');
        expect(typeof format.serialize).toBe('function');
        expect(typeof format.apply).toBe('function');
        expect(typeof writer.diff).toBe('function');
        expect(typeof writer.redact).toBe('function');
        expect(typeof validator.validate).toBe('function');

        const text = fs.readFileSync(path.join(packageDir, 'vectors', 'tiny.full.swupgn'), 'utf8');
        expect(format.serialize(format.parse(text))).toBe(text);
        expect(validator.validate(text).level).toBe('valid');
    });

    it('npm pack contains the hand-off files', function () {
        const out = execFileSync('npm', ['pack', '--dry-run', '--json', '-w', '@swupgn/format'], {
            cwd: path.resolve(packageDir, '..'),
            encoding: 'utf8',
            stdio: ['ignore', 'pipe', 'ignore']
        });
        const files: string[] = JSON.parse(out)[0].files.map((f: { path: string }) => f.path);

        const expected = [
            'SPEC.md',
            'README.md',
            'CHANGELOG.md',
            'LICENSE',
            'package.json',
            'schema/swupgn.schema.json',
            'dist/esm/index.js',
            'dist/cjs/index.js',
            'dist/esm/writer.js',
            'dist/esm/validate.js'
        ];
        for (const dir of ['registry', 'vectors']) {
            for (const entry of fs.readdirSync(path.join(packageDir, dir), { withFileTypes: true })) {
                if (entry.isFile()) {
                    expected.push(`${dir}/${entry.name}`);
                }
            }
        }
        for (const name of fs.readdirSync(path.join(packageDir, 'vectors', 'negative'))) {
            expected.push(`vectors/negative/${name}`);
        }

        expect(files.filter((f) => !expected.includes(f) && !f.startsWith('dist/'))).toEqual([]);
        expect(expected.filter((f) => !files.includes(f))).toEqual([]);
        expect(files.some((f) => f.startsWith('test/') || f.startsWith('build-test/'))).toBeFalse();
    });
});
