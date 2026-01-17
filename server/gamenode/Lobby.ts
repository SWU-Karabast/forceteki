import Game from '../game/core/Game';
import { v4 as uuid, v4 as uuidv4 } from 'uuid';
import type Socket from '../socket';
import * as Contract from '../game/core/utils/Contract';
import * as EnumHelpers from '../game/core/utils/EnumHelpers';
import fs from 'fs';
import path from 'path';
import { logger } from '../logger';
import { GameChat } from '../game/core/chat/GameChat';
import type { User } from '../utils/user/User';
import type { IUser } from '../Settings';
import { getUserWithDefaultsSet } from '../Settings';
import type { CardDataGetter } from '../utils/cardData/CardDataGetter';
import { Deck } from '../utils/deck/Deck';
import { DeckValidator } from '../utils/deck/DeckValidator';
import type { IDeckValidationFailures, IDeckValidationProperties } from '../utils/deck/DeckInterfaces';
import { DeckSource, ScoreType } from '../utils/deck/DeckInterfaces';
import type { GameConfiguration } from '../game/core/GameInterfaces';
import { GameMode } from '../GameMode';
import type { GameServer } from './GameServer';
import {
    AlertType,
    GameEndReason,
    GameErrorSeverity,
    GamesToWinMode,
    RematchMode,
    SwuGameFormat
} from '../game/core/Constants';
import { UndoMode } from '../game/core/snapshot/SnapshotManager';
import type { DiscordDispatcher } from '../game/core/DiscordDispatcher';
import type { Player } from '../game/core/Player';
import type { IQueueFormatKey } from './QueueHandler';
import { SimpleActionTimer } from '../game/core/actionTimer/SimpleActionTimer';
import { PlayerTimeRemainingStatus } from '../game/core/actionTimer/IActionTimer';
import { ModerationType } from '../services/DynamoDBInterfaces';
import type { MessageText } from '../game/Interfaces';
import { ReportType } from '../game/Interfaces';
import { PlayerReportType } from '../game/Interfaces';

interface LobbySpectatorWrapper {
    id: string;
    username: string;
    state: 'connected' | 'disconnected';
    socket?: Socket;
    user?: User;
    lastMessageOffset: number;
}

interface IChatMessageEntry {
    date: Date;
    message: MessageText | {
        alert: {
            type: string;
            message: string | string[];
        };
    };
}

enum LobbySettingKeys {
    RequestUndo = 'requestUndo',
}

enum Bo3SetEndedReason {
    Concede = 'concede',
    OnePlayerLobbyTimeout = 'onePlayerLobbyTimeout',
    BothPlayersLobbyTimeout = 'bothPlayersLobbyTimeout',
    WonTwoGames = 'wonTwoGames',
}

interface IBo3ConcedeResult {
    endedReason: Bo3SetEndedReason.Concede;
    concedingPlayerId: string;
}

interface IBo3OnePlayerTimeoutResult {
    endedReason: Bo3SetEndedReason.OnePlayerLobbyTimeout;
    timeoutPlayerId: string;
}

interface IBo3BothPlayersTimeoutResult {
    endedReason: Bo3SetEndedReason.BothPlayersLobbyTimeout;
}

interface IBo3WonGamesResult {
    endedReason: Bo3SetEndedReason.WonTwoGames;
}

type IBo3SetEndResult = IBo3ConcedeResult | IBo3OnePlayerTimeoutResult | IBo3BothPlayersTimeoutResult | IBo3WonGamesResult;

interface IBestOfOneHistory {
    gamesToWinMode: GamesToWinMode.BestOfOne;
    lastWinnerId?: string;

    /** Tracks if either player changed their deck since the last game (for first player selection) */
    deckChangedSinceLastGame?: boolean;
}

interface IBestOfThreeHistory {
    gamesToWinMode: GamesToWinMode.BestOfThree;

    /** The current game number (1, 2, or 3) */
    currentGameNumber: number;

    /** Array of player IDs who won each game, or 'draw' for drawn games */
    winnerIdsInOrder: (string | 'draw')[];

    /** How the set ended (concede, timeout, or won games). Undefined if set is ongoing. */
    setEndResult?: IBo3SetEndResult;

    /** Map of player IDs to usernames, initialized when game 1 starts */
    playerNames?: Record<string, string>;
}

type IGameWinHistory = IBestOfOneHistory | IBestOfThreeHistory;

export interface LobbyUserWrapper extends LobbySpectatorWrapper {
    ready: boolean;
    deck?: Deck;
    deckValidationErrors?: IDeckValidationFailures;
    importDeckValidationErrors?: IDeckValidationFailures;
    reportedBugs: number;
}

export enum MatchmakingType {
    PublicLobby = 'publicLobby',
    PrivateLobby = 'privateLobby',
    Quick = 'quick',
}

export enum StatsSource {
    Karabast = 'Karabast',
    SwuStats = 'SWUStats'
}

export enum StatsSaveStatus {
    Warning = 'Warning',
    Error = 'Error',
    Success = 'Success'
}
export interface IStatsMessageFormat {
    type: StatsSaveStatus;
    source: StatsSource;
    message: string;
}

export interface RematchRequest {
    initiator?: string;
    mode: RematchMode;
}

export class Lobby {
    private static readonly MaxGameMessageErrors = 100;

    private readonly _id: string;
    private readonly _lobbyName: string;
    public readonly isPrivate: boolean;
    private readonly connectionLink?: string;
    private readonly gameChat: GameChat;
    private readonly cardDataGetter: CardDataGetter;
    private readonly deckValidator: DeckValidator;
    private readonly testGameBuilder?: any;
    private readonly server: GameServer;
    private readonly lobbyCreateTime: Date = new Date();
    private readonly swuStatsEnabled: boolean = true;
    private readonly discordDispatcher: DiscordDispatcher;
    private readonly previousAuthenticatedStatusByUser = new Map<string, boolean>();
    private readonly allow30CardsInMainBoard: boolean;

    // configurable lobby properties
    private undoMode: UndoMode = UndoMode.Disabled;

    private game?: Game;
    public users: LobbyUserWrapper[] = [];
    public spectators: LobbySpectatorWrapper[] = [];
    private lobbyOwnerId: string;
    public userWhoMutedChat: string;
    public matchmakingType: MatchmakingType;
    public gameFormat: SwuGameFormat;
    private rematchRequest?: RematchRequest = null;
    private userLastActivity = new Map<string, Date>();
    private matchingCountdownText?: string;
    private matchingCountdownTimeoutHandle?: NodeJS.Timeout;
    private usersLeftCount = 0;
    private gameMessageErrorCount = 0;
    private statsUpdateStatus = new Map<string, Map<StatsSource, IStatsMessageFormat>>();

    private winHistory: IGameWinHistory;
    private bo3NextGameConfirmedBy?: Set<string>;
    private bo3TransitionTimer?: NodeJS.Timeout;
    private bo3LobbyReadyTimer?: SimpleActionTimer;
    private bo3LobbyLoadedAt?: Date;

    public constructor(
        lobbyName: string,
        matchmakingType: MatchmakingType,
        gameFormat: SwuGameFormat,
        gamesToWinMode: GamesToWinMode,
        allow30CardsInMainBoard: boolean,
        cardDataGetter: CardDataGetter,
        deckValidator: DeckValidator,
        gameServer: GameServer,
        discordDispatcher: DiscordDispatcher,
        testGameBuilder?: any
    ) {
        Contract.assertTrue(
            [MatchmakingType.PublicLobby, MatchmakingType.PrivateLobby, MatchmakingType.Quick].includes(matchmakingType),
            `Lobby game type ${matchmakingType} doesn't match any MatchmakingType values`
        );
        this._id = uuid();
        this._lobbyName = lobbyName || `Game #${this._id.substring(0, 6)}`;
        this.gameChat = new GameChat(() => this.sendLobbyState());
        this.connectionLink = matchmakingType !== MatchmakingType.Quick ? this.createLobbyLink() : null;
        this.isPrivate = matchmakingType === MatchmakingType.PrivateLobby;
        this.matchmakingType = matchmakingType;
        this.cardDataGetter = cardDataGetter;
        this.testGameBuilder = testGameBuilder;
        this.deckValidator = deckValidator;
        this.gameFormat = gameFormat;
        this.server = gameServer;
        this.discordDispatcher = discordDispatcher;
        this.undoMode = matchmakingType === MatchmakingType.PrivateLobby ? UndoMode.Free : UndoMode.Request;
        this.allow30CardsInMainBoard = allow30CardsInMainBoard;

        switch (gamesToWinMode) {
            case GamesToWinMode.BestOfOne:
                this.setBo1History();
                break;
            case GamesToWinMode.BestOfThree:
                this.initializeBo3History();
                break;
            default:
                Contract.fail(`Invalid games to win mode: ${gamesToWinMode}`);
        }
    }

    public get id(): string {
        return this._id;
    }

    public get name(): string {
        return this._lobbyName;
    }

    public get format(): SwuGameFormat {
        return this.gameFormat;
    }

    public get gamesToWinMode(): GamesToWinMode {
        return this.winHistory.gamesToWinMode;
    }

    public get queueFormatKey(): IQueueFormatKey {
        return { swuFormat: this.format, gamesToWinMode: this.gamesToWinMode };
    }

    private get useActionTimers(): boolean {
        return (
            (this.matchmakingType === MatchmakingType.Quick || this.matchmakingType === MatchmakingType.PublicLobby) &&
            (process.env.ENVIRONMENT !== 'development' || process.env.USE_LOCAL_ACTION_TIMER === 'true')
        );
    }

    private setBo1History(winnerId?: string): void {
        this.winHistory = {
            gamesToWinMode: GamesToWinMode.BestOfOne,
            lastWinnerId: winnerId
        };
    }

    private initializeBo3History(bo1WinnerId?: string): void {
        this.winHistory = {
            gamesToWinMode: GamesToWinMode.BestOfThree,
            currentGameNumber: bo1WinnerId ? 2 : 1,
            winnerIdsInOrder: bo1WinnerId ? [bo1WinnerId] : []
        };

        this.bo3NextGameConfirmedBy = new Set<string>();
        this.initializeBo3LobbyReadyTimer();
    }

    /**
     * Counts wins per player from an array of winner IDs.
     * @param winnerIds Array of player IDs who won each game, or 'draw' for drawn games
     * @returns Record mapping player IDs to their win counts
     */
    private countWinsPerPlayer(winnerIds: (string | 'draw')[]): Record<string, number> {
        const winsPerPlayer: Record<string, number> = {};
        for (const winnerId of winnerIds) {
            if (winnerId !== 'draw') {
                winsPerPlayer[winnerId] = (winsPerPlayer[winnerId] || 0) + 1;
            }
        }
        return winsPerPlayer;
    }

