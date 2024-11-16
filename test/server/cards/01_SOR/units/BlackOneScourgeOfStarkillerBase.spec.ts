describe('Black One', function() {
    integration(function(contextRef) {
        describe('Black One\'s When Played and When Defeated ability', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['black-one#scourge-of-starkiller-base'],
                        deck: ['confiscate', 'waylay', 'isb-agent', 'cartel-spacer', 'wampa', 'disarm', 'atst']
                    },
                    player2: {
                        hand: ['vanquish', 'rivals-fall']
                    }
                });
            });

            it('draw 3 cards if hand is discarded', function () {
                const { context } = contextRef;

                // Player 1 plays Black One and activates When Played, drawing cards
                context.player1.clickCard(context.blackOne);

                expect(context.player1.handSize).toBe(0);
                expect(context.player1).toHavePassAbilityPrompt('Discard your hand');
                context.player1.clickPrompt('Discard your hand');

                expect(context.player1.handSize).toBe(3);
                expect(context.confiscate).toBeInLocation('hand', context.player1);
                expect(context.waylay).toBeInLocation('hand', context.player1);
                expect(context.isbAgent).toBeInLocation('hand', context.player1);

                // Player 2 plays Vanquish and defeats Black One
                expect(context.player2).toBeActivePlayer();
                context.player2.clickCard(context.vanquish);

                // Player 1 actives When Defeated, drawing cards
                expect(context.player1).toHavePassAbilityPrompt('Discard your hand');
                context.player1.clickPrompt('Discard your hand');

                expect(context.player1.handSize).toBe(3);
                expect(context.confiscate).toBeInLocation('discard', context.player1);
                expect(context.waylay).toBeInLocation('discard', context.player1);
                expect(context.isbAgent).toBeInLocation('discard', context.player1);
                expect(context.cartelSpacer).toBeInLocation('hand', context.player1);
                expect(context.wampa).toBeInLocation('hand', context.player1);
                expect(context.disarm).toBeInLocation('hand', context.player1);

                // Player 1 plays Black One again and activates When Played, taking damage
                expect(context.player1).toBeActivePlayer();
                context.player1.moveCard(context.blackOne, 'hand');
                context.player1.clickCard(context.blackOne);
                context.player1.clickPrompt('Discard your hand');

                expect(context.player1.handSize).toBe(1);
                expect(context.cartelSpacer).toBeInLocation('discard', context.player1);
                expect(context.wampa).toBeInLocation('discard', context.player1);
                expect(context.disarm).toBeInLocation('discard', context.player1);
                expect(context.atst).toBeInLocation('hand', context.player1);
                expect(context.p1Base.damage).toBe(6);

                // Player 2 plays Rival's Fall and defeats Black One
                expect(context.player2).toBeActivePlayer();
                context.player2.clickCard(context.rivalsFall);

                // Player 1 actives When Defeated, drawing cards
                context.player1.clickPrompt('Discard your hand');

                expect(context.player1.handSize).toBe(0);
                expect(context.atst).toBeInLocation('discard', context.player1);
                expect(context.p1Base.damage).toBe(15);
            });
        });
    });
});