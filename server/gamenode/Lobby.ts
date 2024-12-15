import Game from '../game/core/Game';
import type Player from '../game/core/Player';
import { v4 as uuid } from 'uuid';
import Socket from '../socket';
import defaultGameSettings from './defaultGame';
import { Deck } from '../game/Deck';

interface LobbyUser {
    id: string;
    state: 'connected' | 'disconnected';
    socket: Socket | null;
    deck: Deck | null;
}

export class Lobby {
    private readonly _id: string;
    private game: Game;
    // switch partic
    private users: LobbyUser[] = [];

    public constructor() {
        this._id = uuid();
    }

    public get id(): string {
        return this._id;
    }

    public createLobbyUser(id: string, deck): void {
        const existingUser = this.users.find((u) => u.id === id);
        const newDeck = new Deck(deck);

        if (existingUser) {
            existingUser.deck = newDeck.data;
            return;
        }
        this.users.push(({ id: id, state: null, socket: null, deck: newDeck.data }));
    }

    public addLobbyUser(id: string, socket: Socket): void {
        const existingUser = this.users.find((u) => u.id === id);
        socket.registerEvent('startGame', () => this.onStartGame(id));
        socket.registerEvent('game', (socket, command, ...args) => this.onGameMessage(socket, command, ...args));
        // maybe we neeed to be using socket.data
        if (existingUser) {
            existingUser.state = 'connected';
            existingUser.socket = socket;
        } else {
            this.users.push({ id: id, state: 'connected', socket, deck: null });
        }

        if (this.game) {
            this.sendGameState(this.game);
        } else {
            this.sendDeckInfo();
        }
    }

    public setUserDisconnected(id: string): void {
        this.users.find((u) => u.id === id).state = 'disconnected';
    }

    public getUserState(id: string): string {
        return this.users.find((u) => u.id === id).state;
    }

    public isLobbyFilled(): boolean {
        return this.users.length === 2;
    }

    public removeLobbyUser(id: string): void {
        this.users = this.users.filter((u) => u.id !== id);
    }

    public isLobbyEmpty(): boolean {
        return this.users.length === 0;
    }

    public setDeck(id: string, deck: any): void {
        const player = this.users.find((u) => u.id === id);
        player.deck = deck;
    }

    public cleanLobby(): void {
        this.game = null;
        this.users = [];
    }

    private onStartGame(id: string): void {
        const game = new Game(defaultGameSettings, { router: this });
        this.game = game;
        const existingUser = this.users.find((u) => u.id === id);
        const opponent = this.users.find((u) => u.id !== id);
        game.started = true;
        // for (const player of Object.values<Player>(pendingGame.players)) {
        //     game.selectDeck(player.name, player.deck);
        // }

        // fetch deck for existing user otherwise set default
        if (existingUser.deck) {
            game.selectDeck(id, existingUser.deck);
        } else {
            game.selectDeck(id, defaultGameSettings.players[0].deck);
        }

        // if opponent exist fetch deck for opponent otherwise set it as default
        if (opponent) {
            if (opponent.deck) {
                game.selectDeck(opponent.id, opponent.deck);
            } else {
                game.selectDeck(opponent.id, defaultGameSettings.players[0].deck);
            }
        } else {
            game.selectDeck('ThisIsTheWay', defaultGameSettings.players[0].deck);
        }

        game.initialise();

        this.sendGameState(game);
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
            this.game[command](socket.user.username, ...args);

            this.game.continue();

            this.sendGameState(this.game);
        });
    }

    private runAndCatchErrors(game: Game, func: () => void) {
        try {
            func();
        } catch (e) {
            // this.handleError(game, e);

            // this.sendGameState(game);
        }
    }

    // TODO: Review this to make sure we're getting the info we need for debugging
    private handleError(game: Game, e: Error) {
        // logger.error(e);

        const gameState = game.getState();
        const debugData: any = {};

        if (e.message.includes('Maximum call stack')) {
            // debugData.badSerializaton = detectBinary(gameState);
        } else {
            debugData.game = gameState;
            debugData.game.players = undefined;

            debugData.messages = game.messages;
            debugData.game.messages = undefined;

            debugData.pipeline = game.pipeline.getDebugInfo();
            // debugData.effectEngine = game.effectEngine.getDebugInfo();

            for (const player of game.getPlayers()) {
                debugData[player.name] = player.getState(player);
            }
        }

        if (game) {
            game.addMessage(
                'A Server error has occured processing your game state, apologies.  Your game may now be in an inconsistent state, or you may be able to continue.  The error has been logged.'
            );
        }
    }

    public sendGameState(game: Game): void {
        for (const user of this.users) {
            if (user.state === 'connected' && user.socket) {
                user.socket.send('gamestate', game.getState(user.id));
                user.socket.send('deckData', user.deck);
            }
        }
    }

    public sendDeckInfo(): void {
        for (const user of this.users) {
            if (user.state === 'connected' && user.socket) {
                user.socket.send('deckData', user.deck);
            }
        }
    }
}