import { fold, parse, validate } from '../../../swupgn/src/index';

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

        // Dropping the undone records is right for the FOLD and wrong for the RECORD: with no
        // mark left behind, a file whose players took six decisions back reads exactly like one
        // where nobody ever did. The note says where the retraction reached, the header says how
        // many there were, and neither touches anyone's board.
        // Plain `it`, not `undoIt`: the undoIt harness performs an undo of its own and replays
        // the body, which is exactly what this test counts.
        it('leaves an UNDO note at the truncation point and counts it in the header', function () {
            const { context } = contextRef;
            const game: any = context.game;
            const recorder: any = game._swuPgnAdapter.getRecorder();

            context.player1.clickCard(context.wampa);
            context.player1.clickCard(context.p2Base);
            expect(recorder.getEvents().some((e: any) => e.t === 'ATTACK')).toBe(true);
            const seqsBeforeUndo: string[] = recorder.getEvents().map((e: any) => e.seq);

            expect(recorder.getUndoCount()).toBe(0);
            contextRef.snapshot.quickRollback(context.player1.id);

            expect(recorder.getUndoCount()).toBe(1);
            const events = recorder.getEvents() as any[];
            const undos = events.filter((e: any) => e.t === 'UNDO');
            expect(undos.length).toBe(1);
            // It is the last record -- so the replay that follows is recorded after it, and its
            // own index is where the truncation happened.
            expect(events[events.length - 1]).toBe(undos[0]);
            const firstDropped = seqsBeforeUndo[events.length - 1];
            expect(firstDropped).toBeDefined();
            expect(undos[0].at).toBe(firstDropped);
            expect(undos[0].seq).toBe(`${firstDropped}-undo`);
            expect(undos[0].by).toBe(1);

            // Replaying re-issues the seq the undo gave back -- which is exactly why the note
            // cannot simply reuse it.
            context.player1.clickCard(context.wampa);
            context.player1.clickCard(context.p2Base);
            expect(recorder.getEvents().filter((e: any) => e.seq === firstDropped).length).toBe(1);

            // The file says so: header tag, one note, and the fold is untouched by it.
            const file: string = game.getCachedSwuPgn();
            expect(file).toContain('[Undos "1"]');
            const doc = parse(file);
            expect(doc.header.undos).toBe(1);
            const folded = fold(doc.events);
            const withoutUndo = fold(doc.events.filter((e: any) => e.t !== 'UNDO'));
            expect(folded).toEqual(withoutUndo);
            expect(validate(file).issues.filter((i) => i.severity === 'error')).toEqual([]);
        });

        // undo -> retry -> undo at the same point is ordinary usage, and it used to corrupt the
        // audit trail. push() re-checkpoints BEFORE appending the UNDO note, so the boundary for
        // that snapshot ends up pointing AT the note; the second undo then read the note's own
        // seq as its anchor and wrote `X-undo-undo` with `at: "X-undo"` -- citing a record the
        // same truncation had just deleted. The reference validator rejects that seq, and the
        // suffix grows without bound on repeat. Both adversarial reviews found this
        // independently, which is why it is pinned here.
        it('never chains an UNDO onto a previous UNDO when the same point is undone twice', function () {
            const { context } = contextRef;
            const game: any = context.game;
            const recorder: any = game._swuPgnAdapter.getRecorder();

            context.player1.clickCard(context.wampa);
            context.player1.clickCard(context.p2Base);
            contextRef.snapshot.quickRollback(context.player1.id);

            const first = recorder.getEvents().filter((e: any) => e.t === 'UNDO') as any[];
            expect(first.length).toBe(1);
            const anchor = first[0].at;

            // Retry the action, then take it back again — landing on the same boundary.
            context.player1.clickCard(context.wampa);
            context.player1.clickCard(context.p2Base);
            contextRef.snapshot.quickRollback(context.player1.id);

            const undos = recorder.getEvents().filter((e: any) => e.t === 'UNDO') as any[];
            expect(recorder.getUndoCount()).toBe(2);
            for (const u of undos) {
                expect(u.at).withContext(`${u.seq} must name a real position`).not.toContain('-undo');
                expect(u.seq).toBe(`${u.at}-undo`);
            }
            // It still names where play actually resumed, not a discarded note.
            expect(undos[undos.length - 1].at).toBe(anchor);

            // And every `at` resolves to a record that is still in the file, or to the position
            // the replay resumed from — never to a seq the truncation deleted.
            const file: string = game.getCachedSwuPgn();
            expect(validate(file).issues.filter((i) => i.severity === 'error')).toEqual([]);
        });
    });
});
