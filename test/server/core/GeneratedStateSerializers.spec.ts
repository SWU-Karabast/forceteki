import type { Game } from '../../../server/game/core/Game';
import type { GameObjectBase, IGameObjectBaseState } from '../../../server/game/core/GameObjectBase';
import { ensureStateSerializersRegistered, stateSerializerRegistry, type SerializedGameObjectStateMap, type SerializerInstance, type StateSerializer } from '../../../server/game/core/StateSerializers';

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
    });
});