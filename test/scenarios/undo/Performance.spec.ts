import { SnapshotType } from '../../../server/game/core/Constants';
import type { IGameSnapshot } from '../../../server/game/core/snapshot/SnapshotInterfaces';
import { SnapshotTimepoint } from '../../../server/game/core/snapshot/SnapshotInterfaces';
import type { IBenchmarkResult } from './benchmark/BenchmarkHarness';
import {
    forceGcIfAvailable,
    measureBenchmarkAsync,
    memoryDelta,
    sampleMemory,
    startGcRecording,
    stopGcRecording,
    toConsoleRow
} from './benchmark/BenchmarkHarness';
import type { IPayloadMeasurement } from './benchmark/BenchmarkReport';
import { BenchmarkReportWriter } from './benchmark/BenchmarkReport';
import type { IBenchmarkScenario } from './benchmark/BenchmarkScenarios';
import { benchmarkScenarios } from './benchmark/BenchmarkScenarios';
import v8 from 'node:v8';

/**
 * Snapshot / undo performance benchmarks — Stage 0 of the snapshot roadmap.
 * See `docs/plans/00-performance-benchmarks.md` for what these measure and why,
 * and `docs/plans/performance/` for the captured reports.
 *
 * Disabled by default (they take minutes and are noisy on a loaded machine).
 * Run them through the wrapper, which sets `--expose-gc`, `RUN_PERF_BENCHMARKS`,
 * and the report path for you:
 *
 *     node scripts/run-performance-benchmarks.js --name my-capture
 *
 * Benchmarks are tiered by how stable they are across the roadmap:
 *
 * - `manager/*`, `payload/*` and `sustained/*` are measured at the public
 *   `SnapshotManager` seam. Plans 1–6 must keep these comparable; they are the
 *   numbers that decide whether the roadmap was a net win. `payload/retainedChain`
 *   is memory pinned by a held snapshot chain — the term the roadmap most needs
 *   to shrink — and `sustained/*` is the only row that reports real GC activity.
 * - `full/*` measures the current full-snapshot implementation directly. Plans 3
 *   and 4 replace this machinery, so these rows are expected to change meaning
 *   or disappear.
 */

/** Snapshot factory internals the benchmark needs. `snapshotFactory` is `protected` on SnapshotManager. */
interface IBenchmarkSnapshotFactory {

    /** Private on SnapshotFactory; read directly so the benchmark measures the real object the engine built. */
    currentActionSnapshot: IGameSnapshot;
    createSnapshotForCurrentTimepoint(timepoint: SnapshotTimepoint): void;
}

interface IBenchmarkSnapshotManager {
    currentSnapshotId: number | null;
    snapshotFactory: IBenchmarkSnapshotFactory;
    clearAllSnapshots(): void;
    moveToNextTimepoint(timepoint: SnapshotTimepoint): void;
    rollbackTo(settings: { type: SnapshotType.Manual; playerId: string; snapshotId: number }): { success: boolean };
    setUndoConfirmationRequired(enabled: boolean): void;
    takeSnapshot(settings: { type: SnapshotType.Manual; playerId: string }): number;
}

/** GameStateManager surface. `Game.gameObjectManager` is narrowed to `IGameObjectRegistrar` in production. */
interface IBenchmarkStateManager {
    buildGameStateForSnapshot(): Buffer;
    rollbackToSnapshot(snapshot: IGameSnapshot, beforeRollbackSnapshot?: IGameSnapshot): boolean;
}

/**
 * How many snapshots to hold live when measuring retention. Matches the ~13 live
 * snapshot buffers a real game accumulates across the action/phase/quick containers.
 */
const RETAINED_SNAPSHOT_CHAIN_LENGTH = 13;

/**
 * Iterations for the sustained-load benchmark. The per-operation benchmarks force a GC
 * before their loop and run too few iterations to provoke natural collection, so they
 * report ~0 GC activity by construction. GC pressure only shows up under sustained churn,
 * which is what this count is for — keep it high enough that the heap actually cycles.
 */
const SUSTAINED_LOAD_ITERATIONS = 400;

