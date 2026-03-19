
import { constants as perfHooksConstants } from 'node:perf_hooks';

const runPerformanceBenchmarks = process.env.RUN_PERF_BENCHMARKS === '1';
const describePerformance = runPerformanceBenchmarks ? describe : xdescribe;

const gcKindNames = new Map([
    [perfHooksConstants.NODE_PERFORMANCE_GC_MINOR, 'minor'],
    [perfHooksConstants.NODE_PERFORMANCE_GC_MAJOR, 'major'],
    [perfHooksConstants.NODE_PERFORMANCE_GC_INCREMENTAL, 'incremental'],
    [perfHooksConstants.NODE_PERFORMANCE_GC_WEAKCB, 'weakcb']
]);

function forceGcIfAvailable() {
    if (typeof global.gc === 'function') {
        global.gc();
        return true;
    }

    return false;
}

function formatBytes(bytes) {
    if (bytes == null) {
        return 'n/a';
    }

    const sign = bytes < 0 ? '-' : '';
    const absoluteBytes = Math.abs(bytes);
    if (absoluteBytes < 1024) {
        return `${sign}${absoluteBytes} B`;
    }

    if (absoluteBytes < 1024 * 1024) {
        return `${sign}${(absoluteBytes / 1024).toFixed(1)} KiB`;
    }

    return `${sign}${(absoluteBytes / (1024 * 1024)).toFixed(2)} MiB`;
}

function createGcTracker() {
    const gcEvents = [];
    const observer = new globalThis.PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
            const gcEntry = entry as { kind?: number };
            const gcKind = typeof gcEntry.kind === 'number' ? gcEntry.kind : null;
            gcEvents.push({
                duration: entry.duration,
                kind: gcKind == null ? 'unknown' : gcKindNames.get(gcKind) ?? `unknown(${gcKind})`
            });
        }
    });

    observer.observe({ entryTypes: ['gc'] });

    return {
        stop() {
            observer.disconnect();

            const gcCountsByKind = {
                incremental: 0,
                major: 0,
                minor: 0,
                weakcb: 0
            };

            let gcDurationMs = 0;
            for (const gcEvent of gcEvents) {
                gcDurationMs += gcEvent.duration;
                if (gcEvent.kind in gcCountsByKind) {
                    gcCountsByKind[gcEvent.kind]++;
                }
            }

            return {
                gcCount: gcEvents.length,
                gcDurationMs,
                gcCountsByKind
            };
        }
    };
}

function measureBenchmark(iterations, benchmarkFn, warmupIterations = 5) {
    for (let iteration = 0; iteration < warmupIterations; iteration++) {
        benchmarkFn();
    }

    const gcWasForced = forceGcIfAvailable();
    const heapUsedBefore = process.memoryUsage().heapUsed;
    const gcTracker = createGcTracker();

    const durationsMs = [];
    for (let iteration = 0; iteration < iterations; iteration++) {
        const start = process.hrtime.bigint();
        benchmarkFn();
        const end = process.hrtime.bigint();

        durationsMs.push(Number(end - start) / 1_000_000);
    }

    const totalMs = durationsMs.reduce((sum, durationMs) => sum + durationMs, 0);
    const minMs = Math.min(...durationsMs);
    const maxMs = Math.max(...durationsMs);
    const heapUsedAfter = process.memoryUsage().heapUsed;
    const gcSummary = gcTracker.stop();

    let retainedHeapUsed = null;
    if (gcWasForced) {
        global.gc();
        retainedHeapUsed = process.memoryUsage().heapUsed;
    }

    return {
        iterations,
        minMs,
        maxMs,
        avgMs: totalMs / durationsMs.length,
        totalMs,
        gcWasForced,
        gcCount: gcSummary.gcCount,
        gcDurationMs: gcSummary.gcDurationMs,
        gcIncrementalCount: gcSummary.gcCountsByKind.incremental,
        gcMajorCount: gcSummary.gcCountsByKind.major,
        gcMinorCount: gcSummary.gcCountsByKind.minor,
        gcWeakCbCount: gcSummary.gcCountsByKind.weakcb,
        heapDeltaBytes: heapUsedAfter - heapUsedBefore,
        retainedHeapDeltaBytes: retainedHeapUsed == null ? null : retainedHeapUsed - heapUsedBefore,
    };
}

