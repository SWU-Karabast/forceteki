/**
 * Measurement primitives for the snapshot/undo performance benchmarks (see
 * `docs/plans/00-performance-benchmarks.md`).
 *
 * Two families of numbers are captured for every benchmark:
 *
 * 1. **Speed** - per-iteration wall time (avg/min/max/p50/p95) measured with
 *    `process.hrtime.bigint()` around the timed block only.
 * 2. **Memory / GC pressure** - allocation deltas split into setup / timed /
 *    reset sections, plus GC event counts and total GC pause time attributed to
 *    the timed window via a `perf_hooks` GC observer.
 *
 * Memory is sampled as a full `process.memoryUsage()` record rather than
 * `heapUsed` alone. Snapshot payloads on the current engine are `Buffer`s
 * produced by `v8.serialize`, and Buffer bytes land in `external` /
 * `arrayBuffers`, *not* in `heapUsed`. Reporting only `heapUsed` would
 * under-report snapshot memory by most of its actual cost.
 */

import { PerformanceObserver, performance, constants as perfConstants } from 'node:perf_hooks';
import type { NodeGCPerformanceDetail } from 'node:perf_hooks';

export interface IMemorySample {
    arrayBuffers: number;
    external: number;
    heapTotal: number;
    heapUsed: number;
    rss: number;
}

export interface IMemoryDelta {
    arrayBuffersBytes: number;
    externalBytes: number;
    heapUsedBytes: number;
    rssBytes: number;

    /** `heapUsed + external`, the number to quote when comparing total allocation cost. */
    totalBytes: number;
}

export interface IGcSummary {
    count: number;
    durationMs: number;
    incrementalCount: number;
    majorCount: number;
    minorCount: number;
    weakCbCount: number;
}

export interface IBenchmarkResult {
    avgMs: number;
    benchmark: string;
    category: string;

    /** GC activity observed during the timed windows only. */
    gc: IGcSummary;
    gcCountPerIteration: number;
    gcMsPerIteration: number;

    /**
     * GC pause time as a fraction of the benchmark's own wall time. This is the
     * "GC running wild" number: work the engine did not ask for, charged to the
     * same thread that serves the game.
     */
    gcPauseFraction: number;
    iterations: number;
    maxMs: number;
    minMs: number;

    /** Whether `global.gc()` was available; retained numbers are null without it. */
    forcedGcAvailable: boolean;

    /** Allocation during the timed block, averaged per iteration. The headline memory number. */
    timedMemoryAvg: IMemoryDelta;

    /** Allocation during `beforeEachIteration`, averaged per iteration. Benchmark scaffolding, not product cost. */
    setupMemoryAvg: IMemoryDelta;

    /** Allocation during `afterEachIteration`, averaged per iteration. Benchmark scaffolding, not product cost. */
    resetMemoryAvg: IMemoryDelta;

    /** Whole-loop growth including GC noise. Directional only. */
    netMemoryDelta: IMemoryDelta;

    /** Growth that survived a forced GC after the loop. This is retention, i.e. a leak signal. */
    retainedMemoryDelta: IMemoryDelta | null;
    p50Ms: number;
    p95Ms: number;
    totalMs: number;
}

export interface IMeasureBenchmarkOptions {
    afterEachIteration?: () => void;
    beforeEachIteration?: () => void;
    warmupIterations?: number;
}

interface IGcEvent {
    duration: number;
    kind: number;
    startTime: number;
}

let gcEvents: IGcEvent[] = [];
let gcObserver: PerformanceObserver | null = null;

/**
 * Begin recording GC events for the process. Safe to call repeatedly; the second
 * and later calls are no-ops. Call `stopGcRecording()` in an `afterAll` so the
 * observer does not outlive the suite.
 */
export function startGcRecording(): void {
    if (gcObserver != null) {
        return;
    }

    gcEvents = [];
    gcObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
            gcEvents.push({
                startTime: entry.startTime,
                duration: entry.duration,
                kind: (entry.detail as NodeGCPerformanceDetail | undefined)?.kind ?? 0
            });
        }
    });

    gcObserver.observe({ entryTypes: ['gc'] });
}

export function stopGcRecording(): void {
    gcObserver?.disconnect();
    gcObserver = null;
    gcEvents = [];
}

/**
 * GC entries are delivered to the observer on the event loop, not synchronously
 * during the measured loop, and a single turn is not enough to drain them (one
 * `setImmediate` reliably reports zero events after a loop that triggered ~60).
 * Yield repeatedly until the recorded count stops growing.
 */