    /**
     * Get win history data formatted for the frontend client
     */
    private getWinHistoryForClient() {
        if (this.winHistory.gamesToWinMode === GamesToWinMode.BestOfOne) {
            return {
                gamesToWinMode: this.winHistory.gamesToWinMode,
                lastWinnerId: this.winHistory.lastWinnerId
            };
        }

        // Bo3 mode
        const winsPerPlayer = this.countWinsPerPlayer(this.winHistory.winnerIdsInOrder);

        // Ensure all players are included in winsPerPlayer, even if they have 0 wins
        if (this.winHistory.playerNames) {
            for (const playerId of Object.keys(this.winHistory.playerNames)) {
                if (!(playerId in winsPerPlayer)) {
                    winsPerPlayer[playerId] = 0;
                }
            }
        }

        // Dynamically determine setEndResult based on current win counts (supports undo scenarios)
        // If someone has 2 wins, the set is won - return WonTwoGames result
        // Otherwise, use the stored setEndResult (which may indicate concede/timeout)
        const hasWinner = Object.values(winsPerPlayer).some((wins) => wins >= 2);
        const setEndResult = hasWinner
            ? { endedReason: Bo3SetEndedReason.WonTwoGames }
            : this.winHistory.setEndResult;

        return {
            gamesToWinMode: this.winHistory.gamesToWinMode,
            currentGameNumber: this.winHistory.currentGameNumber,
            winsPerPlayer,
            setEndResult,
            playerNames: this.winHistory.playerNames
        };
    }

    public getLobbyState(user?: LobbyUserWrapper): any {
        return {
            id: this._id,
            lobbyName: this._lobbyName,
            users: this.users.map((u) => this.buildLobbyUserData(u, user?.id === u.id)),
            spectators: this.spectators.map((s) => ({
                id: s.id,
                username: s.username,
            })),
            gameOngoing: !!this.game,
            gameChat: this.gameChat,
            lobbyOwnerId: this.lobbyOwnerId,
            isPrivate: this.isPrivate,
            connectionLink: this.connectionLink,
            gameType: this.matchmakingType,
            userWhoMutedChat: this.userWhoMutedChat,
            gameFormat: this.gameFormat,
            rematchRequest: this.rematchRequest,
            matchingCountdownText: this.matchingCountdownText,
            allow30CardsInMainBoard: this.allow30CardsInMainBoard,
            winHistory: this.getWinHistoryForClient(),
            hasConfirmedNextGame: this.gamesToWinMode === GamesToWinMode.BestOfThree && user
                ? this.bo3NextGameConfirmedBy?.has(user.id) ?? false
                : undefined,
            sideboardTimeoutStatus: this.bo3LobbyReadyTimer?.timeRemainingStatus,
            settings: {
                requestUndo: this.undoMode === UndoMode.Request,
            },
        };
    }

    private buildLobbyUserData(user: LobbyUserWrapper, fullData = false) {
        const authenticatedStatus = user.socket?.user.isDevTestUser() || user.socket?.user.isAuthenticatedUser();

        const previousAuthenticatedStatus = this.previousAuthenticatedStatusByUser.get(user.id);
        if (previousAuthenticatedStatus != null && previousAuthenticatedStatus !== authenticatedStatus) {
            const prevAuthProps = { authenticated: previousAuthenticatedStatus, username: user.username };
            const newAuthProps = { authenticated: authenticatedStatus, username: user.socket.user.getUsername() };

            logger.warn(`Lobby: user ${user.id} authentication status changed. Previous value: ${JSON.stringify(prevAuthProps)}, new value: ${JSON.stringify(newAuthProps)}`, { lobbyId: this.id, userId: user.id });
        }

        this.previousAuthenticatedStatusByUser.set(user.id, authenticatedStatus);

        const basicData = {
            id: user.id,
            username: user.username,
            state: user.state,
            ready: user.ready,
            authenticated: authenticatedStatus,
            chatDisabled: user.socket?.user.getModeration()?.moderationType === ModerationType.Mute || user.id === this.userWhoMutedChat,
        };

        const extendedData = fullData ? {
            deck: user.deck?.getDecklist(),
            reportedBugs: user.reportedBugs,
            deckErrors: user.deckValidationErrors,
            importDeckErrors: user.importDeckValidationErrors,
            unimplementedCards: this.deckValidator.getUnimplementedCardsInDeck(user.deck?.getDecklist()),
            minDeckSize: user.deck?.base.id ? this.deckValidator.getMinimumSideboardedDeckSize(user.deck?.base.id, this.allow30CardsInMainBoard) : 50,
            maxSideBoard: this.deckValidator.getMaxSideboardSize(this.format),
        } : {
            deck: user.deck?.getLeaderBase(),
        };

        return { ...basicData, ...extendedData };
    }


    public getLastActivityForUser(userId: string): Date | null {
        return this.userLastActivity.get(userId);
    }

    private createLobbyLink(): string {
        return process.env.ENVIRONMENT === 'development'
            ? `http://localhost:3000/lobby?lobbyId=${this._id}`
            : `https://karabast.net/lobby?lobbyId=${this._id}`;
    }

    private updateUserLastActivity(id: string): void {
        // if we received a message we know the user is connected
        this.getUser(id).state = 'connected';

        const now = new Date();
        this.userLastActivity.set(id, now);

        if (this.game) {
            this.game.onPlayerAction(id);
        }
    }

    public hasPlayer(id: string) {
        return this.users.some((u) => u.id === id);
    }

    public createLobbyUser(user: User, decklist = null): void {
        const existingUser = this.users.find((u) => u.id === user.getId());
        const deck = decklist ? new Deck(decklist, this.cardDataGetter) : null;
        if (existingUser) {
            existingUser.deck = deck;
            return;
        }
        this.users.push(({
            id: user.getId(),
            username: user.getUsername(),
            state: null,
            ready: false,
            socket: null,
            deckValidationErrors: deck
                ? this.deckValidator.validateInternalDeck(deck.getDecklist(), { format: this.gameFormat, allow30CardsInMainBoard: this.allow30CardsInMainBoard })
                : {},
            deck,
            reportedBugs: 0,
            lastMessageOffset: 0
        }));
        logger.info(`Lobby: creating username: ${user.getUsername()}, id: ${user.getId()} and adding to users list (${this.users.length} user(s))`, { lobbyId: this.id, userName: user.getUsername(), userId: user.getId() });
        this.gameChat.addMessage(`${user.getUsername()} has created and joined the lobby`);

        this.updateUserLastActivity(user.getId());
    }

    public addSpectator(user: User, socket: Socket): void {
        const existingSpectator = this.spectators.find((s) => s.id === user.getId());
        const existingPlayer = this.users.find((s) => s.id === user.getId());
        if (existingPlayer) {
            // we remove the player and disconnect since the user should not come here
            this.removeUser(user.getId());
            socket.disconnect();
            return;
        }
        if (!existingSpectator) {
            this.spectators.push({
                id: user.getId(),
                username: user.getId(),
                socket,
                user: socket.user,
                state: 'connected',
                lastMessageOffset: 0
            });
        } else {
            existingSpectator.state = 'connected';
            this.checkUpdateSocket(existingSpectator, socket);
        }
        // If game is ongoing, send the current state to the spectator
        if (this.game) {
            this.sendGameStateToSpectator(socket, user.getId());
        } else {
            this.sendLobbyStateToSpectator(socket);
        }
        logger.info(`Lobby: adding spectator: ${user.getUsername()}, id: ${user.getId()} (${this.spectators.length} spectator(s))`, { lobbyId: this.id, userName: user.getUsername(), userId: user.getId() });
    }

    private checkUpdateSocket(user: LobbyUserWrapper | LobbySpectatorWrapper, socket: Socket): void {
        // clean up disconnect handlers on the old socket before removing it
        if (user.socket && user.socket.id !== socket.id) {
            user.socket.removeEventsListeners(['disconnect']);
            user.socket.disconnect();
        }
        user.socket = socket;
    }

    public removeSpectator(id: string): void {
        const spectator = this.spectators.find((s) => s.id === id);
        if (!spectator) {
            // TODO: re-add this if we want to start doing verbose logging
            // logger.info(`Attempted to remove spectator from Lobby ${this.id}, but they were not found`);
            return;
        }
        this.spectators = this.spectators.filter((s) => s.id !== id);
        logger.info(`Lobby: removing spectator: ${spectator.username}, id: ${spectator.id}. Spectator count = ${this.spectators.length}`, { lobbyId: this.id, userName: spectator.username, userId: spectator.id });
        this.sendLobbyState();
    }

    public async addLobbyUserAsync(user: User, socket: Socket): Promise<void> {
        const existingUser = this.users.find((u) => u.id === user.getId());
        const existingSpectator = this.spectators.find((s) => s.id === user.getId());
        if (existingSpectator) {
            // we remove the spectator and disconnect since the user should not come here
            this.removeSpectator(user.getId());
            socket.disconnect();
            return Promise.resolve();
        }

        Contract.assertFalse(!existingUser && this.isFilled(), `Attempting to add user ${user.getId()} to lobby ${this.id}, but the lobby already has ${this.users.length} users`);

        // we check if listeners for the events already exist
        if (socket.eventContainsListener('game') || socket.eventContainsListener('lobby')) {
            socket.removeEventsListeners(['game', 'lobby']);
        }

        socket.registerEvent('game', (socket, command, ...args) => this.onGameMessage(socket, command, ...args));
        socket.registerEvent('lobby', (socket, command, ...args) => this.onLobbyMessage(socket, command, ...args));

        if (existingUser) {
            existingUser.state = 'connected';
            this.checkUpdateSocket(existingUser, socket);
            logger.info(`Lobby: setting state to connected for existing user ${user.getId()} with socket id ${socket.id}`, { lobbyId: this.id, userName: user.getUsername(), userId: user.getId() });
        } else {
            this.users.push({
                id: user.getId(),
                username: user.getUsername(),
                state: 'connected',
                ready: false,
                socket,
                user: socket.user,
                reportedBugs: 0,
                lastMessageOffset: 0
            });
            logger.info(`Lobby: adding username: ${user.getUsername()}, id: ${user.getId()}, socket id: ${socket.id} to users list (${this.users.length} user(s))`, { lobbyId: this.id, userName: user.getUsername(), userId: user.getId() });
            this.gameChat.addMessage(`${user.getUsername()} has joined the lobby`);
        }

        this.updateUserLastActivity(user.getId());

        // if the game is already going, send lobby and game state and stop here
        if (this.game) {
            this.sendLobbyState();
            this.sendGameState(this.game);
            return Promise.resolve();
        }

        if (this.matchmakingType === MatchmakingType.Quick) {
            if (!socket.eventContainsListener('requeue')) {
                socket.registerEvent(
                    'requeue',
                    () => {
                        if (!existingUser?.deck || !existingUser.deck.originalDeckList) {
                            logger.error(`Lobby: Cannot requeue user ${user.getId()} - no deck found`, { lobbyId: this.id, userId: user.getId() });
                            socket.send('connection_error', 'Unable to requeue: deck not found');
                            return;
                        }
                        this.server.requeueUser(socket, this.queueFormatKey, user, existingUser.deck.originalDeckList);
                    }
                );
            }

            if (this.matchingCountdownTimeoutHandle == null) {
                await this.quickLobbyCountdownAsync();
            }

            this.sendLobbyState();

            return Promise.resolve();
        }

        // do a check to make sure that the lobby owner is still registered in the lobby. if not, set the incoming user as the new lobby owner.
        if (this.server.getUserLobbyId(this.lobbyOwnerId) !== this.id) {
            logger.warn(`Lobby: owner ${this.lobbyOwnerId} is not in the lobby, setting new lobby owner to ${user.getId()}`, { lobbyId: this.id, userName: user.getUsername(), userId: user.getId() });
            this.removeUser(this.lobbyOwnerId);
            this.lobbyOwnerId = user.getId();
        }

        this.sendLobbyState();

        return Promise.resolve();
    }

