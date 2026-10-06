import path from 'path';
import request from 'supertest';

import { DeckValidator } from '../../../server/utils/deck/DeckValidator';
import { DecklistFixtures } from './DecklistFixtures';
import type { ITestGameServerSetup, TestConfigOverrides } from './TestGameServer';
import { TestGameServer } from './TestGameServer';
import type { TestScheduler } from './TestScheduler';
import type { FakeHttpClient } from './FakeHttpClient';
import type { ITestClientOptions } from './TestClient';
import { TestClient } from './TestClient';

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
    private anonymousUserCounter = 0;
    private lobbyNameCounter = 0;
    private clientIdCounter = 0;

    /** Guards against the double shutdown that happens when a spec tears down and `afterEach` follows. */
    private hasShutDown = false;

    private constructor(
        public readonly server: TestGameServer,
        public readonly decklists: DecklistFixtures
    ) {}

    public static async createAsync(configOverrides?: TestConfigOverrides): Promise<ServerTestHarness> {
        const setup = await getSharedSetupAsync();

        return new ServerTestHarness(
            await TestGameServer.startAsync(setup, configOverrides),
            new DecklistFixtures(setup.testGameBuilder.cardDataGetter, setup.deckValidator)
        );
    }

    /** An HTTP client pointed at this harness's server. */
    public get api(): ReturnType<typeof request> {
        return request(this.server.baseUrl);
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
    public anonymousUser(username?: string): ITestUserPayload {
        this.anonymousUserCounter++;
        const id = `anon-${this.anonymousUserCounter}-${Math.random().toString(36)
            .slice(2, 10)}`;

        return { id, username: username ?? `anonymous ${id.slice(0, 6)}` };
    }

    /** A lobby name unique within this harness, for locating lobbies via `/api/available-lobbies`. */
    public uniqueLobbyName(prefix = 'test-lobby'): string {
        this.lobbyNameCounter++;
        return `${prefix}-${this.lobbyNameCounter}`;
    }

    /**
     * A simulated client bound to this harness, anonymous by default. Ids are unique per harness for
     * the same reason {@link anonymousUser}'s are.
     */
    public createClient(options: ITestClientOptions = {}): TestClient {
        this.clientIdCounter++;
        const prefix = options.authenticated ? 'auth' : 'anon';
        const id = `${prefix}-${this.clientIdCounter}-${Math.random().toString(36)
            .slice(2, 10)}`;

        return TestClient.create(this, id, options);
    }

    public async shutdownAsync(): Promise<void> {
        if (this.hasShutDown) {
            return;
        }

        this.hasShutDown = true;
        await this.server.shutdownAsync();

        // structural rather than remembered: a spec that never calls this would otherwise pass while
        // background work was failing on every tick
        this.assertNoScheduledErrors();
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
