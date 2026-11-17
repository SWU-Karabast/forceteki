// Builds the production server image locally as karabast-server:local. CDK doesn't run this script: the
// DockerImageAsset in forceteki-infra's stacks runs its own `docker build`. Both use this repo's Dockerfile
// and .dockerignore, which define the image, and both build for the same platform (see common.js).
// Extra arguments are passed to `docker build`, e.g. `npm run docker-build -- --no-cache`.

const { buildImage } = require('./common');

try {
    buildImage(process.argv.slice(2));
} catch (error) {
    console.error(error.message);
    process.exit(1);
}
