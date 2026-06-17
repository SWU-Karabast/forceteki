describe('SWU-PGN/1.1 recorder undo handling', function() {
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
        // action's events are dropped, but everything recorded before it is kept. The
        // regenerated .swupgn file therefore reflects the restored game state, not the
        // undone tail. (Earlier the v1.0 path either wiped the ENTIRE replay on any undo,
        // or kept undone actions in the stream — both wrong.)
        undoIt('drops the undone action from the 1.1 event stream but keeps prior history', function () {
            const { context } = contextRef;
            const game: any = context.game;
            const recorder: any = game._swuPgnAdapter.getRecorder();

            const eventsBeforeAction = recorder.getEvents().length;

            // Take a recordable action: attack the opponent's base.
            context.player1.clickCard(context.wampa);
            context.player1.clickCard(context.p2Base);

            const eventsAfterAction = recorder.getEvents().length;
            expect(eventsAfterAction).toBeGreaterThan(eventsBeforeAction);

            // The freshly generated file reflects the post-action stream.
            const fileAfterAction: string = game.getCachedSwuPgn();
            expect(typeof fileAfterAction).toBe('string');

            // Undo player 1's action.
            contextRef.snapshot.quickRollback(context.player1.id);

            const eventsAfterUndo = recorder.getEvents().length;
            // The undone action's events are gone …
            expect(eventsAfterUndo).toBeLessThan(eventsAfterAction);
            // … and the recorder was not wiped: history up to the rollback point remains.
            expect(eventsAfterUndo).toBeGreaterThanOrEqual(eventsBeforeAction);

            // The cache was invalidated on rollback, so regenerating yields a file that
            // matches the restored (shorter) stream rather than the stale post-action one.
            const fileAfterUndo: string = game.getCachedSwuPgn();
            expect(typeof fileAfterUndo).toBe('string');
            expect(fileAfterUndo).not.toBe(fileAfterAction);
        });
    });
});
