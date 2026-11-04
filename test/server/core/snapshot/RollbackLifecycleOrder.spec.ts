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
 * `EffectEventListener`.
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

describe('P4-F delta restore lifecycle ordering', function() {
    integrationWithUndo(function(contextRef) {
        it('delta-hook-order: every field write precedes the first afterSetState; created objects are cleaned up and unregistered before afterSetAllState on every survivor, last to first; then the LKI clear and the counter', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: { groundArena: ['wampa'] },
                player2: { groundArena: ['atst'], spaceArena: ['cartel-spacer'] }
            });
            const { context } = contextRef;
            const game = context.game;
            const stateManager = game.gameObjectManager as unknown as { allGameObjects: GameObjectBase[]; restoreLastGameObjectId(snapshot: unknown): void };

            context.player1.clickCard(context.wampa);
            context.player1.clickCard(context.p2Base);
            const token = game.generateToken(context.player2Object, 'battleDroid') as unknown as GameObjectBase;
            context.player2.clickCard(context.atst);
            context.player2.clickCard(context.p1Base);

            // The chain this rollback applies: the pending window plus the stored deltas back to player 2's action snapshot.
            const target = (game.snapshotManager as unknown as { actionSnapshots: { getSnapshotProperties(key: string): { snapshotId: number; timepointNumber: number } } })
                .actionSnapshots.getSnapshotProperties(context.player2.id);
            const links = [game.deltaTracker.pendingWindow, ...game.snapshotManager.deltaSnapshotIndex.buildChain(target.snapshotId, target.timepointNumber)];
            const touched = new Set<string>(links.flatMap((link) => [...link.changedFields.keys()]));
            const createdAndRegistered = new Set<string>(links.flatMap((link) => [...link.createdObjectUuids])
                .filter((uuid) => stateManager.allGameObjects.some((go) => go.uuid === uuid)));
            const untouched = stateManager.allGameObjects.find((go) => !touched.has(go.uuid) && !createdAndRegistered.has(go.uuid));
            expect(createdAndRegistered.has(token.uuid)).toBeTrue();
            expect(untouched).toBeDefined();

            const events: { kind: string; uuid?: string; tokenRegistered?: boolean; inHook?: boolean }[] = [];
            let hookDepth = 0;
            const shadowed: { target: object; name: string }[] = [];
            const shadow = (target: object, name: string, wrap: (original: (...args: unknown[]) => unknown) => (...args: unknown[]) => unknown) => {
                const record = target as Record<string, (...args: unknown[]) => unknown>;
                record[name] = wrap(record[name].bind(target));
                shadowed.push({ target, name });
            };

            // Setters call recordFieldChange strictly before every write, even while the tracker is stopped.
            shadow(game.deltaTracker, 'recordFieldChange', (original) => (go: GameObjectBase, field) => {
                events.push({ kind: 'write', uuid: go.uuid, inHook: hookDepth > 0 });
                return original(go, field);
            });
            for (const go of [...stateManager.allGameObjects]) {
                for (const hook of ['afterSetState', 'cleanupOnRemove', 'afterSetAllState']) {
                    shadow(go, hook, (original) => (...args) => {
                        events.push({ kind: hook, uuid: go.uuid, tokenRegistered: game.gameObjectManager.isRegistered(token) });
                        hookDepth++;
                        try {
                            return original(...args);
                        } finally {
                            hookDepth--;
                        }
                    });
                }
            }
            shadow(game.lkiRegistry, 'clearForRollback', (original) => (...args) => {
                events.push({ kind: 'lki' });
                return original(...args);
            });
            shadow(stateManager, 'restoreLastGameObjectId', (original) => (...args) => {
                events.push({ kind: 'counter' });
                return original(...args);
            });

            let deltaRestores = 0;
            const originalDelta = (stateManager as unknown as { rollbackToDeltaChain(...args: unknown[]): boolean }).rollbackToDeltaChain;
            shadow(stateManager, 'rollbackToDeltaChain', (original) => (...args) => {
                deltaRestores++;
                return original(...args);
            });
            expect(originalDelta).toBeDefined();

            let result;
            try {
                result = game.snapshotManager.rollbackTo({ type: 'action', playerId: context.player2.id });
            } finally {
                for (const { target, name } of shadowed) {
                    Reflect.deleteProperty(target as Record<string, unknown>, name);
                }
            }
            expect(result.success).toBeTrue();
            expect(deltaRestores).toBe(1);

            // Restore writes are the ones made outside any hook; a hook's own writes are part of that hook.
            const firstAfterSetState = events.findIndex((event) => event.kind === 'afterSetState');
            const lastRestoreWrite = events.map((event) => (event.kind === 'write' && !event.inHook ? 'restore-write' : event.kind)).lastIndexOf('restore-write');
            expect(lastRestoreWrite).toBeGreaterThanOrEqual(0);
            expect(lastRestoreWrite).toBeLessThan(firstAfterSetState);

            // afterSetState for an object no link recorded, too (G3: every surviving object, not only written ones).
            expect(events.some((event) => event.kind === 'afterSetState' && event.uuid === untouched.uuid)).toBeTrue();
            expect(events.some((event) => event.kind === 'write' && !event.inHook && event.uuid === untouched.uuid)).toBeFalse();

            // cleanupOnRemove exactly for the objects created inside the chain that were still registered (the token among them);
            // registry removal before the first afterSetAllState.
            const cleanups = events.filter((event) => event.kind === 'cleanupOnRemove');
            expect(new Set(cleanups.map((event) => event.uuid))).toEqual(createdAndRegistered);
            expect(cleanups.length).toBe(createdAndRegistered.size);
            const afterAll = events.filter((event) => event.kind === 'afterSetAllState');
            expect(afterAll.length).toBe(stateManager.allGameObjects.length);
            expect(afterAll.every((event) => event.tokenRegistered === false)).toBeTrue();
            expect(afterAll.map((event) => event.uuid)).toEqual(stateManager.allGameObjects.map((go) => go.uuid).reverse());
            expect(events.findIndex((event) => event.kind === 'cleanupOnRemove')).toBeLessThan(events.findIndex((event) => event.kind === 'afterSetAllState'));

            // Then the LKI clear, then the counter, last.
            const kinds = events.map((event) => event.kind);
            expect(kinds.indexOf('lki')).toBeGreaterThan(kinds.lastIndexOf('afterSetAllState'));
            expect(kinds[kinds.length - 1]).toBe('counter');

            game.postRollbackOperations(result.entryPoint);
        });
    }, true);
});
