import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import type { Game } from '../../server/game/core/Game';
import { SnapshotFactory } from '../../server/game/core/snapshot/SnapshotFactory';
import { SnapshotManager } from '../../server/game/core/snapshot/SnapshotManager';
import type { IRollbackResult } from '../../server/game/core/snapshot/SnapshotInterfaces';
import { DeltaSnapshotKind } from '../../server/game/core/snapshot/SnapshotInterfaces';
import { DeltaChainBeyondHorizonError, shouldUseDelta } from '../../server/game/core/snapshot/container/DeltaSnapshotIndex';
import type { DeltaSnapshotIndex } from '../../server/game/core/snapshot/container/DeltaSnapshotIndex';

/**
 * Test-mode verifier for the P4-E delta chain in shadow mode (`docs/plans/04-delta-snapshots.md`, "As landed in P4-E").
 *
 * Production never builds a chain in P4-E, so this helper is the evidence that every restored rollback could have been served
 * by one. Installed at module load in every jasmine run (the helper glob loads it into every worker), it
 *
 * - wraps `SnapshotFactory.prototype.createSnapshotForCurrentTimepoint` and, after every snapshot, checks pairing: the index head
 *   is the new snapshot, and (unless it is the bridge-less tracking anchor) the index holds a delta with the snapshot's timepoint,
 *   timepoint number and kind whose anchor is the head read before the snapshot;
 * - wraps `SnapshotFactory.prototype.clearNewerSnapshots`, the one call every restored rollback of every type makes, builds the
 *   chain from the head to the restored target before the prune, and checks the prune left the target as the head with no id above it;
 * - records failures instead of throwing, so the game under test is not perturbed and engine error handling cannot swallow them,
 *   and fails the spec from a top-level `afterEach`.
 *
 * Jasmine refuses a top-level `beforeAll`/`afterAll` in a helper in parallel mode, and `Env#addReporter` too; a top-level
 * `afterEach` and module-load installation work. Like `SnapshotMemoVerifier.ts`, each worker writes a boot marker at load and its counts
 * line synchronously to its own file under a per-invocation directory, rewritten after every spec and on `disconnect`/`exit`
 * (`state=`); the four workers' `specs=` sum to the suite's executed specs. A beyond-horizon rejection counts as `beyondHorizon` only
 * for a target below the oldest live delta entry of the game's quick containers (or when none is live); otherwise it is a failure.
 * The counts balance: `chainsChecked + beyondHorizon + chainFailuresRecorded + checksSkippedForExemptOrSuspended` equals `restoredRollbacks`, the number of
 * `SnapshotManager.rollbackToInternal` calls that returned `success: true`.
 *
 * Not installed when `RUN_PERF_BENCHMARKS` is set, so the benchmark run keeps measuring the unwrapped factory.
 */

export type DeltaChainFailureSite = 'pairing' | 'chain' | 'prune';

export interface IDeltaChainFailure {
    site: DeltaChainFailureSite;
    snapshotId: number | null;
    message: string;
}

export interface IDeltaChainVerifierStats {
    installed: boolean;
    pairingChecked: number;
    chainsChecked: number;
    beyondHorizon: number;
    maxChain: number;
    failures: number;
    expectedFailures: number;
    restoredRollbacks: number;
    chainFailuresRecorded: number;
    checksSkippedForExemptOrSuspended: number;
}

interface IFactoryInternals {
    game: Game;
}
interface IQuickContainerInternals {
    getOldestLiveDeltaId: () => number | null;
}
interface IManagerInternals {
    quickSnapshots: Map<string, IQuickContainerInternals>;
}
interface IManagerRollbackInternals {
    rollbackToInternal(...args: unknown[]): IRollbackResult;
}

const RUN_PARENT_DIR = path.join(os.tmpdir(), 'forceteki-delta-chain-verifier-runs');
const STALE_RUN_DIR_THRESHOLD_MS = 6 * 60 * 60 * 1000;

let installed = false;
let suspendedDepth = 0;
let expectedCollectors: IDeltaChainFailure[][] = [];
let specFailures: IDeltaChainFailure[] = [];
const exemptIndexes = new WeakSet<DeltaSnapshotIndex>();