    private quickLobbyCountdownAsync(remainingSeconds = 5) {
        if (remainingSeconds > -1) {
            this.matchingCountdownText = `Starts in ${remainingSeconds}`;
        } else if (remainingSeconds > -4) {
            this.matchingCountdownText = 'Waiting for opponent to connect...';

            if (this.users.length === 2 && this.users.every((u) => u.state === 'connected')) {
                return this.startGameAsync();
            }

            this.sendLobbyState(true);
        } else {
            logger.warn('Lobby: both users failed to connect within 3s, removing lobby and requeuing users', { lobbyId: this.id });
            this.server.removeLobby(this);
            return Promise.resolve();
        }

        this.matchingCountdownTimeoutHandle =
            this.buildSafeTimeout(() => this.quickLobbyCountdownAsync(remainingSeconds - 1), 1000, 'Lobby: error during quick lobby countdown');

        this.sendLobbyState(true);
        return Promise.resolve();
    }

    private async setReadyStatus(socket: Socket, ...args) {
        Contract.assertTrue(args.length === 1 && typeof args[0] === 'boolean', 'Ready status arguments aren\'t boolean or present');
        const currentUser = this.users.find((u) => u.id === socket.user.getId());
        if (!currentUser) {
            return;
        }
        currentUser.ready = args[0];
        logger.info(`Lobby: user ${currentUser.username} set ready status: ${args[0]}`, { lobbyId: this.id, userName: currentUser.username, userId: currentUser.id });
        this.gameChat.addAlert(AlertType.ReadyStatus, `${currentUser.username} is ${args[0] ? 'ready to start' : 'not ready to start'}`);
        this.updateUserLastActivity(currentUser.id);

        // For Bo3 games after game 1, manage the lobby ready timer based on ready state
        this.manageBo3LobbyReadyTimer();

        // For Bo3 games after game 1, automatically start when both players are ready
        if (
            this.winHistory.gamesToWinMode === GamesToWinMode.BestOfThree &&
            this.winHistory.currentGameNumber > 1 &&
            this.users.length === 2 &&
            this.users.every((u) => u.ready)
        ) {
            await this.startGameAsync();
        }
    }

    /**
     * Manages the Bo3 lobby ready timer based on player ready state.
     * - Starts the timer when the first player readies up
     * - Stops the timer if both players become unready
     * - Timer duration is dynamic: default 30s, but guarantees minimum 60s from lobby load
     */
    private manageBo3LobbyReadyTimer(): void {
        if (
            this.winHistory.gamesToWinMode !== GamesToWinMode.BestOfThree ||
            this.winHistory.currentGameNumber <= 1 ||
            !this.bo3LobbyReadyTimer
        ) {
            return;
        }

        const readyCount = this.users.filter((u) => u.ready).length;

        if (readyCount === 0 && this.bo3LobbyReadyTimer.isRunning) {
            // Both players unready - stop the timer
            this.bo3LobbyReadyTimer.stop();
            this.gameChat.addAlert(AlertType.Notification, 'Timer stopped. It will be reset when a player is ready.');
            logger.info('Lobby: Bo3 lobby ready timer stopped - no players ready', { lobbyId: this.id });
        } else if (readyCount === 1 && !this.bo3LobbyReadyTimer.isRunning) {
            // First player ready - calculate dynamic timer duration
            // Default: 30 seconds, but guarantee minimum 120 seconds from lobby load
            const defaultDurationSeconds = 30;
            const minimumTotalSeconds = 120;
            const elapsedSeconds = this.bo3LobbyLoadedAt
                ? Math.floor((Date.now() - this.bo3LobbyLoadedAt.getTime()) / 1000)
                : 0;
            const timerDurationSeconds = Math.max(defaultDurationSeconds, minimumTotalSeconds - elapsedSeconds);

            this.bo3LobbyReadyTimer.start(timerDurationSeconds);
            this.gameChat.addAlert(AlertType.Warning, `Timer started because a player has readied. Both players must be readied within ${timerDurationSeconds} seconds.`);
            logger.info(`Lobby: Bo3 lobby ready timer started with ${timerDurationSeconds}s - first player ready`, { lobbyId: this.id, elapsedSeconds, timerDurationSeconds });
        }

        this.sendLobbyState();
    }

    private sendChatMessage(socket: Socket, ...args) {
        const existingUser = this.users.find((u) => u.id === socket.user.getId());
        Contract.assertNotNullLike(existingUser, `Unable to find user with id ${socket.user.getId()} in lobby ${this.id}`);
        Contract.assertTrue(args.length === 1 && typeof args[0] === 'string', 'Chat message arguments are not present or not of type string');
        if (!existingUser) {
            return;
        }

        this.gameChat.addChatMessage(existingUser, args[0]);
        this.sendLobbyState();
    }

    private muteChat(socket: Socket): void {
        this.userWhoMutedChat = socket.user.getId();
        this.sendLobbyState();
    }

    private requestRematch(socket: Socket, ...args: any[]): void {
        Contract.assertTrue(args.length === 1, 'Expected rematch mode argument but argument length is: ' + args.length);

        // Convert and validate the mode is a valid RematchMode value (throws if invalid)
        const mode = EnumHelpers.checkConvertToEnum(args[0], RematchMode)[0];

        // Validate mode transitions based on current game mode
        switch (this.gamesToWinMode) {
            case GamesToWinMode.BestOfOne:
                Contract.assertTrue(mode === RematchMode.Regular || mode === RematchMode.Reset || mode === RematchMode.Bo1ConvertToBo3);
                break;
            case GamesToWinMode.BestOfThree:
                // Bo3 mode - only NewBo3 is allowed for rematch (regular/reset should use proceedToNextBo3Game)
                Contract.assertTrue(mode === RematchMode.NewBo3);
                break;
            default:
                Contract.fail(`Unknown games to win mode: ${this.gamesToWinMode}`);
        }

        const user = this.getUser(socket.user.getId());

        // Set the rematch request property (allow only one request at a time)
        if (!this.rematchRequest) {
            this.rematchRequest = {
                initiator: user.id,
                mode,
            };
            logger.info(`Lobby: user ${socket.user.getId()} requested a rematch (${mode})`, { lobbyId: this.id, userName: user.username, userId: user.id });

            let alertMessage: string;
            switch (mode) {
                case RematchMode.Reset:
                    alertMessage = `${user.username} has requested a quick rematch!`;
                    break;
                case RematchMode.Bo1ConvertToBo3:
                    alertMessage = `${user.username} has requested to convert to a best-of-three match!`;
                    break;
                case RematchMode.NewBo3:
                    alertMessage = `${user.username} has requested a new best-of-three match!`;
                    break;
                case RematchMode.Regular:
                    alertMessage = `${user.username} has requested a rematch!`;
                    break;
                default:
                    Contract.fail(`Unknown rematch mode: ${mode}`);
            }

            if (this.game) {
                this.game.addAlert(AlertType.Notification, alertMessage);
            } else {
                this.gameChat.addAlert(AlertType.Notification, alertMessage);
            }
        }
        this.sendLobbyState();
    }

    private rematch() {
        const mode = this.rematchRequest?.mode;

        // Clear the rematch request and reset the game.
        this.rematchRequest = null;
        this.game = null;
        if (this.matchmakingType === MatchmakingType.Quick) {
            this.matchmakingType = MatchmakingType.PublicLobby;
        }

        // Handle win history based on rematch mode
        switch (mode) {
            case RematchMode.Bo1ConvertToBo3: {
                // Convert Bo1 to Bo3, using previous winner as first game result
                Contract.assertTrue(this.winHistory.gamesToWinMode === GamesToWinMode.BestOfOne, 'Cannot convert to Bo3 from non-Bo1 mode');
                const previousWinnerId = this.winHistory.lastWinnerId;
                this.initializeBo3History(previousWinnerId);
                break;
            }
            case RematchMode.NewBo3:
                // Start a fresh Bo3 set
                this.initializeBo3History();
                this.resetSideboards();
                break;
            case RematchMode.Regular:
            case RematchMode.Reset:
                // Keep existing win history mode (Bo1 stays Bo1)
                // For Bo1, lastWinnerId is already set by handleGameEnd
                // Clear Bo3 confirmation tracking since we're staying in Bo1
                this.bo3NextGameConfirmedBy = undefined;
                break;
            case undefined:
                // No mode specified (shouldn't happen, but handle gracefully)
                break;
            default:
                Contract.fail(`Unknown rematch mode: ${mode}`);
        }

        // Clear the 'ready' state for all users.
        this.users.forEach((user) => {
            user.ready = false;
        });
        this.sendLobbyState();
    }

    /**
     * RPC method for proceeding to the next game in a Bo3 set.
     * Both players must call this method to confirm they are ready to proceed.
     * The winner is determined server-side from the game state.
     */
    private proceedToNextBo3Game(socket: Socket): void {
        Contract.assertTrue(this.gamesToWinMode === GamesToWinMode.BestOfThree);
        Contract.assertNotNullLike(this.game, 'Cannot proceed to next game when no game exists');
        Contract.assertTrue(this.game.finishedAt != null, 'Cannot proceed to next game when current game has not finished');
        Contract.assertNotNullLike(this.bo3NextGameConfirmedBy, 'Bo3 confirmation tracking not initialized');

        const userId = socket.user.getId();
        const user = this.getUser(userId);

        // Add this user to the confirmed set
        this.bo3NextGameConfirmedBy.add(userId);
        logger.info(`Lobby: user ${user.username} confirmed proceeding to next Bo3 game`, { lobbyId: this.id, userName: user.username, userId: user.id });

        // Send game message so opponent can see this player confirmed
        this.game.addMessage('{0} is ready to proceed to the next game.', this.game.getPlayerById(userId));

        // Check if both players have confirmed
        if (this.bo3NextGameConfirmedBy.size >= 2) {
            this.transitionToNextBo3Game('Both players confirmed');
        } else {
            this.gameChat.addAlert(AlertType.Notification, `${user.username} is ready for the next game.`);
            this.sendLobbyState();
        }
    }

    /**
     * Concedes the entire Bo3 set. If there's an active game, it will be conceded first.
     * This records the set as conceded by the player.
     */
    private concedeBo3(socket: Socket): void {
        const userId = socket.user.getId();
        this.concedeBo3ByUserId(userId);
    }

    /**
     * Core implementation for conceding a Bo3 set by user ID.
     * Can be called from RPC (via concedeBo3) or internally (e.g., from removeUser).
     */
    private concedeBo3ByUserId(userId: string): void {
        Contract.assertFalse(
            this.gamesToWinMode === GamesToWinMode.BestOfOne,
            'Cannot concede Bo3 set when in Bo1 mode'
        );
        Contract.assertTrue(this.winHistory.gamesToWinMode === GamesToWinMode.BestOfThree);

        const user = this.getUser(userId);

        // If there's an active game that hasn't finished, concede it first
        if (this.game && this.game.finishedAt == null) {
            this.game.concede(userId);
        }

        // Only mark as conceded if the set isn't already decided
        if (!this.winHistory.setEndResult) {
            // Record that this player conceded the set
            this.winHistory.setEndResult = {
                endedReason: Bo3SetEndedReason.Concede,
                concedingPlayerId: userId
            };
        }

        // Add message to game chat if game exists
        if (this.game) {
            this.game.gameChat.addMessage('{0} concedes the best-of-three set', this.game.getPlayerById(userId));
            this.sendGameState(this.game);
        } else {
            this.gameChat.addMessage(`${user.username} has conceded the set.`);
        }

        logger.info(`Lobby: user ${user.username} conceded the Bo3 set`, { lobbyId: this.id, userName: user.username, userId: user.id });

        this.sendLobbyState();
    }

