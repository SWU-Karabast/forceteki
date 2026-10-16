import type { Game } from '../../../server/game/core/Game';
import { GameObjectBase } from '../../../server/game/core/GameObjectBase';
import {
    CopyMode,
    type IStateArray,
    registerState,
    registerStateBase,
    statePrimitive,
    stateRef,
    stateRefArray,
    stateRefMap,
    stateRefRecord,
    stateRefSet,
    stateValue
} from '../../../server/game/core/GameObjectUtils';

function createReferenceGame(): Game {
    const { game, registered } = gameObjectHelper.createMockGame();
    Object.assign(game, {
        getFromUuidUnsafe: (id: string) => {
            const object = registered.find((candidate) => candidate.uuid === id);
            if (!object) {
                throw new Error(`Unknown test reference: ${id}`);
            }
            return object;
        }
    });
    return game as unknown as Game;
}

// Fresh class identities let each spec exercise the first hydration as well as later ones.
function createHydrationTypes() {
    @registerState()
    class HydrationReference extends GameObjectBase {
        @statePrimitive() public accessor label: string = '';
    }

    @registerStateBase()
    abstract class HydrationParent extends GameObjectBase {
        @statePrimitive() public accessor counter: number = 1;
        @stateRef() public accessor inheritedRef: HydrationReference | null = null;
        @stateRefArray(true) public accessor readonlyRefs: readonly HydrationReference[] = [];
        @stateValue() public accessor payload = { values: [1], counts: new Map([['initial', 1]]) };
    }

    @registerState()
    class HydrationObject extends HydrationParent {
        @statePrimitive() public accessor childCounter: number = 2;
        @stateRef() public accessor directRef: HydrationReference | null = null;
        @stateRefArray(false) public accessor mutableRefs: IStateArray<HydrationReference> = [];
        @stateRefMap() public accessor mappedRefs = new Map<string, HydrationReference>();
        @stateRefSet() public accessor uniqueRefs = new Set<HydrationReference>();
        @stateRefRecord() public accessor namedRefs: Record<string, HydrationReference> = {};
    }

    return { HydrationReference, HydrationObject };
}

function observeSetter(object: GameObjectBase, field: string, writes: string[]) {
    let prototype = Object.getPrototypeOf(object);
    let descriptor: PropertyDescriptor | undefined;
    while (prototype && !descriptor) {
        descriptor = Object.getOwnPropertyDescriptor(prototype, field);
        prototype = Object.getPrototypeOf(prototype);
    }
    if (!descriptor?.get || !descriptor.set) {
        throw new Error(`Missing test accessor: ${field}`);
    }
    const read = descriptor.get;
    const write = descriptor.set;
    Object.defineProperty(object, field, {
        configurable: true,
        get() {
            return read.call(object);
        },
        set(value: unknown) {
            writes.push(field);
            write.call(object, value);
        }
    });
}

