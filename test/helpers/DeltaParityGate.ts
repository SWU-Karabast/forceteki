import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import type { Game } from '../../server/game/core/Game';
import type { GameObjectBase } from '../../server/game/core/GameObjectBase';
import { SnapshotType } from '../../server/game/core/Constants';
import { getStateSerializerFor } from '../../server/game/core/StateSerializers';
import type { GameStateManager } from '../../server/game/core/snapshot/GameStateManager';
import { SnapshotManager } from '../../server/game/core/snapshot/SnapshotManager';
import type { IGameSnapshot, IGetSnapshotSettings, IRollbackResult } from '../../server/game/core/snapshot/SnapshotInterfaces';

/**
 * The whole-suite gate for the delta restore path (`docs/plans/04-delta-snapshots.md`, "Manual snapshots and the whole-suite gate").
 *
 * Under `ENABLE_UNDO_ALL_TESTS` every integration spec runs, rolls back to its start-of-test manual snapshot and runs again. This
 * helper turns that replay into a parity check of the delta restore against the full one:
 *
 * - on a `SnapshotManager`'s first timepoint it disables delta index eviction (so the chain to every start-of-test snapshot exists;
 *   manual snapshots never pin the index) and switches on the manager's delta-parity mode, in which every manual snapshot is also
 *   recorded as a delta anchor and a rollback to one restores through the delta chain;
 * - it wraps `SnapshotManager.rollbackToInternal`, the funnel every rollback entry passes. Every `Manual` rollback to a delta-anchored
 *   id of a game in parity mode is an attempt (`parityRollbacks`), counted before it runs. After a successful one it serializes every
 *   live object and deep-compares the result with the stored full manual snapshot (identical uuid sets, equal records, rng state and
 *   object-id counter; `parityChecks`). Chat is not a game object, so it is outside the compare (the harness restores it separately).
 *   A mismatch throws an `Error` naming the first differing uuid and field and fails the spec from a top-level `afterEach` as well. An
 *   attempt that returns an unsuccessful result or throws is never compared: inside `withExpectedRollbackFailure` it is counted as
 *   `expectedRollbackFailures`; anywhere else it is reported like a mismatch, so the spec fails;
 * - the top-level `afterEach` also fails any spec whose attempts are not all accounted for as a compare or an expected failure, so
 *   `parityRollbacks = parityChecks + expectedRollbackFailures` holds on a healthy run and is broken by any uncompared attempt;
 * - `exemptGameFromDeltaParity` turns parity mode off for one game, counted, for a spec that deliberately restores outside
 *   `SnapshotManager` (a raw restore drops the tracker window, so the later chain to the start-of-test snapshot would correctly fail);
 * - `withDeltaParitySuspended` keeps one spec's own manual rollback on the full path, counted;
 * - the four opt-outs (`exemptGameFromDeltaParity`, `withDeltaParitySuspended`, `withExpectedRollbackFailure`,
 *   `withExpectedDeltaParityMismatch`) throw when called from anywhere but an engine spec under `test/server/core/`, so no card or
 *   scenario spec can leave the gate;
 * - `markParityChecks`/`expectParityCheckSince` let `undoIt` prove each replayed spec's rollback was delta-restored and compared.
 *
 * Like the other verifiers, each worker writes a boot marker and a counts line to its own file under a per-invocation directory
 * (`specs= parityRollbacks= parityChecks= expectedRollbackFailures= mismatches= expectedMismatches= unbalancedSpecs= exemptGames=
 * suspendedScopes= state=`), rewritten after every spec. Not installed when `RUN_PERF_BENCHMARKS` is set.
 */

export interface IDeltaParityMismatch {
    snapshotId: number;
    playerId: string;
    message: string;
}

export interface IDeltaParityGateStats {
    installed: boolean;
    active: boolean;
    parityRollbacks: number;
    parityChecks: number;
    expectedRollbackFailures: number;
    mismatches: number;
    expectedMismatches: number;
    unbalancedSpecs: number;
    exemptGames: number;
    suspendedScopes: number;
}

