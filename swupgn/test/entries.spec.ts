import { spawnSync } from 'child_process';
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
});
