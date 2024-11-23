import Game from '../game/core/Game';
import uuidv4 from 'uuid';

export class Lobby {

    private readonly _id: string;
    private game: Game;
    private usersAndSpectators: any = [];

    public constructor() {
        this._id = uuidv4();
    }

    get id(): string {
        return this._id;
    }

    // public onGameMessage(socket, command, ...args) {
        
    //     if (!this.game) {
    //         return;
    //     }

    //     if (command === 'leavegame') {
    //         return this.onLeaveGame(socket);
    //     }

    //     if (!this.game[command] || typeof this.game[command] !== 'function') {
    //         return;
    //     }

    //     this.runAndCatchErrors(game, () => {
    //         game.stopNonChessClocks();
    //         game[command](socket.user.username, ...args);

    //         game.continue();

    //         this.sendGameState(game);
    //     });
    // }

    // public runAndCatchErrors(game: Game, func: () => void) {
    //     try {
    //         func();
    //     } catch (e) {
    //         this.handleError(game, e);

    //         this.sendGameState(game);
    //     }
    // }

    // TODO: Review this to make sure we're getting the info we need for debugging
    // public handleError(game: Game, e: Error) {
    //     logger.error(e);

    //     const gameState = game.getState();
    //     const debugData: any = {};

    //     if (e.message.includes('Maximum call stack')) {
    //         // debugData.badSerializaton = detectBinary(gameState);
    //     } else {
    //         debugData.game = gameState;
    //         debugData.game.players = undefined;

    //         debugData.messages = game.messages;
    //         debugData.game.messages = undefined;

    //         debugData.pipeline = game.pipeline.getDebugInfo();
    //         // debugData.effectEngine = game.effectEngine.getDebugInfo();

    //         for (const player of game.getPlayers()) {
    //             debugData[player.name] = player.getState(player);
    //         }
    //     }

    //     if (game) {
    //         game.addMessage(
    //             'A Server error has occured processing your game state, apologies.  Your game may now be in an inconsistent state, or you may be able to continue.  The error has been logged.'
    //         );
    //     }
    // }

    // public sendGameState(game: Game): void {
    //     for (const player of Object.values<Player>(game.getPlayersAndSpectators())) {
    //         if (player.socket && !player.left && !player.disconnected) {
    //             player.socket.send('gamestate', game.getState(player.name));
    //         }
    //     }
    // }
}