interface ISnapshotMapInternals {
    snapshots: Map<number, IGameSnapshot>;
}
interface IGameStateManagerInternals {
    allGameObjects: GameObjectBase[];
}
interface IFactoryInternals {
    game: Game;
}
interface IManagerInternals {
    manualSnapshots: Map<string, ISnapshotMapInternals>;
    deltaAnchoredManualSnapshotIds: Map<string, Set<number>>;
    _gameStateManager: GameStateManager;
    snapshotFactory: IFactoryInternals;
    rollbackToInternal(...args: unknown[]): IRollbackResult;
}

const RUN_PARENT_DIR = path.join(os.tmpdir(), 'forceteki-delta-parity-gate-runs');
const STALE_RUN_DIR_THRESHOLD_MS = 6 * 60 * 60 * 1000;

const active = process.env.ENABLE_UNDO_ALL_TESTS === 'true';

let installed = false;
let expectedCollectors: IDeltaParityMismatch[][] = [];
let specFailures: IDeltaParityMismatch[] = [];
const exemptManagers = new WeakSet<SnapshotManager>();
const initializedManagers = new WeakSet<SnapshotManager>();

let parityRollbacks = 0;
let parityChecks = 0;
let expectedRollbackFailures = 0;
let mismatches = 0;
let expectedMismatches = 0;
let unbalancedSpecs = 0;
let exemptGames = 0;
let suspendedScopes = 0;

/** Depth of `withExpectedRollbackFailure` scopes; also read by `ParityHarness` to count a failed restore as deliberate. */
let expectedRollbackFailureDepth = 0;

/** The attempt, compare and expected-failure counts at the end of the previous spec, for the per-spec balance. */
let balanceMark = { parityRollbacks: 0, parityChecks: 0, expectedRollbackFailures: 0 };

export function getDeltaParityGateStats(): IDeltaParityGateStats {
    return { installed, active, parityRollbacks, parityChecks, expectedRollbackFailures, mismatches, expectedMismatches, unbalancedSpecs, exemptGames, suspendedScopes };
}

/**
 * The first stack frame outside this helper, when it is not in an engine spec under `test/server/core/` (compiled or source paths,
 * either separator); null when it is. Exported for the gate's own spec.
 */
export function callerOutsideCoreSpecs(stack: string): string | null {
    const frames = stack.split('\n')
        .slice(1)
        .map((frame) => frame.replace(/\\/g, '/'));
    const caller = frames.find((frame) => !frame.includes('/test/helpers/DeltaParityGate.'));
    if (caller === undefined) {
        return '(no caller frame)';
    }
    return caller.includes('/test/server/core/') ? null : caller.trim();
}

/** Throws unless the caller of `helperName` is an engine spec under `test/server/core/` (the bound on every gate opt-out). */
function assertCalledFromCoreSpec(helperName: string): void {
    const caller = callerOutsideCoreSpecs(new Error().stack ?? '');
    if (caller !== null) {
        throw new Error(`[DeltaParityGate] ${helperName} may only be called from an engine spec under test/server/core/; called from ${caller}`);
    }
}

/** True while a `withExpectedRollbackFailure` scope is open. */
export function isRollbackFailureExpected(): boolean {
    return expectedRollbackFailureDepth > 0;
}

/**
 * Runs `fn`, which deliberately makes a rollback fail (an injected throw the restore recovers from, or an expected `Contract`
 * error). Inside the scope a manual rollback to a delta-anchored snapshot that does not succeed is counted as
 * `expectedRollbackFailures` instead of being reported as an uncompared attempt, and `ParityHarness` counts a failed restore as a
 * deliberate failure instead of `rollbacksFailed`. Only for engine specs under `test/server/core/`.
 */
export function withExpectedRollbackFailure<T>(fn: () => T): T {
    assertCalledFromCoreSpec('withExpectedRollbackFailure');
    expectedRollbackFailureDepth++;
    try {
        const result = fn();
        if (result !== null && typeof result === 'object' && typeof (result as { then?: unknown }).then === 'function') {
            throw new Error('[DeltaParityGate] withExpectedRollbackFailure(fn) requires a synchronous fn');
        }
        return result;
    } finally {
        expectedRollbackFailureDepth--;
    }
}

