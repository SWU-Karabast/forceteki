describe('Price on your Head', function() {
    integration(function(contextRef) {
        describe('Price on your Head\'s Bounty ability', function() {
            it('should add the top deck card as a resource', function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        spaceArena: ['green-squadron-awing']
                    },
                    player2: {
                        spaceArena: [{ card: 'restored-arc170', upgrades: ['price-on-your-head'] }],
                    }
                });

                const { context } = contextRef;
                const prompt = 'Collect Bounty: Put the top card of your deck into play as a resource';

                const startingResources = context.player2.resources.length;

                context.player1.clickCard(context.greenSquadronAwing);
                context.player1.clickCard(context.restoredArc170);

                expect(context.player1).toHavePassAbilityPrompt(prompt);
                context.player1.clickPrompt(prompt);

                expect(context.player1.resources.length).toBe(startingResources + 1);
                expect(context.player2).toBeActivePlayer();
            });

            it('should not add the top deck card as a resource if deck is empty', function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        spaceArena: ['green-squadron-awing'],
                        deck: []
                    },
                    player2: {
                        spaceArena: [{ card: 'restored-arc170', upgrades: ['price-on-your-head'] }],
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.greenSquadronAwing);
                context.player1.clickCard(context.restoredArc170);

                // bounty trigger still appears even though there's no effect, b/c the player still needs to decide whether to "collect the bounty"
                expect(context.player1).toHavePassAbilityPrompt('Collect Bounty: Put the top card of your deck into play as a resource');
                context.player1.clickPrompt('Collect Bounty: Put the top card of your deck into play as a resource');

                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
