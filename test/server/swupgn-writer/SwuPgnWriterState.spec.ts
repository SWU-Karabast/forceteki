import { SwuPgnWriterState } from '../../../server/game/core/swupgn/SwuPgnWriterState';

describe('SwuPgnWriterState', function() {
    integration(function(contextRef) {
        beforeEach(async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: { groundArena: ['battlefield-marine'] },
            });
        });

        it('assigns ids on first sight and never reuses a retired id', function () {
            const state = new SwuPgnWriterState(contextRef.context.game);

            expect(state.entityIdFor('a')).toBe(1);
            expect(state.entityIdFor('a')).toBe(1);
            expect(state.entityIdFor('b')).toBe(2);
            expect(state.hasEntity('a')).toBeTrue();

            state.retire('a');
            expect(state.hasEntity('a')).toBeFalse();
            expect(state.entityIdFor('a')).toBe(3);
        });

        it('keys a card by uuid and generation', function () {
            const state = new SwuPgnWriterState(contextRef.context.game);
            const card = contextRef.context.battlefieldMarine;

            const before = state.cardKey(card);
            expect(before).toBe(`${card.uuid}#0`);
            state.bumpGeneration(card);
            expect(state.cardKey(card)).not.toBe(before);
            expect(state.cardKey(card)).toBe(`${card.uuid}#1`);
        });

        it('widens an audience as a union and never narrows', function () {
            const state = new SwuPgnWriterState(contextRef.context.game);

            expect(state.audienceOf('a')).toEqual([]);
            state.widen('a', [2]);
            state.widen('a', [1]);
            expect(state.audienceOf('a')).toEqual([1, 2]);
            state.widen('a', [1]);
            expect(state.audienceOf('a')).toEqual([1, 2]);

            state.widen('b', [2]);
            state.widen('b', 'all');
            expect(state.audienceOf('b')).toEqual([1, 2]);
        });
    });

    undoIntegration(function(contextRef) {
        it('survives rollback', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: { groundArena: ['battlefield-marine'] },
            });
            const { context } = contextRef;

            // built before the snapshot: an object created after it is removed by the rollback
            const state = new SwuPgnWriterState(context.game);
            expect(state.entityIdFor('a')).toBe(1);
            state.widen('a', [1]);

            // a manual bookmark names the snapshot the engine takes at the start of an action, so move to the next action first
            context.player1.passAction();
            contextRef.snapshot.takeManualSnapshot(context.player2Object);
            const snapshotId = contextRef.snapshot.getCurrentSnapshotId();

            expect(state.entityIdFor('b')).toBe(2);
            state.widen('a', [2]);
            state.recordsLength = 5;
            state.stepSeq = 4;

            expect(contextRef.snapshot.rollbackToSnapshot({
                type: 'manual',
                playerId: context.player2.id,
                snapshotId
            })).toBeTrue();

            expect(state.entityIdFor('a')).toBe(1);
            expect(state.hasEntity('b')).toBeFalse();
            expect(state.audienceOf('a')).toEqual([1]);
            expect(state.recordsLength).toBe(0);
            expect(state.stepSeq).toBe(1);
            expect(state.entityIdFor('b')).toBe(2);
        });
    });
});
