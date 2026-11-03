import { SnapshotType, TokenUnitName } from '../../../../server/game/core/Constants';
import { GameObjectBase } from '../../../../server/game/core/GameObjectBase';
import type { IStateArray } from '../../../../server/game/core/GameObjectUtils';
import {
    getRuntimeStateFieldModelByClassName,
    registerState,
    statePrimitive,
    stateRef,
    stateRefArray,
    stateRefMap,
    stateRefRecord,
    stateRefSet,
    stateArray,
    stateMap,
    stateSet,
    ValueArray,
    ValueMap,
    ValueSet
} from '../../../../server/game/core/GameObjectUtils';
import type { FieldKind, IGeneratedSerializerEntry, SerializedStateRecord } from '../../../../server/game/core/StateEncoding';
import {
    decodeRef,
    decodeRefArray,
    decodeRefMap,
    decodeRefRecord,
    decodeRefSet,
    decodeStateValue,
    encodeRef,
    encodeRefArray,
    encodeRefMap,
    encodeRefRecord,
    encodeRefSet,
    encodeStateValue
} from '../../../../server/game/core/StateEncoding';
import * as StateSerializers from '../../../../server/game/core/StateSerializers';
import type { DeltaTracker, IDeltaTrackerAnchor, IDeltaTrackerWindow } from '../../../../server/game/core/snapshot/DeltaTracker';
import { DeltaTrackerMode, dirtyFieldMarker } from '../../../../server/game/core/snapshot/DeltaTracker';
import type { IGameSnapshot, IRollbackResult } from '../../../../server/game/core/snapshot/SnapshotInterfaces';
import { SnapshotTimepoint } from '../../../../server/game/core/snapshot/SnapshotInterfaces';

/**
 * P4-A: the delta tracker records, per window, the window-start value of every (object, field) written and the
 * objects registered during the window (`docs/plans/04-delta-snapshots.md`, "Mechanism").
 *
 * Every case starts a fresh window with a forced snapshot, because the tracker's window begins at a snapshot and
 * the harness's own setup snapshots are not the subject. Under `ENABLE_UNDO_ALL_TESTS` each case body runs twice
 * (a rollback to the start-of-test snapshot in between), so: rollback cases only target snapshots the body took
 * (newer than the start-of-test snapshot); cases that clear every snapshot are pending there; patches on shared
 * objects are plain monkeypatches restored in a `finally` (a second `spyOn` in the replay would throw); and
 * a case that changes the tracker mode restores it in a `finally`, because the mode is not game state.
 */

interface ISnapshotFactoryInternals {
    currentActionSnapshot: IGameSnapshot;
    createSnapshotForCurrentTimepoint(timepoint: SnapshotTimepoint): void;
}
interface ISnapshotManagerInternals {
    snapshotFactory: ISnapshotFactoryInternals;
    manualSnapshots: Map<string, { snapshots: Map<number, IGameSnapshot> }>;
}
interface IRegistrarInternals {
    lastGameObjectId: number;
    createWithoutRefsUnsafe<T extends GameObjectBase>(handler: () => T): T;
}
interface IDamageUnit {
    uuid: string;
    damage: number;
    setDamageForStateInjection(value: number): void;
}

const integrationWithUndo = integration as unknown as (
    definitions: (contextRef: SwuTestContextRef) => void,
    enableUndo: boolean
) => void;

const undoReplayEnabled = process.env.ENABLE_UNDO_ALL_TESTS === 'true';

// Spec-local class: the generator only scans the server tree, so this fixture needs the registry entry below
// to be serialized and captured like a real object. One field per wrapper kind the tracker has a hook for.
@registerState()
class DeltaTrackerWrapperFixture extends GameObjectBase {
    @statePrimitive() public accessor count: number = 0;
    @stateRef() public accessor refField: GameObjectBase | null = null;
    @stateRefArray(false) public accessor undoArray: IStateArray<GameObjectBase> = [] as unknown as IStateArray<GameObjectBase>;
    @stateRefMap() public accessor undoMap: Map<string, GameObjectBase> = new Map();
    @stateRefSet() public accessor undoSet: Set<GameObjectBase> = new Set();
    @stateRefRecord() public accessor undoRecord: Record<string, GameObjectBase> = {};
    @stateMap() public accessor valueMap: Map<string, number> = new Map();
    @stateSet() public accessor valueSet: Set<number> = new Set();
    @stateArray() public accessor valueArray: number[] = [];
}

function encodeFixtureField(kind: FieldKind, className: string, name: string, value: unknown): unknown {
    switch (kind) {
        case 'primitive':
            return value;
        case 'value':
            return encodeStateValue(`${className}.${name}`, value);
        case 'ref':
            return encodeRef(value as GameObjectBase);
        case 'refArray':
            return encodeRefArray(value as GameObjectBase[]);
        case 'refMap':
            return encodeRefMap(value as Map<string, GameObjectBase>);
        case 'refSet':
            return encodeRefSet(value as Set<GameObjectBase>);
        case 'refRecord':
            return encodeRefRecord(value as Record<string, GameObjectBase>);
    }
}

