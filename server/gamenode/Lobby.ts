import Game from '../game/core/Game';
import type Player from '../game/core/Player';
import { v4 as uuid } from 'uuid';
import Socket from '../socket';
import defaultGameSettings from './defaultGame';

interface LobbyUser {
    id: string;
    state: 'connected' | 'disconnected';
    socket: Socket | null;
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

    public addLobbyUser(id: string, socket: Socket): void {
        const existingUser = this.users.find((u) => u.id === id);

        socket.registerEvent('startGame', () => this.onStartGame());
        socket.registerEvent('game', (socket, command, ...args) => this.onGameMessage(socket, command, ...args));
        // socket.on('disconnect', () => {this.disconnectLobbyUser(id)});
        // figuring out how to properly mark a user disconnected
        // maybe we neeed to be using socket.data
        if (existingUser) {
            existingUser.state = 'connected';
            existingUser.socket = socket;
        } else {
            this.users.push({ id: id, state: 'connected', socket });
        }


        if (this.game) {
            this.sendGameState(this.game);
        }
    }

    public removeLobbyUser(id: string): void {
        this.users = this.users.filter((u) => u.id !== id);
    }

    public isLobbyEmpty(): boolean {
        return this.users.length === 0;
    }

    private onStartGame(): void {
        const game = new Game(defaultGameSettings, { router: this });
        this.game = game;

        game.started = true;
        // for (const player of Object.values<Player>(pendingGame.players)) {
        //     game.selectDeck(player.name, player.deck);
        // }
        game.selectDeck('Order66', defaultGameSettings.players[0].deck);
        game.selectDeck('ThisIsTheWay', defaultGameSettings.players[1].deck);

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
            }
        }
    }
}