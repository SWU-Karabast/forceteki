const fs = require('fs/promises');
const childProcess = require('child_process');

const envPath = '.env';

function createEnvFile() {
    const defaultEnvFields = {
        GAME_NODE_HOST: 'localhost',
        GAME_NODE_NAME: 'test1',
        GAME_NODE_SOCKET_IO_PORT: '9500',
        ENVIRONMENT: 'development',
        NEXTAUTH_SECRET: 'verysecret',
        // set this to "true" to force the local client to pull card data jsons from AWS instead of local folder
        FORCE_REMOTE_CARD_DATA: 'false',
        // set this to "true" to force the local dev server to use action timers in public games
        USE_LOCAL_ACTION_TIMER: 'false',
        // set this to "true" to enable the use of local DynamoDB for account testing
        USE_LOCAL_DYNAMODB: 'false',
        DISCORD_BUG_REPORT_WEBHOOK_URL: '',
        DISCORD_ERROR_REPORT_WEBHOOK_URL: '',
        SWUStatsAPIKey: ''
    };
    return fs.writeFile(
        envPath,
        Object.entries(defaultEnvFields)
            .map(([key, value]) => `${key}="${value}"`)
            .join('\n')
    );
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