// `npm run capture-states -- --check | --update [--fast-build]`
// Runs the capture specs in test/stateSnapshots/. --check (the default, and what CI runs) fails
// when the committed snapshots differ from what the engine sends; --update rewrites them.

const { execSync } = require('child_process');
const { rmSync } = require('fs');

const KnownFlags = ['--check', '--update', '--fast-build'];

const args = process.argv.slice(2);
const unknown = args.filter((arg) => !KnownFlags.includes(arg));
if (unknown.length > 0 || (args.includes('--check') && args.includes('--update'))) {
    console.error(`usage: npm run capture-states -- --check | --update [--fast-build]${unknown.length > 0 ? ` (unknown: ${unknown.join(' ')})` : ''}`);
    process.exit(1);
}

const mode = args.includes('--update') ? 'update' : 'check';
const fastBuild = args.includes('--fast-build') ? ' --fast-build' : '';

const run = (command, env = {}) => execSync(command, { stdio: 'inherit', env: { ...process.env, NODE_ENV: 'test', ...env } });

// A capture spec deleted or renamed in the source stays compiled in build/ and would still run, and
// the incremental build would not re-emit a compiled spec that went missing; so build them afresh
rmSync('build/test/stateSnapshots', { recursive: true, force: true });
rmSync('build/tsconfig.tsbuildinfo', { force: true });

try {
    run(`node scripts/build-test.js${fastBuild}`);
    // each capture runs once; undo-all-tests mode would run it twice
    run('node --enable-source-maps node_modules/jasmine/bin/jasmine --config=./jasmine-capture.json --random=false', { CAPTURE_STATES: mode, ENABLE_UNDO_ALL_TESTS: 'false' });
} catch {
    process.exit(1);
}
