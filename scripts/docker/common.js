// Shared helpers for building and running the production server image locally.
// See "Production Docker Image" in the README.

const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

const repoRoot = path.join(__dirname, '../..');

const imageTag = 'karabast-server:local';

// Matches what forceteki-infra builds for ECS (Platform.LINUX_AMD64)
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
 * Production mode never creates the table, so this runs the image once in development mode inside
 * DynamoDB Local's network namespace, where the server's own `ensureLocalTableExistsAsync` reaches it
 * on localhost:8000.
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
 * Environment for the server container. It runs in production mode, as in ECS, but against
 * DynamoDB Local, with placeholder values for every external service.
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
 * `docker run` arguments shared by the prod test and the interactive run: the DynamoDB Local network
 * and the server environment. Values are passed through the docker CLI's own environment (`-e NAME`)
 * so secrets read from .env don't appear on the command line.
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
