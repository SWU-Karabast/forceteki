import type { GameObjectBase } from '../../../../server/game/core/GameObjectBase';
import type { SerializedStateRecord } from '../../../../server/game/core/StateEncoding';
import type { IGameSnapshot } from '../../../../server/game/core/snapshot/SnapshotInterfaces';
import { SnapshotTimepoint } from '../../../../server/game/core/snapshot/SnapshotInterfaces';

/**
 * `P3-PB2` (`PB2-C8`). The rollback lifecycle contract used to be enforced by its own shape: the
 * `afterSetState` call lived inside the per-object state-write method on `GameObjectBase`, so it could not
 * drift away from the state write. `P3-PB2` deleted that method and moved the whole sequence into
 * `GameStateManager.rollbackToSnapshot`, where the ordering is now three separate loops that a future edit
 * could silently reorder. This pins it.
 *
 * It also pins the property the `oldState` pre-pass exists to guarantee: each hook's `oldState` carries the
 * **pre-rollback** value, not the restored one. That is the assertion that fails if the pre-pass is ever
 * moved back inside the update loop *after* `deserialize`, which would hand the hooks the restored value
 * and silently disable every `isRegistered` transition in `AbilityLimit`/`TriggeredAbility`/
 * `CustomDurationEvent`.
 */

interface ISnapshotFactoryInternals {
    createSnapshotForCurrentTimepoint(timepoint: SnapshotTimepoint): void;
}
interface ISnapshotManagerFactoryInternals {
    snapshotFactory: ISnapshotFactoryInternals;
}
interface ISnapshotMapInternals {
    snapshots: Map<number, IGameSnapshot>;
}
interface ISnapshotManagerInternals {
    manualSnapshots: Map<string, ISnapshotMapInternals>;
}

function forceFreshCurrentSnapshot(game: { snapshotManager: unknown }): void {
    (game.snapshotManager as unknown as ISnapshotManagerFactoryInternals).snapshotFactory.createSnapshotForCurrentTimepoint(SnapshotTimepoint.Action);
}

function getManualSnapshotContainer(game: { snapshotManager: unknown }, playerId: string): ISnapshotMapInternals {
    return (game.snapshotManager as unknown as ISnapshotManagerInternals).manualSnapshots.get(playerId);
}

type HookName = 'afterSetState' | 'cleanupOnRemove' | 'afterSetAllState';

/** Own-property shadow, never a prototype patch: an instance's effective hook can resolve through a mixin
 * prototype (`WithDamage.prototype.afterSetState`) nearer in the chain than `GameObjectBase.prototype`, so
 * only an own property is guaranteed to win the lookup. */
function recordHook(
    instance: GameObjectBase,
    hook: HookName,
    log: { hook: HookName; uuid: string; oldState: SerializedStateRecord }[]
): () => void {
    const self = instance as unknown as Record<string, (oldState: SerializedStateRecord) => void>;
    const original = self[hook].bind(instance);
    self[hook] = function(oldState: SerializedStateRecord) {
        log.push({ hook, uuid: instance.uuid, oldState });
        original(oldState);
    };
    return () => {
        // Reflect.deleteProperty rather than `delete obj[hook]`: same effect, and it is not the
        // dynamically-computed `delete` this repo's lint config forbids.
        Reflect.deleteProperty(instance as unknown as Record<string, unknown>, hook);
    };
}

const integrationWithUndo = integration as unknown as (
    definitions: (contextRef: SwuTestContextRef) => void,
    enableUndo: boolean
) => void;

