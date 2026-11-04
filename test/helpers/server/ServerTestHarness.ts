import path from 'path';
import request from 'supertest';
import type { Response as SupertestResponse } from 'supertest';
import { v4 as uuid } from 'uuid';

import { DeckValidator } from '../../../server/utils/deck/DeckValidator';
import type { IQueueFormatKey } from '../../../server/gamenode/QueueHandler';
import { Lobby } from '../../../server/gamenode/Lobby';
import { AnonymousUser } from '../../../server/utils/user/User';
import { DecklistFixtures } from './DecklistFixtures';
import type { FakeDynamoDbService, ISeededAccount } from './FakeDynamoDbService';
import { premierBestOfOne } from './MatchConfigs';
import type { IRegisteredRoute, IRouteRecording, RouteMethod } from './RouteRecorder';
import { recordRegisteredRoutes } from './RouteRecorder';
import { overrideEnv } from './ServerTestEnv';
import type { DatabaseSeeder, ITestGameServerSetup, TestConfigOverrides } from './TestGameServer';
import { TestGameServer } from './TestGameServer';
import type { TestScheduler } from './TestScheduler';
import type { FakeHttpClient } from './FakeHttpClient';
import type { ITestClientOptions } from './TestClient';
import { TestClient } from './TestClient';

/** What a spec can ask of {@link ServerTestHarness.createAsync}; every field is optional. */
export interface IServerTestOptions {

    /** Behavioural switches that differ from the deployed-environment defaults (see `buildTestConfig`). */
    config?: TestConfigOverrides;

    /**
     * Gives the server the database-backed services a deployed one has - roles, settings, cosmetics,
     * mod actions and a user store - over an in-memory fake, readable and seedable as
     * {@link ServerTestHarness.db}. Without it the server has no database, which is how a local dev
     * box runs: no role can be granted, no account can be looked up.
     *
     * `true` is an empty fake; a function seeds a fresh one before the server starts (the services
     * read roles, settings and mod actions once at startup, then only on their refresh interval); an
     * instance is used as is, for a spec that builds a single harness and holds the fake itself.
     */
    database?: boolean | DatabaseSeeder | FakeDynamoDbService;

    /**
     * `process.env` entries to set for the life of this harness (`undefined` deletes one), restored on
     * shutdown. For a production-like server (`ENVIRONMENT: 'production'`, which also needs a
     * {@link database}) or an unset secret. See {@link overrideEnv} for what can and cannot be changed
     * this way.
     */
    env?: Record<string, string | undefined>;

    /** Record every route the server registers, readable as {@link ServerTestHarness.routes}. */
    recordRoutes?: boolean;
}

/**
 * Identity a test client presents to the API. Mirrors the payload the real client builds in
 * `getUserPayload`, which is a bare `{ id, username }` object for anonymous users.
 */
export interface ITestUserPayload {
    id: string;
    username: string;
}

/**
 * The card data and deck validator are expensive to build (the validator reads every card), so they
 * are constructed once per jasmine worker and shared by every harness instance.
 */
let sharedSetup: ITestGameServerSetup | undefined;

async function getSharedSetupAsync(): Promise<ITestGameServerSetup> {
    if (!sharedSetup) {
        // GameStateBuilder is untyped CommonJS, so it is pulled in with require rather than import
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const GameStateBuilder = require(path.resolve(__dirname, '../GameStateBuilder.js'));
        const testGameBuilder = new GameStateBuilder();

        sharedSetup = {
            testGameBuilder,
            deckValidator: await DeckValidator.createAsync(testGameBuilder.cardDataGetter),
        };
    }

    return sharedSetup;
}

/**
 * Bundles the pieces a spec needs to drive a {@link TestGameServer}: an HTTP client pointed at it,
 * and decklist fixtures built from the same card data the server is using.
 *
 * Create one per spec via {@link ServerTestHarness.createAsync} and release it with
 * {@link shutdownAsync}, which leaves the process with no timers or sockets still open.
 */
export class ServerTestHarness {
    private lobbyNameCounter = 0;

