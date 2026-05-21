const { execSync } = require('child_process');
const fs = require('fs');
const { computeCardDataHash } = require('./cardDataHash');

function runCommand(command) {
    console.log('----------------------');
    console.log('RUNNING: ' + command);
    execSync(command, { stdio: 'inherit' });
}

fs.mkdirSync('./build/server', { recursive: true });

// Run TypeScript compilation
runCommand('concurrently "tsc" "tsc -p ./test/tsconfig.json" "cpy ./test/json/ ./build/"');

runCommand('cpy ./test/json/ ./build/');
fs.writeFileSync('./build/server/card-data-hash.txt', computeCardDataHash());

console.log('Build-dev process completed.');