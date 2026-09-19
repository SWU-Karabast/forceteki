import { GameErrorSeverity } from '../../../server/game/core/Constants';
import { GameObjectBase } from '../../../server/game/core/GameObjectBase';
import type { IGameSnapshot } from '../../../server/game/core/snapshot/SnapshotInterfaces';
import { SnapshotTimepoint } from '../../../server/game/core/snapshot/SnapshotInterfaces';
import { getStateSerializerFor } from '../../../server/game/core/StateSerializers';
import type { SerializedStateRecord } from '../../../server/game/core/StateEncoding';
import {
    getFirstHarnessError,
    getParityHarnessStats,
    withDeserializePatchedBeneathHarness,
    withExpectedHarnessMismatch,
    withHarnessRethrowSuppressed,
    withParityHarnessInstalled,
} from '../../helpers/ParityHarness';

/**
 * Committed regression coverage for the restore-side parity harness. Originally P3-PA3's restore leg;
 * `P3-PB2` deleted the state bag, so the two comparison modes and the retained-record bookkeeping are gone
 * and each surviving case is repointed onto the post-cutover round-trip self-check.
 *
 * Two cases were removed rather than repointed, because their subject no longer exists: P3-PA3's AC3 (the
 * generated leg's isolation from the live pre-rollback bag - an artifact of compare mode; its real
 * contract, that `afterSetState` observes the pre-rollback value, is now carried by
 * `snapshot/RollbackLifecycleOrder.spec.ts`) and AC4 (`DeckZone.deck` keeps mirroring into the bag -
 * superseded by `snapshot/CutoverRestore.spec.ts`'s wrapper-and-latch case).
 *
 * `test/helpers/ParityHarness.ts` is imported directly (not just relied on via jasmine's helper auto-load)
 * so these specs can reach its exported functions.
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
                const className = (wampa as unknown as { constructor: { name: string } }).constructor.name;

                // Scoped to `wampa` specifically. Simulates a deserializer that silently fails to write
                // `_damage`: the real deserializer runs first (so every other field is correctly
                // restored), then the field is forced back to its pre-call (dirty) value - exactly what a
                // dropped-field bug would leave behind, regardless of how the generated write is shaped
                // internally.
                //
                // Installed through `withDeserializePatchedBeneathHarness`, never by assigning
                // `entry.serializer.deserialize` directly: P3-PB2 moved the harness's seam onto that same
                // property, so a direct assignment would sit *outside* the harness's check with the flag on
                // (module-load install) and *inside* it with the flag off - i.e. this spec would silently
                // stop testing anything in one of the two required parity runs.
                const makePatch = (original) => function(game, instance, record: SerializedStateRecord) {
                    if (instance !== wampa) {
                        original(game, instance, record);
                        return;
                    }
                    const before = (instance as unknown as Record<string, unknown>)._damage;
                    original(game, instance, record);
                    (instance as unknown as Record<string, unknown>)._damage = before;
                };

                {
                    withParityHarnessInstalled(() => {
                        // P3PA3-I1-01/P3PA3-I2-002/P3PA3-I3-1 fix: this spec's own deliberately-induced
                        // mismatch must not be the thing that consumes the one-shot injection hook when
                        // `PARITY_INJECT_RESTORE_MISMATCH` happens to be set and its target class matches
                        // this scenario's — that coincidence is what let the escape proof pass on spec-order
                        // luck rather than proving the gate can fail. `withExpectedHarnessMismatch` also
                        // routes this spec's own harness error/failed rollback into the `deliberate*`
                        // counters (P3PA3-I1-03) instead of the absolute
                        // `harnessRestoreErrors`/`rollbacksFailed` ones.
                        withExpectedHarnessMismatch(() => {
                            forceFreshCurrentSnapshot(context.game);
                            const snapshotId = contextRef.snapshot.takeManualSnapshot(context.player1Object);
                            context.setDamage(context.wampa, 3);
                            withDeserializePatchedBeneathHarness(entry, makePatch, () => {
                                // Tightened to this scenario's own values rather than message shape alone:
                                // the record the deserializer was handed carries the snapshot's recorded
                                // `_damage` of 0, while the deliberately-broken deserializer leaves the live
                                // instance at the dirty pre-rollback value of 3, so the round-trip compare
                                // sees old=0 new=3.
                                expect(() => contextRef.snapshot.rollbackToSnapshot({ type: 'manual', playerId: context.player1Object.id, snapshotId }))
                                    .toThrowError(new RegExp(`class=${className} uuid=${wampa.uuid} field="_damage".* old=0 new=3`));
                            });
                        });
                    });
                }
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
                    const before = getParityHarnessStats();
                    forceFreshCurrentSnapshot(context.game);
                    const snapshotId = contextRef.snapshot.takeManualSnapshot(context.player1Object);

                    context.player1.clickCard(context.wampa);
                    expect(context.wampa).toBeInZone('groundArena');

                    const rolledBack = contextRef.snapshot.rollbackToSnapshot({ type: 'manual', playerId: context.player1Object.id, snapshotId });
                    expect(rolledBack).toBe(true);
                    // P3PA3-I1-08 non-vacuousness guard: without it, a harness that silently failed to wrap
                    // would degrade this spec to a plain production rollback while it still passed.
                    expect(getParityHarnessStats().objectsCompared).toBeGreaterThan(before.objectsCompared);

                    // Current (correct) zone: card.zone and the hand's own card list agree.
                    expect(context.wampa).toBeInZone('hand');
                    expect(context.player1Object.handZone.cards).toContain(context.wampa);

                    // Stale-previous-zone direction - the one reconcileUpdatedCardZoneMemberships
                    // repairs first on -morph: the ground arena's own raw card storage must no longer
                    // contain the card, checked via the raw backing field, never the public `cards` getter.
                    const rawGroundArenaCards = (context.game.groundArena as unknown as { _cards: unknown[] })._cards;
                    expect(rawGroundArenaCards).not.toContain(context.wampa);
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
                    {
                        const before = getParityHarnessStats();
                        forceFreshCurrentSnapshot(context.game);
                        const snapshotId = contextRef.snapshot.takeManualSnapshot(context.player1Object);
                        // P3-PB2: `snapshot.states` *is* the retained record map now, so the separate
                        // retained-record WeakMap the harness used to keep is gone and this reads production's
                        // own retained object directly - a strictly stronger observation point.
                        const retainedStates = getManualSnapshotContainer(context.game, context.player1Object.id).snapshots.get(snapshotId).states;

                        expect(Object.keys(retainedStates).length).toBeGreaterThan(0);
                        const snapshotTimeCopy = JSON.stringify(retainedStates);

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

                        expect(deepEqualJson(retainedStates, JSON.parse(snapshotTimeCopy))).toBe(true);

                        // P3PA3-I1-08 non-vacuousness guard (see AC5).
                        expect(getParityHarnessStats().objectsCompared).toBeGreaterThan(before.objectsCompared);
                    }
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

                // One-shot: production's own recovery rolls back to `beforeRollbackSnapshot`, which
                // restores this same object through this same patched `deserialize` a second time. A
                // failure that fired on every call would also break the recovery attempt itself, which is
                // not what this criterion is about (that scenario is the "original itself throws" case,
                // R15, not the recoverable-failure case this spec targets).
                //
                // Installed beneath the harness for the reason AC2 documents above: P3-PB2 moved the
                // harness's seam onto this same property, so a direct assignment would be mode-dependent.
                let hasFired = false;
                const makePatch = (original) => function(game, instance, record: SerializedStateRecord) {
                    if (instance === wampa && !hasFired) {
                        hasFired = true;
                        throw new Error('AC7_INJECTED_RESTORE_FAILURE');
                    }
                    original(game, instance, record);
                };

                {
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
                            withDeserializePatchedBeneathHarness(entry, makePatch, () => {
                                result = container.rollbackToSnapshot(snapshotId);
                            });
                            recordedError = getFirstHarnessError();
                        });
                        const after = getParityHarnessStats();

                        // The attempted rollback itself must be counted as failed, never as observed, and
                        // must run no zone observation of its own. Production's own recovery is a distinct,
                        // fully successful rollback to `beforeRollbackSnapshot` (restoring the whole live
                        // graph through the same patched `deserialize`), so it legitimately adds its own
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
                        // Non-vacuity: the injection really did fire, so the counter assertions above
                        // describe a real failed rollback rather than a no-op.
                        expect(hasFired).toBe(true);
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
                }
            });
        }, true);
    });

    /**
     * `P3-PB2` (`PB2-C13`). A **sibling** of AC7, deliberately not an extension of it. AC7 pins the
     * *recovery* path for a `deserialize` failure and asserts `rollbacksObserved` **+1** and `zoneChecks`
     * **+1**, because production's recovery rollback is itself a second, genuinely successful rollback that
     * the harness counts. The `oldState` pre-pass abort has no recovery leg at all, so its counter signature
     * is the exact inverse on those two counters - which is what makes "recovered" and "never started"
     * directly distinguishable, and why folding this into AC7 would put two contradictory accounting
     * stories in one case.
     *
     * The injection must be **persistent**, unlike AC7's one-shot: an `oldState` encode throw is
     * deterministic (its cause is the object's own payload, and `serialize` precedes any mutation of it), so
     * a one-shot injection would exercise a path the real defect cannot take.
     */
    describe('PB2-C13: a persistent encoder throw in the oldState pre-pass aborts the rollback before any state is modified', function() {
        integrationWithUndo(function(contextRef) {
            it('returns null, attempts no recovery rollback, and leaves every observable at its pre-attempt value', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: { hand: ['wampa'], resources: 6 },
                    player2: { spaceArena: ['cartel-spacer'] }
                });
                const { context } = contextRef;

                withParityHarnessInstalled(() => {
                    forceFreshCurrentSnapshot(context.game);
                    const snapshotId = contextRef.snapshot.takeManualSnapshot(context.player1Object);

                    // Pre-mutation traffic: all of it must happen BEFORE the patch is installed, because
                    // `buildGameStateForSnapshot` calls `serialize` on every object on every capture and
                    // captures happen on every action tick. (AC7 gets away with patching earlier only
                    // because it patches `deserialize`, which capture never calls.)
                    context.player1.clickCard(context.wampa);
                    expect(context.wampa).toBeInZone('groundArena');
                    context.setDamage(context.wampa, 2);

                    const wampa = context.wampa as unknown as GameObjectBase;
                    const entry = getStateSerializerFor(wampa);
                    const originalSerialize = entry.serializer.serialize;

                    const container = getManualSnapshotContainer(context.game, context.player1Object.id);
                    const gameStateBefore = (context.game as unknown as { state: unknown }).state;
                    const before = getParityHarnessStats();

                    // `reportError` must be stubbed, and the stub is what models *production*, not a
                    // convenience. `IntegrationHelper`'s router spy rethrows for every severity
                    // (`IntegrationHelper.js:80`), whereas `Lobby.handleError` only reaches `throw error`
                    // for `SevereHaltGame` (`Lobby.ts:1848`) - `SevereGameMessageOnly` returns normally, so
                    // in production the alert and the `return false` below the report are reached. Without
                    // this stub the spec would observe the test router's behavior instead of the engine's.
                    const gameForReport = context.game as unknown as { reportError(error: Error, severity: unknown): void };
                    const originalReportError = gameForReport.reportError.bind(context.game);
                    const reportedSeverities: unknown[] = [];
                    gameForReport.reportError = function(error: Error, severity: unknown) {
                        reportedSeverities.push(severity);
                    };

                    let result: number | null | undefined;
                    try {
                        // Persistent, scoped to this one instance, installed immediately before the call.
                        entry.serializer.serialize = function(instance) {
                            if (instance === wampa) {
                                throw new Error('PB2_C13_INJECTED_ENCODE_FAILURE');
                            }
                            return originalSerialize(instance);
                        };

                        withHarnessRethrowSuppressed(() => {
                            result = container.rollbackToSnapshot(snapshotId);
                        });
                    } finally {
                        // Restored before anything that could capture again, so the next automatic capture
                        // does not throw and get the failure attributed to the wrong thing.
                        entry.serializer.serialize = originalSerialize;
                        gameForReport.reportError = originalReportError;
                    }

                    // The abort filed exactly one non-fatal severe report: the player alert below it claims
                    // a report was made, and this is what keeps that claim true.
                    expect(reportedSeverities).toEqual([GameErrorSeverity.SevereGameMessageOnly]);

                    const after = getParityHarnessStats();

                    // The rollback never started.
                    expect(result).toBeNull();
                    // No recovery rollback ran: a recovery would be a second, successful rollback and would
                    // increment both of these, which is exactly AC7's signature.
                    expect(after.rollbacksObserved).toBe(before.rollbacksObserved);
                    expect(after.zoneChecks).toBe(before.zoneChecks);
                    // The failure is still counted, routed to the deliberate bucket by the suppression scope.
                    expect(after.deliberateRollbackFailures).toBe(before.deliberateRollbackFailures + 1);
                    expect(after.rollbacksFailed).toBe(before.rollbacksFailed);
                    // The harness itself raised nothing - this is a production abort, not a parity mismatch.
                    expect(after.harnessRestoreErrors).toBe(before.harnessRestoreErrors);

                    // Every observable a successful rollback would have changed is unmoved.
                    expect(context.wampa.damage).toBe(2);
                    expect(context.wampa).toBeInZone('groundArena');
                    expect(context.player1Object.handZone.cards).not.toContain(context.wampa);
                    expect((context.game as unknown as { state: unknown }).state).toBe(gameStateBefore);
                });
            });
        }, true);
    });

    /**
     * `P3-PB2` fix, `PB2I1-OPR-01`. The third sibling of AC7 and `PB2-C13`, covering the interaction
     * between them: an outer rollback that fails *after* mutating state (AC7's shape) whose **recovery**
     * rollback then aborts in its own `oldState` pre-pass (`PB2-C13`'s shape).
     *
     * At HEAD this combination could not exist. The nested recovery call could only return `true` or throw,
     * so `GameStateManager.rollbackToSnapshot` discarding its result was safe by construction. The pre-pass
     * added a third outcome - `return false` - and a discarded `false` there means the caller is handed the
     * benign "the undo just didn't happen" alert over a graph that has already had `game.state` replaced
     * and part of its objects deserialized.
     *
     * Falsifier: with the `if (!this.rollbackToSnapshot(...)) throw` removed, `severeReports` is empty, the
     * call returns `null` instead of throwing, and the benign alert is emitted twice instead of once.
     */
    describe('PB2I1-OPR-01: a recovery rollback that aborts in its own pre-pass escalates instead of looking like a recovered undo', function() {
        integrationWithUndo(function(contextRef) {
            it('reports a severe rollback failure and propagates, rather than returning a recovered-looking null', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: { hand: ['wampa'], resources: 6 },
                    player2: { spaceArena: ['cartel-spacer'] }
                });
                const { context } = contextRef;

                withParityHarnessInstalled(() => {
                    forceFreshCurrentSnapshot(context.game);
                    const snapshotId = contextRef.snapshot.takeManualSnapshot(context.player1Object);

                    // Same pre-mutation discipline as PB2-C13: every capture calls `serialize` on every
                    // object, so all board traffic happens before the serialize patch is installed.
                    context.player1.clickCard(context.wampa);
                    expect(context.wampa).toBeInZone('groundArena');
                    context.setDamage(context.wampa, 2);

                    const wampa = context.wampa as unknown as GameObjectBase;
                    const entry = getStateSerializerFor(wampa);
                    const originalSerialize = entry.serializer.serialize;
                    const container = getManualSnapshotContainer(context.game, context.player1Object.id);

                    const gameStubs = context.game as unknown as {
                        reportError(error: Error, severity: unknown): void;
                        reportSevereRollbackFailure(error: Error): void;
                        addAlert(type: unknown, message: string): void;
                    };
                    const originalReportError = gameStubs.reportError.bind(context.game);
                    const originalReportSevere = gameStubs.reportSevereRollbackFailure.bind(context.game);
                    const originalAddAlert = gameStubs.addAlert.bind(context.game);
                    const severeReports: Error[] = [];
                    const alerts: string[] = [];

                    // `reportError` must not throw, for PB2-C13's reason: IntegrationHelper's router spy
                    // rethrows every severity, whereas `Lobby.handleError` returns normally for
                    // `SevereGameMessageOnly`. Leaving it unstubbed would make the *inner* pre-pass abort
                    // propagate as an exception instead of returning false, which is the one outcome this
                    // case exists to produce - and the outer catch would then escalate with or without the
                    // fix, making the case vacuous.
                    gameStubs.reportError = function() {
                        // Intentionally silent: models Lobby.handleError returning normally for
                        // SevereGameMessageOnly, which IntegrationHelper's router spy does not.
                    };
                    gameStubs.reportSevereRollbackFailure = function(error: Error) {
                        severeReports.push(error);
                        // Production's own contract, and what the real method already does under
                        // NODE_ENV=test: it always throws, so control never continues past the call.
                        throw error;
                    };
                    gameStubs.addAlert = function(_type: unknown, message: string) {
                        alerts.push(message);
                    };

                    // Two injections, in sequence:
                    //   1. a one-shot `deserialize` throw puts the OUTER frame into its recovery leg, after
                    //      `game.state` has already been replaced and objects have been deserialized;
                    //   2. from that instant, `serialize(wampa)` throws, so the RECOVERY frame's own
                    //      pre-pass aborts and returns false - the outcome HEAD could not produce.
                    let deserializeFired = false;
                    let prePassShouldThrow = false;
                    const makePatch = (original) => function(game, instance, record: SerializedStateRecord) {
                        if (instance === wampa && !deserializeFired) {
                            deserializeFired = true;
                            prePassShouldThrow = true;
                            throw new Error('OPR01_INJECTED_RESTORE_FAILURE');
                        }
                        original(game, instance, record);
                    };

                    let thrown: Error | null = null;
                    let result: number | null | undefined;
                    try {
                        entry.serializer.serialize = function(instance) {
                            if (prePassShouldThrow && instance === wampa) {
                                throw new Error('OPR01_INJECTED_PREPASS_FAILURE');
                            }
                            return originalSerialize(instance);
                        };

                        withHarnessRethrowSuppressed(() => {
                            withDeserializePatchedBeneathHarness(entry, makePatch, () => {
                                try {
                                    result = container.rollbackToSnapshot(snapshotId);
                                } catch (error) {
                                    thrown = error as Error;
                                }
                            });
                        });
                    } finally {
                        entry.serializer.serialize = originalSerialize;
                        gameStubs.reportError = originalReportError;
                        gameStubs.reportSevereRollbackFailure = originalReportSevere;
                        gameStubs.addAlert = originalAddAlert;
                    }

                    // Non-vacuity: the scenario really was constructed, not skipped over.
                    expect(deserializeFired).toBe(true);
                    expect(prePassShouldThrow).toBe(true);

                    // The escalation. Exactly one severe report, and it left the method by throwing rather
                    // than returning a value a caller would read as "recovered".
                    expect(severeReports.length).toBe(1);
                    expect(thrown).not.toBeNull();
                    expect(result).toBeUndefined();

                    // Exactly one benign alert - the inner pre-pass abort's own, which is truthful about
                    // that frame. The discarded-false behavior emitted a second one from the outer frame
                    // describing a torn graph as an ordinary failed undo.
                    expect(alerts.length).toBe(1);

                    // The engine is still usable afterwards: a clean retry with no injections in place
                    // reaches the target snapshot, so the assertions above describe an escalation, not a
                    // wedged fixture.
                    expect(container.rollbackToSnapshot(snapshotId)).not.toBeNull();
                    expect(context.wampa).toBeInZone('hand');

                    context.ignoreUnresolvedActionPhasePrompts = true;
                });
            });
        }, true);
    });
});
