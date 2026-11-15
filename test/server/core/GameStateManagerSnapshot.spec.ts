import v8 from 'node:v8';
import type { Game } from '../../../server/game/core/Game';
import { GameObjectBase } from '../../../server/game/core/GameObjectBase';
import { registerState, stateValue, type GameObjectId } from '../../../server/game/core/GameObjectUtils';
import { PhaseName } from '../../../server/game/core/Constants';
import { GameStateManager } from '../../../server/game/core/snapshot/GameStateManager';
import { SnapshotTimepoint, type IGameSnapshot } from '../../../server/game/core/snapshot/SnapshotInterfaces';

interface SnapshotPayload {
    rows: { value: number }[];
    entries: Map<string, { value: number }>;
    tags: Set<string>;
}

@registerState()
class MutableSnapshotGameObject extends GameObjectBase {
    @stateValue() public accessor payload: SnapshotPayload = {
        rows: [{ value: 1 }],
        entries: new Map([['saved', { value: 2 }]]),
        tags: new Set(['saved'])
    };
}

@registerState()
class AlwaysTrackedSnapshotGameObject extends GameObjectBase {
    // eslint-disable-next-line @typescript-eslint/class-literal-property-style
    protected override get alwaysTrackState() {
        return true;
    }
}

function createManagedGame() {
    const reportError = jasmine.createSpy('reportError');
    const game = Object.assign(gameObjectHelper.createMockGame().game, {
        reportError,
        reportSevereRollbackFailure: (error: Error) => {
            throw error;
        },
        state: { roundNumber: 1 }
    }) as unknown as Game;
    const manager = new GameStateManager(game);
    Object.assign(game, { gameObjectManager: manager });
    return { game, manager, reportError };
}

