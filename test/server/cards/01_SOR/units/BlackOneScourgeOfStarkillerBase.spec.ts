describe('Black One', function() {
    integration(function(contextRef) {
        describe('Black One\'s When Played and When Defeated ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['black-one#scourge-of-starkiller-base'],
                        deck: ['confiscate', 'waylay', 'isb-agent', 'cartel-spacer', 'wampa', 'disarm', 'atst']
                    },
                    player2: {
                        hand: ['vanquish', 'rivals-fall']
                    },

                    // IMPORTANT: this is here for backwards compatibility of older tests, don't use in new code
                    autoSingleTarget: true
                });
            });

            it('draw 3 cards if hand is discarded', function () {
                const { context } = contextRef;

                // Player 1 plays Black One and activates When Played, drawing cards
                context.player1.clickCard(context.blackOne);

                expect(context.player1.handSize).toBe(0);
                expect(context.player1).toHavePassAbilityPrompt('Discard your hand. If you do, draw 3 cards');
                context.player1.clickPrompt('Trigger');

                expect(context.player1.handSize).toBe(3);
                expect(context.confiscate).toBeInZone('hand', context.player1);
                expect(context.waylay).toBeInZone('hand', context.player1);
                expect(context.isbAgent).toBeInZone('hand', context.player1);

                // Player 2 plays Vanquish and defeats Black One
                expect(context.player2).toBeActivePlayer();
                context.player2.clickCard(context.vanquish);

                // Player 1 actives When Defeated, drawing cards
                expect(context.player1).toHavePassAbilityPrompt('Discard your hand. If you do, draw 3 cards');
                context.player1.clickPrompt('Trigger');

                expect(context.player1.handSize).toBe(3);
                expect(context.confiscate).toBeInZone('discard', context.player1);
                expect(context.waylay).toBeInZone('discard', context.player1);
                expect(context.isbAgent).toBeInZone('discard', context.player1);
                expect(context.cartelSpacer).toBeInZone('hand', context.player1);
                expect(context.wampa).toBeInZone('hand', context.player1);
                expect(context.disarm).toBeInZone('hand', context.player1);

                // Player 1 plays Black One again and activates When Played, taking damage
                expect(context.player1).toBeActivePlayer();
                context.player1.moveCard(context.blackOne, 'hand');
                context.player1.clickCard(context.blackOne);
                context.player1.clickPrompt('Trigger');

                expect(context.player1.handSize).toBe(1);
                expect(context.cartelSpacer).toBeInZone('discard', context.player1);
                expect(context.wampa).toBeInZone('discard', context.player1);
                expect(context.disarm).toBeInZone('discard', context.player1);
                expect(context.atst).toBeInZone('hand', context.player1);
                expect(context.p1Base.damage).toBe(6);

                // Player 2 plays Rival's Fall and defeats Black One
                expect(context.player2).toBeActivePlayer();
                context.player2.clickCard(context.rivalsFall);

                // Player 1 actives When Defeated, drawing cards
                context.player1.clickPrompt('Trigger');

                expect(context.player1.handSize).toBe(0);
                expect(context.atst).toBeInZone('discard', context.player1);
                expect(context.p1Base.damage).toBe(15);
            });
        });

        it('should work with No Glory, Only Results', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    spaceArena: ['black-one#scourge-of-starkiller-base']
                },
                player2: {
                    hand: ['no-glory-only-results'],
                    deck: ['confiscate', 'waylay', 'isb-agent'],
                    hasInitiative: true
                }
            });
            const { context } = contextRef;

            context.player2.clickCard(context.noGloryOnlyResults);
            context.player2.clickCard(context.blackOne);
            context.player2.clickPrompt('Trigger');
            expect(context.player2.handSize).toBe(3);
            expect(context.confiscate).toBeInZone('hand', context.player2);
            expect(context.waylay).toBeInZone('hand', context.player2);
            expect(context.isbAgent).toBeInZone('hand', context.player2);

            context.player1.passAction();
        });
    });
});