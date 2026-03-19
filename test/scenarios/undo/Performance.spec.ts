
import v8 from 'node:v8';
import { PhaseName, SnapshotType } from '../../../server/game/core/Constants';
import type { SerializedGameObjectStateMap } from '../../../server/game/core/StateSerializers';
import { SnapshotTimepoint } from '../../../server/game/core/snapshot/SnapshotInterfaces';
import type { IDeltaSnapshot, IGameSnapshot, IRollbackResult } from '../../../server/game/core/snapshot/SnapshotInterfaces';

interface IMeasureBenchmarkOptions {
    afterEachIteration?: () => void;
    beforeEachIteration?: () => void;
    warmupIterations?: number;
}

interface IBenchmarkSnapshotFactory {
    createRecoverySnapshot(): IGameSnapshot;
}

interface IBenchmarkSnapshotManager {
    currentSnapshotId: number | null;
    currentSnapshottedTimepointNumber: number | null;
    snapshotFactory: IBenchmarkSnapshotFactory;
    clearAllSnapshots(): void;
    moveToNextTimepoint(timepoint: SnapshotTimepoint): void;
    rollbackTo(settings: { type: SnapshotType.Phase; phaseName: PhaseName; phaseOffset?: number }): IRollbackResult;
    takeSnapshot(settings: { type: SnapshotType.Phase; phaseName: PhaseName }): number;
}

interface IBenchmarkStateManager {
    buildGameStateForSnapshot(): SerializedGameObjectStateMap;
    rollbackToSnapshot(snapshot: IGameSnapshot, beforeRollbackSnapshot?: IGameSnapshot): boolean;
    rollbackToDeltaChain(deltas: IDeltaSnapshot[], beforeRollbackSnapshot?: IGameSnapshot): boolean;
}

interface IBenchmarkScenario {
    mutatedCardLimit?: number;
    name: string;
    rollbackIterations: number;
    setup: SwuSetupTestOptions;
    snapshotIterations: number;
}

interface IBenchmarkComparison {
    timeVsFull?: string;
    timedHeapVsFull?: string;
}

function createRepeatedCardList(cardNames, count) {
    const cards = [];
    for (let index = 0; index < count; index++) {
        cards.push(cardNames[index % cardNames.length]);
    }

    return cards;
}

function createConfiguredBenchmarkPlayer(cardPools, leader, cardCounts) {
    const hand = createRepeatedCardList(cardPools.hand, cardCounts.hand);
    const groundArena = createRepeatedCardList(cardPools.groundArena, cardCounts.groundArena);
    const spaceArena = createRepeatedCardList(cardPools.spaceArena, cardCounts.spaceArena);
    const resources = cardCounts.resources;

    const totalCards = hand.length + groundArena.length + spaceArena.length + resources;
    if (totalCards !== 40) {
        throw new Error(`Expected 40 cards in full benchmark setup, got ${totalCards}`);
    }

    return {
        hand,
        groundArena,
        spaceArena,
        resources,
        leader
    };
}

function createFortyCardBenchmarkPlayer(cardPools, leader) {
    return createConfiguredBenchmarkPlayer(cardPools, leader, {
        hand: 8,
        groundArena: 10,
        spaceArena: 10,
        resources: 12
    });
}

function createSparseFortyCardBenchmarkPlayer(cardPools, leader) {
    return createConfiguredBenchmarkPlayer(cardPools, leader, {
        hand: 14,
        groundArena: 3,
        spaceArena: 3,
        resources: 20
    });
}

function createUltraSparseFortyCardBenchmarkPlayer(cardPools, leader) {
    return createConfiguredBenchmarkPlayer(cardPools, leader, {
        hand: 16,
        groundArena: 1,
        spaceArena: 1,
        resources: 22
    });
}

