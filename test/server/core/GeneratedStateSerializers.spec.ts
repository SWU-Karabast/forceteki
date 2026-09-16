import v8 from 'node:v8';

import { GameObjectBase } from '../../../server/game/core/GameObjectBase';
import type { GameObjectId } from '../../../server/game/core/GameObjectUtils';
import { registerState, stateRefSet } from '../../../server/game/core/GameObjectUtils';
import { generatedStateSerializerEntries } from '../../../server/game/core/generated/GeneratedStateSerializers';
import { getStateSerializerFor } from '../../../server/game/core/StateSerializers';
import { decodeRefSet, encodeRefSet } from '../../../server/game/core/StateEncoding';
import type { SerializedStateRecord } from '../../../server/game/core/StateEncoding';

/**
 * Purpose-built fixture for P3PA1-IA-5's refSet coverage: `@stateRefSet` has zero live users in the engine
 * today (unlike `@stateRefMap`, exercised below via the real `StateWatcherRegistrar.watchers`), so there is
 * no existing class to reproduce the generated deserializer's "assign empty, then populate via live
 * .add()" workaround shape against. See ANVIL-LOG.md's `P3-PA1` entry for the underlying UndoSet/private-
 * field-during-super() issue this workaround exists to avoid.
 */
@registerState()
class RefSetWorkaroundFixture extends GameObjectBase {
    @stateRefSet() public accessor members: Set<GameObjectBase> = new Set();

    public override getGameObjectName(): string {
        return 'RefSetWorkaroundFixture';
    }
}

/** `GameStateManager` surface this spec needs to harvest every live GameObject's uuid without duplicating
 * the state-bag/removal logic here - `buildGameStateForSnapshot` is the exact method the real snapshot
 * path already calls (`Game.ts` -> `gameObjectManager`), just not exposed through the narrower
 * `IGameObjectRegistrar` interface type. Following the same local-internals-interface pattern as
 * `test/scenarios/undo/GameObjectIdRestore.spec.ts`. */
interface IStateManagerSnapshotInternals {
    buildGameStateForSnapshot(): Buffer;
}

function harvestLiveUuids(game: { gameObjectManager: unknown }): string[] {
    const manager = game.gameObjectManager as unknown as IStateManagerSnapshotInternals;
    const stateBuffer = manager.buildGameStateForSnapshot();
    return Object.keys(v8.deserialize(stateBuffer) as Record<string, unknown>);
}

/** Mirrors what `JSON.stringify` does to an `undefined` object property value (drops the key), so a
 * live record can be compared against its own JSON round trip without a false mismatch on that path. */
function normalizeUndefinedToAbsent(value: unknown): unknown {
    if (Array.isArray(value)) {
        return value.map((entry) => normalizeUndefinedToAbsent(entry));
    }
    if (value !== null && typeof value === 'object') {
        const out: Record<string, unknown> = {};
        for (const key of Object.keys(value as Record<string, unknown>)) {
            const entryValue = (value as Record<string, unknown>)[key];
            if (entryValue === undefined) {
                continue;
            }
            out[key] = normalizeUndefinedToAbsent(entryValue);
        }
        return out;
    }
    return value;
}

