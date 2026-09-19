import { getStateSerializerFor } from '../../../../server/game/core/StateSerializers';
import { Game } from '../../../../server/game/core/Game';
import type { GameConfiguration } from '../../../../server/game/core/GameInterfaces';
import { GameMode } from '../../../../server/GameMode';
import { UnitTestCardDataGetter } from '../../../../server/utils/cardData/UnitTestCardDataGetter';
import * as Settings from '../../../../server/Settings';
import DynamicOngoingEffectImpl from '../../../../server/game/core/ongoingEffect/effectImpl/DynamicOngoingEffectImpl';
import { OngoingCardEffect } from '../../../../server/game/core/ongoingEffect/OngoingCardEffect';
import { OngoingEffectValueWrapper, OngoingEffectValueWrapperBase } from '../../../../server/game/core/ongoingEffect/effectImpl/OngoingEffectValueWrapper';
import { MutableOngoingEffectValueWrapper, isSnapshotSafeOngoingEffectValue } from '../../../../server/game/core/ongoingEffect/effectImpl/MutableOngoingEffectValueWrapper';
import { EffectName } from '../../../../server/game/core/Constants';
import type { Card } from '../../../../server/game/core/card/Card';
import type { Player } from '../../../../server/game/core/Player';

/**
 * p1-a: eliminates allocate-then-compare churn and permanent pinning on the raw-value wrap path of
 * DynamicOngoingEffectImpl. See docs/plans/01-snapshot-hygiene.md work item A and .anvil/p1-a/handoff.md.
 */