const fullBoardCardPools = {
    player1: {
        hand: ['republic-attack-pod', 'battlefield-marine', 'waylay', 'vanquish'],
        groundArena: ['fleet-lieutenant', 'battlefield-marine', 'pyke-sentinel', 'wampa', 'consular-security-force'],
        spaceArena: ['cartel-spacer', 'alliance-xwing', 'green-squadron-awing', 'tieln-fighter', 'system-patrol-craft']
    },
    player2: {
        hand: ['waylay', 'battlefield-marine', 'vanquish', 'open-fire'],
        groundArena: ['greedo#slow-on-the-draw', 'rey#keeping-the-past', 'superlaser-technician', 'pyke-sentinel', 'wampa'],
        spaceArena: ['tieln-fighter', 'alliance-xwing', 'green-squadron-awing', 'cartel-spacer', 'imperial-interceptor']
    }
};

// Keep one compact setup for quick local comparisons, one denser setup that makes
// snapshot work scale with the number of in-play objects, one near-full-deck state,
// and sparse-mutation variants with the same total cards but fewer changed units.
const benchmarkScenarios: IBenchmarkScenario[] = [
    {
        // Small board that keeps iteration counts high enough to spot regressions in tight loops.
        name: 'compact-board',
        snapshotIterations: 50,
        rollbackIterations: 25,
        setup: {
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
        }
    },
    {
        // Larger board with more cards and attachments so full-snapshot and delta costs scale up.
        name: 'large-board',
        snapshotIterations: 25,
        rollbackIterations: 15,
        setup: {
            phase: 'action',
            player1: {
                hand: ['republic-attack-pod', 'battlefield-marine', 'waylay', 'battlefield-marine', 'waylay'],
                groundArena: [
                    { card: 'fleet-lieutenant', upgrades: ['academy-training'] },
                    'battlefield-marine',
                    'pyke-sentinel',
                    'wampa',
                    'consular-security-force',
                    'first-legion-snowtrooper',
                    'battlefield-marine',
                    { card: 'death-trooper', upgrades: ['academy-training'] }
                ],
                spaceArena: [
                    'cartel-spacer',
                    'alliance-xwing',
                    'green-squadron-awing',
                    'tieln-fighter',
                    'cartel-spacer',
                    { card: 'alliance-xwing', upgrades: ['entrenched'] }
                ],
                resources: 12,
                leader: 'fennec-shand#honoring-the-deal'
            },
            player2: {
                hand: ['waylay', 'battlefield-marine', 'waylay', 'battlefield-marine'],
                groundArena: [
                    'greedo#slow-on-the-draw',
                    'rey#keeping-the-past',
                    'superlaser-technician',
                    'pyke-sentinel',
                    'wampa',
                    'battlefield-marine',
                    'consular-security-force',
                    { card: 'atst', upgrades: ['academy-training'] }
                ],
                spaceArena: [
                    'tieln-fighter',
                    'alliance-xwing',
                    'green-squadron-awing',
                    'cartel-spacer',
                    'tieln-fighter',
                    { card: 'alliance-xwing', upgrades: ['entrenched'] }
                ],
                resources: 12,
                leader: 'luke-skywalker#faithful-friend'
            }
        }
    },
    {
        // Approximate a full 40-card-per-player state across arenas, hand, and resources.
        // Lower iteration counts keep local runs practical at the largest benchmark size.
        name: 'forty-cards-per-player',
        snapshotIterations: 10,
        rollbackIterations: 6,
        setup: {
            phase: 'action',
            player1: createFortyCardBenchmarkPlayer(fullBoardCardPools.player1, 'fennec-shand#honoring-the-deal'),
            player2: createFortyCardBenchmarkPlayer(fullBoardCardPools.player2, 'luke-skywalker#faithful-friend')
        }
    },
    {
        // Keep the same 40-card total but move most cards out of the arenas so the delta path
        // only tracks a small subset of changed cards against a large serialized game state.
        name: 'forty-cards-sparse-mutations',
        snapshotIterations: 12,
        rollbackIterations: 8,
        setup: {
            phase: 'action',
            player1: createSparseFortyCardBenchmarkPlayer(fullBoardCardPools.player1, 'fennec-shand#honoring-the-deal'),
            player2: createSparseFortyCardBenchmarkPlayer(fullBoardCardPools.player2, 'luke-skywalker#faithful-friend')
        }
    },
    {
        // Force an even lower mutation density: only four arena cards total can be exhausted,
        // while the overall serialized state still holds 40 cards per player.
        name: 'forty-cards-four-mutated',
        mutatedCardLimit: 4,
        snapshotIterations: 15,
        rollbackIterations: 10,
        setup: {
            phase: 'action',
            player1: createUltraSparseFortyCardBenchmarkPlayer(fullBoardCardPools.player1, 'fennec-shand#honoring-the-deal'),
            player2: createUltraSparseFortyCardBenchmarkPlayer(fullBoardCardPools.player2, 'luke-skywalker#faithful-friend')
        }
    }
];

