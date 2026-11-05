// Builds the production server image and runs it on http://localhost:9500 against DynamoDB Local, so
// forceteki-client's `npm run dev` can be pointed at it. Stop it with Ctrl+C.

const { docker, buildImage, startLocalDynamoDb, serverRunOptions } = require('./common');

const containerName = 'karabast-server-local';

try {
    buildImage();
    startLocalDynamoDb();

    // clear out a container left behind by an earlier run that didn't shut down cleanly
    docker(['rm', '--force', containerName], { quiet: true, allowFailure: true });

    console.log('\nStarting the server on http://localhost:9500. Run `npm run dev` in forceteki-client and open http://localhost:3000.');
    console.log('Press Ctrl+C to stop.\n');

    // --init: node as PID 1 ignores Ctrl+C unless it registers a handler, so let tini forward it
    const { args, env } = serverRunOptions();
    docker(['run', '--rm', '--init', '--name', containerName, '--publish', '9500:9500', ...args], { env, allowFailure: true });
} catch (error) {
    console.error(error.message);
    process.exit(1);
}
