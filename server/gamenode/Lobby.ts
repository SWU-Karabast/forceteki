import Game from '../game/core/Game';
import type Player from '../game/core/Player';
import { v4 as uuid } from 'uuid';
import Socket from '../socket';
import defaultGameSettings from './defaultGame';

export class Lobby {
    private readonly _id: string;
    private game: Game;
    private participants = new Map<string, Socket>();

    public constructor() {
        this._id = uuid();
    }

    public get id(): string {
        return this._id;
    }

    public addParticipant(id: string, socket: Socket): void {
        this.participants.set(id, socket);
        socket.registerEvent('startGame', () => this.onStartGame());
        socket.registerEvent('game', (command, ...args) => this.onGameMessage(socket, command, ...args));

        if (this.game) {
            this.sendGameState(this.game);
        }
    }

    public removeParticipant(id: string): void {
        this.participants.delete(id);
    }

    public isLobbyEmpty(): boolean {
        return this.participants.size === 0;
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
        for (const [participant, socket] of this.participants) {
            socket.send('gamestate', game.getState(participant));
        }
    }
}