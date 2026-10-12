import jwt from 'jsonwebtoken';
import type { Response as SupertestResponse } from 'supertest';

import type { CardPool, GamesToWinMode, SwuGameFormat } from '../../../server/game/core/Constants';
import type { IUserDataEntity } from '../../../server/services/DynamoDBInterfaces';
import type { ISwuDbFormatDecklist } from '../../../server/utils/deck/DeckInterfaces';
import { FakeIoSocket } from './FakeIoSocket';
import type { ITestUserPayload, ServerTestHarness } from './ServerTestHarness';
import { testNextAuthSecret } from './ServerTestEnv';
import { isSuccessfulSocketAuth } from '../../../server/gamenode/GameServer';

/** Options for {@link TestClient.create}. */
export interface ITestClientOptions {
    username?: string;

    /** If true, this client authenticates with a signed JWT, like a logged-in real client. */
    authenticated?: boolean;

    /** Extra fields merged into the authenticated user's data (e.g. `preferences`, `moderation`). Ignored for anonymous users. */
    userDataOverrides?: Partial<IUserDataEntity>;
}

/** Options for {@link TestClient.connectAsync}. */
export interface IConnectOptions {

    /** Joins via a lobby link, matching `query.lobby` in the real client - omit to connect without one. */
    lobbyId?: string;
    spectator?: boolean;
}

/** Result of {@link TestClient.attemptConnectAsync}. */
export type IConnectResult =
  | { connected: true }
  | { connected: false; errorMessage: string };

/**
 * Type guard for {@link IConnectResult}. See `GameServer.isSuccessfulSocketAuth` for why a predicate
 * is used here instead of `if (result.connected)`.
 */
function isConnectionRejected(result: IConnectResult): result is { connected: false; errorMessage: string } {
    return !result.connected;
}

/** Body shape accepted by `/api/create-lobby` and `/api/enter-queue`'s shared format fields. */
export interface IMatchConfiguration {
    format: SwuGameFormat;
    cardPool: CardPool;
    gamesToWinMode: GamesToWinMode;
}

/**
 * A simulated frontend client for one user, anonymous or authenticated.
 *
 * Mirrors the real client's two-step connection flow: HTTP calls to create/find/join a lobby or
 * queue entry (via {@link ServerTestHarness.api}), then a socket connection carrying the same
 * handshake query/auth the real client builds in `Game.context.tsx`. The socket side runs over a
 * {@link FakeIoSocket}, driving the *real* `GameServer.authenticateSocketAsync` /
 * `handleSocketConnectionAsync` methods rather than a reimplementation of them.
 *
 * Every event the server emits to this client is recorded by the underlying `FakeIoSocket` and
 * readable via {@link lobbyState}, {@link gameState} and {@link receivedEvents} once connected.
 */
export class TestClient {
    private _socket: FakeIoSocket | null = null;
    private _previousSocket: FakeIoSocket | null = null;

    private constructor(
        private readonly harness: ServerTestHarness,
        public readonly id: string,
        public readonly username: string,
        private readonly authToken: string | null,
        private readonly userData: Partial<IUserDataEntity> | null
    ) {}

    public static create(harness: ServerTestHarness, id: string, options: ITestClientOptions = {}): TestClient {
        const username = options.username ?? `test-user-${id.slice(0, 6)}`;

        if (!options.authenticated) {
            return new TestClient(harness, id, username, null, null);
        }

        // `verifyTokenAndCreateAuthenticatedUser` (the no-DB-access path the real client's logged-in
        // flow takes) overwrites `userData.id` with this claim regardless of what is sent alongside
        // it, so the token - not the query/body payload - is the actual source of truth for identity.
        const token = jwt.sign({ userId: id }, testNextAuthSecret);

        const userData: Partial<IUserDataEntity> = {
            id,
            username,
            showWelcomeMessage: false,
            ...options.userDataOverrides,
        };

        return new TestClient(harness, id, username, token, userData);
    }

    public get isAuthenticated(): boolean {
        return this.authToken !== null;
    }

    /** The socket this client is connected with. Throws if {@link connectAsync} has not succeeded yet. */
    public get socket(): FakeIoSocket {
        if (!this._socket) {
            throw new Error(`TestClient: user ${this.id} is not connected - call connectAsync() first`);
        }
        return this._socket;
    }

