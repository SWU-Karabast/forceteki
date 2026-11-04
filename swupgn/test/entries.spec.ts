import { spawnSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

const packageDir = path.resolve(__dirname, '..', '..');

function runNode(args: string[]) {
    return spawnSync(process.execPath, args, { cwd: packageDir, encoding: 'utf8' });
}

describe('@swupgn/format entries', function () {
    it('main entry loads no Node built-ins or ajv', function () {
        const script = `
            const Module = require('module');
            const requested = [];
            const original = Module._load;
            Module._load = function (request, ...rest) {
                requested.push(request);
                return original.call(this, request, ...rest);
            };
            require('./dist/cjs/index.js');
            console.log(JSON.stringify(requested));
        `;
        const result = runNode(['-e', script]);
        expect(result.status).toBe(0, result.stderr);

        const requested: string[] = JSON.parse(result.stdout);
        const forbidden = requested.filter((r) => r === 'fs' || r === 'path' || r === 'ajv' || r.startsWith('node:'));
        expect(forbidden).toEqual([]);
    });

    it('ESM entry imports', function () {
        const result = runNode(['--input-type=module', '-e', 'import(\'@swupgn/format\').then(m => console.log(m.VERSION))']);
        expect(result.status).toBe(0, result.stderr);
        expect(result.stdout.trim()).toBe('SWU-PGN/0.1');
    });

    it('CJS subpath entries resolve', function () {
        const script = 'require(\'@swupgn/format/writer\'); require(\'@swupgn/format/validate\');';
        const result = runNode(['-e', script]);
        expect(result.status).toBe(0, result.stderr);
    });

    it('the schema, registries and vectors resolve as package files', function () {
        const script = [
            'require.resolve(\'@swupgn/format/schema/swupgn.schema.json\');',
            'require.resolve(\'@swupgn/format/registry/attributes.json\');',
            'require.resolve(\'@swupgn/format/vectors/manifest.json\');',
            'require(\'@swupgn/format/vectors/manifest.json\');',
        ].join(' ');
        const result = runNode(['-e', script]);
        expect(result.status).toBe(0, result.stderr);
    });

    it('ships no source maps', function () {
        const maps: string[] = [];
        const walk = (dir: string): void => {
            for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
                const p = path.join(dir, entry.name);
                if (entry.isDirectory()) {
                    walk(p);
                } else if (entry.name.endsWith('.map')) {
                    maps.push(p);
                }
            }
        };
        walk(path.join(packageDir, 'dist'));
        expect(maps).toEqual([]);
    });
});
