import type { Game } from '../Game';
import type { Player } from '../Player';
import type { IActionTimer } from './IActionTimer';

/** What an action timer uses of its player: the name its errors are logged under. */
export type IActionTimerPlayer = Pick<Player, 'name'>;

/** What an action timer uses of its game: the clock it runs on, and the id its errors are logged under. */
export type IActionTimerGame = Pick<Game, 'scheduler' | 'id'>;
import { SimpleActionTimer } from './SimpleActionTimer';

/**
 * Action timer for in-game player actions: a SimpleActionTimer on the game's scheduler that calls `onTimeout` when it
 * runs out. A player's messages do not affect it; only the prompts that start, stop and pause it do.
 */
export class GameActionTimer extends SimpleActionTimer implements IActionTimer {
    public constructor(
        timeLimitSeconds: number,
        player: IActionTimerPlayer,
        game: IActionTimerGame,
        onTimeout: () => void
    ) {
        super(
            timeLimitSeconds,
            game.scheduler,
            { message: `Error in action timer handler for player ${player.name}`, metadata: { gameId: game.id } }
        );

        // Add timeout handler at 0 seconds remaining
        this.onSpecificTimeHandlers.push({ fireOnRemainingTimeMs: 0, handler: onTimeout });
    }
}
