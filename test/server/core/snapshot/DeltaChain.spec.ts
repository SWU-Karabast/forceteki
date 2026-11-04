import { PhaseName, SnapshotType } from '../../../../server/game/core/Constants';
import { DeltaSnapshotContainer } from '../../../../server/game/core/snapshot/container/DeltaSnapshotContainer';
import type { DeltaSnapshotIndex } from '../../../../server/game/core/snapshot/container/DeltaSnapshotIndex';
import { DeltaChainBeyondHorizonError } from '../../../../server/game/core/snapshot/container/DeltaSnapshotIndex';
import type { IDeltaSnapshot, IGameSnapshot, IGetSnapshotSettings } from '../../../../server/game/core/snapshot/SnapshotInterfaces';
import { DeltaSnapshotKind, SnapshotTimepoint } from '../../../../server/game/core/snapshot/SnapshotInterfaces';
import { getDeltaChainVerifierStats, withExpectedDeltaChainFailure } from '../../../helpers/DeltaChainVerifier';

/**
 * P4-E: the delta chain in a real game (`docs/plans/04-delta-snapshots.md`, "As landed in P4-E"): chains across players and phase boundaries,
 * age eviction behind the horizon, and the test-mode verifier's coverage of every rollback type.
 *
 * Most cases drive the snapshot manager the way `ActionWindow` and `ActionPhase` do (`moveToNextTimepoint`, then `takeSnapshot` or
 * `addQuickStartOfActionSnapshot`) so each controls exactly which snapshots exist, and keep a model of the timeline and of each container's
 * pushes to check the plan's invariants after every step:
 * - I1 the index head is the factory's current snapshot;
 * - I2 every snapshot above max(tracking anchor, evictedThroughId) on the live timeline has exactly one delta with its id and timepoint number;
 * - I3 a chain builds to every live delta entry and to every id at or above the horizon;
 * - I4 at most three live action deltas per container, and no full entry released;
 * - I5 evictedThroughId never decreases and is at or below every live delta entry id;
 * - I6 each container's entries, hence its Current and Previous, equal those of a plain push-ordered list fed the same pushes and prunes.
 *
 * Under `ENABLE_UNDO_ALL_TESTS` each case body runs twice (a rollback to the start-of-test snapshot in between), so rollbacks only target
 * snapshots the body took. The verifier helper switches index eviction off for every game in that mode, so the cases that switch it on
 * and observe eviction are pending there; the others run in both modes.
 */

interface ISnapshotFactoryInternals {
    currentActionSnapshot: IGameSnapshot;
}
interface ISnapshotManagerInternals {
    snapshotFactory: ISnapshotFactoryInternals;
    quickSnapshots: Map<string, DeltaSnapshotContainer>;
}
interface IIndexInternals {
    deltasById: Map<number, IDeltaSnapshot>;
}
interface ITimelineEntry {
    id: number;
    timepointNumber: number;
}
interface IModel {
    game;
    playerIds: string[];
    timeline: ITimelineEntry[];
    containerIds: Map<string, number[]>;
    fullIds: Map<string, number[]>;
    lastFloor: number;
}

const integrationWithUndo = integration as unknown as (
    definitions: (contextRef: SwuTestContextRef) => void,
    enableUndo: boolean
) => void;

const undoReplayEnabled = process.env.ENABLE_UNDO_ALL_TESTS === 'true';

/** `expect` with a failure label. */
function check<T>(actual: T, label: string): jasmine.Matchers<T> {
    return expect(actual).withContext(label);
}

function managerOf(game): ISnapshotManagerInternals {
    return game.snapshotManager as unknown as ISnapshotManagerInternals;
}

function indexOf(game): DeltaSnapshotIndex {
    return game.snapshotManager.deltaSnapshotIndex;
}

function currentSnapshot(game): IGameSnapshot {
    return managerOf(game).snapshotFactory.currentActionSnapshot;
}