export function isDeltaParityGateActive(): boolean {
    return installed && active;
}

function internalsOf(manager: SnapshotManager): IManagerInternals {
    return manager as unknown as IManagerInternals;
}

/**
 * Excludes one game from the parity compare: only for a spec that deliberately restores outside `SnapshotManager` (a raw
 * `GameStateManager` or container rollback), called at that restore's site. The reason is mandatory and names the raw restore.
 */
export function exemptGameFromDeltaParity(game: Game, reason: string): void {
    if (typeof reason !== 'string' || reason.trim().length === 0) {
        throw new Error('[DeltaParityGate] exemptGameFromDeltaParity requires a non-empty reason');
    }
    assertCalledFromCoreSpec('exemptGameFromDeltaParity');

    const manager = game.snapshotManager;
    if (!exemptManagers.has(manager)) {
        exemptManagers.add(manager);
        exemptGames++;
    }
    manager.setDeltaParityMode(false);
}

/**
 * Runs `fn` with the game's delta-parity mode off, so a manual rollback the spec itself makes inside `fn` restores through the full
 * path, as it does outside whole-suite undo mode. For a spec whose subject is the full restore (an injected deserializer failure, the
 * full path's recovery, the chain verifier on a full restore) or whose deliberate lineage break it repairs with that rollback. The
 * recorded delta anchors stay, so the harness's own start-of-test rollback is still delta-restored and compared. Counted; the reason
 * is mandatory.
 */
export function withDeltaParitySuspended<T>(game: Game, reason: string, fn: () => T): T {
    if (typeof reason !== 'string' || reason.trim().length === 0) {
        throw new Error('[DeltaParityGate] withDeltaParitySuspended requires a non-empty reason');
    }
    assertCalledFromCoreSpec('withDeltaParitySuspended');

    const manager = game.snapshotManager;
    const wasOn = manager.isDeltaParityMode;
    manager.setDeltaParityMode(false);
    suspendedScopes++;
    try {
        return fn();
    } finally {
        manager.setDeltaParityMode(wasOn);
    }
}

/**
 * Runs `fn`, which deliberately makes the gate report, and returns the mismatches recorded while it ran. Inside the scope a mismatch
 * is collected instead of thrown or failing the spec, and is counted as `expectedMismatches`.
 */
export function withExpectedDeltaParityMismatch(fn: () => void): IDeltaParityMismatch[] {
    assertCalledFromCoreSpec('withExpectedDeltaParityMismatch');
    const collected: IDeltaParityMismatch[] = [];
    expectedCollectors.push(collected);
    try {
        const result: unknown = fn();
        if (result !== null && typeof result === 'object' && typeof (result as { then?: unknown }).then === 'function') {
            throw new Error('[DeltaParityGate] withExpectedDeltaParityMismatch(fn) requires a synchronous fn');
        }
    } finally {
        expectedCollectors = expectedCollectors.filter((collector) => collector !== collected);
    }
    return collected;
}

/** The current compare count, for {@link expectParityCheckSince}. */
export function markParityChecks(): number {
    return parityChecks;
}

/** Throws unless a parity compare ran since `mark`, when the gate is active and the game is not exempt. */
export function expectParityCheckSince(mark: number, game: Game): void {
    if (!isDeltaParityGateActive() || exemptManagers.has(game.snapshotManager)) {
        return;
    }

    if (parityChecks <= mark) {
        throw new Error('[DeltaParityGate] the start-of-test manual rollback was not restored through the delta chain and compared with the stored full snapshot');
    }
}

