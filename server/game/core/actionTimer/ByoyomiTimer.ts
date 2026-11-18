import type { IActionTimerGame, IActionTimerPlayer } from './GameActionTimer';
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

    /**
     * When a player's main time runs out, the game is a draw if the opponent's timer is running and they are this close to
     * timing out too, counting turn and main time (seconds).
     */
    public static readonly TimeoutDrawMarginSeconds = 3;

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

    public get turnTimeRemainingSeconds(): number | null {
        return this.isOnMainTimer ? null : this.turnTimer.timeRemainingSeconds;
    }

    public get mainTimeRemainingSeconds(): number {
        // the main timer is started (and paused) when it is built, so it has no time left only once it has run out
        return this.mainTimer.timeRemainingSeconds ?? 0;
    }

    public get isCountingDown(): boolean {
        return this.isOnMainTimer ? this.mainTimer.isRunningOrRunningOut : this.turnTimer.isRunningOrRunningOut;
    }

    public get msUntilTimeout(): number {
        const turnMs = this.isOnMainTimer ? 0 : (this.turnTimer.timeRemainingMs ?? 0);
        return turnMs + (this.mainTimer.timeRemainingMs ?? 0);
    }

    public get timeRemainingStatus(): PlayerTimeRemainingStatus {
        // Derived from current main-time remaining rather than handler-set state so the warning/danger
        // icon reappears every time the player is actively burning low main time, not just the first
        // crossing of each threshold. (One-shot handlers above still drive chat alerts.)
        if (!this.isOnMainTimer || !this.mainTimer.isRunning) {
            return PlayerTimeRemainingStatus.NoAlert;
        }

        const remainingSeconds = this.mainTimer.timeRemainingSeconds ?? ByoyomiTimer.MainTimeLimitSeconds;
        if (remainingSeconds <= ByoyomiTimer.MainTimeDangerSeconds) {
            return PlayerTimeRemainingStatus.Danger;
        }
        if (remainingSeconds <= ByoyomiTimer.MainTimeWarningSeconds) {
            return PlayerTimeRemainingStatus.Warning;
        }
        return PlayerTimeRemainingStatus.NoAlert;
    }

    public constructor(
        player: IActionTimerPlayer,
        game: IActionTimerGame,
        onTimeout: () => void,
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
            () => this.onTurnTimerExpired()
        );

        // Create main timer - when it expires, call the timeout callback
        this.mainTimer = new GameActionTimer(
            ByoyomiTimer.MainTimeLimitSeconds,
            player,
            game,
            () => this.onMainTimerExpired()
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
     * Stops the turn timer and pauses the main timer (preserving its remaining time). A stopped player is off the clock,
     * even one whose main time has run out, until their timer is started again.
     */
    public stop(): void {
        this._isPaused = false;
        this.isOnMainTimer = false;
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
            this.resumeMainTimer();
        } else {
            this.turnTimer.resume();
        }
    }

    /**
     * Pauses the timer, keeping the time left, so {@link resume} carries on from there. Does nothing to a timer that is not
     * running, which then starts afresh at its next {@link start}.
     */
    public pause(): void {
        if (!this.isRunning) {
            return;
        }

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
        if (!this.resumeMainTimer()) {
            return;
        }

        // Notify the game to push updated state to players
        // so the FE knows we've transitioned to main timer
        this.sendUpdatedGameState();
    }

    /**
     * Starts the main time counting down again. A player with no main time left times out instead, at once, since the
     * main timer cannot count down from nothing. Returns whether the main time is counting down.
     */
    private resumeMainTimer(): boolean {
        if ((this.mainTimer.timeRemainingMs ?? 0) <= 0) {
            this.onTimeout();
            return false;
        }

        this.mainTimer.resume();
        return true;
    }

    /**
     * Called when the main timer expires.
     * Invokes the timeout callback (the player times out, and the game ends).
     */
    private onMainTimerExpired(): void {
        this.onTimeout();
    }
}