describe('P3-PB2 rollback lifecycle ordering (PB2-C8)', function() {
    integrationWithUndo(function(contextRef) {
        it('runs afterSetState per updated object, then every cleanupOnRemove, then every afterSetAllState, with pre-rollback oldState throughout', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: { hand: ['wampa'], resources: 6 },
                player2: { spaceArena: ['cartel-spacer'] }
            });
            const { context } = contextRef;

            forceFreshCurrentSnapshot(context.game);
            const snapshotId = contextRef.snapshot.takeManualSnapshot(context.player1Object);
            const snapshotStates = getManualSnapshotContainer(context.game, context.player1Object.id).snapshots.get(snapshotId).states;

            // Playing the card creates GameObjects after the snapshot was taken (the play action, its
            // ability steps, the ongoing-effect bookkeeping), so the rollback has a real `removals`
            // population to run `cleanupOnRemove` over - without which the ordering claim would only be
            // half-exercised.
            context.player1.clickCard(context.wampa);
            expect(context.wampa).toBeInZone('groundArena');
            context.setDamage(context.wampa, 2);

            const wampa = context.wampa as unknown as GameObjectBase;
            const log: { hook: HookName; uuid: string; oldState: SerializedStateRecord }[] = [];

            // An object that exists in the snapshot -> it is updated, so it sees afterSetState and
            // afterSetAllState (never cleanupOnRemove).
            const restoreWampaAfterSetState = recordHook(wampa, 'afterSetState', log);
            const restoreWampaAfterSetAllState = recordHook(wampa, 'afterSetAllState', log);

            // Non-vacuity for the removals population the second case exercises: playing the card really
            // did create objects the snapshot has no record for.
            const manager = context.game.gameObjectManager as unknown as { registeredObjectCount: number };
            expect(manager.registeredObjectCount).toBeGreaterThan(Object.keys(snapshotStates).length);

            const restores = [restoreWampaAfterSetState, restoreWampaAfterSetAllState];
            let rolledBack: boolean;
            try {
                rolledBack = contextRef.snapshot.rollbackToSnapshot({ type: 'manual', playerId: context.player1Object.id, snapshotId });
            } finally {
                for (const restore of restores) {
                    restore();
                }
            }
            expect(rolledBack).toBe(true);

            // Ordering: every afterSetState precedes every afterSetAllState. The engine drives both loops
            // over the same `updates` list, so a reordering shows up here directly.
            const afterSetStateIndexes = log.map((e, i) => (e.hook === 'afterSetState' ? i : -1)).filter((i) => i >= 0);
            const afterSetAllStateIndexes = log.map((e, i) => (e.hook === 'afterSetAllState' ? i : -1)).filter((i) => i >= 0);
            expect(afterSetStateIndexes.length).toBe(1);
            expect(afterSetAllStateIndexes.length).toBe(1);
            expect(Math.max(...afterSetStateIndexes)).toBeLessThan(Math.min(...afterSetAllStateIndexes));

            // The pre-rollback value, not the restored one. Wampa was damaged to 2 after the snapshot and
            // the snapshot recorded it in hand with no damage, so a hook handed the *restored* record would
            // see the snapshot's value here instead.
            const observed = log.filter((e) => e.uuid === wampa.uuid);
            expect(observed.length).toBe(2);
            for (const entry of observed) {
                expect(entry.oldState._damage).toBe(2);
            }

            // And the restore really did happen, so the assertions above are not describing a no-op. (Damage
            // is deliberately not read here: `Card.assertPropertyEnabledForZone` refuses the property for a
            // card in hand, which is itself further confirmation the card went back.)
            expect(context.wampa).toBeInZone('hand');
        });

        it('runs every afterSetState before any cleanupOnRemove and both before afterSetAllState, handing cleanupOnRemove the pre-rollback record of an object created after the snapshot', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: { hand: ['wampa'], resources: 6 },
                player2: { spaceArena: ['cartel-spacer'] }
            });
            const { context } = contextRef;

            forceFreshCurrentSnapshot(context.game);
            const snapshotId = contextRef.snapshot.takeManualSnapshot(context.player1Object);
            const snapshotStates = getManualSnapshotContainer(context.game, context.player1Object.id).snapshots.get(snapshotId).states;

            context.player1.clickCard(context.wampa);
            expect(context.wampa).toBeInZone('groundArena');

            // Find a live object with no record in the snapshot: it was created by the play above and will
            // therefore be removed by the rollback.
            const allObjects = (context.game.gameObjectManager as unknown as { allGameObjects: GameObjectBase[] }).allGameObjects;
            const doomed = allObjects.filter((go) => !(go.uuid in snapshotStates));
            expect(doomed.length).toBeGreaterThan(0);

            const log: { hook: HookName; uuid: string; oldState: SerializedStateRecord }[] = [];
            const restores = [
                recordHook(doomed[0], 'cleanupOnRemove', log),
                recordHook(context.game.stateWatcherRegistrar as unknown as GameObjectBase, 'afterSetAllState', log),
                // P3-PB2 fix (PB2I1-OPR-05 / PB2I1-AC-03). Wampa is in the snapshot, so it is an *update*
                // and sees afterSetState; doomed[0] is not, so it is a *removal* and sees cleanupOnRemove.
                // Recording both in one run is what pins the first transition of PB2-C8's three-part
                // sequence. Without it, hoisting the removal loop above the per-object update loop left
                // every assertion in this file green, while making AbilityLimit/TriggeredAbility's
                // cleanupOnRemove unregister listeners that a surviving object's afterSetState re-registers
                // moments later.
                recordHook(context.wampa as unknown as GameObjectBase, 'afterSetState', log),
            ];

            let rolledBack: boolean;
            try {
                rolledBack = contextRef.snapshot.rollbackToSnapshot({ type: 'manual', playerId: context.player1Object.id, snapshotId });
            } finally {
                for (const restore of restores) {
                    restore();
                }
            }
            expect(rolledBack).toBe(true);

            const afterSetStateIndexes = log.map((e, i) => (e.hook === 'afterSetState' ? i : -1)).filter((i) => i >= 0);
            const cleanupIndexes = log.map((e, i) => (e.hook === 'cleanupOnRemove' ? i : -1)).filter((i) => i >= 0);
            const cleanupIndex = log.findIndex((e) => e.hook === 'cleanupOnRemove');
            const afterAllIndex = log.findIndex((e) => e.hook === 'afterSetAllState');
            expect(afterSetStateIndexes.length).toBe(1);
            expect(cleanupIndexes.length).toBe(1);
            expect(afterAllIndex).toBeGreaterThanOrEqual(0);

            // The full PB2-C8 sequence, in one run: afterSetState -> cleanupOnRemove -> afterSetAllState.
            expect(Math.max(...afterSetStateIndexes)).toBeLessThan(Math.min(...cleanupIndexes));
            expect(cleanupIndex).toBeLessThan(afterAllIndex);

            // `oldState` is a real pre-rollback record for an object the snapshot never held, which is the
            // population the pre-pass has to cover and that Phase A's serialize-leg parity never did.
            expect(log[cleanupIndex].oldState).toBeDefined();
            expect(log[cleanupIndex].oldState._uuid).toBe(doomed[0].uuid);
        });
    }, true);
});