    /** Guards against the double shutdown that happens when a spec tears down and `afterEach` follows. */
    private hasShutDown = false;

    private constructor(
        public readonly server: TestGameServer,
        public readonly decklists: DecklistFixtures,
        private readonly restoreEnv: () => void,
        private readonly routeRecording?: IRouteRecording
    ) {}

    public static async createAsync(options: IServerTestOptions = {}): Promise<ServerTestHarness> {
        // applied first, because the server reads some of it while it is constructed (which routes it
        // registers) and the rest while it serves requests
        const restoreEnv = overrideEnv(options.env ?? {});

        try {
            // Outside development the real database service is no longer skipped, so a server built
            // without a stand-in would try to reach DynamoDB (and fail on missing credentials) from its
            // field initialisers, as unhandled rejections nobody can attribute to the spec.
            if (process.env.ENVIRONMENT !== 'development' && !options.database) {
                throw new Error(`ServerTestHarness: ENVIRONMENT is '${process.env.ENVIRONMENT}', so the server would reach for the real DynamoDB service - give the harness a database to stand in for it`);
            }

            const setup = await getSharedSetupAsync();

            // routes are registered during construction, so recording has to start before it
            const routeRecording = options.recordRoutes ? recordRegisteredRoutes() : undefined;

            const server = await TestGameServer.startAsync(setup, { config: options.config, database: options.database });

            return new ServerTestHarness(
                server,
                new DecklistFixtures(setup.testGameBuilder.cardDataGetter, setup.deckValidator),
                restoreEnv,
                routeRecording
            );
        } catch (error) {
            restoreEnv();
            throw error;
        }
    }

    /** An HTTP client pointed at this harness's server. */
    public get api(): ReturnType<typeof request> {
        return request(this.server.baseUrl);
    }

    /**
     * The fake DynamoDB behind this harness's server: seed accounts, roles, settings and mod actions
     * before acting, and read back what the server stored. Only available when the harness was created
     * with `{ database: true }` (or an instance).
     */
    public get db(): FakeDynamoDbService {
        const db = this.server.testDatabase;
        if (!db) {
            throw new Error('ServerTestHarness: this harness has no database - create it with { database: true }');
        }

        return db;
    }

    /**
     * Every route the server registered. Only available when the harness was created with `{ recordRoutes: true }`.
     * Throws if the server registered a route in a form the recorder cannot see, rather than return a list
     * that looks complete and is not.
     */
    public get routes(): readonly IRegisteredRoute[] {
        if (!this.routeRecording) {
            throw new Error('ServerTestHarness: routes were not recorded - create the harness with { recordRoutes: true }');
        }

        this.routeRecording.assertComplete();

        return this.routeRecording.routes;
    }

    /**
     * The fake standing in for outbound calls the server makes to external stat sites (SWUStats,
     * SWUBase) - the opposite direction from {@link api}. Assert on
     * `statsHttpClient.requests`/`requestsTo(...)` to check what was sent, and configure
     * `statsHttpClient.setResponse(...)` to control what the handler sees back.
     */
    public get statsHttpClient(): FakeHttpClient {
        return this.server.testHttpClient;
    }

    /**
     * The virtual clock driving every timer in the server and its lobbies. Advance it to exercise
     * anything time-dependent - disconnect grace periods, countdowns, heartbeats, cleanup passes -
     * instantly and deterministically.
     */
    public get clock(): TestScheduler {
        return this.server.testScheduler;
    }

    /**
     * A distinct anonymous identity. Ids are unique per harness so one spec's users can never
     * collide in the server's user/lobby bookkeeping.
     */
    public anonymousUser(): ITestUserPayload {
        const id = uuid();
        return { id, username: AnonymousUser.usernameForId(id) };
    }

    /** A lobby name unique within this harness, for locating lobbies via `/api/available-lobbies`. */
    public uniqueLobbyName(prefix = 'test-lobby'): string {
        this.lobbyNameCounter++;
        return `${prefix}-${this.lobbyNameCounter}`;
    }

