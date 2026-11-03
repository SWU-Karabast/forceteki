import { GameErrorSeverity, PhaseName } from '../../../../server/game/core/Constants';
import type { GameObjectBase } from '../../../../server/game/core/GameObjectBase';
import { GameState } from '../../../../server/game/core/GameState';
import type { IGameSnapshot } from '../../../../server/game/core/snapshot/SnapshotInterfaces';
import { SnapshotTimepoint } from '../../../../server/game/core/snapshot/SnapshotInterfaces';
import { DeltaTrackerMode } from '../../../../server/game/core/snapshot/DeltaTracker';
import type { DeltaTracker } from '../../../../server/game/core/snapshot/DeltaTracker';
import type { SerializedStateRecord } from '../../../../server/game/core/StateEncoding';
import { getStateSerializerFor } from '../../../../server/game/core/StateSerializers';
import {
    getFirstHarnessError,
    withDeserializePatchedBeneathHarness,
    withHarnessRethrowSuppressed,
    withParityHarnessInstalled
} from '../../../helpers/ParityHarness';

/**
 * `P4-B`: `Game.state` is the registered `GameState` object, restored by the ordinary update loop instead of a
 * bespoke codec. Each block names the property it establishes:
 *  - AC1 identity: one instance, one uuid, registered, never culled, never replaced.
 *  - AC2 one snapshot path: no `gameState` payload; the record lives in `states`; a snapshot without it is refused.
 *  - AC3 every one of the sixteen fields round-trips, refs back to the identical `Player`.
 *  - AC5 the `oldState` pre-pass still precedes any `Game.state` write.
 *  - AC5 recovery: a restore failure that lands after `Game.state` was written (restored, or torn half-way) is
 *    recovered to the pre-attempt values, because `GameState` restores second to last in the update loop.
 *  - AC6 the Faux Suns format guard on `Game`'s claim-counter accessors survives.
 *  - AC7 the delta tracker sees `Game.state` writes.
 * AC4 (restore copies, never aliases) is `CutoverRestore.spec.ts` PB2-C6 / PB2-C7; AC8 (hash input) is
 * `GeneratedStateSerializers.spec.ts`.
 *
 * The card arrays hold ids, never card objects: a `GameObjectBase` inside a value array makes the next encode throw.
 */

interface ISnapshotMapInternals {
    snapshots: Map<number, IGameSnapshot>;
    rollbackToSnapshot(key: number): number | null;
}
interface ISnapshotManagerInternals {
    manualSnapshots: Map<string, ISnapshotMapInternals>;
    snapshotFactory: { currentActionSnapshot: IGameSnapshot; createSnapshotForCurrentTimepoint(timepoint: SnapshotTimepoint): void };
    clearAllSnapshots(): void;
}
interface IStateManagerInternals {
    rollbackToSnapshot(snapshot: IGameSnapshot, beforeRollbackSnapshot?: IGameSnapshot): boolean;
    _rollbackDepth: number;
}

const gameStateFieldNames = [
    '_uuid',
    'initialFirstPlayer',
    'initiativePlayer',
    'actionPhaseActivePlayer',
    'roundNumber',
    'isInitiativeClaimed',
    'isPlanCounterClaimed',
    'isBlastCounterClaimed',
    'planCounterClaimedByPlayer',
    'blastCounterClaimedByPlayer',
    'allCards',
    'actionNumber',
    'winnerNames',
    'lastGameEventId',
    'currentPhase',
    'prevActionPhasePlayerPassed',
    'movedCards'
];

function snapshotManagerOf(game: { snapshotManager: unknown }): ISnapshotManagerInternals {
    return game.snapshotManager as unknown as ISnapshotManagerInternals;
}

function forceFreshCurrentSnapshot(game: { snapshotManager: unknown }): void {
    snapshotManagerOf(game).snapshotFactory.createSnapshotForCurrentTimepoint(SnapshotTimepoint.Action);
}

function getManualSnapshotContainer(game: { snapshotManager: unknown }, playerId: string): ISnapshotMapInternals {
    return snapshotManagerOf(game).manualSnapshots.get(playerId);
}

function stateManagerOf(game: { gameObjectManager: unknown }): IStateManagerInternals {
    return game.gameObjectManager as unknown as IStateManagerInternals;
}

function serializedGameState(game: { state: GameObjectBase }): string {
    return JSON.stringify(getStateSerializerFor(game.state).serializer.serialize(game.state));
}

// `integration`'s internal 2-arg form (enableUndo=true): every case here needs a real rollback in every run mode.
const integrationWithUndo = integration as unknown as (
    definitions: (contextRef: SwuTestContextRef) => void,
    enableUndo: boolean
) => void;

