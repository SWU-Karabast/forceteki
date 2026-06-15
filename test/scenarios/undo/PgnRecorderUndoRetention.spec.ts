describe('PGN replay recorder undo handling', function() {
    undoIntegration(function(contextRef) {
        beforeEach(function () {
            return contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['wampa'],
                },
                player2: {
                    groundArena: ['battlefield-marine'],
                },
            });
        });

        // The recorder is rolled back in lockstep with the game on undo: the undone
        // action's records are dropped, but everything recorded before it is kept.
        // (Earlier this either wiped the ENTIRE replay on any undo, or kept undone
        // actions in the stream — both wrong. Now it truncates to the rollback point.)
        undoIt('drops the undone action from the replay but keeps prior history', function () {
            const { context } = contextRef;
            const game: any = context.game;
            const recorder: any = game._replayRecorder;

            const recordsBeforeAction = recorder.getReplayRecords().length;

            // Take a recordable action: attack the opponent's base.
            context.player1.clickCard(context.wampa);
            context.player1.clickCard(context.p2Base);

            const recordsAfterAction = recorder.getReplayRecords().length;
            expect(recordsAfterAction).toBeGreaterThan(recordsBeforeAction);

            // Undo player 1's action.
            contextRef.snapshot.quickRollback(context.player1.id);

            const recordsAfterUndo = recorder.getReplayRecords().length;
            // The undone action's records are gone …
            expect(recordsAfterUndo).toBeLessThan(recordsAfterAction);
            // … and the recorder was not wiped: history up to the rollback point remains.
            expect(recordsAfterUndo).toBeGreaterThanOrEqual(recordsBeforeAction);
        });
    });
});