function summariesOf(game, playerId: string) {
    return managerOf(game).quickSnapshots.get(playerId)?.getEntrySummaries() ?? [];
}

function createModel(context): IModel {
    const game = context.game;
    const playerIds = [context.player1.id, context.player2.id];
    const containerIds = new Map<string, number[]>();
    const fullIds = new Map<string, number[]>();
    for (const playerId of playerIds) {
        const summaries = summariesOf(game, playerId);
        containerIds.set(playerId, summaries.map((entry) => entry.snapshotId));
        fullIds.set(playerId, summaries.filter((entry) => entry.type === 'full').map((entry) => entry.snapshotId));
    }

    return {
        game,
        playerIds,
        timeline: [{ id: currentSnapshot(game).id, timepointNumber: currentSnapshot(game).timepointNumber }],
        containerIds,
        fullIds,
        lastFloor: indexOf(game).evictedThroughId
    };
}

function recordSnapshot(model: IModel): void {
    const snapshot = currentSnapshot(model.game);
    model.timeline.push({ id: snapshot.id, timepointNumber: snapshot.timepointNumber });
}

function moveTo(model: IModel, timepoint: SnapshotTimepoint): void {
    model.game.snapshotManager.moveToNextTimepoint(timepoint);
    recordSnapshot(model);
}

/** A new action-phase Action timepoint whose snapshot `playerId` takes. */
function takeAction(model: IModel, playerId: string): number {
    moveTo(model, SnapshotTimepoint.Action);
    model.game.snapshotManager.takeSnapshot({ type: SnapshotType.Action, playerId });
    const id = currentSnapshot(model.game).id;
    model.containerIds.get(playerId).push(id);
    return id;
}

/** A new start-of-action-phase timepoint (a bridge); every player in `playerIds` gets a full quick entry for it. */
function takeStartOfPhase(model: IModel, playerIds: string[]): number {
    moveTo(model, SnapshotTimepoint.StartOfPhase);
    model.game.snapshotManager.takeSnapshot({ type: SnapshotType.Phase, phaseName: PhaseName.Action });
    const id = currentSnapshot(model.game).id;
    for (const playerId of playerIds) {
        model.game.snapshotManager.addQuickStartOfActionSnapshot(playerId);
        model.containerIds.get(playerId).push(id);
        model.fullIds.get(playerId).push(id);
    }
    return id;
}

/** A restored rollback; the model drops what it discarded. */
function rollback(model: IModel, settings: IGetSnapshotSettings, expectedTargetId: number): void {
    expect(model.game.snapshotManager.rollbackTo(settings).success).toBeTrue();
    expect(currentSnapshot(model.game).id).toBe(expectedTargetId);

    const position = model.timeline.findIndex((entry) => entry.id === expectedTargetId);
    expect(position).toBeGreaterThanOrEqual(0);
    model.timeline.length = position + 1;
    for (const playerId of model.playerIds) {
        model.containerIds.set(playerId, model.containerIds.get(playerId).filter((id) => id <= expectedTargetId));
        model.fullIds.set(playerId, model.fullIds.get(playerId).filter((id) => id <= expectedTargetId));
    }
}

function buildChainTo(game, id: number, timepointNumber: number): IDeltaSnapshot[] {
    return indexOf(game).buildChain(id, timepointNumber);
}

function expectBeyondHorizon(body: () => unknown): DeltaChainBeyondHorizonError {
    let thrown: unknown;
    try {
        body();
    } catch (error) {
        thrown = error;
    }
    expect(thrown).toBeInstanceOf(DeltaChainBeyondHorizonError);
    return thrown as DeltaChainBeyondHorizonError;
}