    private resetSideboards() {
        for (const user of this.users) {
            if (user.deck) {
                user.deck.resetSideboard();
            }
        }
    }

    /**
     * Records the result of the current game into win history.
     * Reads winner from game.winnerNames (server-authoritative).
     * @param gamesToWinMode The game mode to record the result for
     */
    private recordGameResult(gamesToWinMode: GamesToWinMode): void {
        Contract.assertNotNullLike(this.game, 'Cannot record game result when no game exists');
        Contract.assertTrue(this.winHistory.gamesToWinMode === gamesToWinMode, `recordGameResult called with ${gamesToWinMode} but winHistory is ${this.winHistory.gamesToWinMode}`);

        const winnerNames = this.game.winnerNames;
        let winnerId: string | 'draw' | null = null;

        if (winnerNames.length > 1) {
            // Draw - both players' names are in winnerNames
            winnerId = 'draw';
        } else if (winnerNames.length === 1) {
            // Single winner - find the player ID by name
            const winnerName = winnerNames[0];
            const winner = this.game.getPlayers().find((p) => p.name === winnerName);
            Contract.assertNotNullLike(winner, `Could not find player with name ${winnerName}`);
            winnerId = winner.id;
        }

        switch (gamesToWinMode) {
            case GamesToWinMode.BestOfOne: {
                Contract.assertTrue(this.winHistory.gamesToWinMode === GamesToWinMode.BestOfOne);
                if (winnerId) {
                    this.winHistory.lastWinnerId = winnerId;
                    logger.info(`Lobby: Bo1 game ${winnerId === 'draw' ? 'ended in a draw' : `won by ${winnerId}`}`, { lobbyId: this.id });
                } else {
                    logger.warn('Lobby: Game finished but no winner names recorded', { lobbyId: this.id });
                }
                break;
            }
            case GamesToWinMode.BestOfThree: {
                Contract.assertTrue(this.winHistory.gamesToWinMode === GamesToWinMode.BestOfThree);
                if (winnerId) {
                    this.winHistory.winnerIdsInOrder.push(winnerId);
                    logger.info(`Lobby: Bo3 game ${this.winHistory.winnerIdsInOrder.length} ${winnerId === 'draw' ? 'ended in a draw' : `won by ${winnerId}`}`, { lobbyId: this.id });
                } else {
                    Contract.fail('Game finished but no winner names recorded');
                }
                break;
            }
            default:
                Contract.fail(`Unknown games to win mode: ${gamesToWinMode}`);
        }
    }

    private changeDeck(socket: Socket, ...args) {
        // Changing decks is not allowed after game 1 in a Bo3 set
        Contract.assertFalse(
            this.winHistory.gamesToWinMode === GamesToWinMode.BestOfThree && this.winHistory.currentGameNumber >= 2,
            'Changing decks is not allowed after game 1 in a Bo3 set'
        );

        const activeUser = this.users.find((u) => u.id === socket.user.getId());

        // we check if the deck is valid.
        const validationProperties: IDeckValidationProperties = { format: this.gameFormat, allow30CardsInMainBoard: this.allow30CardsInMainBoard };
        activeUser.importDeckValidationErrors = this.deckValidator.validateSwuDbDeck(args[0], validationProperties);

        // if the deck doesn't have any errors that block import, set it as active
        const filteredErrors = DeckValidator.filterOutSideboardingErrors(activeUser.importDeckValidationErrors);
        if (Object.keys(filteredErrors).length === 0) {
            activeUser.deck = new Deck(args[0], this.cardDataGetter);
            activeUser.deckValidationErrors = this.deckValidator.validateInternalDeck(
                activeUser.deck.getDecklist(),
                validationProperties
            );

            // Track deck change for Bo1 first player selection
            if (this.winHistory.gamesToWinMode === GamesToWinMode.BestOfOne) {
                this.winHistory.deckChangedSinceLastGame = true;
            }
        }
        logger.info(`Lobby: user ${activeUser.username} changing deck`, { lobbyId: this.id, userName: activeUser.username, userId: activeUser.id });

        this.updateUserLastActivity(activeUser.id);
    }

    private updateDeck(socket: Socket, ...args) {
        // Sideboarding is only allowed after game 1 in a Bo3 set
        Contract.assertFalse(
            this.winHistory.gamesToWinMode === GamesToWinMode.BestOfThree && this.winHistory.currentGameNumber <= 1,
            'Sideboarding is not allowed before game 2 in a Bo3 set'
        );

        const source = args[0]; // [<'Deck'|'Sideboard>'<cardID>]
        const cardId = args[1];

        Contract.assertTrue(source === 'Deck' || source === 'Sideboard', `source isn't 'Deck' or 'Sideboard' but ${source}`);

        const user = this.getUser(socket.user.getId());
        const userDeck = user.deck;

        if (source === 'Deck') {
            userDeck.moveToSideboard(cardId);
        } else {
            userDeck.moveToDeck(cardId);
        }
        // check deck for deckValidationErrors
        const validationProperties: IDeckValidationProperties = { format: this.gameFormat, allow30CardsInMainBoard: this.allow30CardsInMainBoard };
        user.deckValidationErrors = this.deckValidator.validateInternalDeck(
            userDeck.getDecklist(),
            validationProperties
        );
        // we need to clear any importDeckValidation errors otherwise they can persist
        user.importDeckValidationErrors = null;

        logger.info(`Lobby: user ${user.username} updating deck`, { lobbyId: this.id, userName: user.username, userId: user.id });

        this.updateUserLastActivity(user.id);
    }

    private getUser(id: string) {
        const user = this.users.find((u) => u.id === id);
        Contract.assertNotNullLike(user, `Unable to find user with id ${id} in lobby ${this.id}`);
        return user;
    }

    public setUserDisconnected(id: string, socketId: string): void {
        const user = this.users.find((u) => u.id === id);
        if (user) {
            if (user.socket.id !== socketId) {
                return;
            }

            user.state = 'disconnected';
            user.lastMessageOffset = 0;
            logger.info(`Lobby: setting user ${user.username} to disconnected on socket id ${socketId}`, { lobbyId: this.id, userName: user.username, userId: user.id });
        }

        const spectator = this.spectators.find((u) => u.id === id);
        if (spectator) {
            if (spectator.socket.id !== socketId) {
                return;
            }

            spectator.state = 'disconnected';
            spectator.lastMessageOffset = 0;
            logger.info(`Lobby: setting spectator ${spectator.username} to disconnected on socket id ${socketId}`, { lobbyId: this.id, userName: spectator.username, userId: spectator.id });
        }
    }

    // TODO: right now "this.game === null" has a special meaning that this lobby already had a game and is either rematching or being
    // cleaned up. we need to refactor so that "null" doesn't have a special meaning separate from "undefined".
    public hasOngoingGame(): boolean {
        return this.game !== undefined;
    }

    public setLobbyOwner(id: string): void {
        this.lobbyOwnerId = id;
    }

    public getGamePreview() {
        if (!this.game) {
            return null;
        }
        try {
            if (this.users.length !== 2) {
                return null;
            }
            const player1 = this.users[0];
            const player2 = this.users[1];

            return {
                id: this.id,
                isPrivate: this.isPrivate,
                player1Leader: player1.deck.leader,
                player1Base: player1.deck.base,
                player2Leader: player2.deck.leader,
                player2Base: player2.deck.base,
            };
        } catch (error) {
            logger.error('Lobby: error retrieving lobby game data',
                { error: { message: error.message, stack: error.stack }, lobbyId: this.id });
            return null;
        }
    }

    public isDisconnected(id: string, socketId: string): boolean {
        const user = this.users.find((u) => u.id === id);
        if (user) {
            return user.socket?.id === socketId && user.state === 'disconnected';
        }
        const spectator = this.spectators.find((u) => u.id === id);
        return spectator?.socket?.id === socketId && spectator?.state === 'disconnected';
    }

    public isFilled(): boolean {
        return this.users.length >= 2;
    }

    public hasConnectedPlayer(): boolean {
        return this.users.some((u) => u.state === 'connected');
    }

    public removeUser(id: string): void {
        const user = this.users.find((u) => u.id === id);
        if (user) {
            this.gameChat.addMessage(`${user.username} has left the lobby`);
        } else {
            return;
        }

        // If we're in a Bo3 set and game 1 has started, concede the set for the leaving player (before removing them)
        // Players can freely leave before game 1 starts without forfeiting the set
        if (this.winHistory.gamesToWinMode === GamesToWinMode.BestOfThree && !this.winHistory.setEndResult) {
            const bo3SetHasStarted = this.winHistory.currentGameNumber > 1 || this.game != null;
            if (bo3SetHasStarted) {
                this.clearBo3TransitionTimer();
                this.bo3LobbyReadyTimer?.stop();
                this.concedeBo3ByUserId(id);
            }
        }

        // Record matchmaking entry for quick match to prevent immediate rematches (before removing user)
        this.tryRecordExpiringMatchmakingEntry(id);

        if (this.lobbyOwnerId === id) {
            const newOwner = this.users.find((u) => u.id !== id);
            this.lobbyOwnerId = newOwner?.id;
        }
        this.users = this.users.filter((u) => u.id !== id);
        logger.info(`Lobby: removing user ${user.username}, id: ${user.id}. User list size = ${this.users.length}`, { lobbyId: this.id, userName: user.username, userId: user.id });

        if (this.game) {
            this.game.addMessage('{0} has left the game', this.game.getPlayerById(id));
            const otherPlayer = this.users.find((u) => u.id !== id);
            if (otherPlayer) {
                this.game.endGame(this.game.getPlayerById(otherPlayer.id), GameEndReason.PlayerLeft);
            }
            this.sendGameState(this.game);
        }

        if (!this.game) {
            this.checkIncrementUsersLeftCount();
        }

        this.sendLobbyState();
    }

    private checkIncrementUsersLeftCount() {
        this.usersLeftCount++;
        if (this.usersLeftCount > 4) {
            const minutesSinceLobbyCreation = Math.floor((new Date().getTime() - this.lobbyCreateTime.getTime()) / 1000 / 60);

            if (minutesSinceLobbyCreation >= 5) {
                logger.warn(`Lobby: cleaning lobby ${this.id} after more than 5 minutes of inactivity and 5 users left`, { lobbyId: this.id });
                this.server.removeLobby(this, 'Lobby timed out');
            }
        }
    }


    public isEmpty(): boolean {
        return this.users.length === 0;
    }

