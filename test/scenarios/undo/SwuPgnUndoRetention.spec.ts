describe('SWU-PGN/1.0 recorder undo handling', function() {
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

        // Rolling back to the START of a phase restores the recorder to before that phase's
        // first record. Checkpoints used to be captured only on push, AFTER syncRound had
        // already advanced currentRound: the restored counter then said the round had begun,
        // the re-run start of phase saw nothing to sync, and the round's ROUND_START (with its
        // keyframe) was gone for good. The redo also skipped seq numbers for the same reason.
        undoIt('re-records ROUND_START, with its keyframe, when a round is undone to the start of its action phase', function () {
            const { context } = contextRef;
            const game: any = context.game;
            const recorder: any = game._swuPgnAdapter.getRecorder();
            const roundStarts = () => recorder.getEvents().filter((e: any) => e.t === 'ROUND_START' && e.round === 2) as any[];

            context.moveToNextActionPhase();
            context.player1.clickCard(context.wampa);
            context.player1.clickCard(context.p2Base);
            expect(roundStarts().length).toBe(1);

            expect(contextRef.snapshot.rollbackToSnapshot({ type: 'phase', phaseName: 'action' }, context.player1.id)).toBe(true);

            const after = roundStarts();
            expect(after.length).toBe(1);
            expect(after[0].keyframe).toBeDefined();

            // The redo numbers from the start of the phase again, with no gap.
            context.player1.clickCard(context.wampa);
            context.player1.clickCard(context.p2Base);
            const attacks = recorder.getEvents().filter((e: any) => e.t === 'ATTACK') as any[];
            expect(attacks[attacks.length - 1].seq).toBe('R2.A.1');
        });
    });
});
