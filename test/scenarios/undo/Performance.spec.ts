import { SnapshotType, TokenUnitName, ZoneName } from '../../../server/game/core/Constants';
import type { DeltaTracker, IDeltaTrackerAnchor, IDeltaTrackerWindow } from '../../../server/game/core/snapshot/DeltaTracker';
import { GameStateManager } from '../../../server/game/core/snapshot/GameStateManager';
import type { DeltaSnapshotIndex } from '../../../server/game/core/snapshot/container/DeltaSnapshotIndex';
import type { IQuickEntrySummary } from '../../../server/game/core/snapshot/container/DeltaSnapshotContainer';
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
import { isDeepStrictEqual } from 'node:util';
import type { SerializedStateRecord } from '../../../server/game/core/StateEncoding';

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

    /**
     * Private on SnapshotFactory. Since P4-F an Action snapshot is usually hollow (no records), so this is read only for the
     * `hollow` flag, ids and timepoint numbers; record content comes from `materializeCurrentSnapshot`.
     */
    currentActionSnapshot: IGameSnapshot;
    createSnapshotForCurrentTimepoint(timepoint: SnapshotTimepoint): void;
}

type IBenchmarkRollbackSettings = { type: SnapshotType.Manual; playerId: string; snapshotId: number } | { type: SnapshotType.Action; playerId: string; actionOffset?: number };

interface IBenchmarkSnapshotManager {
    currentSnapshotId: number | null;
    deltaSnapshotIndex: DeltaSnapshotIndex;
    snapshotFactory: IBenchmarkSnapshotFactory;
    clearAllSnapshots(): void;
    materializeCurrentSnapshot(): IGameSnapshot;
    moveToNextTimepoint(timepoint: SnapshotTimepoint): void;
    rollbackTo(settings: IBenchmarkRollbackSettings): { success: boolean };
    setUndoConfirmationRequired(enabled: boolean): void;
    takeSnapshot(settings: { type: SnapshotType.Manual | SnapshotType.Action; playerId: string }): number;
}

/** Protected containers the P4-G diagnostic rows read (typed cast, as DeltaChain.spec.ts does). */
interface IBenchmarkManagerInternals {
    actionSnapshots: { getAllSnapshots(): IGameSnapshot[] };
    quickSnapshots: Map<string, { getEntrySummaries(): readonly IQuickEntrySummary[] }>;
}

