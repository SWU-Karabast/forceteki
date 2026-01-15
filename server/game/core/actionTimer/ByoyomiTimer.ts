import type Game from '../Game';
import type { Player } from '../Player';
import { GameActionTimer } from './GameActionTimer';
import type { IByoyomiTimer } from './IByoyomiTimer';

/**
 * Two-stage "byoyomi" style timer that wraps two GameActionTimer instances.
 *
 * - Turn timer: Short timer (default 20s) that resets on each new prompt
 * - Main timer: Buffer time (default 150s) that starts ticking when turn timer expires
 *
 * When the turn timer expires, the main timer becomes active.
 * When the main timer expires, the onTimeout callback is invoked.
 */
export class ByoyomiTimer implements IByoyomiTimer {
    /** Time limit for each turn/prompt in seconds */
    public static readonly TurnTimeLimitSeconds = 20;

    /** Total main timer buffer in seconds */
    public static readonly MainTimeLimitSeconds = 150;

    private readonly turnTimer: GameActionTimer;
    private readonly mainTimer: GameActionTimer;
    private readonly onTimeout: () => void;
    private readonly sendUpdatedGameState: () => void;

    /** Tracks whether we've transitioned from turn timer to main timer */
    private isOnMainTimer = false;

    public get isRunning(): boolean {
        return this.turnTimer.isRunning || this.mainTimer.isRunning;
    }

    public get timeRemainingSeconds(): number | null {
        return this.isOnMainTimer
            ? this.mainTimer.timeRemainingSeconds
            : this.turnTimer.timeRemainingSeconds;
    }

    public get turnTimeRemainingSeconds(): number | null {
        return this.isOnMainTimer ? null : this.turnTimer.timeRemainingSeconds;
    }

    public get mainTimeRemainingSeconds(): number | null {
        return this.mainTimer.timeRemainingSeconds;
    }

    public constructor(
        player: Player,
        game: Game,
        onTimeout: () => void,
        checkLiveStatus: (promptUuid: string, playerActionId: number) => boolean,
        sendUpdatedGameState: () => void
    ) {
        this.onTimeout = onTimeout;
        this.sendUpdatedGameState = sendUpdatedGameState;

        // Create turn timer - when it expires, transition to main timer
        this.turnTimer = new GameActionTimer(
            ByoyomiTimer.TurnTimeLimitSeconds,
            player,
            game,
            () => this.onTurnTimerExpired(),
            checkLiveStatus
        );

        // Create main timer - when it expires, call the timeout callback
        this.mainTimer = new GameActionTimer(
            ByoyomiTimer.MainTimeLimitSeconds,
            player,
            game,
            () => this.onMainTimerExpired(),
            checkLiveStatus
        );
    }

    /**
     * Starts the timer. Always starts with the turn timer.
     * Main timer state is preserved - if the player has used up main time,
     * the turn timer will transition back to the main timer when it expires.
     */
    public start(): void {
        // Always start with the turn timer
        this.mainTimer.stop();
        this.isOnMainTimer = false;
        this.turnTimer.start();
    }

    /**
     * Restarts the timer if it's currently running.
     * Resets back to turn timer, preserving main timer's elapsed time.
     */
    public restartIfRunning(): void {
        if (!this.isRunning) {
            return;
        }

        // Always restart with turn timer, preserving main timer state
        this.mainTimer.stop();
        this.isOnMainTimer = false;
        this.turnTimer.start();
    }

    /**
     * Stops both timers.
     */
    public stop(): void {
        this.turnTimer.stop();
        this.mainTimer.stop();
        // Note: We intentionally don't reset isOnMainTimer here
        // so that the main timer state is preserved across prompts
    }

    /**
     * Resets both timers to initial state.
     * Call this at the start of a new game or when player state should fully reset.
     */
    public reset(): void {
        this.turnTimer.stop();
        this.mainTimer.stop();
        this.isOnMainTimer = false;
    }

    /**
     * Called when the turn timer expires.
     * Transitions to the main timer.
     */
    private onTurnTimerExpired(): void {
        this.isOnMainTimer = true;
        this.mainTimer.start();

        // Notify the game to push updated state to players
        // so the FE knows we've transitioned to main timer
        this.sendUpdatedGameState();
    }

    /**
     * Called when the main timer expires.
     * Invokes the timeout callback (player gets kicked).
     */
    private onMainTimerExpired(): void {
        this.onTimeout();
    }
}