const runPerformanceBenchmarks = process.env.RUN_PERF_BENCHMARKS === '1';
const describePerformance = runPerformanceBenchmarks ? describe : xdescribe;

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

function serializePayloadSize(value: unknown): number {
    return v8.serialize(value).byteLength;
}

function formatPayloadComparison(deltaBytes: number, fullBytes: number) {
    return summarizeRelativeDifference(deltaBytes, fullBytes, 'smaller', 'larger');
}

// Heap metrics are sampled around each iteration in three sections:
// setup runs before the timer starts, timed covers only benchmarkFn, and reset covers afterEachIteration.
// Compare avgMs and timedHeapAvg first when judging delta versus full; netHeapDelta includes loop-wide GC noise,
// while retainedHeapDelta shows what remained live after a forced GC at the end of the benchmark.
function measureBenchmark(iterations, benchmarkFn, options: IMeasureBenchmarkOptions = {}) {
    const {
        afterEachIteration,
        beforeEachIteration,
        warmupIterations = 5,
    } = options;

    const runIteration = (trackDuration) => {
        const heapBeforeSetup = process.memoryUsage().heapUsed;
        beforeEachIteration?.();

        const heapBeforeBenchmark = process.memoryUsage().heapUsed;

        const start = process.hrtime.bigint();
        try {
            benchmarkFn();
        } finally {
            const end = process.hrtime.bigint();
            const heapAfterBenchmark = process.memoryUsage().heapUsed;

            afterEachIteration?.();
            const heapAfterCleanup = process.memoryUsage().heapUsed;

            if (trackDuration) {
                durationsMs.push(Number(end - start) / 1_000_000);
                setupHeapDeltas.push(heapBeforeBenchmark - heapBeforeSetup);
                benchmarkHeapDeltas.push(heapAfterBenchmark - heapBeforeBenchmark);
                cleanupHeapDeltas.push(heapAfterCleanup - heapAfterBenchmark);
            }
        }
    };

    const durationsMs: number[] = [];
    const setupHeapDeltas: number[] = [];
    const benchmarkHeapDeltas: number[] = [];
    const cleanupHeapDeltas: number[] = [];
    for (let iteration = 0; iteration < warmupIterations; iteration++) {
        runIteration(false);
    }

    const gcWasForced = forceGcIfAvailable();
    const heapUsedBefore = process.memoryUsage().heapUsed;

    for (let iteration = 0; iteration < iterations; iteration++) {
        runIteration(true);
    }

    const totalMs = durationsMs.reduce((sum, durationMs) => sum + durationMs, 0);
    const minMs = Math.min(...durationsMs);
    const maxMs = Math.max(...durationsMs);
    const heapUsedAfter = process.memoryUsage().heapUsed;

    let retainedHeapUsed = null;
    if (gcWasForced) {
        global.gc();
        retainedHeapUsed = process.memoryUsage().heapUsed;
    }

    const totalSetupHeapDeltaBytes = setupHeapDeltas.reduce((sum, deltaBytes) => sum + deltaBytes, 0);
    const totalBenchmarkHeapDeltaBytes = benchmarkHeapDeltas.reduce((sum, deltaBytes) => sum + deltaBytes, 0);
    const totalCleanupHeapDeltaBytes = cleanupHeapDeltas.reduce((sum, deltaBytes) => sum + deltaBytes, 0);

    return {
        iterations,
        minMs,
        maxMs,
        avgMs: totalMs / durationsMs.length,
        totalMs,
        // gcWasForced,
        // gcCount: gcSummary.gcCount,
        // gcDurationMs: gcSummary.gcDurationMs,
        // gcIncrementalCount: gcSummary.gcCountsByKind.incremental,
        // gcMajorCount: gcSummary.gcCountsByKind.major,
        // gcMinorCount: gcSummary.gcCountsByKind.minor,
        // gcWeakCbCount: gcSummary.gcCountsByKind.weakcb,
        avgSetupHeapDeltaBytes: totalSetupHeapDeltaBytes / iterations,
        avgBenchmarkHeapDeltaBytes: totalBenchmarkHeapDeltaBytes / iterations,
        avgCleanupHeapDeltaBytes: totalCleanupHeapDeltaBytes / iterations,
        netHeapDeltaBytes: heapUsedAfter - heapUsedBefore,
        retainedHeapDeltaBytes: retainedHeapUsed == null ? null : retainedHeapUsed - heapUsedBefore,
    };
}

