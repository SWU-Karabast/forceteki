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

// Copy the `helpers` directory from `test` to the `build` folder
const srcDir = path.resolve(__dirname, '../test/helpers');
const destDir = path.resolve(__dirname, '../build/test/helpers');

function copyDirectory(src, dest) {
    if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
    }

    const entries = fs.readdirSync(src, { withFileTypes: true });

    for (const entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);

        if (entry.isDirectory()) {
            copyDirectory(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    }
}

// Copy only the `helpers` directory
copyDirectory(srcDir, destDir);

console.log('Build-dev process completed.');