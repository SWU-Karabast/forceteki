import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import type { GameObjectBase } from '../../server/game/core/GameObjectBase';
import { GameStateManager } from '../../server/game/core/snapshot/GameStateManager';
import type { SerializedStateRecord } from '../../server/game/core/StateEncoding';
import { compareRoundTrip } from './ParityHarness';

/**
 * Test-mode verifier for P4-C snapshot memoization (`docs/plans/04-delta-snapshots.md`, "As landed in P4-C").
 *
 * Memoization reuses a previous snapshot's serialized record for every object the delta tracker saw untouched. That is
 * only sound if the record is byte-equal to a fresh `serialize` of the live object, and a write no tracker hook sees
 * (an in-place mutation of a `@stateValue` payload, a write made while the tracker is stopped) would silently break it.
 * This helper is the guard for that: installed at module load in every jasmine run (the helper glob loads it into every
 * worker), it
 *
 * - wraps `GameStateManager.prototype.buildGameStateForSnapshot` and, for every record of every map it builds, deep-compares
 *   the record with a fresh serialize of the live object (`compareRoundTrip`), checks the map's key count against the live
 *   object count, and deep-freezes each record, so a later write into a record that snapshots share fails the spec;
 * - wraps `GameStateManager.prototype.memoizedRecordFor` and, for each record the rollback pre-pass reuses (outside a
 *   build), compares it the same way;
 * - records a failure instead of throwing, so the game under test is not perturbed and engine error handling cannot swallow
 *   it, and fails the spec from a top-level `afterEach`.
 *
 * Jasmine refuses a top-level `beforeAll`/`afterAll` in a helper in parallel mode, and `Env#addReporter` too; a top-level
 * `afterEach` and module-load installation work. Like `ParityHarness.ts`, each worker writes a boot marker at load and its
 * counts line (`failures=` outside `withExpectedMemoMismatch`, `expectedMismatches=` inside it) synchronously to its own file
 * under a per-invocation directory: a stdout line alone was observed lost under `--parallel`, and so was a worker's `'exit'`
 * handler (a boot file with no exit file). The counts file is therefore rewritten after every spec (`state=running`,
 * with `specs=` the number of specs the worker finished) and finally on the worker's `'disconnect'` event and on `'exit'`
 * (`state=exit`); the four workers' `specs=` sum to the suite's executed specs.
 *
 * Not installed when `RUN_PERF_BENCHMARKS` is set, so the benchmark run keeps measuring the unwrapped build.
 */

export type SnapshotMemoFailureSite = 'build' | 'prepass' | 'count';

export interface ISnapshotMemoFailure {
    site: SnapshotMemoFailureSite;
    uuid: string | null;
    field: string | null;
    message: string;
}

export interface ISnapshotMemoVerifierStats {
    installed: boolean;
    buildsVerified: number;
    recordsVerifiedAtBuilds: number;
    recordsReusedAtBuilds: number;
    prepassRecordsReusedAndVerified: number;
    recordsFrozen: number;
    failures: number;
    expectedMismatches: number;
}

const RUN_PARENT_DIR = path.join(os.tmpdir(), 'forceteki-snapshot-memo-verifier-runs');
const STALE_RUN_DIR_THRESHOLD_MS = 6 * 60 * 60 * 1000;

let installed = false;
let suspendedDepth = 0;
let buildDepth = 0;
let expectedCollectors: ISnapshotMemoFailure[][] = [];
let specFailures: ISnapshotMemoFailure[] = [];

let buildsVerified = 0;
let recordsVerifiedAtBuilds = 0;
let recordsReusedAtBuilds = 0;
let prepassRecordsReusedAndVerified = 0;
let recordsFrozen = 0;
let failures = 0;
let expectedMismatches = 0;

export function getSnapshotMemoVerifierStats(): ISnapshotMemoVerifierStats {
    return {
        installed,
        buildsVerified,
        recordsVerifiedAtBuilds,
        recordsReusedAtBuilds,
        prepassRecordsReusedAndVerified,
        recordsFrozen,
        failures,
        expectedMismatches
    };
}

export function isSnapshotMemoVerifierInstalled(): boolean {
    return installed;
}

function assertNotThenable(result: unknown, helperName: string): void {
    if (result !== null && (typeof result === 'object' || typeof result === 'function') && typeof (result as { then?: unknown }).then === 'function') {
        throw new Error(`[SnapshotMemoVerifier] ${helperName}(fn) requires a synchronous fn; fn() returned a thenable, which would revert the scope before any awaited work runs.`);
    }
}

/**
 * Runs `fn`, which deliberately makes the verifier report, and returns the failures recorded while it ran. They do not
 * fail the spec and are counted as `expectedMismatches`, not `failures`.
 */
export function withExpectedMemoMismatch(fn: () => void): ISnapshotMemoFailure[] {
    const collected: ISnapshotMemoFailure[] = [];
    expectedCollectors.push(collected);
    try {
        assertNotThenable(fn(), 'withExpectedMemoMismatch');
    } finally {
        expectedCollectors = expectedCollectors.filter((collector) => collector !== collected);
    }
    return collected;
}

/** Runs `fn` with the verifier inactive: no comparison, key-count check, freeze or counting. For cases that count `serialize` calls. */
export function withSnapshotMemoVerifierSuspended<T>(fn: () => T): T {
    suspendedDepth++;
    try {
        const result = fn();
        assertNotThenable(result, 'withSnapshotMemoVerifierSuspended');
        return result;
    } finally {
        suspendedDepth--;
    }
}

