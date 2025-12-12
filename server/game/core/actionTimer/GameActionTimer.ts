import { logger } from '../../../logger';
import type Game from '../Game';
import type { Player } from '../Player';
import type { IActionTimer } from './IActionTimer';
import { SimpleActionTimer } from './SimpleActionTimer';

/**
 * Action timer for in-game player actions. Extends SimpleActionTimer with
 * Game/Player-specific safety checks to prevent accidentally kicking players.
 */
export class GameActionTimer extends SimpleActionTimer implements IActionTimer {
    private readonly game: Game;
    private readonly player: Player;

    /** Safety check method to ensure that game state still matches when the timer was created */
    private readonly checkLiveStatus: (promptUuid: string, playerActionId: number) => boolean;

    private lastPlayerActionId: number | null = null;
    private activeUiPromptId: string | null = null;

    public constructor(
        timeLimitSeconds: number,
        player: Player,
        game: Game,
        onTimeout: () => void,
        checkLiveStatus: (promptUuid: string, playerActionId: number) => boolean
    ) {
        super(
            timeLimitSeconds,
            (callback, delayMs) => game.buildSafeTimeout(callback, delayMs, `Error in action timer handler for player ${player.name}`)
        );

        this.player = player;
        this.game = game;
        this.checkLiveStatus = checkLiveStatus;

        // Add timeout handler at 0 seconds remaining
        this.onSpecificTimeHandlers.push({ fireOnRemainingTimeMs: 0, handler: onTimeout });
    }

    /**
     * Restarts the timer if it's currently running.
     */
    public restartIfRunning(): void {
        if (!this.isRunning) {
            return;
        }

        this.start(this.timerOverrideValueSeconds);
        this.lastPlayerActionId = this.player.lastActionId;
    }

    protected override onStart(): void {
        this.activeUiPromptId = this.game.getCurrentOpenPrompt()?.uuid;

        // Just log an error to avoid breaking the game
        if (!this.activeUiPromptId) {
            logger.error(`Attempting to start action timer for player ${this.player.id} when there is no active prompt`);
        }

        this.lastPlayerActionId = this.player.lastActionId;
    }

    protected override onStop(): void {
        this.lastPlayerActionId = null;
        this.activeUiPromptId = null;
    }

    /**
     * Safety check to ensure the player being timed is still active for the prompt
     * and hasn't issued any new game messages. This prevents accidentally booting
     * a player because their turn timer didn't get cleared for some reason.
     */
    protected override shouldFireHandler(): boolean {
        return this.checkLiveStatus(this.activeUiPromptId, this.lastPlayerActionId);
    }
}
