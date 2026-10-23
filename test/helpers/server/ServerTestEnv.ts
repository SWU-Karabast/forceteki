import { jsonOnlyLogger, logger } from '../../../server/logger';

/**
 * Populates the environment variables that `server/env.ts` validates at import time.
 *
 * `server/env.ts` parses `process.env` with zod as a side effect of being required, and throws when
 * `ENVIRONMENT`, `GAME_NODE_HOST`, `GAME_NODE_NAME` or `GAME_NODE_SOCKET_IO_PORT` are absent. The
 * `.env` file that supplies those during local development is gitignored, so CI has none and any
 * spec that transitively requires `GameServer` or `server/socket.js` would fail on import.
 *
 * This module must therefore run before any server module is loaded, which is why it is listed
 * ahead of the helpers glob in `jasmine.json` rather than relying on glob ordering.
 *
 * Values are assigned unconditionally so that a developer's local `.env` cannot make a spec behave
 * differently than it does in CI. `dotenv` does not overwrite variables that are already set, so
 * these win when `server/env.ts` is subsequently imported.
 */

/**
 * Secret used to sign JWTs in tests. Server-side auth verifies against `process.env.NEXTAUTH_SECRET`,
 * so tokens minted by test helpers must be signed with this exact value.
 */
export const testNextAuthSecret = 'forceteki-server-test-secret';

/**
 * Shared secret the FE server presents to `link-swustats` / `link-swubase` (`internalApiKey` in the body).
 * Pinned like everything else below: a developer's `.env` sets it on some machines and CI has no `.env`,
 * so the routes that check it used to answer differently depending on where a spec ran.
 */
export const testIntraserviceSecret = 'forceteki-test-intraservice-secret';

/**
 * Key a caller presents to `run-profile` as `Authorization: api-key <key>`. `server/env.ts` reads it once,
 * at import, so unlike the variables above it cannot be changed per spec - only pinned.
 */
export const testProfileCaptureSecret = 'forceteki-test-profile-capture-secret';

const testEnvVars: Record<string, string> = {
    // `development` keeps `getDynamoDbServiceAsync()` returning null, which is what makes the server
    // constructible without AWS credentials. Behavioural switches that would otherwise be read off
    // this flag are injected as config instead, so specs do not depend on its value.
    ENVIRONMENT: 'development',
    GAME_NODE_HOST: 'localhost',
    GAME_NODE_NAME: 'server-test',

    // Server tests drive the express app in-process and never bind this port, but `env.ts` requires
    // it to parse as an integer.
    GAME_NODE_SOCKET_IO_PORT: '0',

    NEXTAUTH_SECRET: testNextAuthSecret,
    INTRASERVICE_SECRET: testIntraserviceSecret,
    PROFILE_CAPTURE_SECRET: testProfileCaptureSecret,
    USE_LOCAL_DYNAMODB: 'false',
    FORCE_ENABLE_STATS_LOGGING: 'false',

    // Dummy values so `SwuStatsHandler`/`SwuBaseHandler` construct with non-empty credentials, the
    // same as they would in production. No request driven by these ever reaches the real network -
    // `GameServer`'s injected `IHttpClient` is a fake in every test - so these values are never
    // validated against anything, only echoed into outgoing payloads a test may assert on.
    SWUSTATS_API_KEY: 'test-swustats-api-key',
    SWUSTATS_CLIENT_ID: 'test-swustats-client-id',
    SWUSTATS_CLIENT_SECRET: 'test-swustats-client-secret',
    SWUBASE_CLIENT_ID: 'test-swubase-client-id',
    SWUBASE_CLIENT_SECRET: 'test-swubase-client-secret',
};

for (const [key, value] of Object.entries(testEnvVars)) {
    process.env[key] = value;
}

/**
 * Sets `process.env` entries (`undefined` deletes one) and returns a function that puts every one of
 * them back exactly as it was. For a spec that needs a different environment than the pinned one -
 * a production-like server, or a secret that is unset.
 *
 * `process.env` is process-global, but specs within one jasmine worker run serially and parallel
 * workers are separate processes, so this is safe as long as the returned function is always called.
 * `ServerTestHarness` does that on shutdown.
 *
 * Only values the server reads from `process.env` at the time it needs them can be changed this way.
 * Anything `server/env.ts` parses at import (such as `PROFILE_CAPTURE_SECRET`) is fixed for the
 * worker's lifetime.
 */
export function overrideEnv(overrides: Record<string, string | undefined>): () => void {
    const setOrDelete = (key: string, value: string | undefined): void => {
        if (value === undefined) {
            Reflect.deleteProperty(process.env, key);
        } else {
            process.env[key] = value;
        }
    };

    const previous = new Map<string, string | undefined>();
    for (const [key, value] of Object.entries(overrides)) {
        previous.set(key, process.env[key]);
        setOrDelete(key, value);
    }

    return () => {
        for (const [key, value] of previous) {
            setOrDelete(key, value);
        }
    };
}

// Keep application logs out of Jasmine output; specs can still spy on logger calls.
logger.silent = true;
jsonOnlyLogger.silent = true;
