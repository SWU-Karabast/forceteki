import Game from '../game/core/Game';
import { v4 as uuid } from 'uuid';
import type Socket from '../socket';
import * as Contract from '../game/core/utils/Contract';
import fs from 'fs';
import path from 'path';
import { logger } from '../logger';
import { GameChat } from '../game/core/chat/GameChat';
import type { User } from '../utils/user/User';
import type { IUser } from '../Settings';
import { getUserWithDefaultsSet } from '../Settings';
import type { CardDataGetter } from '../utils/cardData/CardDataGetter';
import { Deck } from '../utils/deck/Deck';
import type { DeckValidator } from '../utils/deck/DeckValidator';
import type { SwuGameFormat } from '../SwuGameFormat';
import type { IDecklistInternal, IDeckValidationFailures } from '../utils/deck/DeckInterfaces';
import { ScoreType } from '../utils/deck/DeckInterfaces';
import type { GameConfiguration } from '../game/core/GameInterfaces';
import { GameMode } from '../GameMode';
import type { GameServer } from './GameServer';
import { AlertType } from '../game/core/Constants';
import { v4 as uuidv4 } from 'uuid';

interface LobbySpectator {
    id: string;
    username: string;
    state: 'connected' | 'disconnected';
    socket?: Socket;
}

interface LobbyUser extends LobbySpectator {
    state: 'connected' | 'disconnected';
    ready: boolean;
    deck?: Deck;
    decklist?: any;
    deckValidationErrors?: IDeckValidationFailures;
    importDeckValidationErrors?: IDeckValidationFailures;
    reportedBugs: number;
}
export enum DeckSource {
    SWUStats = 'SWUStats',
    SWUDB = 'SWUDB',
    SWUnlimitedDB = 'SWUnlimitedDB',
    Unknown = 'UNKNOWN'
}

interface PlayerDetails {
    user: User;
    deckID: string;
    deckLink: string;
    deckSource: DeckSource;
    leaderID: string;
    baseID: string;
    deck: IDecklistInternal;
}

export enum MatchType {
    Custom = 'Custom',
    Private = 'Private',
    Quick = 'Quick',
}

export interface RematchRequest {
    initiator?: string;
    mode: 'reset' | 'regular';
}

export class Lobby {
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

    private game?: Game;
    public users: LobbyUser[] = [];
    public spectators: LobbySpectator[] = [];
    private lobbyOwnerId: string;
    public gameType: MatchType;
    public gameFormat: SwuGameFormat;
    private rematchRequest?: RematchRequest = null;
    private userLastActivity = new Map<string, Date>();
    private matchingCountdownText?: string;
    private matchingCountdownTimeoutHandle?: NodeJS.Timeout;
    private usersLeftCount = 0;
    private playersDetails: PlayerDetails[] = [];
    private gameMessageErrorCount = 0;

    public constructor(
        lobbyName: string,
        lobbyGameType: MatchType,
        lobbyGameFormat: SwuGameFormat,
        cardDataGetter: CardDataGetter,
        deckValidator: DeckValidator,
        gameServer: GameServer,
        testGameBuilder?: any,
    ) {
        Contract.assertTrue(
            [MatchType.Custom, MatchType.Private, MatchType.Quick].includes(lobbyGameType),
            `Lobby game type ${lobbyGameType} doesn't match any MatchType values`
        );
        this._id = uuid();
        this._lobbyName = lobbyName || `Game #${this._id.substring(0, 6)}`;
        this.gameChat = new GameChat(() => this.sendLobbyState());
        this.connectionLink = lobbyGameType !== MatchType.Quick ? this.createLobbyLink() : null;
        this.isPrivate = lobbyGameType === MatchType.Private;
        this.gameType = lobbyGameType;
        this.cardDataGetter = cardDataGetter;
        this.testGameBuilder = testGameBuilder;
        this.deckValidator = deckValidator;
        this.gameFormat = lobbyGameFormat;
        this.server = gameServer;
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

    public getLobbyState(user?: LobbyUser): any {
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
            gameType: this.gameType,
            gameFormat: this.gameFormat,
            rematchRequest: this.rematchRequest,
            matchingCountdownText: this.matchingCountdownText
        };
    }

