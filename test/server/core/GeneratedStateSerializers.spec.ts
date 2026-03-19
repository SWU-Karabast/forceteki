import type { Game } from '../../../server/game/core/Game';
import type { GameObjectBase, IGameObjectBaseState } from '../../../server/game/core/GameObjectBase';
import { ensureStateSerializersRegistered, getStateDeltaSerializer, stateDeltaSerializerRegistry, stateSerializerRegistry, type SerializedGameObjectStateMap, type SerializerInstance, type StateSerializer } from '../../../server/game/core/StateSerializers';

interface TestSerializerManager {
    buildGameStateForSnapshot(): SerializedGameObjectStateMap;
    getSerializer(gameObject: GameObjectBase): StateSerializer;
    getUnsafe<T extends GameObjectBase>(uuid: string): T;
}

describe('Generated state serializers', function() {
    undoIntegration(function(contextRef) {
        beforeEach(function() {
            return contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['battlefield-marine'],
                    groundArena: ['wampa']
                },
                player2: {
                    hand: ['battlefield-marine']
                }
            });
        });

        it('composes serializer state across base classes and mixins', function() {
            const { context } = contextRef;
            const manager = context.game.gameObjectManager as unknown as TestSerializerManager;

            const playerSerializer = manager.getSerializer(context.player1Object);
            const playerState = playerSerializer.serialize(context.player1Object as unknown as SerializerInstance);

            expect(playerState).toEqual(jasmine.objectContaining({
                _uuid: context.player1Object.uuid,
                _name: context.player1Object.name,
                _handZone: context.player1Object.handZone.getObjectId(),
                _deckZone: context.player1Object.deckZone.getObjectId(),
                _costAdjusters: [],
            }));

            const unitSerializer = manager.getSerializer(context.wampa);
            const unitState = unitSerializer.serialize(context.wampa as unknown as SerializerInstance);

            expect(unitState).toEqual(jasmine.objectContaining({
                _uuid: context.wampa.uuid,
                _name: context.wampa.name,
                _controller: context.player1Object.getObjectId(),
                _zone: context.wampa.zone.getObjectId(),
                _attackEnabled: true,
                _damage: 0,
                _upgrades: [],
            }));
        });

        it('generates inherited fields for concrete mixin-based serializer fragments', function() {
            const { context } = contextRef;

            ensureStateSerializersRegistered();

            const unitSerializer = stateSerializerRegistry.get('NonLeaderUnitCard');
            expect(unitSerializer).toBeDefined();

            const unitState = unitSerializer?.serialize(context.wampa as unknown as SerializerInstance);

            expect(unitState).toEqual(jasmine.objectContaining({
                _uuid: context.wampa.uuid,
                _name: context.wampa.name,
                _controller: context.player1Object.getObjectId(),
                _zone: context.wampa.zone.getObjectId(),
                _attackEnabled: true,
                _damage: 0,
                _upgrades: [],
            }));
        });

        it('roundtrips tracked game object state through generated serializers', function() {
            const { context } = contextRef;
            const manager = context.game.gameObjectManager as unknown as TestSerializerManager;
            const snapshotStates = manager.buildGameStateForSnapshot();

            for (const [uuid, serializedState] of Object.entries(snapshotStates)) {
                const gameObject = manager.getUnsafe(uuid);
                const serializer = manager.getSerializer(gameObject) as StateSerializer<IGameObjectBaseState>;
                const gameObjectState = serializedState as IGameObjectBaseState;

                gameObject.applySerializedState(context.game as Game, serializer, gameObjectState, gameObjectState);

                expect(serializer.serialize(gameObject as unknown as SerializerInstance)).toEqual(gameObjectState);
            }
        });

        it('roundtrips representative primitive, value, ref, and refArray delta field serializers', function() {
            const { context } = contextRef;

            ensureStateSerializersRegistered();

            const unitDeltaSerializer = getStateDeltaSerializer(context.wampa as unknown as GameObjectBase);
            const serializedDamage = unitDeltaSerializer._damage.serialize(context.wampa.damage);
            expect(unitDeltaSerializer._damage.deserialize(context.game as Game, serializedDamage)).toBe(context.wampa.damage);

            const serializedController = unitDeltaSerializer._controller.serialize(context.wampa.controller);
            expect(serializedController).toBe(context.player1Object.getObjectId());
            expect(unitDeltaSerializer._controller.deserialize(context.game as Game, serializedController)).toBe(context.player1Object);

            const handZoneDeltaSerializer = getStateDeltaSerializer(context.player1Object.handZone as unknown as GameObjectBase);
            const serializedHandCards = handZoneDeltaSerializer._cards.serialize(context.player1.hand);
            expect(serializedHandCards).toEqual([context.battlefieldMarine.getObjectId()]);
            expect(handZoneDeltaSerializer._cards.deserialize(context.game as Game, serializedHandCards)).toEqual([context.battlefieldMarine]);

            const watcherDeltaSerializer = stateDeltaSerializerRegistry.get('ActionsThisPhaseWatcher');
            expect(watcherDeltaSerializer).toBeDefined();

            const actionEntries = [{ actionName: 'play', nested: { count: 1 } }];
            const serializedEntries = watcherDeltaSerializer?.entries.serialize(actionEntries) as typeof actionEntries;
            expect(serializedEntries).toEqual(actionEntries);
            expect(serializedEntries).not.toBe(actionEntries);
            expect(serializedEntries[0]).not.toBe(actionEntries[0]);

            const deserializedEntries = watcherDeltaSerializer?.entries.deserialize(context.game as Game, serializedEntries) as typeof actionEntries;
            expect(deserializedEntries).toEqual(actionEntries);
            expect(deserializedEntries).not.toBe(serializedEntries);
            expect(deserializedEntries[0]).not.toBe(serializedEntries[0]);
        });

        it('uses generated delta serializers during quick rollback for primitive, ref, and refArray state', function() {
            const { context } = contextRef;

            expect(context.battlefieldMarine).toBeInZone('hand');
            expect(context.player1.readyResourceCount).toBe(2);
            expect(context.player1.exhaustedResourceCount).toBe(0);

            context.player1.clickCard(context.battlefieldMarine);

            expect(context.battlefieldMarine).toBeInZone('groundArena', context.player1);
            expect(context.player1.readyResourceCount).toBe(0);
            expect(context.player1.exhaustedResourceCount).toBe(2);
            expect(context.player1.hand).not.toContain(context.battlefieldMarine);

            contextRef.snapshot.quickRollback(context.player1.id);

            expect(context.battlefieldMarine).toBeInZone('hand');
            expect(context.player1.readyResourceCount).toBe(2);
            expect(context.player1.exhaustedResourceCount).toBe(0);
            expect(context.player1.hand).toContain(context.battlefieldMarine);
            expect(context.player1).toBeActivePlayer();
        });
    });
});