    /**
     * Records a matchmaking entry if this is a quick match, to prevent immediate rematches.
     * Uses the current time as the entry timestamp.
     */
    private tryRecordExpiringMatchmakingEntry(leavingPlayerId: string): void {
        if (this.matchmakingType !== MatchmakingType.Quick) {
            return;
        }

        const otherPlayer = this.users.find((u) => u.id !== leavingPlayerId);
        if (!otherPlayer) {
            return;
        }

        this.server.recordExpiringMatchmakingEntry(leavingPlayerId, otherPlayer.id, Date.now());
    }

    public cleanLobby(): void {
        this.clearBo3TransitionTimer();
        this.bo3LobbyReadyTimer?.stop();
        this.game = null;
        this.users = [];
        this.spectators = [];
        logger.info('Lobby: cleaning lobby', { lobbyId: this.id });
    }

    public async startTestGameAsync(filename: string) {
        const testJSONPath = path.resolve(__dirname, `../../../test/gameSetups/${filename}`);
        Contract.assertTrue(fs.existsSync(testJSONPath), `Test game setup file ${testJSONPath} doesn't exist`);

        const setupData = JSON.parse(fs.readFileSync(testJSONPath, 'utf8'));
        if (setupData.autoSingleTarget == null) {
            setupData.autoSingleTarget = false;
        }

        Contract.assertNotNullLike(this.testGameBuilder, `Attempting to start a test game from file ${filename} but local test tools were not found`);

        // TODO to address this a refactor and change router to lobby
        // eslint-disable-next-line
        const router = this;

        const game: Game = await this.testGameBuilder.setUpTestGameAsync(
            setupData,
            this.cardDataGetter,
            router,
            { id: 'exe66', username: 'Order66' },
            { id: 'th3w4y', username: 'ThisIsTheWay' },
            UndoMode.Free
        );

        this.game = game;

        for (const player of this.game.getPlayers()) {
            const userWrapper = this.getUser(player.user.id);
            userWrapper.deck = player.lobbyDeck;

            logger.info(`Test deck synchronized for user: ${userWrapper.username}`);
        }
    }

    private async startGameAsync() {
        try {
            this.bo3LobbyReadyTimer?.stop();
            this.rematchRequest = null;
            this.statsUpdateStatus.clear();

            // Reset message tracking for all clients on new game
            for (const user of this.users) {
                user.lastMessageOffset = 0;
            }
            for (const spectator of this.spectators) {
                spectator.lastMessageOffset = 0;
            }

            const game = new Game(this.buildGameSettings(), { router: this });
            this.game = game;
            game.started = true;

            logger.info(`Lobby: starting game id: ${game.id}`, { lobbyId: this.id });

            // Initialize playerNames for Bo3 when game 1 starts (captures players before anyone can leave)
            if (this.winHistory.gamesToWinMode === GamesToWinMode.BestOfThree && this.winHistory.currentGameNumber === 1) {
                this.winHistory.playerNames = {};
                for (const user of this.users) {
                    this.winHistory.playerNames[user.id] = user.username;
                }
            }

            // Give each user the standard disconnect handler (longer timeout than during matchmaking)
            this.users.forEach((user) => {
                this.server.registerDisconnect(user.socket, user.id);
            });

            // For each user, if they have a deck, select it in the game
            this.users.forEach((user) => {
                Contract.assertNotNullLike(user.deck, `User ${user.id} doesn't have a deck assigned at game start for lobby ${this.id}`);
                game.selectDeck(user.id, user.deck);
                game.attachLobbyUser(user.id, user.socket.user);
            });
            await game.initialiseAsync();
            this.sendLobbyState(true);
            this.sendGameState(game);
        } catch (error) {
            if (this.matchmakingType === MatchmakingType.Quick) {
                logger.error(
                    'Lobby: error attempting to start matchmaking lobby, cancelling and requeueing users',
                    { error: { message: error.message, stack: error.stack }, lobbyId: this.id }
                );
                this.matchmakingFailed(error);

                this.discordDispatcher?.formatAndSendGameStartErrorAsync(
                    'Game failed to start, lobby closed',
                    error,
                    this.id,
                    this.gameFormat,
                    this.matchmakingType
                ).catch((e) => {
                    logger.error('Lobby: error sending game start error to discord', { error: { message: e.message, stack: e.stack }, lobbyId: this.id });
                });
            }
        }
    }

    private matchmakingFailed(error?: Error) {
        this.server.removeLobby(this);

        for (const user of this.users) {
            // this will end up resolving to a call to GameServer.requeueUser, putting them back in the queue
            user.socket.send('matchmakingFailed', error.message);
        }
    }

    /**
     * Determines which player should get to choose who starts with initiative.
     * Returns the player ID of the loser of the previous game, or null for random selection.
     */
    private determineFirstPlayer(): string | null {
        switch (this.winHistory.gamesToWinMode) {
            case GamesToWinMode.BestOfThree: {
                Contract.assertTrue(this.winHistory.gamesToWinMode === GamesToWinMode.BestOfThree);

                // Game 1 of Bo3: random
                if (this.winHistory.currentGameNumber <= 1) {
                    return null;
                }

                // Game 2+: find the most recent non-draw game's loser
                for (let i = this.winHistory.winnerIdsInOrder.length - 1; i >= 0; i--) {
                    const winnerId = this.winHistory.winnerIdsInOrder[i];
                    if (winnerId !== 'draw') {
                        // Return the loser (the other player)
                        const loser = this.users.find((u) => u.id !== winnerId);
                        return loser?.id ?? null;
                    }
                }

                // All prior games were draws: random
                return null;
            }
            case GamesToWinMode.BestOfOne: {
                Contract.assertTrue(this.winHistory.gamesToWinMode === GamesToWinMode.BestOfOne);
                const bo1History = this.winHistory;

                // No previous game: random
                if (!bo1History.lastWinnerId) {
                    return null;
                }

                // Deck changed since last game: random (and reset the flag)
                if (bo1History.deckChangedSinceLastGame) {
                    bo1History.deckChangedSinceLastGame = false;
                    return null;
                }

                // Rematch with no deck change: loser of previous game
                const loser = this.users.find((u) => u.id !== bo1History.lastWinnerId);
                return loser?.id ?? null;
            }
            default:
                Contract.fail(`Unknown games to win mode: ${(this.winHistory as IGameWinHistory).gamesToWinMode}`);
        }
    }

    private buildGameSettings(): GameConfiguration {
        const players: IUser[] = this.users.map((user) =>
            getUserWithDefaultsSet({
                id: user.id,
                username: user.username,
                settings: {
                    optionSettings: {
                        autoSingleTarget: false,
                    }
                },
                cosmetics: user.socket.user.getPreferences()?.cosmetics,
            })
        );

        return {
            id: uuidv4(),
            allowSpectators: false,
            owner: 'Order66',
            gameMode: GameMode.Premier,
            players,
            undoMode: this.undoMode,
            cardDataGetter: this.cardDataGetter,
            useActionTimer: this.useActionTimers,
            preselectedFirstPlayerId: this.determineFirstPlayer(),
            pushUpdate: () => this.sendGameState(this.game),
            buildSafeTimeout: (callback: () => void, delayMs: number, errorMessage: string) =>
                this.buildSafeTimeout(callback, delayMs, errorMessage),
            userTimeoutDisconnect: (userId: string) => this.userTimeoutDisconnect(userId),
        };
    }

    private userTimeoutDisconnect(userId: string) {
        const socket = this.users.find((u) => u.id === userId)?.socket;

        Contract.assertNotNullLike(socket, `Unable to find socket for user ${userId} in lobby ${this.id} while attempting to disconnect`);

        socket.socket.data.forceDisconnect = true;

        socket.send('inactiveDisconnect');
        socket.disconnect();

        this.server.handleIntentionalDisconnect(userId, false, this);

        logger.info(`Lobby: user ${userId} was disconnected due to inactivity`, { lobbyId: this.id, userId });
    }

    private async onLobbyMessage(socket: Socket, command: string, ...args): Promise<void> {
        const start = process.hrtime.bigint();
        try {
            if (!this[command] || typeof this[command] !== 'function') {
                throw new Error(`Incorrect command or command format expected function but got: ${command}`);
            }

            this.updateUserLastActivity(socket.user.getId());
            await this[command](socket, ...args);
            this.sendLobbyState();
            const end = process.hrtime.bigint();
            const durationMs = Number(end - start) / 1e6;

            if (durationMs > 100) {
                logger.info('[Lobby] LobbyCommand took longer than 100ms to process', {
                    command,
                    userId: socket.user.getId(),
                    lobbyId: this.id,
                    durationMs: Number(durationMs.toFixed(2)),
                    timestamp: new Date().toISOString(),
                    promptType: this.game?.getPlayerById(socket.user.getId())?.promptState.promptType ?? 'null',
                });
            }
        } catch (error) {
            logger.error('Lobby: error processing lobby message', { error: { message: error.message, stack: error.stack }, lobbyId: this.id });
        }
    }

    private async onGameMessage(socket: Socket, command: string, ...args): Promise<void> {
        const start = process.hrtime.bigint();

        try {
            this.gameMessageErrorCount = 0;

            if (!this.game) {
                return;
            }

            this.updateUserLastActivity(socket.user.getId());

            // this command is a no-op since we reset the timer just above
            if (command === 'resetActionTimer') {
                return;
            }

            // Handle message retransmit requests from clients
            if (command === 'retransmitGameMessages') {
                this.retransmitGameMessages(socket, args[0], args[1]);
                return;
            }

            // if (command === 'leavegame') {
            //     return this.onLeaveGame(socket);
            // }

            if (!this.game[command] || typeof this.game[command] !== 'function') {
                return;
            }

            await this.game[command](socket.user.getId(), ...args);

            this.game.continue();

            this.sendGameState(this.game);

            const end = process.hrtime.bigint();
            const durationMs = Number(end - start) / 1e6;

            if (durationMs > 100) {
                logger.info('[Lobby] GameCommand took longer than 100ms to process', {
                    command,
                    userId: socket.user.getId(),
                    lobbyId: this.id,
                    durationMs: Number(durationMs.toFixed(2)),
                    timestamp: new Date().toISOString(),
                    promptType: this.game.getPlayerById(socket.user.getId())?.promptState.promptType ?? 'null',
                });
            }
        } catch (error) {
            logger.error('Game: error processing game message', { error: { message: error.message, stack: error.stack }, lobbyId: this.id });
        }
    }

    public handleMatchmakingDisconnect() {
        if (this.matchmakingType !== MatchmakingType.Quick) {
            logger.error('Lobby: attempting to use quick lobby disconnect on non-quick lobby', { lobbyId: this.id });
            return;
        }

        if (this.game) {
            return;
        }

        if (this.matchingCountdownTimeoutHandle) {
            clearTimeout(this.matchingCountdownTimeoutHandle);
        }

        this.matchingCountdownText = 'Opponent has disconnected, re-entering queue';
        this.sendLobbyState();

        this.buildSafeTimeout(() => {
            for (const user of this.users) {
                logger.error(`Lobby: requeueing user ${user.id} after matched user disconnected`);
                if (!user.deck || !user.deck.originalDeckList) {
                    logger.error(`Lobby: Cannot requeue user ${user.id} - no deck found`, { lobbyId: this.id, userId: user.id });
                    user.socket.send('connection_error', 'Unable to requeue: deck not found');
                    continue;
                }
                this.server.requeueUser(user.socket, this.queueFormatKey, user.socket.user, user.deck.originalDeckList);
                user.socket.send('matchmakingFailed', 'Player disconnected');
            }

            this.server.removeLobby(this);
        },
        2000, 'Lobby: error requeueing user after disconnect');
    }

