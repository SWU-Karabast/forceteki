import { logger } from '../../../logger';
import type Game from '../Game';
import type { Player } from '../Player';
import * as Contract from '../utils/Contract';
import type { IActionTimerHandler } from './IActionTimer';
import { PlayerTimeRemainingStatus, type IActionTimer } from './IActionTimer';

interface ISpecificTimeHandler {
    fireOnRemainingTimeMs: number;
    handler: IActionTimerHandler;
}

export class StandardActionTimer implements IActionTimer {
    private readonly game: Game;
    private readonly player: Player;
    private readonly timeLimitMs: number;

    /** safety check method to ensure that game state still matches when the timer was created to avoid accidentally kicking a player */
    private checkLiveStatus: (promptUuid: string, playerActionId: number) => boolean;
    private endTime: Date | null = null;
    private onSpecificTimeHandlers: ISpecificTimeHandler[];
    private pauseTime: Date | null = null;
    private _timeRemainingStatus: PlayerTimeRemainingStatus = PlayerTimeRemainingStatus.NoAlert;
    private timerOverrideValueSeconds: number | null = null;
    private timers: NodeJS.Timeout[] = [];

    private lastPlayerActionId: number | null = null;
    private activeUiPromptId: string | null = null;

    public get isPaused(): boolean {
        return this.endTime !== null && this.pauseTime !== null;
    }

    public get isRunning(): boolean {
        return this.endTime !== null &&
          this.pauseTime === null &&
          Date.now() < this.endTime.getTime();
    }

    public get timeRemainingStatus(): PlayerTimeRemainingStatus {
        return this._timeRemainingStatus;
    }

    public constructor(
        timeLimitSeconds: number,
        player: Player,
        game: Game,
        onTimeout: () => undefined,
        checkLiveStatus: (promptUuid: string, playerActionId: number) => boolean
    ) {
        Contract.assertPositiveNonZero(timeLimitSeconds);

        this.timeLimitMs = timeLimitSeconds * 1000;
        this.player = player;
        this.game = game;
        this.checkLiveStatus = checkLiveStatus;

        this.onSpecificTimeHandlers = [{ fireOnRemainingTimeMs: 0, handler: onTimeout }];
    }

    public addSpecificTimeHandler(timeSeconds: number, handler: IActionTimerHandler) {
        Contract.assertPositiveNonZero(timeSeconds);
        Contract.assertTrue(timeSeconds * 1000 < this.timeLimitMs, `Target time for handler (${timeSeconds}) must be less than the time limit (${this.timeLimitMs / 1000})`);

        this.onSpecificTimeHandlers.push({
            fireOnRemainingTimeMs: timeSeconds * 1000,
            handler,
        });
    }

    public start(overrideTimeLimitSeconds?: number) {
        Contract.assertTrue(overrideTimeLimitSeconds == null || overrideTimeLimitSeconds * 1000 > this.timeLimitMs, `Received invalid time limit, must be null or greater than ${this.timeLimitMs / 1000}: ${overrideTimeLimitSeconds}`);

        this.timerOverrideValueSeconds = overrideTimeLimitSeconds;
        this._timeRemainingStatus = PlayerTimeRemainingStatus.NoAlert;

        this.stop();
        this.initializeTimersForTimeRemaining(this.getTimeLimitMs());

        this.activeUiPromptId = this.game.currentOpenPrompt?.uuid;

        // just log an error to avoid breaking the game
        if (!this.activeUiPromptId) {
            logger.error(`Attempting to start action timer for player ${this.player.id} when there is no active prompt`);
        }

        this.lastPlayerActionId = this.player.lastActionId;
    }

    public restartIfRunning() {
        if (!this.isRunning) {
            return;
        }

        this.start(this.timerOverrideValueSeconds);
        this.lastPlayerActionId = this.player.lastActionId;
    }

    /** @deprecated this is not tested yet */
    public pause() {
        Contract.assertNotNullLike(this.endTime, `Attempting to pause timer for player ${this.player.name} when it is not running`);

        this.pauseTime = new Date();
        this.stop();
    }

    /** @deprecated this is not tested yet */
    public resume() {
        Contract.assertNotNullLike(this.endTime, `Attempting to resume timer for player ${this.player.name} when it is not started`);
        Contract.assertNotNullLike(this.pauseTime, `Attempting to resume timer for player ${this.player.name} when it is not paused`);

        const timeRemainingMs = this.endTime.getTime() - this.pauseTime.getTime();
        this.initializeTimersForTimeRemaining(timeRemainingMs);
    }

    public stop() {
        for (const timer of this.timers) {
            clearTimeout(timer);
        }

        this._timeRemainingStatus = PlayerTimeRemainingStatus.NoAlert;

        this.timers = [];
        this.endTime = null;
        this.pauseTime = null;
        this.lastPlayerActionId = null;
        this.activeUiPromptId = null;
    }

    private getTimeLimitMs() {
        return this.timerOverrideValueSeconds ? this.timerOverrideValueSeconds * 1000 : this.timeLimitMs;
    }

    private initializeTimersForTimeRemaining(timeRemainingMs: number) {
        Contract.assertIsNullLike(this.endTime, 'End time must be cleared before initializing timers');
        Contract.assertPositiveNonZero(timeRemainingMs);
        Contract.assertTrue(this.timers.length === 0, 'Timers must be cleared before initializing new timers');

        this.endTime = new Date(Date.now() + timeRemainingMs);
        this.pauseTime = null;

        const safeCallHandler = (handler: IActionTimerHandler) => {
            // safety check to ensure that the player being timed is still active for the prompt and hasn't issued any new game messages.
            // this prevents us from accidentally booting a player because their turn timer didn't get cleared for some reason
            if (!this.checkLiveStatus(this.activeUiPromptId, this.lastPlayerActionId)) {
                this.stop();
                return;
            }

            handler((newStatus: PlayerTimeRemainingStatus) => this._timeRemainingStatus = newStatus);
        };

        for (const handler of this.onSpecificTimeHandlers) {
            if (timeRemainingMs > handler.fireOnRemainingTimeMs) {
                const timer = this.game.buildSafeTimeout(
                    () => safeCallHandler(handler.handler),
                    timeRemainingMs - handler.fireOnRemainingTimeMs,
                    `Error in action timer handler for player ${this.player.name}`
                );

                this.timers.push(timer);
            }
        }
    }
}