function recordFailure(site: SnapshotMemoFailureSite, uuid: string | null, error: unknown): void {
    const message = error instanceof Error ? error.message : String(error);
    const field = (/field="([^"]*)"/).exec(message)?.[1] ?? null;
    const failure: ISnapshotMemoFailure = { site, uuid, field, message };

    const collector = expectedCollectors[expectedCollectors.length - 1];
    if (collector !== undefined) {
        collector.push(failure);
        expectedMismatches++;
        return;
    }

    specFailures.push(failure);
    failures++;
}

/** The one comparison of a record against a fresh serialize of the live object; throws the parity harness's mismatch diagnostic. */
function compareRecordToLive(go: GameObjectBase, record: SerializedStateRecord): void {
    compareRoundTrip(go, record);
}

function deepFreeze(value: unknown): number {
    if (value === null || typeof value !== 'object' || Object.isFrozen(value)) {
        return 0;
    }

    let frozen = 1;
    for (const key of Object.keys(value)) {
        frozen += deepFreeze((value as Record<string, unknown>)[key]);
    }
    Object.freeze(value);
    return frozen;
}

function verifyBuiltMap(manager: GameStateManager, states: Record<string, SerializedStateRecord>): void {
    buildsVerified++;

    const uuids = Object.keys(states);
    if (uuids.length !== manager.registeredObjectCount) {
        recordFailure('count', null, new Error(`[SnapshotMemoVerifier] built map holds ${uuids.length} records but ${manager.registeredObjectCount} objects are registered`));
    }

    for (const uuid of uuids) {
        const record = states[uuid];
        let go: GameObjectBase;
        try {
            go = manager.get<GameObjectBase>(uuid as never);
            compareRecordToLive(go, record);
        } catch (error) {
            recordFailure('build', uuid, error);
        }
        recordsVerifiedAtBuilds++;
        recordsFrozen += deepFreeze(record);
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

function installSnapshotMemoVerifier(): void {
    if (installed) {
        return;
    }
    installed = true;

    const originalBuild = GameStateManager.prototype.buildGameStateForSnapshot;
    GameStateManager.prototype.buildGameStateForSnapshot = function(this: GameStateManager, previous = null) {
        buildDepth++;
        let states: Record<string, SerializedStateRecord>;
        try {
            states = originalBuild.call(this, previous);
        } finally {
            buildDepth--;
        }

        if (suspendedDepth === 0) {
            verifyBuiltMap(this, states);
        }
        return states;
    };

    const originalMemoizedRecordFor = GameStateManager.prototype.memoizedRecordFor;
    GameStateManager.prototype.memoizedRecordFor = function(this: GameStateManager, go, anchorStates, window) {
        const record = originalMemoizedRecordFor.call(this, go, anchorStates, window);
        if (record === undefined || suspendedDepth > 0) {
            return record;
        }

        if (buildDepth > 0) {
            // The build wrapper compares every record of the finished map; this only counts the reuse.
            recordsReusedAtBuilds++;
            return record;
        }

        try {
            compareRecordToLive(go, record);
            prepassRecordsReusedAndVerified++;
        } catch (error) {
            recordFailure('prepass', go.uuid, error);
        }
        return record;
    };

    // Top-level afterEach: allowed in a helper under --parallel (a top-level beforeAll/afterAll is not).
    afterEach(function() {
        specsRun++;

        if (specFailures.length > 0) {
            const first = specFailures[0];
            const count = specFailures.length;
            specFailures = [];
            fail(`[SnapshotMemoVerifier] ${count} memoized-record failure(s); first: site=${first.site} uuid=${first.uuid} field=${first.field}: ${first.message}`);
        }

        // A worker's 'exit' handler was observed lost under --parallel even with a synchronous write (a boot file with no
        // exit file), so the per-worker file is rewritten after every spec: its last line is always the worker's counts as
        // of the last spec that ran, and `specs=` lets a reader sum the workers' files against the suite's executed specs.
        writeStatsFile(finalStateWritten ? 'exit' : 'running');
    });

    pruneStaleRunDirectories();
    try {
        const dir = getRunDir();
        fs.mkdirSync(dir, { recursive: true });
        runDirReady = true;
        fs.writeFileSync(path.join(dir, `pid-${process.pid}.boot`), `${new Date().toISOString()}\n`, 'utf8');
    } catch (error) {
        console.error(`[SnapshotMemoVerifier] pid=${process.pid} failed to write boot marker: ${(error as Error).message}`);
    }

    // The jasmine primary closes a worker's IPC channel (cluster.disconnect) when it has dispatched every spec file and
    // then exits; the worker's own 'exit' event can lose the race with that, but the channel closing reaches the worker
    // first and runs here, so the final `state=exit` line is written on 'disconnect' and again, if it changed, on 'exit'.
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

/**
 * Writes the worker's counts to its own file under the per-invocation directory, synchronously, and returns the line.
 * The directory was created once at load (`runDirReady`), so this is a plain write.
 */
function writeStatsFile(state: 'running' | 'exit'): string {
    const stats = getSnapshotMemoVerifierStats();
    const line =
        `[SnapshotMemoVerifier] pid=${process.pid} specs=${specsRun} builds=${stats.buildsVerified} verified=${stats.recordsVerifiedAtBuilds} ` +
        `reused=${stats.recordsReusedAtBuilds} prepassReused=${stats.prepassRecordsReusedAndVerified} frozen=${stats.recordsFrozen} ` +
        `failures=${stats.failures} expectedMismatches=${stats.expectedMismatches} state=${state}`;
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
            console.error(`[SnapshotMemoVerifier] pid=${process.pid} failed to write the counts file: ${(error as Error).message}`);
        }
    }
    return line;
}

if (!process.env.RUN_PERF_BENCHMARKS) {
    installSnapshotMemoVerifier();
}