    private buildSafeTimeout(callback: () => void, delayMs: number, errorMessage: string): NodeJS.Timeout {
        const timeout = setTimeout(() => {
            try {
                callback();
            } catch (error) {
                logger.error(errorMessage, { error: { message: error.message, stack: error.stack }, lobbyId: this.id });
            }
        }, delayMs);
        return timeout;
    }

    public handleError(game: Game, error: Error, severity = GameErrorSeverity.Normal) {
        logger.error('Lobby: handleError', { error: { message: error.message, stack: error.stack }, lobbyId: this.id });

        let maxErrorCountExceeded = false;

        this.gameMessageErrorCount++;
        if (this.gameMessageErrorCount > Lobby.MaxGameMessageErrors) {
            logger.error('Lobby: too many errors for request, halting', { lobbyId: this.id });
            severity = GameErrorSeverity.SevereHaltGame;
            maxErrorCountExceeded = true;
        }

        if (game && (severity === GameErrorSeverity.SevereGameMessageOnly || severity === GameErrorSeverity.SevereHaltGame)) {
            const discordMessage = maxErrorCountExceeded
                ? `Maximum error count ${Lobby.MaxGameMessageErrors} exceeded, game halted to prevent server crash`
                : 'Severe game error reported, game is in an unrecoverable state';

            const [player1Id, player2Id] = game.getPlayers().map((p) => p.id);

            const gameState = this.game.captureGameState(player1Id);
            this.discordDispatcher.formatAndSendServerErrorAsync(
                discordMessage,
                error,
                gameState,
                this.game.getLogMessages(),
                this.id,
                player1Id,
                player2Id,
                this.gameFormat,
                this.matchmakingType,
                this.game.gameStepsSinceLastUndo
            )
                .catch((e) => logger.error('Server error could not be sent to Discord: Unhandled error', { error: { message: e.message, stack: e.stack }, lobbyId: this.id }));

            game.addMessage(
                `A server error has occurred, apologies. Your game may now be in an inconsistent state, or you may be able to continue. The error has been reported to the dev team. If this happens again, please take a screenshot and reach out in the Karabast discord (game id ${this.id})`,
            );

            // send game state so that the message can be seen
            this.sendGameState(this.game);

            if (severity === GameErrorSeverity.SevereHaltGame) {
                // this is ugly since we're probably within an exception handler currently, but if we get here it's already crisis
                throw error;
            }
        }
    }

    public handleSerializationFailure(game: Game, error: Error): never {
        logger.error('Lobby: handleSerializationFailure', { error: { message: error.message, stack: error.stack }, lobbyId: this.id });

        const [player1Id, player2Id] = game.getPlayers().map((p) => p.id);

        const gameState = this.game.captureGameState(player1Id);

        this.discordDispatcher.formatAndSendServerErrorAsync(
            'Error during game state serialization, game is an unrecoverable state',
            error,
            gameState,
            this.game.getLogMessages(),
            this.id,
            player1Id,
            player2Id,
            this.gameFormat,
            this.matchmakingType,
            this.game.gameStepsSinceLastUndo
        )
            .catch((e) => logger.error('Server error could not be sent to Discord: Unhandled error', { error: { message: e.message, stack: e.stack }, lobbyId: this.id }));

        // send a failure game state to the players
        this.sendGameState(this.game);

        throw error;
    }

    /**
     * Public method to send a statsSubmitNotification message to a player.
     */
    public sendStatsMessageToUser(userId: string, messageParameters: IStatsMessageFormat) {
        // if the user doesn't exist in the lobby skip
        if (this.hasPlayer(userId)) {
            // we try/catch in the offchance the user disconnects after the if statement
            try {
                // cache update message in case we undo the game-end and end again
                if (this.statsUpdateStatus.has(userId)) {
                    this.statsUpdateStatus.get(userId).set(messageParameters.source, messageParameters);
                } else {
                    this.statsUpdateStatus.set(userId, new Map([[messageParameters.source, messageParameters]]));
                }

                this.getUser(userId).socket.send('statsSubmitNotification', messageParameters);
            } catch (error) {
                logger.error('(sendStatsMessageToUser): Error sending statsSubmitNotification', { error: { message: error.message, stack: error.stack }, lobbyId: this.id, userId });
                return;
            }
        }
    }

    /**
     * Private method to update a players stats on Karabast
     */
    private async updateKarabastPlayerStatsAsync(updatingPlayer: Player, opponentPlayer: Player, score: ScoreType): Promise<IStatsMessageFormat> {
        try {
            Contract.assertNotNullLike(updatingPlayer.lobbyDeck, `Updating player ${updatingPlayer.id} has no deck assigned at stats update time`);
            Contract.assertNotNullLike(opponentPlayer.lobbyDeck, `Opponent player ${opponentPlayer.id} has no deck assigned at stats update time`);

            if (!updatingPlayer.lobbyUser.isAuthenticatedUser()) {
                return { type: StatsSaveStatus.Warning,
                    source: StatsSource.Karabast,
                    message: 'deck stats can only be saved for logged-in users' };
            }
            if (!updatingPlayer.lobbyDeck.isPresentInDb) {
                return { type: StatsSaveStatus.Warning,
                    source: StatsSource.Karabast,
                    message: 'stats can only be updated for saved decks' };
            }

            // Get the deck service
            const opponentPlayerLeaderId = await this.cardDataGetter.getCardBySetCodeAsync(opponentPlayer.lobbyDeck.leader.id);
            const opponentPlayerBaseId = await this.cardDataGetter.getCardBySetCodeAsync(opponentPlayer.lobbyDeck.base.id);
            await this.server.deckService.updateDeckStatsAsync(
                updatingPlayer.lobbyUser.getId(),
                updatingPlayer.lobbyDeck.id,
                score,
                opponentPlayerLeaderId.internalName,
                opponentPlayerBaseId.internalName,
            );
            logger.info(`Lobby ${this.id}: Successfully updated deck stats in Karabast for game ${this.id}`, { lobbyId: this.id, userId: updatingPlayer.lobbyUser.getId() });
            return { type: StatsSaveStatus.Success,
                source: StatsSource.Karabast,
                message: 'deck stats successfully updated' };
        } catch (error) {
            logger.error(`Lobby ${this.id}: Error updating deck Karabast stats for a player:`, { error: { message: error.message, stack: error.stack }, lobbyId: this.id, userId: updatingPlayer.lobbyUser.getId() });
            return { type: StatsSaveStatus.Error,
                source: StatsSource.Karabast,
                message: 'an error occurred while updating stats' };
        }
    }


    /**
     * Private method to update a players SWU stats
     * @param sequenceNumber - For Bo3 games, indicates which game in the set (1, 2, or 3). Omitted for Bo1.
     */
    private async updatePlayerSWUStatsAsync(game: Game, player1: Player, player2: Player, sequenceNumber?: number): Promise<{ player1SwuStatsStatus: IStatsMessageFormat | null; player2SwuStatsStatus: IStatsMessageFormat | null }> {
        try {
            const swuStatsMessage = await this.server.swuStatsHandler.sendSWUStatsGameResultAsync(
                game,
                player1,
                player2,
                this.id,
                this.server,
                sequenceNumber,
            );
            // Success return message
            logger.info(`Lobby ${this.id}: Successfully updated deck SWUStats stats for game ${game.id}`, { lobbyId: this.id });
            return {
                player1SwuStatsStatus: player1.lobbyDeck.deckSource === DeckSource.SWUStats ? swuStatsMessage : null,
                player2SwuStatsStatus: player2.lobbyDeck.deckSource === DeckSource.SWUStats ? swuStatsMessage : null
            };
        } catch (error) {
            // return error stat message for SWUStats
            logger.error(`Lobby ${this.id}: An error occurred while sending stats to SWUStats in ${game.id}`, { error: { message: error.message, stack: error.stack }, lobbyId: this.id });
            return {
                player1SwuStatsStatus: player1.lobbyDeck.deckSource === DeckSource.SWUStats ? {
                    type: StatsSaveStatus.Error,
                    source: StatsSource.SwuStats,
                    message: 'an error occurred while sending stats'
                } : null,
                player2SwuStatsStatus: player2.lobbyDeck.deckSource === DeckSource.SWUStats ? {
                    type: StatsSaveStatus.Error,
                    source: StatsSource.SwuStats,
                    message: 'an error occurred while sending stats'
                } : null
            };
        }
    }

