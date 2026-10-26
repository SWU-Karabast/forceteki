/**
 * Once an ended game's `.swupgn` has been served, the file is in a player's hands and it names
 * hidden information, so the game is closed to undo. These cover every way a rollback starts.
 */
describe('SWU-PGN served log closes the game to undo', function() {
    undoIntegration(function(contextRef) {
        // Value: protects=a direct undo of an ended game whose log was served is refused and the served file stays the one handed out; fails_when=the served-log check is dropped from the rollback path; why_new=no spec exercised markSwuPgnServed; seam=Game.markSwuPgnServed (the call Lobby.getGameLog makes); no_claim=the socket path (LobbyGameLog.spec)
        it('refuses an undo once the ended game\'s log was served', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: { groundArena: ['wampa'] },
                player2: { groundArena: ['battlefield-marine'] },
            });
            const { context } = contextRef;
            const game: any = context.game;

            context.player1.clickCard(context.wampa);
            context.player1.clickCard(context.p2Base);
            game.concede(context.player2.id);
            context.ignoreUnresolvedActionPhasePrompts = true;

            const served = game.getCachedSwuPgn();
            game.markSwuPgnServed();
            contextRef.snapshot.quickRollback(context.player1.id);

            expect(game.isEnded).toBeTrue();
            expect(context.p2Base.damage).toBe(4);
            expect(game.getCachedSwuPgn()).toBe(served);
        });

        // Value: protects=an undo the opponent confirms AFTER the log was served is refused when it would run; fails_when=the check only runs when the undo is requested; why_new=the confirmed-later path had no check at all; seam=Game.markSwuPgnServed; no_claim=the client's confirm UI
        it('refuses an undo confirmed after the log was served', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['jar-jar-binks#foolish-gungan'],
                },
                player2: {
                    groundArena: ['wampa', 'atst'],
                    base: { card: 'administrators-tower', damage: 28 },
                    hasInitiative: true,
                },
                enableConfirmationToUndo: true,
            });
            const { context } = contextRef;
            const game: any = context.game;
            game.setRandomSeed('khgfk');

            context.player2.passAction();
            context.player1.clickCard(context.jarJarBinks);
            context.player1.clickCard(context.p2Base);

            // The attack destroys the base; both players keep playing past game end.
            expect(game.isEnded).toBeTrue();
            context.player1.clickPrompt('Continue Playing');
            context.player2.clickPrompt('Continue Playing');

            // Requested before the log is served, so the request itself is let through...
            contextRef.snapshot.quickRollback(context.player1.id);
            expect(context.player2).toHaveConfirmUndoPrompt();

            // ...and confirmed after it was.
            game.markSwuPgnServed();
            context.player2.clickPrompt('Allow');

            expect(game.isEnded).toBeTrue();
        });

        // Value: protects=a mark before the game ends does nothing, so undo and serving carry on; fails_when=markSwuPgnServed sets the flag mid-game; why_new=untested; seam=Game.markSwuPgnServed; no_claim=none
        it('ignores a mark made while the game is still in progress', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: { groundArena: ['wampa'] },
                player2: { groundArena: ['battlefield-marine'] },
            });
            const { context } = contextRef;
            const game: any = context.game;

            game.markSwuPgnServed();
            context.player1.clickCard(context.wampa);
            context.player1.clickCard(context.p2Base);
            contextRef.snapshot.quickRollback(context.player1.id);

            expect(context.p2Base.damage).toBe(0);
            expect(context.player1).toBeActivePlayer();
            expect(() => game.getCachedSwuPgn()).not.toThrow();
        });
    });
});