function buildFixtureEntry(className: string): IGeneratedSerializerEntry {
    const fields = getRuntimeStateFieldModelByClassName(className);
    return {
        className,
        decorator: 'registerState',
        isAbstract: false,
        fields,
        serializer: {
            serialize: (instance) => {
                const record: SerializedStateRecord = {};
                for (const field of fields) {
                    record[field.name] = encodeFixtureField(field.kind, className, field.name, (instance as unknown as Record<string, unknown>)[field.name]);
                }
                return record;
            },
            deserialize: (game, instance, record) => {
                const target = instance as unknown as Record<string, unknown>;
                for (const field of fields) {
                    const raw = record[field.name];
                    switch (field.kind) {
                        case 'primitive':
                            target[field.name] = raw;
                            break;
                        case 'value':
                            target[field.name] = decodeStateValue(raw);
                            break;
                        case 'ref':
                            target[field.name] = decodeRef(game, raw as string | null);
                            break;
                        case 'refArray':
                            target[field.name] = decodeRefArray(game, raw as string[] | null);
                            break;
                        case 'refRecord':
                            target[field.name] = decodeRefRecord(game, raw as Record<string, string> | null);
                            break;
                        case 'refMap': {
                            const decoded = decodeRefMap(game, raw as { $map: [string, unknown][] } | null);
                            target[field.name] = new Map();
                            for (const [key, value] of decoded ?? []) {
                                (target[field.name] as Map<string, unknown>).set(key, value);
                            }
                            break;
                        }
                        case 'refSet': {
                            const decoded = decodeRefSet(game, raw as { $set: unknown[] } | null);
                            target[field.name] = new Set();
                            for (const value of decoded ?? []) {
                                (target[field.name] as Set<unknown>).add(value);
                            }
                            break;
                        }
                    }
                }
            }
        }
    };
}

StateSerializers.registerStateSerializers([buildFixtureEntry('DeltaTrackerWrapperFixture')]);

// Deliberately given no registry entry, so a capture of its field finds nothing to encode with.
@registerState()
class DeltaTrackerUnregisteredFixture extends GameObjectBase {
    @statePrimitive() public accessor count: number = 0;
}

function snapshotInternals(game): ISnapshotManagerInternals {
    return game.snapshotManager as unknown as ISnapshotManagerInternals;
}

function forceFreshWindow(game): void {
    snapshotInternals(game).snapshotFactory.createSnapshotForCurrentTimepoint(SnapshotTimepoint.Action);
}

function currentSnapshot(game): IGameSnapshot {
    return snapshotInternals(game).snapshotFactory.currentActionSnapshot;
}

function manualSnapshot(game, playerId: string, snapshotId: number): IGameSnapshot {
    return snapshotInternals(game).manualSnapshots.get(playerId).snapshots.get(snapshotId);
}

function tracker(game): DeltaTracker {
    return game.deltaTracker as DeltaTracker;
}

function recordOf(game, go: { uuid: string }): Readonly<Record<string, unknown>> | undefined {
    return tracker(game).pendingWindow.changedFields.get(go.uuid);
}

function rollbackManual(context, snapshotId: number): IRollbackResult {
    return context.game.snapshotManager.rollbackTo({ type: SnapshotType.Manual, playerId: context.player1Object.id, snapshotId });
}

/** `rollbackTo` alone leaves the pipeline stale; the engine's own caller finishes with this. */
function settle(context, result: IRollbackResult): void {
    if (result.success) {
        context.game.postRollbackOperations(result.entryPoint);
    }
}

/** Patches `target[name]` for the duration of `body`, restoring in a finally. Not `spyOn`: the undo replay runs a case body twice in one spec. */
function withPatch<T>(target: object, name: string, replacement: unknown, body: () => T): T {
    const record = target as Record<string, unknown>;
    const hadOwn = Object.prototype.hasOwnProperty.call(target, name);
    const original = record[name];
    record[name] = replacement;
    try {
        return body();
    } finally {
        if (hadOwn) {
            record[name] = original;
        } else {
            Reflect.deleteProperty(target, name);
        }
    }
}

/** Counts calls to `getObjectId` on each referent for the duration of `body`. */
function countGetObjectIdCalls(referents: GameObjectBase[], body: () => void): number {
    let calls = 0;
    const restores: (() => void)[] = [];
    for (const referent of referents) {
        const original = referent.getObjectId.bind(referent);
        (referent as unknown as Record<string, unknown>).getObjectId = () => {
            calls++;
            return original();
        };
        restores.push(() => Reflect.deleteProperty(referent, 'getObjectId'));
    }
    try {
        body();
    } finally {
        restores.forEach((restore) => restore());
    }
    return calls;
}

function expectRecordsEqualSnapshot(game, window: IDeltaTrackerWindow, states: Record<string, SerializedStateRecord>): void {
    expect(window.changedFields.size).toBeGreaterThan(0);
    for (const [uuid, record] of window.changedFields) {
        const snapshotRecord = states[uuid];
        expect(snapshotRecord).toBeDefined(`${uuid} is recorded but absent from the anchor snapshot`);
        for (const field of Object.keys(record)) {
            expect(record[field]).toEqual(snapshotRecord[field], `${uuid}.${field}`);
        }
    }
}