/** The first difference between two encoded values, as a path and both values, or null when they are deep-equal. */
function firstDifference(expected: unknown, actual: unknown, at: string): string | null {
    if (expected === actual) {
        return null;
    }

    const describe = (value: unknown) => {
        const text = JSON.stringify(value);
        return text === undefined ? String(value) : text.length > 200 ? `${text.slice(0, 200)}...` : text;
    };
    const differ = () => `${at || '(root)'}: stored ${describe(expected)}, live ${describe(actual)}`;

    if (expected === null || actual === null || typeof expected !== 'object' || typeof actual !== 'object') {
        return differ();
    }

    if (Array.isArray(expected) !== Array.isArray(actual)) {
        return differ();
    }

    if (Array.isArray(expected)) {
        const actualArray = actual as unknown[];
        if (expected.length !== actualArray.length) {
            return `${at}: stored length ${expected.length}, live length ${actualArray.length} (stored ${describe(expected)}, live ${describe(actual)})`;
        }
        for (let i = 0; i < expected.length; i++) {
            const difference = firstDifference(expected[i], actualArray[i], `${at}[${i}]`);
            if (difference !== null) {
                return difference;
            }
        }
        return null;
    }

    const expectedRecord = expected as Record<string, unknown>;
    const actualRecord = actual as Record<string, unknown>;
    const keys = new Set([...Object.keys(expectedRecord), ...Object.keys(actualRecord)]);
    for (const key of keys) {
        const difference = firstDifference(expectedRecord[key], actualRecord[key], at ? `${at}.${key}` : key);
        if (difference !== null) {
            return difference;
        }
    }
    return null;
}

/**
 * The gate's compare: live state (every registered object's fresh serialization, the rng state and the object-id counter) against
 * `stored`. Returns a description of the first difference, naming its uuid and field, or null when they are identical.
 */
export function compareLiveWithSnapshot(game: Game, stored: Pick<IGameSnapshot, 'states' | 'rngState' | 'lastGameObjectId'>): string | null {
    const gameStateManager = internalsOf(game.snapshotManager)._gameStateManager;
    const liveObjects = (gameStateManager as unknown as IGameStateManagerInternals).allGameObjects;

    const liveUuids = new Set<string>();
    for (const go of liveObjects) {
        liveUuids.add(go.uuid);
    }
    for (const uuid of Object.keys(stored.states)) {
        if (!liveUuids.has(uuid)) {
            return `uuid ${uuid} is in the stored snapshot but not registered live`;
        }
    }

    for (const go of liveObjects) {
        const storedRecord = stored.states[go.uuid];
        if (storedRecord === undefined) {
            return `uuid ${go.uuid} (${go.constructor.name}) is registered live but not in the stored snapshot`;
        }

        const difference = firstDifference(storedRecord, getStateSerializerFor(go).serializer.serialize(go), '');
        if (difference !== null) {
            return `uuid ${go.uuid} (${go.constructor.name}) field ${difference}`;
        }
    }

    const rngDifference = firstDifference(stored.rngState, game.randomGenerator.rngState, 'rngState');
    if (rngDifference !== null) {
        return rngDifference;
    }

    if (stored.lastGameObjectId !== gameStateManager.lastGameObjectId) {
        return `lastGameObjectId: stored ${stored.lastGameObjectId}, live ${gameStateManager.lastGameObjectId}`;
    }

    return null;
}

function recordMismatch(mismatch: IDeltaParityMismatch): boolean {
    const collector = expectedCollectors[expectedCollectors.length - 1];
    if (collector !== undefined) {
        collector.push(mismatch);
        expectedMismatches++;
        return false;
    }

    specFailures.push(mismatch);
    mismatches++;
    return true;
}

/**
 * Accounts an attempt that ended without a compare. Inside `withExpectedRollbackFailure` it is an expected failure. Anywhere else it is
 * reported like a mismatch (collected inside `withExpectedDeltaParityMismatch`, where it also counts as expected, since that scope
 * declares the gate's report as the spec's subject). Returns true when the report fails the spec, so the caller throws.
 */