let pairingChecked = 0;
let chainsChecked = 0;
let beyondHorizon = 0;
let maxChain = 0;
let failures = 0;
let expectedFailures = 0;
let restoredRollbacks = 0;
let chainFailuresRecorded = 0;
let checksSkippedForExemptOrSuspended = 0;

export function getDeltaChainVerifierStats(): IDeltaChainVerifierStats {
    return { installed, pairingChecked, chainsChecked, beyondHorizon, maxChain, failures, expectedFailures, restoredRollbacks, chainFailuresRecorded, checksSkippedForExemptOrSuspended };
}

export function isDeltaChainVerifierInstalled(): boolean {
    return installed;
}

function assertNotThenable(result: unknown, helperName: string): void {
    if (result !== null && (typeof result === 'object' || typeof result === 'function') && typeof (result as { then?: unknown }).then === 'function') {
        throw new Error(`[DeltaChainVerifier] ${helperName}(fn) requires a synchronous fn; fn() returned a thenable, which would revert the scope before any awaited work runs.`);
    }
}

/**
 * Runs `fn`, which deliberately makes the verifier report, and returns the failures recorded while it ran. They do not fail
 * the spec and are counted as `expectedFailures`, not `failures`.
 */
export function withExpectedDeltaChainFailure(fn: () => void): IDeltaChainFailure[] {
    const collected: IDeltaChainFailure[] = [];
    expectedCollectors.push(collected);
    try {
        assertNotThenable(fn(), 'withExpectedDeltaChainFailure');
    } finally {
        expectedCollectors = expectedCollectors.filter((collector) => collector !== collected);
    }
    return collected;
}

/** Runs `fn` with the verifier inactive: no pairing or chain check (a rollback inside still counts as checksSkippedForExemptOrSuspended). */
export function withDeltaChainVerifierSuspended<T>(fn: () => T): T {
    suspendedDepth++;
    try {
        const result = fn();
        assertNotThenable(result, 'withDeltaChainVerifierSuspended');
        return result;
    } finally {
        suspendedDepth--;
    }
}

/**
 * Excludes one game from verification, for a spec that deliberately breaks the delta lineage (a raw restore that restarts the
 * tracker at a snapshot other than the current one). The reason is mandatory and states how the lineage is broken.
 */
export function exemptGameFromDeltaChainVerification(game: Game, reason: string): void {
    if (typeof reason !== 'string' || reason.trim().length === 0) {
        throw new Error('[DeltaChainVerifier] exemptGameFromDeltaChainVerification requires a non-empty reason');
    }
    exemptIndexes.add(game.snapshotManager.deltaSnapshotIndex);
}

function recordFailure(site: DeltaChainFailureSite, snapshotId: number | null, message: string): void {
    const failure: IDeltaChainFailure = { site, snapshotId, message };

    const collector = expectedCollectors[expectedCollectors.length - 1];
    if (collector !== undefined) {
        collector.push(failure);
        expectedFailures++;
        return;
    }

    specFailures.push(failure);
    failures++;
}

function isInactiveFor(factory: SnapshotFactory): boolean {
    return suspendedDepth > 0 || exemptIndexes.has(factory.deltaSnapshotIndex);
}

/** The oldest delta id any quick container of the factory's game still holds a live payload for, or null (none live, or the containers cannot say). */
function getOldestLiveDeltaId(factory: SnapshotFactory): number | null {
    const manager = (factory as unknown as IFactoryInternals).game.snapshotManager as unknown as IManagerInternals;
    let oldest: number | null = null;
    for (const container of manager.quickSnapshots.values()) {
        const id = container.getOldestLiveDeltaId();
        if (id !== null && (oldest === null || id < oldest)) {
            oldest = id;
        }
    }
    return oldest;
}

