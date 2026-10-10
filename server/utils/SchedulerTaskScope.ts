import type { IScheduledTask, IScheduler, ISchedulerErrorContext, ScheduledCallback } from './IScheduler';

/** Binds timers and async work to one lifetime; cancellation stops new work and drains active work. */
export class SchedulerTaskScope implements IScheduler {
    private readonly cancellation = new AbortController();
    private readonly scheduledTasks = new Set<IScheduledTask>();
    private readonly runningTasks = new Set<Promise<unknown>>();

    public constructor(private readonly scheduler: IScheduler) {}

    public setTimeout(callback: ScheduledCallback, delayMs: number, errorContext?: ISchedulerErrorContext): IScheduledTask {
        return this.schedule(callback, (guardedCallback) => this.scheduler.setTimeout(guardedCallback, delayMs, errorContext), false);
    }

    public setInterval(callback: ScheduledCallback, intervalMs: number, errorContext?: ISchedulerErrorContext): IScheduledTask {
        return this.schedule(callback, (guardedCallback) => this.scheduler.setInterval(guardedCallback, intervalMs, errorContext), true);
    }

    public now(): number {
        return this.scheduler.now();
    }

    public currentDate(): Date {
        return this.scheduler.currentDate();
    }

    public async runAsync(callback: ScheduledCallback): Promise<void> {
        if (this.cancellation.signal.aborted) {
            return;
        }

        const task = Promise.resolve(callback());
        this.runningTasks.add(task);
        try {
            await task;
        } finally {
            this.runningTasks.delete(task);
        }
    }

    public async cancelAsync(): Promise<void> {
        this.cancellation.abort();
        for (const task of this.scheduledTasks) {
            task.cancel();
        }
        const results = await Promise.allSettled(this.runningTasks);
        for (const result of results) {
            if (result.status === 'rejected') {
                throw result.reason;
            }
        }
    }

    private schedule(
        callback: ScheduledCallback,
        scheduleCallback: (callback: ScheduledCallback) => IScheduledTask,
        repeating: boolean
    ): IScheduledTask {
        if (this.cancellation.signal.aborted) {
            return { cancel: () => undefined };
        }

        const task = scheduleCallback(() => {
            if (!repeating) {
                this.scheduledTasks.delete(scopedTask);
            }
            return this.runAsync(callback);
        });
        const scopedTask: IScheduledTask = {
            cancel: () => {
                task.cancel();
                this.scheduledTasks.delete(scopedTask);
            },
        };
        this.scheduledTasks.add(scopedTask);
        return scopedTask;
    }
}
