import type { IScheduledTask, IScheduler, ISchedulerErrorContext, ScheduledCallback } from '../../../server/utils/IScheduler';
import { minimumSchedulerDelayMs } from '../../../server/utils/IScheduler';

interface IScheduledEntry {
    id: number;
    callback: ScheduledCallback;
    dueAtMs: number;

    /** Set for repeating tasks, so the entry can be rescheduled after each run. */
    intervalMs?: number;
    errorContext?: ISchedulerErrorContext;
}

/** An error that escaped a scheduled callback, retained so a spec can assert on it. */
export interface ICapturedSchedulerError {
    error: unknown;
    context?: ISchedulerErrorContext;
}

/**
 * An {@link IScheduler} that never creates real timers.
 *
 * Tasks are recorded against a virtual clock and only run when a test calls {@link advanceAsync}.
 * That has two consequences worth being explicit about:
 *
 * - Time-dependent behaviour is instant and deterministic. A 20 second disconnect grace period is
 *   one `advanceAsync(20_000)` call, with no real waiting and no flakiness under load.
 * - Recurring work does not have to be switched off in order for a test process to exit, because
 *   nothing is ever registered with Node. Background tasks stay registered and observable, so
 *   things like the queue heartbeat can be asserted on rather than disabled.
 *
 * Errors thrown by a callback are guarded the same way production guards them, but are also
 * recorded in {@link capturedErrors}. Production deliberately swallows these so a single failure
 * cannot take the node down; a test that swallowed them silently would report a false pass, so
 * {@link assertNoCapturedErrors} is available to surface them.
 */
export class TestScheduler implements IScheduler {
    /** Upper bound on tasks run by a single {@link advanceAsync}, to turn a runaway loop into a failure. */
    private static readonly maxTasksPerAdvance = 100_000;

    private currentTimeMs: number;
    private nextId = 1;
    private readonly entries = new Map<number, IScheduledEntry>();
    private readonly errors: ICapturedSchedulerError[] = [];

    /**
     * @param startTimeMs Initial value of the virtual clock. Defaults to a fixed timestamp so that
     * any value derived from it is stable across runs.
     */
    public constructor(startTimeMs = Date.UTC(2025, 0, 1)) {
        this.currentTimeMs = startTimeMs;
    }

    public setTimeout(callback: ScheduledCallback, delayMs: number, errorContext?: ISchedulerErrorContext): IScheduledTask {
        return this.schedule(callback, delayMs, undefined, errorContext);
    }

    public setInterval(callback: ScheduledCallback, intervalMs: number, errorContext?: ISchedulerErrorContext): IScheduledTask {
        return this.schedule(callback, intervalMs, Math.max(minimumSchedulerDelayMs, intervalMs), errorContext);
    }

    public now(): number {
        return this.currentTimeMs;
    }

    public currentDate(): Date {
        return new Date(this.currentTimeMs);
    }

    /** Number of tasks still registered, for asserting that teardown released everything. */
    public get pendingTaskCount(): number {
        return this.entries.size;
    }

    /** Errors thrown by scheduled callbacks since this scheduler was created. */
    public get capturedErrors(): readonly ICapturedSchedulerError[] {
        return this.errors;
    }

    /** Discards recorded errors, for a spec that provoked one deliberately and has asserted on it. */
    public clearCapturedErrors(): void {
        this.errors.length = 0;
    }

    /** Fails with the first captured error, if a scheduled callback threw. */
    public assertNoCapturedErrors(): void {
        if (this.errors.length === 0) {
            return;
        }

        const first = this.errors[0];
        const description = first.context?.message ?? 'scheduled callback';
        throw new Error(`TestScheduler: ${this.errors.length} scheduled callback(s) threw. First was '${description}': ${first.error}`);
    }

