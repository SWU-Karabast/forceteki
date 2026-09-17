import { GameObjectBase } from '../../../server/game/core/GameObjectBase';
import type { IGameSnapshot } from '../../../server/game/core/snapshot/SnapshotInterfaces';
import { SnapshotTimepoint } from '../../../server/game/core/snapshot/SnapshotInterfaces';
import { getStateSerializerFor } from '../../../server/game/core/StateSerializers';
import type { SerializedStateRecord } from '../../../server/game/core/StateEncoding';
import {
    getFirstHarnessError,
    getParityHarnessStats,
    getRetainedGeneratedRecords,
    withExpectedHarnessMismatch,
    withHarnessRethrowSuppressed,
    withParityHarnessInstalled,
    withRestoreMode,
} from '../../helpers/ParityHarness';

/**
 * Committed regression coverage for the P3-PA3 restore-leg parity harness — the restore-side counterpart
 * to `ParityHarness.spec.ts` (P3-PA2's serialize leg). See `.anvil/p3-pa3/plan.md` §5 step 7 / §8 for the
 * acceptance criteria (AC1-AC7) each `describe` below establishes, and §10 for why AC4 is a
 * forward-contract pin rather than a risk-directed case. `test/helpers/ParityHarness.ts` is imported
 * directly (not just relied on via jasmine's helper auto-load) so these specs can reach its exported
 * functions.
 *
 * This file is also the fixture for AC14 (the escape-proof check, §5 step 8): with
 * `PARITY_INJECT_RESTORE_MISMATCH=<Class>.<field>` set in the ambient environment, every `integration(fn,
 * true)` spec in this file drives a real rollback in both undo and non-undo mode, which is what lets the
 * one injected mismatch prove the gate can fail in all four flag-on configurations. No dedicated
 * describe block is needed for that — the injection is one-shot and fires on whichever spec's rollback
 * reaches the targeted class first.
 */

interface ISnapshotMapInternals {
    snapshots: Map<number, IGameSnapshot>;

    /** Public on `SnapshotMap` itself: rolls back through `SnapshotContainerBase.rollbackToSnapshotInternal`
     * (which always supplies `beforeRollbackSnapshot`, `container/SnapshotContainerBase.ts:72`) and returns
     * `null` cleanly on failure. `SnapshotManager.rollbackManualSnapshot` wraps this same call in a
     * `Contract.assertNotNullLike` that does not distinguish "no such snapshot" from "rollback failed and
     * recovered" and throws for both — calling the container directly, as AC7 does, is what reaches the
     * clean `false`/`null` this criterion is about, rather than that dispatcher-level Contract landmine. */
    rollbackToSnapshot(key: number): number | null;
}
interface ISnapshotManagerInternals {
    manualSnapshots: Map<string, ISnapshotMapInternals>;
}

/** Reaches the `SnapshotMap` container instance (and, through it, the actual `IGameSnapshot` object) behind
 * a player's manual snapshots. `manualSnapshots` is `protected` on `SnapshotManager` — same discipline as
 * `GameObjectIdRestore.spec.ts`'s own internals-reaching interfaces. */
function getManualSnapshotContainer(game: { snapshotManager: unknown }, playerId: string): ISnapshotMapInternals {
    const manager = game.snapshotManager as unknown as ISnapshotManagerInternals;
    return manager.manualSnapshots.get(playerId);
}

function deepEqualJson(a: unknown, b: unknown): boolean {
    return JSON.stringify(a) === JSON.stringify(b);
}

interface ISnapshotFactoryInternals {
    createSnapshotForCurrentTimepoint(timepoint: SnapshotTimepoint): void;
}
interface ISnapshotManagerFactoryInternals {
    snapshotFactory: ISnapshotFactoryInternals;
}

