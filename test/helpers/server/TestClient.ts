import type { Response as SupertestResponse } from 'supertest';

import type { CardPool, GamesToWinMode, MatchmakingCompetitivenessPreference, SwuGameFormat } from '../../../server/game/core/Constants';
import type { IQueueMatchmakingStatus } from '../../../server/gamenode/MatchmakingRules';
import type { IUserProfileDataEntity } from '../../../server/services/DynamoDBInterfaces';
import type { ISwuDbFormatDecklist } from '../../../server/utils/deck/DeckInterfaces';
import { mintSessionToken, sessionCookie, signInClaims } from './AuthTokens';
import type { ISeededAccount } from './FakeDynamoDbService';
import { FakeIoSocket } from './FakeIoSocket';
import type { RouteMethod } from './RouteRecorder';
import type { ITestUserPayload, ServerTestHarness } from './ServerTestHarness';
import { isSuccessfulSocketAuth } from '../../../server/gamenode/GameServer';
import { AnonymousUser } from '../../../server/utils/user/User';

/** Options for {@link TestClient.create}. */
export interface ITestClientOptions {

    /** Only for authenticated clients: the server derives an anonymous user's name from their id. */
    username?: string;

    /**
     * If true, this client signs in with a signed JWT, like a logged-in real client. It presents only
     * that token: the server finds the account from it, so the harness needs `{ database: true }`.
     */
    authenticated?: boolean;

    /**
     * The seeded account (`harness.db.seedAccount()`) this client signs in as. The client takes the
     * account's id and username. When omitted, an authenticated client gets a new account.
     */
    account?: ISeededAccount;

    /** Extra profile fields (e.g. `preferences`, `moderation`) for the account created for an authenticated client without an `account`. */
    profile?: Partial<IUserProfileDataEntity>;
}

/** Options for {@link TestClient.connectAsync}. */
export interface IConnectOptions {

    /** Joins via a lobby link, matching `query.lobby` in the real client - omit to connect without one. */
    lobbyId?: string;
    spectator?: boolean;

    /** Presents this token in the handshake instead of the client's own. For a bad-credential scenario. */
    token?: string;

