import path from 'path';
import request from 'supertest';

import { DeckValidator } from '../../../server/utils/deck/DeckValidator';
import { DecklistFixtures } from './DecklistFixtures';
import type { ITestGameServerSetup } from './TestGameServer';
import { TestGameServer } from './TestGameServer';

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

    private constructor(
        public readonly server: TestGameServer,
        public readonly decklists: DecklistFixtures
    ) {}

    public static async createAsync(): Promise<ServerTestHarness> {
        const setup = await getSharedSetupAsync();

        return new ServerTestHarness(
            await TestGameServer.startAsync(setup),
            new DecklistFixtures(setup.testGameBuilder.cardDataGetter, setup.deckValidator)
        );
    }

    /** An HTTP client pointed at this harness's server. */
    public get api(): ReturnType<typeof request> {
        return request(this.server.baseUrl);
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
        return `${prefix}-${this.lobbyNameCounter}-${Math.random().toString(36)
            .slice(2, 8)}`;
    }

    public async shutdownAsync(): Promise<void> {
        await this.server.shutdownAsync();
    }
}
