import Game from '../game/core/Game';
import { v4 as uuid } from 'uuid';
import type Socket from '../socket';
import defaultGameSettings from './defaultGame';
import * as Contract from '../game/core/utils/Contract';
import fs from 'fs';
import path from 'path';
import { logger } from '../logger';
import { GameChat } from '../game/core/chat/GameChat';
import type { CardDataGetter, ITokenCardsData } from '../utils/cardData/CardDataGetter';
import { Deck } from '../utils/deck/Deck';

interface LobbyUser {
    id: string;
    username: string;
    state: 'connected' | 'disconnected';
    ready: boolean;
    socket?: Socket;
    deck?: Deck;
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
    public readonly isPrivate: boolean;
    private readonly connectionLink?: string;
    private readonly gameChat: GameChat;
    private readonly cardDataGetter: CardDataGetter; // TODO: currently not used but will be once we migrate card loading logic out of the FE
    private readonly testGameBuilder?: any;
    private readonly tokenCardsData: ITokenCardsData;
    private readonly playableCardTitles: string[];

    private game: Game;
    private users: LobbyUser[] = [];
    private lobbyOwnerId: string;
    private gameType: MatchType;
    private rematchRequest?: RematchRequest = null;

    public constructor(lobbyGameType: MatchType, cardDataGetter: CardDataGetter, tokenCardsData: ITokenCardsData, playableCardTitles: string[], testGameBuilder?: any) {
        Contract.assertTrue(
            [MatchType.Custom, MatchType.Private, MatchType.Quick].includes(lobbyGameType),
            `Lobby game type ${lobbyGameType} doesn't match any MatchType values`
        );
        this._id = uuid();
        this.gameChat = new GameChat();
        this.connectionLink = lobbyGameType !== MatchType.Quick ? this.createLobbyLink() : null;
        this.isPrivate = lobbyGameType === MatchType.Private;
        this.gameType = lobbyGameType;
        this.cardDataGetter = cardDataGetter;
        this.testGameBuilder = testGameBuilder;
        this.playableCardTitles = playableCardTitles;
        this.tokenCardsData = tokenCardsData;
    }

    public get id(): string {
        return this._id;
    }

    public getLobbyState(): any {
        return {
            id: this._id,
            users: this.users.map((u) => ({
                id: u.id,
                username: u.username,
                state: u.state,
                ready: u.ready,
                deck: u.deck?.getDecklist(),
            })),
            gameOngoing: !!this.game,
            gameChat: this.gameChat,
            lobbyOwnerId: this.lobbyOwnerId,
            isPrivate: this.isPrivate,
            connectionLink: this.connectionLink,
            gameType: this.gameType,
            rematchRequest: this.rematchRequest,
        };
    }

    private createLobbyLink(): string {
        return process.env.ENVIRONMENT === 'development'
            ? `http://localhost:3000/lobby?lobbyId=${this._id}`
            : `https://beta.karabast.net/lobby?lobbyId=${this._id}`;
    }

