describe('Outlaw Corona', function() {
    integration(function(contextRef) {
        describe('Outlaw Corona\'s ability', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        spaceArena: ['outlaw-corona'],
                    },
                    player2: {
                        spaceArena: ['fetts-firespray#pursuing-the-bounty']
                    }
                });
            });

            it('should add the top deck card as a resource', function () {
                const { context } = contextRef;

                const startingResources = context.player2.countSpendableResources();

                context.player1.clickCard(context.outlawCorona);
                context.player1.clickCard(context.fettsFirespray);

                expect(context.player2).toHavePassAbilityPrompt('Bounty: Put the top card of your deck into play as a resource.');
                context.player2.clickPrompt('Bounty: Put the top card of your deck into play as a resource.');

                expect(context.player2.resources.length).toBe(startingResources + 1);
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