/** GameStateManager surface. `Game.gameObjectManager` is narrowed to `IGameObjectRegistrar` in production. */
interface IBenchmarkStateManager {
    buildGameStateForSnapshot(): Record<string, SerializedStateRecord>;
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
 * A raw restore with the delta tracker stopped, as `SnapshotManager.rollbackToInternal` runs every production
 * restore: the generated deserializers write every field through the hooked setters, and recording each one's
 * old value is a cost production rollbacks never pay. The tracker restarts at the restored snapshot, as it does
 * after a production rollback. Used by the two timed raw restores so their rows keep measuring the restore.
 */
function restoreUntracked(context, snapshot: IGameSnapshot): boolean {
    const deltaTracker = context.game.deltaTracker;
    deltaTracker.stopTracking();
    try {
        return getStateManager(context).rollbackToSnapshot(snapshot);
    } finally {
        deltaTracker.startTracking({ snapshotId: snapshot.id, rngState: snapshot.rngState, lastGameObjectId: snapshot.lastGameObjectId });
    }
}

/**
 * Rebuilds the current-timepoint snapshot and hands back a full snapshot of it, so payload sizes and rollback costs reflect real
 * snapshots rather than a benchmark-local reimplementation of the factory. Since P4-F the factory's current Action snapshot is
 * usually hollow (no records) and cannot be restored on its own, so the anchor is its materialization: the same records the old
 * full current snapshot held (the checkpoint just opened an empty window, so the copy equals live state), or the snapshot itself
 * when it is already full. Materializing consumes no id and touches no window or index.
 */
function captureAnchorSnapshot(snapshotManager: IBenchmarkSnapshotManager): IGameSnapshot {
    const snapshotFactory = snapshotManager.snapshotFactory;
    snapshotFactory.createSnapshotForCurrentTimepoint(SnapshotTimepoint.Action);

    if (snapshotFactory.currentActionSnapshot == null) {
        throw new Error(
            'SnapshotFactory.currentActionSnapshot was not populated. The benchmark reads this private field directly; ' +
            'if the factory was refactored, update captureAnchorSnapshot in Performance.spec.ts rather than skipping the benchmark.'
        );
    }

    return snapshotManager.materializeCurrentSnapshot();
}

function countLiveGameObjects(snapshot: IGameSnapshot): number {
    return Object.keys(snapshot.states).length;
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

/**
 * Flips the exhausted flag of exactly the cards `getBenchmarkCards` selects, so every call is a real write sized by the
 * scenario's `mutatedCardLimit`, never a same-value write. Used by the two memoization rows, which need a write between
 * consecutive snapshots that a realistic game would also have.
 */
function toggleBenchmarkMutations(context, scenario: IBenchmarkScenario): void {
    for (const card of getBenchmarkCards(context, scenario)) {
        card.exhausted = !card.exhausted;
    }
}

interface IRecordReuse {
    fresh: number;
    reused: number;
}

/**
 * How many of `next`'s records are the very same object as `previous`'s record for that uuid (reused by reference) and how
 * many are not (serialized fresh). Pure reference comparison on the two `states` maps, so it needs no hook into the engine and
 * reads zero reuse, rather than throwing, on a commit that has no memoization. Never assert on it: P4-D runs this spec at the
 * pre-memo commit as its same-runtime reference, where zero is the correct reading. A hollow `next` (every Action snapshot since
 * P4-F) holds no records, so it reads zero and zero here; the callers report "not measured" for those instead of that zero.
 */
function countRecordReuse(previous: IGameSnapshot | null, next: IGameSnapshot): IRecordReuse {
    if (next.hollow) {
        return { reused: 0, fresh: 0 };
    }

    let reused = 0;
    let total = 0;
    for (const uuid of Object.keys(next.states)) {
        total++;
        if (previous != null && previous !== next && previous.states[uuid] === next.states[uuid]) {
            reused++;
        }
    }

    return { reused, fresh: total - reused };
}

const HOLLOW_REUSE_NOTE = 'not measured: Action snapshots are hollow since P4-F';

function averageRecordReuse(samples: IRecordReuse[]): { avgFresh: number; avgReused: number } {
    const count = Math.max(samples.length, 1);
    return {
        avgReused: Math.round(samples.reduce((sum, sample) => sum + sample.reused, 0) / count),
        avgFresh: Math.round(samples.reduce((sum, sample) => sum + sample.fresh, 0) / count)
    };
}

function expectBenchmarkStateReset(context, scenario: IBenchmarkScenario): void {
    for (const card of getBenchmarkCards(context, scenario)) {
        expect(card.exhausted).toBe(false);
    }
}

// --- P4-G delta diagnostics ----------------------------------------------------------------------------------------------------
// Ten new rows (six timings, four payload-shaped entries) appended after the original rows by one helper. They are diagnostic: never
// asserted on except for their own setup invariants (the stored chain length and the one delta restore of the two rollback rows),
// and each group ends with the board restored to the anchor and every snapshot cleared, so it cannot change what a later group sees.
// Counts in notes are strings because the markdown renderer prints numeric notes as byte sizes. Their meaning is in
// docs/plans/04-delta-snapshots.md, "As landed in P4-G".

interface IDeltaDiagnostics {
    payloads: IPayloadMeasurement[];
    results: (IBenchmarkResult & { notes?: Record<string, number | string> })[];
}

const DELTA_STREAK_ACTIONS = 20;

function anchorOf(snapshot: IGameSnapshot): IDeltaTrackerAnchor {
    return { snapshotId: snapshot.id, rngState: snapshot.rngState, lastGameObjectId: snapshot.lastGameObjectId };
}

function windowFieldCount(window: IDeltaTrackerWindow): number {
    let count = 0;
    for (const fields of window.changedFields.values()) {
        count += Object.keys(fields).length;
    }

    return count;
}

function windowBytes(window: IDeltaTrackerWindow): number {
    return v8.serialize(window.changedFields).byteLength;
}

/** The recorded value with the largest serialized size, as "field (bytes)". The collection-copy caveat: a whole collection is stored per write. */
function largestRecordedValue(window: IDeltaTrackerWindow): string {
    let label = 'none';
    let largest = -1;
    for (const fields of window.changedFields.values()) {
        for (const [name, value] of Object.entries(fields)) {
            const bytes = v8.serialize(value).byteLength;
            if (bytes > largest) {
                largest = bytes;
                label = name;
            }
        }
    }

    return `${label} (${largest} bytes)`;
}

function describeWindow(window: IDeltaTrackerWindow): string {
    return `bytes=${windowBytes(window)}, objects=${window.changedFields.size}, fields=${windowFieldCount(window)}, createdObjects=${window.createdObjectUuids.size}, largestValue=${largestRecordedValue(window)}`;
}

/** Counts delta chain restores while `body` runs; installed around the whole measured loop, not inside the timed function. */
async function countDeltaRestoresAsync<T>(counter: { restores: number }, body: () => Promise<T>): Promise<T> {
    const original = GameStateManager.prototype.rollbackToDeltaChain;
    GameStateManager.prototype.rollbackToDeltaChain = function(this: GameStateManager, ...args: Parameters<typeof original>) {
        counter.restores++;
        return original.apply(this, args);
    };
    try {
        return await body();
    } finally {
        GameStateManager.prototype.rollbackToDeltaChain = original;
    }
}

async function measureDeltaDiagnosticsAsync(
    context,
    scenario: IBenchmarkScenario,
    anchorSnapshot: IGameSnapshot,
    anchorContentNote: string,
    restoreAnchor: () => void
): Promise<IDeltaDiagnostics> {
    const snapshotManager = getSnapshotManager(context);
    const snapshotFactory = snapshotManager.snapshotFactory;
    const managerInternals = snapshotManager as unknown as IBenchmarkManagerInternals;
    const tracker = context.game.deltaTracker as DeltaTracker;
    const index = snapshotManager.deltaSnapshotIndex;
    const player1Id: string = context.player1Object.id;
    const player2Id: string = context.player2Object.id;
    const anchor = anchorOf(anchorSnapshot);
    const nextAnchor: IDeltaTrackerAnchor = { ...anchor, snapshotId: anchor.snapshotId + 1 };
    const results: IDeltaDiagnostics['results'] = [];
    const payloads: IPayloadMeasurement[] = [];

    /** A clean board and an empty tracking window at the anchor (a raw restore the way production runs one). */
    const resetToAnchor = () => {
        restoreUntracked(context, anchorSnapshot);
        context.game.randomGenerator.restore(anchorSnapshot.rngState);
    };
    const finishGroup = () => {
        restoreAnchor();
        snapshotManager.clearAllSnapshots();
    };
    const takeActionSnapshot = (playerId: string) => {
        snapshotManager.moveToNextTimepoint(SnapshotTimepoint.Action);
        snapshotManager.takeSnapshot({ type: SnapshotType.Action, playerId });
    };

    // --- Tracker timings ------------------------------------------------------------------------------------------------------

    results.push(await measureBenchmarkAsync('full', 'deltaTracker.startTracking', scenario.snapshotIterations, () => {
        tracker.startTracking(anchor);
    }, {
        beforeEachIteration: () => tracker.discardWindow(),
        afterEachIteration: () => tracker.discardWindow()
    }));
    finishGroup();

    let closedWindow: IDeltaTrackerWindow | null = null;
    let closedWindowFields = 0;
    const checkpointResult: IDeltaDiagnostics['results'][number] = await measureBenchmarkAsync('full', 'deltaTracker.checkpoint', scenario.snapshotIterations, () => {
        closedWindow = tracker.checkpoint(nextAnchor);
    }, {
        beforeEachIteration: () => {
            resetToAnchor();
            applyBenchmarkMutations(context, scenario);
        },
        afterEachIteration: () => {
            closedWindowFields = windowFieldCount(closedWindow);
        }
    });
    checkpointResult.notes = { changedFields: String(closedWindowFields), measurement: 'closes a window holding the scenario mutations; the tracker checkpoint is O(1), the window is handed over, not copied' };
    results.push(checkpointResult);
    finishGroup();

    results.push(await measureBenchmarkAsync('full', 'deltaTracker.mutations(capturing)', scenario.snapshotIterations, () => {
        applyBenchmarkMutations(context, scenario);
    }, {
        beforeEachIteration: () => resetToAnchor()
    }));
    finishGroup();

    results.push(await measureBenchmarkAsync('full', 'deltaTracker.mutations(stopped)', scenario.snapshotIterations, () => {
        applyBenchmarkMutations(context, scenario);
    }, {
        beforeEachIteration: () => {
            resetToAnchor();
            tracker.stopTracking();
        }
    }));
    finishGroup();

    // --- Delta rollbacks through the manager ----------------------------------------------------------------------------------
    // Setup per iteration (untimed): snapshot 0 is the full first snapshot of a tracking run (player 2), snapshot 1 the hollow target
    // (player 1), then `extraWindows` more Action snapshots with toggled writes between them, then a final write left pending. The
    // stored chain length equals `extraWindows`, and each rollback is exactly one delta restore.

    const measureRollbackRow = async (benchmark: string, extraWindows: number, actionOffset: number) => {
        const counter = { restores: 0 };
        let target: IGameSnapshot | null = null;
        const result: IDeltaDiagnostics['results'][number] = await countDeltaRestoresAsync(counter, () => measureBenchmarkAsync('full', benchmark, scenario.rollbackIterations, () => {
            expect(snapshotManager.rollbackTo({ type: SnapshotType.Action, playerId: player1Id, actionOffset }).success).toBe(true);
        }, {
            beforeEachIteration: () => {
                resetToAnchor();
                snapshotManager.clearAllSnapshots();
                takeActionSnapshot(player2Id);
                takeActionSnapshot(player1Id);
                target = snapshotFactory.currentActionSnapshot;
                expect(target.hollow).toBe(true);
                for (let windowIndex = 0; windowIndex < extraWindows; windowIndex++) {
                    toggleBenchmarkMutations(context, scenario);
                    takeActionSnapshot(windowIndex % 2 === 0 ? player2Id : player1Id);
                }
                toggleBenchmarkMutations(context, scenario);
                expect(index.buildChain(target.id, target.timepointNumber).length).toBe(extraWindows);
                counter.restores = 0;
            },
            afterEachIteration: () => {
                expect(counter.restores).toBe(1);
                expect(snapshotManager.currentSnapshotId).toBe(target.id);
            }
        }));
        result.notes = {
            storedChainLength: String(extraWindows),
            deltaRestoresPerRollback: '1',
            measurement: 'SnapshotManager.rollbackTo(Action) to a hollow target: pre-pass, chain build, delta restore, window bookkeeping'
        };
        results.push(result);
        finishGroup();
    };

    await measureRollbackRow('rollbackTo(Action, pendingWindowOnly)', 0, 0);
    await measureRollbackRow('rollbackTo(Action, deltaChain(3))', 3, -1);

    // --- Window size ----------------------------------------------------------------------------------------------------------

    const closeWindow = (mutate: () => void): IDeltaTrackerWindow => {
        resetToAnchor();
        mutate();
        return tracker.checkpoint(nextAnchor);
    };

    const scenarioWindow = closeWindow(() => applyBenchmarkMutations(context, scenario));
    const scenarioBytes = windowBytes(scenarioWindow);
    const scenarioFields = windowFieldCount(scenarioWindow);
    payloads.push({
        scenario: scenario.name,
        category: 'payload',
        benchmark: 'deltaWindowBytes',
        serializedBytes: scenarioBytes,
        notes: {
            tier: 'diagnostic, added at P4-G',
            measurement: 'v8.serialize of the closed window\'s changedFields after the scenario mutation model (the same writes the timing rows make); not stored bytes',
            changedObjects: String(scenarioWindow.changedFields.size),
            changedFields: String(scenarioFields),
            bytesPerChangedField: String(scenarioFields === 0 ? 0 : Math.round(scenarioBytes / scenarioFields)),
            anchorContent: anchorContentNote
        }
    });

    const handCard = context.player1Object.hand.find((card) => card.internalName === 'battlefield-marine');
    const probes: { name: string; run: () => void; unavailable?: string }[] = [
        {
            name: 'deckDraw',
            run: () => context.player1Object.drawCardsToHand(1),
            unavailable: context.player1Object.drawDeck.length > 0 ? undefined : 'player 1 has an empty deck in this scenario'
        },
        {
            name: 'generateToken',
            run: () => context.game.generateToken(context.player1Object, TokenUnitName.BattleDroid)
        },
        {
            name: 'handToArena',
            run: () => handCard.moveTo(ZoneName.GroundArena),
            unavailable: handCard == null ? 'no battlefield-marine in player 1\'s hand in this scenario' : undefined
        }
    ];
    const distributionNotes: Record<string, string> = {
        tier: 'diagnostic, added at P4-G',
        measurement: 'closed-window size per mutator, v8.serialize of changedFields (not stored bytes); largestValue is the biggest single recorded value (a whole collection is copied per write)',
        scenarioMutations: describeWindow(scenarioWindow)
    };
    for (const probe of probes) {
        if (probe.unavailable) {
            distributionNotes[probe.name] = `n/a: ${probe.unavailable}`;
            continue;
        }

        try {
            distributionNotes[probe.name] = describeWindow(closeWindow(probe.run));
        } catch (error) {
            distributionNotes[probe.name] = `n/a: mutator failed in this scenario (${(error as Error).message})`;
        }
    }
    payloads.push({
        scenario: scenario.name,
        category: 'payload',
        benchmark: 'deltaSizeDistribution',
        serializedBytes: scenarioBytes,
        notes: distributionNotes
    });
    finishGroup();

    // --- Retained real Action snapshots ---------------------------------------------------------------------------------------
    // Memory pinned by Action snapshots taken the way the engine takes them (hollow history entries and quick delta entries, with
    // the index), alternating players with a real write before each one.

    snapshotManager.clearAllSnapshots();
    forceGcIfAvailable();
    const beforeActionChain = sampleMemory();
    for (let step = 0; step < RETAINED_SNAPSHOT_CHAIN_LENGTH; step++) {
        toggleBenchmarkMutations(context, scenario);
        takeActionSnapshot(step % 2 === 0 ? player1Id : player2Id);
    }
    forceGcIfAvailable();
    const actionChainRetention = memoryDelta(beforeActionChain, sampleMemory());
    const liveHistorySnapshots = managerInternals.actionSnapshots.getAllSnapshots().length;
    let liveDeltaEntries = 0;
    for (const container of managerInternals.quickSnapshots.values()) {
        liveDeltaEntries += container.getEntrySummaries().filter((entry) => entry.type === 'delta' && entry.live).length;
    }
    payloads.push({
        scenario: scenario.name,
        category: 'payload',
        benchmark: `retainedActionChain(${RETAINED_SNAPSHOT_CHAIN_LENGTH} snapshots)`,
        serializedBytes: actionChainRetention.totalBytes,
        notes: {
            tier: 'diagnostic, added at P4-G',
            heapUsedBytes: actionChainRetention.heapUsedBytes,
            externalBytes: actionChainRetention.externalBytes,
            bytesPerSnapshot: Math.round(actionChainRetention.totalBytes / RETAINED_SNAPSHOT_CHAIN_LENGTH),
            measurement: `bytesPerSnapshot divides by the ${RETAINED_SNAPSHOT_CHAIN_LENGTH} snapshots taken; the engine's caps (3 history snapshots and 3 delta entries per player) leave at most about 6 live, and the live counts below are what is actually pinned`,
            liveHistorySnapshots: String(liveHistorySnapshots),
            liveDeltaEntries: String(liveDeltaEntries),
            deltaIndexSize: String(index.size),
            evictedThroughId: String(index.evictedThroughId)
        }
    });
    finishGroup();

    // --- Index growth over a one-player streak --------------------------------------------------------------------------------

    const liveDeltaOf = (playerId: string): string => {
        const summaries = managerInternals.quickSnapshots.get(playerId)?.getEntrySummaries() ?? [];
        const oldest = summaries.find((entry) => entry.type === 'delta' && entry.live);
        return oldest == null ? 'none' : String(oldest.snapshotId);
    };
    const readIndex = (actions: number): string => {
        let retainedDeltaBytes = 0;
        for (const id of index.getIds()) {
            retainedDeltaBytes += v8.serialize(index.get(id).changedFields).byteLength;
        }
        return `after ${actions} actions: indexSize=${index.size}, evictedThroughId=${index.evictedThroughId}, player1OldestLiveDelta=${liveDeltaOf(player1Id)}, player2OldestLiveDelta=${liveDeltaOf(player2Id)}, retainedDeltaBytes=${retainedDeltaBytes}`;
    };
    const retainedDeltaBytesOf = (reading: string): number => Number((/retainedDeltaBytes=(\d+)/).exec(reading)[1]);
    const runStreak = (alternate: boolean) => {
        resetToAnchor();
        snapshotManager.clearAllSnapshots();
        // Two snapshots, the second a non-first one of the tracking run taken for player 2, so player 2's container holds a live
        // delta entry: clearAllSnapshots released every payload, and without this the horizon would be set by player 1 alone.
        snapshotManager.moveToNextTimepoint(SnapshotTimepoint.Action);
        takeActionSnapshot(player2Id);
        const player2DeltaId = snapshotManager.currentSnapshotId;
        const readings: Record<string, string> = { start: `player 2 live delta entry ${liveDeltaOf(player2Id)} (snapshot ${player2DeltaId})` };
        for (let action = 1; action <= DELTA_STREAK_ACTIONS; action++) {
            toggleBenchmarkMutations(context, scenario);
            takeActionSnapshot(alternate && action % 2 === 0 ? player2Id : player1Id);
            if (action === 5 || action === 10 || action === DELTA_STREAK_ACTIONS) {
                readings[`after${action}`] = readIndex(action);
            }
        }
        finishGroup();
        return readings;
    };
    const streak = runStreak(false);
    const alternating = runStreak(true);
    payloads.push({
        scenario: scenario.name,
        category: 'payload',
        benchmark: `deltaIndexStreak(${DELTA_STREAK_ACTIONS} actions)`,
        serializedBytes: retainedDeltaBytesOf(streak[`after${DELTA_STREAK_ACTIONS}`]),
        notes: {
            tier: 'diagnostic, added at P4-G',
            measurement: 'serializedBytes is the retained delta bytes (v8.serialize of every indexed delta\'s changedFields) after the player 1 streak; a streak is consecutive Action snapshots by player 1 with player 2\'s container left untouched, the control alternates players from the same start',
            streakStart: streak.start,
            streakAfter5: streak.after5,
            streakAfter10: streak.after10,
            streakAfter20: streak.after20,
            alternatingStart: alternating.start,
            alternatingAfter5: alternating.after5,
            alternatingAfter10: alternating.after10,
            alternatingAfter20: alternating.after20
        }
    });

    return { results, payloads };
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

    const anchorSnapshot = captureAnchorSnapshot(snapshotManager);
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
        expect(restoreUntracked(context, anchorSnapshot)).toBe(true);
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
        restoreUntracked(context, anchorSnapshot);
        context.game.randomGenerator.restore(anchorSnapshot.rngState);
    }));

    restoreAnchor();
    expectBenchmarkStateReset(context, scenario);
    snapshotManager.clearAllSnapshots();

    // --- Memoized write path ----------------------------------------------

    // Diagnostic row for P4-D (docs/plans/IMPLEMENTATION-ORDER.md, "P4-Cb"): the per-action build with a previous snapshot to
    // memoize against and a real write between builds. `manager/moveToNextTimepoint(Action)` above clears every snapshot after each
    // iteration so it never has a memo; this row does not, so each build's memo is the previous iteration's snapshot. One Action
    // snapshot is taken untimed first so the first timed build already has a memo. Reuse is counted outside the timer and reported
    // as notes, never asserted: at the pre-memo commit it reads zero.
    snapshotManager.moveToNextTimepoint(SnapshotTimepoint.Action);
    const memoizedBuildReuse: IRecordReuse[] = [];
    let memoizedPreviousSnapshot: IGameSnapshot | null = null;
    let memoizedBuildsHollow = false;
    const memoizedResult: IBenchmarkResult & { notes?: Record<string, number | string> } = await measureBenchmarkAsync(
        'full', 'moveToNextTimepoint(Action, memoized)', scenario.snapshotIterations, () => {
            snapshotManager.moveToNextTimepoint(SnapshotTimepoint.Action);
        }, {
            beforeEachIteration: () => {
                toggleBenchmarkMutations(context, scenario);
                memoizedPreviousSnapshot = snapshotFactory.currentActionSnapshot;
            },
            afterEachIteration: () => {
                memoizedBuildReuse.push(countRecordReuse(memoizedPreviousSnapshot, snapshotFactory.currentActionSnapshot));
                memoizedBuildsHollow = memoizedBuildsHollow || snapshotFactory.currentActionSnapshot.hollow === true;
            }
        }
    );
    // The warm-up iterations also ran the hooks above; only the timed iterations are the row's builds.
    const memoizedReuse = averageRecordReuse(memoizedBuildReuse.slice(-scenario.snapshotIterations));
    memoizedResult.notes = {
        avgReusedRecordsPerBuild: memoizedBuildsHollow ? HOLLOW_REUSE_NOTE : memoizedReuse.avgReused,
        avgFreshRecordsPerBuild: memoizedBuildsHollow ? HOLLOW_REUSE_NOTE : memoizedReuse.avgFresh,
        measurement: 'record counts per build, not bytes: reused = same object as the previous snapshot\'s record for that uuid, fresh = serialized by this build'
    };
    results.push(memoizedResult);

    restoreAnchor();
    expectBenchmarkStateReset(context, scenario);
    snapshotManager.clearAllSnapshots();

    // --- Payload size -----------------------------------------------------

    const payloadSnapshot = captureAnchorSnapshot(snapshotManager);

    // Anchor content proof (P4-G re-anchor): live state equals the anchor here (restoreAnchor ran above), and this snapshot is a full
    // first snapshot of a new tracking run, so its records are what the old full current snapshot held. The anchor, a
    // materialization, must hold exactly the same records. Untimed; a difference is a re-anchor defect.
    expect(isDeepStrictEqual(anchorSnapshot.states, payloadSnapshot.states)).toBe(true);
    const anchorContentNote = `anchorSnapshot.states equals payloadSnapshot.states; v8.serialize bytes: anchor ${v8.serialize(anchorSnapshot.states).byteLength}, payload ${v8.serialize(payloadSnapshot.states).byteLength}`;
    // P3-PB2: the snapshot payload is no longer a `Buffer`, so these two rows measure a
    // *serialized-equivalent* size (a measurement-only `v8.serialize` of the retained record) rather than
    // the stored payload's own length. Row names are unchanged so the series stays comparable against
    // `pre-roadmap-baseline`; `payload/retainedChain` below is unchanged and remains the load-bearing row
    // for the JSON-vs-v8-at-rest fallback decision. See docs/plans/03-codegen-serializers.md, "Benchmark
    // maintenance".
    //
    // P4-B: `Game.state` is the registered `GameState` object, so its record now lives inside `states`
    // rather than in a separate `gameState` payload. The two rows keep their names and still split the
    // payload the same way: `gameStateBuffer` is the `GameState` record alone, `gameObjectStatesBuffer` is
    // every other record. Their sum approximates the serialized size of the whole `states` map, which now also holds the `GameState` record.
    const gameStateUuid = context.game.state.uuid;
    expect(payloadSnapshot.states[gameStateUuid]).toBeDefined();
    const { [gameStateUuid]: gameStateRecord, ...otherObjectRecords } = payloadSnapshot.states;
    const gameStateBytes = v8.serialize(gameStateRecord).byteLength;
    const gameObjectStateBytes = v8.serialize(otherObjectRecords).byteLength;
    const totalPayloadBytes = gameStateBytes + gameObjectStateBytes;

    const payloads: IPayloadMeasurement[] = [
        {
            scenario: scenario.name,
            category: 'payload',
            benchmark: 'fullSnapshotTotal',
            serializedBytes: totalPayloadBytes,
            notes: {
                bytesPerGameObject: Math.round(totalPayloadBytes / liveGameObjects),
                measurement: 'v8-equivalent-of-json-record (not stored bytes); sum of the two rows below; P4-B: bytesPerGameObject and the reported liveGameObjects now include the GameState record'
            }
        },
        // P3-PB2 fix (PB2I1-OPR-03): the row names and the schema version deliberately do not move, so the
        // series stays comparable against `pre-roadmap-baseline`; the provenance travels in `notes`, which
        // the renderer already prints, so P3-PB3's capture carries it instead of having to rediscover it.
        // Two systematic artefacts make this *not* a like-for-like content-volume comparison: v8 encodes a
        // native Map/Set compactly where the encoder emits `{$map:[...]}`/`{$set:[...]}`, and v8 preserves
        // shared substructure where `encodeStateValue` explicitly does not.
        {
            scenario: scenario.name,
            category: 'payload',
            benchmark: 'gameStateBuffer',
            serializedBytes: gameStateBytes,
            notes: { measurement: 'v8-equivalent-of-json-record (not stored bytes); P3-PB2 changed this row from Buffer.byteLength of the stored payload; P4-B moved Game.state into states, so this row is the GameState record alone' }
        },
        {
            scenario: scenario.name,
            category: 'payload',
            benchmark: 'gameObjectStatesBuffer',
            serializedBytes: gameObjectStateBytes,
            notes: { measurement: 'v8-equivalent-of-json-record (not stored bytes); P3-PB2 changed this row from Buffer.byteLength of the stored payload; P4-B moved Game.state into states, so this row is every record except GameState' }
        }
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

    // Same retention measurement with a real write before every build, so consecutive snapshots share only the records the write
    // left untouched (what a game produces) instead of nearly all of them (what the row above produces). The first build after the
    // clear has no memo, so reuse is averaged over builds 2..N. The counts are strings because the markdown renderer prints numeric
    // notes as byte sizes.
    forceGcIfAvailable();
    const beforeWriteChain = sampleMemory();
    const chainBuildReuse: IRecordReuse[] = [];
    let chainBuildsHollow = false;

    for (let index = 0; index < RETAINED_SNAPSHOT_CHAIN_LENGTH; index++) {
        toggleBenchmarkMutations(context, scenario);
        const previousChainSnapshot: IGameSnapshot | null = snapshotFactory.currentActionSnapshot;
        snapshotManager.moveToNextTimepoint(SnapshotTimepoint.Action);
        if (index > 0) {
            chainBuildReuse.push(countRecordReuse(previousChainSnapshot, snapshotFactory.currentActionSnapshot));
            chainBuildsHollow = chainBuildsHollow || snapshotFactory.currentActionSnapshot.hollow === true;
        }
        snapshotManager.takeSnapshot({ type: SnapshotType.Manual, playerId });
    }

    forceGcIfAvailable();
    const writeChainRetention = memoryDelta(beforeWriteChain, sampleMemory());
    const chainReuse = averageRecordReuse(chainBuildReuse);

    payloads.push({
        scenario: scenario.name,
        category: 'payload',
        benchmark: `retainedChainWithWrites(${RETAINED_SNAPSHOT_CHAIN_LENGTH} snapshots)`,
        serializedBytes: writeChainRetention.totalBytes,
        notes: {
            heapUsedBytes: writeChainRetention.heapUsedBytes,
            externalBytes: writeChainRetention.externalBytes,
            bytesPerSnapshot: Math.round(writeChainRetention.totalBytes / RETAINED_SNAPSHOT_CHAIN_LENGTH),
            avgReusedRecordsPerBuild: chainBuildsHollow ? HOLLOW_REUSE_NOTE : String(chainReuse.avgReused),
            avgFreshRecordsPerBuild: chainBuildsHollow ? HOLLOW_REUSE_NOTE : String(chainReuse.avgFresh),
            reuseMeasurement: 'record counts per build over builds 2..N (the first build has no memo), not bytes'
        }
    });
    const chainWithWritesNotes = payloads[payloads.length - 1].notes;

    snapshotManager.clearAllSnapshots();
    restoreAnchor();

    // --- P4-G delta diagnostics (appended after every existing row; none of them changes an earlier row) --------------------------

    const delta = await measureDeltaDiagnosticsAsync(context, scenario, anchorSnapshot, anchorContentNote, restoreAnchor);
    results.push(...delta.results);
    payloads.push(...delta.payloads);

    reportWriter.addScenario({ scenario: scenario.name, mutatedCards, liveGameObjects, results, payloads });

    console.log(' ');
    console.log(`Scenario ${scenario.name}: ${liveGameObjects} live GameObjects, ${mutatedCards} mutated cards per iteration`);
    console.table(results.map((result) => toConsoleRow(scenario.name, result)));
    console.table(payloads);
    console.log(`Record reuse per build (${scenario.name}): memoized row ${JSON.stringify(memoizedResult.notes)}; chain-with-writes row ${JSON.stringify(chainWithWritesNotes)}`);

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

                        // The seven original rows plus the six P4-G delta timing rows.
                        expect(results.length).toBe(13);
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
