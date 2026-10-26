import { parse } from '../../../swupgn/src/index';

/**
 * The end-of-game `.swupgn` across undo: an undo past game end reopens the game and the next end
 * writes the whole game again; an undo inside post-game play leaves the pinned file alone; and the
 * undo confirmation prompt itself never reaches the file.
 */
describe('SWU-PGN file across game end and undo', function() {
    undoIntegration(function(contextRef) {
        const gameEnds = (text: string) => parse(text).events.filter((e: any) => e.t === 'GAME_END');

        // Value: protects=an undo past game end then a second end gives one GAME_END and keeps everything before the undo; fails_when=the cache is not cleared on reopen, or the recorder drops pre-undo history or keeps the first GAME_END; why_new=no spec undid past game end; seam=none; no_claim=a served file (SwuPgnServedLogUndoLock)
        it('writes the whole game, with one GAME_END, after an undo past game end and a second end', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: { groundArena: ['wampa'] },
                player2: { base: { card: 'administrators-tower', damage: 26 } },
            });
            const { context } = contextRef;
            const game: any = context.game;
            const roundStartsBefore = parse(game.getCachedSwuPgn()).events.filter((e: any) => e.t === 'ROUND_START').length;

            context.player1.clickCard(context.wampa);
            context.player1.clickCard(context.p2Base);
            expect(game.isEnded).toBeTrue();
            const first: string = game.getCachedSwuPgn();
            expect(gameEnds(first).length).toBe(1);

            contextRef.snapshot.quickRollback(context.player1.id);
            expect(game.isEnded).toBeFalse();

            context.player1.clickCard(context.wampa);
            context.player1.clickCard(context.p2Base);
            expect(game.isEnded).toBeTrue();

            const second: string = game.getCachedSwuPgn();
            const events = parse(second).events as any[];
            expect(gameEnds(second).length).toBe(1);
            expect(events.some((e) => e.t === 'UNDO')).withContext('the undo is noted')
                .toBeTrue();
            expect(events.filter((e) => e.t === 'ROUND_START').length).withContext('history before the undo is kept')
                .toBe(roundStartsBefore);
            expect(second).not.toBe(first);
            context.ignoreUnresolvedActionPhasePrompts = true;
        });

        // Value: protects=an undo inside post-game play keeps the end-of-game file unchanged; fails_when=postRollbackOperations clears the cache on every rollback; why_new=untested; seam=none; no_claim=a served file
        it('keeps the end-of-game file unchanged through an undo in post-game play', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: { groundArena: ['wampa'] },
                player2: { groundArena: ['atst'], base: { card: 'administrators-tower', damage: 26 } },
            });
            const { context } = contextRef;
            const game: any = context.game;

            context.player1.clickCard(context.wampa);
            context.player1.clickCard(context.p2Base);
            const pinned: string = game.getCachedSwuPgn();
            context.player1.clickPrompt('Continue Playing');
            context.player2.clickPrompt('Continue Playing');

            context.player2.clickCard(context.atst);
            context.player2.clickCard(context.p1Base);
            contextRef.snapshot.quickRollback(context.player2.id);

            expect(game.isEnded).toBeTrue();
            expect(context.p1Base.damage).toBe(0);
            expect(game.getCachedSwuPgn()).toBe(pinned);
            context.ignoreUnresolvedActionPhasePrompts = true;
        });

        // Value: protects=the undo confirmation (Allow/Deny) is never recorded as a game decision; fails_when=UndoConfirmationPrompt loses pgnLog:false or HandlerMenuPrompt ignores it; why_new=replaces a recorder unit test that emitted nothing and could not fail; seam=none; no_claim=other system prompts
        it('never records the undo confirmation prompt', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: { groundArena: ['jar-jar-binks#foolish-gungan'] },
                player2: { groundArena: ['wampa', 'atst'], hasInitiative: true },
                enableConfirmationToUndo: true,
            });
            const { context } = contextRef;
            const game: any = context.game;
            game.setRandomSeed('khgfk');

            context.player2.passAction();
            context.player1.clickCard(context.jarJarBinks);
            context.player1.clickCard(context.p2Base);

            contextRef.snapshot.quickRollback(context.player1.id);
            expect(context.player2).toHaveConfirmUndoPrompt();
            context.player2.clickPrompt('Deny');

            const choices = parse(game.getCachedSwuPgn()).events.filter((e: any) => e.t === 'MODAL_CHOICE') as any[];
            expect(choices.filter((e) => e.offered.includes('Allow') || e.offered.includes('Deny'))).toEqual([]);
        });

        // Value: protects=an undo back into setup keeps the INIT deck-order record once setup runs again; fails_when=the adapter keeps its capture bookkeeping, so the reshuffle never writes INIT; why_new=no spec undid into setup and read the file; seam=none; no_claim=which shuffle the order comes from
        it('writes INIT again after an undo back into setup', async function () {
            await contextRef.setupTestAsync({ phase: 'setup' });
            const { context } = contextRef;
            const game: any = context.game;
            const inits = () => parse(game.getCachedSwuPgn()).setup.filter((r: any) => r.t === 'INIT').length;

            context.selectInitiativePlayer(context.player1);
            expect(inits()).toBe(1);

            const rolledBack = contextRef.snapshot.rollbackToSnapshot({ type: 'phase', phaseName: 'setup', playerId: context.player1.id });
            expect(rolledBack).toBeTrue();
            context.selectInitiativePlayer(context.player1);

            expect(inits()).toBe(1);
        });
    });
});