describe('DynamicOngoingEffectImpl value wrapper reuse', function() {
    const cardDataGetter = new UnitTestCardDataGetter('test/json');
    const router = jasmine.createSpyObj('router', ['handleError', 'handleSerializationFailure']);

    function buildGameConfiguration(overrides: Partial<GameConfiguration> = {}): GameConfiguration {
        return {
            id: 'test-game-id',
            owner: 'player1',
            gameMode: GameMode.Premier,
            players: [
                Settings.getUserWithDefaultsSet({ id: 'player1', username: 'player1' }),
                Settings.getUserWithDefaultsSet({ id: 'player2', username: 'player2' }),
            ],
            allowSpectators: false,
            cardDataGetter,
            pushUpdate: () => true,
            buildSafeTimeout: () => undefined,
            userTimeoutDisconnect: () => undefined,
            ...overrides,
        };
    }

    /** Private on GameStateManager; read the same way test/scenarios/undo/Performance.spec.ts does. */
    interface IRegistrarInternals {
        lastGameObjectId: number;
        allGameObjects: { uuid: string }[];
    }

    function getRegistrar(game: Game): IRegistrarInternals {
        return game.gameObjectManager as unknown as IRegistrarInternals;
    }

    function buildFixture<TValue>(calculate: (target: any, context: any, game: Game) => TValue | OngoingEffectValueWrapperBase<TValue>, wrapValue?: (game: Game, value: TValue) => OngoingEffectValueWrapperBase<TValue>) {
        const game = new Game(buildGameConfiguration(), { router });
        const player = game.getPlayers()[0] as Player;
        // With no matchTarget/targetZoneFilter/targetCardTypeFilter/targetController, OngoingCardEffect takes
        // the targetsSourceOnly early return, so no zone machinery runs for this stub source.
        const source = { controller: player, canBeInPlay: () => false } as unknown as Card;
        const impl = new DynamicOngoingEffectImpl<TValue>(game, EffectName.ModifyStats, calculate, wrapValue);
        const effect = new OngoingCardEffect(game, source, {}, impl);
        const target = { uuid: 'stub-target' } as unknown as Card;
        return { game, impl, effect, target };
    }

    it('reports no change and allocates nothing across repeated calls when the value is unchanged', function() {
        const { game, impl, target } = buildFixture(() => ({ hp: 1, power: 1 }));

        // First application always registers the initial wrapper; only repeated recalculations of an
        // unchanged value are expected to allocate nothing.
        expect(impl.recalculate(target)).toBeTrue();

        const lastIdBefore = getRegistrar(game).lastGameObjectId;
        for (let i = 0; i < 5; i++) {
            expect(impl.recalculate(target)).toBeFalse();
        }
        expect(getRegistrar(game).lastGameObjectId).toBe(lastIdBefore);
    });

    it('tracks changed snapshot-safe values in place, reusing the same wrapper instance', function() {
        const values = [{ hp: 1, power: 1 }, { hp: 2, power: 2 }, { hp: 3, power: 3 }];
        let index = 0;
        const { game, impl, target } = buildFixture(() => values[index]);

        const lastIdBefore = getRegistrar(game).lastGameObjectId;

        expect(impl.recalculate(target)).toBeTrue();
        expect(impl.getValue(target)).toEqual(values[0]);
        const wrapperAfterFirst = (impl as any).values.get(target.uuid);
        expect(wrapperAfterFirst).toBeInstanceOf(MutableOngoingEffectValueWrapper);

        index = 1;
        expect(impl.recalculate(target)).toBeTrue();
        expect(impl.getValue(target)).toEqual(values[1]);
        expect((impl as any).values.get(target.uuid)).toBe(wrapperAfterFirst);

        index = 2;
        expect(impl.recalculate(target)).toBeTrue();
        expect(impl.getValue(target)).toEqual(values[2]);
        expect((impl as any).values.get(target.uuid)).toBe(wrapperAfterFirst);

        // Exactly one allocation for the whole run: the first application.
        expect(getRegistrar(game).lastGameObjectId).toBe(lastIdBefore + 1);
    });

    it('treats a nullish calculate() result as the coerced value on the second pass', function() {
        const { game, impl, target } = buildFixture(() => undefined);

        expect(impl.recalculate(target)).toBeTrue();
        expect(impl.getValue(target)).toBeTrue();

        const lastIdAfterFirst = getRegistrar(game).lastGameObjectId;
        expect(impl.recalculate(target)).toBeFalse();
        expect(impl.getValue(target)).toBeTrue();
        expect(getRegistrar(game).lastGameObjectId).toBe(lastIdAfterFirst);
    });

    it('allocates a fresh wrapper across a safe -> unsafe -> safe cycle and never reuses an evicted mutable wrapper', function() {
        let step = 0;
        const values: any[] = [{ hp: 1, power: 1 }, () => 42, { hp: 2, power: 2 }];
        const { game, impl, target } = buildFixture(() => values[step]);

        step = 0;
        expect(impl.recalculate(target)).toBeTrue();
        expect(impl.getValue(target)).toEqual(values[0]);
        const firstEntry = (impl as any).values.get(target.uuid);
        expect(firstEntry).toBeInstanceOf(MutableOngoingEffectValueWrapper);

        step = 1;
        expect(impl.recalculate(target)).toBeTrue();
        expect(impl.getValue(target)).toBe(values[1]);
        const secondEntry = (impl as any).values.get(target.uuid);
        expect(secondEntry).not.toBeInstanceOf(MutableOngoingEffectValueWrapper);
        expect(secondEntry).toBeInstanceOf(OngoingEffectValueWrapper);
        expect(secondEntry).not.toBe(firstEntry);

        step = 2;
        expect(impl.recalculate(target)).toBeTrue();
        expect(impl.getValue(target)).toEqual(values[2]);
        const thirdEntry = (impl as any).values.get(target.uuid);
        expect(thirdEntry).toBeInstanceOf(MutableOngoingEffectValueWrapper);
        expect(thirdEntry).not.toBe(firstEntry);
        expect(thirdEntry).not.toBe(secondEntry);

        // Every mutable-wrapper entry seen along the way must be serializable on its own. P3-PB2: observed
        // through the generated serializer and a JSON round trip, which is what the snapshot path now does,
        // rather than through the deleted state bag and v8.
        for (const entry of [firstEntry, thirdEntry]) {
            let record: unknown;
            expect(() => {
                record = getStateSerializerFor(entry).serializer.serialize(entry);
            }).not.toThrow();
            expect(() => JSON.parse(JSON.stringify(record))).not.toThrow();
        }
    });

    it('never stores a function or a GameObject-bearing value in a mutable (decorated-state) wrapper', function() {
        let step = 0;
        const { game, impl, target } = buildFixture((_target, _context, g) => {
            if (step === 0) {
                return (() => 1) as any;
            }
            return { holder: g.getPlayers()[1] } as any;
        });
        const otherPlayer = game.getPlayers()[1];

        step = 0;
        expect(impl.recalculate(target)).toBeTrue();
        const functionEntry = (impl as any).values.get(target.uuid);
        expect(functionEntry).not.toBeInstanceOf(MutableOngoingEffectValueWrapper);

        step = 1;
        expect(impl.recalculate(target)).toBeTrue();
        const gameObjectEntry = (impl as any).values.get(target.uuid);
        expect(gameObjectEntry).not.toBeInstanceOf(MutableOngoingEffectValueWrapper);
        expect(gameObjectEntry.getValue().holder).toBe(otherPlayer);
    });

    it('preserves the defensive path when calculate() returns a wrapper instance directly', function() {
        let wrapperInstance: OngoingEffectValueWrapperBase<any> = null;
        const { game, impl, target } = buildFixture((_target, _context, g) => {
            wrapperInstance = new OngoingEffectValueWrapper(g, { hp: 5, power: 5 });
            return wrapperInstance;
        });

        expect(impl.recalculate(target)).toBeTrue();
        expect((impl as any).values.get(target.uuid)).toBe(wrapperInstance);
    });

    describe('isSnapshotSafeOngoingEffectValue', function() {
        it('accepts primitives and nested plain objects/arrays', function() {
            expect(isSnapshotSafeOngoingEffectValue(null)).toBeTrue();
            expect(isSnapshotSafeOngoingEffectValue(undefined)).toBeTrue();
            expect(isSnapshotSafeOngoingEffectValue(1)).toBeTrue();
            expect(isSnapshotSafeOngoingEffectValue('a')).toBeTrue();
            expect(isSnapshotSafeOngoingEffectValue(true)).toBeTrue();
            expect(isSnapshotSafeOngoingEffectValue({ hp: 1, power: 2 })).toBeTrue();
            expect(isSnapshotSafeOngoingEffectValue([1, 2, { a: [3, 4] }])).toBeTrue();
        });

        it('rejects functions, foreign-prototype instances, GameObjects, and cycles', function() {
            const game = new Game(buildGameConfiguration(), { router });
            const player = game.getPlayers()[0];

            expect(isSnapshotSafeOngoingEffectValue(() => 1)).toBeFalse();
            expect(isSnapshotSafeOngoingEffectValue(new Map())).toBeFalse();
            expect(isSnapshotSafeOngoingEffectValue(new Date())).toBeFalse();
            expect(isSnapshotSafeOngoingEffectValue(player)).toBeFalse();
            expect(isSnapshotSafeOngoingEffectValue({ nested: { holder: player } })).toBeFalse();

            const cyclic: any = { a: 1 };
            cyclic.self = cyclic;
            expect(isSnapshotSafeOngoingEffectValue(cyclic)).toBeFalse();
        });

        it('accepts a shared-reference DAG (same object reachable via two paths) while still rejecting a true cycle', function() {
            // `a` is visited twice here but never appears on its own ancestor path, so this is not a cycle:
            // a naive "visited anywhere" set would misclassify it as one and wrongly reject it.
            const shared = ['x'];
            const dag = { primary: shared, secondary: shared };
            expect(isSnapshotSafeOngoingEffectValue(dag)).toBeTrue();

            // Also cover the case where the shared reference sits at sibling positions inside an array.
            const sharedObject = { label: 'shared' };
            expect(isSnapshotSafeOngoingEffectValue([sharedObject, sharedObject])).toBeTrue();

            const cyclic: any = { a: 1 };
            cyclic.self = cyclic;
            expect(isSnapshotSafeOngoingEffectValue(cyclic)).toBeFalse();
        });

        /**
         * `P3-PB2` fix (`PB2I1-CS-01`). Every value below was accepted by the hand-written predicate this
         * function replaced, because that predicate agreed with `v8.serialize` - the sink until the P3-PB2
         * cutover. `encodeStateValue` refuses all of them, so admitting one meant storing a payload that
         * makes the *next automatic snapshot capture* throw, on a path with no abort and no recovery: the
         * game breaks rather than the undo. Each case therefore fails against the old predicate and passes
         * only because this one asks the encoder.
         */
        it('rejects everything the state encoder refuses, so a blessed value can never break a later capture', function() {
            expect(isSnapshotSafeOngoingEffectValue(NaN)).toBeFalse();
            expect(isSnapshotSafeOngoingEffectValue(Infinity)).toBeFalse();
            expect(isSnapshotSafeOngoingEffectValue(-Infinity)).toBeFalse();
            expect(isSnapshotSafeOngoingEffectValue({ nested: { total: Infinity } })).toBeFalse();

            // An `undefined` array element: `JSON.stringify` would silently turn it into `null`, so the
            // encoder refuses it outright.
            expect(isSnapshotSafeOngoingEffectValue([1, undefined, 3])).toBeFalse();

            // Reserved tags and `__proto__` as own keys: indistinguishable from a tagged payload on decode,
            // and unstorable by the codec's own object assignment, respectively.
            expect(isSnapshotSafeOngoingEffectValue({ $map: [] })).toBeFalse();
            expect(isSnapshotSafeOngoingEffectValue({ $set: [] })).toBeFalse();
            expect(isSnapshotSafeOngoingEffectValue({ $num: 'NaN' })).toBeFalse();
            expect(isSnapshotSafeOngoingEffectValue(JSON.parse('{"__proto__": {"polluted": true}}'))).toBeFalse();

            // Still accepted, so the narrowing did not swallow the ordinary case: a finite number, and an
            // object property that holds `undefined` (which survives encoding unchanged).
            expect(isSnapshotSafeOngoingEffectValue(-0)).toBeTrue();
            expect(isSnapshotSafeOngoingEffectValue({ present: 1, absent: undefined })).toBeTrue();
        });
    });
});
