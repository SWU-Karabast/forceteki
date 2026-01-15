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
    get isRunning(): boolean;
    get timeRemainingSeconds(): number | null;
    start(overrideTimeLimitSeconds?: number): void;
    restartIfRunning(): void;
    stop(): void;
}