describe('Game object state hydration', function() {
    it('should restore inherited fields and every reference container on first and repeated restores', function() {
        const { HydrationReference, HydrationObject } = createHydrationTypes();
        const game = createReferenceGame();
        const first = new HydrationReference(game);
        const second = new HydrationReference(game);
        const third = new HydrationReference(game);
        const object = new HydrationObject(game);
        object.inheritedRef = first;
        object.directRef = second;
        object.readonlyRefs = [first, second];
        object.mutableRefs = [second, first];
        object.mappedRefs.set('first', first);
        object.uniqueRefs.add(second);
        object.namedRefs = { first };
        const snapshot = object.getState();

        for (let attempt = 0; attempt < 2; attempt++) {
            object.counter = 99;
            object.childCounter = 100;
            object.inheritedRef = third;
            object.directRef = third;
            object.readonlyRefs = [third];
            object.mutableRefs = [third];
            object.mappedRefs.clear();
            object.uniqueRefs.clear();
            object.namedRefs = { third };
            object.payload.values.push(99);

            object.setState(structuredClone(snapshot));

            expect(object.counter).toBe(1);
            expect(object.childCounter).toBe(2);
            expect(object.inheritedRef).toBe(first);
            expect(object.directRef).toBe(second);
            expect(object.readonlyRefs).toEqual([first, second]);
            expect(Array.from(object.mutableRefs)).toEqual([second, first]);
            expect(object.mappedRefs.get('first')).toBe(first);
            expect(Array.from(object.uniqueRefs)).toEqual([second]);
            expect(object.namedRefs.first).toBe(first);
            expect(object.payload.values).toEqual([1]);
            expect(object.getState()).toEqual(snapshot);

            // Hydrated mutable containers must write through to this restored state.
            object.mutableRefs.push(third);
            object.mappedRefs.set('third', third);
            object.uniqueRefs.add(third);
            object.namedRefs.third = third;
            object.payload.values.push(3);
            object.payload.counts.set('third', 3);
            object.counter = 7;
            const changed = object.getState() as unknown as Record<string, unknown>;

            expect(changed.mutableRefs).toEqual([second.uuid, first.uuid, third.uuid]);
            expect(changed.mappedRefs).toEqual(new Map([['first', first.uuid], ['third', third.uuid]]));
            expect(changed.uniqueRefs).toEqual(new Set([second.uuid, third.uuid]));
            expect(changed.namedRefs).toEqual({ first: first.uuid, third: third.uuid });
            expect(changed.payload).toEqual({ values: [1, 3], counts: new Map([['initial', 1], ['third', 3]]) });
            expect(changed.counter).toBe(7);
        }
    });

    it('should preserve inherited setter order and repeated metadata traversal for a distinct prototype', function() {
        const { HydrationObject } = createHydrationTypes();
        const object = new HydrationObject(createReferenceGame());
        const writes: string[] = [];
        observeSetter(object, 'counter', writes);
        observeSetter(object, 'childCounter', writes);
        const snapshot = object.getState();

        object.setState(structuredClone(snapshot));

        expect(writes).toEqual(['childCounter', 'counter']);

        // A wrapper may expose the same constructor metadata through another prototype.
        // That traversal is observable through setters and must not be deduplicated.
        const wrapperPrototype = Object.create(Object.getPrototypeOf(object));
        Object.defineProperty(wrapperPrototype, 'constructor', { value: object.constructor });
        Object.setPrototypeOf(object, wrapperPrototype);

        for (let attempt = 0; attempt < 2; attempt++) {
            writes.length = 0;
            object.setState(structuredClone(snapshot));

            expect(writes).toEqual(['childCounter', 'childCounter', 'counter']);
        }
    });

    it('should preserve null and undefined reference-container hydration semantics', function() {
        const { HydrationReference, HydrationObject } = createHydrationTypes();
        const game = createReferenceGame();
        const reference = new HydrationReference(game);
        const object = new HydrationObject(game);
        object.inheritedRef = reference;
        object.directRef = reference;
        object.readonlyRefs = [reference];
        object.mutableRefs = [reference];
        object.mappedRefs.set('reference', reference);
        object.uniqueRefs.add(reference);
        object.namedRefs = { reference };
        const populated = object.getState();

        for (const missing of [null, undefined]) {
            const missingState = {
                ...structuredClone(populated),
                inheritedRef: missing,
                directRef: missing,
                readonlyRefs: missing,
                mutableRefs: missing,
                mappedRefs: missing,
                uniqueRefs: missing,
                namedRefs: missing
            };
            object.setState(missingState);

            expect(object.inheritedRef).toBeNull();
            expect(object.directRef).toBeNull();
            expect(object.readonlyRefs).toBeNull();
            expect(object.mutableRefs).toBe(missing);
            expect(object.mappedRefs).toBeNull();
            expect(object.uniqueRefs).toBeNull();
            expect(object.namedRefs).toBeNull();
        }

        object.setState(structuredClone(populated));

        expect(object.directRef).toBe(reference);
        expect(Array.from(object.mutableRefs)).toEqual([reference]);
        expect(object.mappedRefs.get('reference')).toBe(reference);
    });

    it('should resolve references and bind mutable containers to each instance and game independently', function() {
        const { HydrationReference, HydrationObject } = createHydrationTypes();
        const leftGame = createReferenceGame();
        const rightGame = createReferenceGame();
        const leftTarget = new HydrationReference(leftGame);
        const rightTarget = new HydrationReference(rightGame);
        const left = new HydrationObject(leftGame);
        const right = new HydrationObject(rightGame);
        left.directRef = leftTarget;
        left.mutableRefs = [leftTarget];
        left.mappedRefs.set('target', leftTarget);
        right.directRef = rightTarget;
        right.mutableRefs = [rightTarget];
        right.mappedRefs.set('target', rightTarget);

        expect(leftTarget.uuid).toBe(rightTarget.uuid);

        left.setState(left.getState());
        right.setState(right.getState());

        expect(left.directRef).toBe(leftTarget);
        expect(right.directRef).toBe(rightTarget);
        expect(right.mutableRefs[0]).toBe(rightTarget);
        expect(right.mappedRefs.get('target')).toBe(rightTarget);

        left.mutableRefs.pop();
        left.mappedRefs.delete('target');
        const leftState = left.getState() as unknown as Record<string, unknown>;
        const rightState = right.getState() as unknown as Record<string, unknown>;

        expect(leftState.mutableRefs).toEqual([]);
        expect(leftState.mappedRefs).toEqual(new Map());
        expect(rightState.mutableRefs).toEqual([rightTarget.uuid]);
        expect(rightState.mappedRefs).toEqual(new Map([['target', rightTarget.uuid]]));
    });

    it('should keep unrelated constructors with the same name separate', function() {
        function referenceType() {
            @registerState()
            class SameHydrationName extends GameObjectBase {
                @stateRef() public accessor reference: GameObjectBase | null = null;
            }
            return SameHydrationName;
        }
        function mapType() {
            @registerState()
            class SameHydrationName extends GameObjectBase {
                @stateRefMap() public accessor references = new Map<string, GameObjectBase>();
            }
            return SameHydrationName;
        }
        const ReferenceHolder = referenceType();
        const MapHolder = mapType();
        const game = createReferenceGame();
        const { HydrationReference } = createHydrationTypes();
        const target = new HydrationReference(game);
        const first = new ReferenceHolder(game);
        const second = new MapHolder(game);
        first.reference = target;
        second.references.set('target', target);

        expect(ReferenceHolder.name).toBe(MapHolder.name);

        for (let attempt = 0; attempt < 2; attempt++) {
            first.setState(first.getState());
            second.setState(second.getState());

            expect(first.reference).toBe(target);
            expect(second.references.get('target')).toBe(target);
        }
    });

    it('should honor inherited bulk-copy mode while still hydrating references', function() {
        @registerStateBase(CopyMode.UseBulkCopy)
        abstract class BulkHydrationParent extends GameObjectBase {
            @statePrimitive() public accessor counter: number = 1;
            @stateValue() public accessor payload = { values: [1] };
        }

        @registerState()
        class BulkHydrationObject extends BulkHydrationParent {
            @stateRef() public accessor reference: GameObjectBase | null = null;
            @stateRefArray(false) public accessor references: IStateArray<GameObjectBase> = [];
        }

        const game = createReferenceGame();
        const { HydrationReference } = createHydrationTypes();
        const target = new HydrationReference(game);
        const object = new BulkHydrationObject(game);
        object.reference = target;
        object.references = [target];
        const snapshot = object.getState();
        const writes: string[] = [];
        observeSetter(object, 'counter', writes);

        for (let attempt = 0; attempt < 2; attempt++) {
            object.counter = 99;
            object.payload.values.push(99);
            object.references.pop();
            writes.length = 0;

            object.setState(structuredClone(snapshot));

            expect(writes).toEqual([]);
            expect(object.counter).toBe(1);
            expect(object.payload.values).toEqual([1]);
            expect(object.reference).toBe(target);
            expect(Array.from(object.references)).toEqual([target]);
            expect(object.getState()).toEqual(snapshot);
        }
    });
});
