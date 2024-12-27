const { execSync } = require('child_process');
const fs = require('fs');
const rimraf = require('rimraf');
const path = require('path');

function runCommand(command) {
    console.log('----------------------');
    console.log('RUNNING: ' + command);
    execSync(command, { stdio: 'inherit' });
}

// Clean up the build directory
rimraf.sync('./build/');
fs.mkdirSync('./build/server', { recursive: true });

// Run TypeScript compilation
runCommand('tsc');

runCommand('cpy ./test/json/ ./build/');
runCommand('cpy ./test/helpers/ ./build/');
runCommand('cpy ./test/gameSetups/ ./build/');

console.log('Build-dev process completed.');