function formatBenchmarkResult(scenario, mutatedCards, category, benchmark, result, comparison: IBenchmarkComparison = {}) {
    return {
        scenario,
        mutatedCards,
        category,
        benchmark,
        iterations: result.iterations,
        avgMs: result.avgMs.toFixed(3),
        minMs: result.minMs.toFixed(3),
        maxMs: result.maxMs.toFixed(3),
        totalMs: result.totalMs.toFixed(3),
        // gcCount: result.gcCount,
        // gcMinor: result.gcMinorCount,
        // gcMajor: result.gcMajorCount,
        // gcIncremental: result.gcIncrementalCount,
        // gcWeakCb: result.gcWeakCbCount,
        // gcMs: result.gcDurationMs.toFixed(3),
        setupHeapAvg: formatBytes(result.avgSetupHeapDeltaBytes),
        timedHeapAvg: formatBytes(result.avgBenchmarkHeapDeltaBytes),
        resetHeapAvg: formatBytes(result.avgCleanupHeapDeltaBytes),
        // netHeapDelta: formatBytes(result.netHeapDeltaBytes),
        // retainedHeapDelta: formatBytes(result.retainedHeapDeltaBytes),
        timeVsFull: comparison.timeVsFull ?? 'baseline',
        timedHeapVsFull: comparison.timedHeapVsFull ?? 'baseline',
        // forcedGc: result.gcWasForced
    };
}

function compareMetric(deltaValue: number, fullValue: number, formatter: (value: number) => string, lowerLabel: string, higherLabel: string) {
    if (deltaValue === fullValue) {
        return `matches full at ${formatter(deltaValue)}`;
    }

    if (deltaValue < fullValue) {
        const improvement = ((fullValue - deltaValue) / fullValue) * 100;
        return `${lowerLabel} by ${improvement.toFixed(1)}% (${formatter(deltaValue)} vs ${formatter(fullValue)})`;
    }

    const regression = ((deltaValue - fullValue) / fullValue) * 100;
    return `${higherLabel} by ${regression.toFixed(1)}% (${formatter(deltaValue)} vs ${formatter(fullValue)})`;
}

function summarizeRelativeDifference(deltaValue: number, fullValue: number, lowerLabel: string, higherLabel: string) {
    if (deltaValue === fullValue) {
        return 'matches full';
    }

    if (deltaValue < fullValue) {
        const improvement = ((fullValue - deltaValue) / fullValue) * 100;
        return `${lowerLabel} ${improvement.toFixed(1)}%`;
    }

    const regression = ((deltaValue - fullValue) / fullValue) * 100;
    return `${higherLabel} ${regression.toFixed(1)}%`;
}