    /**
     * Updates deck statistics when a game ends
     * @param game The game that has ended
     * @param sequenceNumber - For Bo3 games, indicates which game in the set (1, 2, or 3). Omitted for Bo1.
     */
    private async endGameUpdateStatsAsync(game: Game, sequenceNumber?: number): Promise<void> {
        logger.info(`Lobby ${this.id}: Updating deck stats for game ${game.id}`, { lobbyId: this.id });
        // pre-populate the status messages with an error that we will send by default in case something fails
        let player1KarabastStatus: IStatsMessageFormat = { type: StatsSaveStatus.Error, source: StatsSource.Karabast, message: 'an error occurred while updating stats' };
        let player2KarabastStatus: IStatsMessageFormat = { type: StatsSaveStatus.Error, source: StatsSource.Karabast, message: 'an error occurred while updating stats' };

        // Get the players from the game
        const players = game.getPlayers();
        if (players.length !== 2) {
            for (const player of players) {
                this.sendStatsMessageToUser(player.id, player1KarabastStatus);
            }
            throw Error(`Lobby ${this.id}: Cannot update stats for game with ${players.length} players`);
        }
        const [player1, player2] = players;

        // Validate that lobby users are attached to players
        Contract.assertNotNullLike(player1.lobbyUser, `Lobby ${this.id}: player1 ${player1.id} has no lobbyUser attached at stats send time`);
        Contract.assertNotNullLike(player2.lobbyUser, `Lobby ${this.id}: player2 ${player2.id} has no lobbyUser attached at stats send time`);
        Contract.assertNotNullLike(player1.lobbyDeck, `Lobby ${this.id}: player1 ${player1.id} has no deck assigned at stats send time`);
        Contract.assertNotNullLike(player2.lobbyDeck, `Lobby ${this.id}: player2 ${player2.id} has no deck assigned at stats send time`);

        // SWUStats
        let player1SwuStatsStatus = player1.lobbyDeck?.deckSource === DeckSource.SWUStats
            ? { type: StatsSaveStatus.Error, source: StatsSource.SwuStats, message: 'an error occurred while updating stats' }
            : null;
        let player2SwuStatsStatus = player2.lobbyDeck?.deckSource === DeckSource.SWUStats
            ? { type: StatsSaveStatus.Error, source: StatsSource.SwuStats, message: 'an error occurred while updating stats' }
            : null;

        try {
            // Determine the winner and loser
            let winner, loser;
            if (game.winnerNames.includes(player1.name)) {
                winner = player1;
                loser = player2;
            } else if (game.winnerNames.includes(player2.name)) {
                winner = player2;
                loser = player1;
            }

            // If we have a draw (or couldn't determine winner/loser), set as draw
            const isDraw = !winner || !loser || game.winnerNames.length > 1;

            // set winner/loser state
            const player1Score = isDraw ? ScoreType.Draw : winner === player1 ? ScoreType.Win : ScoreType.Lose;
            const player2Score = isDraw ? ScoreType.Draw : winner === player1 ? ScoreType.Lose : ScoreType.Win;

            // Only update stats if the game has a winner and made it into the second round at least
            if (game.winnerNames.length === 0 || !game.finishedAt) {
                throw new Error(`Lobby ${this.id}: Cannot update stats for game with: ${game.winnerNames.length === 0
                    ? `winnerNames length being ${game.winnerNames.length}` : ''}
                    ${!game.finishedAt ? 'game finishedAt missing' : ''} `);
            }

            if (this.game.roundNumber <= 1) {
                player1KarabastStatus.message = 'stats not updated due to game ending before round 2';
                player1KarabastStatus.type = StatsSaveStatus.Warning;
                player2KarabastStatus.message = 'stats not updated due to game ending before round 2';
                player2KarabastStatus.type = StatsSaveStatus.Warning;
                if (player1SwuStatsStatus) {
                    player1SwuStatsStatus.message = 'stats not updated due to game ending before round 2';
                    player1SwuStatsStatus.type = StatsSaveStatus.Warning;
                }
                if (player2SwuStatsStatus) {
                    player2SwuStatsStatus.message = 'stats not updated due to game ending before round 2';
                    player2SwuStatsStatus.type = StatsSaveStatus.Warning;
                }
                logger.info('stats not updated due to game ending before round 2', { lobbyId: this.id });
                return;
            }

            // Update Karabast stats
            player1KarabastStatus = await this.updateKarabastPlayerStatsAsync(player1, player2, player1Score);
            player2KarabastStatus = await this.updateKarabastPlayerStatsAsync(player2, player1, player2Score);

            // Send to SWUstats if handler is available
            if ((player1SwuStatsStatus || player2SwuStatsStatus) && this.format === SwuGameFormat.Premier && this.swuStatsEnabled) {
                ({ player1SwuStatsStatus, player2SwuStatsStatus } = await this.updatePlayerSWUStatsAsync(game, player1, player2, sequenceNumber));
            }
            // Send warning that swustats are not updated when in non-premier format.
            if (this.format !== SwuGameFormat.Premier && this.swuStatsEnabled) {
                if (player1SwuStatsStatus) {
                    player1SwuStatsStatus.message = 'stats update not supported for non-Premier formats';
                    player1SwuStatsStatus.type = StatsSaveStatus.Warning;
                }
                if (player2SwuStatsStatus) {
                    player2SwuStatsStatus.message = 'stats update not supported for non-Premier formats';
                    player2SwuStatsStatus.type = StatsSaveStatus.Warning;
                }
            }
            logger.info(`Lobby ${this.id}: Successfully updated deck stats for ${game.id}`, { lobbyId: this.id });
        } finally {
            this.sendStatsMessageToUser(player1.id, player1KarabastStatus);
            this.sendStatsMessageToUser(player2.id, player2KarabastStatus);
            if (player1SwuStatsStatus && this.swuStatsEnabled) {
                this.sendStatsMessageToUser(player1.id, player1SwuStatsStatus);
            }
            if (player2SwuStatsStatus && this.swuStatsEnabled) {
                this.sendStatsMessageToUser(player2.id, player2SwuStatsStatus);
            }
        }
    }

    /**
     * Updates stats for the current game, handling both fresh updates and repeated end-game scenarios.
     * @param sequenceNumber - For Bo3 games, indicates which game in the set (1, 2, or 3). Omitted for Bo1.
     */
    private updateEndGameStatsIfNeeded(sequenceNumber?: number): void {
        if (this.game.statsUpdated) {
            this.sendRepeatedEndGameUpdateStatsMessages();
        } else {
            this.game.statsUpdated = true;
            this.endGameUpdateStatsAsync(this.game, sequenceNumber).catch((error) => {
                logger.error(`Lobby ${this.id}: Failed to update deck stats:`, { error: { message: error.message, stack: error.stack }, lobbyId: this.id });
            });
        }
    }

    /**
     * If the game has already ended and stats were updated (i.e. there was an undo and we're ending again),
     * send a clear stats message to the user
     */
    private sendRepeatedEndGameUpdateStatsMessages(): void {
        const cachedMessages: { userId: string; content: IStatsMessageFormat }[] = [];

        for (const [userId, messageTypes] of this.statsUpdateStatus) {
            for (const messageType of messageTypes.values()) {
                cachedMessages.push({ userId, content: messageType });
            }
        }

        for (const message of cachedMessages) {
            // if the last message was not a success, just repeat the same message
            if (message.content.type !== StatsSaveStatus.Success) {
                this.sendStatsMessageToUser(message.userId, message.content);
                continue;
            }

            this.sendStatsMessageToUser(message.userId,
                {
                    type: StatsSaveStatus.Warning,
                    source: message.content.source,
                    message: 'stats already updated for this game'
                }
            );
        }
    }

    private sendGameStateToSpectator(socket: Socket, spectatorId: string): void {
        if (this.game) {
            const spectator = this.spectators.find((s) => s.id === spectatorId);
            if (spectator) {
                const gameState = this.game.getState(spectatorId, spectator.lastMessageOffset);
                spectator.lastMessageOffset = this.game.messages.length;
                socket.send('gamestate', gameState);
            } else {
                // Fallback for edge cases where spectator isn't found yet (sends all messages)
                socket.send('gamestate', this.game.getState(spectatorId, 0));
            }
        }
    }

    private sendLobbyStateToSpectator(socket: Socket): void {
        socket.socket.send('lobbystate', this.getLobbyState());
    }

    public handleGameEnd(): void {
        // Record winner based on game mode
        this.recordGameResult(this.gamesToWinMode);

        // Handle stats and other end-game logic based on game mode
        switch (this.gamesToWinMode) {
            case GamesToWinMode.BestOfOne:
                this.updateEndGameStatsIfNeeded();
                break;
            case GamesToWinMode.BestOfThree: {
                const bo3History = this.winHistory as IBestOfThreeHistory;
                this.updateEndGameStatsIfNeeded(bo3History.currentGameNumber);

                // Start a 30s timer to auto-transition if the set is not complete
                if (this.useActionTimers && !this.isBo3SetComplete()) {
                    this.startBo3TransitionTimer();
                }
                break;
            }
            default:
                Contract.fail(`Unknown games to win mode: ${this.gamesToWinMode}`);
        }

        // Send updated lobby state so clients see the new score immediately
        this.sendLobbyState();
    }

    /**
     * Reverts the win history state when a game end is undone via the rollback mechanism.
     * This is called when a player uses undo to revert past the game end.
     * Note: Stats updates are not affected - this scenario is already handled by the stats logic.
     */
    public handleUndoGameEnd(): void {
        switch (this.winHistory.gamesToWinMode) {
            case GamesToWinMode.BestOfOne:
                // Clear the recorded winner
                this.winHistory.lastWinnerId = undefined;
                logger.info('Lobby: Bo1 game end undone, cleared lastWinnerId', { lobbyId: this.id });
                break;
            case GamesToWinMode.BestOfThree: {
                // Remove the last recorded game result
                if (this.winHistory.winnerIdsInOrder.length > 0) {
                    const removedWinnerId = this.winHistory.winnerIdsInOrder.pop();
                    logger.info(`Lobby: Bo3 game end undone, removed winner ${removedWinnerId} from history`, { lobbyId: this.id });
                }

                // Clear set end result (the undone game may have been the deciding game)
                this.winHistory.setEndResult = undefined;

                // Clear the transition timer since we're back to an active game
                this.clearBo3TransitionTimer();

                // Clear confirmation tracking since we're back to an active game
                this.bo3NextGameConfirmedBy?.clear();
                break;
            }
            default:
                Contract.fail(`Unknown games to win mode: ${(this.winHistory as any).gamesToWinMode}`);
        }

        // Send updated lobby state so clients see the reverted state
        this.sendLobbyState();
    }

    /**
     * Checks if the Bo3 set is complete (a player has 2 wins).
     * If a player has won 2 games and setEndResult hasn't been set yet, it sets the WonTwoGames result.
     */
    private isBo3SetComplete(): boolean {
        Contract.assertTrue(this.winHistory.gamesToWinMode === GamesToWinMode.BestOfThree);

        const winsPerPlayer = this.countWinsPerPlayer(this.winHistory.winnerIdsInOrder);

        const hasWinner = Object.values(winsPerPlayer).some((wins) => wins >= 2);

        // If someone has 2 wins and we haven't recorded the end result yet, record it now
        if (hasWinner && !this.winHistory.setEndResult) {
            this.winHistory.setEndResult = {
                endedReason: Bo3SetEndedReason.WonTwoGames
            };
        }

        return hasWinner;
    }

    /**
     * Starts the 30-second timer for auto-transitioning to the next Bo3 game.
     */
    private startBo3TransitionTimer(): void {
        this.clearBo3TransitionTimer();

        this.bo3TransitionTimer = this.buildSafeTimeout(
            () => this.onBo3TransitionTimerExpired(),
            30 * 1000,
            'Lobby: error in Bo3 transition timer'
        );

        this.gameChat.addAlert(AlertType.Notification, 'The game will be ended and moved to the next lobby in 30 seconds.');
        logger.info('Lobby: started 30s Bo3 transition timer', { lobbyId: this.id });
    }

    /**
     * Clears the Bo3 transition timer if it exists.
     */
    private clearBo3TransitionTimer(): void {
        if (this.bo3TransitionTimer) {
            clearTimeout(this.bo3TransitionTimer);
            this.bo3TransitionTimer = undefined;
            logger.info('Lobby: cleared Bo3 transition timer', { lobbyId: this.id });
        }
    }

    /**
     * Performs the transition to the next Bo3 game. This is the shared logic
     * called when both players confirm or when the transition timer expires.
     * @param alertPrefix The message prefix for the alert (e.g., "Both players confirmed" or "Time expired")
     */
    private transitionToNextBo3Game(alertPrefix: string): void {
        this.clearBo3TransitionTimer();

        Contract.assertTrue(this.winHistory.gamesToWinMode === GamesToWinMode.BestOfThree);
        this.winHistory.currentGameNumber++;

        // Reset for next game (winner was already recorded in handleGameEnd)
        this.game = null;
        this.bo3NextGameConfirmedBy?.clear();

        // Clear the 'ready' state for all users
        this.users.forEach((u) => {
            u.ready = false;
        });

        // Track when lobby was loaded for timer calculation
        this.bo3LobbyLoadedAt = new Date();

        this.gameChat.addAlert(AlertType.Notification, `${alertPrefix}. Proceeding to game ${this.winHistory.currentGameNumber}.`);
        logger.info(`Lobby: ${alertPrefix.toLowerCase()}, proceeding to Bo3 game ${this.winHistory.currentGameNumber}`, { lobbyId: this.id });

        this.sendLobbyState();
    }

