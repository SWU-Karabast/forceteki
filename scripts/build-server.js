const { execSync } = require('child_process');
const fs = require('fs');

function runCommand(command) {
    console.log('----------------------');
    console.log('RUNNING: ' + command);
    execSync(command, { stdio: 'inherit' });
}

fs.mkdirSync('./build/server', { recursive: true });

runCommand('tsc');
runCommand('cpy ./card-data-version.txt ./build/server/');
