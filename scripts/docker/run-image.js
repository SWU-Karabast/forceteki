// Builds the production server image and runs it on http://localhost:9500, using DynamoDB Local and
// placeholder secrets, for trying the production build with a local forceteki-client (its `npm run dev`
// targets that port by default). Server logs stream to the terminal; stop it with Ctrl+C.
//
// Usage: npm run docker-run. See DOCKER.md for what differs from the deployed server.

const { docker, buildImage, startLocalDynamoDb, serverRunOptions } = require('./common');

const containerName = 'karabast-server-local';

try {
    buildImage();
    startLocalDynamoDb();

    // clear out a container left behind by an earlier run that didn't shut down cleanly
    docker(['rm', '--force', containerName], { quiet: true, allowFailure: true });

    console.log('\nStarting the server on http://localhost:9500. Run `npm run dev` in forceteki-client and open http://localhost:3000.');
    console.log('Press Ctrl+C to stop.\n');

    // --init puts a small init process in front of node. Without it, node runs as PID 1, which ignores
    // Ctrl+C because the server doesn't handle SIGINT itself.
    const { args, env } = serverRunOptions();
    docker(['run', '--rm', '--init', '--name', containerName, '--publish', '9500:9500', ...args], { env, allowFailure: true });
} catch (error) {
    console.error(error.message);
    process.exit(1);
}