function verifyPairing(factory: SnapshotFactory, headBefore: number | null): void {
    pairingChecked++;

    const index = factory.deltaSnapshotIndex;
    const currentId = factory.currentSnapshotId;

    if (index.headSnapshotId !== currentId) {
        recordFailure('pairing', currentId, `[DeltaChainVerifier] index head is ${index.headSnapshotId} after snapshot ${currentId} was taken`);
        return;
    }

    if (index.trackingAnchorId === currentId) {
        if (index.get(currentId) !== undefined) {
            recordFailure('pairing', currentId, `[DeltaChainVerifier] snapshot ${currentId} is the tracking anchor but has a delta`);
        }
        return;
    }

    const delta = index.get(currentId);
    if (delta === undefined) {
        recordFailure('pairing', currentId, `[DeltaChainVerifier] snapshot ${currentId} has no delta`);
        return;
    }

    const expectedKind = shouldUseDelta(factory.currentSnapshottedTimepointType, factory.currentSnapshottedPhase) ? DeltaSnapshotKind.Action : DeltaSnapshotKind.Bridge;
    if (
        delta.timepoint !== factory.currentSnapshottedTimepointType ||
        delta.timepointNumber !== factory.currentSnapshottedTimepointNumber ||
        delta.kind !== expectedKind
    ) {
        recordFailure(
            'pairing',
            currentId,
            `[DeltaChainVerifier] delta ${currentId} (timepoint ${delta.timepoint}, number ${delta.timepointNumber}, kind ${delta.kind}) does not match its snapshot (timepoint ${factory.currentSnapshottedTimepointType}, number ${factory.currentSnapshottedTimepointNumber}, kind ${expectedKind})`
        );
        return;
    }

    if (delta.anchorSnapshotId !== headBefore) {
        recordFailure('pairing', currentId, `[DeltaChainVerifier] delta ${currentId} anchors at ${delta.anchorSnapshotId}, but the index head before the snapshot was ${headBefore}`);
    }
}

function verifyChainToTarget(factory: SnapshotFactory, targetId: number): void {
    const index = factory.deltaSnapshotIndex;
    try {
        // The factory's current snapshot is already the restored target here.
        const chain = index.buildChain(targetId, factory.currentSnapshottedTimepointNumber);
        chainsChecked++;
        maxChain = Math.max(maxChain, chain.length);
    } catch (error) {
        if (error instanceof DeltaChainBeyondHorizonError) {
            const oldestLive = getOldestLiveDeltaId(factory);
            if (oldestLive === null || targetId < oldestLive) {
                beyondHorizon++;
                return;
            }

            chainFailuresRecorded++;
            recordFailure('chain', targetId, `[DeltaChainVerifier] beyond-horizon rejection for target ${targetId}, which is not below the oldest live delta entry ${oldestLive} (evictedThroughId ${error.evictedThroughId}): ${error.message}`);
            return;
        }

        chainFailuresRecorded++;
        recordFailure('chain', targetId, `[DeltaChainVerifier] chain to restored target ${targetId} failed: ${error instanceof Error ? error.message : String(error)}`);
    }
}

