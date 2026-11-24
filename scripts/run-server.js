const fs = require('fs/promises');
const childProcess = require('child_process');

const envPath = '.env';

function createEnvFile() {
    return fs.copyFile('.env.example', envPath);
}

async function fileExists(path) {
    try {
        await fs.stat(path);
        return true;
    } catch (error) {
        return false;
    }
}

async function runCommand() {
    const envFileExists = await fileExists(envPath);

    if (!envFileExists) {
        console.log('Creating .env file.');
        await createEnvFile();
    }

    console.log('Building the server.');
    childProcess.execSync('npm run build-dev');

    const serverProcess = childProcess.spawn('node', ['./build/server/gamenode']);

    // pipe the server output to the current shell
    // so the dev can see it.
    serverProcess.stdout.pipe(process.stdout);
    serverProcess.stderr.pipe(process.stdout);

    // Disconnect the pipe on exit
    serverProcess.on('exit', () => {
        serverProcess.stdout.unpipe(process.stdout);
    });
}

runCommand();