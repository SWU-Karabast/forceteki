import { PhaseName, SnapshotType } from '../../../../server/game/core/Constants';
import { GameStateManager } from '../../../../server/game/core/snapshot/GameStateManager';
import type { DeltaSnapshotContainer, IQuickEntrySummary } from '../../../../server/game/core/snapshot/container/DeltaSnapshotContainer';
import { QuickRollbackPoint } from '../../../../server/game/core/snapshot/container/DeltaSnapshotContainer';
import type { SnapshotHistoryMap } from '../../../../server/game/core/snapshot/container/SnapshotHistoryMap';
import type { IGameSnapshot, IGetSnapshotSettings, IRollbackResult } from '../../../../server/game/core/snapshot/SnapshotInterfaces';
import { DeltaSnapshotKind, SnapshotTimepoint } from '../../../../server/game/core/snapshot/SnapshotInterfaces';

/**
 * P4-E: each player's quick container holds typed entries into the delta index and releases action-delta payloads in place past the cap
 * (`docs/plans/04-delta-snapshots.md`, "As landed in P4-E"). The containers are driven the way `ActionWindow` and `ActionPhase` drive them:
 * `moveToNextTimepoint` and then `takeSnapshot` (or `addQuickStartOfActionSnapshot`), so each case controls exactly which pushes happen.
 *
 * Under `ENABLE_UNDO_ALL_TESTS` each case body runs twice (a rollback to the start-of-test snapshot in between), so rollbacks only target
 * snapshots the body took, and patches are restored in a `finally` (a second `spyOn` would throw). The harness helper turns index eviction
 * off in that mode, which these cases do not depend on.
 */

interface ISnapshotFactoryInternals {
    currentActionSnapshot: IGameSnapshot;
}
interface ISnapshotManagerInternals {
    snapshotFactory: ISnapshotFactoryInternals;
    quickSnapshots: Map<string, DeltaSnapshotContainer>;
    actionSnapshots: SnapshotHistoryMap<string>;
    phaseSnapshots: SnapshotHistoryMap<PhaseName>;
    rollbackToInternal(settings: IGetSnapshotSettings, overrideQuickRollbackPoint?: QuickRollbackPoint): IRollbackResult;
}

const integrationWithUndo = integration as unknown as (
    definitions: (contextRef: SwuTestContextRef) => void,
    enableUndo: boolean
) => void;

const undoReplayEnabled = process.env.ENABLE_UNDO_ALL_TESTS === 'true';

function managerOf(game): ISnapshotManagerInternals {
    return game.snapshotManager as unknown as ISnapshotManagerInternals;
}

function currentId(game): number {
    return managerOf(game).snapshotFactory.currentActionSnapshot.id;
}

function summariesOf(game, playerId: string): readonly IQuickEntrySummary[] {
    return managerOf(game).quickSnapshots.get(playerId)?.getEntrySummaries() ?? [];
}

function containerOf(game, playerId: string): DeltaSnapshotContainer {
    return managerOf(game).quickSnapshots.get(playerId);
}

/** A new action-phase Action timepoint whose snapshot `playerId` takes, as `ActionWindow.checkUpdateSnapshot` does. */
function takeActionSnapshot(game, playerId: string): number {
    game.snapshotManager.moveToNextTimepoint(SnapshotTimepoint.Action);
    game.snapshotManager.takeSnapshot({ type: SnapshotType.Action, playerId });
    return currentId(game);
}

/** A new start-of-action-phase timepoint (a bridge) that `playerId` gets a full quick entry for, as `ActionPhase.setupActionPhase` does. */
function takeStartOfPhaseEntry(game, playerId: string): number {
    game.snapshotManager.moveToNextTimepoint(SnapshotTimepoint.StartOfPhase);
    game.snapshotManager.takeSnapshot({ type: SnapshotType.Phase, phaseName: PhaseName.Action });
    game.snapshotManager.addQuickStartOfActionSnapshot(playerId);
    return currentId(game);
}

/** One manager-level Quick rollback to a forced quick point: the real `rollbackToInternal`, so pruning and the tracker restart run too. */
function quickRollbackOf(game, playerId: string, quickPoint: QuickRollbackPoint): IRollbackResult {
    return managerOf(game).rollbackToInternal({ type: SnapshotType.Quick, playerId }, quickPoint);
}

function types(entries: readonly IQuickEntrySummary[]): string[] {
    return entries.map((entry) => entry.type);
}

