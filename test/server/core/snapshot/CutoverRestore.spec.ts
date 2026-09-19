import type { GameObjectBase } from '../../../../server/game/core/GameObjectBase';
import type { IGameSnapshot } from '../../../../server/game/core/snapshot/SnapshotInterfaces';
import { SnapshotTimepoint } from '../../../../server/game/core/snapshot/SnapshotInterfaces';

/**
 * `P3-PB2` (`PB2-C5`, `PB2-C6`, `PB2-C7`). These cases exist because the whole gating suite will not
 * reliably catch the failure this cutover most risks. If a generated deserializer stopped assigning through
 * the public accessor, the restored field would be a plain `Array`/`Map` where a wrapper belongs; nothing
 * would fail to compile, later pushes would never latch `_hasRef`, `removeUnusedGameObjects()` would cull
 * the referent at the *next* snapshot, and the rollback *after that* would die in `getFromUuidUnsafe` - a
 * `SevereHaltGame` two commits' worth of green tests later.
 *
 * The parity harness's round-trip compare is blind to this by construction: `encodeRefArray(plainArray)`
 * emits the identical uuid list. A green parity run is not evidence for `PB2-C5`.
 */

interface ISnapshotMapInternals {
    snapshots: Map<number, IGameSnapshot>;
    rollbackToSnapshot(key: number): number | null;
}
interface ISnapshotManagerInternals {
    manualSnapshots: Map<string, ISnapshotMapInternals>;
}
interface ISnapshotFactoryInternals {
    createSnapshotForCurrentTimepoint(timepoint: SnapshotTimepoint): void;
}
interface ISnapshotManagerFactoryInternals {
    snapshotFactory: ISnapshotFactoryInternals;
}

function getManualSnapshotContainer(game: { snapshotManager: unknown }, playerId: string): ISnapshotMapInternals {
    return (game.snapshotManager as unknown as ISnapshotManagerInternals).manualSnapshots.get(playerId);
}

function forceFreshCurrentSnapshot(game: { snapshotManager: unknown }): void {
    (game.snapshotManager as unknown as ISnapshotManagerFactoryInternals).snapshotFactory.createSnapshotForCurrentTimepoint(SnapshotTimepoint.Action);
}

// Cast through `unknown` to reach `integration`'s own internal 2-arg form (enableUndo=true): every case
// here needs a real rollback (UndoMode.Free) reliably in every run mode, including `npm run test-parallel`
// where `ENABLE_UNDO_ALL_TESTS` is unset and plain `integration(fn)` would run at UndoMode.Disabled with
// every snapshot/rollback call silently no-opping.
const integrationWithUndo = integration as unknown as (
    definitions: (contextRef: SwuTestContextRef) => void,
    enableUndo: boolean
) => void;