describe('P4-B Game.state as a registered GameObject', function() {
    describe('AC1: one registered instance with a stable identity', function() {
        integrationWithUndo(function(contextRef) {
            it('AC1 game.state is a GameState registered under its own uuid and survives the snapshot cull', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: { groundArena: ['wampa'], resources: 3 },
                    player2: { spaceArena: ['cartel-spacer'] }
                });
                const { context } = contextRef;
                const game = context.game;

                expect(game.state).toBeInstanceOf(GameState);
                expect(game.state.uuid).toMatch(/^GameState_\d+$/);
                expect(game.gameObjectManager.isRegistered(game.state)).toBe(true);
                expect(game.gameObjectManager.getUnsafe(game.state.uuid)).toBe(game.state);

                // Nothing holds a ref to it, so only alwaysTrackState keeps the cull from dropping it.
                forceFreshCurrentSnapshot(game);
                expect(game.gameObjectManager.isRegistered(game.state)).toBe(true);
                const snapshot = snapshotManagerOf(game).snapshotFactory.currentActionSnapshot;
                expect(snapshot.states[game.state.uuid]).toBeDefined();
            });

            it('AC1 after a successful manual rollback game.state is the same instance, uuid and registry occupant', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: { groundArena: ['wampa'], resources: 3 },
                    player2: { spaceArena: ['cartel-spacer'] }
                });
                const { context } = contextRef;
                const game = context.game;

                forceFreshCurrentSnapshot(game);
                const stateBefore = game.state;
                const uuidBefore = game.state.uuid;
                const snapshotId = contextRef.snapshot.takeManualSnapshot(context.player1Object);

                game.roundNumber = game.roundNumber + 1;
                context.setDamage(context.wampa, 2);
                expect(contextRef.snapshot.rollbackToSnapshot({ type: 'manual', playerId: context.player1Object.id, snapshotId })).toBe(true);

                expect(game.state).toBe(stateBefore);
                expect(game.state.uuid).toBe(uuidBefore);
                expect(game.gameObjectManager.isRegistered(game.state)).toBe(true);
                expect(game.gameObjectManager.getUnsafe(uuidBefore)).toBe(stateBefore);
            });
        }, true);

        // The plain form runs at UndoMode.Disabled unless the whole suite is replayed under undo: construction does not depend on the undo mode.
        integration(function(contextRef) {
            it('AC1 in a game with undo disabled game.state is still the registered GameState and Game accessors read and write it', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: { groundArena: ['wampa'], resources: 3 },
                    player2: { spaceArena: ['cartel-spacer'] }
                });
                const { context } = contextRef;
                const game = context.game;

                expect(game.state).toBeInstanceOf(GameState);
                expect(game.gameObjectManager.isRegistered(game.state)).toBe(true);
                expect(game.gameObjectManager.getUnsafe(game.state.uuid)).toBe(game.state);

                const roundBefore = game.roundNumber;
                game.roundNumber = roundBefore + 1;
                expect(game.state.roundNumber).toBe(roundBefore + 1);
                game.initiativePlayer = context.player2Object;
                expect(game.state.initiativePlayer).toBe(context.player2Object);
                game.initiativePlayer = null;
                expect(game.state.initiativePlayer).toBeNull();
            });
        });

        // Separate block, as ArmedSaveTrigger.spec.ts does: clearing every snapshot would delete the harness's own
        // start-of-test manual snapshot, so this runs for real under test-parallel and is skipped under test-parallel-undo.
        undoIntegration(function(contextRef) {
            it('AC1 clearAllSnapshots leaves game.state the same registered instance with the same uuid', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: { groundArena: ['wampa'], resources: 3 },
                    player2: { spaceArena: ['cartel-spacer'] }
                });
                const { context } = contextRef;
                const game = context.game;

                const stateBefore = game.state;
                const uuidBefore = game.state.uuid;
                snapshotManagerOf(game).clearAllSnapshots();

                expect(game.state).toBe(stateBefore);
                expect(game.state.uuid).toBe(uuidBefore);
                expect(game.gameObjectManager.isRegistered(game.state)).toBe(true);
                expect(game.gameObjectManager.getUnsafe(uuidBefore)).toBe(stateBefore);
            });
        });
    });

    describe('AC2: one snapshot path', function() {
        integrationWithUndo(function(contextRef) {
            it('AC2 a snapshot has no gameState payload and carries the GameState record in states', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: { groundArena: ['wampa'], resources: 3 },
                    player2: { spaceArena: ['cartel-spacer'] }
                });
                const { context } = contextRef;
                const game = context.game;

                forceFreshCurrentSnapshot(game);
                const snapshotId = contextRef.snapshot.takeManualSnapshot(context.player1Object);
                const snapshot = getManualSnapshotContainer(game, context.player1Object.id).snapshots.get(snapshotId);

                expect('gameState' in snapshot).toBe(false);

                const record = snapshot.states[game.state.uuid] as Record<string, unknown>;
                expect(record).toBeDefined();
                expect(Object.keys(record).sort()).toEqual([...gameStateFieldNames].sort());

                // Refs are uuid strings or null; arrays are plain arrays, not the live wrappers.
                expect(game.initiativePlayer).not.toBeNull();
                expect(record.initiativePlayer).toBe(game.initiativePlayer.uuid);
                expect(record.planCounterClaimedByPlayer).toBeNull();
                for (const arrayField of ['allCards', 'winnerNames', 'movedCards']) {
                    expect(Array.isArray(record[arrayField])).toBe(true);
                    expect(Object.getPrototypeOf(record[arrayField])).toBe(Array.prototype);
                }
            });

            it('AC2 a snapshot whose states lack the GameState record is refused before anything is touched, and a valid rollback still succeeds', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: { groundArena: ['wampa'], resources: 3 },
                    player2: { spaceArena: ['cartel-spacer'] }
                });
                const { context } = contextRef;
                const game = context.game;

                forceFreshCurrentSnapshot(game);
                const roundAtSnapshot = game.roundNumber;
                const snapshotId = contextRef.snapshot.takeManualSnapshot(context.player1Object);
                const snapshot = getManualSnapshotContainer(game, context.player1Object.id).snapshots.get(snapshotId);

                const statesWithoutGameState = { ...snapshot.states };
                Reflect.deleteProperty(statesWithoutGameState, game.state.uuid);
                const malformed: IGameSnapshot = { ...snapshot, states: statesWithoutGameState };

                game.roundNumber = roundAtSnapshot + 2;
                context.setDamage(context.wampa, 2);

                expect(() => stateManagerOf(game).rollbackToSnapshot(malformed)).toThrowError(/Game\.state/);

                // Nothing was restored or removed, and the depth counter was not left raised.
                expect(game.roundNumber).toBe(roundAtSnapshot + 2);
                expect(context.wampa.damage).toBe(2);
                expect(stateManagerOf(game)._rollbackDepth).toBe(0);
                expect(game.gameObjectManager.isRegistered(game.state)).toBe(true);

                expect(contextRef.snapshot.rollbackToSnapshot({ type: 'manual', playerId: context.player1Object.id, snapshotId })).toBe(true);
                expect(game.roundNumber).toBe(roundAtSnapshot);
                expect(context.wampa.damage).toBe(0);
            });
        }, true);
    });

    describe('AC3: every field round-trips', function() {
        integrationWithUndo(function(contextRef) {
            it('AC3 all sixteen fields return to their snapshot-time values, and the ref accessors return the identical Players', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    format: 'fauxSuns',
                    player1: {
                        leader: 'luke-skywalker#faithful-friend',
                        secondLeader: 'saw-gerrera#bring-down-the-empire',
                        base: 'kestro-city',
                        hand: ['wampa'],
                        deck: ['battlefield-marine', 'moment-of-peace'],
                    },
                    player2: {
                        leader: 'darth-vader#dark-lord-of-the-sith',
                        base: 'administrators-tower',
                        hand: [],
                        deck: ['death-star-stormtrooper'],
                    }
                });
                const { context } = contextRef;
                const game = context.game;
                const player1 = context.player1Object;
                const player2 = context.player2Object;
                const differentPlayer = (player: typeof player1 | null) => (player === player1 ? player2 : player1);

                forceFreshCurrentSnapshot(game);
                const snapshotId = contextRef.snapshot.takeManualSnapshot(player1);

                const before = {
                    initialFirstPlayer: game.initialFirstPlayer,
                    initiativePlayer: game.initiativePlayer,
                    actionPhaseActivePlayer: game.actionPhaseActivePlayer,
                    planCounterClaimedByPlayer: game.planCounterClaimedByPlayer,
                    blastCounterClaimedByPlayer: game.blastCounterClaimedByPlayer,
                    roundNumber: game.roundNumber,
                    actionNumber: game.actionNumber,
                    lastGameEventId: game.state.lastGameEventId,
                    isInitiativeClaimed: game.isInitiativeClaimed,
                    isPlanCounterClaimed: game.isPlanCounterClaimed,
                    isBlastCounterClaimed: game.isBlastCounterClaimed,
                    currentPhase: game.currentPhase,
                    prevActionPhasePlayerPassed: game.prevActionPhasePlayerPassed,
                    allCards: [...game.state.allCards],
                    movedCards: [...game.state.movedCards],
                    winnerNames: [...game.state.winnerNames]
                };
                expect(before.currentPhase).toBe(PhaseName.Action);
                expect(before.initiativePlayer).not.toBeNull();

                // Change all sixteen. Each ref goes to a different player; each array gets a probe.
                game.initialFirstPlayer = differentPlayer(before.initialFirstPlayer);
                game.initiativePlayer = differentPlayer(before.initiativePlayer);
                game.actionPhaseActivePlayer = differentPlayer(before.actionPhaseActivePlayer);
                game.planCounterClaimedByPlayer = differentPlayer(before.planCounterClaimedByPlayer);
                game.blastCounterClaimedByPlayer = differentPlayer(before.blastCounterClaimedByPlayer);
                game.roundNumber = before.roundNumber + 3;
                game.actionNumber = before.actionNumber + 7;
                game.state.lastGameEventId += 5;
                game.isInitiativeClaimed = !before.isInitiativeClaimed;
                game.isPlanCounterClaimed = !before.isPlanCounterClaimed;
                game.isBlastCounterClaimed = !before.isBlastCounterClaimed;
                game.currentPhase = PhaseName.Regroup;
                game.prevActionPhasePlayerPassed = before.prevActionPhasePlayerPassed !== true;
                game.state.allCards.push(context.wampa.getObjectId());
                game.state.movedCards.push(context.wampa.getObjectId());
                game.state.winnerNames.push('ac3-probe');

                expect(contextRef.snapshot.rollbackToSnapshot({ type: 'manual', playerId: player1.id, snapshotId })).toBe(true);

                expect(game.initialFirstPlayer).toBe(before.initialFirstPlayer);
                expect(game.initiativePlayer).toBe(before.initiativePlayer);
                expect(game.actionPhaseActivePlayer).toBe(before.actionPhaseActivePlayer);
                expect(game.planCounterClaimedByPlayer).toBe(before.planCounterClaimedByPlayer);
                expect(game.blastCounterClaimedByPlayer).toBe(before.blastCounterClaimedByPlayer);
                expect(game.roundNumber).toBe(before.roundNumber);
                expect(game.actionNumber).toBe(before.actionNumber);
                expect(game.state.lastGameEventId).toBe(before.lastGameEventId);
                expect(game.isInitiativeClaimed).toBe(before.isInitiativeClaimed);
                expect(game.isPlanCounterClaimed).toBe(before.isPlanCounterClaimed);
                expect(game.isBlastCounterClaimed).toBe(before.isBlastCounterClaimed);
                expect(game.currentPhase).toBe(before.currentPhase);
                expect(game.prevActionPhasePlayerPassed).toBe(before.prevActionPhasePlayerPassed);
                expect([...game.state.allCards]).toEqual(before.allCards);
                expect([...game.state.movedCards]).toEqual(before.movedCards);
                expect([...game.state.winnerNames]).toEqual(before.winnerNames);
            });
        }, true);
    });

    describe('AC5: the pre-pass precedes any Game.state write', function() {
        integrationWithUndo(function(contextRef) {
            /**
             * Changes a game-level and a per-object field after a manual snapshot, installs a persistent encode
             * failure on `target`, and attempts the rollback through the container (the entry point that returns
             * `null` instead of throwing). Mirrors `RestoreParityHarness.spec.ts` PB2-C13's discipline: every board
             * change happens before the patch, `reportError` is stubbed to model `Lobby.handleError` returning
             * normally for `SevereGameMessageOnly`, and the patch and stub are restored in a `finally`.
             */
            function expectAbortedRollbackLeavesGameStateAlone(context, snapshotId: number, target: GameObjectBase): void {
                const game = context.game;
                const entry = getStateSerializerFor(target);
                const originalSerialize = entry.serializer.serialize;
                const container = getManualSnapshotContainer(game, context.player1Object.id);

                const recordBeforeCall = serializedGameState(game);
                const roundBeforeCall = game.roundNumber;
                const movedCardsBeforeCall = [...game.state.movedCards];

                const gameForReport = game as unknown as { reportError(error: Error, severity: unknown): void };
                const originalReportError = gameForReport.reportError.bind(game);
                const reportedSeverities: unknown[] = [];
                gameForReport.reportError = function(error: Error, severity: unknown) {
                    reportedSeverities.push(severity);
                };

                let result: number | null | undefined;
                try {
                    entry.serializer.serialize = function(instance) {
                        if (instance === target) {
                            throw new Error('P4B_AC5_INJECTED_ENCODE_FAILURE');
                        }
                        return originalSerialize(instance);
                    };

                    withHarnessRethrowSuppressed(() => {
                        result = container.rollbackToSnapshot(snapshotId);
                    });
                } finally {
                    entry.serializer.serialize = originalSerialize;
                    gameForReport.reportError = originalReportError;
                }

                expect(result).toBeNull();
                expect(reportedSeverities).toEqual([GameErrorSeverity.SevereGameMessageOnly]);

                // The post-snapshot values survive: an aborted rollback reverted no Game.state field.
                expect(serializedGameState(game)).toBe(recordBeforeCall);
                expect(game.roundNumber).toBe(roundBeforeCall);
                expect([...game.state.movedCards]).toEqual(movedCardsBeforeCall);
            }

            it('AC5 a pre-pass encode failure on an in-play unit leaves Game.state at its post-snapshot values', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: { groundArena: ['wampa'], resources: 3 },
                    player2: { spaceArena: ['cartel-spacer'] }
                });
                const { context } = contextRef;
                const game = context.game;

                withParityHarnessInstalled(() => {
                    forceFreshCurrentSnapshot(game);
                    const roundAtSnapshot = game.roundNumber;
                    const snapshotId = contextRef.snapshot.takeManualSnapshot(context.player1Object);

                    // setDamage resolves game state, which re-resolves every card listed in movedCards, so push the probe after it.
                    game.roundNumber = roundAtSnapshot + 1;
                    context.setDamage(context.wampa, 2);
                    game.state.movedCards.push(context.wampa.getObjectId());

                    expectAbortedRollbackLeavesGameStateAlone(context, snapshotId, context.wampa as unknown as GameObjectBase);
                    expect(context.wampa.damage).toBe(2);

                    // The refusal was clean: a valid rollback to the same snapshot still restores everything.
                    expect(contextRef.snapshot.rollbackToSnapshot({ type: 'manual', playerId: context.player1Object.id, snapshotId })).toBe(true);
                    expect(game.roundNumber).toBe(roundAtSnapshot);
                    expect(game.state.movedCards.length).toBe(0);
                    expect(context.wampa.damage).toBe(0);
                });
            });

            it('AC5 a pre-pass encode failure on game.state itself leaves Game.state at its post-snapshot values', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: { groundArena: ['wampa'], resources: 3 },
                    player2: { spaceArena: ['cartel-spacer'] }
                });
                const { context } = contextRef;
                const game = context.game;

                withParityHarnessInstalled(() => {
                    forceFreshCurrentSnapshot(game);
                    const roundAtSnapshot = game.roundNumber;
                    const snapshotId = contextRef.snapshot.takeManualSnapshot(context.player1Object);

                    // setDamage resolves game state, which re-resolves every card listed in movedCards, so push the probe after it.
                    game.roundNumber = roundAtSnapshot + 1;
                    context.setDamage(context.wampa, 2);
                    game.state.movedCards.push(context.wampa.getObjectId());

                    expectAbortedRollbackLeavesGameStateAlone(context, snapshotId, game.state);
                    expect(context.wampa.damage).toBe(2);

                    expect(contextRef.snapshot.rollbackToSnapshot({ type: 'manual', playerId: context.player1Object.id, snapshotId })).toBe(true);
                    expect(game.roundNumber).toBe(roundAtSnapshot);
                    expect(game.state.movedCards.length).toBe(0);
                    expect(context.wampa.damage).toBe(0);
                });
            });
        }, true);
    });

    describe('AC5 recovery: a restore failure after Game.state was written recovers Game.state to the pre-attempt values', function() {
        integrationWithUndo(function(contextRef) {
            type RecoveryInjection = 'after-game-state-restored' | 'inside-game-state-restore';

            const injectedMarker = 'P4B_RECOVERY_INJECTED_RESTORE_FAILURE';

            /**
             * `GameState` restores at registry index 1, second to last in the last-to-first update loop; only
             * `OngoingEffectEngine` (index 0) follows it. So a restore failure can leave the outer frame with
             * `Game.state` already at the rollback target's values, or half-written, and the recovery rollback to
             * `beforeRollbackSnapshot` (the current snapshot) has to put it back.
             *
             * Three distinct `Game.state` values keep the outcomes apart: the rollback target (A), the recovery
             * target (C, the current snapshot, taken after changing the fields) and the live values at the time of
             * the attempt. A recovery that skipped `GameState` leaves A's values (injection after the restore) or
             * a mix of A's and the live values (torn restore), and neither equals C.
             *
             *  - 'after-game-state-restored': a one-shot `deserialize` throw on the `OngoingEffectEngine` entry.
             *  - 'inside-game-state-restore': a one-shot throw inside `GameState`'s own `deserialize`, produced by a
             *    record whose `winnerNames` getter throws, after the fields before it were written.
             *
             * The patch sits beneath the parity harness (`withDeserializePatchedBeneathHarness`), is one-shot so
             * the recovery rollback's own restore of the same object succeeds, and is removed in a `finally`
             * together with the `reportError` and `addAlert` stubs. A recovered failure files no `reportError`
             * (that is the unrecoverable branch); it raises the user alert and the parity harness records the error.
             */
            async function expectFailedRestoreRecoversGameState(injection: RecoveryInjection): Promise<void> {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: { groundArena: ['wampa'], resources: 3 },
                    player2: { spaceArena: ['cartel-spacer'] }
                });
                const { context } = contextRef;
                const game = context.game;
                const player1 = context.player1Object;
                const player2 = context.player2Object;
                const otherPlayer = (player: typeof player1) => (player === player1 ? player2 : player1);
                const currentSnapshot = () => snapshotManagerOf(game).snapshotFactory.currentActionSnapshot;

                withParityHarnessInstalled(() => {
                    // The rollback target (A): a fresh snapshot, retained as a manual snapshot.
                    forceFreshCurrentSnapshot(game);
                    const targetSnapshotId = contextRef.snapshot.takeManualSnapshot(player1);
                    const container = getManualSnapshotContainer(game, player1.id);
                    const targetRecord = JSON.stringify(currentSnapshot().states[game.state.uuid]);
                    const target = {
                        roundNumber: game.roundNumber,
                        lastGameEventId: game.state.lastGameEventId,
                        initiativePlayer: game.initiativePlayer
                    };
                    expect(target.initiativePlayer).not.toBeNull();

                    // The recovery target (C): change a scalar, a ref and an array, then take the current snapshot.
                    game.roundNumber = target.roundNumber + 1;
                    game.state.lastGameEventId = target.lastGameEventId + 3;
                    game.initiativePlayer = otherPlayer(target.initiativePlayer);
                    game.state.winnerNames.push('p4b-recovery-target');
                    forceFreshCurrentSnapshot(game);
                    const recoveryRecord = JSON.stringify(currentSnapshot().states[game.state.uuid]);
                    expect(recoveryRecord).not.toBe(targetRecord);

                    // The live values at the time of the attempt differ from both.
                    game.roundNumber = target.roundNumber + 2;
                    game.state.lastGameEventId = target.lastGameEventId + 9;
                    game.initiativePlayer = target.initiativePlayer;
                    game.state.winnerNames.push('p4b-live-only');
                    const liveRecord = serializedGameState(game);
                    expect(liveRecord).not.toBe(targetRecord);
                    expect(liveRecord).not.toBe(recoveryRecord);

                    const engine = game.ongoingEffectEngine as unknown as GameObjectBase;
                    const entry = getStateSerializerFor(injection === 'after-game-state-restored' ? engine : game.state);

                    let injected = false;
                    let stateAtFailure: { roundNumber: number; lastGameEventId: number; record: string } | null = null;
                    const noteStateAtFailure = () => {
                        stateAtFailure = {
                            roundNumber: game.state.roundNumber,
                            lastGameEventId: game.state.lastGameEventId,
                            record: serializedGameState(game)
                        };
                    };
                    const makePatch = (original) => function(gameArg, instance, record: SerializedStateRecord) {
                        if (injected) {
                            original(gameArg, instance, record);
                            return;
                        }
                        if (injection === 'after-game-state-restored' && instance === engine) {
                            injected = true;
                            noteStateAtFailure();
                            throw new Error(injectedMarker);
                        }
                        if (injection === 'inside-game-state-restore' && instance === game.state) {
                            injected = true;
                            const tornRecord = { ...record };
                            Object.defineProperty(tornRecord, 'winnerNames', {
                                enumerable: true,
                                get() {
                                    throw new Error(injectedMarker);
                                }
                            });
                            try {
                                original(gameArg, instance, tornRecord);
                            } catch (error) {
                                noteStateAtFailure();
                                throw error;
                            }
                            throw new Error('P4B_RECOVERY_TORN_RECORD_WAS_NOT_REJECTED');
                        }
                        original(gameArg, instance, record);
                    };

                    const gameStubs = game as unknown as {
                        reportError(error: Error, severity: unknown): void;
                        addAlert(type: unknown, message: string): void;
                    };
                    const originalReportError = gameStubs.reportError.bind(game);
                    const originalAddAlert = gameStubs.addAlert.bind(game);
                    const reportedSeverities: unknown[] = [];
                    const alerts: string[] = [];

                    let result: number | null | undefined;
                    let recordedHarnessError: Error | null = null;
                    try {
                        gameStubs.reportError = function(error: Error, severity: unknown) {
                            reportedSeverities.push(severity);
                        };
                        gameStubs.addAlert = function(_type: unknown, message: string) {
                            alerts.push(message);
                        };

                        withHarnessRethrowSuppressed(() => {
                            withDeserializePatchedBeneathHarness(entry, makePatch, () => {
                                result = container.rollbackToSnapshot(targetSnapshotId);
                            });
                            recordedHarnessError = getFirstHarnessError();
                        });
                    } finally {
                        gameStubs.reportError = originalReportError;
                        gameStubs.addAlert = originalAddAlert;
                    }

                    // Non-vacuity: the failure really landed after Game.state was written, in the intended shape.
                    expect(injected).toBe(true);
                    expect(stateAtFailure).not.toBeNull();
                    if (injection === 'after-game-state-restored') {
                        // Game.state was already at the rollback target's values when the frame failed.
                        expect(stateAtFailure.record).toBe(targetRecord);
                    } else {
                        // Torn: roundNumber (written before winnerNames) is the target's, lastGameEventId (after it) is still live.
                        expect(stateAtFailure.roundNumber).toBe(target.roundNumber);
                        expect(stateAtFailure.lastGameEventId).toBe(target.lastGameEventId + 9);
                        expect(stateAtFailure.record).not.toBe(targetRecord);
                        expect(stateAtFailure.record).not.toBe(liveRecord);
                        expect(stateAtFailure.record).not.toBe(recoveryRecord);
                    }

                    // The failed attempt is a recovered failure: no rollback, one user alert, no escalation report.
                    expect(result).toBeNull();
                    expect(alerts.length).toBe(1);
                    expect(reportedSeverities).toEqual([]);
                    expect(recordedHarnessError).not.toBeNull();
                    expect(recordedHarnessError.message).toContain(injectedMarker);

                    // Recovery put Game.state back to the recovery target's record, not the rollback target's and not a mix.
                    expect(serializedGameState(game)).toBe(recoveryRecord);
                    expect(game.roundNumber).toBe(target.roundNumber + 1);
                    expect(game.state.lastGameEventId).toBe(target.lastGameEventId + 3);
                    expect(game.initiativePlayer).toBe(otherPlayer(target.initiativePlayer));
                    expect([...game.state.winnerNames]).toEqual(['p4b-recovery-target']);

                    // The engine is still usable: a clean retry (the patch and stubs are gone) reaches the rollback target.
                    expect(container.rollbackToSnapshot(targetSnapshotId)).not.toBeNull();
                    expect(serializedGameState(game)).toBe(targetRecord);
                    expect(game.roundNumber).toBe(target.roundNumber);
                    expect(game.state.lastGameEventId).toBe(target.lastGameEventId);
                    expect(game.initiativePlayer).toBe(target.initiativePlayer);
                    expect([...game.state.winnerNames]).toEqual([]);
                });
            }

            it('AC5 recovery a restore failure after GameState was restored is recovered to the current snapshot\'s Game.state', async function() {
                await expectFailedRestoreRecoversGameState('after-game-state-restored');
            });

            it('AC5 recovery a restore failure inside GameState\'s own restore (a torn Game.state) is recovered to the current snapshot\'s Game.state', async function() {
                await expectFailedRestoreRecoversGameState('inside-game-state-restore');
            });
        }, true);
    });

    describe('AC6: the Faux Suns format guard survives the promotion', function() {
        const claimCounterOperations: [string, (game) => unknown][] = [
            ['get isPlanCounterClaimed', (game) => game.isPlanCounterClaimed],
            ['set isPlanCounterClaimed', (game) => (game.isPlanCounterClaimed = true)],
            ['get isBlastCounterClaimed', (game) => game.isBlastCounterClaimed],
            ['set isBlastCounterClaimed', (game) => (game.isBlastCounterClaimed = true)],
            ['get planCounterClaimedByPlayer', (game) => game.planCounterClaimedByPlayer],
            ['set planCounterClaimedByPlayer', (game) => (game.planCounterClaimedByPlayer = game.initiativePlayer)],
            ['get blastCounterClaimedByPlayer', (game) => game.blastCounterClaimedByPlayer],
            ['set blastCounterClaimedByPlayer', (game) => (game.blastCounterClaimedByPlayer = game.initiativePlayer)]
        ];

        function expectGuardThrows(game): void {
            for (const [name, operation] of claimCounterOperations) {
                const expectation = expect(() => operation(game)).withContext(name);
                expectation.toThrowError(/FauxSuns format/);
            }
        }

        integrationWithUndo(function(contextRef) {
            it('AC6 outside Faux Suns all eight claim-counter operations throw, before and after a successful rollback', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: { groundArena: ['wampa'], resources: 3 },
                    player2: { spaceArena: ['cartel-spacer'] }
                });
                const { context } = contextRef;
                const game = context.game;

                expectGuardThrows(game);

                forceFreshCurrentSnapshot(game);
                const snapshotId = contextRef.snapshot.takeManualSnapshot(context.player1Object);
                context.setDamage(context.wampa, 2);
                // The generated deserializer writes every GameState field, so a guard on the storage setters would throw here.
                expect(contextRef.snapshot.rollbackToSnapshot({ type: 'manual', playerId: context.player1Object.id, snapshotId })).toBe(true);

                expectGuardThrows(game);
            });

            it('AC6 in a Faux Suns game the four claim values round-trip through rollbacks in both directions', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    format: 'fauxSuns',
                    player1: {
                        leader: 'luke-skywalker#faithful-friend',
                        secondLeader: 'saw-gerrera#bring-down-the-empire',
                        base: 'kestro-city',
                        hand: ['wampa'],
                        deck: ['battlefield-marine', 'moment-of-peace'],
                    },
                    player2: {
                        leader: 'darth-vader#dark-lord-of-the-sith',
                        base: 'administrators-tower',
                        hand: [],
                        deck: ['death-star-stormtrooper'],
                    }
                });
                const { context } = contextRef;
                const game = context.game;
                const player1 = context.player1Object;
                const player2 = context.player2Object;
                const rollbackTo = (snapshotId: number) => contextRef.snapshot.rollbackToSnapshot({ type: 'manual', playerId: player1.id, snapshotId });

                // Earlier snapshot: nothing claimed.
                forceFreshCurrentSnapshot(game);
                const unclaimedSnapshotId = contextRef.snapshot.takeManualSnapshot(player1);
                expect(game.isPlanCounterClaimed).toBe(false);
                expect(game.planCounterClaimedByPlayer).toBeNull();

                // Later snapshot: both counters claimed, by different players.
                game.isPlanCounterClaimed = true;
                game.planCounterClaimedByPlayer = player1;
                game.isBlastCounterClaimed = true;
                game.blastCounterClaimedByPlayer = player2;
                forceFreshCurrentSnapshot(game);
                const claimedSnapshotId = contextRef.snapshot.takeManualSnapshot(player1);

                // Clear the claims, then restore the claimed values from the later snapshot.
                game.isPlanCounterClaimed = false;
                game.planCounterClaimedByPlayer = null;
                game.isBlastCounterClaimed = false;
                game.blastCounterClaimedByPlayer = null;
                expect(rollbackTo(claimedSnapshotId)).toBe(true);
                expect(game.isPlanCounterClaimed).toBe(true);
                expect(game.planCounterClaimedByPlayer).toBe(player1);
                expect(game.isBlastCounterClaimed).toBe(true);
                expect(game.blastCounterClaimedByPlayer).toBe(player2);

                // Then the unclaimed values from the earlier one.
                expect(rollbackTo(unclaimedSnapshotId)).toBe(true);
                expect(game.isPlanCounterClaimed).toBe(false);
                expect(game.planCounterClaimedByPlayer).toBeNull();
                expect(game.isBlastCounterClaimed).toBe(false);
                expect(game.blastCounterClaimedByPlayer).toBeNull();
            });
        }, true);
    });

    describe('AC7: the delta tracker sees Game.state', function() {
        integrationWithUndo(function(contextRef) {
            it('AC7 writes through Game accessors and an in-place push record window-start values under game.state.uuid, and untouched fields have no entry', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: { groundArena: ['wampa'], resources: 3 },
                    player2: { spaceArena: ['cartel-spacer'] }
                });
                const { context } = contextRef;
                const game = context.game;
                const tracker = game.deltaTracker as DeltaTracker;

                // Windows open in DirtyOnly since P4-C; this case reads window-start values, so it selects CaptureOldValues before the window opens.
                tracker.setMode(DeltaTrackerMode.CaptureOldValues);

                // A fresh snapshot opens the window these writes land in.
                forceFreshCurrentSnapshot(game);
                expect(tracker.isTracking).toBe(true);
                expect(tracker.pendingWindow.mode).toBe(DeltaTrackerMode.CaptureOldValues);

                const roundAtWindowStart = game.roundNumber;
                const initiativeAtWindowStart = game.initiativePlayer;
                const movedCardsAtWindowStart = [...game.state.movedCards];
                expect(initiativeAtWindowStart).not.toBeNull();
                expect(tracker.pendingWindow.changedFields.get(game.state.uuid)).toBeUndefined();

                game.roundNumber = roundAtWindowStart + 1;
                game.roundNumber = roundAtWindowStart + 2;
                game.initiativePlayer = initiativeAtWindowStart === context.player1Object ? context.player2Object : context.player1Object;
                game.state.movedCards.push(context.wampa.getObjectId());

                const recorded = tracker.pendingWindow.changedFields.get(game.state.uuid);
                expect(recorded).toBeDefined();
                // The window-start values, not the latest ones: a scalar written twice keeps its first old value.
                expect(recorded.roundNumber).toBe(roundAtWindowStart);
                expect(recorded.initiativePlayer).toBe(initiativeAtWindowStart.uuid);
                expect(recorded.movedCards).toEqual(movedCardsAtWindowStart);
                // Touched fields only.
                expect(Object.keys(recorded).sort()).toEqual(['initiativePlayer', 'movedCards', 'roundNumber']);
                expect('allCards' in recorded).toBe(false);
                expect('winnerNames' in recorded).toBe(false);
            });
        }, true);
    });
});
