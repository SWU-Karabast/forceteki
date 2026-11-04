import type { SwuRecord } from '@swupgn/format';
import { apply } from '@swupgn/format';
import type { SwuPgnWriter } from '../../../server/game/core/swupgn/SwuPgnWriter';

describe('SWU-PGN writer undo', function() {
    undoIntegration(function(contextRef) {
        function writerOf(): SwuPgnWriter {
            const writer = contextRef.context.game.swuPgnWriter;
            expect(writer).withContext('the game has a writer')
                .not.toBeNull();
            return writer;
        }

        function steps(records: readonly SwuRecord[]): number[] {
            return records.filter((record) => record.t === 'step').map((record) => (record.t === 'step' ? record.seq : -1));
        }

        beforeEach(async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['battlefield-marine', 'pyke-sentinel'],
                    groundArena: ['atst']
                },
                player2: {
                    hand: ['wampa'],
                    groundArena: ['frontier-atrt']
                }
            });
        });

        afterEach(function () {
            expect(contextRef.context.game.swuPgnWriter?.errors).withContext('writer errors')
                .toBe(0);
        });

        it('takes back the records of an undone action, and replaying it writes the same records again', function () {
            const { context } = contextRef;
            const writer = writerOf();
            const before = [...writer.records];

            context.player1.clickCard(context.battlefieldMarine);
            const firstRun = [...writer.records];
            expect(steps(firstRun)).toEqual([0, 1]);

            expect(contextRef.snapshot.rollbackToSnapshot({ type: 'action', playerId: context.player1.id })).toBeTrue();
            expect(context.battlefieldMarine).toBeInZone('hand');
            expect(writer.records).toEqual(before);
            expect(writer.undos).toBe(1);

            context.player1.clickCard(context.battlefieldMarine);
            expect(writer.records).toEqual(firstRun);
            expect(apply([...writer.records])).toEqual(writer.currentBoard());
        });

        it('rewrites the pending step of the action it rolls back to', function () {
            const { context } = contextRef;
            const writer = writerOf();

            context.player1.clickCard(context.battlefieldMarine);
            const afterFirstAction = [...writer.records];
            context.player2.clickCard(context.wampa);
            expect(steps(writer.records)).toEqual([0, 1, 2]);

            // the start of player 2's action, after player 1's action and before its step was written
            expect(contextRef.snapshot.rollbackToSnapshot({ type: 'action', playerId: context.player2.id })).toBeTrue();
            expect(context.wampa).toBeInZone('hand');
            expect(writer.records).toEqual(afterFirstAction);
            expect(writer.undos).toBe(1);
        });

        it('numbers the steps without a gap after an undo of two actions (W-38, W-42)', function () {
            const { context } = contextRef;
            const writer = writerOf();

            context.player1.clickCard(context.battlefieldMarine);
            context.player2.clickCard(context.wampa);
            expect(steps(writer.records)).toEqual([0, 1, 2]);

            expect(contextRef.snapshot.rollbackToSnapshot({ type: 'action', playerId: context.player1.id, actionOffset: -1 })).toBeTrue();
            expect(context.battlefieldMarine).toBeInZone('hand');
            expect(context.wampa).toBeInZone('hand');
            expect(steps(writer.records)).toEqual([0]);

            context.player1.clickCard(context.pykeSentinel);
            context.player2.passAction();
            expect(steps(writer.records)).toEqual([0, 1, 2]);
            expect(writer.undos).toBe(1);
            expect(apply([...writer.records])).toEqual(writer.currentBoard());
        });
    });
});
