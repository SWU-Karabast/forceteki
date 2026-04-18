import type { Game } from '../../../server/game/core/Game';
import { GameObjectBase, type IGameObjectBaseState } from '../../../server/game/core/GameObjectBase';
import { registerState } from '../../../server/game/core/GameObjectUtils';
import { GameStateManager } from '../../../server/game/core/snapshot/GameStateManager';

@registerState()
class CleanupAwareGameObject extends GameObjectBase {
    public cleanupCalls = 0;
    public lastCleanupState: IGameObjectBaseState | null = null;

    public override cleanupOnRemove(oldState: IGameObjectBaseState): void {
        this.cleanupCalls++;
        this.lastCleanupState = oldState;
    }

    public override getGameObjectName(): string {
        return 'CleanupAwareGameObject';
    }
}

describe('GameStateManager.destroy()', function() {
    function createGameAndManager() {
        const game = {
            reportError: jasmine.createSpy('reportError')
        } as unknown as Game;
        const manager = new GameStateManager(game);

        (game as unknown as { gameObjectManager: GameStateManager }).gameObjectManager = manager;

        return { game, manager };
    }

    it('runs cleanup for every registered game object and clears the registry', function() {
        const { game, manager } = createGameAndManager();
        const first = new CleanupAwareGameObject(game);
        const second = new CleanupAwareGameObject(game);

        const firstState = first.getStateUnsafe();
        const secondState = second.getStateUnsafe();

        manager.destroy();

        expect(first.cleanupCalls).toBe(1);
        expect(first.lastCleanupState).toBe(firstState);
        expect(second.cleanupCalls).toBe(1);
        expect(second.lastCleanupState).toBe(secondState);
        expect(() => manager.getUnsafe(first.uuid as never)).toThrow();
        expect(() => manager.getUnsafe(second.uuid as never)).toThrow();
    });
});