    /** Presents this `user` in the handshake query instead of the client's own. */
    user?: Record<string, unknown>;
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
        private readonly authToken: string | null
    ) {}

    public static create(harness: ServerTestHarness, id: string, options: ITestClientOptions = {}): TestClient {
        if (!options.authenticated) {
            if (options.username) {
                throw new Error('TestClient: an anonymous client cannot choose its username - the server derives it from the id');
            }
            return new TestClient(harness, id, AnonymousUser.usernameForId(id), null);
        }

        const account = options.account ?? harness.db.seedAccount({ id, username: options.username, profile: options.profile });

        // the token is all a logged-in client presents: the server finds the account from its claims
        return new TestClient(harness, account.id, account.username, mintSessionToken(signInClaims(account)));
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

    /** The bare `{ id, username }` an anonymous client sends, which is all the real client's `getUserPayload` builds for one. */
    public userPayload(): ITestUserPayload {
        return { id: this.id, username: this.username };
    }

    /**
     * What this client adds to a request body or handshake query to identify itself: the bare `user`
     * payload for an anonymous client, nothing for a logged-in one, whose session token does it.
     */
    private identityFields(): { user?: ITestUserPayload } {
        return this.isAuthenticated ? {} : { user: this.userPayload() };
    }

    /** `Cookie` header carrying this client's NextAuth session token, for authenticated HTTP calls. */
    private authCookieHeader(): string | undefined {
        return this.authToken ? sessionCookie(this.authToken) : undefined;
    }

    private withAuthCookie(request: ReturnType<ServerTestHarness['api']['post']>): typeof request {
        const cookie = this.authCookieHeader();
        return cookie ? request.set('Cookie', cookie) : request;
    }

    // ---- HTTP flows (mirroring the real client's API calls) ----

    /**
     * Any API call with this client's credentials: its session cookie (if it has one) and, in the body,
     * its `user` payload alongside `body`. For routes the flows below do not cover.
     */
    public async requestAsync(method: RouteMethod, path: string, body: Record<string, unknown> = {}): Promise<SupertestResponse> {
        const request = this.withAuthCookie(this.harness.api[method](path));

        return method === 'get' ? await request : await request.send({ ...this.identityFields(), ...body });
    }

    public async createLobbyAsync(options: {
        lobbyName: string;
        deck: ISwuDbFormatDecklist;
        format: SwuGameFormat;
        cardPool: CardPool;
        gamesToWinMode: GamesToWinMode;
        isPrivate?: boolean;
    }): Promise<SupertestResponse> {
        return await this.withAuthCookie(this.harness.api.post('/api/create-lobby')).send({
            ...this.identityFields(),
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
            ...this.identityFields(),
        });
    }

    public async enterQueueAsync(options: {
        deck: ISwuDbFormatDecklist;
        format: SwuGameFormat;
        cardPool: CardPool;
        gamesToWinMode: GamesToWinMode;
        matchmakingCompetitivenessPreference?: MatchmakingCompetitivenessPreference;
    }): Promise<SupertestResponse> {
        return await this.withAuthCookie(this.harness.api.post('/api/enter-queue')).send({
            ...this.identityFields(),
            deck: options.deck,
            format: options.format,
            cardPool: options.cardPool,
            gamesToWinMode: options.gamesToWinMode,
            matchmakingCompetitivenessPreference: options.matchmakingCompetitivenessPreference,
        });
    }

    public async spectateGameAsync(lobbyId: string): Promise<SupertestResponse> {
        // the API's own body field is misleadingly named `gameId`, but it is actually the lobby id
        return await this.withAuthCookie(this.harness.api.post('/api/spectate-game')).send({
            gameId: lobbyId,
            ...this.identityFields(),
        });
    }

    public async changeDeckAsync(lobbyId: string, deck: ISwuDbFormatDecklist): Promise<SupertestResponse> {
        return await this.withAuthCookie(this.harness.api.post(`/api/lobby/${lobbyId}/change-deck`)).send({
            deck,
            ...this.identityFields(),
        });
    }

    /**
     * Saves preferences for `userId`; the real client always passes its own id. Like the real client, a
     * logged-in client sends just the preferences and its session, so the server looks the account up.
     */
    public async savePreferencesAsync(userId: string, preferences: Record<string, unknown>): Promise<SupertestResponse> {
        return await this.withAuthCookie(this.harness.api.put(`/api/user/${userId}/preferences`)).send({
            preferences,
            ...this.identityFields(),
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
        const token = options.token ?? this.authToken;
        const handshakeUser = options.user ?? (this.isAuthenticated ? undefined : this.userPayload());

        const fakeSocket = new FakeIoSocket({
            auth: token ? { token } : {},
            query: {
                ...(handshakeUser ? { user: JSON.stringify(handshakeUser) } : {}),
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

    /**
     * The id of the lobby this client is in, read from the connection link in its latest `lobbystate`
     * - the `lobbyId` query parameter a real client hands to someone joining by link.
     */
    public get lobbyId(): string {
        const connectionLink = this.lobbyState?.connectionLink;
        if (!connectionLink) {
            throw new Error(`TestClient: user ${this.id} has not received a lobby connection link yet - connect to a lobby first`);
        }

        return new URL(connectionLink).searchParams.get('lobbyId');
    }

    /** The most recent matching status supplied as the second queueHeartbeat argument. */
    public get queueMatchmakingStatus(): IQueueMatchmakingStatus | undefined {
        const heartbeats = this.receivedEvents('queueHeartbeat');
        return heartbeats.length > 0 ? heartbeats[heartbeats.length - 1].args[1] : undefined;
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
