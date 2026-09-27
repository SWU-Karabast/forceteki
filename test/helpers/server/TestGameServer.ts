import { GameServer } from '../../../server/gamenode/GameServer';
import type { IGameNodeConfig } from '../../../server/gamenode/GameNodeConfig';
import type { DeckValidator } from '../../../server/utils/deck/DeckValidator';
import { TestScheduler } from './TestScheduler';

/**
 * Collaborators the harness supplies so the expensive card data and deck validator setup can be
 * built once and shared by every server a jasmine worker stands up.
 */
export interface ITestGameServerSetup {
    testGameBuilder: any;
    deckValidator: DeckValidator;
}

/**
 * Behaviour a spec wants that differs from the default deployed-environment profile.
 */
export type TestConfigOverrides = Partial<IGameNodeConfig>;

/**
 * Defaults to the restrictive, deployed-environment behaviour rather than the permissive local-dev
 * behaviour, so specs exercise the rules that actually run in production - in particular the
 * anonymous-user restrictions, which local dev switches off entirely. Individual specs opt into the
 * permissive side explicitly when that is what they mean to test.
 */
function buildTestConfig(overrides: TestConfigOverrides = {}): IGameNodeConfig {
    return {
        allowAnonymousSpectators: false,
        allowAnonymousBestOfThree: false,
        enforceRematchCooldown: true,

        // off by default so lobbies do not start timers a spec did not ask for
        actionTimersEnabled: false,

        clientBaseUrl: 'http://localhost:3000',
        metricsLoggingEnabled: false,
        ...overrides,
    };
}

/**
 * A {@link GameServer} wired for tests.
 *
 * Everything test-specific lives here rather than on the production class: the card data comes from
 * the local test fixtures, the DynamoDB-backed caches are all left undefined (the same state a local
 * dev box runs in, so no AWS credentials are needed), the configured port is never bound, and all
 * timers run on a {@link TestScheduler} the spec drives by hand.
 */
export class TestGameServer extends GameServer {
    private constructor(setup: ITestGameServerSetup, scheduler: TestScheduler, config: IGameNodeConfig) {
        super(
            setup.testGameBuilder.cardDataGetter,
            setup.deckValidator,
            undefined,
            undefined,
            undefined,
            undefined,
            setup.testGameBuilder,
            { listen: false, scheduler, config }
        );
    }

    /**
     * The virtual clock driving every timer in this server and its lobbies. Specs advance it to
     * exercise disconnect grace periods, countdowns, heartbeats and cleanup passes.
     */
    public get testScheduler(): TestScheduler {
        return this.scheduler as TestScheduler;
    }

    /** The behavioural switches this server was built with. */
    public get testConfig(): IGameNodeConfig {
        return this.config;
    }

    /**
     * Builds a test server and binds it to a loopback port.
     *
     * Named `startAsync` rather than `createAsync` because the base class already has a static
     * `createAsync` for the production construction path, and statics are inherited.
     */
    public static async startAsync(setup: ITestGameServerSetup, configOverrides?: TestConfigOverrides): Promise<TestGameServer> {
        const server = new TestGameServer(setup, new TestScheduler(), buildTestConfig(configOverrides));
        await server.listenOnEphemeralPortAsync();
        return server;
    }

    /**
     * Binds the inherited HTTP server to a loopback port owned solely by this instance. Because the
     * socket.io server is attached to that same HTTP server, this makes both the API and the socket
     * endpoint reachable.
     *
     * The port is claimed here rather than letting an HTTP client bind one on demand: under
     * jasmine's parallel runner the specs are `cluster` workers, where `listen` is deferred to the
     * primary over IPC, so the address is not readable synchronously afterwards. `exclusive` also
     * stops cluster from handing every worker a share of one port, which would let one worker's
     * request reach another worker's server.
     */
    private async listenOnEphemeralPortAsync(): Promise<void> {
        await new Promise<void>((resolve, reject) => {
            this.httpServer.once('error', reject);
            this.httpServer.listen({ port: 0, host: '127.0.0.1', exclusive: true }, () => {
                this.httpServer.removeListener('error', reject);
                resolve();
            });
        });
    }

    /** Base URL of this server's API, e.g. `http://127.0.0.1:53124`. */
    public get baseUrl(): string {
        const address = this.httpServer.address();

        if (address === null || typeof address === 'string') {
            throw new Error('TestGameServer: expected the server to be bound to a TCP port');
        }

        return `http://127.0.0.1:${address.port}`;
    }
}