export async function flushGcEventsAsync(): Promise<void> {
    const maxTurns = 10;
    let previousCount = -1;

    for (let turn = 0; turn < maxTurns && gcEvents.length !== previousCount; turn++) {
        previousCount = gcEvents.length;
        await new Promise<void>((resolve) => setImmediate(resolve));
        await new Promise<void>((resolve) => setTimeout(resolve, 0));
    }
}

function emptyGcSummary(): IGcSummary {
    return { count: 0, durationMs: 0, majorCount: 0, minorCount: 0, incrementalCount: 0, weakCbCount: 0 };
}

function summarizeGcWindows(windows: { end: number; start: number }[]): IGcSummary {
    const summary = emptyGcSummary();

    for (const event of gcEvents) {
        const inAnyWindow = windows.some((window) => event.startTime >= window.start && event.startTime <= window.end);
        if (!inAnyWindow) {
            continue;
        }

        summary.count++;
        summary.durationMs += event.duration;

        switch (event.kind) {
            case perfConstants.NODE_PERFORMANCE_GC_MAJOR:
                summary.majorCount++;
                break;
            case perfConstants.NODE_PERFORMANCE_GC_MINOR:
                summary.minorCount++;
                break;
            case perfConstants.NODE_PERFORMANCE_GC_INCREMENTAL:
                summary.incrementalCount++;
                break;
            case perfConstants.NODE_PERFORMANCE_GC_WEAKCB:
                summary.weakCbCount++;
                break;
            default:
                break;
        }
    }

    return summary;
}

export function sampleMemory(): IMemorySample {
    const usage = process.memoryUsage();

    return {
        heapUsed: usage.heapUsed,
        heapTotal: usage.heapTotal,
        external: usage.external,
        arrayBuffers: usage.arrayBuffers,
        rss: usage.rss
    };
}

export function memoryDelta(before: IMemorySample, after: IMemorySample): IMemoryDelta {
    const heapUsedBytes = after.heapUsed - before.heapUsed;
    const externalBytes = after.external - before.external;

    return {
        heapUsedBytes,
        externalBytes,
        arrayBuffersBytes: after.arrayBuffers - before.arrayBuffers,
        rssBytes: after.rss - before.rss,
        totalBytes: heapUsedBytes + externalBytes
    };
}

function emptyMemoryDelta(): IMemoryDelta {
    return { heapUsedBytes: 0, externalBytes: 0, arrayBuffersBytes: 0, rssBytes: 0, totalBytes: 0 };
}

function addMemoryDelta(accumulator: IMemoryDelta, delta: IMemoryDelta): void {
    accumulator.heapUsedBytes += delta.heapUsedBytes;
    accumulator.externalBytes += delta.externalBytes;
    accumulator.arrayBuffersBytes += delta.arrayBuffersBytes;
    accumulator.rssBytes += delta.rssBytes;
    accumulator.totalBytes += delta.totalBytes;
}

function scaleMemoryDelta(delta: IMemoryDelta, divisor: number): IMemoryDelta {
    return {
        heapUsedBytes: delta.heapUsedBytes / divisor,
        externalBytes: delta.externalBytes / divisor,
        arrayBuffersBytes: delta.arrayBuffersBytes / divisor,
        rssBytes: delta.rssBytes / divisor,
        totalBytes: delta.totalBytes / divisor
    };
}

export function forceGcIfAvailable(): boolean {
    if (typeof global.gc === 'function') {
        global.gc();
        return true;
    }

    return false;
}

function percentile(sortedValues: number[], fraction: number): number {
    if (sortedValues.length === 0) {
        return 0;
    }

    const index = Math.min(sortedValues.length - 1, Math.max(0, Math.ceil(fraction * sortedValues.length) - 1));
    return sortedValues[index];
}

/**
 * Runs `benchmarkFn` `iterations` times (after `warmupIterations` untimed runs)
 * and returns speed + memory + GC statistics for the timed block.
 *
 * `beforeEachIteration` / `afterEachIteration` run outside the timer and their
 * allocation is reported separately, so benchmark scaffolding (state reset,
 * assertions) never contaminates the headline numbers.
 */
