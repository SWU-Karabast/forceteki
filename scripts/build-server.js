const { execSync } = require('child_process');
const fs = require('fs');
const rimraf = require('rimraf');

function runCommand(command) {
    console.log('----------------------');
    console.log('RUNNING: ' + command);
    execSync(command, { stdio: 'inherit' });
}

rimraf.sync('./build/');
fs.mkdirSync('./build/server', { recursive: true });

runCommand('tsc');
runCommand('cpy ./card-data-version.txt ./build/server/');
