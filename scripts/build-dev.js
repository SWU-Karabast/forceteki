const { execSync } = require('child_process');
const fs = require('fs');

function runCommand(command) {
    console.log('----------------------');
    console.log('RUNNING: ' + command);
    execSync(command, { stdio: 'inherit' });
}

fs.mkdirSync('./build/server', { recursive: true });

// Run TypeScript compilation
runCommand('tsc');

runCommand('cpy ./test/json/ ./build/');
runCommand('cpy ./test/helpers/ ./build/');
runCommand('cpy ./card-data-version.txt ./build/server/');

console.log('Build-dev process completed.');