export async function measureBenchmarkAsync(
    category: string,
    benchmark: string,
    iterations: number,
    benchmarkFn: () => void,
    options: IMeasureBenchmarkOptions = {}
): Promise<IBenchmarkResult> {
    const { afterEachIteration, beforeEachIteration, warmupIterations = 5 } = options;

    const durationsMs: number[] = [];
    const setupMemoryTotal = emptyMemoryDelta();
    const timedMemoryTotal = emptyMemoryDelta();
    const resetMemoryTotal = emptyMemoryDelta();
    const timedWindows: { end: number; start: number }[] = [];

    const runIteration = (trackDuration: boolean) => {
        const beforeSetup = sampleMemory();
        beforeEachIteration?.();

        const beforeBenchmark = sampleMemory();
        const windowStart = performance.now();
        const start = process.hrtime.bigint();
        try {
            benchmarkFn();
        } finally {
            const end = process.hrtime.bigint();
            const windowEnd = performance.now();
            const afterBenchmark = sampleMemory();

            afterEachIteration?.();
            const afterCleanup = sampleMemory();

            if (trackDuration) {
                durationsMs.push(Number(end - start) / 1_000_000);
                timedWindows.push({ start: windowStart, end: windowEnd });
                addMemoryDelta(setupMemoryTotal, memoryDelta(beforeSetup, beforeBenchmark));
                addMemoryDelta(timedMemoryTotal, memoryDelta(beforeBenchmark, afterBenchmark));
                addMemoryDelta(resetMemoryTotal, memoryDelta(afterBenchmark, afterCleanup));
            }
        }
    };

    for (let iteration = 0; iteration < warmupIterations; iteration++) {
        runIteration(false);
    }

    const forcedGcAvailable = forceGcIfAvailable();
    await flushGcEventsAsync();
    const memoryBefore = sampleMemory();

    for (let iteration = 0; iteration < iterations; iteration++) {
        runIteration(true);
    }

    const memoryAfter = sampleMemory();

    // Let the observer drain everything the loop produced before attributing GC to the timed windows.
    await flushGcEventsAsync();
    const gc = summarizeGcWindows(timedWindows);

    let retainedMemoryDelta: IMemoryDelta | null = null;
    if (forcedGcAvailable) {
        forceGcIfAvailable();
        retainedMemoryDelta = memoryDelta(memoryBefore, sampleMemory());
    }

    const sortedDurations = [...durationsMs].sort((left, right) => left - right);
    const totalMs = durationsMs.reduce((sum, durationMs) => sum + durationMs, 0);

    return {
        category,
        benchmark,
        iterations,
        avgMs: totalMs / durationsMs.length,
        minMs: sortedDurations[0],
        maxMs: sortedDurations[sortedDurations.length - 1],
        p50Ms: percentile(sortedDurations, 0.5),
        p95Ms: percentile(sortedDurations, 0.95),
        totalMs,
        gc,
        gcCountPerIteration: gc.count / iterations,
        gcMsPerIteration: gc.durationMs / iterations,
        gcPauseFraction: totalMs === 0 ? 0 : gc.durationMs / totalMs,
        forcedGcAvailable,
        setupMemoryAvg: scaleMemoryDelta(setupMemoryTotal, iterations),
        timedMemoryAvg: scaleMemoryDelta(timedMemoryTotal, iterations),
        resetMemoryAvg: scaleMemoryDelta(resetMemoryTotal, iterations),
        netMemoryDelta: memoryDelta(memoryBefore, memoryAfter),
        retainedMemoryDelta
    };
}

export function formatBytes(bytes: number | null | undefined): string {
    if (bytes == null || !Number.isFinite(bytes)) {
        return 'n/a';
    }

    const sign = bytes < 0 ? '-' : '';
    const absoluteBytes = Math.abs(bytes);
    if (absoluteBytes < 1024) {
        return `${sign}${absoluteBytes.toFixed(0)} B`;
    }

    if (absoluteBytes < 1024 * 1024) {
        return `${sign}${(absoluteBytes / 1024).toFixed(1)} KiB`;
    }

    return `${sign}${(absoluteBytes / (1024 * 1024)).toFixed(2)} MiB`;
}

/** Compact console row for local runs. The JSON report is the artifact of record. */
export function toConsoleRow(scenario: string, result: IBenchmarkResult) {
    return {
        scenario,
        category: result.category,
        benchmark: result.benchmark,
        iters: result.iterations,
        avgMs: result.avgMs.toFixed(3),
        p95Ms: result.p95Ms.toFixed(3),
        timedHeap: formatBytes(result.timedMemoryAvg.heapUsedBytes),
        timedExternal: formatBytes(result.timedMemoryAvg.externalBytes),
        timedTotal: formatBytes(result.timedMemoryAvg.totalBytes),
        retainedTotal: formatBytes(result.retainedMemoryDelta?.totalBytes),
        gcPerIter: result.gcCountPerIteration.toFixed(2),
        gcMsPerIter: result.gcMsPerIteration.toFixed(3),
        gcPause: `${(result.gcPauseFraction * 100).toFixed(1)}%`,
        gcMajor: result.gc.majorCount
    };
}