function verifyPrune(factory: SnapshotFactory, targetId: number): void {
    const index = factory.deltaSnapshotIndex;
    const above = index.getIds().filter((id) => id > targetId);
    if (index.headSnapshotId !== targetId || above.length > 0) {
        recordFailure('prune', targetId, `[DeltaChainVerifier] after the rollback to ${targetId} the index head is ${index.headSnapshotId} and ids above the target remain: [${above.join(', ')}]`);
    }
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

function installDeltaChainVerifier(): void {
    if (installed) {
        return;
    }
    installed = true;

    const originalCreateSnapshot = SnapshotFactory.prototype.createSnapshotForCurrentTimepoint;
    SnapshotFactory.prototype.createSnapshotForCurrentTimepoint = function(this: SnapshotFactory, timepoint) {
        const headBefore = this.deltaSnapshotIndex.headSnapshotId;
        originalCreateSnapshot.call(this, timepoint);

        if (!isInactiveFor(this)) {
            verifyPairing(this, headBefore);
        }
    };

    const originalClearNewer = SnapshotFactory.prototype.clearNewerSnapshots;
    SnapshotFactory.prototype.clearNewerSnapshots = function(this: SnapshotFactory, snapshotId: number) {
        if (isInactiveFor(this)) {
            checksSkippedForExemptOrSuspended++;
            originalClearNewer.call(this, snapshotId);
            return;
        }

        verifyChainToTarget(this, snapshotId);
        originalClearNewer.call(this, snapshotId);
        verifyPrune(this, snapshotId);
    };

    // The count a reader balances the chain counters against: every restored rollback reaches clearNewerSnapshots exactly once.
    const managerPrototype = SnapshotManager.prototype as unknown as IManagerRollbackInternals;
    const originalRollbackToInternal = managerPrototype.rollbackToInternal;
    managerPrototype.rollbackToInternal = function(this: SnapshotManager, ...args: unknown[]) {
        const result = originalRollbackToInternal.apply(this, args);
        if (result.success) {
            restoredRollbacks++;
        }
        return result;
    };

    if (process.env.ENABLE_UNDO_ALL_TESTS === 'true') {
        // The whole-suite undo replay needs the chain to every start-of-test snapshot to exist (docs/plans/04-delta-snapshots.md,
        // "Manual snapshots and the whole-suite gate"), and manual snapshots never pin the index, so eviction is switched off here, in a
        // helper, rather than in the harness. Eviction can only happen at a container push, which always follows a snapshot, so
        // disabling it before a manager's first timepoint precedes every eviction. P4-F's harness gate takes this over.
        const managersWithEvictionDisabled = new WeakSet<SnapshotManager>();
        const originalMoveToNextTimepoint = SnapshotManager.prototype.moveToNextTimepoint;
        SnapshotManager.prototype.moveToNextTimepoint = function(this: SnapshotManager, timepoint) {
            if (!managersWithEvictionDisabled.has(this)) {
                managersWithEvictionDisabled.add(this);
                this.setDeltaIndexEvictionEnabled(false);
            }
            originalMoveToNextTimepoint.call(this, timepoint);
        };
    }

    // Top-level afterEach: allowed in a helper under --parallel (a top-level beforeAll/afterAll is not).
    afterEach(function() {
        specsRun++;

        if (specFailures.length > 0) {
            const first = specFailures[0];
            const count = specFailures.length;
            specFailures = [];
            fail(`[DeltaChainVerifier] ${count} delta chain failure(s); first: site=${first.site} snapshot=${first.snapshotId}: ${first.message}`);
        }

        // See SnapshotMemoVerifier: a worker's 'exit' handler can be lost under --parallel, so the per-worker file is rewritten after every spec.
        writeStatsFile(finalStateWritten ? 'exit' : 'running');
    });

    pruneStaleRunDirectories();
    try {
        const dir = getRunDir();
        fs.mkdirSync(dir, { recursive: true });
        runDirReady = true;
        fs.writeFileSync(path.join(dir, `pid-${process.pid}.boot`), `${new Date().toISOString()}\n`, 'utf8');
    } catch (error) {
        console.error(`[DeltaChainVerifier] pid=${process.pid} failed to write boot marker: ${(error as Error).message}`);
    }

    process.on('disconnect', () => {
        writeFinalStats();
    });

    process.on('exit', () => {
        console.log(writeFinalStats());
    });
}

let runDirReady = false;
let specsRun = 0;
let finalStateWritten = false;
let lastWrittenLine = '';
let statsWriteFailureReported = false;

function writeFinalStats(): string {
    finalStateWritten = true;
    return writeStatsFile('exit');
}

/** Writes the worker's counts to its own file under the per-invocation directory, synchronously, and returns the line. */
function writeStatsFile(state: 'running' | 'exit'): string {
    const stats = getDeltaChainVerifierStats();
    const line =
        `[DeltaChainVerifier] pid=${process.pid} specs=${specsRun} pairingChecked=${stats.pairingChecked} chainsChecked=${stats.chainsChecked} ` +
        `beyondHorizon=${stats.beyondHorizon} maxChain=${stats.maxChain} failures=${stats.failures} expectedFailures=${stats.expectedFailures} ` +
        `restoredRollbacks=${stats.restoredRollbacks} chainFailuresRecorded=${stats.chainFailuresRecorded} checksSkippedForExemptOrSuspended=${stats.checksSkippedForExemptOrSuspended} state=${state}`;
    if (line === lastWrittenLine || !runDirReady) {
        // No run directory means the boot marker already reported the failure.
        return line;
    }

    // Set even when the write throws, so an unwritable directory is reported once rather than on every spec.
    lastWrittenLine = line;
    try {
        fs.writeFileSync(path.join(getRunDir(), `pid-${process.pid}.log`), `${line}\n`, 'utf8');
    } catch (error) {
        if (!statsWriteFailureReported) {
            statsWriteFailureReported = true;
            console.error(`[DeltaChainVerifier] pid=${process.pid} failed to write the counts file: ${(error as Error).message}`);
        }
    }
    return line;
}

if (!process.env.RUN_PERF_BENCHMARKS) {
    installDeltaChainVerifier();
}
