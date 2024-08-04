export interface ClockInterface {
    name: string;
    timeLeft: number;
    getState(): {
        mode: 'stop' | 'down' | 'up' | 'off';
        timeLeft: number;
        stateId: number;
        mainTime: number;
        name: string;
        delayToStartClock: number;
        manuallyPaused: boolean;
    };
    opponentStart(): void;
    reset(): void;
    start(): void;
    stop(): void;
}