/** The plan's invariants I1 to I6. */
function expectInvariants(model: IModel, label: string): void {
    const game = model.game;
    const index = indexOf(game);
    const floor = index.evictedThroughId;
    const anchor = index.trackingAnchorId ?? -1;
    const lowest = Math.max(floor, anchor);
    const timelineById = new Map(model.timeline.map((entry) => [entry.id, entry.timepointNumber]));

    // I1
    check(index.headSnapshotId, `${label} I1`).toBe(currentSnapshot(game).id);

    // I2
    for (const entry of model.timeline) {
        if (entry.id > lowest) {
            const delta = index.get(entry.id);
            check(delta, `${label} I2 delta for ${entry.id}`).toBeDefined();
            check(delta?.timepointNumber, `${label} I2 timepoint of ${entry.id}`).toBe(entry.timepointNumber);
        }
    }
    const modelStart = model.timeline[0].id;
    for (const id of index.getIds()) {
        check(id <= modelStart || timelineById.has(id), `${label} I2 index id ${id} is on the timeline`).toBeTrue();
        check(id > floor, `${label} I2 index id ${id} is above the floor ${floor}`).toBeTrue();
    }

    // I3: every live delta entry and every timeline id at or above the horizon
    for (const playerId of model.playerIds) {
        for (const entry of summariesOf(game, playerId)) {
            if (entry.type === 'delta' && entry.live && timelineById.has(entry.snapshotId)) {
                expect(() => buildChainTo(game, entry.snapshotId, timelineById.get(entry.snapshotId))).withContext(`${label} I3 live entry ${entry.snapshotId}`).not.toThrow();
            }
        }
    }
    for (const entry of model.timeline) {
        if (entry.id >= lowest) {
            expect(() => buildChainTo(game, entry.id, entry.timepointNumber)).withContext(`${label} I3 id ${entry.id}`).not.toThrow();
        }
    }

    for (const playerId of model.playerIds) {
        const summaries = summariesOf(game, playerId);

        // I4
        const liveDeltas = summaries.filter((entry) => entry.type === 'delta' && entry.live);
        check(liveDeltas.length <= DeltaSnapshotContainer.MaxDeltaEntries, `${label} I4 live deltas of ${playerId}`).toBeTrue();
        const fulls = summaries.filter((entry) => entry.type === 'full');
        check(fulls.map((entry) => entry.snapshotId), `${label} I4 full entries of ${playerId}`).toEqual(model.fullIds.get(playerId));
        check(fulls.every((entry) => entry.live), `${label} I4 full entries live for ${playerId}`).toBeTrue();

        // I5
        check(liveDeltas.every((entry) => entry.snapshotId >= floor), `${label} I5 floor ${floor} below live entries of ${playerId}`).toBeTrue();

        // I6
        check(summaries.map((entry) => entry.snapshotId), `${label} I6 ids of ${playerId}`).toEqual(model.containerIds.get(playerId));
    }
    check(floor >= model.lastFloor, `${label} I5 floor ${floor} never decreases from ${model.lastFloor}`).toBeTrue();
    model.lastFloor = floor;
}

