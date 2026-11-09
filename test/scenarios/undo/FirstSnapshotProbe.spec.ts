import { execFileSync } from 'node:child_process';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { GameStateManager } from '../../../server/game/core/snapshot/GameStateManager';
import { SnapshotFactory } from '../../../server/game/core/snapshot/SnapshotFactory';
import { SnapshotTimepoint } from '../../../server/game/core/snapshot/SnapshotInterfaces';
import type { IBenchmarkResult } from './benchmark/BenchmarkHarness';
import { measureBenchmarkAsync, startGcRecording, stopGcRecording } from './benchmark/BenchmarkHarness';
import { benchmarkScenarios } from './benchmark/BenchmarkScenarios';

/**
 * First-snapshot probe for Plan 8 R-0 (`docs/plans/08-performance-regressions.md`).
 *
 * Times the one public call that builds the first snapshot of a tracking run, `SnapshotManager.moveToNextTimepoint(Action)`,
 * on the three unchanged 40-card benchmark scenarios, plus a companion row (the same call after a write, which is a hollow
 * checkpoint on a branch that has delta snapshots) and the snapshot counts of a short scripted game. It uses only API that
 * exists on `main` and on this branch, so the same file and the two benchmark helper files it imports run unchanged against
 * either; `scripts/run-first-snapshot-probe.js` runs it alone against a built worktree and stamps provenance.
 *
 * Pending unless `RUN_FIRST_SNAPSHOT_PROBE=1`, and it refuses to run without `RUN_PERF_BENCHMARKS=1`: the branch's test-only
 * verifiers wrap the snapshot build in every jasmine worker unless that switch is set, and would roughly triple the first-build time.
 */

const PROBE_TIMED_ITERATIONS = 400;
const PROBE_WARMUP_ITERATIONS = 20;
const SCRIPTED_GAME_ROUNDS = 2;
const SCRIPTED_ATTACKS_PER_PLAYER_PER_ROUND = 3;

interface IProbeSnapshotManager {
    currentSnapshotId: number | null;
    snapshotFactory: { currentActionSnapshot?: { hollow?: boolean } };
    clearAllSnapshots(): void;
    moveToNextTimepoint(timepoint: SnapshotTimepoint): void;
    setUndoConfirmationRequired(enabled: boolean): void;
}

interface IProbeObjectRegistry {
    allGameObjects: unknown[];
    lastGameObjectId: number;
}

interface IObjectCounts {
    liveObjectCount: number;
    lastGameObjectId: number;
}

interface IProbeRow {
    benchmark: string;
    iterations: number;
    warmupIterations: number;
    avgMs: number;
    p50Ms: number;
    p95Ms: number;
    minMs: number;
    maxMs: number;
    gcCount: number;
    gcMs: number;
}

interface IProbeScenarioReport {
    scenario: string;
    firstSnapshot: IProbeRow | null;
    withWrites: (IProbeRow & { hollowSnapshots: number; snapshotsTaken: number }) | null;
    objectsAfterSetup: IObjectCounts | null;
    objectsAfterFirstTimedCall: IObjectCounts | null;
    violations: { undoDisabled: number; nullSnapshotId: number; hollowFirstSnapshot: number } | null;
}

interface IScriptedGameReport {
    snapshotsTaken: number;
    fullBuilds: number;
    hollowSnapshots: number;
    byTimepointAndPhase: Record<string, number>;
    finalPhase: string;
    p1BaseDamage: number;
    p2BaseDamage: number;
}

const runProbe = process.env.RUN_FIRST_SNAPSHOT_PROBE === '1';
const describeProbe = runProbe ? describe : xdescribe;

const flagNames = [
    'ENABLE_PARITY_HARNESS',
    'ENABLE_UNDO_ALL_TESTS',
    'MEASURE_SAVE_DEGRADATION',
    'FIRST_SNAPSHOT_PROBE_ALLOW_VERIFIERS',
    'RUN_PERF_BENCHMARKS'
];

let heapUsedBytesAtStart: number | null = null;
const scenarioReports: IProbeScenarioReport[] = [];
let scriptedGameReport: IScriptedGameReport | null = null;

function toRow(result: IBenchmarkResult): IProbeRow {
    return {
        benchmark: result.benchmark,
        iterations: result.iterations,
        warmupIterations: PROBE_WARMUP_ITERATIONS,
        avgMs: result.avgMs,
        p50Ms: result.p50Ms,
        p95Ms: result.p95Ms,
        minMs: result.minMs,
        maxMs: result.maxMs,
        gcCount: result.gc.count,
        gcMs: result.gc.durationMs
    };
}

function readObjectCounts(game): IObjectCounts {
    const registry = game.gameObjectManager as unknown as IProbeObjectRegistry;
    return { liveObjectCount: registry.allGameObjects.length, lastGameObjectId: registry.lastGameObjectId };
}