describe('GameStateManager snapshots', function() {
    for (const testCase of [
        { name: 'an empty registry', referenced: [] },
        { name: 'all referenced objects', referenced: [true, true, true] },
        { name: 'all unused objects', referenced: [false, false, false] },
        { name: 'interleaved referenced and unused objects', referenced: [false, true, false, true, true, false] }
    ]) {
        it(`serializes ${testCase.name} in retained registration order`, function() {
            const { game, manager, reportError } = createManagedGame();
            const objects = testCase.referenced.map((referenced, index) => {
                const object = new gameObjectHelper.TestGameObject(game, `object-${index}`);
                if (referenced) {
                    object.getObjectId();
                }
                return object;
            });
            const retained = objects.filter((_, index) => testCase.referenced[index]);
            const expectedStates = Object.fromEntries(retained.map((object) => [object.uuid, object.getState()]));

            const snapshot = manager.buildGameStateForSnapshot();

            expect(v8.deserialize(snapshot)).toEqual(expectedStates);
            expect(Object.keys(v8.deserialize(snapshot))).toEqual(retained.map((object) => object.uuid));
            expect(snapshot).toEqual(v8.serialize(expectedStates));
            for (const [index, object] of objects.entries()) {
                const id = object.uuid as GameObjectId<GameObjectBase>;
                if (testCase.referenced[index]) {
                    expect(manager.get(id)).toBe(object);
                } else {
                    expect(() => manager.getUnsafe(id)).toThrowError(/UUID is not registered/);
                }
            }
            expect(reportError).toHaveBeenCalledTimes(objects.length - retained.length);
            expect(manager.buildGameStateForSnapshot()).toEqual(snapshot);
        });
    }

    it('retains always-tracked objects without creating an explicit reference', function() {
        const { game, manager } = createManagedGame();
        const unused = new gameObjectHelper.TestGameObject(game, 'unused');
        const tracked = new AlwaysTrackedSnapshotGameObject(game);

        manager.removeUnusedGameObjects();
        const states = v8.deserialize(manager.buildGameStateForSnapshot());

        expect(Object.keys(states)).toEqual([tracked.uuid]);
        expect(states[tracked.uuid]).toEqual(tracked.getState());
        expect(manager.getUnsafe(tracked.uuid as GameObjectId)).toBe(tracked);
        expect(() => manager.getUnsafe(unused.uuid as GameObjectId)).toThrowError(/UUID is not registered/);
    });

    it('preserves retained objects and increasing IDs across repeated cleanup and new registration', function() {
        const { game, manager } = createManagedGame();
        const unusedFirst = new gameObjectHelper.TestGameObject(game, 'unused-first');
        const first = new gameObjectHelper.TestGameObject(game, 'first');
        const firstId = first.getObjectId();
        const unusedLast = new gameObjectHelper.TestGameObject(game, 'unused-last');
        const lastIdBeforeCleanup = manager.lastGameObjectId;

        manager.removeUnusedGameObjects();
        manager.removeUnusedGameObjects();

        expect(manager.lastGameObjectId).toBe(lastIdBeforeCleanup);
        expect(manager.get(firstId)).toBe(first);
        expect(() => manager.getUnsafe(unusedFirst.uuid as GameObjectId)).toThrowError(/UUID is not registered/);
        expect(() => manager.getUnsafe(unusedLast.uuid as GameObjectId)).toThrowError(/UUID is not registered/);

        const second = new gameObjectHelper.TestGameObject(game, 'second');
        const secondId = second.getObjectId();

        expect(manager.lastGameObjectId).toBe(lastIdBeforeCleanup + 1);
        expect(secondId).not.toBe(firstId);
        manager.removeUnusedGameObjects();
        expect(manager.get(firstId)).toBe(first);
        expect(manager.get(secondId)).toBe(second);
        expect(Object.keys(v8.deserialize(manager.buildGameStateForSnapshot()))).toEqual([firstId, secondId]);
    });

    it('keeps nested mutable state isolated from live changes, decoded copies, and repeated restores', function() {
        const { game, manager } = createManagedGame();
        const object = new MutableSnapshotGameObject(game);
        const id = object.getObjectId();
        const expectedPayload = structuredClone(object.payload);
        const originalPayload = object.payload;
        const snapshot: IGameSnapshot = {
            id: 1,
            lastGameObjectId: manager.lastGameObjectId,
            actionNumber: 0,
            roundNumber: 1,
            phase: PhaseName.Action,
            timepoint: SnapshotTimepoint.Action,
            timepointNumber: 0,
            gameState: v8.serialize(game.state),
            states: manager.buildGameStateForSnapshot(),
            rngState: {},
            requiresConfirmationToRollback: false
        };

        object.payload.rows[0].value = 10;
        object.payload.entries.get('saved').value = 20;
        object.payload.tags.add('live');
        game.state.roundNumber = 9;
        const firstDecoded = v8.deserialize(snapshot.states);

        expect(firstDecoded[id].payload).toEqual(expectedPayload);
        firstDecoded[id].payload.rows[0].value = 30;
        firstDecoded[id].payload.entries.get('saved').value = 40;
        firstDecoded[id].payload.tags.add('decoded');
        const secondDecoded = v8.deserialize(snapshot.states);

        expect(secondDecoded[id].payload).toEqual(expectedPayload);
        expect(secondDecoded[id].payload.rows).not.toBe(firstDecoded[id].payload.rows);
        expect(manager.rollbackToSnapshot(snapshot)).toBeTrue();
        expect(object.payload).toEqual(expectedPayload);
        expect(object.payload).not.toBe(originalPayload);
        expect(game.state.roundNumber).toBe(1);

        const firstRestoredPayload = object.payload;
        object.payload.rows.push({ value: 50 });
        object.payload.entries.clear();
        object.payload.tags.clear();

        expect(manager.rollbackToSnapshot(snapshot)).toBeTrue();
        expect(object.payload).toEqual(expectedPayload);
        expect(object.payload).not.toBe(firstRestoredPayload);
        expect(manager.get(id)).toBe(object);
        expect(v8.deserialize(snapshot.states)[id].payload).toEqual(expectedPayload);
    });
});
