/**
 * Behavioural switches for the game node.
 *
 * These were previously read from `process.env.ENVIRONMENT` at each use site, which made them
 * invisible to callers and impossible to exercise: a test process has to run as `development` to
 * avoid needing AWS credentials, which silently put it on the permissive side of every one of these
 * branches - including the anonymous-user restrictions that most warrant testing.
 *
 * Gathering them here keeps a single description of how the node behaves, and lets a caller ask for
 * production behaviour without also asking for production infrastructure.
 */
export interface IGameNodeConfig {

    /** Whether anonymous (not logged in) users may connect as spectators. */
    allowAnonymousSpectators: boolean;

    /** Whether anonymous users may create, join or queue for a public best-of-three. */
    allowAnonymousBestOfThree: boolean;

    /** Whether the cooldown that stops two players immediately rematching is applied. */
    enforceRematchCooldown: boolean;

    /** Whether public and quick-match games use action timers. */
    actionTimersEnabled: boolean;

    /** Origin used to build the lobby and spectate links handed to clients. */
    clientBaseUrl: string;

    /** Whether periodic heap, CPU, event loop and GC sampling runs. */
    metricsLoggingEnabled: boolean;
}

/**
 * Builds the config from environment variables, reproducing the behaviour the game node had when
 * each of these was read inline. `development` is the permissive local-dev profile; anything else is
 * treated as a deployed environment.
 */
export function buildGameNodeConfigFromEnvironment(): IGameNodeConfig {
    const isDevelopment = process.env.ENVIRONMENT === 'development';

    return {
        allowAnonymousSpectators: isDevelopment,
        allowAnonymousBestOfThree: isDevelopment && process.env.FORCE_BLOCK_BO3_ANON_LOCAL !== 'true',
        enforceRematchCooldown: !isDevelopment,
        actionTimersEnabled: !isDevelopment || process.env.USE_LOCAL_ACTION_TIMER === 'true',
        clientBaseUrl: isDevelopment ? 'http://localhost:3000' : 'https://karabast.net',
        metricsLoggingEnabled: !isDevelopment || process.env.FORCE_ENABLE_STATS_LOGGING === 'true',
    };
}
