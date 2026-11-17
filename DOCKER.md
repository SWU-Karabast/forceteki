# Production Docker Image

The deployed game server runs from the multi-stage `Dockerfile` in this folder. [forceteki-infra](https://github.com/SWU-Karabast/forceteki-infra) builds it during `cdk deploy`. Dependencies are installed and the server is compiled inside Docker, and only production `dependencies` go into the final image, so your local `node_modules/` and `build/` are never used.

## How the image is built

- One stage installs all dependencies and compiles the server with `npm run build`. A separate stage installs production dependencies only (`npm ci --omit=dev`).
- The final image is `node:<version>-slim` with the production `node_modules`, the compiled server (`/app/app/server`) and the card data (`/app/data`). It runs as the non-root `node` user.
- `.dockerignore` is an allowlist: only the files the Dockerfile copies are sent to Docker. Anything else, including this file, can't change the image.

Card data is the one local input. The build copies `test/json/` and fails if it is stale, so run `npm run get-cards` first if `card-data-version.txt`, `fetchdata.js` or `mockdata.js` changed since you last ran it.

## Making changes

**Dependencies.** Anything the server imports at runtime must be listed in `dependencies`, not `devDependencies`, or it will be missing from the image. The `import-x/no-extraneous-dependencies` lint rule enforces this for `server/`. The `prod-image` job in the pull request checks also builds the image and runs `npm run docker-prod-test`, so a broken Dockerfile or a server that can't start in production mode shows up on the PR rather than at deploy time.

**Node version.** Update `.tool-versions`, `engines` in `package.json` and `NODE_VERSION` at the top of the `Dockerfile` together. The image build fails if the Dockerfile disagrees with `.tool-versions`.

**Platform.** The image is built for `linux/amd64`, the platform the ECS tasks run on. It is set in two places that must agree: `platform` on the `DockerImageAsset` in forceteki-infra's stacks, and `imagePlatform` in `scripts/docker/common.js`.

## How CDK uses this

CDK doesn't run the scripts below. The `DockerImageAsset` in forceteki-infra's stacks runs its own `docker build` on this folder, with the same `Dockerfile` and `.dockerignore`, and pushes the result to ECR. So the local scripts and the deploy build the same image, as long as the platform setting above stays in sync.

## Testing the image locally

These need Docker Desktop running. Each one builds the image first (as `karabast-server:local`), which takes a few seconds when nothing has changed.

```bash
# build only; extra arguments go to `docker build`, e.g. `npm run docker-build -- --no-cache`
npm run docker-build

# check that the image runs as a non-root user, contains no dev-only packages, and starts up and
# answers /api/health
npm run docker-prod-test

# run the server on http://localhost:9500 for testing with the client; stop it with Ctrl+C
npm run docker-run
```

With `npm run docker-run` going, run `npm run dev` in forceteki-client (it targets `http://localhost:9500` by default) and open http://localhost:3000.

The container runs in production mode, as in ECS, so expect action timers in public games and no anonymous spectating or best-of-three. It uses DynamoDB Local from `docker-compose.yml` instead of the real table, so signing in and playing are safe; the scripts start it and create the table. Other external services get placeholder values. `NEXTAUTH_SECRET` and `INTRASERVICE_SECRET` come from your `.env`, so signing in works when they match the client's `.env.local`. Lobby links the server hands out point at karabast.net, so join lobbies from the home page instead.
