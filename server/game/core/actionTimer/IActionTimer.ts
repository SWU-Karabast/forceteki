export interface IActionTimer {
    get isPaused(): boolean;
    get isRunning(): boolean;
    addSpecificTimeHandler(timeSeconds: number, handler: () => void);
    start();
    restartIfRunning();
    pause();
    resume();
    stop();
}