    /**
     * Moves the virtual clock forward, running every task that comes due along the way.
     *
     * Tasks run in due order, and the clock is moved to each task's due time before it runs, so a
     * callback reading {@link now} sees the time it was scheduled for rather than the end of the
     * whole advance. Pending work is settled after each callback via {@link settlePendingWorkAsync}
     * so that `async` work started by a task completes before the next one runs.
     */
    public async advanceAsync(durationMs: number): Promise<void> {
        const targetTimeMs = this.currentTimeMs + durationMs;

        // repeating tasks re-register as they run, so the due set is recomputed each pass
        let iterations = 0;
        while (true) {
            const next = this.nextDueEntry(targetTimeMs);
            if (!next) {
                break;
            }

            // A runaway loop here would spin on microtasks and never yield, so jasmine's own spec
            // timeout could not fire and the run would hang with no diagnostic. Fail loudly instead.
            if (++iterations > TestScheduler.maxTasksPerAdvance) {
                throw new Error(
                    `TestScheduler: advanceAsync(${durationMs}) ran more than ${TestScheduler.maxTasksPerAdvance} tasks, ` +
                    'which usually means a task reschedules itself faster than the clock advances'
                );
            }

            this.currentTimeMs = next.dueAtMs;

            if (next.intervalMs === undefined) {
                this.entries.delete(next.id);
            } else {
                next.dueAtMs = this.currentTimeMs + next.intervalMs;
            }

            this.runGuarded(next);
            await this.settlePendingWorkAsync();
        }

        this.currentTimeMs = targetTimeMs;
        await this.settlePendingWorkAsync();
    }

    /**
     * Lets work started by a callback finish without moving the clock.
     *
     * Draining microtasks alone is not enough: anything that awaits a macrotask (`setImmediate`, I/O,
     * a socket.io ack round-trip) would still be pending when the advance returns, leaving a spec to
     * observe stale state. Yielding to the macrotask queue as well covers those.
     *
     * It does not settle work that waits on a *real* timer - that is deliberate, since real timers
     * are exactly what this scheduler replaces.
     */
    public async settlePendingWorkAsync(): Promise<void> {
        for (let i = 0; i < 10; i++) {
            await Promise.resolve();
        }

        await new Promise<void>((resolve) => setImmediate(resolve));
    }

    /**
     * Mirrors production's guard so a throwing callback cannot escape, while also recording the
     * error. Without the record a spec could pass while a scheduled callback was failing every tick.
     *
     * Async callbacks are guarded the same way production guards them: an unhandled rejection is
     * just as fatal as a synchronous throw, and would otherwise be invisible to the captured errors.
     */
    private runGuarded(entry: IScheduledEntry): void {
        try {
            const result = entry.callback();

            if (result instanceof Promise) {
                result.catch((error) => this.errors.push({ error, context: entry.errorContext }));
            }
        } catch (error) {
            this.errors.push({ error, context: entry.errorContext });
        }
    }

    private nextDueEntry(targetTimeMs: number): IScheduledEntry | undefined {
        let earliest: IScheduledEntry | undefined;

        for (const entry of this.entries.values()) {
            if (entry.dueAtMs > targetTimeMs) {
                continue;
            }
            if (!earliest || entry.dueAtMs < earliest.dueAtMs || (entry.dueAtMs === earliest.dueAtMs && entry.id < earliest.id)) {
                earliest = entry;
            }
        }

        return earliest;
    }

    private schedule(
        callback: ScheduledCallback,
        delayMs: number,
        intervalMs: number | undefined,
        errorContext: ISchedulerErrorContext | undefined
    ): IScheduledTask {
        const id = this.nextId++;

        this.entries.set(id, {
            id,
            callback,

            // clamped like Node clamps its own timers, so a zero or negative delay cannot produce a
            // task that is due at or before the current virtual time forever
            dueAtMs: this.currentTimeMs + Math.max(minimumSchedulerDelayMs, delayMs),
            intervalMs,
            errorContext,
        });

        return { cancel: () => this.entries.delete(id) };
    }
}
