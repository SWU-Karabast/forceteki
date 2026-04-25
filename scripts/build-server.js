const { execSync } = require('child_process');
const fs = require('fs');
const { computeCardDataHash } = require('./cardDataHash');

function runCommand(command) {
    console.log('----------------------');
    console.log('RUNNING: ' + command);
    execSync(command, { stdio: 'inherit' });
}

fs.mkdirSync('./build/server', { recursive: true });

runCommand('tsc');
fs.writeFileSync('./build/server/card-data-hash.txt', computeCardDataHash());
