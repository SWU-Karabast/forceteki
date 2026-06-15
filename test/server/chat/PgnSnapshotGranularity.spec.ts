describe('PGN replay snapshot granularity (integration)', function() {
    integration(function (contextRef) {
        beforeEach(function () {
            return contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['wampa', 'atst'],
                },
                player2: {
                    groundArena: ['battlefield-marine'],
                },
            });
        });

        // Regression: full-state snapshots used to be written once per phase
        // (emitPhaseSnapshot on OnPhaseEnded), so the replay viewer jumped a whole
        // phase per step. They are now written once per top-level action (in
        // emitGameState), giving action-by-action playback.
        it('writes a full-state snapshot per action, not per phase', function () {
            const { context } = contextRef;
            const game: any = context.game;
            const recorder: any = game._replayRecorder;

            // Two separate state-changing actions in a single action phase.
            context.player1.clickCard(context.wampa);
            context.player1.clickCard(context.p2Base); // action 1: attack base

            context.player2.passAction();

            context.player1.clickCard(context.atst);
            context.player1.clickCard(context.p2Base); // action 2: attack base

            const snapshotRecords = recorder.getReplayRecords()
                .filter((r: any) => typeof r.seq === 'string' && r.seq.endsWith('-snapshot'));

            // More than one snapshot inside a single action phase => per-action, not per-phase.
            expect(snapshotRecords.length).toBeGreaterThanOrEqual(2);
            // Each snapshot carries the full serialized state and an action-scoped seq.
            for (const rec of snapshotRecords) {
                expect(rec.snapshot).toBeDefined();
                expect(String(rec.seq)).toMatch(/-snapshot$/);
            }
        });
    });
});