function logScenarioBenchmarkGuidance(
    scenarioName: string,
    fullSnapshotBenchmark,
    fullRollbackBenchmark,
    deltaSnapshotBenchmark,
    deltaRollbackBenchmark,
    deltaStartTrackingDiagnostic,
    deltaCheckpointDiagnostic
) {
    console.log(`Comparison guidance for ${scenarioName}:`);
    console.log('  createRecoverySnapshot measures the full snapshot anchor cost: serialize the current live game state into a restorable snapshot payload.');
    console.log('  startTrackingAndCheckpoint measures the delta write path: start tracking from the existing anchor, capture representative mutations, then finalize the delta payload.');
    console.log('  Compare full/rollbackToSnapshot against delta/rollbackToDeltaChain for restore cost.');
    console.log('  startTrackingOnly and checkpointOnly break out the steady-state delta path so you can tell whether baseline tracking or finalize work dominates.');
    console.log('  Lower avgMs and timedHeapAvg are the main wins for transient work. Lower resetHeapAvg means cheaper benchmark reset work, not cheaper timed work.');
    console.log('  Payload rows report serialized bytes. Use them to compare persisted snapshot/delta size rather than transient heap churn during the timed block.');
    console.log(`  Write path: delta is ${compareMetric(deltaSnapshotBenchmark.avgMs, fullSnapshotBenchmark.avgMs, (value) => `${value.toFixed(3)} ms`, 'faster', 'slower')}; timed heap is ${compareMetric(deltaSnapshotBenchmark.avgBenchmarkHeapDeltaBytes, fullSnapshotBenchmark.avgBenchmarkHeapDeltaBytes, formatBytes, 'lower', 'higher')}.`);
    console.log(`  Restore path: delta is ${compareMetric(deltaRollbackBenchmark.avgMs, fullRollbackBenchmark.avgMs, (value) => `${value.toFixed(3)} ms`, 'faster', 'slower')}; timed heap is ${compareMetric(deltaRollbackBenchmark.avgBenchmarkHeapDeltaBytes, fullRollbackBenchmark.avgBenchmarkHeapDeltaBytes, formatBytes, 'lower', 'higher')}.`);
    console.log(`  Delta write breakdown: startTrackingOnly averages ${deltaStartTrackingDiagnostic.avgMs.toFixed(3)} ms and checkpointOnly averages ${deltaCheckpointDiagnostic.avgMs.toFixed(3)} ms.`);
    console.log('  If startTrackingOnly dominates, the remaining write-path gap is mostly baseline state capture. If checkpointOnly dominates, changed-field finalize work is the main issue.');
}

// Disabled but kept for later.
function logSnapshotManagerGuidance(
    scenarioName: string,
    fullBoundaryBenchmark,
    deltaBoundaryBenchmark,
    rollbackBenchmark
) {
    console.log(`SnapshotManager orchestration for ${scenarioName}:`);
    console.log(`  moveToNextTimepoint(StartOfPhase) averages ${fullBoundaryBenchmark.avgMs.toFixed(3)} ms and exercises the full-snapshot anchor plus delta baseline startup path.`);
    console.log(`  moveToNextTimepoint(Action) averages ${deltaBoundaryBenchmark.avgMs.toFixed(3)} ms and exercises checkpointDelta() through the public SnapshotManager API.`);
    console.log(`  rollbackTo(Phase) averages ${rollbackBenchmark.avgMs.toFixed(3)} ms and includes the post-rollback delta baseline restart path.`);
}

function canBenchmarkExhaustCard(card) {
    if (typeof card?.canBeExhausted !== 'function' || typeof card?.isUnit !== 'function') {
        return false;
    }

    try {
        if (!card.isUnit()) {
            return false;
        }

        return card.canBeExhausted();
    } catch {
        return false;
    }
}

function getBenchmarkCards(context, scenario: IBenchmarkScenario) {
    const benchmarkCards = [
        ...context.player1Object.getArenaCards(),
        ...context.player2Object.getArenaCards()
    ].filter((card) => canBenchmarkExhaustCard(card));

    if (scenario.mutatedCardLimit == null) {
        return benchmarkCards;
    }

    return benchmarkCards.slice(0, scenario.mutatedCardLimit);
}

function applyBenchmarkMutations(context, scenario: IBenchmarkScenario) {
    const benchmarkCards = getBenchmarkCards(context, scenario);

    for (const card of benchmarkCards) {
        card.exhausted = true;
    }
}

