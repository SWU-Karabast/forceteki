export interface IActionTimer {
    get isPaused(): boolean;
    get isRunning(): boolean;
    addSpecificTimeHandler(timeSeconds: number, handler: () => void);
    start(overrideTimeLimitSeconds?: number): void;
    restartIfRunning(): void;
    pause(): void;
    resume(): void;
    stop(): void;
}
