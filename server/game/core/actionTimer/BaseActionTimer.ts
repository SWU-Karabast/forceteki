import * as Contract from '../utils/Contract';
import type { IActionTimerHandler } from './IActionTimer';
import { PlayerTimeRemainingStatus } from './IActionTimer';

interface ISpecificTimeHandler {
    fireOnRemainingTimeMs: number;
    handler: IActionTimerHandler;
}

/**
 * Type for a function that creates safe timeouts with error handling.
 */
export type SafeTimeoutBuilder = (callback: () => void, delayMs: number) => NodeJS.Timeout;

/**
 * Base class for action timers that can schedule handlers at specific time intervals.
 * Subclasses can extend this with context-specific logic (e.g., Game/Player checks).
 */
export class BaseActionTimer {
    protected readonly timeLimitMs: number;
    protected readonly buildSafeTimeout: SafeTimeoutBuilder;

    protected timers: NodeJS.Timeout[] = [];
    protected endTime: Date | null = null;
    protected pauseTime: Date | null = null;
    protected _timeRemainingStatus: PlayerTimeRemainingStatus = PlayerTimeRemainingStatus.NoAlert;
    protected onSpecificTimeHandlers: ISpecificTimeHandler[] = [];
    protected timerOverrideValueSeconds: number | null = null;

    public get isPaused(): boolean {
        return this.endTime !== null && this.pauseTime !== null;
    }

    public get isRunning(): boolean {
        return (
            this.endTime !== null &&
            this.pauseTime === null &&
            Date.now() < this.endTime.getTime()
        );
    }

    public get timeRemainingStatus(): PlayerTimeRemainingStatus {
        return this._timeRemainingStatus;
    }

    public constructor(
        timeLimitSeconds: number,
        buildSafeTimeout: SafeTimeoutBuilder
    ) {
        Contract.assertPositiveNonZero(timeLimitSeconds);

        this.timeLimitMs = timeLimitSeconds * 1000;
        this.buildSafeTimeout = buildSafeTimeout;
    }

    /**
     * Adds a handler to be called when the timer reaches a specific remaining time.
     * @param timeSeconds The remaining time (in seconds) at which to fire the handler. Use 0 for timeout.
     * @param handler The handler to call
     */
    public addSpecificTimeHandler(timeSeconds: number, handler: IActionTimerHandler): void {
        Contract.assertTrue(timeSeconds >= 0, `Target time for handler must be non-negative: ${timeSeconds}`);
        Contract.assertTrue(timeSeconds * 1000 < this.timeLimitMs, `Target time for handler (${timeSeconds}) must be less than the time limit (${this.timeLimitMs / 1000})`);

        this.onSpecificTimeHandlers.push({
            fireOnRemainingTimeMs: timeSeconds * 1000,
            handler,
        });
    }

    /**
     * Starts the timer. Can optionally override the time limit for this run.
     * @param overrideTimeLimitSeconds Optional override for the time limit (must be greater than default)
     */
    public start(overrideTimeLimitSeconds?: number): void {
        Contract.assertTrue(
            overrideTimeLimitSeconds == null || overrideTimeLimitSeconds * 1000 >= this.timeLimitMs,
            `Received invalid time limit, must be null or greater than ${this.timeLimitMs / 1000}: ${overrideTimeLimitSeconds}`
        );

        this.timerOverrideValueSeconds = overrideTimeLimitSeconds;
        this._timeRemainingStatus = PlayerTimeRemainingStatus.NoAlert;

        this.stop();
        this.initializeTimersForTimeRemaining(this.getTimeLimitMs());

        this.onStart();
    }

    /**
     * Stops the timer and clears all scheduled handlers.
     */
    public stop(): void {
        for (const timer of this.timers) {
            clearTimeout(timer);
        }

        this._timeRemainingStatus = PlayerTimeRemainingStatus.NoAlert;

        this.timers = [];
        this.endTime = null;
        this.pauseTime = null;

        this.onStop();
    }

    /**
     * Pauses the timer if it's running.
     * @deprecated Not fully tested
     */
    public pause(): void {
        Contract.assertNotNullLike(this.endTime, 'Attempting to pause timer when it is not running');

        this.pauseTime = new Date();
        this.clearTimers();
    }

    /**
     * Resumes the timer if it was paused.
     * @deprecated Not fully tested
     */
    public resume(): void {
        Contract.assertNotNullLike(this.endTime, 'Attempting to resume timer when it is not started');
        Contract.assertNotNullLike(this.pauseTime, 'Attempting to resume timer when it is not paused');

        const timeRemainingMs = this.endTime.getTime() - this.pauseTime.getTime();
        this.initializeTimersForTimeRemaining(timeRemainingMs);
    }

    /**
     * Hook called when the timer starts. Override in subclasses for custom behavior.
     */
    protected onStart(): void {
        // Default: no-op
    }

    /**
     * Hook called when the timer stops. Override in subclasses for custom behavior.
     */
    protected onStop(): void {
        // Default: no-op
    }

    /**
     * Called before firing a handler. Override in subclasses to add safety checks.
     * If this returns false, the handler will not be fired and the timer will be stopped.
     */
    protected shouldFireHandler(): boolean {
        return true;
    }

    protected getTimeLimitMs(): number {
        return this.timerOverrideValueSeconds ? this.timerOverrideValueSeconds * 1000 : this.timeLimitMs;
    }

    private clearTimers(): void {
        for (const timer of this.timers) {
            clearTimeout(timer);
        }
        this.timers = [];
    }

    private initializeTimersForTimeRemaining(timeRemainingMs: number): void {
        Contract.assertIsNullLike(this.endTime, 'End time must be cleared before initializing timers');
        Contract.assertPositiveNonZero(timeRemainingMs);
        Contract.assertTrue(this.timers.length === 0, 'Timers must be cleared before initializing new timers');

        this.endTime = new Date(Date.now() + timeRemainingMs);
        this.pauseTime = null;

        const safeCallHandler = (handler: IActionTimerHandler) => {
            if (!this.shouldFireHandler()) {
                this.stop();
                return;
            }

            handler((newStatus: PlayerTimeRemainingStatus) => this._timeRemainingStatus = newStatus);
        };

        for (const handler of this.onSpecificTimeHandlers) {
            if (timeRemainingMs > handler.fireOnRemainingTimeMs) {
                const timer = this.buildSafeTimeout(
                    () => safeCallHandler(handler.handler),
                    timeRemainingMs - handler.fireOnRemainingTimeMs
                );

                this.timers.push(timer);
            }
        }
    }
}
