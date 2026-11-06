// `npm run capture-states -- --check | --update`
// Runs the capture specs in test/stateSnapshots/. --check (the default, and what CI runs) fails
// when the committed snapshots differ from what the engine sends; --update rewrites them.

const { execSync } = require('child_process');

const args = process.argv.slice(2);
const mode = args.includes('--update') ? 'update' : 'check';
const fastBuild = args.includes('--fast-build') ? ' --fast-build' : '';

const run = (command, env = {}) => execSync(command, { stdio: 'inherit', env: { ...process.env, NODE_ENV: 'test', ...env } });

try {
    run(`node scripts/build-test.js${fastBuild}`);
    run('node --enable-source-maps node_modules/jasmine/bin/jasmine --config=./jasmine-capture.json --random=false', { CAPTURE_STATES: mode });
} catch {
    process.exit(1);
}
