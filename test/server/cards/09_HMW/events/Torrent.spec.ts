describe('Torrent', function() {
    integration(function(contextRef) {
        it('Torrent\'s ability should give 1 Weakness token to a target if you do not control a Naboo base', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['torrent'],
                    base: 'chopper-base',
                    groundArena: ['battlefield-marine']
                },
                player2: {
                    groundArena: ['wampa'],
                    base: 'great-grass-plains',
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.torrent);

            expect(context.player1).toHavePrompt('Give a Weakness token to a unit');
            expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.wampa]);
            context.player1.clickCard(context.wampa);

            expect(context.player2).toBeActivePlayer();
            expect(context.wampa).toHaveExactUpgradeNames(['weakness']);
        });

        it('Torrent\'s ability should give 2 Weakness tokens to a target if you control a Naboo base', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['torrent'],
                    base: 'great-grass-plains',
                    groundArena: ['battlefield-marine']
                },
                player2: {
                    groundArena: ['wampa']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.torrent);

            expect(context.player1).toHavePrompt('Give 2 Weakness tokens to a unit');
            expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.wampa]);
            context.player1.clickCard(context.wampa);

            expect(context.player2).toBeActivePlayer();
            expect(context.wampa).toHaveExactUpgradeNames(['weakness', 'weakness']);
        });
    });
});
