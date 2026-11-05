// Builds the production server image as karabast-server:local, the same way `cdk deploy` does.
// Extra arguments are passed to `docker build`, e.g. `npm run docker-build -- --no-cache`.

const { buildImage } = require('./common');

try {
    buildImage(process.argv.slice(2));
} catch (error) {
    console.error(error.message);
    process.exit(1);
}
