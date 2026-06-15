describe('PGN replay recorder round tracking (integration)', function() {
    integration(function (contextRef) {
        beforeEach(function () {
            return contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['atst'],
                    deck: ['cartel-spacer', 'cartel-spacer', 'cartel-spacer', 'cartel-spacer', 'cartel-spacer', 'cartel-spacer', 'cartel-spacer', 'cartel-spacer']
                },
                player2: {
                    deck: ['cartel-spacer', 'cartel-spacer', 'cartel-spacer', 'cartel-spacer', 'cartel-spacer', 'cartel-spacer', 'cartel-spacer', 'cartel-spacer']
                },
            });
        });

        // Regression: OnBeginRound never reaches the recorder's .on() listener (its
        // event window does not emit to EventEmitter listeners), so round tracking is
        // driven by game.roundNumber via syncRound() in OnPhaseStarted. Before the fix,
        // every record's seq was stuck at R0 and no ROUND_START records were produced,
        // which collapsed all per-round snapshots onto colliding seq keys in .swureplay.
        it('advances the recorded round number across multiple rounds', function () {
            const { context } = contextRef;
            const game: any = context.game;

            context.moveToNextActionPhase(); // -> round 2
            context.moveToNextActionPhase(); // -> round 3
            context.moveToNextActionPhase(); // -> round 4

            const recorder: any = game._replayRecorder;
            const records: any[] = recorder.getReplayRecords();

            const roundStartRounds = records
                .filter((r) => r.type === 'ROUND_START')
                .map((r) => r.round);
            const distinctRoundPrefixes = new Set(
                records
                    .map((r) => (String(r.seq).match(/^R(\d+)/) || [])[1])
                    .filter((p) => p !== undefined)
            );

            // The recorder's round must track the real game round, not stay at 0.
            expect(recorder.currentRound).toBe(game.roundNumber);
            expect(game.roundNumber).toBeGreaterThanOrEqual(4);

            // A ROUND_START is emitted for each round reached (>= rounds 2..4 captured here).
            expect(roundStartRounds).toContain(2);
            expect(roundStartRounds).toContain(3);
            expect(roundStartRounds).toContain(4);

            // Records are distributed across distinct round prefixes, not all on R0.
            expect(distinctRoundPrefixes.has('2')).toBe(true);
            expect(distinctRoundPrefixes.has('3')).toBe(true);
            expect(distinctRoundPrefixes.has('4')).toBe(true);
        });
    });
});
