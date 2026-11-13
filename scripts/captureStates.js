// `npm run capture-states -- --check | --update`
// Runs the capture specs in test/stateCaptures/. --check (the default, and what CI runs) fails
// when the committed captures differ from what the engine sends; --update rewrites them.

const { execSync } = require('child_process');
const { existsSync, readdirSync, rmSync, statSync } = require('fs');
const { join } = require('path');

const KnownFlags = ['--check', '--update'];

const args = process.argv.slice(2);
const unknown = args.filter((arg) => !KnownFlags.includes(arg));
if (unknown.length > 0 || (args.includes('--check') && args.includes('--update'))) {
    console.error(`usage: npm run capture-states -- --check | --update${unknown.length > 0 ? ` (unknown: ${unknown.join(' ')})` : ''}`);
    process.exit(1);
}

const mode = args.includes('--update') ? 'update' : 'check';

const run = (command, env = {}) => execSync(command, { stdio: 'inherit', env: { ...process.env, NODE_ENV: 'test', ...env } });

// A capture spec deleted or renamed in the source stays compiled in build/ and would still run, so
// remove compiled files whose source is gone
const pruneCompiledWithoutSource = (buildDir, sourceDir) => {
    if (!existsSync(buildDir)) {
        return;
    }
    for (const entry of readdirSync(buildDir)) {
        const built = join(buildDir, entry);
        if (statSync(built).isDirectory()) {
            pruneCompiledWithoutSource(built, join(sourceDir, entry));
            continue;
        }
        const stem = join(sourceDir, entry.replace(/\.js(\.map)?$/, ''));
        if (!existsSync(`${stem}.ts`) && !existsSync(`${stem}.js`)) {
            rmSync(built);
        }
    }
};

pruneCompiledWithoutSource('build/test/stateCaptures', 'test/stateCaptures');

try {
    run('node scripts/build-test.js');
    // each capture runs once; undo-all-tests mode would run it twice
    run('node --enable-source-maps node_modules/jasmine/bin/jasmine --config=./jasmine-capture.json --random=false', { CAPTURE_STATES: mode, ENABLE_UNDO_ALL_TESTS: 'false' });
} catch {
    process.exit(1);
}
