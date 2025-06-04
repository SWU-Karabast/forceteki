export enum PlayerTimeRemainingStatus {
    NoAlert = 'NoAlert',
    Warning = 'Warning',
    Danger = 'Danger',
}

/**
 * Interface for a method that is fired when a timer hits a prescribed timeout value.
 * Accepts a callback to update the timer status, which can be used to notify the player of their time remaining.
 */
export type IActionTimerHandler = (updateTimerStatus?: (newStatus: PlayerTimeRemainingStatus) => void) => void;

export interface IActionTimer {
    get isPaused(): boolean;
    get isRunning(): boolean;
    get timeRemainingStatus(): PlayerTimeRemainingStatus;
    addSpecificTimeHandler(timeSeconds: number, handler: IActionTimerHandler): void;
    start(overrideTimeLimitSeconds?: number): void;
    restartIfRunning(): void;
    pause(): void;
    resume(): void;
    stop(): void;
}