function accountUncomparedAttempt(snapshotId: number, playerId: string, what: string): boolean {
    if (expectedRollbackFailureDepth > 0) {
        expectedRollbackFailures++;
        return false;
    }

    const failsSpec = recordMismatch({
        snapshotId,
        playerId,
        message: `[DeltaParityGate] the manual rollback to delta-anchored snapshot ${snapshotId} (player ${playerId}) ${what}, so it was not compared with the stored full snapshot (wrap a deliberate failure in withExpectedRollbackFailure)`
    });
    if (!failsSpec) {
        expectedRollbackFailures++;
    }
    return failsSpec;
}

/** The stored manual snapshot `settings` names when it is a delta anchor of a non-exempt game in parity mode, else null. */
function parityCandidateFor(manager: SnapshotManager, settings: IGetSnapshotSettings | undefined): IGameSnapshot | null {
    if (settings?.type !== SnapshotType.Manual || exemptManagers.has(manager) || !manager.isDeltaParityMode) {
        return null;
    }

    const internals = internalsOf(manager);
    if (internals.deltaAnchoredManualSnapshotIds.get(settings.playerId)?.has(settings.snapshotId) !== true) {
        return null;
    }

    return internals.manualSnapshots.get(settings.playerId)?.snapshots.get(settings.snapshotId) ?? null;
}

function pruneStaleRunDirectories(): void {
    let siblingNames: string[];
    try {
        siblingNames = fs.readdirSync(RUN_PARENT_DIR);
    } catch {
        return;
    }

    const now = Date.now();
    for (const siblingName of siblingNames) {
        const siblingDir = path.join(RUN_PARENT_DIR, siblingName);
        try {
            const dirStat = fs.statSync(siblingDir);
            let newestMtimeMs = dirStat.mtimeMs;
            if (dirStat.isDirectory()) {
                for (const fileName of fs.readdirSync(siblingDir)) {
                    newestMtimeMs = Math.max(newestMtimeMs, fs.statSync(path.join(siblingDir, fileName)).mtimeMs);
                }
            }
            if (now - newestMtimeMs > STALE_RUN_DIR_THRESHOLD_MS) {
                fs.rmSync(siblingDir, { recursive: true, force: true });
            }
        } catch {
            // Removed concurrently by another process between readdir and stat.
            continue;
        }
    }
}

function getRunDir(): string {
    return path.join(RUN_PARENT_DIR, String(process.ppid));
}

let runDirReady = false;
let specsRun = 0;
let finalStateWritten = false;
let lastWrittenLine = '';
let statsWriteFailureReported = false;

function writeStatsFile(state: 'running' | 'exit'): string {
    const line =
        `[DeltaParityGate] pid=${process.pid} specs=${specsRun} parityRollbacks=${parityRollbacks} parityChecks=${parityChecks} ` +
        `expectedRollbackFailures=${expectedRollbackFailures} mismatches=${mismatches} expectedMismatches=${expectedMismatches} ` +
        `unbalancedSpecs=${unbalancedSpecs} exemptGames=${exemptGames} suspendedScopes=${suspendedScopes} state=${state}`;
    if (line === lastWrittenLine || !runDirReady) {
        return line;
    }

    lastWrittenLine = line;
    try {
        fs.writeFileSync(path.join(getRunDir(), `pid-${process.pid}.log`), `${line}\n`, 'utf8');
    } catch (error) {
        if (!statsWriteFailureReported) {
            statsWriteFailureReported = true;
            console.error(`[DeltaParityGate] pid=${process.pid} failed to write the counts file: ${(error as Error).message}`);
        }
    }
    return line;
}

function writeFinalStats(): string {
    finalStateWritten = true;
    return writeStatsFile('exit');
}

