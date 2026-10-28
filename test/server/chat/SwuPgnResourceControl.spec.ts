import { fold, parse } from '../../../swupgn/src/index';

describe('SWU-PGN/1.0 recorder: a resource changing hands', function () {
    integration(function (contextRef) {
        // Value: protects=a resource returned to its owner by a card's delayed effect leaves the thief's row in the file too (spec §10.1); fails_when=the recorder drops the resource-to-resource move that carries the return, as a same-zone move with nothing to say; why_new=the steal arrives as OnTakeControl and is covered, the return does not; seam=none; no_claim=a stolen resource defeated before it returns
        it('folds DJ\'s stolen resource back into its owner\'s row when DJ leaves play', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    base: 'chopper-base',
                    leader: 'han-solo#audacious-smuggler',
                    hand: ['strafing-gunship'],
                    resources: ['dj#blatant-thief', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst'],
                },
                player2: {
                    groundArena: ['atat-suppressor'],
                    resources: 10,
                },
            });
            const { context } = contextRef;
            // The harness places resources after a real setup has dealt some, with no MOVE, so the
            // folded counts start offset (see swuPgnVectorGate); compare changes, not totals.
            const resources = () => {
                const players = fold(parse(context.game.getCachedSwuPgn()).events).players;
                return [1, 2].map((seat: 1 | 2) => players[seat].resourcesReady + players[seat].resourcesExhausted);
            };
            const [p1Before, p2Before] = resources();

            const p2Exhausted = () => fold(parse(context.game.getCachedSwuPgn()).events).players[2].resourcesExhausted;
            const p2ExhaustedBefore = p2Exhausted();

            context.player1.clickCard(context.djBlatantThief);
            expect(resources()).withContext('after the steal')
                .toEqual([p1Before + 1, p2Before - 1]);
            expect(p2Exhausted()).withContext('DJ takes a ready resource')
                .toBe(p2ExhaustedBefore);
            context.player2.passAction();
            context.player1.clickCard(context.strafingGunship);
            context.player2.clickCard(context.atatSuppressor);
            context.player2.clickCard(context.dj);

            expect(context.player2.resources.length).toBe(10);
            expect(resources()).withContext('after DJ leaves play')
                .toEqual([p1Before, p2Before]);
            expect(context.player2.exhaustedResourceCount).toBe(1);
            expect(p2Exhausted()).withContext('the spent resource comes back exhausted')
                .toBe(p2ExhaustedBefore + 1);
        });
    });
});