/**
 * Forces a brand-new "current" snapshot, built by calling the real production `buildGameStateForSnapshot`
 * right now. Required before `takeManualSnapshot` whenever the harness was installed spec-scoped (i.e.
 * mid-test, not at module load, per R4): `SnapshotManager.takeManualSnapshot` (`SnapshotManager.ts:214`)
 * does not build a new snapshot at all - it only references whichever snapshot is already "current"
 * (`snapshotFactory.currentActionSnapshot`), which is normally the one auto-taken on entering the action
 * phase, i.e. *before* a spec-scoped `withParityHarnessInstalled` block runs. Without this call, a manual
 * snapshot taken inside such a block silently references a pre-harness buffer with no retained records,
 * which is indistinguishable from a real R4 case except that here it is a test-setup mistake, not a
 * genuine pre-install snapshot. `createSnapshotForCurrentTimepoint` is `public` on `SnapshotFactory`;
 * `snapshotFactory` itself is `protected` on `SnapshotManager` - same internals-reaching discipline as
 * `GameObjectIdRestore.spec.ts`.
 */
function forceFreshCurrentSnapshot(game: { snapshotManager: unknown }): void {
    const manager = game.snapshotManager as unknown as ISnapshotManagerFactoryInternals;
    manager.snapshotFactory.createSnapshotForCurrentTimepoint(SnapshotTimepoint.Action);
}

// Cast through `unknown` to reach `integration`'s own internal 2-arg form (enableUndo=true): every spec
// in this file needs a real rollback (UndoMode.Free), reliably, in every run mode - including `npm run
// test-parallel`/`test-parity` (ENABLE_UNDO_ALL_TESTS unset), where plain `integration(fn)` would run at
// UndoMode.Disabled and every snapshot/rollback call would silently no-op (plan.md §5 step 8).
const integrationWithUndo = integration as unknown as (
    definitions: (contextRef: SwuTestContextRef) => void,
    enableUndo: boolean
) => void;

