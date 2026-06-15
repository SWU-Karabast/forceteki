describe('PGN replay recorder undo retention', function() {
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

        // Regression: postRollbackOperations used to call recorder.reset(), which
        // discarded the ENTIRE recorded replay (not just the rolled-back action). Any
        // undo therefore wiped the replay history up to that point, so a downloaded
        // .swureplay for a game with undos was missing most of the game. The recorder
        // is now append-only across rollbacks.
        undoIt('keeps the recorded replay history when an action is undone', function () {
            const { context } = contextRef;
            const game: any = context.game;
            const recorder: any = game._replayRecorder;

            // Take a recordable action: attack the opponent's base.
            context.player1.clickCard(context.wampa);
            context.player1.clickCard(context.p2Base);

            const recordsBeforeUndo = recorder.getReplayRecords().length;
            expect(recordsBeforeUndo).toBeGreaterThan(0);

            // Undo player 1's action.
            contextRef.snapshot.quickRollback(context.player1.id);

            // The recorder must NOT have been wiped by the rollback.
            expect(recorder.getReplayRecords().length).toBeGreaterThanOrEqual(recordsBeforeUndo);
        });
    });
});
