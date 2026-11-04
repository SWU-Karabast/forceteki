import { SnapshotType } from '../../../server/game/core/Constants';
import { GameStateManager } from '../../../server/game/core/snapshot/GameStateManager';
import type { IQuickEntrySummary } from '../../../server/game/core/snapshot/container/DeltaSnapshotContainer';
import type { DeltaSnapshotIndex } from '../../../server/game/core/snapshot/container/DeltaSnapshotIndex';
import type { IGameSnapshot } from '../../../server/game/core/snapshot/SnapshotInterfaces';
import { DeltaSnapshotKind } from '../../../server/game/core/snapshot/SnapshotInterfaces';
import { compareLiveWithSnapshot } from '../../helpers/DeltaParityGate';

/**
 * P4-F (`docs/plans/04-delta-snapshots.md`, Open issues, getQuickRollbackPoint): a quick undo from a phase-boundary prompt restores a
 * hollow action snapshot through a delta chain that crosses the boundary's bridge snapshots, and every quick undo the game offers is
 * restorable, including at the three-delta cap with index eviction on. Each landing is compared with a reference: the
 * materialization of that snapshot taken while it was current.
 *
 * An `undoIntegration` file (the card harness, integration(), with undo enabled), like its neighbours, so it is pending under
 * ENABLE_UNDO_ALL_TESTS, which turns index eviction off.
 */

interface IQuickContainerInternals {
    getEntrySummaries(): readonly IQuickEntrySummary[];
}
interface IManagerInternals {
    quickSnapshots: Map<string, IQuickContainerInternals>;
    snapshotFactory: { currentActionSnapshot: IGameSnapshot };
}

/** The current snapshot object itself (the restored target after a rollback). */
function currentSnapshotObject(game): IGameSnapshot {
    return (game.snapshotManager as unknown as IManagerInternals).snapshotFactory.currentActionSnapshot;
}

function indexOf(game): DeltaSnapshotIndex {
    return game.snapshotManager.deltaSnapshotIndex;
}

function reference(game): IGameSnapshot {
    return game.snapshotManager.materializeCurrentSnapshot();
}

function expectLandedOn(game, expected: IGameSnapshot): void {
    expect(game.snapshotManager.currentSnapshotId).toBe(expected.id);
    expect(compareLiveWithSnapshot(game, expected)).toBeNull();
}

/** Counts delta chain restores (and the bridges they crossed) while `body` runs. */
function withDeltaRestoreLog<T>(body: (log: { restores: number }) => T): T {
    const log = { restores: 0 };
    const original = GameStateManager.prototype.rollbackToDeltaChain;
    GameStateManager.prototype.rollbackToDeltaChain = function(this: GameStateManager, ...args: Parameters<typeof original>) {
        log.restores++;
        return original.apply(this, args);
    };
    try {
        return body(log);
    } finally {
        GameStateManager.prototype.rollbackToDeltaChain = original;
    }
}

function bridgesAbove(game, targetId: number): number {
    const index = indexOf(game);
    return index.getIds().filter((id) => id > targetId && index.get(id).kind === DeltaSnapshotKind.Bridge).length;
}

