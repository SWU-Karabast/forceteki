import { GameServer } from '../../../server/gamenode/GameServer';
import type { IGameNodeConfig } from '../../../server/gamenode/GameNodeConfig';
import type { Lobby } from '../../../server/gamenode/Lobby';
import type { DeckValidator } from '../../../server/utils/deck/DeckValidator';
import { TestScheduler } from './TestScheduler';
import { FakeDynamoDbService } from './FakeDynamoDbService';
import { FakeHttpClient } from './FakeHttpClient';
import type { ITestDbServices } from './TestDatabase';
import { createTestDbServicesAsync } from './TestDatabase';

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

/** Seeds a fresh {@link FakeDynamoDbService} before the server that will use it starts. */
export type DatabaseSeeder = (db: FakeDynamoDbService) => void;

/** What {@link TestGameServer.startAsync} can be asked for beyond the default local-dev-like server. */
export interface ITestGameServerOptions {
    config?: TestConfigOverrides;

    /**
     * Gives the server the DynamoDB-backed services a deployed one has - server roles, settings,
     * cosmetics and mod actions, and a user store - over a {@link FakeDynamoDbService}. Without this the
     * server has no database, the state a local dev box runs in.
     *
     * - `true`: a fresh, empty fake.
     * - a function: a fresh fake, which the function seeds before the server starts. This is the way
     *   to have roles, settings or mod actions in place from the start, since the services read them
     *   once at startup and then only on their refresh interval. It runs for every harness, so a block
     *   of specs never shares a database.
     * - an instance: that fake, for a spec that builds one harness and needs to hold the fake itself.
     *   Do not share one across specs.
     */
    database?: boolean | DatabaseSeeder | FakeDynamoDbService;
}

/**
 * Defaults to the restrictive, deployed-environment behaviour rather than the permissive local-dev
 * behaviour, so specs exercise the rules that actually run in production - in particular the
 * anonymous-user restrictions, which local dev switches off entirely. Individual specs opt into the
 * permissive side explicitly when that is what they mean to test.
 */
export function buildTestConfig(overrides: TestConfigOverrides = {}): IGameNodeConfig {
    return {
        allowAnonymousSpectators: false,
        allowAnonymousBestOfThree: false,
        allowAnonymousChat: false,
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
 * the local test fixtures, the DynamoDB-backed services are left undefined unless the spec asks for a
 * database (the same state a local dev box runs in, so no AWS credentials are needed), the configured
 * port is never bound, and all timers run on a {@link TestScheduler} the spec drives by hand.
 */
export class TestGameServer extends GameServer {
    private constructor(
        setup: ITestGameServerSetup,
        private readonly clock: TestScheduler,
        config: IGameNodeConfig,
        httpClient: FakeHttpClient,
        private readonly dbServices?: ITestDbServices,
        private readonly fakeDatabase?: FakeDynamoDbService
    ) {
        super(
            setup.testGameBuilder.cardDataGetter,
            setup.deckValidator,
            dbServices?.serverRoleUsersCache,
            dbServices?.serverSettingsCache,
            dbServices?.cosmeticsService,
            dbServices?.modActionService,
            setup.testGameBuilder,
            { listen: false, scheduler: clock, config, httpClient }
        );
    }

    /**
     * The virtual clock driving every timer in this server and its lobbies. Specs advance it to
     * exercise disconnect grace periods, countdowns, heartbeats and cleanup passes.
     */
    public get testScheduler(): TestScheduler {
        return this.clock;
    }

    /** The behavioural switches this server was built with. */
    public get testConfig(): IGameNodeConfig {
        return this.config;
    }

    /**
     * The fake network boundary standing in for outbound calls to SWUStats / SWUBase. Specs assert
     * on {@link FakeHttpClient.requests} and configure canned responses via
     * {@link FakeHttpClient.setResponse}.
     */
    public get testHttpClient(): FakeHttpClient {
        return this.httpClient as FakeHttpClient;
    }

    /** The fake DynamoDB behind this server, or `undefined` if it was built without a database. */
    public get testDatabase(): FakeDynamoDbService | undefined {
        return this.fakeDatabase;
    }

    /**
     * The lobbies the server currently holds, by id. For checking what the API and sockets built:
     * lobbies are created and removed through the API, not by writing to this.
     */
    public get testLobbies(): ReadonlyMap<string, Lobby> {
        return this.lobbies;
    }

    public get lobbyCount(): number {
        return this.lobbies.size;
    }

    /** The lobby this user is in, or `undefined` if they are in none. */
    public testLobbyFor(userId: string): Lobby | undefined {
        const lobbyId = this.getUserLobbyId(userId);

        return lobbyId === undefined ? undefined : this.lobbies.get(lobbyId);
    }

    /** Stops the database-backed services' refresh timers along with everything the server stops itself. */
    public override async shutdownAsync(): Promise<void> {
        try {
            await super.shutdownAsync();
        } finally {
            this.dbServices?.stop();
        }
    }

    /**
     * Builds a test server and binds it to a loopback port.
     *
     * Named `startAsync` rather than `createAsync` because the base class already has a static
     * `createAsync` for the production construction path, and statics are inherited.
     */
    public static async startAsync(setup: ITestGameServerSetup, options: ITestGameServerOptions = {}): Promise<TestGameServer> {
        const clock = new TestScheduler();

        let fakeDatabase: FakeDynamoDbService | undefined;
        let dbServices: ITestDbServices | undefined;
        if (options.database) {
            fakeDatabase = TestGameServer.resolveDatabase(options.database, clock);

            // before the server exists: see routeDatabaseThrough
            dbServices = await createTestDbServicesAsync(fakeDatabase, clock);
        }

        const server = new TestGameServer(setup, clock, buildTestConfig(options.config), new FakeHttpClient(), dbServices, fakeDatabase);
        await server.listenOnEphemeralPortAsync();
        return server;
    }

    private static resolveDatabase(option: true | DatabaseSeeder | FakeDynamoDbService, clock: TestScheduler): FakeDynamoDbService {
        if (option instanceof FakeDynamoDbService) {
            return option;
        }

        // timestamps the fake records (logins, cancellations) are on the spec's virtual clock
        const database = new FakeDynamoDbService(() => clock.currentDate());
        if (typeof option === 'function') {
            option(database);
        }

        return database;
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
