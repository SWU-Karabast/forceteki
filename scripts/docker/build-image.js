// Builds the production server image from this repo's Dockerfile and tags it karabast-server:local, for
// inspecting or running the image locally. Deploys build from the same Dockerfile, so the result matches
// what runs in production. See DOCKER.md for details.
//
// Usage: npm run docker-build [-- <extra docker build arguments>], e.g. npm run docker-build -- --no-cache

const { buildImage } = require('./common');

try {
    buildImage(process.argv.slice(2));
} catch (error) {
    console.error(error.message);
    process.exit(1);
}