describe('Phase-boundary quick undo through the delta chain', function() {
    undoIntegration(function(contextRef) {
        describe('boundary-prompt-chain', function() {
            it('the end-of-action-phase prompted player\'s quick undo crosses the EndOfPhase bridge and lands on its last action state', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['tactical-advantage'],
                        spaceArena: ['onyx-squadron-brute'],
                        base: { card: 'chopper-base', damage: 5 }
                    },
                    player2: {
                        hand: ['open-fire']
                    }
                });
                const { context } = contextRef;
                const game = context.game;

                context.player1.clickCard(context.tacticalAdvantage);
                context.player1.clickCard(context.onyxSquadronBrute);
                context.player2.clickCard(context.openFire);
                context.player2.clickCard(context.onyxSquadronBrute);

                const p1LastAction = reference(game);
                expect(game.snapshotManager.materializeCurrentSnapshot().source?.hollow).toBeTrue();
                context.player1.passAction();
                context.player2.passAction();

                // Brute's end-of-phase trigger prompts player 1 inside the EndOfPhase window.
                expect(game.currentPhase).toBeNull();
                expect(bridgesAbove(game, p1LastAction.id)).toBeGreaterThan(0);

                withDeltaRestoreLog((log) => {
                    expect(contextRef.snapshot.rollbackToSnapshot({ type: 'quick', playerId: context.player1.id })).toBeTrue();
                    expect(log.restores).toBe(1);
                });
                expectLandedOn(game, p1LastAction);
                expect(game.currentPhase).toBe('action');
                expect(context.onyxSquadronBrute).toBeInZone('spaceArena');
            });

            it('a Regroup Sneak Attack prompt\'s quick undo crosses the EndOfPhase and StartOfPhase bridges into the action phase', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        spaceArena: ['inferno-four#unforgetting', 'system-patrol-craft'],
                        hand: ['sneak-attack', 'ruthless-raider']
                    },
                    player2: {
                        spaceArena: ['green-squadron-awing'],
                        groundArena: ['wampa'],
                        hand: ['sneak-attack', 'ruthless-raider']
                    }
                });
                const { context } = contextRef;
                const game = context.game;

                context.player1.clickCard(context.player1.findCardByName('sneak-attack'));
                context.player1.clickCard(context.player1.findCardByName('ruthless-raider'));
                context.player1.clickCard(context.greenSquadronAwing);
                context.player2.clickCard(context.player2.findCardByName('sneak-attack'));
                context.player2.clickCard(context.player2.findCardByName('ruthless-raider'));
                context.player2.clickCard(context.systemPatrolCraft);

                const lastAction = reference(game);
                context.moveToRegroupPhase();
                expect(game.currentPhase).toBe('regroup');
                expect(bridgesAbove(game, lastAction.id)).toBeGreaterThanOrEqual(2);

                // Nothing decided in the boundary window yet, so the undo reverts to the last action of the action phase (PhaseStartAndEnd.spec.ts).
                withDeltaRestoreLog((log) => {
                    expect(contextRef.snapshot.rollbackToSnapshot({ type: 'quick', playerId: context.player1.id })).toBeTrue();
                    expect(log.restores).toBe(1);
                });
                expectLandedOn(game, lastAction);
                expect(game.currentPhase).toBe('action');
            });

            it('a start-of-action-phase Thrawn prompt\'s quick undo lands on the full regroup snapshot with the reference state', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['battlefield-marine'],
                        deck: ['takedown', 'vanquish', 'rivals-fall', 'cartel-spacer'],
                        leader: 'grand-admiral-thrawn#patient-and-insightful',
                        resources: 3,
                    },
                    player2: {
                        groundArena: ['wampa', 'atst'],
                        deck: ['steadfast-battalion', 'avenger#hunting-star-destroyer', 'specforce-soldier']
                    },
                    phaseTransitionHandler: (phase) => {
                        if (phase === 'action') {
                            contextRef.context.player1.clickDone();
                        }
                    }
                });
                const { context } = contextRef;
                const game = context.game;

                context.moveToRegroupPhase();
                context.player1.clickDone();
                context.player2.clickDone();

                // Compared right after the restore: resuming the regroup pipeline afterwards emits events before the next prompt.
                const result = withDeltaRestoreLog((log) => {
                    const rollback = game.snapshotManager.rollbackTo({ type: SnapshotType.Quick, playerId: context.player1.id });
                    // The target is a full regroup snapshot (PhaseStartAndEnd.spec.ts pins the landing), so this restore is a full one.
                    expect(log.restores).toBe(0);
                    return rollback;
                });
                expect(result.success).toBeTrue();
                expect(game.currentPhase).toBe('regroup');
                const landed = currentSnapshotObject(game);
                expect(landed.hollow).toBeUndefined();
                expect(compareLiveWithSnapshot(game, landed)).toBeNull();
                if (result.success) {
                    game.postRollbackOperations(result.entryPoint);
                }
            });
        });

        describe('availability-implies-restorable', function() {
            const marines = Array<string>(8).fill('battlefield-marine');

            async function setupBoard() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: { groundArena: [...marines] },
                    player2: { groundArena: [...marines] }
                });
                return contextRef.context;
            }

            function attackBase(context, player, opponentBase): boolean {
                const ready = player.findCardsByName('battlefield-marine').find((unit) => !unit.exhausted);
                if (!ready) {
                    return false;
                }
                player.clickCard(ready);
                player.clickCard(opponentBase);
                return true;
            }

            it('every quick undo offered after five consecutive actions by one player succeeds and lands on its reference, past the three-delta cap', async function() {
                const context = await setupBoard();
                const game = context.game;
                const references = new Map<number, IGameSnapshot>();
                references.set(game.snapshotManager.currentSnapshotId, reference(game));

                for (let i = 0; i < 5; i++) {
                    expect(attackBase(context, context.player1, context.p2Base)).toBeTrue();
                    references.set(game.snapshotManager.currentSnapshotId, reference(game));
                    context.player2.passAction();
                    references.set(game.snapshotManager.currentSnapshotId, reference(game));
                }
                // Player 1 holds more than three delta entries: the cap released the oldest and eviction advanced.
                const manager = game.snapshotManager as unknown as IManagerInternals;
                expect(manager.quickSnapshots.get(context.player1.id).getEntrySummaries()
                    .filter((entry) => entry.type === 'delta' && !entry.live).length).toBeGreaterThanOrEqual(2);
                expect(indexOf(game).evictedThroughId).toBeGreaterThan(-1);

                let undos = 0;
                while (contextRef.snapshot.hasAvailableQuickSnapshot(context.player1.id) && undos < 20) {
                    const summaries = manager.quickSnapshots.get(context.player1.id).getEntrySummaries();
                    expect(contextRef.snapshot.rollbackToSnapshot({ type: 'quick', playerId: context.player1.id })).toBeTrue();
                    const targetId = game.snapshotManager.currentSnapshotId;
                    expect(summaries.find((entry) => entry.snapshotId === targetId)?.live).toBeTrue();
                    expectLandedOn(game, references.get(targetId));
                    undos++;
                }
                expect(undos).toBeGreaterThanOrEqual(2);

                // An undo that is not offered fails cleanly (a plain unsuccessful result), even though its entry's payload was released.
                expect(contextRef.snapshot.rollbackToSnapshot({ type: 'quick', playerId: context.player1.id })).toBeFalse();
            });

            // B4 discriminating experiment: a delta entry whose payload the cap released can still be offered while some action history map
            // holds its snapshot. A deterministic mix of actions and undos by both players, with eviction on, counts how often an offered
            // undo targets a released entry, or one at or below the eviction horizon, and requires every offered undo to succeed.
            it('every quick undo offered in an interleaved sequence of actions and undos by both players succeeds, including released entries', async function() {
                const context = await setupBoard();
                const game = context.game;
                const manager = game.snapshotManager as unknown as IManagerInternals;
                const players = [context.player1, context.player2];
                const bases = [context.p2Base, context.p1Base];
                const references = new Map<number, IGameSnapshot>();
                references.set(game.snapshotManager.currentSnapshotId, reference(game));

                let seed = 12345;
                const next = () => {
                    seed = (seed * 1103515245 + 12345) % 2147483648;
                    return seed / 2147483648;
                };

                let offeredUndos = 0;
                let releasedTargets = 0;
                let beyondHorizonTargets = 0;
                for (let step = 0; step < 60; step++) {
                    const undoer = players[next() < 0.5 ? 0 : 1];
                    if (next() < 0.45 && contextRef.snapshot.hasAvailableQuickSnapshot(undoer.id)) {
                        const summariesBefore = manager.quickSnapshots.get(undoer.id).getEntrySummaries();
                        const evictedBefore = indexOf(game).evictedThroughId;

                        expect(contextRef.snapshot.rollbackToSnapshot({ type: 'quick', playerId: undoer.id })).toBeTrue();
                        offeredUndos++;

                        const targetId = game.snapshotManager.currentSnapshotId;
                        if (summariesBefore.some((entry) => entry.snapshotId === targetId && !entry.live)) {
                            releasedTargets++;
                        }
                        if (targetId <= evictedBefore) {
                            beyondHorizonTargets++;
                        }
                        expectLandedOn(game, references.get(targetId));
                        continue;
                    }

                    const activeIndex = game.actionPhaseActivePlayer === context.player1Object ? 0 : 1;
                    if (!attackBase(context, players[activeIndex], bases[activeIndex])) {
                        break;
                    }
                    references.set(game.snapshotManager.currentSnapshotId, reference(game));
                }

                // Then drain every offer left, alternating players.
                for (let drained = 0; drained < 30; drained++) {
                    const undoer = players[drained % 2];
                    if (!contextRef.snapshot.hasAvailableQuickSnapshot(undoer.id)) {
                        continue;
                    }
                    const summariesBefore = manager.quickSnapshots.get(undoer.id).getEntrySummaries();
                    const evictedBefore = indexOf(game).evictedThroughId;
                    expect(contextRef.snapshot.rollbackToSnapshot({ type: 'quick', playerId: undoer.id })).toBeTrue();
                    offeredUndos++;
                    const targetId = game.snapshotManager.currentSnapshotId;
                    if (summariesBefore.some((entry) => entry.snapshotId === targetId && !entry.live)) {
                        releasedTargets++;
                    }
                    if (targetId <= evictedBefore) {
                        beyondHorizonTargets++;
                    }
                    expectLandedOn(game, references.get(targetId));
                }

                // Every offered undo succeeded and matched its reference (asserted above). An offered target is never a released entry,
                // so availability implies a live delta; a beyond-horizon target can only be a full snapshot, since a hollow one would have
                // thrown DeltaChainBeyondHorizonError.
                expect(offeredUndos).toBeGreaterThan(5, `offered=${offeredUndos} released=${releasedTargets} beyondHorizon=${beyondHorizonTargets}`);
                expect(releasedTargets).toBe(0);
                console.log(`[PhaseBoundaryDeltaUndo] offeredUndos=${offeredUndos} releasedTargets=${releasedTargets} beyondHorizonTargets=${beyondHorizonTargets} evictedThroughId=${indexOf(game).evictedThroughId}`);
            });
        });
    });
});
