const { execSync } = require('child_process');
const fs = require('fs');
const rimraf = require('rimraf');

function runCommand(command) {
    console.log('----------------------');
    console.log('RUNNING: ' + command);
    execSync(command, { stdio: 'inherit' });
}

const isFast = process.argv.length > 2 && process.argv[2] === '--fast-build';
let buildAll = !isFast;

if (!isFast) {
    rimraf.sync('./build/');
}

if (!fs.existsSync('./build/server')) {
    fs.mkdirSync('./build/server', { recursive: true });
    buildAll = true;
}

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

runCommand('cpy ./card-data-version.txt ./build/server/');