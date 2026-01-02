import type Game from '../Game';
import type { Player } from '../Player';
import { GameActionTimer } from './GameActionTimer';
import type { IByoyomiTimer } from './IByoyomiTimer';

/** Time limit for each turn/prompt in seconds */
const TURN_TIME_LIMIT_SECONDS = 20;

/** Total main timer buffer in seconds */
const MAIN_TIME_LIMIT_SECONDS = 150;

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
    private readonly turnTimer: GameActionTimer;
    private readonly mainTimer: GameActionTimer;
    private readonly game: Game;
    private readonly onTimeout: () => void;

    /** Tracks whether we've transitioned from turn timer to main timer */
    private isOnMainTimer = false;

    public get isRunning(): boolean {
        return this.turnTimer.isRunning || this.mainTimer.isRunning;
    }

    public get timeRemainingSeconds(): number | null {
        // Return whichever timer is currently active
        if (this.isOnMainTimer) {
            return this.mainTimer.timeRemainingSeconds;
        }
        return this.turnTimer.timeRemainingSeconds;
    }

    public get turnTimeRemainingSeconds(): number | null {
        if (this.isOnMainTimer) {
            return null;
        }
        return this.turnTimer.timeRemainingSeconds;
    }

    public get mainTimeRemainingSeconds(): number | null {
        return this.mainTimer.timeRemainingSeconds;
    }

    public constructor(
        player: Player,
        game: Game,
        onTimeout: () => void,
        checkLiveStatus: (promptUuid: string, playerActionId: number) => boolean
    ) {
        this.game = game;
        this.onTimeout = onTimeout;

        // Create turn timer - when it expires, transition to main timer
        this.turnTimer = new GameActionTimer(
            TURN_TIME_LIMIT_SECONDS,
            player,
            game,
            () => this.onTurnTimerExpired(),
            checkLiveStatus
        );

        // Create main timer - when it expires, call the timeout callback
        this.mainTimer = new GameActionTimer(
            MAIN_TIME_LIMIT_SECONDS,
            player,
            game,
            () => this.onMainTimerExpired(),
            checkLiveStatus
        );
    }

    /**
     * Starts the timer. Always starts with the turn timer.
     * If main timer was already active, it continues from where it left off.
     */
    public start(): void {
        // If we're on the main timer, keep it running (don't restart)
        if (this.isOnMainTimer) {
            // Main timer should already be running, just ensure it is
            if (!this.mainTimer.isRunning) {
                this.mainTimer.start();
            }
            return;
        }

        // Start fresh with turn timer
        this.turnTimer.start();
    }

    /**
     * Restarts the timer if it's currently running.
     * Only resets the turn timer, preserves main timer state.
     */
    public restartIfRunning(): void {
        if (!this.isRunning) {
            return;
        }

        if (this.isOnMainTimer) {
            // We're on main timer - just restart main timer from current position
            // (restartIfRunning on GameActionTimer preserves current state)
            this.mainTimer.restartIfRunning();
        } else {
            // We're on turn timer - restart it
            this.turnTimer.restartIfRunning();
        }
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

    /**
     * Forces a game state update to be sent to all players.
     */
    private sendUpdatedGameState(): void {
        // Use the router to send game state if available
        // @ts-expect-error - accessing private _router property
        if (typeof this.game._router?.sendGameState === 'function') {
            // @ts-expect-error - accessing private _router property
            this.game._router.sendGameState(this.game);
        }
    }
}