const runPerformanceBenchmarks = process.env.RUN_PERF_BENCHMARKS === '1';
const describePerformance = runPerformanceBenchmarks ? describe : xdescribe;

function getSnapshotManager(context): IBenchmarkSnapshotManager {
    return context.game.snapshotManager as unknown as IBenchmarkSnapshotManager;
}

function getStateManager(context): IBenchmarkStateManager {
    return context.game.gameObjectManager as unknown as IBenchmarkStateManager;
}

/**
 * Rebuilds the current-timepoint snapshot and hands back the object the factory
 * actually produced, so payload sizes and rollback costs reflect real snapshots
 * rather than a benchmark-local reimplementation of the factory.
 */
function captureAnchorSnapshot(snapshotFactory: IBenchmarkSnapshotFactory): IGameSnapshot {
    snapshotFactory.createSnapshotForCurrentTimepoint(SnapshotTimepoint.Action);

    const snapshot = snapshotFactory.currentActionSnapshot;
    if (snapshot == null) {
        throw new Error(
            'SnapshotFactory.currentActionSnapshot was not populated. The benchmark reads this private field directly; ' +
            'if the factory was refactored, update captureAnchorSnapshot in Performance.spec.ts rather than skipping the benchmark.'
        );
    }

    return snapshot;
}

function countLiveGameObjects(snapshot: IGameSnapshot): number {
    return Object.keys(v8.deserialize(snapshot.states) as Record<string, unknown>).length;
}

