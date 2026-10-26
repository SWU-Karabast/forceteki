import type { IScheduledTask, IScheduler, ISchedulerErrorContext, ScheduledCallback } from '../../server/utils/IScheduler';

/**
 * An {@link IScheduler} that never runs anything.
 *
 * Used by the card test harness, which constructs a `Game` directly and has no use for timers. It
 * preserves the invariant that suite previously had from passing a no-op timeout builder: a live
 * timer is impossible, so nothing can fire partway through an unrelated spec.
 *
 * Time still comes from the system clock, since card specs read it only incidentally.
 */
export class NoopScheduler implements IScheduler {
    public setTimeout(_callback: ScheduledCallback, _delayMs: number, _errorContext?: ISchedulerErrorContext): IScheduledTask {
        return { cancel: () => undefined };
    }

    public setInterval(_callback: ScheduledCallback, _intervalMs: number, _errorContext?: ISchedulerErrorContext): IScheduledTask {
        return { cancel: () => undefined };
    }

    public now(): number {
        return Date.now();
    }

    public currentDate(): Date {
        return new Date();
    }
}
