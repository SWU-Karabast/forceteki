describe('Red Squadron X-Wing', function() {
    integration(function(contextRef) {
        it('Red Squadron X-Wing\'s ability should deal to damge to itself and draw a card', function () {
            contextRef.setupTest({
                phase: 'action',
                player1: {
                    hand: ['red-squadron-xwing'],
                    deck: ['501st-liberator', 'clone-dive-trooper'],
                }
            });

            const { context } = contextRef;

            const reset = () => {
                context.player1.moveCard(context.redSquadronXwing, 'hand');
                context.player2.passAction();
            };

            // Play Red Squadron X-Wing and deal 1 damage to itself to draw a card
            context.player1.clickCard(context.redSquadronXwing);
            expect(context.player1).toHavePassAbilityPrompt('Deal 2 damage to this unit');
            context.player1.clickPrompt('Deal 2 damage to this unit');

            expect(context.player2).toBeActivePlayer();
            expect(context.redSquadronXwing.damage).toBe(2);
            expect(context.player1.hand.length).toBe(1);
            expect(context._501stLiberator).toBeInZone('hand', context.player1);

            reset();

            // Play Red Squadron X-Wing and pass ability
            context.player1.clickCard(context.redSquadronXwing);
            expect(context.player1).toHavePassAbilityPrompt('Deal 2 damage to this unit');
            context.player1.clickPrompt('Pass');

            expect(context.player2).toBeActivePlayer();
            expect(context.redSquadronXwing.damage).toBe(0);
            expect(context.player1.hand.length).toBe(1);
        });
    });
});