    private buildLobbyUserData(user: LobbyUser, fullData = false) {
        const basicData = {
            id: user.id,
            username: user.username,
            state: user.state,
            ready: user.ready,
            authenticated: user.socket?.user.isDevTestUser() || user.socket?.user.isAuthenticatedUser()
        };

        const extendedData = fullData ? {
            deck: user.deck?.getDecklist(),
            reportedBugs: user.reportedBugs,
            deckErrors: user.deckValidationErrors,
            importDeckErrors: user.importDeckValidationErrors,
            unimplementedCards: this.deckValidator.getUnimplementedCardsInDeck(user.deck?.getDecklist()),
            minDeckSize: user.deck?.base.id ? this.deckValidator.getMinimumSideboardedDeckSize(user.deck?.base.id) : 50,
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
            deckValidationErrors: deck ? this.deckValidator.validateInternalDeck(deck.getDecklist(), this.gameFormat) : {},
            deck,
            decklist,
            reportedBugs: 0
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
                state: 'connected'
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

    private checkUpdateSocket(user: LobbyUser | LobbySpectator, socket: Socket): void {
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
                reportedBugs: 0
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

        if (this.gameType === MatchType.Quick) {
            if (!socket.eventContainsListener('requeue')) {
                socket.registerEvent(
                    'requeue',
                    () => this.server.requeueUser(socket, this.format, user, { ...existingUser?.deck?.getDecklist(), deckID: existingUser?.deck?.id })
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

            this.sendLobbyState(true);

            if (this.users.length === 2 && this.users.every((u) => u.state === 'connected')) {
                return this.onStartGameAsync();
            }
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

    private setReadyStatus(socket: Socket, ...args) {
        Contract.assertTrue(args.length === 1 && typeof args[0] === 'boolean', 'Ready status arguments aren\'t boolean or present');
        const currentUser = this.users.find((u) => u.id === socket.user.getId());
        if (!currentUser) {
            return;
        }
        currentUser.ready = args[0];
        logger.info(`Lobby: user ${currentUser.username} set ready status: ${args[0]}`, { lobbyId: this.id, userName: currentUser.username, userId: currentUser.id });
        this.gameChat.addAlert(AlertType.ReadyStatus, `${currentUser.username} is ${args[0] ? 'ready to start' : 'not ready to start'}`);
        this.updateUserLastActivity(currentUser.id);
    }

    private sendChatMessage(socket: Socket, ...args) {
        const existingUser = this.users.find((u) => u.id === socket.user.getId());
        Contract.assertNotNullLike(existingUser, `Unable to find user with id ${socket.user.getId()} in lobby ${this.id}`);
        Contract.assertTrue(args.length === 1 && typeof args[0] === 'string', 'Chat message arguments are not present or not of type string');
        if (!existingUser) {
            return;
        }

        logger.info(`Lobby: user ${existingUser.username} sent chat message: ${args[0]}`, { lobbyId: this.id, userName: existingUser.username, userId: existingUser.id });
        this.gameChat.addChatMessage(existingUser, args[0]);
        this.sendLobbyState();
    }

    private requestRematch(socket: Socket, ...args: any[]): void {
        // Expect the rematch mode to be passed as the first argument: 'reset' or 'regular'
        Contract.assertTrue(args.length === 1, 'Expected rematch mode argument but argument length is: ' + args.length);
        const mode = args[0];
        Contract.assertTrue(mode === 'reset' || mode === 'regular', 'Invalid rematch mode, expected reset or regular but receieved: ' + mode);

        const user = this.getUser(socket.user.getId());

        // Set the rematch request property (allow only one request at a time)
        if (!this.rematchRequest) {
            this.rematchRequest = {
                initiator: user.id,
                mode,
            };
            logger.info(`Lobby: user ${socket.user.getId()} requested a rematch (${mode})`, { lobbyId: this.id, userName: user.username, userId: user.id });
            this.game.addAlert(AlertType.Notification, `${user.username} has requested a ${mode === 'reset' ? 'quick' : ''} rematch!`);
        }
        this.sendLobbyState();
    }

    private rematch() {
        // Clear the rematch request and reset the game.
        this.rematchRequest = null;
        this.game = null;
        if (this.gameType === MatchType.Quick) {
            this.gameType = MatchType.Custom;
        }
        // Clear the 'ready' state for all users.
        this.users.forEach((user) => {
            user.ready = false;
        });
        this.sendLobbyState();
    }

    private changeDeck(socket: Socket, ...args) {
        const activeUser = this.users.find((u) => u.id === socket.user.getId());

        // we check if the deck is valid.
        activeUser.importDeckValidationErrors = this.deckValidator.validateSwuDbDeck(args[0], this.gameFormat);

        // if the deck doesn't have any errors set it as active.
        if (Object.keys(activeUser.importDeckValidationErrors).length === 0) {
            activeUser.deck = new Deck(args[0], this.cardDataGetter);
            activeUser.decklist = args[0];
            activeUser.deckValidationErrors = this.deckValidator.validateInternalDeck(activeUser.deck.getDecklist(),
                this.gameFormat);
            activeUser.importDeckValidationErrors = null;
        }
        logger.info(`Lobby: user ${activeUser.username} changing deck`, { lobbyId: this.id, userName: activeUser.username, userId: activeUser.id });

        this.updateUserLastActivity(activeUser.id);
    }

    private updateDeck(socket: Socket, ...args) {
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
        user.deckValidationErrors = this.deckValidator.validateInternalDeck(userDeck.getDecklist(), this.gameFormat);
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
            logger.info(`Lobby: setting user ${user.username} to disconnected on socket id ${socketId}`, { lobbyId: this.id, userName: user.username, userId: user.id });
        }

        const spectator = this.spectators.find((u) => u.id === id);
        if (spectator) {
            if (spectator.socket.id !== socketId) {
                return;
            }

            spectator.state = 'disconnected';
            logger.info(`Lobby: setting spectator ${spectator.username} to disconnected on socket id ${socketId}`, { lobbyId: this.id, userName: spectator.username, userId: spectator.id });
        }
    }

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
                this.game.endGame(this.game.getPlayerById(otherPlayer.id), `${user.username} has conceded`);
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

    public cleanLobby(): void {
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
            { id: 'th3w4y', username: 'ThisIsTheWay' }
        );

        this.game = game;
    }

    /**
     * Helper method to determine deck source from deck link or other data
     */
    private determineDeckSource(deckLink?: string, deckSource?: string): DeckSource {
        if (deckSource && Object.values(DeckSource).includes(deckSource as DeckSource)) {
            return deckSource as DeckSource;
        }
        // Fallback to determining from deckLink
        if (deckLink) {
            if (deckLink.includes('swustats.net')) {
                return DeckSource.SWUStats;
            } else if (deckLink.includes('swudb.com')) {
                return DeckSource.SWUDB;
            } else if (deckLink.includes('swunlimiteddb.com')) {
                return DeckSource.SWUnlimitedDB;
            }
        }
        // Default fallback
        return DeckSource.Unknown;
    }

    private async onStartGameAsync() {
        try {
            this.rematchRequest = null;
            const game = new Game(this.buildGameSettings(), { router: this });
            this.game = game;
            game.started = true;

            logger.info(`Lobby: starting game id: ${game.id}`, { lobbyId: this.id });

            // Give each user the standard disconnect handler (longer timeout than during matchmaking)
            this.users.forEach((user) => {
                this.server.registerDisconnect(user.socket, user.id);
            });

            // For each user, if they have a deck, select it in the game
            this.users.forEach((user) => {
                if (user.deck) {
                    game.selectDeck(user.id, user.deck);
                    this.playersDetails.push({
                        user: user.socket.user,
                        baseID: user.deck.base.id,
                        leaderID: user.deck.leader.id,
                        deckID: user.deck.id,
                        deckLink: user.decklist.deckLink,
                        deckSource: this.determineDeckSource(user.decklist.deckLink, user.decklist.deckSource),
                        deck: user.deck.getDecklist()
                    });
                }
            });

            await game.initialiseAsync();

            this.sendGameState(game);
        } catch (error) {
            if (this.gameType === MatchType.Quick) {
                logger.error(
                    'Lobby: error attempting to start matchmaking lobby, cancelling and requeueing users',
                    { error: { message: error.message, stack: error.stack }, lobbyId: this.id }
                );
                this.matchmakingFailed(error);
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

    private buildGameSettings(): GameConfiguration {
        const players: IUser[] = this.users.map((user) =>
            getUserWithDefaultsSet({
                id: user.id,
                username: user.username,
                settings: {
                    optionSettings: {
                        autoSingleTarget: false,
                    }
                }
            })
        );

        const useActionTimer =
            (this.gameType === MatchType.Quick || this.gameType === MatchType.Custom) &&
            (process.env.ENVIRONMENT !== 'development' || process.env.USE_LOCAL_ACTION_TIMER === 'true');

        return {
            id: uuidv4(),
            allowSpectators: false,
            owner: 'Order66',
            gameMode: GameMode.Premier,
            players,
            cardDataGetter: this.cardDataGetter,
            useActionTimer,
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
                logger.info(`[LobbyCommand] ${JSON.stringify({
                    command,
                    userId: socket.user.getId(),
                    lobbyId: this.id,
                    durationMs: Number(durationMs.toFixed(2)),
                    timestamp: new Date().toISOString()
                })}`);
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
                logger.info(`[GameCommand] ${JSON.stringify({
                    command,
                    userId: socket.user.getId(),
                    lobbyId: this.id,
                    durationMs: Number(durationMs.toFixed(2)),
                    timestamp: new Date().toISOString()
                })}`);
            }
        } catch (error) {
            logger.error('Game: error processing game message', { error: { message: error.message, stack: error.stack }, lobbyId: this.id });
        }
    }

    public handleMatchmakingDisconnect() {
        if (this.gameType !== MatchType.Quick) {
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
                this.server.requeueUser(user.socket, this.format, user.socket.user, { ...user.deck?.getDecklist(), deckID: user.deck?.id });
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

    // TODO: Review this to make sure we're getting the info we need for debugging
    public handleError(game: Game, error: Error, severeGameMessage = false) {
        logger.error('Game: handleError', { error: { message: error.message, stack: error.stack }, lobbyId: this.id });

        let maxErrorCountExceeded = false;

        this.gameMessageErrorCount++;
        if (this.gameMessageErrorCount > 100) {
            logger.error('Game: too many errors for request, halting', { lobbyId: this.id });
            severeGameMessage = true;
            maxErrorCountExceeded = true;
        }

        // const gameState = game.getState();
        // const debugData: any = {};

        // if (e.message.includes('Maximum call stack')) {
        //     // debugData.badSerializaton = detectBinary(gameState);
        // } else {
        //     debugData.game = gameState;
        //     debugData.game.players = undefined;

        //     debugData.messages = game.messages;
        //     debugData.game.messages = undefined;

        //     debugData.pipeline = game.pipeline.getDebugInfo();
        //     // debugData.effectEngine = game.effectEngine.getDebugInfo();

        //     for (const player of game.getPlayers()) {
        //         debugData[player.name] = player.getState(player);
        //     }
        // }

        if (game && severeGameMessage) {
            game.addMessage(
                `A Server error has occured processing your game state, apologies.  Your game may now be in an inconsistent state, or you may be able to continue. The error has been logged. If this happens again, please take a screenshot and reach out in the Karabast discord (game id ${this.id})`,
            );
        }

        if (maxErrorCountExceeded) {
            // send game state so that the message can be seen
            this.sendGameState(this.game);

            // this is ugly since we're probably within an exception handler currently, but if we get here it's already crisis
            throw new Error('Maximum error count exceeded');
        }
    }


    /**
     * Private method to update a players stats
     */
    private async updatePlayerStatsAsync(playerUser: PlayerDetails, opponentPlayerUser: PlayerDetails, score: ScoreType) {
        if (!playerUser.user.isAuthenticatedUser()) {
            return;
        }
        // Get the deck service
        const opponentPlayerLeaderId = await this.cardDataGetter.getCardBySetCodeAsync(opponentPlayerUser.leaderID);
        const opponentPlayerBaseId = await this.cardDataGetter.getCardBySetCodeAsync(opponentPlayerUser.baseID);
        await this.server.deckService.updateDeckStatsAsync(
            playerUser.user.getId(),
            playerUser.deckID,
            score,
            opponentPlayerLeaderId.internalName,
            opponentPlayerBaseId.internalName,
        );
    }


    /**
     * Updates deck statistics when a game ends
     * @param game The game that has ended
     */
    private async endGameUpdateStatsAsync(game: Game): Promise<void> {
        try {
            // Only update stats if the game has a winner and made it into the second round at least
            if (game.winnerNames.length === 0 || !game.finishedAt || this.game.roundNumber <= 1) {
                return;
            }

            logger.info(`Lobby ${this.id}: Updating deck stats for game ${game.id}`);

            // Get the players from the game
            const players = game.getPlayers();
            if (players.length !== 2) {
                logger.warn(`Lobby ${this.id}: Cannot update stats for game with ${players.length} players`);
                return;
            }

            const [player1, player2] = players;

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

            // Get the user & deck information for each player
            const player1User = this.playersDetails.find((u) => u.user.getId() === player1.id);
            const player2User = this.playersDetails.find((u) => u.user.getId() === player2.id);

            if (!player1User) {
                logger.error(`Lobby ${this.id}: Missing deck information (${player1User.deckID}) for player1 ${player1.id}`);
                return;
            }
            if (!player2User) {
                logger.error(`Lobby ${this.id}: Missing information (${player2User.deckID}) for player2 ${player2.id}`);
                return;
            }

            await this.updatePlayerStatsAsync(player1User, player2User, player1Score);
            await this.updatePlayerStatsAsync(player2User, player1User, player2Score);

            logger.info(`Lobby ${this.id}: Successfully updated deck stats in Karabast for game ${game.id}`);
            const eitherFromSWUStats = [player1.id, player2.id].some((id) =>
                this.playersDetails.find((u) => u.user.getId() === id)?.deckSource === DeckSource.SWUStats
            );
            // Send to SWUstats if handler is available
            if (eitherFromSWUStats) {
                await this.server.SwuStatsHandler.sendGameResultAsync(
                    game,
                    this.playersDetails.find((u) => u.user.getId() === player1.id).deckLink,
                    this.playersDetails.find((u) => u.user.getId() === player2.id).deckLink,
                    this.users.find((u) => u.id === player1.id).deck.getDecklist(),
                    this.users.find((u) => u.id === player2.id).deck.getDecklist()
                );
                logger.info(`Lobby ${this.id}: Successfully updated deck stats for game ${game.id}`);
            }
        } catch (error) {
            logger.error(`Lobby ${this.id}: Error updating deck stats:`, error);
        }
    }

    private sendGameStateToSpectator(socket: Socket, spectatorId: string): void {
        if (this.game) {
            socket.send('gamestate', this.game.getState(spectatorId));
        }
    }

    private sendLobbyStateToSpectator(socket: Socket): void {
        socket.socket.send('lobbystate', this.getLobbyState());
    }

    public sendGameState(game: Game, forceSend = false): void {
        // we check here if the game ended and update the stats.
        if (game.winnerNames.length > 0 && game.finishedAt && !game.statsUpdated) {
            // Update deck stats asynchronously
            game.statsUpdated = true;
            this.endGameUpdateStatsAsync(game).catch((error) => {
                logger.error(`Lobby ${this.id}: Failed to update deck stats:`, error);
            });
        }

        // we send the game state to all users and spectators
        // if the message is ack'd, we set the user state to connected in case they were incorrectly marked as disconnected
        for (const user of this.users) {
            if (user.socket && (user.socket.socket.connected || forceSend)) {
                user.socket.send('gamestate', game.getState(user.id), () => this.safeSetUserConnected(user.id));
            }
        }
        for (const user of this.spectators) {
            if (user.socket && (user.socket.socket.connected || forceSend)) {
                user.socket.send('gamestate', game.getState(user.id), () => this.safeSetUserConnected(user.id));
            }
        }
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

    // Report bug method
    private async reportBug(socket: Socket, ...args: any): Promise<void> {
        try {
            // Parse description as JSON if it's in JSON format
            const bugReportMessage = args[0];
            let parsedDescription = '';
            let screenResolution = null;
            let viewport = null;
            if (bugReportMessage && typeof bugReportMessage === 'object') {
                parsedDescription = bugReportMessage.description || '';
                screenResolution = bugReportMessage.screenResolution || null;
                viewport = bugReportMessage.viewport || null;
            } else {
                // Take this as a string (backward compatibility)
                parsedDescription = bugReportMessage;
            }

            if (!parsedDescription || parsedDescription.trim().length === 0) {
                throw new Error('description is invalid');
            }

            // Create game state snapshot
            const gameState = this.game
                ? this.game.captureGameState(socket.user.getId())
                : { phase: 'action', player1: {}, player2: {} };

            const gameMessages = this.game.getLogMessages();
            const opponent = this.users.find((u) => u.id !== socket.user.id);
            // Create bug report
            const bugReport = this.server.bugReportHandler.createBugReport(
                parsedDescription,
                gameState,
                socket.user,
                opponent.socket.user,
                gameMessages,
                this.id,
                this.game?.id,
                screenResolution,
                viewport
            );

            // Send to Discord
            const success = await this.server.bugReportHandler.sendBugReportToDiscord(bugReport);
            if (!success) {
                throw new Error('Bug report failed to send to discord. No webhook configured');
            }

            // we find the user
            const existingUser = this.users.find((u) => u.id === socket.user.getId());
            existingUser.reportedBugs += success ? 1 : 0;

            // Send success message to client
            socket.send('bugReportResult', {
                id: uuid(),
                success: success,
                message: 'Successfully sent bug report'
            });

            this.game.addAlert(AlertType.Notification, '{0} has submitted a bug report', existingUser.username);

            this.sendLobbyState();
        } catch (error) {
            logger.error('Error processing bug report', {
                error: { message: error.message, stack: error.stack },
                lobbyId: this.id,
                userId: socket.user.id
            });
            // Send error message to client
            socket.send('bugReportResult', {
                id: uuid(),
                success: false,
                message: 'An error occurred while processing your bug report.'
            });
        }
    }
}