describe('Delta chain', function() {
    integrationWithUndo(function(contextRef) {
        async function setupBoard() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: { groundArena: ['wampa', 'battlefield-marine'] },
                player2: { groundArena: ['atst'], spaceArena: ['cartel-spacer'] }
            });
            return contextRef.context;
        }

        function attack(player, attacker, target): void {
            player.clickCard(attacker);
            player.clickCard(target);
        }

        /** Alternating P1, P2 action snapshots, checking the invariants after each. */
        function alternate(model: IModel, rounds: number, label: string): void {
            for (let i = 0; i < rounds; i++) {
                takeAction(model, model.playerIds[0]);
                expectInvariants(model, `${label} p1 #${i}`);
                takeAction(model, model.playerIds[1]);
                expectInvariants(model, `${label} p2 #${i}`);
            }
        }

        function enableEviction(game): void {
            game.snapshotManager.setDeltaIndexEvictionEnabled(true);
        }

        it('builds a chain with both players\' action deltas and a bridge across a phase boundary, and the full rollback to its target still lands there', async function() {
            const context = await setupBoard();
            const game = context.game;
            const index = indexOf(game);

            attack(context.player1, context.wampa, context.p2Base);
            attack(context.player2, context.atst, context.p1Base);

            // P1 to act: this snapshot was taken in the body, and a manual snapshot keeps it restorable after the phase ends.
            const targetId = currentSnapshot(game).id;
            const targetTimepointNumber = currentSnapshot(game).timepointNumber;
            const manualSnapshotId = contextRef.snapshot.takeManualSnapshot(context.player1Object);
            expect(manualSnapshotId).toBe(targetId);

            attack(context.player1, context.battlefieldMarine, context.p2Base);
            attack(context.player2, context.cartelSpacer, context.p1Base);
            context.moveToNextActionPhase();

            const chain = buildChainTo(game, targetId, targetTimepointNumber);
            const headTimepointNumber = currentSnapshot(game).timepointNumber;

            expect(chain.length).toBe(headTimepointNumber - targetTimepointNumber);
            expect(chain[0].id).toBe(currentSnapshot(game).id);
            expect(chain[chain.length - 1].anchorSnapshotId).toBe(targetId);
            chain.forEach((delta, i) => {
                if (i > 0) {
                    check(delta.timepointNumber, `delta ${delta.id}`).toBe(chain[i - 1].timepointNumber - 1);
                    check(delta.id < chain[i - 1].id, `delta ${delta.id} is older than the delta before it`).toBeTrue();
                }
            });

            expect(chain.some((delta) => delta.kind === DeltaSnapshotKind.Bridge)).toBeTrue();
            const actionIds = new Set(chain.filter((delta) => delta.kind === DeltaSnapshotKind.Action).map((delta) => delta.id));
            const owners = [context.player1.id, context.player2.id].filter((playerId) =>
                summariesOf(game, playerId).some((entry) => entry.type === 'delta' && actionIds.has(entry.snapshotId)));
            expect(owners.length).toBe(2);

            expect(game.snapshotManager.rollbackTo({ type: SnapshotType.Manual, playerId: context.player1Object.id, snapshotId: manualSnapshotId }).success).toBeTrue();
            expect(currentSnapshot(game).id).toBe(targetId);
            expect(index.headSnapshotId).toBe(targetId);
        });

        it('keeps all of the plan\'s invariants across actions past the cap, a quick rollback that prunes, more actions and a phase boundary with a zero-mutation bridge', async function() {
            const context = await setupBoard();
            if (undoReplayEnabled) {
                pending('this case enables index eviction, which the whole-suite undo replay keeps off');
            }
            const game = context.game;
            enableEviction(game);
            const index = indexOf(game);
            const model = createModel(context);
            const [p1, p2] = model.playerIds;
            expectInvariants(model, 'start');

            alternate(model, 6, 'phase 1');
            expect(index.evictedThroughId).toBeGreaterThan(-1);

            // A quick rollback: P1 is at an action window, so its quick point is the Previous entry, one of its two newest.
            const previousP1 = model.containerIds.get(p1).slice(-2)[0];
            rollback(model, { type: SnapshotType.Quick, playerId: p1 }, previousP1);
            expectInvariants(model, 'after quick rollback');
            expect(index.getIds().every((id) => id <= previousP1)).toBeTrue();

            alternate(model, 4, 'after rollback');

            // A phase boundary: two start-of-phase timepoints in a row, the second with nothing written in between.
            takeStartOfPhase(model, [p1, p2]);
            expectInvariants(model, 'boundary');
            moveTo(model, SnapshotTimepoint.StartOfPhase);
            expectInvariants(model, 'zero-mutation bridge');
            const zeroMutation = index.get(currentSnapshot(game).id);
            expect(zeroMutation.kind).toBe(DeltaSnapshotKind.Bridge);
            expect(zeroMutation.changedFields.size).toBe(0);
            expect(zeroMutation.createdObjectUuids.size).toBe(0);

            alternate(model, 4, 'next phase');
        });

        it('advances the horizon to the oldest live delta entry at every release and leaves no hole', async function() {
            const context = await setupBoard();
            if (undoReplayEnabled) {
                pending('this case enables index eviction, which the whole-suite undo replay keeps off');
            }
            const game = context.game;
            enableEviction(game);
            const index = indexOf(game);
            const model = createModel(context);
            const countReleased = () => model.playerIds.reduce((total, playerId) => total + summariesOf(game, playerId).filter((entry) => entry.type === 'delta' && !entry.live).length, 0);
            const oldestLive = () => Math.min(...model.playerIds.map((playerId) => summariesOf(game, playerId).find((entry) => entry.type === 'delta' && entry.live)?.snapshotId ?? Infinity));

            let released = countReleased();
            let expectedFloor = index.evictedThroughId;
            for (let i = 0; i < 10; i++) {
                for (const playerId of model.playerIds) {
                    takeAction(model, playerId);

                    if (countReleased() > released) {
                        released = countReleased();
                        expectedFloor = oldestLive();
                    }
                    check(index.evictedThroughId, `floor after step ${i} of ${playerId}`).toBe(expectedFloor);
                    expectInvariants(model, `step ${i} of ${playerId}`);
                }
            }

            expect(index.evictedThroughId).toBeGreaterThan(model.timeline[0].id);
        });

        it('rejects a target below the horizon, and a manual rollback below it restores, prunes the index to the target and leaves the floor alone', async function() {
            const context = await setupBoard();
            if (undoReplayEnabled) {
                pending('this case enables index eviction, which the whole-suite undo replay keeps off');
            }
            const game = context.game;
            enableEviction(game);
            const index = indexOf(game);
            const model = createModel(context);
            const [p1] = model.playerIds;

            // An early manual snapshot, taken at a snapshot that is not the tracking anchor.
            takeAction(model, p1);
            const manualId = currentSnapshot(game).id;
            const manualTimepointNumber = currentSnapshot(game).timepointNumber;
            const manualSnapshotId = contextRef.snapshot.takeManualSnapshot(context.player1Object);
            expect(manualSnapshotId).toBe(manualId);

            for (let i = 0; i < 12 && index.evictedThroughId <= manualId; i++) {
                alternate(model, 1, `advance ${i}`);
            }
            const floorBefore = index.evictedThroughId;
            expect(floorBefore).toBeGreaterThan(manualId);

            // An older target is rejected as beyond the horizon, not as a hole.
            const rejection = expectBeyondHorizon(() => buildChainTo(game, manualId, manualTimepointNumber));
            expect(rejection.targetSnapshotId).toBe(manualId);
            expect(rejection.evictedThroughId).toBe(floorBefore);

            // The full rollback to it still restores; the verifier counts it as a legal beyond-horizon target.
            const beyondHorizonBefore = getDeltaChainVerifierStats().beyondHorizon;
            rollback(model, { type: SnapshotType.Manual, playerId: context.player1Object.id, snapshotId: manualId }, manualId);
            expect(getDeltaChainVerifierStats().beyondHorizon).toBe(beyondHorizonBefore + 1);
            expect(index.headSnapshotId).toBe(manualId);
            expect(index.getIds().every((id) => id <= manualId)).toBeTrue();
            expect(index.evictedThroughId).toBe(floorBefore);

            // More actions continue from the restored snapshot.
            alternate(model, 2, 'after the manual rollback');
            const firstNew = model.timeline[model.timeline.findIndex((entry) => entry.id === manualId) + 1];
            const chain = buildChainTo(game, firstNew.id, firstNew.timepointNumber);
            expect(chain.length).toBe(currentSnapshot(game).timepointNumber - firstNew.timepointNumber);
            const toManual = buildChainTo(game, manualId, manualTimepointNumber);
            expect(toManual.length).toBe(chain.length + 1);
            expect(toManual[toManual.length - 1].anchorSnapshotId).toBe(manualId);
            expect(index.evictedThroughId).toBe(floorBefore);

            // A pre-rollback id below the floor is still beyond the horizon.
            expectBeyondHorizon(() => buildChainTo(game, manualId - 1, manualTimepointNumber - 1));
        });

        it('does not let a manual snapshot pin the index', async function() {
            const context = await setupBoard();
            if (undoReplayEnabled) {
                pending('this case enables index eviction, which the whole-suite undo replay keeps off');
            }
            const game = context.game;
            enableEviction(game);
            const index = indexOf(game);
            const model = createModel(context);

            takeAction(model, model.playerIds[0]);
            const manualId = currentSnapshot(game).id;
            expect(contextRef.snapshot.takeManualSnapshot(context.player1Object)).toBe(manualId);

            alternate(model, 8, 'past the manual snapshot');

            expect(index.evictedThroughId).toBeGreaterThan(manualId);
            expect(index.get(manualId)).toBeUndefined();
            expect(game.snapshotManager.countAvailableManualSnapshots(context.player1.id)).toBeGreaterThan(0);
        });

        it('drops nothing while eviction is disabled, so the chain to the first snapshot still builds', async function() {
            const context = await setupBoard();
            const game = context.game;
            const manager = game.snapshotManager;
            const index = indexOf(game);
            const model = createModel(context);
            // Restore what was there on entry: the default is on, but the whole-suite undo replay turns it off before the body runs.
            const enabledOnEntry = manager.isDeltaIndexEvictionEnabled;

            try {
                manager.setDeltaIndexEvictionEnabled(false);
                const floorBefore = index.evictedThroughId;
                alternate(model, 6, 'eviction off');

                // Entries from before the body may have been evicted while eviction was still on during setup; only this case's own are checked.
                const released = model.playerIds.flatMap((playerId) => summariesOf(game, playerId).filter((entry) => entry.type === 'delta' && !entry.live && entry.snapshotId > model.timeline[0].id));
                expect(released.length).toBeGreaterThan(0);
                expect(index.evictedThroughId).toBe(floorBefore);
                for (const entry of released) {
                    check(index.get(entry.snapshotId), `released entry ${entry.snapshotId} still has its delta`).toBeDefined();
                }

                const oldest = index.get(index.getIds()[0]);
                expect(oldest.anchorSnapshotId).toBe(index.trackingAnchorId);
                const chain = buildChainTo(game, index.trackingAnchorId, oldest.timepointNumber - 1);
                expect(chain.length).toBe(index.size);
            } finally {
                manager.setDeltaIndexEvictionEnabled(enabledOnEntry);
            }
        });

        it('keeps the index within a bound the containers set', async function() {
            const context = await setupBoard();
            if (undoReplayEnabled) {
                pending('this case enables index eviction, which the whole-suite undo replay keeps off');
            }
            const game = context.game;
            enableEviction(game);
            const index = indexOf(game);
            const model = createModel(context);

            alternate(model, 12, 'long run');

            // Alternating pushes: a container's oldest live delta is at most 2 * MaxDeltaEntries snapshots back, and the horizon is the older of the two containers'.
            const bound = 2 * (DeltaSnapshotContainer.MaxDeltaEntries + 1);
            expect(index.size).toBeLessThanOrEqual(bound);
            expect(index.size).toBeLessThan(model.timeline.length);
            expect(index.getIds().every((id) => id > index.evictedThroughId)).toBeTrue();
            const oldestLive = Math.min(...model.playerIds.map((playerId) => summariesOf(game, playerId).find((entry) => entry.type === 'delta' && entry.live).snapshotId));
            expect(index.evictedThroughId).toBeLessThanOrEqual(oldestLive);
        });

        describe('the verifier', function() {
            function checkedRollbacks(): number {
                const stats = getDeltaChainVerifierStats();
                return stats.chainsChecked + stats.beyondHorizon;
            }

            it('checks a chain for one restored Quick, Action, Phase and Manual rollback each', async function() {
                const context = await setupBoard();
                const game = context.game;
                const model = createModel(context);
                const [p1] = model.playerIds;
                alternate(model, 2, 'build up');

                // Quick: P1's Previous entry.
                let before = checkedRollbacks();
                rollback(model, { type: SnapshotType.Quick, playerId: p1 }, model.containerIds.get(p1).slice(-2)[0]);
                expect(checkedRollbacks() - before).toBe(1);

                // Action: P1's previous action snapshot.
                alternate(model, 2, 'between');
                before = checkedRollbacks();
                rollback(model, { type: SnapshotType.Action, playerId: p1, actionOffset: -1 }, model.containerIds.get(p1).slice(-2)[0]);
                expect(checkedRollbacks() - before).toBe(1);

                // Phase: the start-of-phase snapshot this case took.
                const phaseStartId = takeStartOfPhase(model, [p1]);
                alternate(model, 2, 'after the phase start');
                before = checkedRollbacks();
                rollback(model, { type: SnapshotType.Phase, phaseName: PhaseName.Action }, phaseStartId);
                expect(checkedRollbacks() - before).toBe(1);

                // Manual.
                alternate(model, 1, 'before the manual snapshot');
                const manualId = currentSnapshot(game).id;
                expect(contextRef.snapshot.takeManualSnapshot(context.player1Object)).toBe(manualId);
                alternate(model, 2, 'after the manual snapshot');
                before = checkedRollbacks();
                rollback(model, { type: SnapshotType.Manual, playerId: context.player1Object.id, snapshotId: manualId }, manualId);
                expect(checkedRollbacks() - before).toBe(1);
            });

            it('reports exactly one chain failure naming the hole when an intermediate delta is missing, and still prunes to the target', async function() {
                const context = await setupBoard();
                const game = context.game;
                const index = indexOf(game);
                const model = createModel(context);
                const [p1, p2] = model.playerIds;

                takeAction(model, p1);
                const targetId = currentSnapshot(game).id;
                expect(contextRef.snapshot.takeManualSnapshot(context.player1Object)).toBe(targetId);
                takeAction(model, p2);
                const holeId = currentSnapshot(game).id;
                takeAction(model, p1);
                takeAction(model, p2);
                (index as unknown as IIndexInternals).deltasById.delete(holeId);

                const expectedBefore = getDeltaChainVerifierStats().expectedFailures;
                let rolledBack = false;
                const failures = withExpectedDeltaChainFailure(() => {
                    rolledBack = game.snapshotManager.rollbackTo({ type: SnapshotType.Manual, playerId: context.player1Object.id, snapshotId: targetId }).success;
                });

                expect(rolledBack).toBeTrue();
                expect(failures.length).toBe(1);
                expect(failures[0].site).toBe('chain');
                expect(failures[0].snapshotId).toBe(targetId);
                expect(failures[0].message).toContain(`no delta for snapshot id ${holeId}`);
                expect(getDeltaChainVerifierStats().expectedFailures).toBe(expectedBefore + 1);
                expect(index.headSnapshotId).toBe(targetId);
                expect(index.getIds().every((id) => id <= targetId)).toBeTrue();
            });
        });
    }, true);

    // The harness runs `integration()` at UndoMode.Disabled unless the whole suite is replayed under undo, so the
    // disabled case needs the plain form.
    integration(function(contextRef) {
        it('has no head to build a chain from in a game with undo disabled, and says so rather than returning an empty chain', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: { groundArena: ['wampa'] },
                player2: { groundArena: ['atst'] }
            });
            if (undoReplayEnabled) {
                pending('the whole suite is replayed with undo enabled');
            }
            const { context } = contextRef;

            expect(indexOf(context.game).headSnapshotId).toBeNull();
            expect(() => buildChainTo(context.game, 0, 0)).toThrowError(/index has no head/);
        });
    });
});
