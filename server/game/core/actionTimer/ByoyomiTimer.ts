import type { Game } from '../Game';
import type { Player } from '../Player';
import { GameActionTimer } from './GameActionTimer';
import { PlayerTimeRemainingStatus } from './IActionTimer';
import type { IByoyomiTimer } from './IByoyomiTimer';

/**
 * Two-stage "byoyomi" style timer that wraps two GameActionTimer instances.
 *
 * - Turn timer: Short timer (default 20s) that resets on each new prompt
 * - Main timer: Buffer time (default 120s) that starts ticking when turn timer expires
 *
 * When the turn timer expires, the main timer becomes active (starts or resumes).
 * When the main timer expires, the onTimeout callback is invoked.
 */
export class ByoyomiTimer implements IByoyomiTimer {
    /** Time limit for each turn/prompt in seconds */
    public static readonly TurnTimeLimitSeconds = 20;

    /** Total main timer buffer in seconds */
    public static readonly MainTimeLimitSeconds = 120;

    /** Main-time-remaining thresholds at which warning handlers fire (seconds). */
    public static readonly MainTimeWarningSeconds = 30;
    public static readonly MainTimeDangerSeconds = 10;

    private readonly turnTimer: GameActionTimer;
    private readonly mainTimer: GameActionTimer;
    private readonly onTimeout: () => void;
    private readonly sendUpdatedGameState: () => void;
    private readonly onMainTimerWarning?: (status: PlayerTimeRemainingStatus) => void;

    /** Tracks whether we're currently on the main timer (vs turn timer) */
    private isOnMainTimer = false;

    private _isPaused = false;

    public get isRunning(): boolean {
        return this.turnTimer.isRunning || this.mainTimer.isRunning;
    }

    public get isPaused(): boolean {
        return this._isPaused;
    }

    public get timeRemainingSeconds(): number | null {
        return this.isOnMainTimer
            ? this.mainTimer.timeRemainingSeconds
            : this.turnTimer.timeRemainingSeconds;
    }

    public get turnTimeRemainingSeconds(): number | null {
        return this.isOnMainTimer ? null : this.turnTimer.timeRemainingSeconds;
    }

    public get mainTimeRemainingSeconds(): number {
        // Main timer always has a value - either running/paused time or full time if not yet started
        return this.mainTimer.timeRemainingSeconds ?? ByoyomiTimer.MainTimeLimitSeconds;
    }

    public get totalTimeRemainingSeconds(): number {
        return (this.turnTimeRemainingSeconds ?? 0) + this.mainTimeRemainingSeconds;
    }

    public get timeRemainingStatus(): PlayerTimeRemainingStatus {
        return this.isOnMainTimer ? this.mainTimer.timeRemainingStatus : PlayerTimeRemainingStatus.NoAlert;
    }

    public constructor(
        player: Player,
        game: Game,
        onTimeout: () => void,
        checkLiveStatus: (promptUuid: string, playerActionId: number) => boolean,
        sendUpdatedGameState: () => void,
        onMainTimerWarning?: (status: PlayerTimeRemainingStatus) => void
    ) {
        this.onTimeout = onTimeout;
        this.sendUpdatedGameState = sendUpdatedGameState;
        this.onMainTimerWarning = onMainTimerWarning;

        // Create turn timer - when it expires, transition to main timer
        this.turnTimer = new GameActionTimer(
            ByoyomiTimer.TurnTimeLimitSeconds,
            player,
            game,
            () => this.onTurnTimerExpired(),
            (promptUuid: string, playerActionId: number) => checkLiveStatus(promptUuid, playerActionId)
        );

        // Create main timer - when it expires, call the timeout callback
        this.mainTimer = new GameActionTimer(
            ByoyomiTimer.MainTimeLimitSeconds,
            player,
            game,
            () => this.onMainTimerExpired(),
            (promptUuid: string, playerActionId: number) => checkLiveStatus(promptUuid, playerActionId)
        );

        // Warning handlers fire as the player burns main time. They set the timer's
        // status (which the player summary surfaces to the FE for the warning icon)
        // and notify the owning Player so it can emit chat alerts conditionally.
        this.mainTimer.addSpecificTimeHandler(ByoyomiTimer.MainTimeWarningSeconds, (setStatus) => {
            setStatus(PlayerTimeRemainingStatus.Warning);
            this.onMainTimerWarning?.(PlayerTimeRemainingStatus.Warning);
            this.sendUpdatedGameState();
        });
        this.mainTimer.addSpecificTimeHandler(ByoyomiTimer.MainTimeDangerSeconds, (setStatus) => {
            setStatus(PlayerTimeRemainingStatus.Danger);
            this.onMainTimerWarning?.(PlayerTimeRemainingStatus.Danger);
            this.sendUpdatedGameState();
        });

        // Initialize main timer at full time but paused
        // so mainTimeRemainingSeconds always has a value
        this.mainTimer.start();
        this.mainTimer.pause();
    }

    /**
     * Starts the timer. Always starts with the turn timer.
     * If main timer was previously running, it will be paused and resumed
     * when the turn timer expires again.
     */
    public start(): void {
        this._isPaused = false;

        // Pause main timer if it's running (preserve remaining time)
        if (this.mainTimer.isRunning) {
            this.mainTimer.pause();
        }
        this.isOnMainTimer = false;
        // Player is no longer burning main time — clear any warning status so the FE icon clears.
        this.mainTimer.resetStatus();
        this.turnTimer.start();
    }

    /**
     * Restarts the timer if it's currently running.
     * Resets back to turn timer, pausing main timer to preserve its elapsed time.
     */
    public restartIfRunning(): void {
        this._isPaused = false;
        if (!this.isRunning) {
            return;
        }

        // Pause main timer if it's running (preserve remaining time)
        if (this.mainTimer.isRunning) {
            this.mainTimer.pause();
        }
        this.isOnMainTimer = false;
        this.mainTimer.resetStatus();
        this.turnTimer.start();
    }

    /**
     * Stops the turn timer and pauses the main timer (preserving its remaining time).
     */
    public stop(): void {
        this._isPaused = false;
        this.turnTimer.stop();
        // Pause main timer instead of stopping to preserve remaining time
        if (this.mainTimer.isRunning) {
            this.mainTimer.pause();
        }
        this.mainTimer.resetStatus();
    }

    public resume(): void {
        this._isPaused = false;
        if (this.isOnMainTimer) {
            this.mainTimer.resume();
        } else {
            this.turnTimer.resume();
        }
    }

    public pause(): void {
        this._isPaused = true;
        if (this.isOnMainTimer) {
            this.mainTimer.pause();
            // Player is no longer actively burning main time — clear warning so icon disappears.
            this.mainTimer.resetStatus();
        } else {
            this.turnTimer.pause();
        }
    }

    /**
     * Called when the turn timer expires.
     * Transitions to the main timer (starts or resumes it).
     */
    private onTurnTimerExpired(): void {
        this.isOnMainTimer = true;
        this.mainTimer.resume();

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
