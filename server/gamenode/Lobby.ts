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
import type { IDeckValidationFailures } from '../utils/deck/DeckInterfaces';
import type { GameConfiguration } from '../game/core/GameInterfaces';
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
    private readonly lobbyCreateTime: Date = new Date();

    private game?: Game;
    public users: LobbyUser[] = [];
    public spectators: LobbySpectator[] = [];
    private lobbyOwnerId: string;
    public gameType: MatchType;
    public gameFormat: SwuGameFormat;
    private rematchRequest?: RematchRequest = null;
    private userLastActivity = new Map<string, Date>();
    private usersLeftCount = 0;

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

    public hasPlayer(id: string) {
        return this.users.some((u) => u.id === id);
    }

    public createLobbyUser(user: User, decklist = null): void {
        const existingUser = this.users.find((u) => u.id === user.getPlayerId());
        const deck = decklist ? new Deck(decklist, this.cardDataGetter) : null;
        if (existingUser) {
            existingUser.deck = deck;
            return;
        }

        this.users.push(({
            id: user.getPlayerId(),
            username: user.getUsername(),
            state: null,
            ready: false,
            socket: null,
            deckValidationErrors: deck ? this.deckValidator.validateInternalDeck(deck.getDecklist(), this.gameFormat) : {},
            deck
        }));
        logger.info(`Creating username: ${user.getUsername()}, id: ${user.getPlayerId()} and adding to users list (${this.users.length} user(s))`, { lobbyId: this.id, userName: user.getUsername(), userId: user.getPlayerId() });
        this.gameChat.addMessage(`${user.getUsername()} has created and joined the lobby`);

        this.updateUserLastActivity(user.getPlayerId());
    }

    public addSpectator(user: User, socket: Socket): void {
        const existingSpectator = this.spectators.find((s) => s.id === user.getPlayerId());
        const existingPlayer = this.users.find((s) => s.id === user.getPlayerId());
        if (existingPlayer) {
            // we remove the player and disconnect since the user should not come here
            this.removeUser(user.getPlayerId());
            socket.disconnect();
            return;
        }
        if (!existingSpectator) {
            this.spectators.push({
                id: user.getPlayerId(),
                username: user.getPlayerId(),
                socket,
                state: 'connected'
            });
        } else {
            existingSpectator.state = 'connected';
            existingSpectator.socket = socket;
        }
        // If game is ongoing, send the current state to the spectator
        if (this.game) {
            this.sendGameStateToSpectator(socket, user.getPlayerId());
        } else {
            this.sendLobbyStateToSpectator(socket);
        }
        logger.info(`Adding spectator: ${user.getUsername()}, id: ${user.getPlayerId()} (${this.spectators.length} spectator(s))`, { lobbyId: this.id, userName: user.getUsername(), userId: user.getPlayerId() });
    }

    public removeSpectator(id: string): void {
        const spectator = this.spectators.find((s) => s.id === id);
        if (!spectator) {
            // TODO: re-add this if we want to start doing verbose logging
            // logger.info(`Attempted to remove spectator from Lobby ${this.id}, but they were not found`);
            return;
        }
        this.spectators = this.spectators.filter((s) => s.id !== id);
        logger.info(`Removing spectator: ${spectator.username}, id: ${spectator.id}. Spectator count = ${this.spectators.length}`, { lobbyId: this.id, userName: spectator.username, userId: spectator.id });
        this.sendLobbyState();
    }

    public addLobbyUser(user: User, socket: Socket): void {
        const existingUser = this.users.find((u) => u.id === user.getPlayerId());
        const existingSpectator = this.spectators.find((s) => s.id === user.getPlayerId());
        if (existingSpectator) {
            // we remove the spectator and disconnect since the user should not come here
            this.removeSpectator(user.getPlayerId());
            socket.disconnect();
            return;
        }

        Contract.assertFalse(!existingUser && this.isFilled(), `Attempting to add user ${user.getPlayerId()} to lobby ${this.id}, but the lobby already has ${this.users.length} users`);

        // we check if listeners for the events already exist
        if (socket.eventContainsListener('game') || socket.eventContainsListener('lobby')) {
            socket.removeEventsListeners(['game', 'lobby']);
        }

        socket.registerEvent('game', (socket, command, ...args) => this.onGameMessage(socket, command, ...args));
        socket.registerEvent('lobby', (socket, command, ...args) => this.onLobbyMessage(socket, command, ...args));

        if (existingUser) {
            existingUser.state = 'connected';
            existingUser.socket = socket;
            logger.info(`addLobbyUser: setting state to connected for existing user: ${user.getUsername()}`, { lobbyId: this.id, userName: user.getUsername(), userId: user.getPlayerId() });
        } else {
            this.users.push({
                id: user.getPlayerId(),
                username: user.getUsername(),
                state: 'connected',
                ready: false,
                socket
            });
            logger.info(`addLobbyUser: adding username: ${user.getUsername()}, id: ${user.getPlayerId()} to users list (${this.users.length} user(s))`, { lobbyId: this.id, userName: user.getUsername(), userId: user.getPlayerId() });
            this.gameChat.addMessage(`${user.getUsername()} has joined the lobby`);
        }

        this.updateUserLastActivity(user.getPlayerId());

        if (this.game) {
            this.sendGameState(this.game);
        } else {
            // do a check to make sure that the lobby owner is still registered in the lobby. if not, set the incoming user as the new lobby owner.
            if (this.server.getUserLobbyId(this.lobbyOwnerId) !== this.id) {
                logger.info(`Lobby owner ${this.lobbyOwnerId} is not in the lobby, setting new lobby owner to ${user.getPlayerId()}`, { lobbyId: this.id, userName: user.getUsername(), userId: user.getPlayerId() });
                this.removeUser(this.lobbyOwnerId);
                this.lobbyOwnerId = user.getPlayerId();
            }

            this.sendLobbyState();
        }
    }

    private setReadyStatus(socket: Socket, ...args) {
        Contract.assertTrue(args.length === 1 && typeof args[0] === 'boolean', 'Ready status arguments aren\'t boolean or present');
        const currentUser = this.users.find((u) => u.id === socket.user.getPlayerId());
        if (!currentUser) {
            return;
        }
        currentUser.ready = args[0];
        logger.info(`User: ${currentUser.username} set ready status: ${args[0]}`, { lobbyId: this.id, userName: currentUser.username, userId: currentUser.id });
        this.updateUserLastActivity(currentUser.id);
    }

    private sendChatMessage(socket: Socket, ...args) {
        const existingUser = this.users.find((u) => u.id === socket.user.getPlayerId());
        Contract.assertNotNullLike(existingUser, `Unable to find user with id ${socket.user.getPlayerId()} in lobby ${this.id}`);
        Contract.assertTrue(args.length === 1 && typeof args[0] === 'string', 'Chat message arguments are not present or not of type string');
        if (!existingUser) {
            return;
        }

        logger.info(`User: ${existingUser.username} sent chat message: ${args[0]}`, { lobbyId: this.id, userName: existingUser.username, userId: existingUser.id });
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
                initiator: socket.user.getPlayerId(),
                mode,
            };
            logger.info(`User: ${socket.user.getPlayerId()} requested a rematch (${mode})`, { lobbyId: this.id, userName: socket.user.username, userId: socket.user.id });
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
        const activeUser = this.users.find((u) => u.id === socket.user.getPlayerId());

        // we check if the deck is valid.
        activeUser.importDeckValidationErrors = this.deckValidator.validateSwuDbDeck(args[0], this.gameFormat);

        // if the deck doesn't have any errors set it as active.
        if (Object.keys(activeUser.importDeckValidationErrors).length === 0) {
            activeUser.deck = new Deck(args[0], this.cardDataGetter);
            activeUser.deckValidationErrors = this.deckValidator.validateInternalDeck(activeUser.deck.getDecklist(),
                this.gameFormat);
            activeUser.importDeckValidationErrors = null;
        }
        logger.info(`User: ${activeUser.username} changing deck`, { lobbyId: this.id, userName: activeUser.username, userId: activeUser.id });

        this.updateUserLastActivity(activeUser.id);
    }

    private updateDeck(socket: Socket, ...args) {
        const source = args[0]; // [<'Deck'|'Sideboard>'<cardID>]
        const cardId = args[1];

        Contract.assertTrue(source === 'Deck' || source === 'Sideboard', `source isn't 'Deck' or 'Sideboard' but ${source}`);

        const user = this.getUser(socket.user.getPlayerId());
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

        logger.info(`User: ${user.username} updating deck`, { lobbyId: this.id, userName: user.username, userId: user.id });

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
            logger.info(`Setting user: ${user.username} to disconnected!`, { lobbyId: this.id, userName: user.username, userId: user.id });
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
            logger.error('Error retrieving lobby game data',
                { error: { message: error.message, stack: error.stack }, lobbyId: this.id });
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
        logger.info(`Removing user: ${user.username}, id: ${user.id}. User list size = ${this.users.length}`, { lobbyId: this.id, userName: user.username, userId: user.id });

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
                logger.info(`Cleaning lobby ${this.id} after more than 5 minutes of inactivity and 5 users left`, { lobbyId: this.id });
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
        logger.info('Cleaning lobby', { lobbyId: this.id });
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

        logger.info(`Starting game id: ${game.id}`, { lobbyId: this.id });

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
        try {
            if (!this[command] || typeof this[command] !== 'function') {
                throw new Error(`Incorrect command or command format expected function but got: ${command}`);
            }

            await this[command](socket, ...args);
            this.sendLobbyState();
        } catch (error) {
            logger.error('Error processing lobby message', { error: { message: error.message, stack: error.stack }, lobbyId: this.id });
        }
    }

    private async onGameMessage(socket: Socket, command: string, ...args): Promise<void> {
        try {
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
            await this.game[command](socket.user.getPlayerId(), ...args);

            this.game.continue();

            this.sendGameState(this.game);
        } catch (error) {
            logger.error('Error processing game message', { error: { message: error.message, stack: error.stack }, lobbyId: this.id });
        }
    }


    // TODO: Review this to make sure we're getting the info we need for debugging
    public handleError(game: Game, error: Error, severeGameMessage = false) {
        logger.error('handleError: ', { error: { message: error.message, stack: error.stack }, lobbyId: this.id });

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

    /**
     * Updates deck statistics when a game ends
     * @param game The game that has ended
     */
    private async endGameUpdateStats(game: Game): Promise<void> {
        try {
            // Only update stats if the game has a winner
            if (!game.winner || !game.finishedAt) {
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
            if (game.winner.includes(player1.name)) {
                winner = player1;
                loser = player2;
            } else if (game.winner.includes(player2.name)) {
                winner = player2;
                loser = player1;
            }

            // If we have a draw (or couldn't determine winner/loser), set as draw
            const isDraw = !winner || !loser || game.winner.length > 1;

            // Get the user & deck information for each player
            const player1User = this.users.find((u) => u.id === player1.id);
            const player2User = this.users.find((u) => u.id === player2.id);

            if (!player1User?.deck || !player2User?.deck) {
                logger.warn(`Lobby ${this.id}: Missing deck information for one or both players`);
                return;
            }

            // Get the leader & base IDs for each player
            const player1LeaderId = player1User.deck.leader.id;
            const player1BaseId = player1User.deck.base.id;
            const player2LeaderId = player2User.deck.leader.id;
            const player2BaseId = player2User.deck.base.id;

            // Get the deck service
            const deckService = this.server.getDeckService();
            if (!deckService) {
                logger.warn(`Lobby ${this.id}: Could not get DeckService`);
                return;
            }
            if (player1User.socket.user.isAuthenticatedUser()) {
                // Update stats for player 1's deck
                if (isDraw) {
                    await deckService.updateDeckStats(
                        player1User.socket.user.getId(),
                        player1User.deck.id,
                        'draw',
                        player2LeaderId,
                        player2BaseId
                    );
                } else if (winner === player1) {
                    await deckService.updateDeckStats(
                        player1User.socket.user.getId(),
                        player1User.deck.id,
                        'win',
                        player2LeaderId,
                        player2BaseId
                    );
                } else {
                    await deckService.updateDeckStats(
                        player1User.id,
                        player1User.deck.id,
                        'loss',
                        player2LeaderId,
                        player2BaseId
                    );
                }
            }
            if (player2User.socket.user.isAuthenticatedUser()) {
                // Update stats for player 2's deck
                if (isDraw) {
                    await deckService.updateDeckStats(
                        player2User.id,
                        player2User.deck.id,
                        'draw',
                        player1LeaderId,
                        player1BaseId
                    );
                } else if (winner === player2) {
                    await deckService.updateDeckStats(
                        player2User.id,
                        player2User.deck.id,
                        'win',
                        player1LeaderId,
                        player1BaseId
                    );
                } else {
                    await deckService.updateDeckStats(
                        player2User.id,
                        player2User.deck.id,
                        'loss',
                        player1LeaderId,
                        player1BaseId
                    );
                }
            }
            logger.info(`Lobby ${this.id}: Successfully updated deck stats for game ${game.id}`);
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

    public sendGameState(game: Game): void {
        // we check here if the game ended and update the stats.
        if (game.winner && game.finishedAt && !game.statsUpdated) {
            // Update deck stats asynchronously
            game.statsUpdated = true;
            this.endGameUpdateStats(game).catch((error) => {
                logger.error(`Lobby ${this.id}: Failed to update deck stats:`, error);
            });
        }
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