describe('Generated state serializers', function() {
    integration(function(contextRef) {
        async function setupBoard() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: { groundArena: ['wampa'], hand: ['vanquish'], resources: 3 },
                player2: { spaceArena: ['cartel-spacer'] }
            });
        }

        it('resolves a registry serializer, by prototype-chain walk, for every live GameObject in a played-out game', async function() {
            await setupBoard();
            const { context } = contextRef;

            const uuids = harvestLiveUuids(context.game);
            expect(uuids.length).toBeGreaterThan(0);

            for (const id of uuids) {
                const instance = context.game.getFromUuidUnsafe<GameObjectBase>(id as GameObjectId);
                expect(instance).not.toBeNull();
                expect(() => getStateSerializerFor(instance)).not.toThrow();
            }
        });

        it('a live Wampa resolves to NonLeaderUnitCard\'s serializer and its record carries the mixin-contributed fields', async function() {
            await setupBoard();
            const { context } = contextRef;

            const wampa = context.wampa as unknown as GameObjectBase;
            const entry = getStateSerializerFor(wampa);
            expect(entry.className).toBe('NonLeaderUnitCard');
            expect(entry.decorator).toBe('registerStateBase');
            expect(entry.isAbstract).toBe(false);

            const record = entry.serializer.serialize(wampa);
            for (const mixinField of ['_damage', '_attackEnabled', '_upgrades', '_captureZone']) {
                expect(Object.prototype.hasOwnProperty.call(record, mixinField)).toBe(true);
            }
        });

        it('registry entries carry decorator/abstract metadata, and the card-file-local registered classes are present', function() {
            const byName = new Map(generatedStateSerializerEntries.map((entry) => [entry.className, entry]));

            expect(byName.get('NonLeaderUnitCard')).toEqual(jasmine.objectContaining({ decorator: 'registerStateBase', isAbstract: false }));
            expect(byName.has('FirstLightSmuggleAction')).toBe(true);
            expect(byName.has('AdvantageAbility')).toBe(true);
            expect(byName.has('CustomDurationEvent')).toBe(true);
        });

        it('is side-effect-free: serializing every live object with GameObjectBase.prototype.getObjectId replaced by a throwing stub succeeds', async function() {
            await setupBoard();
            const { context } = contextRef;

            const uuids = harvestLiveUuids(context.game);

            // `harvestLiveUuids` goes through `buildGameStateForSnapshot`, which runs
            // `removeUnusedGameObjects()` first and drops every object with `hasRef === false` - so every
            // harvested instance already has `hasRef === true` and cannot have `cannotHaveRefs === true`.
            // A before/after comparison of those two flags across this loop would therefore be `true ===
            // true` by construction and can never fail; AC2 (no `getObjectId()` call, hence no `_hasRef`
            // latching) is carried entirely by the throwing stub below, which does fail loudly if any
            // encoder reads through `getObjectId()` instead of the plain `.uuid` getter.
            const originalGetObjectId = GameObjectBase.prototype.getObjectId;
            GameObjectBase.prototype.getObjectId = function() {
                throw new Error('getObjectId() must never be called by a generated serializer');
            };
            try {
                for (const id of uuids) {
                    const instance = context.game.getFromUuidUnsafe<GameObjectBase>(id as GameObjectId);
                    const entry = getStateSerializerFor(instance);
                    expect(() => entry.serializer.serialize(instance)).not.toThrow();
                }
            } finally {
                GameObjectBase.prototype.getObjectId = originalGetObjectId;
            }
        });

        it('every serialized record from a real game survives JSON.parse(JSON.stringify(record)) deep-equal, with undefined object properties normalized to absent', async function() {
            await setupBoard();
            const { context } = contextRef;

            const uuids = harvestLiveUuids(context.game);
            for (const id of uuids) {
                const instance = context.game.getFromUuidUnsafe<GameObjectBase>(id as GameObjectId);
                const entry = getStateSerializerFor(instance);
                const record = entry.serializer.serialize(instance);

                const roundTripped = JSON.parse(JSON.stringify(record)) as SerializedStateRecord;
                expect(roundTripped).toEqual(normalizeUndefinedToAbsent(record) as SerializedStateRecord);
            }
        });

        it('deserializing the pre-mutation record restores mutated fields, and a mutable ref collection is rewrapped (not just left with a correct-looking type) by the setter', async function() {
            await setupBoard();
            const { context } = contextRef;

            const uuids = harvestLiveUuids(context.game);
            const firstPass = new Map<string, SerializedStateRecord>();
            for (const id of uuids) {
                const instance = context.game.getFromUuidUnsafe<GameObjectBase>(id as GameObjectId);
                const entry = getStateSerializerFor(instance);
                firstPass.set(id, entry.serializer.serialize(instance));
            }

            const wampa = context.wampa as unknown as GameObjectBase & { damage: number; setDamageForStateInjection(value: number): void };
            const deckZone = context.player1Object.deckZone;
            const deckArrayBeforeDeserialize = deckZone.deck;

            // Mutate: damage the Wampa (a primitive field) and move a card between zones (a refArray
            // field on both the source and destination zone). This must actually change what a later
            // deserialize of the pre-mutation record would need to restore, or the assertions below would
            // pass vacuously even with a deleted deserialize body.
            wampa.setDamageForStateInjection(2);
            context.player1.moveCard(context.vanquish, 'discard');

            expect(wampa.damage).toBe(2);
            expect(context.player1.hand).not.toContain(context.vanquish);
            expect(context.player1.discard).toContain(context.vanquish);

            for (const id of uuids) {
                const instance = context.game.getFromUuidUnsafe<GameObjectBase>(id as GameObjectId);
                const entry = getStateSerializerFor(instance);
                entry.serializer.deserialize(context.game, instance, firstPass.get(id));
            }

            // The mutated fields are restored to their pre-mutation values.
            expect(wampa.damage).toBe(0);
            expect(context.player1.hand).toContain(context.vanquish);
            expect(context.player1.discard).not.toContain(context.vanquish);

            for (const id of uuids) {
                const instance = context.game.getFromUuidUnsafe<GameObjectBase>(id as GameObjectId);
                const entry = getStateSerializerFor(instance);
                expect(entry.serializer.serialize(instance)).toEqual(firstPass.get(id));
            }

            // `deckZone.deck` (a non-readonly `@stateRefArray`, hence an UndoArray) was untouched by the
            // mutation above, so its serialized content is unchanged by the restore - `.toBe('UndoArray')`
            // alone would already be true *before* deserialize ran and would not show the setter executed.
            // Asserting the reference itself changed does: the generated deserializer's refMap/refSet-style
            // "assign empty, then populate" shape always constructs a fresh UndoArray, so an unchanged
            // reference here would mean deserialize skipped this field's setter entirely.
            expect(deckZone.deck).not.toBe(deckArrayBeforeDeserialize);
            expect(deckZone.deck.constructor.name).toBe('UndoArray');
            expect(deckZone.deck).toEqual(deckArrayBeforeDeserialize);
        });

        it('the refMap workaround repopulates the state bag (the sole v8.serialize snapshot authority), not just the live backing field', async function() {
            await setupBoard();
            const { context } = contextRef;

            const registrar = context.game.stateWatcherRegistrar as unknown as GameObjectBase & { registeredWatchers: unknown[] };
            // GameStateBuilder registers every StateWatcherLibrary method during test setup (see that
            // file's own warning comment), so `watchers` is already populated - no need to register one
            // explicitly to exercise this.
            expect(registrar.registeredWatchers.length).toBeGreaterThan(0);

            const entry = getStateSerializerFor(registrar);
            const record = entry.serializer.serialize(registrar);
            entry.serializer.deserialize(context.game, registrar, record);

            const liveWatchers = (registrar as unknown as { watchers: Map<string, GameObjectBase> }).watchers;
            const stateBagWatchers = (registrar.getStateUnsafe() as unknown as Record<string, unknown>).watchers as Map<string, string>;

            expect(stateBagWatchers).not.toBeNull();
            expect(stateBagWatchers.size).toBe(liveWatchers.size);
            for (const [name, watcher] of liveWatchers) {
                expect(stateBagWatchers.get(name)).toBe(watcher.uuid);
            }
        });

        it('the refSet workaround repopulates the state bag, via a purpose-built fixture (refSet has zero live users to exercise this against)', async function() {
            await setupBoard();
            const { context } = contextRef;

            const fixture = new RefSetWorkaroundFixture(context.game);
            const wampa = context.wampa as unknown as GameObjectBase;
            const cartelSpacer = context.cartelSpacer as unknown as GameObjectBase;
            // Populate in place after the empty `init`, not by assigning a pre-populated Set - that is the
            // documented existing-engine usage pattern, and also the only way to avoid the very UndoSet/
            // private-field-during-super() crash this test exists to exercise the workaround for.
            fixture.members = new Set();
            fixture.members.add(wampa);
            fixture.members.add(cartelSpacer);

            // Reproduce the generated deserializer's exact code shape for a refSet field (StateEncoding.ts's
            // doc comment / ANVIL-LOG.md's "assign empty, then populate via live .set()/.add()" workaround):
            // encode, then assign an empty Set through the accessor, then populate via the live object's
            // own .add() - never assign a pre-populated Set directly (that reproduces the UndoSet/private-
            // field-during-super() crash the workaround exists to avoid).
            const encoded = encodeRefSet(fixture.members);
            const decoded = decodeRefSet<GameObjectBase>(context.game, encoded);
            fixture.members = new Set();
            for (const member of decoded) {
                fixture.members.add(member);
            }

            const stateBagMembers = (fixture.getStateUnsafe() as unknown as Record<string, unknown>).members as Set<string>;
            expect(stateBagMembers).not.toBeNull();
            expect(stateBagMembers.size).toBe(2);
            expect(stateBagMembers.has(wampa.uuid)).toBe(true);
            expect(stateBagMembers.has(cartelSpacer.uuid)).toBe(true);
        });
    });
});
