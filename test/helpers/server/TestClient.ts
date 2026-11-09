import type { Response as SupertestResponse } from 'supertest';

import type { PlayerTimeRemainingStatus } from '../../../server/game/core/actionTimer/IActionTimer';
import type { CardPool, GamesToWinMode, MatchmakingCompetitivenessPreference, RematchMode, SwuGameFormat } from '../../../server/game/core/Constants';
import { SnapshotType } from '../../../server/game/core/Constants';
import type { IStatefulPromptResults } from '../../../server/game/core/gameSteps/PromptInterfaces';
import type { IGetSnapshotSettings, IQuickSnapshotSettings } from '../../../server/game/core/snapshot/SnapshotInterfaces';
import type { PlayerReportType } from '../../../server/game/Interfaces';
import type { IQueueMatchmakingStatus } from '../../../server/gamenode/MatchmakingRules';
import type { IUserProfileDataEntity } from '../../../server/services/DynamoDBInterfaces';
import type { ISwuDbFormatDecklist } from '../../../server/utils/deck/DeckInterfaces';
import { mintSessionToken, sessionCookie, signInClaims } from './AuthTokens';
import type { IChatEntry } from './ChatEntries';
import { toChatEntries } from './ChatEntries';
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
     * that token: the server finds the account from it, so the harness needs its database (there by
     * default, gone with `{ database: false }`). The server keeps the profile once it has read it, so
     * seed what it owns (`profile`, or the `account`'s) before this client's first signed-in request.
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

    /**
     * Presents this `user` in the handshake query instead of the client's own: an object is sent as JSON, as
     * the real client sends it, and a string exactly as given, for a malformed query.
     */
    user?: Record<string, unknown> | string;
}

/** Result of {@link TestClient.attemptConnectAsync}. */
export type IConnectResult =
  | { connected: true }
  | { connected: false; errorMessage: string };

/** A button on a player's prompt, as the game state carries it. */
export interface IPromptButton {
    text: string;
    arg: unknown;
    command: string;
    uuid: string;
    disabled?: boolean;
}

/** The parts of a player's prompt a spec reads, as the game state carries it (`PlayerPromptState`). */
export interface IPromptState {
    menuTitle?: string;
    promptTitle?: string;

    /** The kind of prompt, such as `initiative`, `resource` or `actionWindow`; absent while the player is waiting. */
    promptType?: string;
    buttons: IPromptButton[];
}

/** The parts of a card in a player's hand a spec reads, as the game state carries it. */
export interface IHandCard {

    /** What {@link TestClient.clickCardAsync} takes. */
    uuid: string;
    name: string;
}

/** A player's action timer as a client is sent it: the fields forceteki-client shows (`GameTimer`, `TimerWarningIcon`). */
export interface IActionTimerView {

    /**
     * Turn time left in whole seconds, rounded up; `null` before the turn time has started, once it is spent, and while the
     * timer is stopped. A paused timer still shows what it has left.
     */
    turnSeconds: number | null;

