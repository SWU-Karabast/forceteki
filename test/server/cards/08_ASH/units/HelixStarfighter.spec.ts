describe('Helix Starfighter', function() {
    integration(function(contextRef) {
        it('Helix Starfighter\'s ability should give a shield when opponent has a space arena unit', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['helix-starfighter'],
                },
                player2: {
                    spaceArena: ['awing']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.helixStarfighter);

            expect(context.player2).toBeActivePlayer();
            expect(context.helixStarfighter).toHaveExactUpgradeNames(['shield']);
        });

        it('should give 2 advantage when opponent has no space arena unit', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['helix-starfighter'],
                    spaceArena: ['awing']
                },
                player2: {
                    groundArena: ['wampa']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.helixStarfighter);

            expect(context.player2).toBeActivePlayer();
            expect(context.helixStarfighter).toHaveExactUpgradeNames(['advantage', 'advantage']);
        });
    });
});
