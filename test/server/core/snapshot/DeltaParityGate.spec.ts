import fs from 'node:fs';
import path from 'node:path';

import { SnapshotType } from '../../../../server/game/core/Constants';
import type { DeltaTracker } from '../../../../server/game/core/snapshot/DeltaTracker';
import type { IGameSnapshot } from '../../../../server/game/core/snapshot/SnapshotInterfaces';
import {
    callerOutsideCoreSpecs,
    compareLiveWithSnapshot,
    exemptGameFromDeltaParity,
    expectParityCheckSince,
    getDeltaParityGateStats,
    isDeltaParityGateActive,
    markParityChecks,
    withDeltaParitySuspended,
    withExpectedDeltaParityMismatch,
    withExpectedRollbackFailure
} from '../../../helpers/DeltaParityGate';

/**
 * P4-F whole-suite gate (`test/helpers/DeltaParityGate.ts`): the compare reports a corrupted delta restore with the uuid and field,
 * and the undo harness has no skip other than the null-snapshotId case. Runs in both suite modes; the wrapped-path assertions apply
 * when the gate is active (ENABLE_UNDO_ALL_TESTS), the direct compare always. The card harness is integration(), with undo enabled
 * through a cast as in RestoreParityHarness.spec.ts.
 */

interface IDamageUnit {
    damage: number;
    setDamageForStateInjection(value: number): void;
}

const integrationWithUndo = integration as unknown as (definitions: (contextRef: SwuTestContextRef) => void, enableUndo: boolean) => void;