describe('Delta snapshot container', function() {
    integrationWithUndo(function(contextRef) {
        async function setupBoard() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: { groundArena: ['wampa', 'battlefield-marine'] },
                player2: { groundArena: ['atst'], spaceArena: ['cartel-spacer'] }
            });
            return contextRef.context;
        }

        describe('entry types and ownership', function() {
            it('gives the container of the player taking the snapshot a delta entry at an action timepoint and the other container nothing', async function() {
                const context = await setupBoard();
                const game = context.game;
                const p1 = context.player1.id;
                const p2 = context.player2.id;
                const index = game.snapshotManager.deltaSnapshotIndex;
                const before1 = summariesOf(game, p1);
                const before2 = summariesOf(game, p2);

                // A real action: the snapshot that follows is the opponent's turn, so the opponent's container gains the delta entry.
                context.player1.clickCard(context.wampa);
                context.player1.clickCard(context.p2Base);

                const afterAction = currentId(game);
                expect(summariesOf(game, p2).slice(before2.length)).toEqual([{ type: 'delta', snapshotId: afterAction, live: true }]);
                expect(summariesOf(game, p1).length).toBe(before1.length);
                expect(index.get(afterAction).kind).toBe(DeltaSnapshotKind.Action);

                // The same for a driven timepoint.
                const id = takeActionSnapshot(game, p1);
                expect(summariesOf(game, p1).slice(before1.length)).toEqual([{ type: 'delta', snapshotId: id, live: true }]);
                expect(summariesOf(game, p2).length).toBe(before2.length + 1);
            });

            it('gives a full entry for a second claimant of the same timepoint, a bridge-timepoint push and a start-of-phase push', async function() {
                const context = await setupBoard();
                const game = context.game;
                const p1 = context.player1.id;
                const p2 = context.player2.id;
                const index = game.snapshotManager.deltaSnapshotIndex;

                const actionId = takeActionSnapshot(game, p1);
                const length1 = summariesOf(game, p1).length;
                const length2 = summariesOf(game, p2).length;
                expect(summariesOf(game, p1)[length1 - 1]).toEqual({ type: 'delta', snapshotId: actionId, live: true });

                // The delta was claimed by the first player; the second claimant of the same Action timepoint gets a full entry.
                game.snapshotManager.takeSnapshot({ type: SnapshotType.Action, playerId: p2 });
                expect(summariesOf(game, p2)[length2]).toEqual({ type: 'full', snapshotId: actionId, live: true });
                expect(index.get(actionId).kind).toBe(DeltaSnapshotKind.Action);

                // A prompted player's push at a bridge timepoint (the end of the phase).
                game.snapshotManager.moveToNextTimepoint(SnapshotTimepoint.EndOfPhase);
                game.snapshotManager.takeSnapshot({ type: SnapshotType.Action, playerId: p1 });
                const endOfPhaseId = currentId(game);
                expect(index.get(endOfPhaseId).kind).toBe(DeltaSnapshotKind.Bridge);
                expect(summariesOf(game, p1)[length1]).toEqual({ type: 'full', snapshotId: endOfPhaseId, live: true });

                // The start-of-phase entry, whose id is also a bridge in the index.
                const startId = takeStartOfPhaseEntry(game, p2);
                expect(index.get(startId).kind).toBe(DeltaSnapshotKind.Bridge);
                expect(summariesOf(game, p2)[length2 + 1]).toEqual({ type: 'full', snapshotId: startId, live: true });
            });
        });

        describe('the delta cap', function() {
            it('releases only the oldest action-delta payloads past three, keeps every position and never touches a full entry', async function() {
                const context = await setupBoard();
                const game = context.game;
                const p1 = context.player1.id;
                const before = summariesOf(game, p1);

                const d1 = takeActionSnapshot(game, p1);
                const d2 = takeActionSnapshot(game, p1);
                const f1 = takeStartOfPhaseEntry(game, p1);
                const d3 = takeActionSnapshot(game, p1);
                const d4 = takeActionSnapshot(game, p1);
                const f2 = takeStartOfPhaseEntry(game, p1);
                const d5 = takeActionSnapshot(game, p1);

                const entries = summariesOf(game, p1);
                const added = entries.slice(before.length);
                expect(added.map((entry) => entry.snapshotId)).toEqual([d1, d2, f1, d3, d4, f2, d5]);
                expect(types(added)).toEqual(['delta', 'delta', 'full', 'delta', 'delta', 'full', 'delta']);

                // Three live deltas, every older one released in place, every full entry live.
                const deltas = entries.filter((entry) => entry.type === 'delta');
                expect(deltas.length).toBeGreaterThanOrEqual(5);
                expect(deltas.slice(-3).every((entry) => entry.live)).toBeTrue();
                expect(deltas.slice(0, -3).every((entry) => !entry.live)).toBeTrue();
                expect(entries.filter((entry) => entry.type === 'full').every((entry) => entry.live)).toBeTrue();
                expect(containerOf(game, p1).getLiveDeltaCount()).toBe(3);
                expect(containerOf(game, p1).getOldestLiveDeltaId()).toBe(d3);
            });

            it('counts each player\'s deltas separately', async function() {
                const context = await setupBoard();
                const game = context.game;
                const p1 = context.player1.id;
                const p2 = context.player2.id;

                for (let i = 0; i < 3; i++) {
                    takeActionSnapshot(game, p1);
                    takeActionSnapshot(game, p2);
                }

                expect(containerOf(game, p1).getLiveDeltaCount()).toBe(3);
                expect(containerOf(game, p2).getLiveDeltaCount()).toBe(3);
            });

            it('keeps Current and Previous as positions after a rollback prunes the newer entries, so Previous is the released entry and is unavailable', async function() {
                const context = await setupBoard();
                const game = context.game;
                const p1 = context.player1.id;
                const before = summariesOf(game, p1);

                const ids = [1, 2, 3, 4, 5].map(() => takeActionSnapshot(game, p1));

                // The action history keeps the newest three, so the third is the oldest restorable one.
                expect(game.snapshotManager.rollbackTo({ type: SnapshotType.Action, playerId: p1, actionOffset: -2 }).success).toBeTrue();

                expect(currentId(game)).toBe(ids[2]);
                const entries = summariesOf(game, p1);
                expect(entries.slice(before.length).map((entry) => entry.snapshotId)).toEqual(ids.slice(0, 3));
                expect(entries.slice(before.length).map((entry) => entry.live)).toEqual([false, false, true]);
                const container = containerOf(game, p1);
                expect(container.getMostRecentSnapshotId()).toBe(ids[2]);
                expect(container.hasQuickSnapshot(QuickRollbackPoint.Current)).toBeTrue();
                expect(container.hasQuickSnapshot(QuickRollbackPoint.Previous)).toBeFalse();
                expect(container.getSnapshotProperties(QuickRollbackPoint.Previous) ?? null).toBeNull();
                expect(container.getSnapshotProperties(QuickRollbackPoint.Current).snapshotId).toBe(ids[2]);
            });
        });

        describe('restore dispatch', function() {
            it('restores a start-of-phase id once through the phase map and a delta entry once through the action map', async function() {
                const context = await setupBoard();
                const game = context.game;
                const p1 = context.player1.id;
                const index = game.snapshotManager.deltaSnapshotIndex;
                const manager = managerOf(game);

                const boundaryId = takeStartOfPhaseEntry(game, p1);
                const actionId = takeActionSnapshot(game, p1);
                // The boundary id is both a full entry and a bridge in the index.
                expect(index.get(boundaryId).kind).toBe(DeltaSnapshotKind.Bridge);
                expect(index.get(actionId).kind).toBe(DeltaSnapshotKind.Action);
                const container = containerOf(game, p1);

                const phaseRestores: number[] = [];
                const actionRestores: number[] = [];
                let stateRestores = 0;
                const originalPhaseRestore = manager.phaseSnapshots.rollbackById.bind(manager.phaseSnapshots);
                const originalActionRestore = manager.actionSnapshots.rollbackById.bind(manager.actionSnapshots);
                const originalStateRestore = GameStateManager.prototype.rollbackToSnapshot;
                const patchedState = {
                    rollbackToSnapshot(this: GameStateManager, snapshot: IGameSnapshot, beforeRollbackSnapshot?: IGameSnapshot) {
                        stateRestores++;
                        return originalStateRestore.call(this, snapshot, beforeRollbackSnapshot);
                    }
                };

                try {
                    manager.phaseSnapshots.rollbackById = (id: number) => {
                        phaseRestores.push(id);
                        return originalPhaseRestore(id);
                    };
                    manager.actionSnapshots.rollbackById = (id: number) => {
                        actionRestores.push(id);
                        return originalActionRestore(id);
                    };
                    GameStateManager.prototype.rollbackToSnapshot = patchedState.rollbackToSnapshot;

                    // Each restore goes through the manager's Quick rollback (the path `-morph` double-restored on), with the quick point
                    // forced so the case does not depend on the prompt state. The delta entry (Current) goes first because it prunes nothing
                    // below it; the start-of-phase entry (Previous) then prunes it.
                    const current = quickRollbackOf(game, p1, QuickRollbackPoint.Current);
                    expect(current.success).toBeTrue();
                    expect(currentId(game)).toBe(actionId);
                    expect(phaseRestores).toEqual([]);
                    expect(actionRestores).toEqual([actionId]);
                    expect(stateRestores).toBe(1);

                    const previous = quickRollbackOf(game, p1, QuickRollbackPoint.Previous);
                    expect(previous.success).toBeTrue();
                    expect(currentId(game)).toBe(boundaryId);
                    expect(phaseRestores).toEqual([boundaryId]);
                    expect(actionRestores).toEqual([actionId]);
                    expect(stateRestores).toBe(2);
                    expect(index.headSnapshotId).toBe(boundaryId);
                    expect(container.getMostRecentSnapshotId()).toBe(boundaryId);
                } finally {
                    Reflect.deleteProperty(manager.phaseSnapshots, 'rollbackById');
                    Reflect.deleteProperty(manager.actionSnapshots, 'rollbackById');
                    GameStateManager.prototype.rollbackToSnapshot = originalStateRestore;
                }
            });
        });
    }, true);

    // The harness runs `integration()` at UndoMode.Disabled unless the whole suite is replayed under undo, so the
    // disabled case needs the plain form.
    integration(function(contextRef) {
        it('holds no quick container in a game with undo disabled', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: { groundArena: ['wampa'] },
                player2: { groundArena: ['atst'] }
            });
            if (undoReplayEnabled) {
                pending('the whole suite is replayed with undo enabled');
            }
            const { context } = contextRef;

            context.player1.clickCard(context.wampa);
            context.player1.clickCard(context.p2Base);

            expect(managerOf(context.game).quickSnapshots.size).toBe(0);
        });
    });
});