    public createLobbyUser(user, decklist = null): void {
        const existingUser = this.users.find((u) => u.id === user.id);
        const deck = decklist ? new Deck(decklist) : null;
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
            deck
        }));
    }

    public addLobbyUser(user, socket: Socket): void {
        const existingUser = this.users.find((u) => u.id === user.id);
        // we check if listeners for the events already exist
        if (socket.eventContainsListener('game') || socket.eventContainsListener('lobby')) {
            socket.removeEventsListeners(['game', 'lobby']);
        }

        socket.registerEvent('game', (socket, command, ...args) => this.onGameMessage(socket, command, ...args));
        socket.registerEvent('lobby', (socket, command, ...args) => this.onLobbyMessage(socket, command, ...args));

        if (existingUser) {
            existingUser.state = 'connected';
            existingUser.socket = socket;
        } else {
            this.users.push({
                id: user.id,
                username: user.username,
                state: 'connected',
                ready: false,
                socket
            });
        }

        if (this.game) {
            this.sendGameState(this.game);
        } else {
            this.sendLobbyState();
        }
    }

    private setReadyStatus(socket: Socket, ...args) {
        Contract.assertTrue(args.length === 1 && typeof args[0] === 'boolean', 'Ready status arguments aren\'t boolean or present');
        const currentUser = this.users.find((u) => u.id === socket.user.id);
        currentUser.ready = args[0];
    }

    private sendChatMessage(socket: Socket, ...args) {
        // we need to get the player and message
        Contract.assertTrue(args.length === 1 && typeof args[0] === 'string', 'Chat message arguments are not present or not of type string');
        this.gameChat.addChatMessage(socket.user, args[0]);
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
            logger.info(`User ${socket.user.id} requested a rematch (${mode}) in lobby ${this._id}`);
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
        Contract.assertTrue(args[0] !== null);
        Contract.assertTrue(args[1] !== null);
        activeUser.deck = new Deck(args[1]);
    }

    private updateDeck(socket: Socket, ...args) {
        const source = args[0]; // [<'Deck'|'Sideboard>'<cardID>]
        const cardId = args[1];

        Contract.assertTrue(source === 'Deck' || source === 'Sideboard', `source isn't 'Deck' or 'Sideboard' but ${source}`);

        const userDeck = this.getUser(socket.user.id).deck;

        if (source === 'Deck') {
            userDeck.moveToSideboard(cardId);
        } else {
            userDeck.moveToDeck(cardId);
        }
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
        }
    }

    public hasOngoingGame(): boolean {
        return this.game !== undefined;
    }

    public setLobbyOwner(id: string): void {
        this.lobbyOwnerId = id;
    }

    public getUserState(id: string): string {
        const user = this.users.find((u) => u.id === id);
        return user ? user.state : null;
    }

    public isFilled(): boolean {
        return this.users.length === 2;
    }

    public removeUser(id: string): void {
        this.users = this.users.filter((u) => u.id !== id);
        this.sendLobbyState();
    }

    public isEmpty(): boolean {
        return this.users.length === 0;
    }

    public cleanLobby(): void {
        this.game = null;
        this.users = [];
    }

    public async startTestGameAsync(filename: string) {
        const testJSONPath = path.resolve(__dirname, `../../../test/gameSetups/${filename}`);
        Contract.assertTrue(fs.existsSync(testJSONPath), `Test game setup file ${testJSONPath} doesn't exist`);

        const setupData = JSON.parse(fs.readFileSync(testJSONPath, 'utf8'));

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
        // TODO Change this to actual new GameSettings when we get to that point.
        this.rematchRequest = null;
        defaultGameSettings.players[0].user.id = this.users[0].id;
        defaultGameSettings.players[0].user.username = this.users[0].username;

        defaultGameSettings.players[1].user.id = this.users[1].id;
        defaultGameSettings.players[1].user.username = this.users[1].username;
        defaultGameSettings.playableCardTitles = this.playableCardTitles;
        defaultGameSettings.cardDataGetter = this.cardDataGetter;

        const game = new Game(defaultGameSettings, { router: this });
        this.game = game;
        game.started = true;

        // For each user, if they have a deck, select it in the game
        this.users.forEach((user) => {
            if (user.deck) {
                game.selectDeck(user.id, user.deck);
            }
        });

        game.initialiseTokens(this.tokenCardsData);
        await game.initialiseAsync();

        this.sendGameState(game);
    }

    private onLobbyMessage(socket: Socket, command: string, ...args): void {
        if (!this[command] || typeof this[command] !== 'function') {
            throw new Error(`Incorrect command or command format expected function but got: ${command}`);
        }

        this.runLobbyFuncAndCatchErrors(() => {
            this[command](socket, ...args);
            this.sendLobbyState();
        });
    }

    private onGameMessage(socket: Socket, command: string, ...args): void {
        if (!this.game) {
            return;
        }

        // if (command === 'leavegame') {
        //     return this.onLeaveGame(socket);
        // }

        if (!this.game[command] || typeof this.game[command] !== 'function') {
            return;
        }

        this.runAndCatchErrors(this.game, () => {
            this.game.stopNonChessClocks();
            this.game[command](socket.user.id, ...args);

            this.game.continue();

            this.sendGameState(this.game);
        });
    }

    private runAndCatchErrors(game: Game, func: () => void) {
        try {
            func();
        } catch (e) {
            this.handleError(game, e);
            this.sendGameState(game);
        }
    }

    // might just use the top function at some point?
    private runLobbyFuncAndCatchErrors(func: () => void) {
        try {
            func();
        } catch (e) {
            logger.error(e);
            this.sendLobbyState();
        }
    }

    // TODO: Review this to make sure we're getting the info we need for debugging
    private handleError(game: Game, e: Error) {
        logger.error(e);

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

        // if (game) {
        //     game.addMessage(
        //         'A Server error has occured processing your game state, apologies.  Your game may now be in an inconsistent state, or you may be able to continue.  The error has been logged.'
        //     );
        // }
    }

    public sendGameState(game: Game): void {
        for (const user of this.users) {
            if (user.state === 'connected' && user.socket) {
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