function expectBenchmarkStateReset(context, scenario: IBenchmarkScenario) {
    const benchmarkCards = getBenchmarkCards(context, scenario);

    for (const card of benchmarkCards) {
        expect(card.exhausted).toBe(false);
    }
}

function runScenarioBenchmark(contextRef, scenario: IBenchmarkScenario) {
    const { context } = contextRef;
    const snapshotManager = context.game.snapshotManager as unknown as IBenchmarkSnapshotManager;
    const stateManager = context.game.gameObjectManager as unknown as IBenchmarkStateManager;
    const snapshotFactory = snapshotManager.snapshotFactory;
    const deltaTracker = context.game.deltaTracker;
    const fullSnapshot = snapshotFactory.createRecoverySnapshot();
    const mutatedCards = getBenchmarkCards(context, scenario).length;

    expect(mutatedCards).toBeGreaterThan(0);

    let nextDeltaSnapshotId = (snapshotManager.currentSnapshotId ?? -1) + 1;
    let nextDeltaTimepointNumber = (snapshotManager.currentSnapshottedTimepointNumber ?? -1) + 1;

    const createDeltaMetadata = () => ({
        id: nextDeltaSnapshotId++,
        actionNumber: context.game.actionNumber,
        roundNumber: context.game.roundNumber,
        phase: context.game.currentPhase,
        timepoint: 'action',
        timepointNumber: nextDeltaTimepointNumber++,
        activePlayerId: context.game.actionPhaseActivePlayer?.id,
        requiresConfirmationToRollback: false,
        nextSnapshotIsSamePlayer: undefined
    });

    const resetToFullSnapshot = () => {
        deltaTracker.stopTracking();

        const rolledBack = stateManager.rollbackToSnapshot(fullSnapshot);
        expect(rolledBack).toBe(true);
        context.game.randomGenerator.restore(fullSnapshot.rngState);
        expectBenchmarkStateReset(context, scenario);
    };

    const clearSnapshotManagerState = () => {
        snapshotManager.clearAllSnapshots();
        deltaTracker.stopTracking();
    };

    const seedSnapshotManagerBoundaryState = () => {
        clearSnapshotManagerState();
        snapshotManager.moveToNextTimepoint(SnapshotTimepoint.StartOfPhase);
    };

    const ensureSnapshotAnchor = () => {
        if (snapshotManager.currentSnapshotId != null) {
            return;
        }

        snapshotManager.moveToNextTimepoint(SnapshotTimepoint.StartOfPhase);
        deltaTracker.stopTracking();
    };

    const phaseRollbackSettings = {
        type: SnapshotType.Phase as const,
        phaseName: PhaseName.Action,
        phaseOffset: 0,
    };

    expectBenchmarkStateReset(context, scenario);

    // Full snapshot anchor cost: serialize the current live game state into a materialized snapshot payload.
    const fullSnapshotBenchmark = measureBenchmark(scenario.snapshotIterations, () => {
        snapshotFactory.createRecoverySnapshot();
    });

    // Full rollback path: restore the entire game state from a materialized full snapshot.
    const fullRollbackBenchmark = measureBenchmark(scenario.rollbackIterations, () => {
        const rolledBack = stateManager.rollbackToSnapshot(fullSnapshot);
        expect(rolledBack).toBe(true);
        context.game.randomGenerator.restore(fullSnapshot.rngState);
    }, {
        beforeEachIteration: () => {
            applyBenchmarkMutations(context, scenario);
        },
        afterEachIteration: () => {
            expectBenchmarkStateReset(context, scenario);
        }
    });

    resetToFullSnapshot();

    const snapshotManagerFullBoundaryBenchmark = measureBenchmark(scenario.snapshotIterations, () => {
        snapshotManager.moveToNextTimepoint(SnapshotTimepoint.StartOfPhase);
    }, {
        beforeEachIteration: () => {
            clearSnapshotManagerState();
        },
        afterEachIteration: () => {
            clearSnapshotManagerState();
        }
    });

    const snapshotManagerDeltaBoundaryBenchmark = measureBenchmark(scenario.snapshotIterations, () => {
        snapshotManager.moveToNextTimepoint(SnapshotTimepoint.Action);
    }, {
        beforeEachIteration: () => {
            seedSnapshotManagerBoundaryState();
        },
        afterEachIteration: () => {
            clearSnapshotManagerState();
        }
    });

    const snapshotManagerRollbackBenchmark = measureBenchmark(scenario.rollbackIterations, () => {
        const result = snapshotManager.rollbackTo(phaseRollbackSettings);
        expect(result.success).toBe(true);
    }, {
        beforeEachIteration: () => {
            seedSnapshotManagerBoundaryState();
            snapshotManager.takeSnapshot({ type: SnapshotType.Phase, phaseName: PhaseName.Action });
            applyBenchmarkMutations(context, scenario);
        },
        afterEachIteration: () => {
            expectBenchmarkStateReset(context, scenario);
            clearSnapshotManagerState();
        }
    });

    resetToFullSnapshot();
    ensureSnapshotAnchor();

    // Steady-state delta baseline cost after an anchor exists.
    const deltaStartTrackingDiagnostic = measureBenchmark(scenario.snapshotIterations, () => {
        deltaTracker.startTracking();
        deltaTracker.stopTracking();
    }, {
        afterEachIteration: () => {
            resetToFullSnapshot();
        }
    });

    resetToFullSnapshot();

    // Steady-state delta finalize cost after representative field mutations have already been recorded.
    const deltaCheckpointDiagnostic = measureBenchmark(scenario.snapshotIterations, () => {
        deltaTracker.checkpoint(createDeltaMetadata());
    }, {
        beforeEachIteration: () => {
            deltaTracker.startTracking();
            applyBenchmarkMutations(context, scenario);
        },
        afterEachIteration: () => {
            resetToFullSnapshot();
        }
    });

    resetToFullSnapshot();

    // Delta write path: start tracking from the existing anchor, apply representative changes,
    // then finalize the delta payload. This is the write-side cost to compare against
    // the full anchor creation above, while the diagnostic rows below isolate the steady-state pieces.
    const deltaSnapshotBenchmark = measureBenchmark(scenario.snapshotIterations, () => {
        deltaTracker.startTracking();
        applyBenchmarkMutations(context, scenario);
        deltaTracker.checkpoint(createDeltaMetadata());
        deltaTracker.stopTracking();
    }, {
        afterEachIteration: () => {
            resetToFullSnapshot();
        }
    });

    let deltaSnapshot: IDeltaSnapshot;
    // Delta rollback path: restore the tracked field changes without materializing a full snapshot restore.
    const deltaRollbackBenchmark = measureBenchmark(scenario.rollbackIterations, () => {
        const rolledBack = stateManager.rollbackToDeltaChain([deltaSnapshot]);
        expect(rolledBack).toBe(true);
    }, {
        beforeEachIteration: () => {
            deltaTracker.startTracking();
            applyBenchmarkMutations(context, scenario);
            deltaSnapshot = deltaTracker.checkpoint(createDeltaMetadata());
            deltaTracker.stopTracking();
        },
        afterEachIteration: () => {
            expectBenchmarkStateReset(context, scenario);
        }
    });

    resetToFullSnapshot();

    // Serialized payload size is a separate question from timedHeapAvg.
    // Measure the actual bytes we would persist for a full snapshot versus a delta payload.
    const fullPayloadSnapshot = snapshotFactory.createRecoverySnapshot();

    deltaTracker.startTracking();
    applyBenchmarkMutations(context, scenario);
    const deltaPayloadSnapshot = deltaTracker.checkpoint(createDeltaMetadata());
    deltaTracker.stopTracking();

    const fullPayloadBytes = serializePayloadSize(fullPayloadSnapshot);
    const deltaPayloadBytes = serializePayloadSize(deltaPayloadSnapshot);

    resetToFullSnapshot();

    const rows = [
        formatBenchmarkResult(scenario.name, mutatedCards, 'full', 'createRecoverySnapshot', fullSnapshotBenchmark),
        formatBenchmarkResult(scenario.name, mutatedCards, 'full', 'rollbackToSnapshot', fullRollbackBenchmark),
        formatBenchmarkResult(scenario.name, mutatedCards, 'delta', 'startTrackingAndCheckpoint', deltaSnapshotBenchmark, {
            timeVsFull: summarizeRelativeDifference(deltaSnapshotBenchmark.avgMs, fullSnapshotBenchmark.avgMs, 'faster', 'slower'),
            timedHeapVsFull: summarizeRelativeDifference(deltaSnapshotBenchmark.avgBenchmarkHeapDeltaBytes, fullSnapshotBenchmark.avgBenchmarkHeapDeltaBytes, 'lower', 'higher')
        }),
        formatBenchmarkResult(scenario.name, mutatedCards, 'delta', 'rollbackToDeltaChain', deltaRollbackBenchmark, {
            timeVsFull: summarizeRelativeDifference(deltaRollbackBenchmark.avgMs, fullRollbackBenchmark.avgMs, 'faster', 'slower'),
            timedHeapVsFull: summarizeRelativeDifference(deltaRollbackBenchmark.avgBenchmarkHeapDeltaBytes, fullRollbackBenchmark.avgBenchmarkHeapDeltaBytes, 'lower', 'higher')
        })
    ];

    const diagnosticRows = [
        formatBenchmarkResult(scenario.name, mutatedCards, 'delta-diagnostics', 'startTrackingOnly', deltaStartTrackingDiagnostic),
        formatBenchmarkResult(scenario.name, mutatedCards, 'delta-diagnostics', 'checkpointOnly', deltaCheckpointDiagnostic)
    ];

    // const orchestrationRows = [
    //     formatBenchmarkResult(scenario.name, mutatedCards, 'snapshot-manager', 'moveToNextTimepoint(StartOfPhase)', snapshotManagerFullBoundaryBenchmark),
    //     formatBenchmarkResult(scenario.name, mutatedCards, 'snapshot-manager', 'moveToNextTimepoint(Action)', snapshotManagerDeltaBoundaryBenchmark),
    //     formatBenchmarkResult(scenario.name, mutatedCards, 'snapshot-manager', 'rollbackTo(Phase)', snapshotManagerRollbackBenchmark)
    // ];

    const payloadRows = [
        {
            scenario: scenario.name,
            mutatedCards,
            category: 'payload',
            benchmark: 'fullSnapshotPayload',
            serializedBytes: fullPayloadBytes,
            serializedSize: formatBytes(fullPayloadBytes),
            sizeVsFull: 'baseline'
        },
        {
            scenario: scenario.name,
            mutatedCards,
            category: 'payload',
            benchmark: 'deltaPayload',
            serializedBytes: deltaPayloadBytes,
            serializedSize: formatBytes(deltaPayloadBytes),
            sizeVsFull: formatPayloadComparison(deltaPayloadBytes, fullPayloadBytes)
        }
    ];

    console.log(' ');
    console.table(rows);
    // console.table(diagnosticRows);
    // console.table(orchestrationRows);
    console.table(payloadRows);
    logScenarioBenchmarkGuidance(
        scenario.name,
        fullSnapshotBenchmark,
        fullRollbackBenchmark,
        deltaSnapshotBenchmark,
        deltaRollbackBenchmark,
        deltaStartTrackingDiagnostic,
        deltaCheckpointDiagnostic
    );
    // logSnapshotManagerGuidance(
    //     scenario.name,
    //     snapshotManagerFullBoundaryBenchmark,
    //     snapshotManagerDeltaBoundaryBenchmark,
    //     snapshotManagerRollbackBenchmark
    // );

    return rows;
}

describe('Undo', function() {
    undoIntegration(function(contextRef) {
        for (const scenario of benchmarkScenarios) {
            describePerformance(`SnapshotBenchmarks ${scenario.name}`, function() {
                beforeEach(async function() {
                    await contextRef.setupTestAsync(scenario.setup);
                });

                it('logs separate timings for full and delta snapshot workflows', function() {
                    const results = runScenarioBenchmark(contextRef, scenario);

                    expect(results.length).toBe(4);
                });
            });
        }
    });
});