    public get isConnected(): boolean {
        return this._socket !== null && this._socket.connected;
    }

    /**
     * The socket this client used before its most recent {@link connectAsync} /
     * {@link attemptConnectAsync}, or `null` if it has never reconnected. Production disconnects a
     * stale socket on reconnect (`Lobby.checkUpdateSocket`); this lets a test confirm that actually
     * happened rather than just trusting it did, which matters for the Phase 5 multi-tab case too -
     * a reconnect and a second tab are the same thing server-side.
     */
    public get previousSocket(): FakeIoSocket | null {
        return this._previousSocket;
    }

    // ---- Identity payloads ----

    /**
     * The `user` payload this client sends over HTTP and in the socket handshake query, mirroring
     * the real client's `getUserPayload`: a bare `{ id, username }` for anonymous users, or the fuller
     * user data (plus `authenticated: true`) for a logged-in one.
     */
    public userPayload(): ITestUserPayload | (Partial<IUserDataEntity> & { authenticated: true }) {
        if (!this.isAuthenticated) {
            return { id: this.id, username: this.username };
        }

        return { ...this.userData, authenticated: true };
    }

    /** `Cookie` header carrying this client's NextAuth session token, for authenticated HTTP calls. */
    private authCookieHeader(): string | undefined {
        return this.authToken ? `next-auth.session-token=${this.authToken}` : undefined;
    }

    private withAuthCookie(request: ReturnType<ServerTestHarness['api']['post']>): typeof request {
        const cookie = this.authCookieHeader();
        return cookie ? request.set('Cookie', cookie) : request;
    }

    // ---- HTTP flows (mirroring the real client's API calls) ----

    public async createLobbyAsync(options: {
        lobbyName: string;
        deck: ISwuDbFormatDecklist;
        format: SwuGameFormat;
        cardPool: CardPool;
        gamesToWinMode: GamesToWinMode;
        isPrivate?: boolean;
    }): Promise<SupertestResponse> {
        return await this.withAuthCookie(this.harness.api.post('/api/create-lobby')).send({
            user: this.userPayload(),
            deck: options.deck,
            lobbyName: options.lobbyName,
            format: options.format,
            cardPool: options.cardPool,
            gamesToWinMode: options.gamesToWinMode,
            isPrivate: options.isPrivate ?? false,
        });
    }

    public async joinLobbyAsync(lobbyId: string): Promise<SupertestResponse> {
        return await this.withAuthCookie(this.harness.api.post('/api/join-lobby')).send({
            lobbyId,
            user: this.userPayload(),
        });
    }

    public async enterQueueAsync(options: {
        deck: ISwuDbFormatDecklist;
        format: SwuGameFormat;
        cardPool: CardPool;
        gamesToWinMode: GamesToWinMode;
    }): Promise<SupertestResponse> {
        return await this.withAuthCookie(this.harness.api.post('/api/enter-queue')).send({
            user: this.userPayload(),
            deck: options.deck,
            format: options.format,
            cardPool: options.cardPool,
            gamesToWinMode: options.gamesToWinMode,
        });
    }

    public async spectateGameAsync(lobbyId: string): Promise<SupertestResponse> {
        // the API's own body field is misleadingly named `gameId`, but it is actually the lobby id
        return await this.withAuthCookie(this.harness.api.post('/api/spectate-game')).send({
            gameId: lobbyId,
            user: this.userPayload(),
        });
    }

    /**
     * Finds a public lobby via `/api/available-lobbies`, the same discovery endpoint the real
     * client's lobby browser uses. Returns `undefined` if no entry matches.
     */
    public async findAvailableLobbyAsync(predicate: (lobby: any) => boolean): Promise<any | undefined> {
        const response = await this.harness.api.get('/api/available-lobbies');
        const lobbies: any[] = response.body ?? [];
        return lobbies.find(predicate);
    }

    // ---- Socket connection ----

    /**
     * Connects this client's socket, throwing if authentication is rejected. Use
     * {@link attemptConnectAsync} instead when a rejection is the scenario under test.
     */
    public async connectAsync(options: IConnectOptions = {}): Promise<void> {
        const result = await this.attemptConnectAsync(options);
        if (isConnectionRejected(result)) {
            throw new Error(`TestClient: connection rejected for user ${this.id}: ${result.errorMessage}`);
        }
    }

