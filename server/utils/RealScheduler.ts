import { logger } from '../logger';
import type { IScheduledTask, IScheduler, ISchedulerErrorContext } from './IScheduler';

/** The production scheduler: Node's timers and the system clock. */
export class RealScheduler implements IScheduler {
    public setTimeout(callback: () => void, delayMs: number, errorContext?: ISchedulerErrorContext): IScheduledTask {
        const handle = setTimeout(() => this.runGuarded(callback, errorContext), delayMs);
        return { cancel: () => clearTimeout(handle) };
    }

    public setInterval(callback: () => void, intervalMs: number, errorContext?: ISchedulerErrorContext): IScheduledTask {
        const handle = setInterval(() => this.runGuarded(callback, errorContext), intervalMs);
        return { cancel: () => clearInterval(handle) };
    }

    public now(): number {
        return Date.now();
    }

    public currentDate(): Date {
        return new Date();
    }

    /**
     * Timer callbacks have no caller to catch for them, so anything that escapes here would reach
     * the process-level handler and terminate the node. Errors are logged and swallowed, which for a
     * repeating task also means one bad tick does not stop the rest.
     */
    private runGuarded(callback: () => void, errorContext?: ISchedulerErrorContext): void {
        try {
            callback();
        } catch (error) {
            logger.error(errorContext?.message ?? 'Scheduler: error in scheduled callback', {
                error: { message: error?.message, stack: error?.stack },
                ...errorContext?.metadata,
            });
        }
    }
}
