import { SnapshotType } from '../../../server/game/core/Constants';
import { OngoingEffectSource } from '../../../server/game/core/ongoingEffect/OngoingEffectSource';
import type { IGameSnapshot, IRollbackResult } from '../../../server/game/core/snapshot/SnapshotInterfaces';

/**
 * p1-b, hardened proof: the GameObject id counter (`GameStateManager.lastGameObjectId`) is restored to
 * the snapshot's own recorded value on every rollback, the registration guard that makes this safe
 * never fires under normal play, and the guard-suspension helper cannot mask an error reported from
 * inside a rollback. See `docs/plans/01-snapshot-hygiene.md` work item B and `.anvil/p1-b/plan.md`.
 *
 * Uses `undoIntegration` (not `it`) so all three cases are skipped under `ENABLE_UNDO_ALL_TESTS=true`,
 * where the whole-suite rollback replay would otherwise nest inside these specs' own rollbacks.
 */
describe('GameObject id counter restore on rollback', function() {
    undoIntegration(function(contextRef) {
        /** Snapshot factory internals this spec needs. `snapshotFactory` is `protected` on SnapshotManager,
         * `currentActionSnapshot` is `private` on SnapshotFactory. Local to this file, per plan section 6b. */
        interface ISnapshotFactoryInternals {
            currentActionSnapshot: IGameSnapshot;
        }

        interface ISnapshotManagerInternals {
            snapshotFactory: ISnapshotFactoryInternals;
        }

        function getSnapshotFactory(game): ISnapshotFactoryInternals {
            return (game.snapshotManager as unknown as ISnapshotManagerInternals).snapshotFactory;
        }

        interface IRegistrarInternals {
            lastGameObjectId: number;
            register: (go: unknown) => void;
        }

        function getRegistrar(game): IRegistrarInternals {
            return game.gameObjectManager as unknown as IRegistrarInternals;
        }

        /** `GameStateManager` surface for driving `rollbackToSnapshot` directly, bypassing the container. */
        interface IStateManagerInternals {
            rollbackToSnapshot(snapshot: IGameSnapshot, beforeRollbackSnapshot?: IGameSnapshot): boolean;
        }

        function getStateManager(game): IStateManagerInternals {
            return game.gameObjectManager as unknown as IStateManagerInternals;
        }

        async function setupBoard(contextRef) {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['moment-of-peace'],
                    groundArena: ['97th-legion#keeping-the-peace-on-sullust'],
                    resources: 7
                },
                player2: { groundArena: ['wampa'] }
            });
        }

        it('restores the GameObject id counter and allocates nothing during the rollback', async function() {
            await setupBoard(contextRef);
            const { context } = contextRef;
            const game = context.game;
            const registrar = getRegistrar(game);

            // The dynamic effect (97th Legion's modifyStats) is live and has a current target.
            expect(context._97thLegion.getPower()).toBe(7);
            expect(context._97thLegion.getHp()).toBe(7);

            const snapshotId = contextRef.snapshot.takeManualSnapshot(context.player1Object);
            // The value the restore will write: takeManualSnapshot aliases the snapshot created at the
            // last moveToNextTimepoint(Action), not the live counter at this moment. Registrations made
            // after that timepoint — including play-action transients ActionWindow.getCardLegalActions
            // consumes while building the action prompt — have already pushed the live counter past it.
            const counterAtSnapshot = getSnapshotFactory(game).currentActionSnapshot.lastGameObjectId;
            expect(counterAtSnapshot).toBeLessThanOrEqual(registrar.lastGameObjectId);

            context.player1.clickCard(context.momentOfPeace);
            context.player1.clickCard(context._97thLegion);
            expect(context._97thLegion).toHaveExactUpgradeNames(['shield']);

            // Make the dynamic effect's value genuinely differ across the seam, so the post-rollback stat
            // assertion is falsifiable: playing moment-of-peace alone does not change resources.length, so
            // asserting getPower() === 7 after a rollback that started at 7 would pass even if the
            // rollback did nothing.
            context.player1.setResourceCount(9);
            context.game.resolveGameState(true);
            expect(context._97thLegion.getPower()).toBe(9);

            const counterBeforeRollback = registrar.lastGameObjectId;
            expect(counterBeforeRollback).toBeGreaterThan(counterAtSnapshot);

            const registerFn = registrar.register;
            let registrationsDuringRollback = 0;
            registrar.register = function(this: unknown, go: unknown) {
                registrationsDuringRollback++;
                return registerFn.call(this, go);
            };

            let result: IRollbackResult;
            let counterAfterRollback: number;
            try {
                result = game.snapshotManager.rollbackTo({
                    type: SnapshotType.Manual,
                    playerId: context.player1Object.id,
                    snapshotId,
                });

                // Statement ordering here is load-bearing: the very first statement after rollbackTo
                // returns captures the counter, before postRollbackOperations rebuilds the pipeline and
                // allocates fresh, uncached play-action transients through register(), which would
                // advance the counter and fail a correct implementation if read afterward.
                counterAfterRollback = registrar.lastGameObjectId;
            } finally {
                registrar.register = registerFn;
            }

            expect(result.success).toBeTrue();

            // AC4a: the rollback itself registered nothing.
            expect(registrationsDuringRollback).toBe(0);

            // AC1: the counter is the snapshot's own recorded value, and moved backward.
            expect(counterAfterRollback).toBe(counterAtSnapshot);
            expect(counterAfterRollback).toBeLessThan(counterBeforeRollback);

            // The shield is gone and the dynamic effect is re-applied at the restored resource count.
            expect(context._97thLegion).toHaveExactUpgradeNames([]);
            expect(context._97thLegion.getPower()).toBe(7);
            expect(context._97thLegion.getHp()).toBe(7);

            // Restore a consistent game for the harness's afterEach. postRollbackOperations already ends
            // in `this.pipeline.continue(this)`, so a second `game.continue()` here would be one extra
            // prompt-refresh sweep and one extra batch of play-action transients versus the original run —
            // the cheapest thing that would break the uuid-replay assertion below.
            if (result.success) {
                game.postRollbackOperations(result.entryPoint);
            }

            // AC4b: replaying the identical action reproduces a bounded id, not necessarily the exact
            // same one. Measured in plan step 1b: the driver of any offset is prompt-refresh sweep count
            // (every ActionWindow.continue() -> highlightSelectableCards() -> getSelectableCards() sweep
            // allocates a fresh, uncached action object per playable card through register()), not the
            // number of transients per sweep, and the post-rollback pipeline rebuild does not perform the
            // exact same number of sweeps the original run did between the snapshot and the token's
            // creation. The measurement (against this same scenario) found a +3 offset (shield id 271
            // before, 274 after the rollback+replay) against a counterAtSnapshot/counterBeforeRollback
            // window of 267/276, so exact equality is not asserted here; the replayed token demonstrably
            // reuses an id the restore freed rather than extending the counter.
            context.player1.clickCard(context.momentOfPeace);
            context.player1.clickCard(context._97thLegion);
            expect(context._97thLegion).toHaveExactUpgradeNames(['shield']);
            const replayedUuid = context._97thLegion.upgrades[0].uuid;
            const replayedId = parseInt(replayedUuid.split('_').pop(), 10);

            expect(counterAtSnapshot).toBeLessThan(replayedId);
            expect(replayedId).toBeLessThanOrEqual(counterBeforeRollback);
        });

        it('fails loudly if a GameObject is constructed during the rollback', async function() {
            await setupBoard(contextRef);
            const { context } = contextRef;
            const game = context.game;

            const snapshotId = contextRef.snapshot.takeManualSnapshot(context.player1Object);
            context.player1.clickCard(context.momentOfPeace);
            context.player1.clickCard(context.wampa);

            const originalAfterSetAllState = (context.wampa as unknown as { afterSetAllState: (oldState: unknown) => void }).afterSetAllState;
            let patched = false;
            (context.wampa as unknown as { afterSetAllState: (oldState: unknown) => void }).afterSetAllState = function(this: unknown, oldState: unknown) {
                originalAfterSetAllState.call(this, oldState);
                if (!patched) {
                    patched = true;
                    // eslint-disable-next-line no-new
                    new OngoingEffectSource(game);
                }
            };

            expect(() => game.snapshotManager.rollbackTo({
                type: SnapshotType.Manual,
                playerId: context.player1Object.id,
                snapshotId,
            })).toThrowError(/during a rollback/);

            // The guard throw deliberately leaves the game mid-rollback (section 4's blast-radius row):
            // no recovery rollback is attempted here, matching production behavior. This makes the
            // harness's afterEach return before both the unresolved-prompt scan and captureGameState,
            // which is correct, since the spec's subject ends at the throw and a deliberately
            // half-restored game cannot be serialised. That suppression is an incidental consequence of
            // the early return, not a documented harness contract: if afterEach is ever reordered, this
            // test will start failing inside captureGameState, and the fix is to re-establish the skip,
            // not to make the game consistent.
            context.ignoreUnresolvedActionPhasePrompts = true;
        });

        it('does not let the registration guard mask an error reported from inside a rollback', async function() {
            await setupBoard(contextRef);
            const { context } = contextRef;
            const game = context.game;

            // Held directly rather than through a container, so beforeRollbackSnapshot can be omitted,
            // exactly as Performance.spec.ts captures its anchor: the factory replaces this field on the
            // next timepoint, so the held reference stays pinned to the pre-action state.
            const snapshot = getSnapshotFactory(game).currentActionSnapshot;
            const stateManager = getStateManager(game);

            context.player1.clickCard(context.momentOfPeace);
            context.player1.clickCard(context.wampa);

            const originalSetState = (context.wampa as unknown as { setState: (state: unknown) => void }).setState;
            (context.wampa as unknown as { setState: (state: unknown) => void }).setState = function() {
                throw new Error('P1B_SENTINEL');
            };

            const originalReportSevereRollbackFailure = game.reportSevereRollbackFailure.bind(game);
            (game as unknown as { reportSevereRollbackFailure: (error: Error) => void }).reportSevereRollbackFailure = function(error: Error) {
                // eslint-disable-next-line no-new
                new OngoingEffectSource(game);
                throw error;
            };

            try {
                // Discrimination: a throw from inside the inner catch block propagates straight out
                // through the outer finally, so whichever error the fake raises is the one that escapes.
                // With the suspension present the construction succeeds and the original sentinel
                // escapes; with the suspension removed the guard fires first and a /during a rollback/
                // error escapes instead, failing this test.
                expect(() => stateManager.rollbackToSnapshot(snapshot)).toThrowError(/P1B_SENTINEL/);
            } finally {
                (context.wampa as unknown as { setState: (state: unknown) => void }).setState = originalSetState;
                (game as unknown as { reportSevereRollbackFailure: (error: Error) => void }).reportSevereRollbackFailure = originalReportSevereRollbackFailure;
            }

            // Same reasoning as the previous test: no recovery is attempted, and the harness's afterEach
            // suppression is an incidental consequence of the early return, not a documented contract.
            context.ignoreUnresolvedActionPhasePrompts = true;
        });
    });
});
