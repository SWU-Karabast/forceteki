import { logger } from '../logger';
import type { IScheduledTask, IScheduler, ISchedulerErrorContext, ScheduledCallback } from './IScheduler';
import { minimumSchedulerDelayMs } from './IScheduler';

/** The production scheduler: Node's timers and the system clock. */
export class RealScheduler implements IScheduler {
    public setTimeout(callback: ScheduledCallback, delayMs: number, errorContext?: ISchedulerErrorContext): IScheduledTask {
        const handle = setTimeout(
            () => this.runGuarded(callback, errorContext),
            Math.max(minimumSchedulerDelayMs, delayMs)
        );
        return { cancel: () => clearTimeout(handle) };
    }

    public setInterval(callback: ScheduledCallback, intervalMs: number, errorContext?: ISchedulerErrorContext): IScheduledTask {
        const handle = setInterval(
            () => this.runGuarded(callback, errorContext),
            Math.max(minimumSchedulerDelayMs, intervalMs)
        );
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
     *
     * Async callbacks are handled too: a rejected promise from one is an unhandled rejection, which
     * on Node 22 is just as fatal as a synchronous throw.
     */
    private runGuarded(callback: ScheduledCallback, errorContext?: ISchedulerErrorContext): void {
        try {
            const result = callback();

            if (result instanceof Promise) {
                result.catch((error) => this.report(error, errorContext));
            }
        } catch (error) {
            this.report(error, errorContext);
        }
    }

    private report(error: unknown, errorContext?: ISchedulerErrorContext): void {
        const asError = error as Error | undefined;

        logger.error(errorContext?.message ?? 'Scheduler: error in scheduled callback', {
            error: { message: asError?.message, stack: asError?.stack },
            ...errorContext?.metadata,
        });
    }
}
