// Helpers shared by the docker-* npm scripts: building the production server image, starting DynamoDB
// Local with the server's table, and the environment the server container runs with locally. See
// DOCKER.md for how the image is built and tested.

const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

const repoRoot = path.join(__dirname, '../..');

const imageTag = 'karabast-server:local';

// The platform the deployed image is built for. Must match `platform` on the DockerImageAsset in
// forceteki-infra's lib/karabast-main-stack.ts and lib/karabast-dev-stack.ts, so local builds and tests
// use the same architecture as production.
const imagePlatform = 'linux/amd64';

// `container_name` of the dynamodb-local service in docker-compose.yml
const dynamoDbContainer = 'karabast-dynamodb-local';

/**
 * Runs a docker command with its output passed through.
 * Throws if it fails, unless `allowFailure` is set. Returns stdout when `capture` is set.
 */
function docker(args, { capture = false, allowFailure = false, quiet = false, env = process.env } = {}) {
    if (!quiet) {
        console.log(`> docker ${args.join(' ')}`);
    }

    const result = spawnSync('docker', args, {
        cwd: repoRoot,
        env,
        encoding: 'utf8',
        stdio: capture || quiet ? ['ignore', 'pipe', 'pipe'] : 'inherit',
    });

    if (result.error) {
        throw new Error(`Could not run docker (${result.error.message}). Is Docker installed and on the PATH?`);
    }
    if (result.status !== 0 && !allowFailure) {
        const stderr = capture || quiet ? `\n${result.stderr.trim()}` : '';
        throw new Error(`docker ${args[0]} failed with exit code ${result.status}${stderr}`);
    }

    return capture ? result.stdout.trim() : undefined;
}

function buildImage(extraArgs = []) {
    docker(['build', '--platform', imagePlatform, '-t', imageTag, ...extraArgs, '.']);
}

/**
 * Starts DynamoDB Local from docker-compose.yml and makes sure the server's table exists in it.
 * The server only creates its table in development mode, which always connects to localhost:8000.
 * So this runs the image once in development mode on DynamoDB Local's own network, where
 * localhost:8000 is DynamoDB Local.
 */
function startLocalDynamoDb() {
    docker(['compose', 'up', '--detach', '--wait', 'dynamodb-local']);

    const createTable = [
        'require(\'./app/server/services/DynamoDBService\').getDynamoDbServiceAsync()',
        '.then(() => process.exit(0), (err) => { console.error(err); process.exit(1); })',
    ].join('');

    console.log('Making sure the DynamoDB Local table exists');
    docker([
        'run', '--rm',
        '--network', `container:${dynamoDbContainer}`,
        '-e', 'ENVIRONMENT=development',
        '-e', 'USE_LOCAL_DYNAMODB=true',
        imageTag,
        'node', '-e', createTable,
    ], { quiet: true });
}

/**
 * Environment variables for the server container. It runs in production mode like the deployed server,
 * but against DynamoDB Local and with placeholder values for every external service, so local runs
 * never touch real data or services.
 */
function buildServerEnv() {
    // NEXTAUTH_SECRET and INTRASERVICE_SECRET have to match forceteki-client's .env.local for signed-in
    // requests to work, so reuse the values `npm run dev` uses from this repo's .env when there is one.
    const envPath = path.join(repoRoot, '.env');
    const localEnv = fs.existsSync(envPath) ? dotenv.parse(fs.readFileSync(envPath)) : {};

    return {
        NODE_ENV: 'production',

        // The AWS SDK reads this endpoint override, so production mode talks to DynamoDB Local instead
        // of the real table. DynamoDB Local accepts any credentials; real AWS would reject these.
        AWS_ENDPOINT_URL_DYNAMODB: `http://${dynamoDbContainer}:8000`,
        AWS_REGION: 'us-east-1',
        AWS_ACCESS_KEY_ID: 'local',
        AWS_SECRET_ACCESS_KEY: 'local',

        NEXTAUTH_SECRET: localEnv.NEXTAUTH_SECRET || 'local-docker-test',
        INTRASERVICE_SECRET: localEnv.INTRASERVICE_SECRET || 'local-docker-test',

        // Production mode refuses to start without these. Placeholders keep local errors out of Discord
        // and away from the stats sites.
        DISCORD_BUG_REPORT_WEBHOOK_URL: 'http://localhost/disabled',
        DISCORD_ERROR_REPORT_WEBHOOK_URL: 'http://localhost/disabled',
        DISCORD_PLAYER_REPORT_WEBHOOK_URL: 'http://localhost/disabled',
        PROFILE_CAPTURE_SECRET: 'local',
        SWUSTATS_API_KEY: 'local',
        SWUSTATS_CLIENT_ID: 'local',
        SWUSTATS_CLIENT_SECRET: 'local',
        SWUBASE_CLIENT_ID: 'local',
        SWUBASE_CLIENT_SECRET: 'local',
    };
}

/**
 * `docker run` arguments for starting the server container, used by prod-test-image.js and
 * run-image.js: the DynamoDB Local network and the server environment. Values are passed through the
 * docker CLI's own environment (`-e NAME`) so secrets read from .env don't appear on the command line.
 */
function serverRunOptions() {
    const network = docker(
        ['inspect', '--format', '{{range $name, $_ := .NetworkSettings.Networks}}{{println $name}}{{end}}', dynamoDbContainer],
        { capture: true, quiet: true }
    ).split('\n')[0];

    const serverEnv = buildServerEnv();
    return {
        args: ['--network', network, ...Object.keys(serverEnv).flatMap((name) => ['-e', name]), imageTag],
        env: { ...process.env, ...serverEnv },
    };
}

module.exports = {
    repoRoot,
    imageTag,
    docker,
    buildImage,
    startLocalDynamoDb,
    serverRunOptions,
};