function readOptional(read: () => string): string | null {
    try {
        return read();
    } catch {
        return null;
    }
}

function buildEnvironment() {
    const cardDirectory = path.resolve(process.cwd(), 'test', 'json', 'Card');
    const cardFileCount = fs.existsSync(cardDirectory) ? fs.readdirSync(cardDirectory).length : null;
    const hashFile = path.resolve(process.cwd(), 'test', 'json', 'card-data-hash.txt');
    const flags: Record<string, boolean> = {};
    for (const name of flagNames) {
        flags[name] = process.env[name] !== undefined;
    }

    return {
        capturedAt: new Date().toISOString(),
        gitCommit: readOptional(() => execFileSync('git', ['rev-parse', 'HEAD'], { cwd: process.cwd(), encoding: 'utf8' }).trim()),
        nodeVersion: process.version,
        v8Version: process.versions.v8,
        platform: process.platform,
        arch: process.arch,
        cpuModel: os.cpus()[0]?.model ?? null,
        cpuCount: os.cpus().length,
        totalMemoryBytes: os.totalmem(),
        exposeGc: typeof global.gc === 'function',
        cardFileCount,
        cardDataHash: fs.existsSync(hashFile) ? fs.readFileSync(hashFile, 'utf8').trim() : null,
        heapUsedBytesAtStart,
        flags
    };
}

function writeReport(): void {
    const reportPath = process.env.FIRST_SNAPSHOT_PROBE_REPORT_PATH;
    if (!reportPath) {
        return;
    }

    const report = {
        schemaVersion: 1,
        probe: 'p8-r0-first-snapshot',
        environment: buildEnvironment(),
        scenarios: scenarioReports,
        scriptedGame: scriptedGameReport
    };

    fs.mkdirSync(path.dirname(reportPath), { recursive: true });
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2) + '\n', 'utf8');
}