function canBenchmarkExhaustCard(card): boolean {
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

function applyBenchmarkMutations(context, scenario: IBenchmarkScenario): void {
    for (const card of getBenchmarkCards(context, scenario)) {
        card.exhausted = true;
    }
}

function expectBenchmarkStateReset(context, scenario: IBenchmarkScenario): void {
    for (const card of getBenchmarkCards(context, scenario)) {
        expect(card.exhausted).toBe(false);
    }
}

async function runScenarioBenchmarkAsync(contextRef, scenario: IBenchmarkScenario, reportWriter: BenchmarkReportWriter) {
    const { context } = contextRef;
    const snapshotManager = getSnapshotManager(context);
    const stateManager = getStateManager(context);
    const snapshotFactory = snapshotManager.snapshotFactory;
    const playerId = context.player1Object.id;

    // The integration helper currently passes a non-existent `UndoMode.Full`, which leaves the
    // manager in an undefined mode. Pin it to Free so the benchmark measures the production
    // undo-enabled path rather than an accidental one.
    snapshotManager.setUndoConfirmationRequired(false);

    const anchorSnapshot = captureAnchorSnapshot(snapshotFactory);
    const liveGameObjects = countLiveGameObjects(anchorSnapshot);
    const mutatedCards = getBenchmarkCards(context, scenario).length;

    expect(mutatedCards).toBeGreaterThan(0);

    const restoreAnchor = () => {
        expect(stateManager.rollbackToSnapshot(anchorSnapshot)).toBe(true);
        context.game.randomGenerator.restore(anchorSnapshot.rngState);
    };

    expectBenchmarkStateReset(context, scenario);

    const results: IBenchmarkResult[] = [];

    // --- Write path -------------------------------------------------------

    // Public per-action path: what the engine runs at every action boundary, including
    // unused-GameObject cleanup. This is the headline write-side cost.
    results.push(await measureBenchmarkAsync('manager', 'moveToNextTimepoint(Action)', scenario.snapshotIterations, () => {
        snapshotManager.moveToNextTimepoint(SnapshotTimepoint.Action);
    }, {
        afterEachIteration: () => {
            snapshotManager.clearAllSnapshots();
        }
    }));

    // Full-snapshot anchor cost in isolation: serialize live game state into a restorable payload.
    results.push(await measureBenchmarkAsync('full', 'createSnapshotForCurrentTimepoint', scenario.snapshotIterations, () => {
        snapshotFactory.createSnapshotForCurrentTimepoint(SnapshotTimepoint.Action);
    }));

    // Diagnostic breakdown: the GameObject-state serialization term of the anchor cost.
    results.push(await measureBenchmarkAsync('full', 'buildGameStateForSnapshot', scenario.snapshotIterations, () => {
        stateManager.buildGameStateForSnapshot();
    }));

    // --- Restore path -----------------------------------------------------

    // Raw restore: deserialize a full snapshot back over every live GameObject.
    results.push(await measureBenchmarkAsync('full', 'rollbackToSnapshot', scenario.rollbackIterations, () => {
        expect(stateManager.rollbackToSnapshot(anchorSnapshot)).toBe(true);
        context.game.randomGenerator.restore(anchorSnapshot.rngState);
    }, {
        beforeEachIteration: () => {
            applyBenchmarkMutations(context, scenario);
        },
        afterEachIteration: () => {
            expectBenchmarkStateReset(context, scenario);
        }
    }));

    restoreAnchor();
    snapshotManager.clearAllSnapshots();

    // Public undo path end to end, including snapshot-container bookkeeping and
    // clearing newer snapshots. Seeding happens outside the timer.
    let seededSnapshotId = -1;
    results.push(await measureBenchmarkAsync('manager', 'rollbackTo(Manual)', scenario.rollbackIterations, () => {
        expect(snapshotManager.rollbackTo({ type: SnapshotType.Manual, playerId, snapshotId: seededSnapshotId }).success).toBe(true);
    }, {
        beforeEachIteration: () => {
            snapshotManager.clearAllSnapshots();
            snapshotManager.moveToNextTimepoint(SnapshotTimepoint.Action);
            seededSnapshotId = snapshotManager.takeSnapshot({ type: SnapshotType.Manual, playerId });
            applyBenchmarkMutations(context, scenario);
        },
        afterEachIteration: () => {
            expectBenchmarkStateReset(context, scenario);
            snapshotManager.clearAllSnapshots();
        }
    }));

    restoreAnchor();
    snapshotManager.clearAllSnapshots();

    // --- Sustained load ---------------------------------------------------

    // A realistic take-snapshot / act / undo cycle repeated long enough for the heap to
    // actually cycle. Nothing is retained, so everything allocated here becomes garbage:
    // this is the benchmark that reports meaningful GC counts and pause time. The
    // per-operation benchmarks above deliberately start from a forced GC and cannot.
    results.push(await measureBenchmarkAsync('sustained', 'snapshotAndUndoCycle', SUSTAINED_LOAD_ITERATIONS, () => {
        snapshotFactory.createSnapshotForCurrentTimepoint(SnapshotTimepoint.Action);
        applyBenchmarkMutations(context, scenario);
        stateManager.rollbackToSnapshot(anchorSnapshot);
        context.game.randomGenerator.restore(anchorSnapshot.rngState);
    }));

    restoreAnchor();
    expectBenchmarkStateReset(context, scenario);
    snapshotManager.clearAllSnapshots();

    // --- Payload size -----------------------------------------------------

    const payloadSnapshot = captureAnchorSnapshot(snapshotFactory);
    const gameStateBytes = payloadSnapshot.gameState.byteLength;
    const gameObjectStateBytes = payloadSnapshot.states.byteLength;
    const totalPayloadBytes = gameStateBytes + gameObjectStateBytes;

    const payloads: IPayloadMeasurement[] = [
        {
            scenario: scenario.name,
            category: 'payload',
            benchmark: 'fullSnapshotTotal',
            serializedBytes: totalPayloadBytes,
            notes: { bytesPerGameObject: Math.round(totalPayloadBytes / liveGameObjects) }
        },
        { scenario: scenario.name, category: 'payload', benchmark: 'gameStateBuffer', serializedBytes: gameStateBytes },
        { scenario: scenario.name, category: 'payload', benchmark: 'gameObjectStatesBuffer', serializedBytes: gameObjectStateBytes }
    ];

    // --- Retention --------------------------------------------------------

    // Memory still pinned after holding a realistic chain of snapshots. Snapshot cost today is
    // O(live objects x retained snapshots), so this is the term the roadmap most needs to shrink.
    snapshotManager.clearAllSnapshots();
    forceGcIfAvailable();
    const beforeChain = sampleMemory();

    for (let index = 0; index < RETAINED_SNAPSHOT_CHAIN_LENGTH; index++) {
        snapshotManager.moveToNextTimepoint(SnapshotTimepoint.Action);
        snapshotManager.takeSnapshot({ type: SnapshotType.Manual, playerId });
    }

    forceGcIfAvailable();
    const chainRetention = memoryDelta(beforeChain, sampleMemory());

    payloads.push({
        scenario: scenario.name,
        category: 'payload',
        benchmark: `retainedChain(${RETAINED_SNAPSHOT_CHAIN_LENGTH} snapshots)`,
        serializedBytes: chainRetention.totalBytes,
        notes: {
            heapUsedBytes: chainRetention.heapUsedBytes,
            externalBytes: chainRetention.externalBytes,
            bytesPerSnapshot: Math.round(chainRetention.totalBytes / RETAINED_SNAPSHOT_CHAIN_LENGTH)
        }
    });

    snapshotManager.clearAllSnapshots();
    restoreAnchor();

    reportWriter.addScenario({ scenario: scenario.name, mutatedCards, liveGameObjects, results, payloads });

    console.log(' ');
    console.log(`Scenario ${scenario.name}: ${liveGameObjects} live GameObjects, ${mutatedCards} mutated cards per iteration`);
    console.table(results.map((result) => toConsoleRow(scenario.name, result)));
    console.table(payloads);

    return results;
}

describe('Undo', function() {
    undoIntegration(function(contextRef) {
        describePerformance('SnapshotBenchmarks', function() {
            let reportWriter: BenchmarkReportWriter;

            beforeAll(function() {
                reportWriter = new BenchmarkReportWriter();
                startGcRecording();

                if (typeof global.gc !== 'function') {
                    throw new Error(
                        'The performance benchmarks require node to run with --expose-gc so retained-memory numbers are meaningful. ' +
                        'Run them via "node scripts/run-performance-benchmarks.js".'
                    );
                }
            });

            afterAll(function() {
                stopGcRecording();
                reportWriter?.write();
                console.log(`Benchmark report written to ${reportWriter?.path}`);
            });

            for (const scenario of benchmarkScenarios) {
                describe(scenario.name, function() {
                    beforeEach(async function() {
                        await contextRef.setupTestAsync(scenario.setup);
                    });

                    it('captures snapshot and rollback speed, memory, and GC pressure', async function() {
                        const results = await runScenarioBenchmarkAsync(contextRef, scenario, reportWriter);

                        expect(results.length).toBe(6);
                    });
                });
            }
        });

        // Manual profiling aid, not part of the benchmark suite. Intended to be used with the node
        // debugger and a chrome console to inspect detached ongoing effect state.
        xdescribe('Detached ongoing effect state', function() {
            undoIt(' - Republic attack pod should cost 1 less if there is 3 friendly units', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['republic-attack-pod'],
                        groundArena: ['fleet-lieutenant', 'battlefield-marine', 'pyke-sentinel'],
                        leader: 'fennec-shand#honoring-the-deal',
                        resources: 6
                    },
                    player2: {
                        hand: ['waylay'],
                        groundArena: ['greedo#slow-on-the-draw', 'rey#keeping-the-past'],
                    }
                });

                debugger;
                const { context } = contextRef;

                const reset = () => {
                    context.player2.clickCard(context.waylay);
                    context.player2.clickCard(context.republicAttackPod);
                    context.player1.readyResources(6);
                };

                // case 1: costs 5 to deploy when 3 units out
                context.player1.clickCard(context.republicAttackPod);
                expect(context.player1.exhaustedResourceCount).toBe(5);

                reset();

                // case 2: costs 6 to deploy when less than 3 units out (3 units present across board)
                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.greedo);
                context.player2.passAction();
                context.player2.passAction();
                context.player1.clickCard(context.republicAttackPod);
                expect(context.player1.exhaustedResourceCount).toBe(6);
                debugger;
            });
        });
    });
});
