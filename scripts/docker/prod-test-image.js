// Builds the production server image and checks that it is safe to deploy: it runs as a non-root user,
// contains no dev-only packages, and starts up and answers /api/health against DynamoDB Local.

const path = require('path');
const { repoRoot, imageTag, docker, buildImage, startLocalDynamoDb, serverRunOptions } = require('./common');

const containerName = 'karabast-server-prod-test';
const startupTimeoutMs = 3 * 60 * 1000;

function checkRunsAsNonRoot() {
    const user = docker(['image', 'inspect', '--format', '{{.Config.User}}', imageTag], { capture: true, quiet: true });
    if (user !== 'node') {
        throw new Error(`Expected the image to run as 'node' but it runs as '${user || 'root'}'`);
    }
    console.log('OK: runs as the non-root \'node\' user');
}

function checkNoDevPackages() {
    // Top-level packages that the lockfile marks as needed only by devDependencies
    const lock = require(path.join(repoRoot, 'package-lock.json'));
    const devOnly = Object.entries(lock.packages)
        .filter(([packagePath, info]) => info.dev && (/^node_modules\/(@[^/]+\/)?[^/]+$/).test(packagePath))
        .map(([packagePath]) => packagePath.slice('node_modules/'.length));

    const listInstalled = [
        'const fs = require(\'fs\');',
        'const names = fs.readdirSync(\'node_modules\').filter((n) => !n.startsWith(\'.\'))',
        '.flatMap((n) => n.startsWith(\'@\') ? fs.readdirSync(\'node_modules/\' + n).map((s) => n + \'/\' + s) : [n]);',
        'console.log(JSON.stringify(names));',
    ].join(' ');
    const installed = new Set(JSON.parse(
        docker(['run', '--rm', imageTag, 'node', '-e', listInstalled], { capture: true, quiet: true })
    ));

    if (!installed.has('express')) {
        throw new Error('Could not read the image\'s node_modules (express is missing)');
    }

    const leaked = devOnly.filter((name) => installed.has(name));
    if (leaked.length > 0) {
        throw new Error(`Dev-only packages found in the image: ${leaked.join(', ')}`);
    }
    console.log(`OK: none of the ${devOnly.length} dev-only packages are in the image (${installed.size} packages installed)`);
}

function printImageSize() {
    const bytes = Number(docker(['image', 'inspect', '--format', '{{.Size}}', imageTag], { capture: true, quiet: true }));
    console.log(`Image size: ${(bytes / 1024 / 1024).toFixed(0)} MB`);
}

function isHealthy() {
    const checkHealth = 'fetch(\'http://localhost:9500/api/health\').then((r) => process.exit(r.ok ? 0 : 1), () => process.exit(1))';
    try {
        docker(['exec', containerName, 'node', '-e', checkHealth], { quiet: true });
        return true;
    } catch {
        return false;
    }
}

async function waitForHealthyAsync() {
    const deadline = Date.now() + startupTimeoutMs;
    while (Date.now() < deadline) {
        const running = docker(['inspect', '--format', '{{.State.Running}}', containerName], { capture: true, quiet: true });
        if (running !== 'true') {
            throw new Error('The server container exited during startup');
        }
        if (isHealthy()) {
            return;
        }
        await new Promise((resolve) => setTimeout(resolve, 2000));
    }
    throw new Error(`The server did not answer /api/health within ${startupTimeoutMs / 1000} seconds`);
}

async function mainAsync() {
    buildImage();

    checkRunsAsNonRoot();
    checkNoDevPackages();
    printImageSize();

    startLocalDynamoDb();

    docker(['rm', '--force', containerName], { quiet: true, allowFailure: true });
    const { args, env } = serverRunOptions();
    docker(['run', '--detach', '--name', containerName, ...args], { env, quiet: true });

    try {
        console.log('Waiting for the server to start');
        await waitForHealthyAsync();
        console.log('OK: the server started and /api/health answered');
    } catch (error) {
        console.log('\nLast server logs:');
        docker(['logs', '--tail', '40', containerName], { allowFailure: true, quiet: false });
        throw error;
    } finally {
        docker(['rm', '--force', containerName], { quiet: true, allowFailure: true });
    }

    console.log('\nProd test passed');
}

mainAsync().catch((error) => {
    console.error(`\nProd test failed: ${error.message}`);
    process.exit(1);
});
