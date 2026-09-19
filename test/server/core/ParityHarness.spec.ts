import { GameObjectBase } from '../../../server/game/core/GameObjectBase';
import { getStateSerializerFor } from '../../../server/game/core/StateSerializers';
import type { SerializedStateRecord } from '../../../server/game/core/StateEncoding';
import { compareRoundTrip, getParityHarnessStats } from '../../helpers/ParityHarness';

/**
 * Committed regression coverage for the parity harness's comparator. Through Plan 3 Phase A this file
 * covered the two-leg serialize comparison (`compareSnapshotRecords`, `P3-PA2`'s AC1-AC5/AC9). `P3-PB2`
 * deleted the state bag, so there is no second leg; every case below is repointed onto
 * `compareRoundTrip(instance, record)`, the post-cutover invariant that replaced it - re-serialize a
 * restored instance and deep-compare it to the record it was handed. The comparator's normalizer, tag
 * dispatch and failure text are unchanged, so these cases keep guarding the same mechanisms.
 *
 * `P3-PA2`'s AC3 (the `undefined`(bag) / `null`(encoder) leniency) is gone with its four cases: the
 * exception existed only because one side of the comparison was the bag, which stored
 * `newValue?.getObjectId()` and therefore `undefined` for an unset ref. With both sides now encoder
 * output, keeping the leniency would be an unjustified rule that could only mask a real mismatch.
 *
 * `test/helpers/ParityHarness.ts` is imported directly (not just relied on via jasmine's helper auto-load)
 * so these specs can reach its exported functions.
 */

