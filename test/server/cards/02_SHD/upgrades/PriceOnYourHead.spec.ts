describe('Price on your Head', function() {
    integration(function(contextRef) {
        describe('Price on your Head\'s Bounty ability', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        spaceArena: ['green-squadron-awing']
                    },
                    player2: {
                        spaceArena: [{ card: 'restored-arc170', upgrades: ['price-on-your-head'] }],
                    }
                });
            });

            it('should add the top deck card as a resource', function () {
                const { context } = contextRef;
                const prompt = 'Bounty: Put the top card of your deck into play as a resource';

                const startingResources = context.player2.countSpendableResources();

                context.player1.clickCard(context.greenSquadronAwing);
                context.player1.clickCard(context.restoredArc170);

                expect(context.player1).toHavePassAbilityPrompt(prompt);
                context.player1.clickPrompt(prompt);

                expect(context.player1.resources.length).toBe(startingResources + 1);
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
