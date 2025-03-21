import Game from '../game/core/Game';
import { v4 as uuid } from 'uuid';
import type Socket from '../socket';
import * as Contract from '../game/core/utils/Contract';
import fs from 'fs';
import path from 'path';
import { logger } from '../logger';
import { GameChat } from '../game/core/chat/GameChat';
import type { CardDataGetter } from '../utils/cardData/CardDataGetter';
import { Deck } from '../utils/deck/Deck';
import type { DeckValidator } from '../utils/deck/DeckValidator';
import type { SwuGameFormat } from '../SwuGameFormat';
import type { IDeckValidationFailures } from '../utils/deck/DeckInterfaces';
import type { GameConfiguration } from '../game/core/GameInterfaces';
import { getUserWithDefaultsSet, type User } from '../Settings';
import { GameMode } from '../GameMode';
import type { GameServer } from './GameServer';

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
    deckValidationErrors?: IDeckValidationFailures;
    importDeckValidationErrors?: IDeckValidationFailures;
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

    private game: Game;
    public users: LobbyUser[] = [];
    public spectators: LobbySpectator[] = [];
    private lobbyOwnerId: string;
    public gameType: MatchType;
    public gameFormat: SwuGameFormat;
    private rematchRequest?: RematchRequest = null;
    private userLastActivity = new Map<string, Date>();

    public constructor(
        lobbyName: string,
        lobbyGameType: MatchType,
        lobbyGameFormat: SwuGameFormat,
        cardDataGetter: CardDataGetter,
        deckValidator: DeckValidator,
        gameServer: GameServer,
        testGameBuilder?: any
    ) {
        Contract.assertTrue(
            [MatchType.Custom, MatchType.Private, MatchType.Quick].includes(lobbyGameType),
            `Lobby game type ${lobbyGameType} doesn't match any MatchType values`
        );
        this._id = uuid();
        this._lobbyName = lobbyName || `Game #${this._id.substring(0, 6)}`;
        this.gameChat = new GameChat();
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

    public getLobbyState(): any {
        return {
            id: this._id,
            lobbyName: this._lobbyName,
            users: this.users.map((u) => ({
                id: u.id,
                username: u.username,
                state: u.state,
                ready: u.ready,
                deck: u.deck?.getDecklist(),
                deckErrors: u.deckValidationErrors,
                importDeckErrors: u.importDeckValidationErrors,
                unimplementedCards: this.deckValidator.getUnimplementedCardsInDeck(u.deck?.getDecklist()),
                minDeckSize: u.deck?.base.id ? this.deckValidator.getMinimumSideboardedDeckSize(u.deck?.base.id) : 50,
                maxSideBoard: this.deckValidator.getMaxSideboardSize(this.format)
            })),
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
        };
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
        const now = new Date();
        this.userLastActivity.set(id, now);
    }

    public createLobbyUser(user, decklist = null): void {
        const existingUser = this.users.find((u) => u.id === user.id);
        const deck = decklist ? new Deck(decklist, this.cardDataGetter) : null;
        if (existingUser) {
            existingUser.deck = deck;
            return;
        }

        this.users.push(({
            id: user.id,
            username: user.username,
            state: null,
            ready: false,
            socket: null,
            deckValidationErrors: deck ? this.deckValidator.validateInternalDeck(deck.getDecklist(), this.gameFormat) : {},
            deck
        }));
        logger.info(`Lobby ${this.id}: Creating username: ${user.username}, id: ${user.id} and adding to users list (${this.users.length} user(s))`);
        this.gameChat.addMessage(`${user.username} has created and joined the lobby`);

        this.updateUserLastActivity(user.id);
    }

    public addSpectator(user: User, socket: Socket): void {
        const existingSpectator = this.spectators.find((s) => s.id === user.id);
        const existingPlayer = this.users.find((s) => s.id === user.id);
        if (existingPlayer) {
            // we remove the player and disconnect since the user should not come here
            this.removeUser(user.id);
            socket.disconnect();
            return;
        }
        if (!existingSpectator) {
            this.spectators.push({
                id: user.id,
                username: user.username,
                socket,
                state: 'connected'
            });
        } else {
            existingSpectator.state = 'connected';
            existingSpectator.socket = socket;
        }
        // If game is ongoing, send the current state to the spectator
        if (this.game) {
            this.sendGameStateToSpectator(socket, user.id);
        } else {
            this.sendLobbyStateToSpectator(socket);
        }
        logger.info(`Lobby ${this.id}: adding spectator: ${user.username}, id: ${user.id} (${this.spectators.length} spectator(s))`);
    }

    public removeSpectator(id: string): void {
        const spectator = this.spectators.find((s) => s.id === id);
        if (!spectator) {
            // TODO: re-add this if we want to start doing verbose logging
            // logger.info(`Attempted to remove spectator from Lobby ${this.id}, but they were not found`);
            return;
        }
        this.spectators = this.spectators.filter((s) => s.id !== id);
        logger.info(`Lobby ${this.id}: removing spectator: ${spectator.username}, id: ${spectator.id}. Spectator count = ${this.spectators.length}`);
        this.sendLobbyState();
    }

    public addLobbyUser(user, socket: Socket): void {
        const existingUser = this.users.find((u) => u.id === user.id);
        const existingSpectator = this.spectators.find((s) => s.id === user.id);
        if (existingSpectator) {
            // we remove the spectator and disconnect since the user should not come here
            this.removeSpectator(user.id);
            socket.disconnect();
            return;
        }
        // we check if listeners for the events already exist
        if (socket.eventContainsListener('game') || socket.eventContainsListener('lobby')) {
            socket.removeEventsListeners(['game', 'lobby']);
        }

        socket.registerEvent('game', (socket, command, ...args) => this.onGameMessage(socket, command, ...args));
        socket.registerEvent('lobby', (socket, command, ...args) => this.onLobbyMessage(socket, command, ...args));

        if (existingUser) {
            existingUser.state = 'connected';
            existingUser.socket = socket;
            logger.info(`Lobby ${this.id}: addLobbyUser: setting state to connected for existing user: ${user.username}`);
        } else {
            this.users.push({
                id: user.id,
                username: user.username,
                state: 'connected',
                ready: false,
                socket
            });
            logger.info(`Lobby ${this.id}: addLobbyUser: adding username: ${user.username}, id: ${user.id} to users list (${this.users.length} user(s))`);
            this.gameChat.addMessage(`${user.username} has joined the lobby`);
        }

        this.updateUserLastActivity(user.id);

        if (this.game) {
            this.sendGameState(this.game);
        } else {
            // do a check to make sure that the lobby owner is still registered in the lobby. if not, set the incoming user as the new lobby owner.
            if (this.server.getUserLobbyId(this.lobbyOwnerId) !== this.id) {
                logger.info(`Lobby ${this.id}: lobby owner ${this.lobbyOwnerId} is not in the lobby, setting new lobby owner to ${user.id}`);
                this.removeUser(this.lobbyOwnerId);
                this.lobbyOwnerId = user.id;
            }

            this.sendLobbyState();
        }
    }

    private setReadyStatus(socket: Socket, ...args) {
        Contract.assertTrue(args.length === 1 && typeof args[0] === 'boolean', 'Ready status arguments aren\'t boolean or present');
        const currentUser = this.users.find((u) => u.id === socket.user.id);
        if (!currentUser) {
            return;
        }
        currentUser.ready = args[0];
        logger.info(`Lobby ${this.id}: User: ${currentUser.username} set ready status: ${args[0]}`);
        this.updateUserLastActivity(currentUser.id);
    }

    private sendChatMessage(socket: Socket, ...args) {
        const existingUser = this.users.find((u) => u.id === socket.user.id);
        Contract.assertNotNullLike(existingUser, `Unable to find user with id ${socket.user.id} in lobby ${this.id}`);
        Contract.assertTrue(args.length === 1 && typeof args[0] === 'string', 'Chat message arguments are not present or not of type string');
        if (!existingUser) {
            return;
        }

        logger.info(`Lobby ${this.id}: User: ${existingUser.username} sent chat message: ${args[0]}`);
        this.gameChat.addChatMessage(existingUser, args[0]);
        this.sendLobbyState();
    }

    private requestRematch(socket: Socket, ...args: any[]): void {
        // Expect the rematch mode to be passed as the first argument: 'reset' or 'regular'
        Contract.assertTrue(args.length === 1, 'Expected rematch mode argument but argument length is: ' + args.length);
        const mode = args[0];
        Contract.assertTrue(mode === 'reset' || mode === 'regular', 'Invalid rematch mode, expected reset or regular but receieved: ' + mode);

        // Set the rematch request property (allow only one request at a time)
        if (!this.rematchRequest) {
            this.rematchRequest = {
                initiator: socket.user.id,
                mode,
            };
            logger.info(`Lobby ${this.id}: User: ${socket.user.id} requested a rematch (${mode})`);
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
        const activeUser = this.users.find((u) => u.id === socket.user.id);

        // we check if the deck is valid.
        activeUser.importDeckValidationErrors = this.deckValidator.validateSwuDbDeck(args[0], this.gameFormat);

        // if the deck doesn't have any errors set it as active.
        if (Object.keys(activeUser.importDeckValidationErrors).length === 0) {
            activeUser.deck = new Deck(args[0], this.cardDataGetter);
            activeUser.deckValidationErrors = this.deckValidator.validateInternalDeck(activeUser.deck.getDecklist(),
                this.gameFormat);
            activeUser.importDeckValidationErrors = null;
        }
        logger.info(`Lobby ${this.id}: User: ${activeUser.username} changing deck`);

        this.updateUserLastActivity(activeUser.id);
    }

    private updateDeck(socket: Socket, ...args) {
        const source = args[0]; // [<'Deck'|'Sideboard>'<cardID>]
        const cardId = args[1];

        Contract.assertTrue(source === 'Deck' || source === 'Sideboard', `source isn't 'Deck' or 'Sideboard' but ${source}`);

        const user = this.getUser(socket.user.id);
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

        logger.info(`Lobby ${this.id}: User: ${user.username} updating deck`);

        this.updateUserLastActivity(user.id);
    }

    private getUser(id: string) {
        const user = this.users.find((u) => u.id === id);
        Contract.assertNotNullLike(user, `Unable to find user with id ${id} in lobby ${this.id}`);
        return user;
    }

    public setUserDisconnected(id: string): void {
        const user = this.users.find((u) => u.id === id);
        if (user) {
            user.state = 'disconnected';
            logger.info(`Lobby ${this.id}: setting user: ${user.username} to disconnected!`);
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
                player1Leader: player1.deck.leader,
                player1Base: player1.deck.base,
                player2Leader: player2.deck.leader,
                player2Base: player2.deck.base,
            };
        } catch (error) {
            logger.error(`Lobby ${this.id}: Error retrieving lobby game data`, error);
            return null;
        }
    }

    public getUserState(id: string): string {
        const user = this.users.find((u) => u.id === id);
        if (user) {
            return user.state;
        }
        const spectator = this.spectators.find((u) => u.id === id);
        return spectator?.state;
    }

    public isFilled(): boolean {
        return this.users.length >= 2;
    }

    public removeUser(id: string): void {
        const user = this.users.find((u) => u.id === id);
        if (user) {
            this.gameChat.addMessage(`${user.username} has left the lobby`);
        } else {
            return;
        }
        if (this.game) {
            this.game.addMessage(`${user.username} has left the game`);
            const winner = this.users.find((u) => u.id !== id);
            if (winner) {
                this.game.endGame(this.game.getPlayerById(winner.id), `${user.username} has conceded`);
            }
            this.sendGameState(this.game);
        }

        if (this.lobbyOwnerId === id) {
            const newOwner = this.users.find((u) => u.id !== id);
            this.lobbyOwnerId = newOwner?.id;
        }
        this.users = this.users.filter((u) => u.id !== id);
        logger.info(`Lobby ${this.id}: removing user: ${user.username}, id: ${user.id}. User list size = ${this.users.length}`);

        this.sendLobbyState();
    }

    public isEmpty(): boolean {
        return this.users.length === 0;
    }

    public cleanLobby(): void {
        this.game = null;
        this.users = [];
        this.spectators = [];
        logger.info(`Lobby ${this.id}: cleaning lobby`);
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

    private async onStartGameAsync() {
        this.rematchRequest = null;
        const game = new Game(this.buildGameSettings(), { router: this });
        this.game = game;
        game.started = true;

        logger.info(`Lobby ${this.id}: starting game id: ${game.id}`);

        // For each user, if they have a deck, select it in the game
        this.users.forEach((user) => {
            if (user.deck) {
                game.selectDeck(user.id, user.deck);
            }
        });

        await game.initialiseAsync();

        this.sendGameState(game);
    }

    private buildGameSettings(): GameConfiguration {
        const players: User[] = this.users.map((user) =>
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

        return {
            id: '0001',
            name: 'Test Game',
            allowSpectators: false,
            owner: 'Order66',
            gameMode: GameMode.Premier,
            players,
            cardDataGetter: this.cardDataGetter,
        };
    }

    private async onLobbyMessage(socket: Socket, command: string, ...args): Promise<void> {
        if (!this[command] || typeof this[command] !== 'function') {
            throw new Error(`Incorrect command or command format expected function but got: ${command}`);
        }

        await this[command](socket, ...args);
        this.sendLobbyState();
    }

    private async onGameMessage(socket: Socket, command: string, ...args): Promise<void> {
        if (!this.game) {
            return;
        }

        // if (command === 'leavegame') {
        //     return this.onLeaveGame(socket);
        // }

        if (!this.game[command] || typeof this.game[command] !== 'function') {
            return;
        }

        this.game.stopNonChessClocks();
        await this.game[command](socket.user.id, ...args);

        this.game.continue();

        this.sendGameState(this.game);
    }


    // TODO: Review this to make sure we're getting the info we need for debugging
    public handleError(game: Game, e: Error, severeGameMessage = false) {
        logger.error(`Lobby ${this.id}: handleError: `, e);

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
    }

    private sendGameStateToSpectator(socket: Socket, spectatorId: string): void {
        if (this.game) {
            socket.send('gamestate', this.game.getState(spectatorId));
        }
    }

    private sendLobbyStateToSpectator(socket: Socket): void {
        socket.socket.send('lobbystate', this.getLobbyState());
    }

    public sendGameState(game: Game): void {
        for (const user of this.users) {
            if (user.state === 'connected' && user.socket) {
                user.socket.send('gamestate', game.getState(user.id));
            }
        }
        for (const user of this.spectators) {
            if (user.socket) {
                user.socket.send('gamestate', game.getState(user.id));
            }
        }
    }

    public sendLobbyState(): void {
        for (const user of this.users) {
            if (user.state === 'connected' && user.socket) {
                user.socket.send('lobbystate', this.getLobbyState());
            }
        }
    }
}