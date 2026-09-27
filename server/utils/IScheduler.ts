/**
 * Indirection over the timer and clock functions used by the game node.
 *
 * Production uses `RealScheduler`, which delegates to Node's timers. Tests substitute an
 * implementation that records tasks without creating real timers and fires them when the test
 * advances the clock, which makes time-dependent behaviour (disconnect grace periods, countdowns,
 * heartbeats, cleanup passes) deterministic and instant rather than something a test has to wait
 * for - or has to switch off in order to run at all.
 *
 * Implementations must run every callback inside an error guard. A callback invoked from a timer has
 * no caller left to catch for it, so an escaping exception would otherwise reach the process-level
 * handler and take the node down. Guarding here rather than at each call site makes that structural:
 * scheduling something is safe by construction, instead of safe only when the author remembers.
 */

/** A scheduled callback that can be cancelled. Replaces passing raw timer handles around. */
export interface IScheduledTask {
    cancel(): void;
}

/**
 * A scheduled callback.
 *
 * The return value is ignored, except that a returned promise is awaited for rejection: without
 * that, a rejection from an async callback becomes an unhandled rejection, which terminates the
 * process on Node 22 - the same failure the synchronous guard exists to prevent.
 *
 * Typed as returning `unknown` rather than `void | Promise<void>` so that concise arrow bodies
 * (`() => counter++`) remain valid, matching how Node types its own timer callbacks.
 */
export type ScheduledCallback = () => unknown;

/** Describes a scheduled callback for the log entry written if it throws. */
export interface ISchedulerErrorContext {

    /** Human-readable description of what was being attempted, e.g. 'Lobby: error during countdown'. */
    message: string;

    /** Structured fields to attach to the log entry, e.g. `{ lobbyId }`. */
    metadata?: Record<string, unknown>;
}

export interface IScheduler {

    /**
     * Runs `callback` once, after at least `delayMs` has elapsed. If `callback` throws or rejects,
     * the error is caught and logged rather than escaping to the process.
     *
     * `delayMs` is clamped to a minimum of 1ms, matching Node's own timer behaviour.
     */
    setTimeout(callback: ScheduledCallback, delayMs: number, errorContext?: ISchedulerErrorContext): IScheduledTask;

    /**
     * Runs `callback` repeatedly, every `intervalMs`. If `callback` throws or rejects, the error is
     * caught and logged, and the task stays scheduled - one failing tick does not stop the recurring
     * work.
     *
     * `intervalMs` is clamped to a minimum of 1ms, matching Node's own timer behaviour.
     */
    setInterval(callback: ScheduledCallback, intervalMs: number, errorContext?: ISchedulerErrorContext): IScheduledTask;

    /** Current wall-clock time in milliseconds since the epoch, equivalent to `Date.now()`. */
    now(): number;

    /** Current wall-clock time as a `Date`, equivalent to `new Date()`. */
    currentDate(): Date;
}

/**
 * Smallest delay a scheduler will honour. Node clamps `setTimeout`/`setInterval` to 1ms, so this
 * keeps virtual-clock implementations consistent with the real one - and stops a zero or negative
 * interval from becoming a task that can never advance past its own due time.
 */
export const minimumSchedulerDelayMs = 1;
