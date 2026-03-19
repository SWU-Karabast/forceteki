const { execSync } = require('child_process');
const fs = require('fs');

function runCommand(command) {
    console.log('----------------------');
    console.log('RUNNING: ' + command);
    execSync(command, { stdio: 'inherit' });
}

fs.mkdirSync('./build/server', { recursive: true });

runCommand('ts-node ./scripts/generate-state-serializers.ts');

// Run TypeScript compilation
runCommand('concurrently "tsc" "tsc -p ./test/tsconfig.json" "cpy ./test/json/ ./build/"');

runCommand('cpy ./test/json/ ./build/');
runCommand('cpy ./card-data-version.txt ./build/server/');

console.log('Build-dev process completed.');