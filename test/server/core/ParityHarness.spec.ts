import v8 from 'node:v8';

import { GameObjectBase } from '../../../server/game/core/GameObjectBase';
import type { GameStateManager } from '../../../server/game/core/snapshot/GameStateManager';
import { getStateSerializerFor } from '../../../server/game/core/StateSerializers';
import { compareSnapshotRecords, getParityHarnessStats } from '../../helpers/ParityHarness';

/**
 * Committed regression coverage for the P3-PA2 serialize-leg parity harness. See
 * `.anvil/p3-pa2/plan.md` §5 step 3 / §7 for the acceptance criteria (AC1-AC5, AC9) each `describe` below
 * establishes. `test/helpers/ParityHarness.ts` is imported directly (not just relied on via jasmine's
 * helper auto-load) so these specs can reach its exported functions.
 */

function getManager(game: { gameObjectManager: unknown }): GameStateManager {
    return game.gameObjectManager as unknown as GameStateManager;
}

function buildBuffer(manager: GameStateManager): Buffer {
    return (manager as unknown as { buildGameStateForSnapshot(): Buffer }).buildGameStateForSnapshot();
}

describe('Parity harness', function() {
    describe('AC1: install/fire evidence, meaningful in both flag modes', function() {
        // Cast through `unknown` to reach `integration`'s own internal 2-arg form (enableUndo=true):
        // this spec must force a real snapshot (UndoMode.Free) reliably in every run mode, including
        // `npm run test-parallel`/`test-parity` where `ENABLE_UNDO_ALL_TESTS` is unset. Using the
        // `undoIntegration` marker instead would make this spec become a no-op `xit` stub whenever
        // `ENABLE_UNDO_ALL_TESTS=true` (`test-parallel-undo`/`test-parity-undo`), which would leave it
        // pending rather than passing in exactly the runs AC7 requires it to pass in.
        const integrationWithUndo = integration as unknown as (
            definitions: (contextRef: SwuTestContextRef) => void,
            enableUndo: boolean
        ) => void;

        integrationWithUndo(function(contextRef) {
            it('with the flag on, installs and records at least one compared snapshot; with the flag off, stays uninstalled', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: { groundArena: ['wampa'], resources: 3 },
                    player2: { spaceArena: ['cartel-spacer'] }
                });
                const { context } = contextRef;

                // Guaranteed to force a real snapshot under UndoMode.Free: ActionWindow.checkUpdateSnapshot
                // runs on every tick and calls moveToNextTimepoint/takeSnapshot as soon as the snapshotted
                // action number changes, which happens on entering the action phase and again here.
                context.player1.clickPrompt('Pass');

                const parityOn = process.env.ENABLE_PARITY_HARNESS === 'true';
                const stats = getParityHarnessStats();
                if (parityOn) {
                    expect(stats.installed).toBe(true);
                    expect(stats.snapshotsCompared).toBeGreaterThanOrEqual(1);
                } else {
                    expect(stats.installed).toBe(false);
                }
            });
        }, true);
    });

    describe('AC2: compareSnapshotRecords is side-effect-free', function() {
        integration(function(contextRef) {
            it('never calls getObjectId() while comparing a real snapshot', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: { groundArena: ['wampa'], resources: 3 },
                    player2: { spaceArena: ['cartel-spacer'] }
                });
                const { context } = contextRef;
                const manager = getManager(context.game);
                // Production call, outside the stub below - this is not gameplay, and it is the exact call
                // the real snapshot path makes.
                const buffer = buildBuffer(manager);

                const originalGetObjectId = GameObjectBase.prototype.getObjectId;
                GameObjectBase.prototype.getObjectId = function() {
                    throw new Error('getObjectId() must never be called by compareSnapshotRecords');
                };
                try {
                    expect(() => compareSnapshotRecords(manager, buffer)).not.toThrow();
                } finally {
                    GameObjectBase.prototype.getObjectId = originalGetObjectId;
                }
            });
        });
    });

    describe('AC3: the undefined(old)/null(new) exception is scoped to the top level only, and only that exact direction', function() {
        integration(function(contextRef) {
            async function setupBoard() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: { groundArena: ['wampa'], resources: 3 },
                    player2: { spaceArena: ['cartel-spacer'] }
                });
            }

            it('(a) an unset scalar stateRef field at the top level (Wampa._parentCard) reports no mismatch', async function() {
                await setupBoard();
                const { context } = contextRef;
                const wampa = context.wampa as unknown as GameObjectBase;
                const entry = getStateSerializerFor(wampa);
                const newRecord = entry.serializer.serialize(wampa) as Record<string, unknown>;
                const oldRecord = wampa.getStateUnsafe() as unknown as Record<string, unknown>;

                // Wampa is not attached as a pilot to anything, so this field is genuinely absent on the
                // old side (`undefined`) and encoded as `null` on the new side - exactly the one pinned
                // asymmetry.
                expect(oldRecord._parentCard).toBeUndefined();
                expect(newRecord._parentCard).toBeNull();

                const manager = getManager(context.game);
                const buffer = buildBuffer(manager);
                expect(() => compareSnapshotRecords(manager, buffer)).not.toThrow();
            });

            it('(b) a scoped monkeypatch that turns one top-level field undefined on the new side, while the old side holds a real value, fails and names that field', async function() {
                await setupBoard();
                const { context } = contextRef;
                const wampa = context.wampa as unknown as GameObjectBase;
                const manager = getManager(context.game);
                const entry = getStateSerializerFor(wampa);
                const originalSerialize = entry.serializer.serialize;

                const buffer = v8.serialize({ [wampa.uuid]: { someField: 'real-value' } });
                entry.serializer.serialize = () => ({ someField: undefined });
                try {
                    expect(() => compareSnapshotRecords(manager, buffer)).toThrowError(/field="someField"/);
                } finally {
                    entry.serializer.serialize = originalSerialize;
                }
            });

            it('the reverse direction (old=null, new=undefined) is never forgiven, even at the top level', async function() {
                await setupBoard();
                const { context } = contextRef;
                const wampa = context.wampa as unknown as GameObjectBase;
                const manager = getManager(context.game);
                const entry = getStateSerializerFor(wampa);
                const originalSerialize = entry.serializer.serialize;

                const buffer = v8.serialize({ [wampa.uuid]: { someField: null } });
                entry.serializer.serialize = () => ({ someField: undefined });
                try {
                    expect(() => compareSnapshotRecords(manager, buffer)).toThrowError(/field="someField"/);
                } finally {
                    entry.serializer.serialize = originalSerialize;
                }
            });

            it('(c) the same undefined(old)/null(new) pattern below the top level, inside a value-kind payload, is not forgiven', async function() {
                await setupBoard();
                const { context } = contextRef;
                const wampa = context.wampa as unknown as GameObjectBase;
                const manager = getManager(context.game);
                const entry = getStateSerializerFor(wampa);
                const originalSerialize = entry.serializer.serialize;

                const buffer = v8.serialize({ [wampa.uuid]: { someField: { nested: undefined } } });
                entry.serializer.serialize = () => ({ someField: { nested: null } });
                try {
                    expect(() => compareSnapshotRecords(manager, buffer)).toThrowError(/field="someField\.nested"/);
                } finally {
                    entry.serializer.serialize = originalSerialize;
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
                const manager = getManager(context.game);
                const buffer = buildBuffer(manager);

                expect(() => compareSnapshotRecords(manager, buffer)).not.toThrow();
            });

            it('the same members in reversed order on the new side are reported as a mismatch, proving no sort happens before comparison', async function() {
                await setupBoard();
                const { context } = contextRef;
                const registrar = context.game.stateWatcherRegistrar as unknown as GameObjectBase;
                const manager = getManager(context.game);
                const buffer = buildBuffer(manager);
                const entry = getStateSerializerFor(registrar);
                const originalSerialize = entry.serializer.serialize;

                const record = originalSerialize(registrar) as { watchers: { $map: [string, unknown][] } | null };
                expect(record.watchers).not.toBeNull();
                expect(record.watchers.$map.length).toBeGreaterThanOrEqual(2);

                entry.serializer.serialize = () => ({ ...record, watchers: { $map: [...record.watchers.$map].reverse() } });
                try {
                    expect(() => compareSnapshotRecords(manager, buffer)).toThrowError(/field="watchers/);
                } finally {
                    entry.serializer.serialize = originalSerialize;
                }
            });
        });
    });

    describe('AC5 (pilot): an injected mismatch fails the currently-running spec loudly, naming class/uuid/field', function() {
        integration(function(contextRef) {
            it('fails with the expected class/uuid/field text while the monkeypatch is active, and passes once restored', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: { groundArena: ['wampa'], resources: 3 },
                    player2: { spaceArena: ['cartel-spacer'] }
                });
                const { context } = contextRef;
                const wampa = context.wampa as unknown as GameObjectBase;
                const manager = getManager(context.game);
                const buffer = buildBuffer(manager);
                const entry = getStateSerializerFor(wampa);
                const originalSerialize = entry.serializer.serialize;
                const className = (wampa as unknown as { constructor: { name: string } }).constructor.name;

                // Scoped to `wampa` specifically (by instance identity), not every NonLeaderUnitCard on the
                // board (e.g. the opponent's Cartel Spacer shares this same registry entry) - otherwise the
                // mismatch could deterministically fire on a different card's uuid instead.
                entry.serializer.serialize = function(instance) {
                    const record = originalSerialize(instance) as Record<string, unknown>;
                    if (instance !== wampa) {
                        return record;
                    }
                    return { ...record, _damage: (record._damage as number ?? 0) + 1 };
                };
                try {
                    expect(() => compareSnapshotRecords(manager, buffer)).toThrowError(
                        new RegExp(`class=${className} uuid=${wampa.uuid} field="_damage"`)
                    );
                } finally {
                    entry.serializer.serialize = originalSerialize;
                }

                // Restored: the same buffer/manager compare cleanly again with no injected mismatch.
                expect(() => compareSnapshotRecords(manager, buffer)).not.toThrow();
            });
        });
    });

    describe('AC9: an unhandled reserved tag is reported as a failure naming the tag, never compared leniently as a plain object', function() {
        integration(function(contextRef) {
            it('throws naming the tag when the new side carries a reserved tag with no comparator branch ($num)', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: { groundArena: ['wampa'], resources: 3 },
                    player2: { spaceArena: ['cartel-spacer'] }
                });
                const { context } = contextRef;
                const wampa = context.wampa as unknown as GameObjectBase;
                const manager = getManager(context.game);
                const entry = getStateSerializerFor(wampa);
                const originalSerialize = entry.serializer.serialize;

                const buffer = v8.serialize({ [wampa.uuid]: { someField: 'anything' } });
                entry.serializer.serialize = () => ({ someField: { $num: 'NaN' } });
                try {
                    expect(() => compareSnapshotRecords(manager, buffer)).toThrowError(/reserved tag "\$num"/);
                } finally {
                    entry.serializer.serialize = originalSerialize;
                }
            });
        });
    });
});