function installDeltaParityGate(): void {
    if (installed) {
        return;
    }
    installed = true;

    if (!active) {
        return;
    }

    const originalMoveToNextTimepoint = SnapshotManager.prototype.moveToNextTimepoint;
    SnapshotManager.prototype.moveToNextTimepoint = function(this: SnapshotManager, timepoint) {
        if (!initializedManagers.has(this)) {
            initializedManagers.add(this);
            // Eviction can only happen at a container push, which always follows a snapshot, so this precedes every eviction.
            this.setDeltaIndexEvictionEnabled(false);
            if (!exemptManagers.has(this)) {
                this.setDeltaParityMode(true);
            }
        }
        originalMoveToNextTimepoint.call(this, timepoint);
    };

    const managerPrototype = SnapshotManager.prototype as unknown as IManagerInternals;
    const originalRollbackToInternal = managerPrototype.rollbackToInternal;
    managerPrototype.rollbackToInternal = function(this: SnapshotManager, ...args: unknown[]) {
        const settings = args[0] as IGetSnapshotSettings | undefined;
        const stored = parityCandidateFor(this, settings);
        if (stored === null || settings?.type !== SnapshotType.Manual) {
            return originalRollbackToInternal.apply(this, args);
        }

        // An attempt: it must end in a compare or, inside withExpectedRollbackFailure, in an expected failure.
        parityRollbacks++;
        let result: IRollbackResult;
        try {
            result = originalRollbackToInternal.apply(this, args);
        } catch (error) {
            accountUncomparedAttempt(settings.snapshotId, settings.playerId, `threw ${(error as Error)?.message ?? String(error)}`);
            throw error;
        }
        if (!result.success) {
            if (accountUncomparedAttempt(settings.snapshotId, settings.playerId, 'returned an unsuccessful result')) {
                throw new Error(`[DeltaParityGate] the manual rollback to delta-anchored snapshot ${settings.snapshotId} (player ${settings.playerId}) returned an unsuccessful result, so it was not compared`);
            }
            return result;
        }

        const game = internalsOf(this).snapshotFactory.game;
        const difference = compareLiveWithSnapshot(game, stored);
        parityChecks++;

        if (difference !== null) {
            const mismatch: IDeltaParityMismatch = {
                snapshotId: settings.snapshotId,
                playerId: settings.playerId,
                message: `[DeltaParityGate] the delta restore of manual snapshot ${settings.snapshotId} (player ${settings.playerId}) differs from its stored full records: ${difference}`
            };
            if (recordMismatch(mismatch)) {
                throw new Error(mismatch.message);
            }
        }

        return result;
    };

    // Top-level afterEach: allowed in a helper under --parallel (a top-level beforeAll/afterAll is not).
    afterEach(function() {
        specsRun++;

        // The balance: every attempt this spec made ended in a compare or an expected failure. Anything else (an attempt whose
        // failure was reported, or one that never reached either count) leaves it unbalanced and fails the spec.
        const attempts = parityRollbacks - balanceMark.parityRollbacks;
        const accounted = (parityChecks - balanceMark.parityChecks) + (expectedRollbackFailures - balanceMark.expectedRollbackFailures);
        balanceMark = { parityRollbacks, parityChecks, expectedRollbackFailures };
        if (attempts !== accounted) {
            unbalancedSpecs++;
            fail(`[DeltaParityGate] ${attempts} manual rollback attempt(s) to delta-anchored snapshots, but only ${accounted} compared or expected to fail`);
        }

        if (specFailures.length > 0) {
            const first = specFailures[0];
            const count = specFailures.length;
            specFailures = [];
            fail(`[DeltaParityGate] ${count} delta parity mismatch(es); first: ${first.message}`);
        }

        writeStatsFile(finalStateWritten ? 'exit' : 'running');
    });

    pruneStaleRunDirectories();
    try {
        const dir = getRunDir();
        fs.mkdirSync(dir, { recursive: true });
        runDirReady = true;
        fs.writeFileSync(path.join(dir, `pid-${process.pid}.boot`), `${new Date().toISOString()}\n`, 'utf8');
    } catch (error) {
        console.error(`[DeltaParityGate] pid=${process.pid} failed to write boot marker: ${(error as Error).message}`);
    }

    process.on('disconnect', () => {
        writeFinalStats();
    });

    process.on('exit', () => {
        console.log(writeFinalStats());
    });
}

if (!process.env.RUN_PERF_BENCHMARKS) {
    installDeltaParityGate();
}
