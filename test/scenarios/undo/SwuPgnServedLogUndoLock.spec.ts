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

        // Value: protects=an undo REQUESTED after the log was served is refused before the opponent is asked; fails_when=rollbackToSnapshot drops its early served-log check and queues a confirm prompt; why_new=the request-mode spec above requests before serving; seam=Game.markSwuPgnServed; no_claim=the client's confirm UI
        it('refuses an undo requested after the log was served, without asking the opponent', async function () {
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

            expect(game.isEnded).toBeTrue();
            context.player1.clickPrompt('Continue Playing');
            context.player2.clickPrompt('Continue Playing');

            const served = game.getCachedSwuPgn();
            game.markSwuPgnServed();
            contextRef.snapshot.quickRollback(context.player1.id);

            expect(context.player2).not.toHaveConfirmUndoPrompt();
            expect(game.isEnded).toBeTrue();
            expect(game.getCachedSwuPgn()).toBe(served);
        });

        // Value: protects=the cost-payment recovery Undo is refused once the ended game's log was served; fails_when=rollbackToSnapshotInternal drops its served-log check, which is the only one this path meets; why_new=Game.ts says this path is covered but no spec drove it; seam=Game.markSwuPgnServed; no_claim=the approval-required variant (it goes through rollbackToSnapshot, covered above)
        it('refuses the cost-payment recovery undo once the log was served', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    leader: 'hera-syndulla#spectre-two',
                    hand: ['the-marauder#a-new-home'],
                    groundArena: ['battlefield-marine', { card: 'queen-amidala#championing-her-people', upgrades: ['foundling'] }],
                    spaceArena: [{ card: 'the-starhawk#prototype-battleship', upgrades: ['foundling'] }],
                    resources: 3,
                },
                player2: {
                    base: { card: 'administrators-tower', damage: 28 },
                },
            });
            const { context } = contextRef;
            const game: any = context.game;

            // End the game, then keep playing into a cost the player can no longer pay.
            context.player1.clickCard(context.battlefieldMarine);
            context.player1.clickCard(context.p2Base);
            expect(game.isEnded).toBeTrue();
            context.player1.clickPrompt('Continue Playing');
            context.player2.clickPrompt('Continue Playing');
            context.player2.passAction();

            context.player1.clickCard(context.theMarauder);
            context.player1.clickCard(context.queenAmidala);
            context.player1.clickPrompt('Done');
            context.player1.clickPrompt('Trigger');
            context.player1.clickCard(context.theStarhawk);
            expect(context.player1).toHaveExactPromptButtons(['Undo']);

            const served = game.getCachedSwuPgn();
            game.markSwuPgnServed();
            context.player1.clickPrompt('Undo');
            context.ignoreUnresolvedActionPhasePrompts = true;

            expect(game.isEnded).toBeTrue();
            expect(context.theStarhawk).toBeInZone('discard');
            expect(game.getCachedSwuPgn()).toBe(served);
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
