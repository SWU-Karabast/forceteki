const { execSync } = require('child_process');
const fs = require('fs');
const { computeCardDataHash } = require('./cardDataHash');

function runCommand(command) {
    console.log('----------------------');
    console.log('RUNNING: ' + command);
    execSync(command, { stdio: 'inherit' });
}

const isFast = process.argv.length > 2 && process.argv[2] === '--fast-build';
let buildAll = !isFast;

if (!fs.existsSync('./build/server')) {
    fs.mkdirSync('./build/server', { recursive: true });
    buildAll = true;
}

// Unconditional and run exactly once per invocation, before the isFast branch below - not folded into
// the `!fs.existsSync('./build/server')` guard above, which only fires on the first build in a fresh
// tree. Without this placement, a repeat `npm run test-fast` in a tree that already has `build/server`
// would skip generation entirely and let tsc compile a stale or missing artifact silently.
runCommand('node scripts/generate-state-serializers.js');

if (!buildAll && !fs.existsSync('./build/test/json')) {
    fs.mkdirSync('./build/test/json', { recursive: true });
    runCommand('cpy ./test/json/ ./build/');
}

if (!buildAll) {
    runCommand('tsc -p ./test/tsconfig.json');
} else {
    /*
    // Backup if concurrently breaks anything.
    runCommand('tsc -p tsconfig.testserver.json && tsc -p tsconfig.test.json && cpy ./test/json/ ./build/');
    */
    runCommand('concurrently "tsc" "tsc -p ./test/tsconfig.json" "cpy ./test/json/ ./build/"');
}

fs.writeFileSync('./build/server/card-data-hash.txt', computeCardDataHash());