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
            expect(stateSerializerRegistry.get('TokenCard')).toBeDefined();
            expect(stateSerializerRegistry.get('TokenUnitCard')).toBeDefined();
            expect(stateSerializerRegistry.get('TokenUpgradeCard')).toBeDefined();
            expect(stateDeltaSerializerRegistry.get('TokenCard')).toBeDefined();
            expect(stateDeltaSerializerRegistry.get('TokenUnitCard')).toBeDefined();
            expect(stateDeltaSerializerRegistry.get('TokenUpgradeCard')).toBeDefined();

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
            const playerHandCard = context.player1.hand[0];

            ensureStateSerializersRegistered();

            const unitDeltaSerializer = getStateDeltaSerializer(context.wampa as unknown as GameObjectBase);
            const serializedDamage = unitDeltaSerializer._damage.serialize(context.wampa.damage);
            expect(unitDeltaSerializer._damage.deserialize(context.game as Game, serializedDamage)).toBe(context.wampa.damage);

            const serializedController = unitDeltaSerializer._controller.serialize(context.wampa.controller);
            expect(serializedController).toBe(context.player1Object.getObjectId());
            expect(unitDeltaSerializer._controller.deserialize(context.game as Game, serializedController)).toBe(context.player1Object);

            const handZoneDeltaSerializer = getStateDeltaSerializer(context.player1Object.handZone as unknown as GameObjectBase);
            const serializedHandCards = handZoneDeltaSerializer._cards.serialize(context.player1.hand);
            expect(serializedHandCards).toEqual([playerHandCard.getObjectId()]);
            expect(handZoneDeltaSerializer._cards.deserialize(context.game as Game, serializedHandCards)).toEqual([playerHandCard]);

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

        it('rolls back GameState fields through generated serializers', function() {
            const { context } = contextRef;
            const lastEventIdBeforeMutation = context.game.lastEventId;
            const snapshotId = contextRef.snapshot.takeManualSnapshot(context.player1Object);

            context.game.getNextGameEventId();

            expect(context.game.lastEventId).toBe(lastEventIdBeforeMutation + 1);

            const rollbackResult = contextRef.snapshot.rollbackToSnapshot({
                type: 'manual',
                playerId: context.player1.id,
                snapshotId,
            });

            expect(rollbackResult).toBeTrue();

            expect(context.game.lastEventId).toBe(lastEventIdBeforeMutation);
        });

        it('uses generated delta serializers during quick rollback for primitive, ref, and refArray state', function() {
            const { context } = contextRef;
            const playerHandCard = context.player1.hand[0];
            const readyResourcesBeforePlay = context.player1.readyResourceCount;
            const exhaustedResourcesBeforePlay = context.player1.exhaustedResourceCount;

            expect(playerHandCard).toBeInZone('hand');
            expect(readyResourcesBeforePlay).toBeGreaterThan(0);

            context.player1.clickCard(playerHandCard);

            expect(playerHandCard).toBeInZone('groundArena', context.player1);
            expect(context.player1.readyResourceCount).toBeLessThan(readyResourcesBeforePlay);
            expect(context.player1.exhaustedResourceCount).toBeGreaterThan(exhaustedResourcesBeforePlay);
            expect(context.player1.hand).not.toContain(playerHandCard);

            contextRef.snapshot.quickRollback(context.player1.id);

            expect(playerHandCard).toBeInZone('hand');
            expect(context.player1.readyResourceCount).toBe(readyResourcesBeforePlay);
            expect(context.player1.exhaustedResourceCount).toBe(exhaustedResourcesBeforePlay);
            expect(context.player1.hand).toContain(playerHandCard);
            expect(context.player1).toBeActivePlayer();
        });
    });
});