describe('Delta parity gate', function() {
    integrationWithUndo(function(contextRef) {
        it('gate-detects-corruption: a live field corrupted after a delta manual rollback is reported with its uuid and field', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: { groundArena: ['wampa', 'atst'] },
                player2: { spaceArena: ['cartel-spacer'] }
            });
            const { context } = contextRef;
            const game = context.game;
            const manager = game.snapshotManager;
            const wampa = context.wampa as unknown as IDamageUnit;
            const stateManager = game.gameObjectManager as unknown as Record<string, (...args: unknown[]) => unknown>;
            const tracker = game.deltaTracker as DeltaTracker;

            manager.setDeltaParityMode(true);
            const snapshotId = contextRef.snapshot.takeManualSnapshot(context.player1Object);
            const stored = (manager as unknown as { manualSnapshots: Map<string, { snapshots: Map<number, IGameSnapshot> }> })
                .manualSnapshots.get(context.player1.id).snapshots.get(snapshotId);
            const damageAtSnapshot = wampa.damage;
            context.player1.clickCard(context.atst);
            context.player1.clickCard(context.p2Base);

            // Corrupt one field right after the delta restore writes, before the gate's compare (the tracker is stopped there).
            let deltaRestores = 0;
            const original = stateManager.rollbackToDeltaChain.bind(stateManager);
            stateManager.rollbackToDeltaChain = (...args: unknown[]) => {
                deltaRestores++;
                const restored = original(...args);
                wampa.setDamageForStateInjection(damageAtSnapshot + 5);
                return restored;
            };
            let result;
            let mismatches;
            try {
                mismatches = withExpectedDeltaParityMismatch(() => {
                    result = manager.rollbackTo({ type: SnapshotType.Manual, playerId: context.player1.id, snapshotId });
                });
            } finally {
                Reflect.deleteProperty(stateManager, 'rollbackToDeltaChain');
            }

            expect(result.success).toBeTrue();
            expect(deltaRestores).toBe(1);
            if (isDeltaParityGateActive()) {
                expect(mismatches.length).toBe(1);
                expect(mismatches[0].message).toContain(`uuid ${context.wampa.uuid}`);
                expect(mismatches[0].message).toContain('_damage');
            } else {
                expect(mismatches.length).toBe(0);
            }
            const direct = compareLiveWithSnapshot(game, stored);
            expect(direct).toContain(`uuid ${context.wampa.uuid}`);
            expect(direct).toContain(`_damage: stored ${damageAtSnapshot}, live ${damageAtSnapshot + 5}`);

            // Undo the corruption untracked, as it was made, so the live state again equals the bookmark and its window.
            tracker.stopTracking();
            wampa.setDamageForStateInjection(damageAtSnapshot);
            tracker.resumeTracking();
            expect(compareLiveWithSnapshot(game, stored)).toBeNull();
            game.postRollbackOperations(result.entryPoint);
        });

        it('gate-uncompared-attempt: a manual rollback to a delta anchor that fails is reported unless the spec declared the failure', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: { groundArena: ['wampa', 'atst'] },
                player2: { spaceArena: ['cartel-spacer'] }
            });
            const { context } = contextRef;
            const manager = context.game.snapshotManager;
            const wampa = context.wampa as unknown as Record<string, (...args: unknown[]) => unknown>;

            manager.setDeltaParityMode(true);
            const snapshotId = contextRef.snapshot.takeManualSnapshot(context.player1Object);
            context.player1.clickCard(context.atst);
            context.player1.clickCard(context.p2Base);
            const damageAfterAttack = context.p2Base.damage;

            // The first afterSetState of each attempt throws, so the restore recovers and the manual container throws.
            const failOnce = () => {
                let calls = 0;
                const original = wampa.afterSetState.bind(wampa);
                wampa.afterSetState = (...args: unknown[]) => {
                    calls++;
                    if (calls === 1) {
                        throw new Error('P4F_INJECTED_GATE_ATTEMPT_FAILURE');
                    }
                    return original(...args);
                };
            };
            const rollback = () => manager.rollbackTo({ type: SnapshotType.Manual, playerId: context.player1.id, snapshotId });

            // Undeclared: reported as an uncompared attempt (collected here instead of failing the spec).
            const before = getDeltaParityGateStats();
            let reported;
            try {
                failOnce();
                reported = withExpectedDeltaParityMismatch(() => {
                    expect(rollback).toThrowError(/does not exist/);
                });
            } finally {
                Reflect.deleteProperty(wampa, 'afterSetState');
            }
            const afterReported = getDeltaParityGateStats();

            // Declared: counted as an expected failure, nothing reported.
            let declared;
            try {
                failOnce();
                declared = withExpectedDeltaParityMismatch(() => {
                    expect(() => withExpectedRollbackFailure(rollback)).toThrowError(/does not exist/);
                });
            } finally {
                Reflect.deleteProperty(wampa, 'afterSetState');
            }
            const afterDeclared = getDeltaParityGateStats();

            expect(context.p2Base.damage).toBe(damageAfterAttack);
            expect(declared.length).toBe(0);
            if (isDeltaParityGateActive()) {
                expect(reported.length).toBe(1);
                expect(reported[0].message).toContain(`delta-anchored snapshot ${snapshotId}`);
                expect(reported[0].message).toContain('not compared');
                expect(afterReported.parityRollbacks - before.parityRollbacks).toBe(1);
                expect(afterReported.parityChecks - before.parityChecks).toBe(0);
                expect(afterReported.expectedMismatches - before.expectedMismatches).toBe(1);
                expect(afterDeclared.parityRollbacks - afterReported.parityRollbacks).toBe(1);
                expect(afterDeclared.parityChecks - afterReported.parityChecks).toBe(0);
                expect(afterDeclared.expectedRollbackFailures - afterReported.expectedRollbackFailures).toBe(1);
                expect(afterDeclared.expectedMismatches - afterReported.expectedMismatches).toBe(0);
                expect(afterDeclared.mismatches - before.mismatches).toBe(0);
            } else {
                expect(reported.length).toBe(0);
                expect(afterDeclared).toEqual(before);
            }
        });

        it('gate-skip-only-null: the undo harness skips its compare only for a null start-of-test snapshot id', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: { groundArena: ['wampa'] },
                player2: { spaceArena: ['cartel-spacer'] }
            });
            const { context } = contextRef;

            // With the gate active, a rollback that was not compared fails the spec.
            if (isDeltaParityGateActive()) {
                expect(() => expectParityCheckSince(markParityChecks(), context.game)).toThrowError(/not restored through the delta chain/);
            } else {
                expect(() => expectParityCheckSince(markParityChecks(), context.game)).not.toThrow();
            }

            // Structural pin on the harness: every early return in undoIt is the no-game case or the null-snapshotId case, and the
            // shared rollback assertion requires the compare.
            const source = fs.readFileSync(path.join(process.cwd(), 'test', 'helpers', 'IntegrationHelper.js'), 'utf8');
            const undoItBody = source.slice(source.indexOf('global.undoIt = function'), source.indexOf('global.undoFit = function'));
            const returns = [...undoItBody.matchAll(/return;/g)].map((match) => undoItBody.slice(Math.max(0, match.index - 300), match.index));
            expect(returns.length).toBeGreaterThan(0);
            expect(returns.every((before) => before.includes('!this.contextRef') || before.includes('startOfTestSnapshot?.snapshotId == null'))).toBeTrue();
            expect(returns.filter((before) => before.includes('startOfTestSnapshot?.snapshotId == null')).length).toBe(1);
            const assertBody = source.slice(source.indexOf('function assertManualRollbackSucceeded'), source.indexOf('const jit = it;'));
            expect(assertBody).toContain('deltaParityGate.expectParityCheckSince(parityMark, context.game)');
        });
    }, true);

    it('gate-opt-out-bound: the gate opt-outs accept only callers in engine specs under test/server/core/', function() {
        const stack = (file: string) => [
            'Error',
            '    at assertCalledFromCoreSpec (C:\\repo\\build\\test\\helpers\\DeltaParityGate.js:1:1)',
            '    at withDeltaParitySuspended (C:\\repo\\build\\test\\helpers\\DeltaParityGate.js:2:2)',
            `    at Object.<anonymous> (${file}:10:5)`
        ].join('\n');

        expect(callerOutsideCoreSpecs(stack('C:\\repo\\build\\test\\server\\core\\snapshot\\DeltaTracker.spec.js'))).toBeNull();
        expect(callerOutsideCoreSpecs(stack('/repo/test/server/core/RestoreParityHarness.spec.ts'))).toBeNull();
        expect(callerOutsideCoreSpecs(stack('C:\\repo\\build\\test\\server\\cards\\01_SOR\\units\\Wampa.spec.js'))).toContain('Wampa.spec.js');
        expect(callerOutsideCoreSpecs(stack('C:\\repo\\build\\test\\scenarios\\undo\\Undo.spec.js'))).toContain('Undo.spec.js');
        expect(callerOutsideCoreSpecs(stack('C:\\repo\\build\\test\\helpers\\IntegrationHelper.js'))).toContain('IntegrationHelper.js');
        // A real call from this spec passes the guard.
        expect(withExpectedRollbackFailure(() => 7)).toBe(7);
        expect(withExpectedDeltaParityMismatch(() => undefined)).toEqual([]);

        // Each of the four opt-outs throws when its caller frame is a card spec (the stack the guard reads is replaced for the call).
        const noGame = null as unknown as Parameters<typeof exemptGameFromDeltaParity>[0];
        const optOuts: [string, () => unknown][] = [
            ['exemptGameFromDeltaParity', () => exemptGameFromDeltaParity(noGame, 'bound check')],
            ['withDeltaParitySuspended', () => withDeltaParitySuspended(noGame, 'bound check', () => 7)],
            ['withExpectedRollbackFailure', () => withExpectedRollbackFailure(() => 7)],
            ['withExpectedDeltaParityMismatch', () => withExpectedDeltaParityMismatch(() => undefined)]
        ];
        const originalPrepare = Error.prepareStackTrace;
        try {
            Error.prepareStackTrace = () => stack('C:\\repo\\build\\test\\server\\cards\\01_SOR\\units\\Wampa.spec.js');
            for (const [name, call] of optOuts) {
                expect(call)
                    .withContext(name)
                    .toThrowError(new RegExp(`${name} may only be called from an engine spec under test/server/core/; called from .*Wampa\\.spec\\.js`));
            }
        } finally {
            Error.prepareStackTrace = originalPrepare;
        }
    });
});