    /**
     * A simulated client bound to this harness, anonymous by default. Ids are unique per harness for
     * the same reason {@link anonymousUser}'s are, unless the client is a seeded `account`, whose id
     * is the account's.
     */
    public createClient(options: ITestClientOptions = {}): TestClient {
        // UUIDs, like real account ids and the anonymous ids the real client generates
        return TestClient.create(this, options.account?.id ?? uuid(), options);
    }

    /**
     * A client signed in as `account` the way the FE does: the session token alone, so the server looks
     * the account up. Seeds a new account when none is given. Needs a harness created with a
     * {@link IServerTestOptions.database}.
     */
    public createAccountClient(account: ISeededAccount = this.db.seedAccount()): TestClient {
        return this.createClient({ authenticated: true, account });
    }

    /**
     * An API call with exactly the credentials given: a `Cookie` header, any other headers and a JSON
     * body, and nothing else - no client, no `user` payload unless the body carries one. For specs about
     * what the server does with credentials of any shape, including ones no real client would send.
     */
    public async requestAsync(
        method: RouteMethod,
        path: string,
        options: { cookie?: string; headers?: Record<string, string>; body?: Record<string, unknown> } = {}
    ): Promise<SupertestResponse> {
        let call = this.api[method](path);
        if (options.cookie) {
            call = call.set('Cookie', options.cookie);
        }
        if (options.headers) {
            call = call.set(options.headers);
        }

        return method === 'get' ? await call : await call.send(options.body ?? {});
    }

    /**
     * Takes two clients through a quick match: both enter the queue, connect their sockets and wait out
     * the quick-lobby countdown, leaving a started game. Each side is either a client already made
     * with {@link createClient} or the options to make one with.
     *
     * Throws, rather than failing an expectation, if either side is refused by the queue or no game
     * starts, so the cause shows up in the spec that asked for the game.
     */
    public async startQuickGameAsync(
        first: ITestClientOptions | TestClient = {},
        second: ITestClientOptions | TestClient = {},
        config: Readonly<IQueueFormatKey> = premierBestOfOne
    ): Promise<{ first: TestClient; second: TestClient }> {
        const clients = [first, second].map((side) => (side instanceof TestClient ? side : this.createClient(side)));

        for (const client of clients) {
            const response = await client.enterQueueAsync({ deck: this.decklists.validDecklist(), ...config });
            if (response.status !== 200) {
                throw new Error(`startQuickGameAsync: user ${client.id} was refused by the queue: ${response.status} ${JSON.stringify(response.body)}`);
            }

            await client.connectAsync();
        }

        await this.clock.advanceAsync(Lobby.QuickLobbyCountdownMs);

        for (const client of clients) {
            if (!client.gameState) {
                throw new Error(`startQuickGameAsync: no game had started for user ${client.id} after the ${Lobby.QuickLobbyCountdownMs}ms countdown`);
            }
        }

        return { first: clients[0], second: clients[1] };
    }

    public async shutdownAsync(): Promise<void> {
        if (this.hasShutDown) {
            return;
        }

        this.hasShutDown = true;

        try {
            await this.server.shutdownAsync();
        } finally {
            this.restoreEnv();
        }

        // structural rather than remembered: a spec that never calls this would otherwise pass while
        // background work was failing on every tick
        this.assertNoScheduledErrors();

        // the database-backed services keep refresh timers on this clock; a task still pending here
        // means one of them was not stopped, and would leak into whatever runs next
        if (this.server.testDatabase && this.clock.pendingTaskCount !== 0) {
            throw new Error(`ServerTestHarness: ${this.clock.pendingTaskCount} scheduled task(s) were still pending after shutdown`);
        }
    }

    /**
     * Fails if any scheduled callback threw during the spec.
     *
     * The scheduler deliberately swallows these so that one failure cannot take the node down, which
     * means a spec would otherwise pass while background work was failing every tick.
     */
    public assertNoScheduledErrors(): void {
        this.clock.assertNoCapturedErrors();
    }
}