    /** Main time left in whole seconds, rounded up. */
    mainSeconds: number;
    status: PlayerTimeRemainingStatus;
    isRunning: boolean;
}

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
     * Saves preferences for the authenticated caller. Like the real client, a
     * logged-in client sends just the preferences and its session, so the server looks the account up.
     */
    public async savePreferencesAsync(preferences: Record<string, unknown>): Promise<SupertestResponse> {
        return await this.withAuthCookie(this.harness.api.put('/api/user/preferences')).send({
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
                ...(handshakeUser ? { user: typeof handshakeUser === 'string' ? handshakeUser : JSON.stringify(handshakeUser) } : {}),
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

    /**
     * Whether the server has this user down for nothing - no lobby seat, spectator seat or queue entry - found out
     * the way a client would: a socket connecting with no lobby link is refused with the server's catch-all error
     * (`Connection error, please try again`), where a user it still has down for something is routed there or told
     * something else.
     *
     * It connects a new socket to find out, which replaces this client's current one and, for a user who does have a
     * place, takes it up: seats them in their lobby, or puts their queue entry back in play. So use it as a spec's last
     * check. It also answers true for an anonymous client presenting a logged-in user's id, whom the server refuses
     * with the same error.
     */
    public async hasNoPlaceAsync(): Promise<boolean> {
        await this.connectAsync();
        return !this.isConnected && this.connectionErrors.length === 1 && this.connectionErrors[0] === 'Connection error, please try again';
    }

    // ---- Messaging (mirroring `sendMessage`/the `game`/`lobby` channels in `Game.context.tsx`) ----

    /**
     * Any command on the `lobby` channel, with exactly these arguments. Prefer the typed commands below,
     * which send what the real client sends; this is for a command or payload no real client would send.
     */
    public async sendLobbyMessageAsync(command: string, ...args: any[]): Promise<void> {
        await this.socket.simulateClientEmit('lobby', command, ...args);
    }

    /** Any command on the `game` channel, with exactly these arguments. See {@link sendLobbyMessageAsync}. */
    public async sendGameMessageAsync(command: string, ...args: any[]): Promise<void> {
        await this.socket.simulateClientEmit('game', command, ...args);
    }

    // ---- Lobby commands: one per entry in `Lobby`'s lobby allowlist, sent as the real client sends it ----

    /** `sendChatMessage`: a message in the lobby chat (`SetUp`). */
    public async sendChatMessageAsync(message: string): Promise<void> {
        await this.sendLobbyMessageAsync('sendChatMessage', message);
    }

    /** `typingState`: whether this player is typing in the chat (`useChatTypingState`). */
    public async typingStateAsync(isTyping: boolean): Promise<void> {
        await this.sendLobbyMessageAsync('typingState', isTyping);
    }

    /** `muteChat`: hides the chat in both directions for this lobby (`ChatDrawer`, `PlayerReportDialog`). */
    public async muteChatAsync(): Promise<void> {
        await this.sendLobbyMessageAsync('muteChat');
    }

    /** `setReadyStatus`: this player's ready toggle (`LobbyReadyButtons`). */
    public async setReadyStatusAsync(ready: boolean): Promise<void> {
        await this.sendLobbyMessageAsync('setReadyStatus', ready);
    }

    /** `startGameAsync`: the owner's start button (`LobbyReadyButtons`), and a quick rematch (`EndGameOptions`). */
    public async startGameAsync(): Promise<void> {
        await this.sendLobbyMessageAsync('startGameAsync');
    }

    /** `updateDeck`: moves a card between the deck and the sideboard, from game 2 of a set (`Deck`). */
    public async updateDeckAsync(list: 'Deck' | 'Sideboard', cardId: string): Promise<void> {
        await this.sendLobbyMessageAsync('updateDeck', list, cardId);
    }

    /** `updateSetting`: one of the owner's lobby settings, `requestUndo` or `allowSpectators` (`DeckSelectionCard`). */
    public async updateSettingAsync(settingName: string, value: boolean): Promise<void> {
        await this.sendLobbyMessageAsync('updateSetting', settingName, value);
    }

    /** `requestRematch`: asks the opponent for a rematch of this kind (`EndGameOptions`, `LobbyConcededPopup`). */
    public async requestRematchAsync(mode: RematchMode): Promise<void> {
        await this.sendLobbyMessageAsync('requestRematch', mode);
    }

    /** `rematch`: accepts the requested rematch (`EndGameOptions`, `LobbyConcededPopup`). */
    public async rematchAsync(): Promise<void> {
        await this.sendLobbyMessageAsync('rematch');
    }

    /** `concedeBo3`: concedes the whole best-of-three set (`LobbyReadyButtons`, `EndGameOptions`). */
    public async concedeBo3Async(): Promise<void> {
        await this.sendLobbyMessageAsync('concedeBo3');
    }

    /** `proceedToNextBo3Game`: confirms moving on to the next game of the set (`EndGameOptions`). */
    public async proceedToNextBo3GameAsync(): Promise<void> {
        await this.sendLobbyMessageAsync('proceedToNextBo3Game');
    }

    /** `submitReport` for a bug report (`BugReportDialog`). */
    public async submitBugReportAsync(description: string): Promise<void> {
        await this.sendLobbyMessageAsync('submitReport', 'bugReport', description);
    }

    /** `submitReport` for a report against the opponent (`PlayerReportDialog`). */
    public async submitPlayerReportAsync(description: string, reportType: PlayerReportType): Promise<void> {
        await this.sendLobbyMessageAsync('submitReport', 'playerReport', description, reportType);
    }

    /** `reportScreenResolution`: the reply to the server's `requestScreenResolution` at game start (`Game.context`). */
    public async reportScreenResolutionAsync(width: number, height: number): Promise<void> {
        await this.sendLobbyMessageAsync('reportScreenResolution', { width, height });
    }

    /**
     * `retransmitGameMessages`: asks again for game messages this client missed (`Game.context`). Also the
     * one command a spectator may send.
     */
    public async retransmitGameMessagesAsync(startIndex: number, endIndex: number): Promise<void> {
        await this.sendLobbyMessageAsync('retransmitGameMessages', startIndex, endIndex);
    }

    // ---- Game commands: one per entry in `Lobby`'s game allowlist, plus `resetActionTimer` ----

    /** `chat`: a message in the game chat (`ChatDrawer`). */
    public async sendGameChatAsync(message: string): Promise<void> {
        await this.sendGameMessageAsync('chat', message);
    }

    /**
     * `concede`: concedes the game (`ChatDrawer`, `CurrentGameTab`). The real client sends the player's name
     * as well, which the server ignores. Also the quickest way for a spec to end a game.
     */
    public async concedeAsync(): Promise<void> {
        await this.sendGameMessageAsync('concede', this.username);
    }

    /** `cardClicked`: a click on a card, by its uuid in the game state (`GameCard`, `LeaderBaseCard`). */
    public async clickCardAsync(cardUuid: string): Promise<void> {
        await this.sendGameMessageAsync('cardClicked', cardUuid);
    }

    /**
     * A prompt button from the game state, sent the way the real client's popups send one:
     * `[button.command, button.arg, button.uuid]` (`DefaultPopup`, `CardActionTray` and others).
     */
    public async clickPromptButtonAsync(button: { command: string; arg: unknown; uuid: string }): Promise<void> {
        await this.sendGameMessageAsync(button.command, button.arg, button.uuid);
    }

    /**
     * Clicks the button showing `text` on this player's current {@link prompt}, as a player would. Throws, naming the
     * buttons the prompt does have, if there is no such button or it is disabled.
     */
    public async clickButtonAsync(text: string): Promise<void> {
        const buttons = this.prompt.buttons;
        const button = buttons.find((candidate) => candidate.text === text);
        if (!button || button.disabled) {
            throw new Error(
                `TestClient: user ${this.id} has no enabled '${text}' button; their prompt ('${this.prompt.menuTitle}') has ` +
                JSON.stringify(buttons.map((candidate) => (candidate.disabled ? `${candidate.text} (disabled)` : candidate.text)))
            );
        }

        await this.clickPromptButtonAsync(button);
    }

    /** `menuButton` with an argument the real client builds itself (`DropdownPopup`, `NumberPopup`, `SelectCardsPopup`). */
    public async menuButtonAsync(arg: string | number, promptUuid: string): Promise<void> {
        await this.sendGameMessageAsync('menuButton', arg, promptUuid);
    }

    /** `perCardMenuButton`: a button shown against one card of a card-selection prompt (`SelectCardsPopup`). */
    public async perCardMenuButtonAsync(arg: string, cardUuid: string, promptUuid: string): Promise<void> {
        await this.sendGameMessageAsync('perCardMenuButton', arg, cardUuid, promptUuid);
    }

    /** `statefulPromptResults`: the result of a distribution prompt (`Game.context`'s `sendGameMessage`). */
    public async statefulPromptResultsAsync(results: IStatefulPromptResults, promptUuid: string): Promise<void> {
        await this.sendGameMessageAsync('statefulPromptResults', results, promptUuid);
    }

    /** `rollbackToSnapshot`: an undo (`ChatDrawer`, `CurrentGameTab`). */
    public async rollbackToSnapshotAsync(settings: IGetSnapshotSettings): Promise<void> {
        await this.sendGameMessageAsync('rollbackToSnapshot', settings);
    }

    /**
     * `rollbackToSnapshot` as the undo button sends it (`ChatDrawer`): a quick undo of this player's current or previous
     * action. In a public or quick lobby it asks the opponent, except for the player's one free undo of the game; even
     * that one asks when it would undo something the opponent has seen, as an undo at the first action does (it reaches
     * back into the setup) and as any undo after the end of the game does.
     */
    public async quickUndoAsync(): Promise<void> {
        const settings: IQuickSnapshotSettings & { actionOffset: number } = { type: SnapshotType.Quick, playerId: this.id, actionOffset: 0 };
        await this.rollbackToSnapshotAsync(settings);
    }

    /** `toggleOptionSetting`: an in-game option, such as `autoSingleTarget` (`GameOptionsTab`). */
    public async toggleOptionSettingAsync(settingName: string, enabled: boolean): Promise<void> {
        await this.sendGameMessageAsync('toggleOptionSetting', settingName, enabled);
    }

    /**
     * `resetActionTimer`: sent when the bug-report or player-report dialog opens (`CurrentGameTab`). The server ignores it,
     * as a player's messages do not affect their action timer (open finding #11). Not on the allowlist:
     * `Lobby.onGameMessage` returns before checking.
     */
    public async resetActionTimerAsync(): Promise<void> {
        await this.sendGameMessageAsync('resetActionTimer');
    }

    /** `requeue`: puts this player back in the queue after a quick match ends (`EndGameOptions`, `LobbyConcededPopup`). */
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

    /** This player's own prompt, from their latest `gamestate`. Throws if they have not been sent one. */
    public get prompt(): IPromptState {
        const prompt = this.gameState?.players?.[this.id]?.promptState;
        if (!prompt) {
            throw new Error(`TestClient: user ${this.id} has not been sent a game state with their prompt in it`);
        }

        return prompt;
    }

    /** The cards in this player's hand, from their latest `gamestate`. */
    public get hand(): IHandCard[] {
        return this.gameState?.players?.[this.id]?.cardPiles?.hand ?? [];
    }

    /**
     * `player`'s action timer as this client was last sent it. `player` is this client, its opponent, or a player it
     * is watching. The client counts down between game states, so this is the time left as of the latest one.
     */
    public timerOf(player: TestClient): IActionTimerView {
        const playerState = this.gameState?.players?.[player.id];
        if (!playerState) {
            throw new Error(`TestClient: user ${this.id} has not been sent a game state with player ${player.id} in it`);
        }

        return {
            turnSeconds: playerState.turnTimeRemainingSeconds ?? null,
            mainSeconds: playerState.mainTimeRemainingSeconds,
            status: playerState.timeRemainingStatus,
            isRunning: playerState.timerIsRunning,
        };
    }

    /**
     * The id of the lobby this client is in, from its latest `lobbystate`: the `lobbyId` in the connection link a real
     * client hands to someone joining by link, or, for a quick lobby (which has no link), the lobby state's own id.
     */
    public get lobbyId(): string {
        const lobbyState = this.lobbyState;
        if (!lobbyState) {
            throw new Error(`TestClient: user ${this.id} has not received a lobby state yet - connect to a lobby first`);
        }

        return lobbyState.connectionLink ? new URL(lobbyState.connectionLink).searchParams.get('lobbyId') : lobbyState.id;
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

    /** The lobby chat as of this client's latest `lobbystate`, oldest line first: chat messages, alerts and log lines. */
    public get lobbyChat(): IChatEntry[] {
        return toChatEntries(this.lobbyState?.gameChat?.messages);
    }

    /**
     * The game chat this client has been sent on its current socket, oldest line first. Each `gamestate`
     * carries only the lines that are new since the last one, so these are all of them in the order they
     * arrived; a line the server sends again (after a reconnect, or on request) appears again.
     */
    public get gameChat(): IChatEntry[] {
        return this.receivedEvents('gamestate').flatMap((e) => toChatEntries(e.args[0]?.newMessages));
    }

    /** What `sender` has said in the lobby chat, as this client sees it. */
    public lobbyChatFrom(sender: TestClient): string[] {
        return TestClient.messagesFrom(this.lobbyChat, sender);
    }

    /** What `sender` has said in the game chat, as this client has been sent it. */
    public gameChatFrom(sender: TestClient): string[] {
        return TestClient.messagesFrom(this.gameChat, sender);
    }

    private static messagesFrom(chat: IChatEntry[], sender: TestClient): string[] {
        return chat.filter((entry) => entry.senderId === sender.id).map((entry) => entry.text);
    }

    private lastPayload(event: string): any | undefined {
        const matches = this.receivedEvents(event);
        return matches.length > 0 ? matches[matches.length - 1].args[0] : undefined;
    }
}