describe('Undo', function() {
    undoIntegration(function(contextRef) {
        describePerformance('SnapshotBenchmarks', function() {
            beforeEach(async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['republic-attack-pod', 'battlefield-marine', 'waylay'],
                        groundArena: ['fleet-lieutenant', 'battlefield-marine', 'pyke-sentinel', 'wampa'],
                        spaceArena: ['cartel-spacer', 'alliance-xwing'],
                        resources: 8,
                        leader: 'fennec-shand#honoring-the-deal'
                    },
                    player2: {
                        hand: ['waylay', 'battlefield-marine'],
                        groundArena: ['greedo#slow-on-the-draw', 'rey#keeping-the-past', 'superlaser-technician'],
                        spaceArena: ['tieln-fighter', 'alliance-xwing'],
                        resources: 8,
                        leader: 'luke-skywalker#faithful-friend'
                    }
                });
            });

            it('logs build and rollback timings for serializer snapshots', function() {
                const { context } = contextRef;
                const manager = context.game.gameObjectManager;
                const snapshotIterations = 50;
                const rollbackIterations = 25;
                const snapshotId = context.game.takeManualSnapshot(context.player1Object);

                expect(snapshotId).toBeGreaterThanOrEqual(0);

                const snapshotBuildBenchmark = measureBenchmark(snapshotIterations, () => {
                    manager.buildGameStateForSnapshot();
                });

                const rollbackBenchmark = measureBenchmark(rollbackIterations, () => {
                    const rolledBack = context.game.rollbackToSnapshotInternal({
                        type: 'manual',
                        playerId: context.player1Object.id,
                        snapshotId
                    });

                    expect(rolledBack).toBe(true);
                });

                console.table([
                    {
                        benchmark: 'buildGameStateForSnapshot',
                        iterations: snapshotBuildBenchmark.iterations,
                        avgMs: snapshotBuildBenchmark.avgMs.toFixed(3),
                        minMs: snapshotBuildBenchmark.minMs.toFixed(3),
                        maxMs: snapshotBuildBenchmark.maxMs.toFixed(3),
                        totalMs: snapshotBuildBenchmark.totalMs.toFixed(3),
                        gcCount: snapshotBuildBenchmark.gcCount,
                        gcMinor: snapshotBuildBenchmark.gcMinorCount,
                        gcMajor: snapshotBuildBenchmark.gcMajorCount,
                        gcIncremental: snapshotBuildBenchmark.gcIncrementalCount,
                        gcWeakCb: snapshotBuildBenchmark.gcWeakCbCount,
                        gcMs: snapshotBuildBenchmark.gcDurationMs.toFixed(3),
                        heapDelta: formatBytes(snapshotBuildBenchmark.heapDeltaBytes),
                        retainedHeapDelta: formatBytes(snapshotBuildBenchmark.retainedHeapDeltaBytes),
                        forcedGc: snapshotBuildBenchmark.gcWasForced
                    },
                    {
                        benchmark: 'rollbackToSnapshotInternal',
                        iterations: rollbackBenchmark.iterations,
                        avgMs: rollbackBenchmark.avgMs.toFixed(3),
                        minMs: rollbackBenchmark.minMs.toFixed(3),
                        maxMs: rollbackBenchmark.maxMs.toFixed(3),
                        totalMs: rollbackBenchmark.totalMs.toFixed(3),
                        gcCount: rollbackBenchmark.gcCount,
                        gcMinor: rollbackBenchmark.gcMinorCount,
                        gcMajor: rollbackBenchmark.gcMajorCount,
                        gcIncremental: rollbackBenchmark.gcIncrementalCount,
                        gcWeakCb: rollbackBenchmark.gcWeakCbCount,
                        gcMs: rollbackBenchmark.gcDurationMs.toFixed(3),
                        heapDelta: formatBytes(rollbackBenchmark.heapDeltaBytes),
                        retainedHeapDelta: formatBytes(rollbackBenchmark.retainedHeapDeltaBytes),
                        forcedGc: rollbackBenchmark.gcWasForced
                    }
                ]);
            });
        });
    });
});