    /**
     * Connects this client's socket, mirroring the handshake the real client builds in
     * `Game.context.tsx`: `query.user`, `query.lobby`, `query.spectator`, and `auth.token` when
     * authenticated. Runs the real `GameServer.authenticateSocketAsync` and
     * `handleSocketConnectionAsync` against a {@link FakeIoSocket} rather than a real connection.
     */
    public async attemptConnectAsync(options: IConnectOptions = {}): Promise<IConnectResult> {
        const fakeSocket = new FakeIoSocket({
            auth: this.authToken ? { token: this.authToken } : {},
            query: {
                user: JSON.stringify(this.userPayload()),
                lobby: JSON.stringify({ lobbyId: options.lobbyId ?? null }),
                spectator: options.spectator ? 'true' : 'false',
            },
        });

        const authResult = await this.harness.server.authenticateSocketAsync(fakeSocket);
        if (!isSuccessfulSocketAuth(authResult)) {
            return { connected: false, errorMessage: authResult.errorMessage };
        }

        fakeSocket.data.user = authResult.user;
        this._previousSocket = this._socket;
        this._socket = fakeSocket;

        await this.harness.server.handleSocketConnectionAsync(fakeSocket);

        return { connected: true };
    }

    // ---- Messaging (mirroring `sendMessage`/the `game`/`lobby` channels in `Game.context.tsx`) ----

    public async sendLobbyMessageAsync(command: string, ...args: any[]): Promise<void> {
        await this.socket.simulateClientEmit('lobby', command, ...args);
    }

    public async sendGameMessageAsync(command: string, ...args: any[]): Promise<void> {
        await this.socket.simulateClientEmit('game', command, ...args);
    }

    public async requeueAsync(): Promise<void> {
        await this.socket.simulateClientEmit('requeue');
    }

    /**
     * The graceful app-level disconnect (`sendMessage('manualDisconnect')` in the real client).
     *
     * Production's `manualDisconnect` handler (`GameServer.handleSocketConnectionAsync`) calls the
     * socket's `.disconnect()` synchronously rather than awaiting its effects, so the dispatch that
     * triggers (`GameServer.onSocketDisconnected` and everything downstream, e.g. `Lobby.removeUser`)
     * is still settling when `simulateClientEmit('manualDisconnect')` alone would resolve. Waiting
     * for it here as well is what makes this method's effects visible to the caller deterministically
     * - without it, a test reading `lobbyState` immediately afterward could race the update.
     */
    public async manualDisconnectAsync(): Promise<void> {
        await this.socket.simulateClientEmit('manualDisconnect');
        await this.socket.waitForDisconnectHandlingAsync();
    }

    /** An abrupt transport-level drop (e.g. losing network), as opposed to {@link manualDisconnectAsync}. */
    public async disconnectTransportAsync(): Promise<void> {
        this.socket.disconnect();
        await this.socket.waitForDisconnectHandlingAsync();
    }

    /** Fires the acknowledgement callback for the most recent un-acked emit of `event`, if any. */
    public ackEvent(event: string, ...ackArgs: any[]): void {
        this.socket.ackEvent(event, ...ackArgs);
    }

    // ---- Inbox ----

    /** Every event received so far, optionally filtered to one event name. */
    public receivedEvents(event?: string): readonly { event: string; args: any[] }[] {
        const all = this.socket.emittedEvents;
        return event ? all.filter((e) => e.event === event) : all;
    }

    /** The most recent `lobbystate` payload received, or `undefined` if none yet. */
    public get lobbyState(): any | undefined {
        return this.lastPayload('lobbystate');
    }

    /** The most recent `gamestate` payload received, or `undefined` if none yet. */
    public get gameState(): any | undefined {
        return this.lastPayload('gamestate');
    }

    /** Every `connection_error` message received so far. */
    public get connectionErrors(): string[] {
        return this.receivedEvents('connection_error').map((e) => e.args[0]);
    }

    private lastPayload(event: string): any | undefined {
        const matches = this.receivedEvents(event);
        return matches.length > 0 ? matches[matches.length - 1].args[0] : undefined;
    }
}