    /**
     * Initializes the Bo3 lobby ready timer with handlers.
     * Called once when Bo3 mode is initialized. Does nothing if action timers are disabled.
     */
    private initializeBo3LobbyReadyTimer(): void {
        if (!this.useActionTimers) {
            return;
        }

        this.bo3LobbyReadyTimer = new SimpleActionTimer(
            30,
            (callback, delayMs) => this.buildSafeTimeout(callback, delayMs, 'Lobby: error in Bo3 lobby ready timer')
        );

        // Handler at 20 seconds remaining (warning)
        this.bo3LobbyReadyTimer.addSpecificTimeHandler(20, (setStatus) => {
            setStatus(PlayerTimeRemainingStatus.Warning);
            this.gameChat.addAlert(AlertType.Warning, '20 seconds remaining to sideboard and ready up.');
            this.sendLobbyState();
        });

        // Handler at 10 seconds remaining (danger)
        this.bo3LobbyReadyTimer.addSpecificTimeHandler(10, (setStatus) => {
            setStatus(PlayerTimeRemainingStatus.Danger);
            this.gameChat.addAlert(AlertType.Danger, '10 seconds remaining to sideboard and ready up.');
            this.sendLobbyState();
        });

        // Handler at 0 seconds (timer expired)
        this.bo3LobbyReadyTimer.addSpecificTimeHandler(0, () => {
            this.onBo3LobbyReadyTimerExpired();
        });
    }

    /**
     * Called when the Bo3 lobby ready timer expires.
     * Handles three cases: both ready, one ready, neither ready.
     */
    private onBo3LobbyReadyTimerExpired(): void {
        Contract.assertTrue(this.winHistory.gamesToWinMode === GamesToWinMode.BestOfThree);

        const readyUsers = this.users.filter((u) => u.ready);
        const notReadyUsers = this.users.filter((u) => !u.ready);

        if (readyUsers.length >= 2) {
            // Both players are ready - start the game
            logger.info('Lobby: Bo3 lobby ready timer expired, both players ready - starting game', { lobbyId: this.id });
            this.startGameAsync();
        } else if (readyUsers.length === 1 && notReadyUsers.length === 1) {
            // One player ready, one not - timeout the player who is not ready
            const timeoutPlayer = notReadyUsers[0];
            logger.info(`Lobby: Bo3 lobby ready timer expired, player ${timeoutPlayer.username} timed out`, { lobbyId: this.id, userName: timeoutPlayer.username, userId: timeoutPlayer.id });

            this.winHistory.setEndResult = {
                endedReason: Bo3SetEndedReason.OnePlayerLobbyTimeout,
                timeoutPlayerId: timeoutPlayer.id
            };

            this.gameChat.addAlert(AlertType.Danger, `${timeoutPlayer.username} did not ready in time. The set has ended.`);
            this.sendLobbyState();
        } else {
            // Neither player is ready - both timed out
            logger.info('Lobby: Bo3 lobby ready timer expired, neither player ready - set ended', { lobbyId: this.id });

            this.winHistory.setEndResult = {
                endedReason: Bo3SetEndedReason.BothPlayersLobbyTimeout
            };

            this.gameChat.addAlert(AlertType.Danger, 'Neither player readied in time. The set has ended.');
            this.sendLobbyState();
        }
    }

    /**
     * Called when the Bo3 transition timer expires. Auto-transitions both players to the next game.
     */
    private onBo3TransitionTimerExpired(): void {
        // Safety checks: ensure we're still in a valid state for transition
        if (!this.game || this.game.finishedAt == null) {
            logger.warn('Lobby: Bo3 transition timer expired but game is not in finished state', { lobbyId: this.id });
            return;
        }

        if (this.winHistory.gamesToWinMode !== GamesToWinMode.BestOfThree) {
            logger.warn('Lobby: Bo3 transition timer expired but not in Bo3 mode', { lobbyId: this.id });
            return;
        }

        if (this.bo3NextGameConfirmedBy && this.bo3NextGameConfirmedBy.size >= 2) {
            logger.warn('Lobby: Bo3 transition timer expired but both players already confirmed', { lobbyId: this.id });
            return;
        }

        if (this.isBo3SetComplete()) {
            logger.warn('Lobby: Bo3 transition timer expired but set is already complete', { lobbyId: this.id });
            return;
        }

        logger.info('Lobby: Bo3 transition timer expired, auto-transitioning to next game', { lobbyId: this.id });

        this.transitionToNextBo3Game('Time expired');
    }


    public sendGameState(game: Game, forceSend = false): void {
        // we send the game state to all users and spectators
        // if the message is ack'd, we set the user state to connected in case they were incorrectly marked as disconnected
        for (const user of this.users) {
            if (user.socket && (user.socket.socket.connected || forceSend)) {
                const clientGameState = game.getState(user.id, user.lastMessageOffset);
                user.lastMessageOffset = clientGameState.messageOffset + clientGameState.newMessages.length;
                user.socket.send('gamestate', clientGameState, () => this.safeSetUserConnected(user.id));
            }
        }
        for (const spectator of this.spectators) {
            if (spectator.socket && (spectator.socket.socket.connected || forceSend)) {
                const clientGameState = game.getState(spectator.id, spectator.lastMessageOffset);
                spectator.lastMessageOffset = clientGameState.messageOffset + clientGameState.newMessages.length;
                spectator.socket.send('gamestate', clientGameState, () => this.safeSetUserConnected(spectator.id));
            }
        }
    }

    /**
     * Handle client request for message retransmit when gaps are detected.
     * Client calls this with (startIndex, endIndex) to get messages in that range.
     */
    private retransmitGameMessages(socket: Socket, startIndex: number, endIndex: number): void {
        if (!this.game) {
            return;
        }

        const allMessages = this.game.messages;
        const totalCount = allMessages.length;

        // Clamp indices to valid range
        const safeStart = Math.max(0, Math.min(startIndex, totalCount));
        const safeEnd = Math.max(safeStart, Math.min(endIndex, totalCount));

        const requestedMessages = allMessages.slice(safeStart, safeEnd);

        socket.send('messagesResponse', {
            messages: requestedMessages,
            startIndex: safeStart,
            totalCount: totalCount
        });
    }

    private safeSetUserConnected(userId: string): void {
        try {
            const user = this.getUser(userId);
            user.state = 'connected';
        } catch (error) {
            logger.error(`Lobby: error setting user ${userId} connected`, { error: { message: error.message, stack: error.stack }, lobbyId: this.id, userId });
        }
    }

    public sendLobbyState(forceSend = false): void {
        for (const user of this.users) {
            if (user.socket && (user.socket.socket.connected || forceSend)) {
                user.socket.send('lobbystate', this.getLobbyState(user));
            }
        }
    }

    private updateSetting(socket: Socket, ...args: any[]): void {
        // Expect the rematch mode to be passed as the first argument: 'reset' or 'regular'
        Contract.assertTrue(args.length === 2, 'Expected setting name and value arguments but argument length is: ' + args.length);
        const settingName = args[0];
        const settingValue = args[1];
        Contract.assertTrue(typeof settingName === 'string', 'Invalid setting argument, expected string name but received: ' + settingName);

        const user = this.getUser(socket.user.getId());
        Contract.assertTrue(user.id === this.lobbyOwnerId, `User ${user.id} attempted to change lobby settings but is not the lobby owner (${this.lobbyOwnerId})`);

        switch (settingName) {
            case LobbySettingKeys.RequestUndo:
                this.assertSettingType(settingName, settingValue, 'boolean');
                this.undoMode = settingValue ? UndoMode.Request : UndoMode.Free;
                this.gameChat.addAlert(AlertType.Warning, `${user.username} has ${settingValue ? 'enabled' : 'disabled'} undo confirmation`);
                break;
            default:
                Contract.fail(`Unknown setting name: ${settingName}`);
        }

        this.sendLobbyState();
    }

    private assertSettingType(settingName: string, settingValue: any, expectedType: string): void {
        Contract.assertTrue(typeof settingValue === expectedType, `Invalid setting value for ${settingName}, expected ${expectedType} but received: ` + settingValue);
    }

    private async submitReport(socket: Socket, ...args: any[]): Promise<void> {
        Contract.assertTrue(
            args[0] === 'bugReport' || args[0] === 'playerReport',
            `Invalid report type: expected 'bug' or 'player' but received '${args[0]}'`
        );
        const reportType = args[0] as ReportType;
        const reportMessage = args[1];
        const playerReportType = Object.values(PlayerReportType).includes(args[2]) ? args[2] as PlayerReportType : null;
        const resultEvent = reportType === ReportType.BugReport ? 'bugReportResult' : 'playerReportResult';
        const reportLabel = reportType === ReportType.BugReport ? 'bug report' : 'player report';

        try {
            let parsedDescription = '';
            let screenResolution = null;
            let viewport = null;

            if (reportMessage && typeof reportMessage === 'object') {
                parsedDescription = reportMessage.description || '';
                screenResolution = reportMessage.screenResolution || null;
                viewport = reportMessage.viewport || null;
            } else {
                parsedDescription = reportMessage;
            }

            const gameState = this.game
                ? this.game.captureGameState(socket.user.getId())
                : { phase: 'action', player1: {}, player2: {} };

            let gameMessages: IChatMessageEntry[];
            let opponent: { id: string; username: string };
            if (this.game) {
                const opponentObject = this.game.getPlayers().find((u) => u.id !== socket.user.getId());
                opponent = { id: opponentObject.id, username: opponentObject.user.username };
                gameMessages = reportType === ReportType.BugReport ? this.game.getLogMessages() : this.game.gameChat.messages;
            } else {
                // this is for lobby player reports
                const opponentObject = this.users.find((u) => u.id !== socket.user.getId());
                if (opponentObject) {
                    opponent = { id: opponentObject.id, username: opponentObject.username };
                } else {
                    throw new Error(`${reportLabel} failed since opponent wasn't found`);
                }
                gameMessages = this.gameChat.messages;
            }

            const report = this.discordDispatcher.formatReport(
                parsedDescription,
                gameState,
                playerReportType,
                socket.user,
                opponent,
                gameMessages,
                this.id,
                this.gameFormat,
                this.matchmakingType,
                this.game?.snapshotManager.gameStepsSinceLastUndo,
                this.game?.id,
                screenResolution,
                viewport
            );

            const success = await this.discordDispatcher.formatAndSendReportAsync(report, reportType);
            if (!success) {
                throw new Error(`${reportLabel} failed to send to discord. See logs for details.`);
            }
            const existingUser = this.users.find((u) => u.id === socket.user.getId());
            if (reportType === ReportType.BugReport) {
                existingUser.reportedBugs += 1;
            }

            socket.send(resultEvent, {
                id: uuid(),
                success: true,
                message: `Successfully sent ${reportLabel}`
            });

            // we report the alert only if its a bug report
            if (reportType === ReportType.BugReport) {
                this.game.addAlert(
                    AlertType.Notification,
                    `{0} has submitted a ${reportLabel}`,
                    existingUser.username
                );
            }

            this.sendLobbyState();
        } catch (error) {
            logger.error(`Error processing ${reportLabel}`, {
                error: { message: error.message, stack: error.stack },
                lobbyId: this.id,
                userId: socket.user.id
            });

            socket.send(resultEvent, {
                id: uuid(),
                success: false,
                message: `An error occurred while processing your ${reportLabel}.`
            });
        }
    }
}