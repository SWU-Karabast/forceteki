# syntax=docker/dockerfile:1

# Node version for every stage. Pinned deliberately: `node:lts` floats to whichever line is Active LTS,
# so it silently changes major every October. The deps stage fails the build if this differs from
# .tool-versions, and `npm ci` enforces the `engines` range in package.json via engine-strict in .npmrc.
ARG NODE_VERSION=26.12.1

# ---- Build-side base -------------------------------------------------------------------------------
# These stages only produce platform-independent output (compiled JS), so they run on the builder's own
# platform. A deploy from an ARM machine then doesn't run npm and tsc under emulation.
FROM --platform=$BUILDPLATFORM node:${NODE_VERSION}-slim AS build-base
WORKDIR /app

# ---- All dependencies (dev included), for compiling ------------------------------------------------
FROM build-base AS deps
COPY .tool-versions ./
RUN want="v$(sed -n 's/^nodejs[[:space:]]*//p' .tool-versions | tr -d '[:space:]')"; \
    have="$(node --version)"; \
    if [ "$have" != "$want" ]; then \
        echo "Node mismatch: base image is $have but .tool-versions pins $want. Update NODE_VERSION in the Dockerfile." >&2; \
        exit 1; \
    fi
COPY package.json package-lock.json .npmrc ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci --ignore-scripts --no-audit --no-fund

# ---- Compile the server and check the card data ---------------------------------------------------
FROM deps AS build
COPY tsconfig.json card-data-version.txt ./
COPY scripts ./scripts
COPY server ./server
RUN npm run build && rm -f build/server/tsconfig.tsbuildinfo

# Card data is the deployer's local `npm run get-cards` output. If it was produced by a different
# fetchdata.js / mockdata.js / card-data-version.txt, fail here instead of crash-looping in ECS.
COPY test/json ./data
RUN want="$(cat build/server/card-data-hash.txt)"; \
    have="$(cat data/card-data-hash.txt 2>/dev/null || echo missing)"; \
    if [ "$have" != "$want" ]; then \
        echo "Card data in test/json is stale (hash '$have', build expects '$want'). Run 'npm run get-cards' and rebuild." >&2; \
        exit 1; \
    fi

# ---- Production dependencies only, for the target platform ----------------------------------------
FROM node:${NODE_VERSION}-slim AS prod-deps
WORKDIR /app
COPY package.json package-lock.json .npmrc ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci --omit=dev --ignore-scripts --no-audit --no-fund

# ---- Runtime --------------------------------------------------------------------------------------
FROM node:${NODE_VERSION}-slim AS runtime
WORKDIR /app

ENV ENVIRONMENT="production"
ENV GAME_NODE_HOST="localhost"
ENV GAME_NODE_NAME="test1"
ENV GAME_NODE_SOCKET_IO_PORT="9500"

# package.json is kept for its "type": "commonjs", so Node doesn't have to guess the module format.
COPY package.json ./
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=build /app/build/server ./app/server
COPY --from=build /app/data ./data

# Files stay root-owned: the server can read its code and data but not modify them.
USER node

# ALB handles SSL/TLS termination
EXPOSE 9500
CMD ["node", "./app/server/gamenode"]