describe('DeltaTracker', function() {
    integrationWithUndo(function(contextRef) {
        async function setupBoard() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: { groundArena: ['wampa'], hand: ['battlefield-marine'], resources: 6 },
                player2: { spaceArena: ['cartel-spacer'] }
            });
            // Windows open in DirtyOnly since P4-C; the cases below read the window-start values CaptureOldValues records.
            (contextRef.context.game.deltaTracker as DeltaTracker).setMode(DeltaTrackerMode.CaptureOldValues);
            return contextRef.context;
        }

        function referents(context): GameObjectBase[] {
            return [context.wampa, context.cartelSpacer, context.p1Base, context.p2Base] as unknown as GameObjectBase[];
        }

        function newFixture(context): DeltaTrackerWrapperFixture {
            const fixture = new DeltaTrackerWrapperFixture(context.game);
            // Latched so the next snapshot's cull keeps it, i.e. it is pre-existing state when the window opens.
            fixture.getObjectId();
            return fixture;
        }

        describe('window content', function() {
            it('records only the window-start value of a numeric @statePrimitive written three times', async function() {
                const context = await setupBoard();
                const wampa = context.wampa as unknown as IDamageUnit;

                forceFreshWindow(context.game);
                const v0 = wampa.damage;
                const anchorRecord = currentSnapshot(context.game).states[wampa.uuid];

                wampa.setDamageForStateInjection(1);
                wampa.setDamageForStateInjection(2);
                wampa.setDamageForStateInjection(3);

                expect(wampa.damage).toBe(3);
                expect(v0).not.toBe(3);
                const record = recordOf(context.game, wampa);
                expect(Object.keys(record)).toEqual(['_damage']);
                expect(record._damage).toBe(v0);
                expect(record._damage).toBe(anchorRecord._damage);
            });

            it('records the window-start deck for three draws from a real DeckZone', async function() {
                const context = await setupBoard();
                const deckZone = context.player1Object.deckZone;

                forceFreshWindow(context.game);
                const startDeck = [...deckZone.deck];
                expect(startDeck.length).toBeGreaterThan(3);
                const expected = encodeRefArray(startDeck);

                deckZone.removeTopCard();
                deckZone.removeTopCard();
                deckZone.removeTopCard();

                expect(deckZone.deck.length).toBe(startDeck.length - 3);
                const record = recordOf(context.game, deckZone);
                expect(record._deck).toEqual(expected);
                expect(record._deck).not.toEqual(encodeRefArray(deckZone.deck));
            });

            it('records the window-start use counts for three AbilityLimit.increment calls', async function() {
                const context = await setupBoard();
                const objects = (context.game.gameObjectManager as unknown as { allGameObjects: GameObjectBase[] }).allGameObjects;
                const limit = objects.find((go) => go.constructor.name === 'UnlimitedAbilityLimit') as unknown as { uuid: string; useCount: Map<string, number>; increment(player: unknown): void };
                expect(limit).toBeDefined('no UnlimitedAbilityLimit in play to exercise');
                expect(limit.useCount instanceof ValueMap).toBeTrue();

                forceFreshWindow(context.game);
                const expected = encodeStateValue('UnlimitedAbilityLimit.useCount', new Map(limit.useCount));
                const before = limit.useCount.get(context.player1Object.name) ?? 0;

                limit.increment(context.player1Object);
                limit.increment(context.player1Object);
                limit.increment(context.player1Object);

                expect(limit.useCount.get(context.player1Object.name)).toBe(before + 3);
                const record = recordOf(context.game, limit);
                expect(record.useCount).toEqual(expected);
                expect(record.useCount).not.toEqual(encodeStateValue('x', new Map(limit.useCount)));
            });

            it('AC9 records Player._decklist when Game.generateToken adds a token, with the window-start decklist', async function() {
                const context = await setupBoard();
                const game = context.game;
                const player = context.player1Object;

                forceFreshWindow(game);
                const decklistAtWindowStart = encodeStateValue('Player._decklist', player.decklist);
                expect(recordOf(game, player)).toBeUndefined();

                const token = game.generateToken(player, TokenUnitName.BattleDroid);

                const record = recordOf(game, player);
                expect(record).toBeDefined('generateToken wrote the decklist behind the tracker');
                expect(Object.keys(record)).toEqual(['_decklist']);
                expect(record._decklist).toEqual(decklistAtWindowStart);
                expect(player.decklist.tokens).toContain(token.getObjectId());
                expect(player.decklist.allCards).toContain(token.getObjectId());
            });

            it('records window-start values equal to the anchor snapshot for every field a played card touches', async function() {
                const context = await setupBoard();
                const trackerInstance = tracker(context.game);

                forceFreshWindow(context.game);
                const anchorStates = currentSnapshot(context.game).states;
                const firstWindow = trackerInstance.pendingWindow;

                // Playing the card ends the action, so the next timepoint's snapshot closes this window.
                const originalCheckpoint = trackerInstance.checkpoint;
                let closed: IDeltaTrackerWindow = null;
                withPatch(trackerInstance, 'checkpoint', (nextAnchor: IDeltaTrackerAnchor) => {
                    const closedWindow = originalCheckpoint.call(trackerInstance, nextAnchor);
                    closed ??= closedWindow;
                    return closedWindow;
                }, () => context.player1.clickCard(context.battlefieldMarine));

                expect(context.battlefieldMarine).toBeInZone('groundArena');
                expect(closed).toBe(firstWindow);
                expectRecordsEqualSnapshot(context.game, closed, anchorStates);
            });
        });

        describe('wrapper kinds', function() {
            interface IWrapperCase {
                name: string;
                field: keyof DeltaTrackerWrapperFixture;
                seed(fixture: DeltaTrackerWrapperFixture, refs: GameObjectBase[]): void;
                startCopy(fixture: DeltaTrackerWrapperFixture): unknown;
                encode(value: unknown): unknown;
                mutations: ((fixture: DeltaTrackerWrapperFixture, refs: GameObjectBase[]) => void)[];
                oldReferents(refs: GameObjectBase[]): GameObjectBase[];
            }

            const wrapperCases: IWrapperCase[] = [
                {
                    name: 'UndoArray',
                    field: 'undoArray',
                    seed: (f, [a, b]) => {
                        f.undoArray = [a, b] as unknown as IStateArray<GameObjectBase>;
                    },
                    startCopy: (f) => [...f.undoArray],
                    encode: (v) => encodeRefArray(v as GameObjectBase[]),
                    mutations: [
                        (f, [, , c]) => f.undoArray.push(c),
                        (f) => f.undoArray.shift(),
                        (f) => f.undoArray.splice(0, 1)
                    ],
                    oldReferents: ([a, b]) => [a, b]
                },
                {
                    name: 'UndoMap',
                    field: 'undoMap',
                    seed: (f, [a, b]) => {
                        f.undoMap = new Map([['k1', a], ['k2', b]]);
                    },
                    startCopy: (f) => new Map(f.undoMap),
                    encode: (v) => encodeRefMap(v as Map<string, GameObjectBase>),
                    mutations: [
                        (f, [, , c]) => f.undoMap.set('k3', c),
                        (f) => f.undoMap.delete('k1'),
                        (f) => f.undoMap.clear()
                    ],
                    oldReferents: ([a, b]) => [a, b]
                },
                {
                    name: 'UndoSet',
                    field: 'undoSet',
                    seed: (f, [a, b]) => {
                        f.undoSet = new Set([a, b]);
                    },
                    startCopy: (f) => new Set(f.undoSet),
                    encode: (v) => encodeRefSet(v as Set<GameObjectBase>),
                    mutations: [
                        (f, [, , c]) => f.undoSet.add(c),
                        (f, [a]) => f.undoSet.delete(a),
                        (f) => f.undoSet.clear()
                    ],
                    oldReferents: ([a, b]) => [a, b]
                },
                {
                    name: 'UndoSafeRecord',
                    field: 'undoRecord',
                    seed: (f, [a, b]) => {
                        f.undoRecord = { x: a, y: b };
                    },
                    startCopy: (f) => ({ ...f.undoRecord }),
                    encode: (v) => encodeRefRecord(v as Record<string, GameObjectBase>),
                    mutations: [
                        (f, [, , c]) => {
                            f.undoRecord.z = c;
                        },
                        (f) => {
                            Reflect.deleteProperty(f.undoRecord, 'x');
                        },
                        (f) => {
                            Reflect.deleteProperty(f.undoRecord, 'y');
                        }
                    ],
                    oldReferents: ([a, b]) => [a, b]
                },
                {
                    name: 'ValueMap',
                    field: 'valueMap',
                    seed: (f) => {
                        f.valueMap = new Map([['a', 1], ['b', 2]]);
                    },
                    startCopy: (f) => new Map(f.valueMap),
                    encode: (v) => encodeStateValue('DeltaTrackerWrapperFixture.valueMap', v),
                    mutations: [
                        (f) => f.valueMap.set('c', 3),
                        (f) => f.valueMap.delete('a'),
                        (f) => f.valueMap.clear()
                    ],
                    oldReferents: () => []
                },
                {
                    name: 'ValueSet',
                    field: 'valueSet',
                    seed: (f) => {
                        f.valueSet = new Set([1, 2]);
                    },
                    startCopy: (f) => new Set(f.valueSet),
                    encode: (v) => encodeStateValue('DeltaTrackerWrapperFixture.valueSet', v),
                    mutations: [
                        (f) => f.valueSet.add(3),
                        (f) => f.valueSet.delete(1),
                        (f) => f.valueSet.clear()
                    ],
                    oldReferents: () => []
                },
                {
                    name: 'ValueArray',
                    field: 'valueArray',
                    seed: (f) => {
                        f.valueArray = [1, 2];
                    },
                    startCopy: (f) => [...f.valueArray],
                    encode: (v) => encodeStateValue('DeltaTrackerWrapperFixture.valueArray', v),
                    mutations: [
                        (f) => f.valueArray.push(3),
                        (f) => f.valueArray.splice(0, 1),
                        (f) => f.valueArray.fill(9)
                    ],
                    oldReferents: () => []
                }
            ];

            for (const wrapperCase of wrapperCases) {
                it(`records the window-start contents once for three in-place ${wrapperCase.name} mutations, without touching the old referents`, async function() {
                    const context = await setupBoard();
                    const refs = referents(context);
                    const fixture = newFixture(context);
                    wrapperCase.seed(fixture, refs);

                    forceFreshWindow(context.game);
                    const expected = wrapperCase.encode(wrapperCase.startCopy(fixture));

                    const oldReferentCalls = countGetObjectIdCalls(wrapperCase.oldReferents(refs), () => {
                        for (const mutate of wrapperCase.mutations) {
                            mutate(fixture, refs);
                            // The window-start value survives each step, not just the last one.
                            expect(recordOf(context.game, fixture)[wrapperCase.field]).toEqual(expected);
                        }
                    });

                    const record = recordOf(context.game, fixture);
                    expect(Object.keys(record)).toEqual([wrapperCase.field]);
                    expect(record[wrapperCase.field]).toEqual(expected);
                    expect(record[wrapperCase.field]).not.toEqual(wrapperCase.encode(wrapperCase.startCopy(fixture)));
                    expect(oldReferentCalls).toBe(0);
                });
            }

            it('records a whole-field reassignment of a @stateRef and of a populated @stateMap/@stateSet once, as the window-start value', async function() {
                const context = await setupBoard();
                const [a, b] = referents(context);
                const fixture = newFixture(context);
                fixture.refField = a;
                fixture.valueMap = new Map([['a', 1]]);
                fixture.valueSet = new Set([1]);

                forceFreshWindow(context.game);

                // `a` is only the old referent of the @stateRef field: capturing it must not call getObjectId() on it.
                const oldRefReferentCalls = countGetObjectIdCalls([a], () => {
                    fixture.refField = b;
                    fixture.refField = null;
                });
                expect(oldRefReferentCalls).toBe(0);
                expect(() => {
                    fixture.valueMap = new Map([['x', 7], ['y', 8]]);
                    fixture.valueSet = new Set([7, 8]);
                }).not.toThrow();

                const record = recordOf(context.game, fixture);
                expect(Object.keys(record).sort()).toEqual(['refField', 'valueMap', 'valueSet']);
                expect(record.refField).toBe(a.uuid);
                expect(record.valueMap).toEqual(encodeStateValue('x', new Map([['a', 1]])));
                expect(record.valueSet).toEqual(encodeStateValue('x', new Set([1])));
                expect(fixture.valueMap instanceof ValueMap).toBeTrue();
                expect(fixture.valueSet instanceof ValueSet).toBeTrue();
                expect(fixture.valueMap.get('y')).toBe(8);
                expect([...fixture.valueSet]).toEqual([7, 8]);
            });

            // TODO: index assignment and `length =` on a ValueArray are not interceptable (see ValueArray's doc
            // comment), so a write made either way is not recorded. No case asserts that gap, so closing it later
            // breaks nothing.
        });

        describe('window lifecycle', function() {
            it('opens an empty window at each forced snapshot, anchored at that snapshot, and returns the closed window from the checkpoint', async function() {
                const context = await setupBoard();
                const wampa = context.wampa as unknown as IDamageUnit;
                const game = context.game;

                forceFreshWindow(game);
                const first = tracker(game).pendingWindow;
                expect(tracker(game).isTracking).toBeTrue();
                expect(first.anchor.snapshotId).toBe(game.snapshotManager.currentSnapshotId);
                expect(first.anchor.lastGameObjectId).toBe((game.gameObjectManager as unknown as IRegistrarInternals).lastGameObjectId);
                expect(first.anchor.rngState).toEqual(game.randomGenerator.rngState);

                wampa.setDamageForStateInjection(2);
                expect(recordOf(game, wampa)._damage).toBe(0);

                const trackerInstance = tracker(game);
                let closed: IDeltaTrackerWindow = null;
                const originalCheckpoint = trackerInstance.checkpoint;
                withPatch(trackerInstance, 'checkpoint', (nextAnchor: IDeltaTrackerAnchor) => {
                    closed = originalCheckpoint.call(trackerInstance, nextAnchor);
                    return closed;
                }, () => forceFreshWindow(game));

                const second = tracker(game).pendingWindow;
                expect(closed).toBe(first);
                expect(second).not.toBe(first);
                expect(second.anchor.snapshotId).toBe(game.snapshotManager.currentSnapshotId);
                expect(second.anchor.snapshotId).toBeGreaterThan(first.anchor.snapshotId);
                expect(second.changedFields.size).toBe(0);
                // The closed window keeps its record; the new one does not inherit it.
                expect(closed.changedFields.get(wampa.uuid)._damage).toBe(0);
            });

            it('refuses to start a window without an anchor and leaves the tracker as it was', async function() {
                const context = await setupBoard();
                const trackerInstance = tracker(context.game);
                forceFreshWindow(context.game);
                const window = trackerInstance.pendingWindow;

                expect(() => trackerInstance.startTracking(null)).toThrowError(/anchor/);
                expect(() => trackerInstance.startTracking({ snapshotId: null, rngState: {}, lastGameObjectId: 0 })).toThrowError(/snapshot id/);

                expect(trackerInstance.isTracking).toBeTrue();
                expect(trackerInstance.pendingWindow).toBe(window);
            });

            it('records nothing while stopped, and keeps the window for a resume', async function() {
                const context = await setupBoard();
                const wampa = context.wampa as unknown as IDamageUnit;
                const trackerInstance = tracker(context.game);
                forceFreshWindow(context.game);
                const window = trackerInstance.pendingWindow;

                trackerInstance.stopTracking();
                try {
                    wampa.setDamageForStateInjection(4);
                    expect(trackerInstance.isTracking).toBeFalse();
                    expect(window.changedFields.size).toBe(0);
                } finally {
                    trackerInstance.resumeTracking();
                }

                wampa.setDamageForStateInjection(5);
                expect(trackerInstance.pendingWindow).toBe(window);
                expect(window.changedFields.get(wampa.uuid)._damage).toBe(4);
            });

            it('records objects registered during the window as created and ignores their writes', async function() {
                const context = await setupBoard();
                forceFreshWindow(context.game);
                const window = tracker(context.game).pendingWindow;

                const created = new DeltaTrackerWrapperFixture(context.game);
                created.getObjectId();
                created.count = 5;
                created.valueArray.push(1);

                expect(window.createdObjectUuids.has(created.uuid)).toBeTrue();
                expect(window.changedFields.has(created.uuid)).toBeFalse();
            });

            it('neither registers nor records an object built under createWithoutRefsUnsafe', async function() {
                const context = await setupBoard();
                forceFreshWindow(context.game);
                const window = tracker(context.game).pendingWindow;
                const registrar = context.game.gameObjectManager as unknown as IRegistrarInternals;

                const transient = registrar.createWithoutRefsUnsafe(() => new DeltaTrackerWrapperFixture(context.game));
                transient.count = 9;
                transient.valueMap.set('k', 1);

                expect(window.createdObjectUuids.has(transient.uuid)).toBeFalse();
                expect(window.changedFields.has(transient.uuid)).toBeFalse();
            });
        });

        describe('failure visibility', function() {
            it('fails loudly from the setter, naming the class and field, when a captured field is not in the serializer registry, and does not write', async function() {
                const context = await setupBoard();
                const fixture = new DeltaTrackerUnregisteredFixture(context.game);
                fixture.getObjectId();
                forceFreshWindow(context.game);

                expect(() => {
                    fixture.count = 5;
                }).toThrowError(/DeltaTrackerUnregisteredFixture\.count/);

                expect(fixture.count).toBe(0);
                expect(recordOf(context.game, fixture)).toBeUndefined();
            });
        });

        describe('mode', function() {
            // The board helper selects CaptureOldValues for the cases that read window-start values, so this case sets its own board to see the default.
            it('opens windows in DirtyOnly by default, and a mode change applies from the next window', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: { groundArena: ['wampa'], hand: ['battlefield-marine'], resources: 6 },
                    player2: { spaceArena: ['cartel-spacer'] }
                });
                const { context } = contextRef;
                const wampa = context.wampa as unknown as IDamageUnit;
                const game = context.game;
                const trackerInstance = tracker(game);
                expect(trackerInstance.mode).toBe(DeltaTrackerMode.DirtyOnly);

                const lookups: GameObjectBase[] = [];
                const originalLookup = StateSerializers.getStateSerializerFor;

                try {
                    forceFreshWindow(game);
                    const dirty = trackerInstance.pendingWindow;
                    expect(dirty.mode).toBe(DeltaTrackerMode.DirtyOnly);
                    trackerInstance.setMode(DeltaTrackerMode.CaptureOldValues);

                    // The open window keeps recording markers.
                    withPatch(StateSerializers, 'getStateSerializerFor', (instance: GameObjectBase) => {
                        lookups.push(instance);
                        return originalLookup(instance);
                    }, () => {
                        wampa.setDamageForStateInjection(1);
                        wampa.setDamageForStateInjection(2);
                    });
                    expect(dirty.mode).toBe(DeltaTrackerMode.DirtyOnly);
                    expect(dirty.changedFields.get(wampa.uuid)._damage).toBe(dirtyFieldMarker);
                    expect(lookups.length).toBe(0);

                    forceFreshWindow(game);
                    const captured = trackerInstance.pendingWindow;
                    expect(captured.mode).toBe(DeltaTrackerMode.CaptureOldValues);
                    wampa.setDamageForStateInjection(3);
                    expect(captured.changedFields.get(wampa.uuid)._damage).toBe(2);

                    trackerInstance.setMode(DeltaTrackerMode.DirtyOnly);
                    expect(captured.mode).toBe(DeltaTrackerMode.CaptureOldValues);
                    forceFreshWindow(game);
                    expect(trackerInstance.pendingWindow.mode).toBe(DeltaTrackerMode.DirtyOnly);
                } finally {
                    trackerInstance.setMode(DeltaTrackerMode.DirtyOnly);
                }
            });
        });

        describe('rollback', function() {
            it('runs every restore write untracked, then opens a fresh window at the restored snapshot', async function() {
                const context = await setupBoard();
                const game = context.game;
                const wampa = context.wampa as unknown as IDamageUnit;
                const trackerInstance = tracker(game);

                forceFreshWindow(game);
                const snapshotId = contextRef.snapshot.takeManualSnapshot(context.player1Object);
                const restoredSnapshot = manualSnapshot(game, context.player1Object.id, snapshotId);
                wampa.setDamageForStateInjection(2);
                const priorWindow = trackerInstance.pendingWindow;
                expect(priorWindow.changedFields.get(wampa.uuid)._damage).toBe(0);

                const observed: { uuid: string; tracking: boolean }[] = [];
                const serializer = StateSerializers.getStateSerializerFor(wampa as unknown as GameObjectBase).serializer;
                const originalDeserialize = serializer.deserialize;
                let result: IRollbackResult;
                withPatch(serializer, 'deserialize', (gameArg, instance, record) => {
                    observed.push({ uuid: (instance as unknown as GameObjectBase).uuid, tracking: trackerInstance.isTracking });
                    originalDeserialize(gameArg, instance, record);
                }, () => {
                    result = rollbackManual(context, snapshotId);
                });

                expect(result.success).toBeTrue();
                expect(observed.some((entry) => entry.uuid === wampa.uuid)).toBeTrue();
                expect(observed.every((entry) => !entry.tracking)).toBeTrue();

                expect(trackerInstance.isTracking).toBeTrue();
                const fresh = trackerInstance.pendingWindow;
                expect(fresh).not.toBe(priorWindow);
                expect(fresh.anchor.snapshotId).toBe(snapshotId);
                expect(fresh.anchor.snapshotId).toBe(game.snapshotManager.currentSnapshotId);
                expect(fresh.anchor.lastGameObjectId).toBe(restoredSnapshot.lastGameObjectId);
                expect(fresh.changedFields.size).toBe(0);

                // The restored field is absent until it is written again, and then records the restored value.
                expect(wampa.damage).toBe(0);
                wampa.setDamageForStateInjection(5);
                expect(fresh.changedFields.get(wampa.uuid)._damage).toBe(0);

                // Every record the fresh window gathered, including through the pipeline restart, is the restored snapshot's own value.
                settle(context, result);
                expectRecordsEqualSnapshot(game, fresh, restoredSnapshot.states);
            });

            it('opens a fresh window after a rollback to the player\'s action snapshot and to the previous quick snapshot', async function() {
                const context = await setupBoard();
                const game = context.game;
                const wampa = context.wampa as unknown as IDamageUnit;
                const trackerInstance = tracker(game);
                const playerId = context.player1Object.id;

                // An action snapshot the body takes itself, newer than the start-of-test snapshot.
                game.snapshotManager.moveToNextTimepoint(SnapshotTimepoint.Action);
                const actionSnapshotId = game.snapshotManager.takeSnapshot({ type: SnapshotType.Action, playerId });
                wampa.setDamageForStateInjection(3);
                const staleWindow = trackerInstance.pendingWindow;

                const actionResult: IRollbackResult = game.snapshotManager.rollbackTo({ type: SnapshotType.Action, playerId });
                expect(actionResult.success).toBeTrue();
                expect(trackerInstance.isTracking).toBeTrue();
                expect(trackerInstance.pendingWindow).not.toBe(staleWindow);
                expect(trackerInstance.pendingWindow.anchor.snapshotId).toBe(actionSnapshotId);
                expect(trackerInstance.pendingWindow.changedFields.size).toBe(0);
                wampa.setDamageForStateInjection(6);
                expect(recordOf(game, wampa)._damage).toBe(0);
                settle(context, actionResult);

                // Quick rollback through the same shared entry: the previous quick entry is the harness's start-of-test action snapshot.
                game.snapshotManager.moveToNextTimepoint(SnapshotTimepoint.Action);
                game.snapshotManager.takeSnapshot({ type: SnapshotType.Action, playerId });
                const quickWindow = trackerInstance.pendingWindow;
                const quickResult: IRollbackResult = game.snapshotManager.rollbackTo({ type: SnapshotType.Quick, playerId });
                expect(quickResult.success).toBeTrue();
                expect(trackerInstance.isTracking).toBeTrue();
                expect(trackerInstance.pendingWindow).not.toBe(quickWindow);
                expect(trackerInstance.pendingWindow.anchor.snapshotId).toBe(game.snapshotManager.currentSnapshotId);
                expect(trackerInstance.pendingWindow.changedFields.size).toBe(0);
                settle(context, quickResult);
            });

            it('opens a fresh window at the current snapshot after a quick rollback made in the middle of an action', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: { hand: ['vanquish'], resources: 12 },
                    player2: { groundArena: ['wampa'] }
                });
                const { context } = contextRef;
                const game = context.game;
                const trackerInstance = tracker(game);
                const playerId = context.player1Object.id;

                // A target prompt is open, so the quick rollback point is Current (the start of this action), not Previous.
                context.player1.clickCard(context.vanquish);
                expect(context.player1).toBeAbleToSelectExactly([context.wampa]);
                (context.wampa as unknown as IDamageUnit).setDamageForStateInjection(2);
                const staleWindow = trackerInstance.pendingWindow;
                expect(staleWindow.changedFields.size).toBeGreaterThan(0);
                const currentSnapshotId = game.snapshotManager.currentSnapshotId;
                expect(staleWindow.anchor.snapshotId).toBe(currentSnapshotId);

                const result: IRollbackResult = game.snapshotManager.rollbackTo({ type: SnapshotType.Quick, playerId });
                expect(result.success).toBeTrue();
                expect(trackerInstance.isTracking).toBeTrue();
                expect(trackerInstance.pendingWindow).not.toBe(staleWindow);
                expect(trackerInstance.pendingWindow.anchor.snapshotId).toBe(currentSnapshotId);
                expect(game.snapshotManager.currentSnapshotId).toBe(currentSnapshotId);
                expect(trackerInstance.pendingWindow.changedFields.size).toBe(0);
                settle(context, result);
            });

            it('keeps the open window, live, when a rollback restores nothing or throws', async function() {
                const context = await setupBoard();
                const game = context.game;
                const wampa = context.wampa as unknown as IDamageUnit;
                const trackerInstance = tracker(game);
                const otherPlayerId = context.player2Object.id;

                forceFreshWindow(game);
                wampa.setDamageForStateInjection(2);
                const window = trackerInstance.pendingWindow;
                const anchor = window.anchor;
                const before = JSON.stringify([...window.changedFields]);
                expect(before).toContain('_damage');

                // No action snapshot exists for this player: the container returns nothing to restore.
                const refused: IRollbackResult = game.snapshotManager.rollbackTo({ type: SnapshotType.Action, playerId: otherPlayerId });
                expect(refused.success).toBeFalse();
                expect(trackerInstance.isTracking).toBeTrue();
                expect(trackerInstance.pendingWindow).toBe(window);
                expect(trackerInstance.pendingWindow.anchor).toBe(anchor);
                expect(JSON.stringify([...window.changedFields])).toBe(before);

                // An unknown manual snapshot throws out of the shared entry.
                expect(() => rollbackManual(context, 987654)).toThrowError(/does not exist/);
                expect(trackerInstance.isTracking).toBeTrue();
                expect(trackerInstance.pendingWindow).toBe(window);
                expect(JSON.stringify([...window.changedFields])).toBe(before);

                wampa.setDamageForStateInjection(7);
                expect(window.changedFields.get(wampa.uuid)._damage).toBe(0);
            });

            it('keeps the open window when a restore fails and recovers to the current snapshot', async function() {
                const context = await setupBoard();
                const game = context.game;
                const wampa = context.wampa as unknown as IDamageUnit;
                const trackerInstance = tracker(game);
                const playerId = context.player1Object.id;

                // Snapshot A (action and manual), then a later current snapshot whose window is the one at stake.
                game.snapshotManager.moveToNextTimepoint(SnapshotTimepoint.Action);
                game.snapshotManager.takeSnapshot({ type: SnapshotType.Action, playerId });
                const manualId = contextRef.snapshot.takeManualSnapshot(context.player1Object);
                wampa.setDamageForStateInjection(2);
                game.snapshotManager.moveToNextTimepoint(SnapshotTimepoint.Action);
                wampa.setDamageForStateInjection(4);
                const window = trackerInstance.pendingWindow;
                const before = JSON.stringify([...window.changedFields]);
                expect(window.changedFields.get(wampa.uuid)._damage).toBe(2);

                const serializer = StateSerializers.getStateSerializerFor(wampa as unknown as GameObjectBase).serializer;
                const originalDeserialize = serializer.deserialize;
                let calls = 0;
                const failFirstRestore = (gameArg, instance, record) => {
                    calls++;
                    if (calls === 1) {
                        throw new Error('injected restore failure');
                    }
                    originalDeserialize(gameArg, instance, record);
                };

                // The action container reports a recovered failure as an unsuccessful result ...
                let result: IRollbackResult;
                withPatch(serializer, 'deserialize', failFirstRestore, () => {
                    result = game.snapshotManager.rollbackTo({ type: SnapshotType.Action, playerId });
                });
                expect(result.success).toBeFalse();
                expect(calls).toBeGreaterThan(1);
                expect(trackerInstance.isTracking).toBeTrue();
                expect(trackerInstance.pendingWindow).toBe(window);
                expect(JSON.stringify([...window.changedFields])).toBe(before);
                // The recovery restored the window's own anchor, so the recorded window-start value is still right.
                expect(wampa.damage).toBe(2);

                // ... and the manual container, which asserts a restored id, as a throw. Either way the window survives.
                calls = 0;
                withPatch(serializer, 'deserialize', failFirstRestore, () => {
                    expect(() => rollbackManual(context, manualId)).toThrowError(/does not exist/);
                });
                expect(trackerInstance.isTracking).toBeTrue();
                expect(trackerInstance.pendingWindow).toBe(window);
                expect(JSON.stringify([...window.changedFields])).toBe(before);
            });

            // The tracker stays stopped through afterSetState / afterSetAllState (ongoing-effect refresh, effect re-resolution,
            // limit and listener re-registration), so a hook write that left a field different from the snapshot would be missing
            // from the fresh window and a consumer would trust a stale anchor record. Only a rollback that changed the board's
            // ongoing effects can show it.
            it('leaves every object equal to the restored snapshot after the post-restore hooks, on a board whose ongoing effects the rolled-back actions changed', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['97th-legion#keeping-the-peace-on-sullust', 'emperors-royal-guard', 'wampa'],
                        hand: ['resupply', 'admiral-piett#captain-of-the-executor'],
                        resources: 20
                    },
                    player2: { spaceArena: ['cartel-spacer'] }
                });
                const { context } = contextRef;
                const game = context.game;
                const gameObjectManager = game.gameObjectManager;

                forceFreshWindow(game);
                const snapshotId = contextRef.snapshot.takeManualSnapshot(context.player1Object);
                const restoredStates = manualSnapshot(game, context.player1Object.id, snapshotId).states;
                const legion = context._97thLegion;
                const legionPowerBefore = legion.getPower();

                // Adds a resource (the 97th Legion's +X/+X grows) and an Official (the Royal Guard gains Sentinel).
                context.player1.clickCard(context.resupply);
                context.player2.passAction();
                context.player1.clickCard(context.admiralPiett);
                expect(legion.getPower()).not.toBe(legionPowerBefore);
                expect(Object.keys(gameObjectManager.buildGameStateForSnapshot()).length).toBeGreaterThan(Object.keys(restoredStates).length);

                const result = rollbackManual(context, snapshotId);
                expect(result.success).toBeTrue();
                expect(legion.getPower()).toBe(legionPowerBefore);

                // Compared before the pipeline restart: only the restore and its hooks have run.
                const live = gameObjectManager.buildGameStateForSnapshot() as Record<string, SerializedStateRecord>;
                expect(Object.keys(live).sort()).toEqual(Object.keys(restoredStates).sort());
                for (const uuid of Object.keys(restoredStates)) {
                    expect(live[uuid]).toEqual(restoredStates[uuid], uuid);
                }

                settle(context, result);
            });
        });

        describe('clearAllSnapshots', function() {
            it('discards the window, stops recording, and starts rather than checkpoints at the next snapshot', async function() {
                const context = await setupBoard();
                if (undoReplayEnabled) {
                    pending('clearAllSnapshots removes the start-of-test snapshot the undo replay rolls back to');
                }
                const game = context.game;
                const wampa = context.wampa as unknown as IDamageUnit;
                const trackerInstance = tracker(game);
                forceFreshWindow(game);
                wampa.setDamageForStateInjection(2);

                game.snapshotManager.clearAllSnapshots();

                expect(trackerInstance.isTracking).toBeFalse();
                expect(trackerInstance.pendingWindow).toBeNull();
                wampa.setDamageForStateInjection(3);
                expect(trackerInstance.pendingWindow).toBeNull();

                // A registration while stopped is not recorded.
                const late = new DeltaTrackerWrapperFixture(game);
                expect(trackerInstance.pendingWindow).toBeNull();
                expect(late.uuid).toBeDefined();

                const calls: string[] = [];
                const originalStart = trackerInstance.startTracking;
                const originalCheckpoint = trackerInstance.checkpoint;
                withPatch(trackerInstance, 'startTracking', (anchor: IDeltaTrackerAnchor) => {
                    calls.push('startTracking');
                    originalStart.call(trackerInstance, anchor);
                }, () => withPatch(trackerInstance, 'checkpoint', (anchor: IDeltaTrackerAnchor) => {
                    calls.push('checkpoint');
                    return originalCheckpoint.call(trackerInstance, anchor);
                }, () => forceFreshWindow(game)));

                expect(calls).toEqual(['startTracking']);
                expect(trackerInstance.isTracking).toBeTrue();
                expect(trackerInstance.pendingWindow.anchor.snapshotId).toBe(game.snapshotManager.currentSnapshotId);
                expect(trackerInstance.pendingWindow.changedFields.size).toBe(0);
            });
        });

        describe('populated value collections', function() {
            it('restores populated @stateMap/@stateSet/@stateArray fields through the wrappers without throwing, and records nothing for the restore', async function() {
                const context = await setupBoard();
                const game = context.game;
                const trackerInstance = tracker(game);
                const fixture = newFixture(context);
                fixture.valueMap = new Map([['a', 1], ['b', 2]]);
                fixture.valueSet = new Set([1, 2]);
                fixture.valueArray = [1, 2];

                forceFreshWindow(game);
                const snapshotId = contextRef.snapshot.takeManualSnapshot(context.player1Object);
                fixture.valueMap.clear();
                fixture.valueSet.clear();
                fixture.valueArray.splice(0, 2);

                let result: IRollbackResult;
                expect(() => {
                    result = rollbackManual(context, snapshotId);
                }).not.toThrow();

                expect(result.success).toBeTrue();
                expect(fixture.valueMap instanceof ValueMap).toBeTrue();
                expect(fixture.valueSet instanceof ValueSet).toBeTrue();
                expect(fixture.valueArray instanceof ValueArray).toBeTrue();
                expect([...fixture.valueMap]).toEqual([['a', 1], ['b', 2]]);
                expect([...fixture.valueSet]).toEqual([1, 2]);
                expect([...fixture.valueArray]).toEqual([1, 2]);
                expect(trackerInstance.pendingWindow.changedFields.has(fixture.uuid)).toBeFalse();

                settle(context, result);
            });
        });
    }, true);

    // The harness runs `integration()` at UndoMode.Disabled unless the whole suite is replayed under undo, so the
    // disabled case needs the plain form.
    integration(function(contextRef) {
        it('never tracks in a game with undo disabled', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: { groundArena: ['wampa'], hand: ['battlefield-marine'], resources: 6 },
                player2: { spaceArena: ['cartel-spacer'] }
            });
            if (undoReplayEnabled) {
                pending('the whole suite is replayed with undo enabled');
            }
            const { context } = contextRef;
            const wampa = context.wampa as unknown as IDamageUnit;
            const trackerInstance = tracker(context.game);

            expect(trackerInstance.isTracking).toBeFalse();
            wampa.setDamageForStateInjection(2);
            context.player1.clickCard(context.battlefieldMarine);

            expect(trackerInstance.isTracking).toBeFalse();
            expect(trackerInstance.pendingWindow).toBeNull();
        });
    });
});
