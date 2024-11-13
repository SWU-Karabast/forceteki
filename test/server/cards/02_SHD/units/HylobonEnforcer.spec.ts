describe('Hylobon Enforcer', function() {
    integration(function(contextRef) {
        describe('Hylobon Enforcer\'s Bounty ability', function() {
            it('should draw a card', function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: ['hylobon-enforcer']
                    },
                    player2: {
                        groundArena: ['wampa']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.hylobonEnforcer);
                context.player1.clickCard(context.wampa);

                expect(context.player2).toHavePassAbilityPrompt('Bounty: Draw a card');
                context.player2.clickPrompt('Bounty: Draw a card');

                expect(context.player1.handSize).toBe(0);
                expect(context.player2.handSize).toBe(1);
                expect(context.player2).toBeActivePlayer();
            });

            it('should cause the opponent to take 3 damage to base if their deck is empty', function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: ['hylobon-enforcer']
                    },
                    player2: {
                        groundArena: ['wampa'],
                        deck: []
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.hylobonEnforcer);
                context.player1.clickCard(context.wampa);

                expect(context.player2).toHavePassAbilityPrompt('Bounty: Draw a card');
                context.player2.clickPrompt('Bounty: Draw a card');

                expect(context.player1.handSize).toBe(0);
                expect(context.player2.handSize).toBe(0);
                expect(context.p2Base.damage).toBe(3);
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
