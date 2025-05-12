import type Game from '../Game';
import type { Player } from '../Player';
import * as Contract from '../utils/Contract';
import type { IActionTimer } from './IActionTimer';

interface ISpecificTimeHandler {
    fireOnRemainingTimeMs: number;
    handler: () => void;
}

export class StandardActionTimer implements IActionTimer {
    private readonly game: Game;
    private readonly player: Player;
    private readonly timeLimitMs: number;

    private checkLiveStatus: (promptUuid: string, playerActionId: number) => boolean;
    private endTime: Date | null = null;
    private onSpecificTimeHandlers: ISpecificTimeHandler[];
    private pauseTime: Date | null = null;
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

    public constructor(
        timeLimitSeconds: number,
        player: Player,
        game: Game,
        onTimeout: () => void,
        checkLiveStatus: (promptUuid: string, playerActionId: number) => boolean
    ) {
        Contract.assertPositiveNonZero(timeLimitSeconds);

        this.timeLimitMs = timeLimitSeconds * 1000;
        this.player = player;
        this.game = game;
        this.checkLiveStatus = checkLiveStatus;

        this.onSpecificTimeHandlers = [{ fireOnRemainingTimeMs: 0, handler: onTimeout }];
    }

    public addSpecificTimeHandler(timeSeconds: number, handler: () => void) {
        Contract.assertPositiveNonZero(timeSeconds);
        Contract.assertTrue(timeSeconds * 1000 < this.timeLimitMs, `Target time for handler (${timeSeconds}) must be less than the time limit (${this.timeLimitMs / 1000})`);

        this.onSpecificTimeHandlers.push({
            fireOnRemainingTimeMs: timeSeconds * 1000,
            handler,
        });
    }

    public start() {
        this.stop();
        this.initializeTimersForTimeRemaining(this.timeLimitMs);

        this.activeUiPromptId = this.game.currentOpenPrompt?.uuid;
        Contract.assertNotNullLike(this.activeUiPromptId, `Attempting to start action timer for player ${this.player.id} when there is no active prompt`);

        this.lastPlayerActionId = this.player.lastActionId;
    }

    public restartIfRunning() {
        if (!this.isRunning) {
            return;
        }

        this.start();
        this.lastPlayerActionId = this.player.lastActionId;
    }

    public pause() {
        Contract.assertNotNullLike(this.endTime, `Attempting to pause timer for player ${this.player.name} when it is not running`);

        this.pauseTime = new Date();
        this.stop();
    }

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

        this.timers = [];
        this.endTime = null;
        this.pauseTime = null;
        this.lastPlayerActionId = null;
        this.activeUiPromptId = null;
    }

    private initializeTimersForTimeRemaining(timeRemainingMs: number) {
        Contract.assertIsNullLike(this.endTime, 'End time must be cleared before initializing timers');
        Contract.assertPositiveNonZero(timeRemainingMs);
        Contract.assertTrue(this.timers.length === 0, 'Timers must be cleared before initializing new timers');

        this.endTime = new Date(Date.now() + this.timeLimitMs);
        this.pauseTime = null;

        const safeCallHandler = (handler: () => void) => {
            // safety check to ensure that the player being timed is still active for the prompt and hasn't issued any new game messages.
            // this prevents us from accidentally booting a player because their turn timer didn't get cleared for some reason
            if (!this.checkLiveStatus(this.activeUiPromptId, this.lastPlayerActionId)) {
                this.stop();
                return;
            }

            handler();
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