describe('P3-PB2 cutover restore', function() {
    describe('PB2-C5: restore assigns through the accessor setters, so ref collections come back as live wrappers that still latch', function() {
        integrationWithUndo(function(contextRef) {
            it('DeckZone.deck is an UndoArray after a real rollback, so its mutators are the latching overrides', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: { groundArena: ['wampa'], resources: 3, deck: ['cartel-spacer', 'battlefield-marine'] },
                    player2: { spaceArena: ['cartel-spacer'] }
                });
                const { context } = contextRef;

                const snapshotId = contextRef.snapshot.takeManualSnapshot(context.player1Object);
                context.setDamage(context.wampa, 2);
                expect(contextRef.snapshot.rollbackToSnapshot({ type: 'manual', playerId: context.player1Object.id, snapshotId })).toBe(true);

                const deckZone = context.player1Object.deckZone;

                // The whole assertion. The wrapper *type* is what this case can discriminate: restore
                // through the accessor rebuilds an UndoArray, restore through raw backing storage would
                // leave a plain Array, and nothing else in the suite notices the difference.
                //
                // P3-PB2 fix (PB2I1-CS-02 / PB2I1-AC-02): a "and the push latches _hasRef" half used to
                // follow, and it could not fail. `GameObjectBase.hasRef` is `_hasRef || alwaysTrackState`
                // and `Card.alwaysTrackState` returns literal `true`, so both the latch read and the
                // survives-a-cull read are constants for any card, green with the markStateRefArray call
                // deleted. The real false->true latch transitions are asserted in `GameObjectUtils.spec.ts`'s
                // `P3-PB2 eager ref marking (PB2-C4)` block, on a fixture whose `alwaysTrackState` is false -
                // that block is the coverage for PB2-C4, not this one. Do not delete it as redundant.
                expect(deckZone.deck.constructor.name).toBe('UndoArray');
            });

            it('a @stateRefMap field (StateWatcherRegistrar.watchers) is an UndoMap after a real rollback, repopulated through the setter', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: { groundArena: ['wampa'], resources: 3 },
                    player2: { spaceArena: ['cartel-spacer'] }
                });
                const { context } = contextRef;

                const snapshotId = contextRef.snapshot.takeManualSnapshot(context.player1Object);
                context.setDamage(context.wampa, 2);
                expect(contextRef.snapshot.rollbackToSnapshot({ type: 'manual', playerId: context.player1Object.id, snapshotId })).toBe(true);

                const registrar = context.game.stateWatcherRegistrar as unknown as { watchers: Map<string, GameObjectBase> };
                // Same shape and same limit as the refArray case above: the wrapper type is the falsifier,
                // and the non-empty size keeps it from passing over an empty map that any implementation
                // would rebuild correctly. The latch itself is `GameObjectUtils.spec.ts`'s PB2-C4 block --
                // `StateWatcher.alwaysTrackState` is literal `true`, so `watcher.hasRef` is a constant here.
                expect(registrar.watchers.constructor.name).toBe('UndoMap');
                expect(registrar.watchers.size).toBeGreaterThan(0);
            });
        }, true);
    });

    describe('PB2-C6 / PB2-C7: repeated rollback to one snapshot is identical, because nothing in the snapshot is ever aliased', function() {
        integrationWithUndo(function(contextRef) {
            it('two rollbacks to the same snapshot, with per-object and game-level mutation in between, produce identical state', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: { groundArena: ['wampa'], resources: 3, deck: ['cartel-spacer', 'battlefield-marine'] },
                    player2: { spaceArena: ['cartel-spacer'] }
                });
                const { context } = contextRef;

                forceFreshCurrentSnapshot(context.game);
                const snapshotId = contextRef.snapshot.takeManualSnapshot(context.player1Object);
                const retainedStates = getManualSnapshotContainer(context.game, context.player1Object.id).snapshots.get(snapshotId).states;
                const retainedGameState = getManualSnapshotContainer(context.game, context.player1Object.id).snapshots.get(snapshotId).gameState;
                const statesAtSnapshotTime = JSON.stringify(retainedStates);
                const gameStateAtSnapshotTime = JSON.stringify(retainedGameState);

                context.setDamage(context.wampa, 2);
                expect(contextRef.snapshot.rollbackToSnapshot({ type: 'manual', playerId: context.player1Object.id, snapshotId })).toBe(true);
                const firstDamage = context.wampa.damage;
                const firstDeckLength = context.player1Object.deckZone.deck.length;
                const firstWinnerNames = [...(context.game as unknown as { state: { winnerNames: string[] } }).state.winnerNames];

                // The mutation kind matters. A primitive reassignment cannot reach a retained record under
                // *any* implementation, so it would make this case vacuous. Both mutations below are
                // in-place container mutations on objects the snapshot holds records for:
                //   - `deck.pop()` with no matching push, on a per-object @stateRefArray field;
                //   - `winnerNames.push` / `movedCards.push` on game.state, which is the one genuinely new
                //     aliasing surface this cutover introduces (Game.state is stored as a record now, and
                //     restore must decode it rather than assign it).
                context.setDamage(context.wampa, 4);
                (context.player1Object.deckZone.deck as unknown as unknown[]).pop();
                const liveGameState = (context.game as unknown as { state: { winnerNames: string[]; movedCards: unknown[] } }).state;
                liveGameState.winnerNames.push('pb2-c6-probe');
                liveGameState.movedCards.push(context.wampa as never);

                expect(contextRef.snapshot.rollbackToSnapshot({ type: 'manual', playerId: context.player1Object.id, snapshotId })).toBe(true);

                expect(context.wampa.damage).toBe(firstDamage);
                expect(context.player1Object.deckZone.deck.length).toBe(firstDeckLength);
                expect([...(context.game as unknown as { state: { winnerNames: string[] } }).state.winnerNames]).toEqual(firstWinnerNames);

                // The retained snapshot itself was never touched by either restore.
                expect(JSON.stringify(retainedStates)).toBe(statesAtSnapshotTime);
                expect(JSON.stringify(retainedGameState)).toBe(gameStateAtSnapshotTime);
            });

            it('Game.state is decoded, not assigned: after a rollback it is a distinct object and mutating it leaves the snapshot untouched', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: { groundArena: ['wampa'], resources: 3 },
                    player2: { spaceArena: ['cartel-spacer'] }
                });
                const { context } = contextRef;

                forceFreshCurrentSnapshot(context.game);
                const snapshotId = contextRef.snapshot.takeManualSnapshot(context.player1Object);
                const snapshot = getManualSnapshotContainer(context.game, context.player1Object.id).snapshots.get(snapshotId);

                // The stored payload is a plain JSON-safe record, not a Buffer and not the live object.
                expect(Buffer.isBuffer(snapshot.gameState)).toBe(false);
                expect(snapshot.gameState).not.toBe((context.game as unknown as { state: unknown }).state);

                context.setDamage(context.wampa, 2);
                expect(contextRef.snapshot.rollbackToSnapshot({ type: 'manual', playerId: context.player1Object.id, snapshotId })).toBe(true);

                const restored = (context.game as unknown as { state: { winnerNames: string[] } }).state;
                expect(restored as unknown).not.toBe(snapshot.gameState);

                const snapshotWinnerNamesBefore = JSON.stringify((snapshot.gameState as { winnerNames: string[] }).winnerNames);
                restored.winnerNames.push('pb2-c7-probe');
                expect(JSON.stringify((snapshot.gameState as { winnerNames: string[] }).winnerNames)).toBe(snapshotWinnerNamesBefore);
            });
        }, true);
    });
});