integration(function(contextRef) {
    describeProbe('FirstSnapshotProbe', function() {
        beforeAll(function() {
            if (typeof global.gc !== 'function') {
                throw new Error('FirstSnapshotProbe needs --expose-gc; run it through scripts/run-first-snapshot-probe.js.');
            }
            if (process.env.RUN_PERF_BENCHMARKS !== '1' && process.env.FIRST_SNAPSHOT_PROBE_ALLOW_VERIFIERS !== '1') {
                throw new Error('FirstSnapshotProbe needs RUN_PERF_BENCHMARKS=1: the branch\'s verifiers wrap the snapshot build unless benchmark mode is set, which inflates the first-build time.');
            }
            expect(process.env.ENABLE_PARITY_HARNESS).toBeUndefined();
            expect(process.env.ENABLE_UNDO_ALL_TESTS).toBeUndefined();
            expect(process.env.MEASURE_SAVE_DEGRADATION).toBeUndefined();

            global.gc();
            heapUsedBytesAtStart = process.memoryUsage().heapUsed;
            startGcRecording();
        });

        afterEach(function() {
            writeReport();
        });

        afterAll(function() {
            stopGcRecording();
            writeReport();
        });

        for (const scenario of benchmarkScenarios.filter((candidate) => candidate.name.startsWith('forty-cards'))) {
            it(scenario.name, async function() {
                const scenarioReport: IProbeScenarioReport = {
                    scenario: scenario.name,
                    firstSnapshot: null,
                    withWrites: null,
                    objectsAfterSetup: null,
                    objectsAfterFirstTimedCall: null,
                    violations: null
                };
                scenarioReports.push(scenarioReport);

                await contextRef.setupTestAsync(scenario.setup);
                const { context } = contextRef;
                const manager = context.game.snapshotManager as unknown as IProbeSnapshotManager;

                // The game is built with undo disabled, where the call under test returns immediately; pin the mode first.
                manager.setUndoConfirmationRequired(false);
                scenarioReport.objectsAfterSetup = readObjectCounts(context.game);

                // No clearAllSnapshots before the first call: nothing is tracking yet, so the first call is already a first snapshot.
                const violations = { undoDisabled: 0, nullSnapshotId: 0, hollowFirstSnapshot: 0 };
                let callsSeen = 0;
                const firstResult = await measureBenchmarkAsync('manager', 'moveToNextTimepoint(Action)', PROBE_TIMED_ITERATIONS, () => {
                    manager.moveToNextTimepoint(SnapshotTimepoint.Action);
                }, {
                    warmupIterations: PROBE_WARMUP_ITERATIONS,
                    afterEachIteration: () => {
                        callsSeen++;
                        if (callsSeen === 1) {
                            scenarioReport.objectsAfterFirstTimedCall = readObjectCounts(context.game);
                        }
                        if (!context.game.isUndoEnabled) {
                            violations.undoDisabled++;
                        }
                        if (manager.currentSnapshotId == null) {
                            violations.nullSnapshotId++;
                        }
                        if (manager.snapshotFactory.currentActionSnapshot?.hollow === true) {
                            violations.hollowFirstSnapshot++;
                        }
                        manager.clearAllSnapshots();
                    }
                });
                scenarioReport.firstSnapshot = toRow(firstResult);
                scenarioReport.violations = violations;
                expect(violations.undoDisabled).toBe(0);
                expect(violations.nullSnapshotId).toBe(0);
                expect(violations.hollowFirstSnapshot).toBe(0);

                manager.clearAllSnapshots();
                manager.moveToNextTimepoint(SnapshotTimepoint.Action);
                const toggleCards = [...context.player1Object.getArenaCards(), ...context.player2Object.getArenaCards()]
                    .filter((card) => card.isUnit() && card.canBeExhausted())
                    .slice(0, scenario.mutatedCardLimit ?? Number.MAX_SAFE_INTEGER);
                let hollowSnapshots = 0;
                const companionResult = await measureBenchmarkAsync('manager', 'moveToNextTimepoint(Action, withWrites)', PROBE_TIMED_ITERATIONS, () => {
                    manager.moveToNextTimepoint(SnapshotTimepoint.Action);
                }, {
                    warmupIterations: PROBE_WARMUP_ITERATIONS,
                    beforeEachIteration: () => {
                        for (const card of toggleCards) {
                            card.exhausted = !card.exhausted;
                        }
                    },
                    afterEachIteration: () => {
                        if (manager.snapshotFactory.currentActionSnapshot?.hollow === true) {
                            hollowSnapshots++;
                        }
                    }
                });
                scenarioReport.withWrites = {
                    ...toRow(companionResult),
                    hollowSnapshots,
                    snapshotsTaken: PROBE_TIMED_ITERATIONS + PROBE_WARMUP_ITERATIONS
                };
            });
        }

        // Last, and it is the only spec that wraps a prototype, so no timed loop runs after a prototype swap.
        it('scripted game', async function() {
            const scenario = benchmarkScenarios.find((candidate) => candidate.name === 'forty-cards-per-player');
            await contextRef.setupTestAsync(scenario.setup);
            const { context } = contextRef;
            const manager = context.game.snapshotManager as unknown as IProbeSnapshotManager;
            manager.setUndoConfirmationRequired(false);

            let snapshotsTaken = 0;
            let fullBuilds = 0;
            let hollowSnapshots = 0;
            const byTimepointAndPhase: Record<string, number> = {};

            const originalBuild = GameStateManager.prototype.buildGameStateForSnapshot;
            GameStateManager.prototype.buildGameStateForSnapshot = function(this: GameStateManager, ...args: Parameters<typeof originalBuild>) {
                fullBuilds++;
                return originalBuild.apply(this, args);
            };

            const originalCreate = SnapshotFactory.prototype.createSnapshotForCurrentTimepoint;
            SnapshotFactory.prototype.createSnapshotForCurrentTimepoint = function(this: SnapshotFactory, ...args: Parameters<typeof originalCreate>) {
                snapshotsTaken++;
                const bucket = `${args[0]}/${context.game.currentPhase}`;
                byTimepointAndPhase[bucket] = (byTimepointAndPhase[bucket] ?? 0) + 1;
                const returned = originalCreate.apply(this, args);
                if ((this as unknown as IProbeSnapshotManager['snapshotFactory']).currentActionSnapshot?.hollow === true) {
                    hollowSnapshots++;
                }
                return returned;
            };

            const attack = (player, unit, opposingBase) => {
                player.clickCard(unit);
                const targets = player.currentActionTargets;
                player.clickCard(targets.includes(opposingBase) ? opposingBase : targets[0]);
            };

            try {
                for (let round = 0; round < SCRIPTED_GAME_ROUNDS; round++) {
                    const player1Units = context.player1.spaceArenaUnits.slice(0, SCRIPTED_ATTACKS_PER_PLAYER_PER_ROUND);
                    const player2Units = context.player2.spaceArenaUnits.slice(0, SCRIPTED_ATTACKS_PER_PLAYER_PER_ROUND);
                    for (let attackIndex = 0; attackIndex < SCRIPTED_ATTACKS_PER_PLAYER_PER_ROUND; attackIndex++) {
                        attack(context.player1, player1Units[attackIndex], context.p2Base);
                        attack(context.player2, player2Units[attackIndex], context.p1Base);
                    }
                    context.moveToNextActionPhase();
                }
            } finally {
                GameStateManager.prototype.buildGameStateForSnapshot = originalBuild;
                SnapshotFactory.prototype.createSnapshotForCurrentTimepoint = originalCreate;
            }

            scriptedGameReport = {
                snapshotsTaken,
                fullBuilds,
                hollowSnapshots,
                byTimepointAndPhase,
                finalPhase: context.game.currentPhase,
                p1BaseDamage: context.p1Base.damage,
                p2BaseDamage: context.p2Base.damage
            };
            expect(snapshotsTaken).toBeGreaterThan(0);
        });
    });
});
