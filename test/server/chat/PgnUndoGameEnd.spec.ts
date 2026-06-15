describe('PGN replay across undo-past-game-end (integration)', function() {
    // undoIntegration enables undo on the game: we drive game-end + a manual rollback
    // that crosses the game-end boundary. A plain `it` (not `undoIt`) runs once.
    undoIntegration(function (contextRef) {
        beforeEach(function () {
            return contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['wampa'],
                },
                player2: {
                    // Near-dead base so a single Wampa (4 power) attack is lethal.
                    base: { card: 'administrators-tower', damage: 27 },
                    groundArena: ['battlefield-marine'],
                },
            });
        });

        const countReplayRecords = (swuReplay: string): number => {
            const idx = swuReplay.indexOf('=== REPLAY ===');
            if (idx === -1) {
                return 0;
            }
            return swuReplay
                .slice(idx)
                .split('\n')
                .filter((l) => l.trim().startsWith('{'))
                .length;
        };

        // Regression guard for two coupled bugs:
        //  - endGame() used to clearRecordedData(), wiping the recorder. An undo past
        //    game-end then re-end produced an empty / tail-only replay (history lost).
        //  - the served-file gate keyed off finishedAt, which is never reset, so a
        //    re-opened game still looked "finished".
        it('keeps the full replay when a player undoes past game-end and the game re-ends', function () {
            const { context } = contextRef;
            const game: any = context.game;
            const recorder: any = game._replayRecorder;

            // The game ends during this test, leaving a "Continue Playing" win prompt.
            context.ignoreUnresolvedActionPhasePrompts = true;

            // Snapshot before the fatal action so the rollback crosses game-end.
            const snapshotId = contextRef.snapshot.takeManualSnapshot(context.player1Object);

            // Lethal attack: Wampa destroys Player 2's base -> game ends.
            context.player1.clickCard(context.wampa);
            context.player1.clickCard(context.p2Base);

            expect(game.isEnded).toBe(true);
            expect(game.finishedAt).toBeTruthy();

            // C1: the recorder is NOT wiped at game end (it used to clearRecordedData()).
            expect(recorder.getReplayRecords().length).toBeGreaterThan(0);
            const firstReplay: string = game.generateGameFiles().swuReplay;
            const firstRecordCount = countReplayRecords(firstReplay);
            expect(firstReplay).toContain('"type":"GAME_END"');
            expect(firstRecordCount).toBeGreaterThan(0);

            // Undo past game-end, back to before the fatal attack.
            contextRef.snapshot.rollbackToSnapshot({
                type: 'manual',
                playerId: context.player1Object.id,
                snapshotId
            });

            // C2: the game has re-opened. isEnded flips back to false (it is state-backed
            // via winnerNames), but finishedAt is a plain field that is never reset — which
            // is exactly why getGameLog must gate on isEnded, not finishedAt.
            expect(game.isEnded).toBe(false);
            expect(game.finishedAt).toBeTruthy();

            // Re-do the fatal attack: the game ends again.
            context.player1.clickCard(context.wampa);
            context.player1.clickCard(context.p2Base);
            expect(game.isEnded).toBe(true);

            // C1: the regenerated replay is complete — not the empty / tail-only file the
            // old clearRecordedData() path produced after an undo-past-game-end.
            const secondReplay: string = game.generateGameFiles().swuReplay;
            expect(secondReplay).toContain('"type":"GAME_END"');
            expect(countReplayRecords(secondReplay)).toBeGreaterThanOrEqual(firstRecordCount);
        });
    });
});
