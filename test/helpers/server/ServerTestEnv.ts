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

// Keep application logs out of Jasmine output; specs can still spy on logger calls.
logger.silent = true;
jsonOnlyLogger.silent = true;