describe('Restore parity harness', function() {
    describe('AC1: the restore leg installs and fires with the flag on, and is provably absent with the flag off', function() {
        integrationWithUndo(function(contextRef) {
            it('on: installed=true, rollbacksObserved and objectsCompared both increase; off: installed=false', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: { groundArena: ['wampa'], resources: 3 },
                    player2: { spaceArena: ['cartel-spacer'] }
                });
                const { context } = contextRef;

                const before = getParityHarnessStats();
                const snapshotId = contextRef.snapshot.takeManualSnapshot(context.player1Object);
                context.setDamage(context.wampa, 2);
                const rolledBack = contextRef.snapshot.rollbackToSnapshot({ type: 'manual', playerId: context.player1Object.id, snapshotId });
                expect(rolledBack).toBe(true);

                const parityOn = process.env.ENABLE_PARITY_HARNESS === 'true';
                const after = getParityHarnessStats();
                if (parityOn) {
                    expect(after.installed).toBe(true);
                    expect(after.rollbacksObserved).toBeGreaterThan(before.rollbacksObserved);
                    expect(after.objectsCompared).toBeGreaterThan(before.objectsCompared);
                } else {
                    expect(after.installed).toBe(false);
                }
            });
        }, true);
    });

    describe('AC2: a generated deserializer that silently drops a field is caught from dirty state', function() {
        integrationWithUndo(function(contextRef) {
            it('throws naming class/uuid/field when one field is left at its pre-rollback value', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: { groundArena: ['wampa'], resources: 3 },
                    player2: { spaceArena: ['cartel-spacer'] }
                });
                const { context } = contextRef;
                const wampa = context.wampa as unknown as GameObjectBase;
                const entry = getStateSerializerFor(wampa);
                const originalDeserialize = entry.serializer.deserialize;
                const className = (wampa as unknown as { constructor: { name: string } }).constructor.name;

                // Scoped to `wampa` specifically. Simulates a deserializer that silently fails to write
                // `_damage`: the real deserializer runs first (so every other field is correctly
                // restored), then the field is forced back to its pre-call (dirty) value - exactly what a
                // dropped-field bug would leave behind, regardless of how the generated write is shaped
                // internally.
                entry.serializer.deserialize = function(game, instance, record) {
                    if (instance !== wampa) {
                        originalDeserialize(game, instance, record);
                        return;
                    }
                    const before = (instance as unknown as Record<string, unknown>)._damage;
                    originalDeserialize(game, instance, record);
                    (instance as unknown as Record<string, unknown>)._damage = before;
                };

                try {
                    withParityHarnessInstalled(() => {
                        withRestoreMode('compare', () => {
                            // P3PA3-I1-01/P3PA3-I2-002/P3PA3-I3-1 fix: this spec's own deliberately-induced
                            // mismatch must not be the thing that consumes the one-shot injection hook
                            // (§4.8) when `PARITY_INJECT_RESTORE_MISMATCH` happens to be set and its target
                            // class matches this scenario's — that coincidence is what let AC14's escape
                            // proof pass on spec-order luck rather than proving the gate can fail.
                            // `withExpectedHarnessMismatch` also routes this spec's own harness error/failed
                            // rollback into the `deliberate*` counters (P3PA3-I1-03) instead of the absolute
                            // `harnessRestoreErrors`/`rollbacksFailed` ones.
                            withExpectedHarnessMismatch(() => {
                                forceFreshCurrentSnapshot(context.game);
                                const snapshotId = contextRef.snapshot.takeManualSnapshot(context.player1Object);
                                context.setDamage(context.wampa, 3);
                                // P3PA3-I1-10: tightened from asserting on message shape alone (which any
                                // same-shaped message from a different mechanism could also satisfy) to this
                                // scenario's own legacy/generated values — the legacy leg correctly restores
                                // `_damage` to the snapshot's recorded 0, while the deliberately-broken
                                // deserializer leaves the generated leg observing the dirty pre-rollback
                                // value of 3.
                                expect(() => contextRef.snapshot.rollbackToSnapshot({ type: 'manual', playerId: context.player1Object.id, snapshotId }))
                                    .toThrowError(new RegExp(`class=${className} uuid=${wampa.uuid} field="_damage" legacy=0 generated=3`));
                            });
                        });
                    });
                } finally {
                    entry.serializer.deserialize = originalDeserialize;
                }
            });
        }, true);
    });

    describe('AC3: the generated leg is isolated from the live pre-rollback bag', function() {
        integrationWithUndo(function(contextRef) {
            it('afterSetState still observes the dirty value, not the snapshot value', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: { groundArena: ['wampa'], resources: 3 },
                    player2: { spaceArena: ['cartel-spacer'] }
                });
                const { context } = contextRef;
                const wampa = context.wampa as unknown as { afterSetState(oldState: unknown): void };

                // Own-property (instance-level) patch, not a prototype patch: wampa's effective
                // `afterSetState` resolves through `WithDamage.prototype.afterSetState` (which nulls
                // `_activeAttack`), nearer in the prototype chain than `GameObjectBase.prototype`, so a
                // patch on `GameObjectBase.prototype` would never be reached for this instance. Shadowing
                // with an own property always wins the lookup regardless of chain depth - the same
                // technique `GameObjectIdRestore.spec.ts` uses for `setState`.
                const originalAfterSetState = wampa.afterSetState.bind(wampa);
                let observedOldDamage: unknown;
                wampa.afterSetState = function(oldState) {
                    observedOldDamage = (oldState as Record<string, unknown>)._damage;
                    originalAfterSetState(oldState);
                };

                try {
                    withParityHarnessInstalled(() => {
                        withRestoreMode('compare', () => {
                            forceFreshCurrentSnapshot(context.game);
                            const snapshotId = contextRef.snapshot.takeManualSnapshot(context.player1Object);
                            context.setDamage(context.wampa, 3);
                            const rolledBack = contextRef.snapshot.rollbackToSnapshot({ type: 'manual', playerId: context.player1Object.id, snapshotId });
                            expect(rolledBack).toBe(true);
                        });
                    });
                } finally {
                    delete (wampa as unknown as { afterSetState?: unknown }).afterSetState;
                }

                expect(observedOldDamage).toBe(3);
            });
        }, true);
    });

    describe('AC4 (forward-contract pin, not risk-directed - see plan.md §10): mutable ref collections restore as live wrappers under generated mode', function() {
        integrationWithUndo(function(contextRef) {
            it('DeckZone.deck comes back as an UndoArray that keeps mirroring into the bag after a generated-mode restore', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: { groundArena: ['wampa'], resources: 3, deck: ['cartel-spacer'] },
                    player2: { spaceArena: ['cartel-spacer'] }
                });
                const { context } = contextRef;

                withParityHarnessInstalled(() => {
                    withRestoreMode('generated', () => {
                        const before = getParityHarnessStats();
                        forceFreshCurrentSnapshot(context.game);
                        const snapshotId = contextRef.snapshot.takeManualSnapshot(context.player1Object);
                        context.setDamage(context.wampa, 2);
                        const rolledBack = contextRef.snapshot.rollbackToSnapshot({ type: 'manual', playerId: context.player1Object.id, snapshotId });
                        expect(rolledBack).toBe(true);
                        // P3PA3-I1-08: non-vacuousness guard. Without it, a `skippedPreInstall` regression
                        // (e.g. `forceFreshCurrentSnapshot` silently failing to produce retained records)
                        // would degrade this spec to a plain production rollback while it still passed, and
                        // its "restored through the generated path" claim would be false.
                        expect(getParityHarnessStats().objectsCompared).toBeGreaterThan(before.objectsCompared);

                        const deckZone = context.player1Object.deckZone;
                        expect(deckZone.deck.constructor.name).toBe('UndoArray');

                        const card = deckZone.deck[0];
                        (deckZone.deck as unknown as unknown[]).push(card);
                        const bagDeck = (deckZone.getStateUnsafe() as unknown as { _deck: string[] })._deck;
                        expect(bagDeck[bagDeck.length - 1]).toBe(card.uuid);
                        (deckZone.deck as unknown as unknown[]).pop();

                        const secondSnapshotId = contextRef.snapshot.takeManualSnapshot(context.player1Object);
                        const secondRolledBack = contextRef.snapshot.rollbackToSnapshot({ type: 'manual', playerId: context.player1Object.id, snapshotId: secondSnapshotId });
                        expect(secondRolledBack).toBe(true);
                    });
                });
            });
        }, true);
    });

    describe('AC5: zone membership survives a generated-path restore, in both directions, with no reconciliation step anywhere', function() {
        integrationWithUndo(function(contextRef) {
            it('a card played from hand to the ground arena is restored to hand on both sides of the membership after a generated-mode rollback', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: { hand: ['wampa'], resources: 6 },
                    player2: { spaceArena: ['cartel-spacer'] }
                });
                const { context } = contextRef;

                withParityHarnessInstalled(() => {
                    withRestoreMode('generated', () => {
                        const before = getParityHarnessStats();
                        forceFreshCurrentSnapshot(context.game);
                        const snapshotId = contextRef.snapshot.takeManualSnapshot(context.player1Object);

                        context.player1.clickCard(context.wampa);
                        expect(context.wampa).toBeInZone('groundArena');

                        const rolledBack = contextRef.snapshot.rollbackToSnapshot({ type: 'manual', playerId: context.player1Object.id, snapshotId });
                        expect(rolledBack).toBe(true);
                        // P3PA3-I1-08 non-vacuousness guard (see AC4).
                        expect(getParityHarnessStats().objectsCompared).toBeGreaterThan(before.objectsCompared);

                        // Current (correct) zone: card.zone and the hand's own card list agree.
                        expect(context.wampa).toBeInZone('hand');
                        expect(context.player1Object.handZone.cards).toContain(context.wampa);

                        // Stale-previous-zone direction - the one reconcileUpdatedCardZoneMemberships
                        // repairs first on -morph (plan.md §3): the ground arena's own raw card storage
                        // must no longer contain the card, checked via the raw backing field, never the
                        // public `cards` getter (plan.md §4.6).
                        const rawGroundArenaCards = (context.game.groundArena as unknown as { _cards: unknown[] })._cards;
                        expect(rawGroundArenaCards).not.toContain(context.wampa);
                    });
                });
            });
        }, true);
    });

    describe('AC6: rolling back twice to the same snapshot through the generated path is idempotent, with no retained-record aliasing', function() {
        integrationWithUndo(function(contextRef) {
            it('the second rollback matches the first, and the retained generated record set is unchanged from a copy taken at snapshot time', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: { groundArena: ['wampa'], resources: 3, deck: ['cartel-spacer'] },
                    player2: { spaceArena: ['cartel-spacer'] }
                });
                const { context } = contextRef;

                withParityHarnessInstalled(() => {
                    withRestoreMode('generated', () => {
                        const before = getParityHarnessStats();
                        forceFreshCurrentSnapshot(context.game);
                        const snapshotId = contextRef.snapshot.takeManualSnapshot(context.player1Object);
                        const buffer = getManualSnapshotContainer(context.game, context.player1Object.id).snapshots.get(snapshotId).states;

                        const recordsAtSnapshotTime = getRetainedGeneratedRecords(buffer);
                        expect(recordsAtSnapshotTime).toBeDefined();
                        const snapshotTimeCopy = JSON.stringify([...recordsAtSnapshotTime.entries()]);

                        context.setDamage(context.wampa, 2);
                        const firstRollback = contextRef.snapshot.rollbackToSnapshot({ type: 'manual', playerId: context.player1Object.id, snapshotId });
                        expect(firstRollback).toBe(true);
                        const firstDamage = context.wampa.damage;
                        const firstDeckLength = context.player1Object.deckZone.deck.length;

                        // P3PA3-I1-05 fix: mutate live state, including the ref array, non-reversibly
                        // between the two rollbacks to the same snapshot - a `.pop()` with no matching
                        // `.push()`. The prior pop-then-push round trip was net-zero on both the live array
                        // and the mirrored bag, so a decoder that aliased a retained record's array into
                        // live state would have the pop corrupt the record and the push silently repair it
                        // before the final comparison ran - the bare `.pop()` this replaces was the only
                        // thing that could have caught that, and this restores it. A bare pop is safe here:
                        // the forward zone-membership pass now diffs against a pre-rollback baseline
                        // (§4.6/`P3PA3-I1-06`) rather than excluding `DeckZone` outright, and the
                        // pre-rollback calibration pass for the *second* rollback below runs after this pop
                        // and so already has this card's now-orphaned membership in its own baseline - it is
                        // not reported as a new violation, and the reverse pass never iterates a card that is
                        // no longer in the deck's own backing array at all. The second rollback's generated
                        // restore is what must put the card back, non-reversibly proving idempotency rather
                        // than merely tolerating a round trip that never left a mark.
                        context.setDamage(context.wampa, 4);
                        const deck = context.player1Object.deckZone.deck as unknown as unknown[];
                        deck.pop();

                        const secondRollback = contextRef.snapshot.rollbackToSnapshot({ type: 'manual', playerId: context.player1Object.id, snapshotId });
                        expect(secondRollback).toBe(true);
                        expect(context.wampa.damage).toBe(firstDamage);
                        expect(context.player1Object.deckZone.deck.length).toBe(firstDeckLength);

                        const recordsAfter = getRetainedGeneratedRecords(buffer);
                        expect(deepEqualJson([...recordsAfter.entries()], JSON.parse(snapshotTimeCopy))).toBe(true);

                        // P3PA3-I1-08 non-vacuousness guard (see AC4).
                        expect(getParityHarnessStats().objectsCompared).toBeGreaterThan(before.objectsCompared);
                    });
                });
            });
        }, true);
    });

    describe('AC7: a failed rollback is never claimed as observed, and the nested recovery path is handled', function() {
        integrationWithUndo(function(contextRef) {
            it('a forced restore failure returns false, counts as rollbacksFailed (not rollbacksObserved), runs no zone observation, and recovers to the pre-attempt state', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: { groundArena: ['wampa'], resources: 3 },
                    player2: { spaceArena: ['cartel-spacer'] }
                });
                const { context } = contextRef;
                const wampa = context.wampa as unknown as GameObjectBase;
                const entry = getStateSerializerFor(wampa);
                const originalDeserialize = entry.serializer.deserialize;

                // One-shot: production's own recovery rolls back to `beforeRollbackSnapshot`, which
                // restores this same object through this same patched `deserialize` a second time. A
                // failure that fired on every call would also break the recovery attempt itself, which is
                // not what this criterion is about (that scenario is the "original itself throws" case,
                // R15, not the recoverable-failure case this spec targets).
                let hasFired = false;
                entry.serializer.deserialize = function(game, instance, record: SerializedStateRecord) {
                    if (instance === wampa && !hasFired) {
                        hasFired = true;
                        throw new Error('AC7_INJECTED_RESTORE_FAILURE');
                    }
                    originalDeserialize(game, instance, record);
                };

                try {
                    withParityHarnessInstalled(() => {
                        forceFreshCurrentSnapshot(context.game);
                        const snapshotId = contextRef.snapshot.takeManualSnapshot(context.player1Object);
                        context.setDamage(context.wampa, 2);

                        // Through the snapshot container directly (its own `rollbackToSnapshot`, not the
                        // test harness's `contextRef.snapshot.rollbackToSnapshot`, and never the raw state
                        // manager): a `beforeRollbackSnapshot` is only ever supplied on this path
                        // (`SnapshotContainerBase.ts:72`), which is what makes the recovered `null`/`false`
                        // reachable cleanly (plan.md §2, AC7's observable) rather than surfacing through
                        // `SnapshotManager.rollbackManualSnapshot`'s own `Contract.assertNotNullLike`, which
                        // does not distinguish "no such snapshot" from "rollback failed and recovered".
                        const container = getManualSnapshotContainer(context.game, context.player1Object.id);

                        const before = getParityHarnessStats();
                        let result: number | null | undefined;
                        let recordedError: Error | null = null;
                        withHarnessRethrowSuppressed(() => {
                            result = container.rollbackToSnapshot(snapshotId);
                            recordedError = getFirstHarnessError();
                        });
                        const after = getParityHarnessStats();

                        // The attempted rollback itself must be counted as failed, never as observed, and
                        // must run no zone observation of its own. Production's own recovery is a distinct,
                        // fully successful rollback to `beforeRollbackSnapshot` (restoring the whole live
                        // graph through the same patched `setState`), so it legitimately adds its own
                        // `rollbacksObserved`/`zoneChecks` increment - that is a second, real, successful
                        // rollback, not the failed one being double-counted (plan.md §4.4's counting rule
                        // is stated per rollback attempt, and the recovery is its own attempt).
                        expect(result).toBeNull();
                        // P3PA3-I1-03: this spec's own deliberately-induced failure runs inside
                        // `withHarnessRethrowSuppressed`, so it routes into `deliberateRollbackFailures`
                        // rather than the absolute `rollbacksFailed` gate (§4.7's "stays absolute in every
                        // case" now holds against a suite that includes this spec).
                        expect(after.deliberateRollbackFailures).toBe(before.deliberateRollbackFailures + 1);
                        expect(after.rollbacksFailed).toBe(before.rollbacksFailed);
                        expect(after.rollbacksObserved).toBe(before.rollbacksObserved + 1);
                        expect(after.zoneChecks).toBe(before.zoneChecks + 1);
                        // `P3PA3-D-06`: pins the deliberate-error count as well as the recorded message.
                        // `stashFirstHarnessError` keeps only the *first* error while routing every error to
                        // `deliberateHarnessErrors` (§4.7), so a genuine second mismatch raised later during
                        // this same suppressed rollback would otherwise be invisible in every counter this
                        // spec reads; asserting the exact delta makes an unexpected extra error fail this
                        // spec instead of passing silently alongside the expected one.
                        expect(after.deliberateHarnessErrors).toBe(before.deliberateHarnessErrors + 1);
                        expect(recordedError).not.toBeNull();
                        expect(recordedError.message).toContain('AC7_INJECTED_RESTORE_FAILURE');

                        // "Recovers to the pre-attempt state" (plan.md AC7's observable) means production's
                        // own recovery target (`beforeRollbackSnapshot`), not necessarily the live value one
                        // line above - that target tracks the snapshot bookkeeping's own "current" pointer,
                        // which in this scenario is the same pre-existing snapshot taken before this test's
                        // mutations. The robust proof that recovery left the game consistent, rather than
                        // pinning that exact intermediate value, is that the game is still in working
                        // order: a subsequent rollback to the original target snapshot still succeeds
                        // cleanly and reaches damage=0, the value that snapshot actually recorded.
                        const secondAttempt = container.rollbackToSnapshot(snapshotId);
                        expect(secondAttempt).not.toBeNull();
                        expect(context.wampa.damage).toBe(0);

                        context.ignoreUnresolvedActionPhasePrompts = true;
                    });
                } finally {
                    entry.serializer.deserialize = originalDeserialize;
                }
            });
        }, true);
    });
});