describe('Parity harness', function() {
    describe('AC1: install evidence, meaningful in both flag modes', function() {
        // Cast through `unknown` to reach `integration`'s own internal 2-arg form (enableUndo=true):
        // this spec must force a real snapshot and rollback reliably in every run mode, including
        // `npm run test-parallel`/`test-parity` where `ENABLE_UNDO_ALL_TESTS` is unset. Using the
        // `undoIntegration` marker instead would make this spec become a no-op `xit` stub whenever
        // `ENABLE_UNDO_ALL_TESTS=true` (`test-parallel-undo`/`test-parity-undo`), which would leave it
        // pending rather than passing in exactly the runs the escape proof requires it to pass in.
        const integrationWithUndo = integration as unknown as (
            definitions: (contextRef: SwuTestContextRef) => void,
            enableUndo: boolean
        ) => void;

        integrationWithUndo(function(contextRef) {
            it('with the flag on, the registry deserializers are wrapped and a real rollback drives the comparator; with the flag off, the harness stays uninstalled', async function() {
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
                    // Non-vacuity: a harness that installed but wrapped nothing, or wrapped everything but
                    // never ran, would otherwise be indistinguishable from a working one.
                    expect(after.wrappedDeserializers).toBeGreaterThan(0);
                    expect(after.objectsCompared).toBeGreaterThan(before.objectsCompared);
                    expect(after.fieldsCompared).toBeGreaterThan(before.fieldsCompared);

                    // P3-PB2 fix (PB2I1-OPR-06 / PB2I1-AC-08): the wrapper-identity check's own non-vacuity,
                    // asserted rather than narrated in a comment. A `FieldKind` rename or a guard that only
                    // matched `refSet` (zero live uses) would drive this to zero; a regression that silenced
                    // most of the enumeration would still clear a bare `> 0`. The floor is expressed against
                    // `objectsCompared` because the real ratio is structural, not a tuned constant: every
                    // `GameObject` carries `_ongoingEffects` (`@stateRefArray(false)`), so the measured ratio
                    // across a full undo suite is ~0.51 (wrapperFieldsChecked 143853 / objectsCompared
                    // 284367). One eighth leaves a 4x margin over that while still failing a 90% silencing.
                    const objectsDelta = after.objectsCompared - before.objectsCompared;
                    const wrapperFieldsDelta = after.wrapperFieldsChecked - before.wrapperFieldsChecked;
                    expect(wrapperFieldsDelta).toBeGreaterThan(objectsDelta / 8);
                } else {
                    expect(after.installed).toBe(false);
                }
            });
        }, true);
    });

    describe('AC2: compareRoundTrip is side-effect-free', function() {
        integration(function(contextRef) {
            it('never calls getObjectId() while re-serializing a real instance', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: { groundArena: ['wampa'], resources: 3 },
                    player2: { spaceArena: ['cartel-spacer'] }
                });
                const { context } = contextRef;
                const wampa = context.wampa as unknown as GameObjectBase;
                // Production call, outside the stub below - this is the exact record shape the real restore
                // path hands `deserialize`.
                const record = getStateSerializerFor(wampa).serializer.serialize(wampa);

                const originalGetObjectId = GameObjectBase.prototype.getObjectId;
                GameObjectBase.prototype.getObjectId = function() {
                    throw new Error('getObjectId() must never be called by compareRoundTrip');
                };
                try {
                    expect(() => compareRoundTrip(wampa, record)).not.toThrow();
                } finally {
                    GameObjectBase.prototype.getObjectId = originalGetObjectId;
                }
            });
        });
    });

    describe('AC4: Map/Set members are compared in iteration order, never sorted', function() {
        integration(function(contextRef) {
            async function setupBoard() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: { groundArena: ['wampa'], resources: 3 },
                    player2: { spaceArena: ['cartel-spacer'] }
                });
            }

            it('an ordered Map fixture (StateWatcherRegistrar.watchers) round-trips clean', async function() {
                await setupBoard();
                const { context } = contextRef;
                const registrar = context.game.stateWatcherRegistrar as unknown as GameObjectBase;
                const record = getStateSerializerFor(registrar).serializer.serialize(registrar);

                expect(() => compareRoundTrip(registrar, record)).not.toThrow();
            });

            it('the same members in reversed order in the expected record are reported as a mismatch, proving no sort happens before comparison', async function() {
                await setupBoard();
                const { context } = contextRef;
                const registrar = context.game.stateWatcherRegistrar as unknown as GameObjectBase;
                const record = getStateSerializerFor(registrar).serializer.serialize(registrar) as { watchers: { $map: [string, unknown][] } | null };
                expect(record.watchers).not.toBeNull();
                expect(record.watchers.$map.length).toBeGreaterThanOrEqual(2);

                const reversed = { ...record, watchers: { $map: [...record.watchers.$map].reverse() } } as unknown as SerializedStateRecord;
                expect(() => compareRoundTrip(registrar, reversed)).toThrowError(/field="watchers/);
            });
        });
    });

    describe('AC5: an injected mismatch fails the currently-running spec loudly, naming class/uuid/field', function() {
        integration(function(contextRef) {
            it('fails with the expected class/uuid/field text while the record diverges, and passes against the true record', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: { groundArena: ['wampa'], resources: 3 },
                    player2: { spaceArena: ['cartel-spacer'] }
                });
                const { context } = contextRef;
                const wampa = context.wampa as unknown as GameObjectBase;
                const className = (wampa as unknown as { constructor: { name: string } }).constructor.name;
                const record = getStateSerializerFor(wampa).serializer.serialize(wampa);

                // Exactly what a deserializer that silently failed to write `_damage` would leave behind:
                // the live instance disagrees with the record it was handed, on one field.
                const diverged = { ...record, _damage: (record._damage as number ?? 0) + 1 };
                expect(() => compareRoundTrip(wampa, diverged)).toThrowError(
                    new RegExp(`class=${className} uuid=${wampa.uuid} field="_damage"`)
                );

                // The true record still compares cleanly, so the failure above is the injection, not drift.
                expect(() => compareRoundTrip(wampa, record)).not.toThrow();
            });
        });
    });

    describe('AC9: an unhandled reserved tag is reported as a failure naming the tag, never compared leniently as a plain object', function() {
        integration(function(contextRef) {
            it('throws naming the tag when a compared value carries a reserved tag with no comparator branch ($num)', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: { groundArena: ['wampa'], resources: 3 },
                    player2: { spaceArena: ['cartel-spacer'] }
                });
                const { context } = contextRef;
                const wampa = context.wampa as unknown as GameObjectBase;
                const entry = getStateSerializerFor(wampa);
                const originalSerialize = entry.serializer.serialize;

                entry.serializer.serialize = () => ({ someField: { $num: 'NaN' } });
                try {
                    expect(() => compareRoundTrip(wampa, { someField: 'anything' })).toThrowError(/reserved tag "\$num"/);
                } finally {
                    entry.serializer.serialize = originalSerialize;
                }
            });
        });
    });
});
