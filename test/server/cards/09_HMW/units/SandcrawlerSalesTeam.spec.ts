describe('Sandcrawler Sales Team', function() {
    integration(function(contextRef) {
        it('Sandcrawler Sales Team\'s ability should return an upgrade that costs 3 or less to its owner\'s hand if you control a Tatooine base', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['sandcrawler-sales-team'],
                    base: 'jabbas-palace',
                    groundArena: ['battle-droid'],
                },
                player2: {
                    groundArena: [{ card: 'wampa', upgrades: ['academy-training', 'experience', 'the-darksaber'] }]
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.sandcrawlerSalesTeam);

            expect(context.player1).toHavePrompt('Return an upgrade that costs 3 or less to its owner\'s hand');
            expect(context.player1).toHavePassAbilityButton();

            expect(context.player1).toBeAbleToSelectExactly([context.academyTraining, context.experience]);
            context.player1.clickCard(context.academyTraining);

            expect(context.player2).toBeActivePlayer();
            expect(context.wampa).toHaveExactUpgradeNames(['experience', 'the-darksaber']);
            expect(context.academyTraining).toBeInZone('hand', context.player2);
        });

        it('Sandcrawler Sales Team\'s ability should not return the upgrade if you do not control a Tatooine base', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['sandcrawler-sales-team'],
                    base: 'great-grass-plains',
                },
                player2: {
                    groundArena: [{ card: 'wampa', upgrades: ['academy-training'] }]
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.sandcrawlerSalesTeam);

            expect(context.player2).toBeActivePlayer();
            expect(context.wampa).toHaveExactUpgradeNames(['academy-training']);
        });
    });
});
