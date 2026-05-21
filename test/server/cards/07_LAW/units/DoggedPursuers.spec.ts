describe('Dogged Pursuers', function() {
    integration(function(contextRef) {
        describe('Dogged Pursuers\'s ability', function() {
            beforeEach(function() {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['dogged-pursuers'],
                        groundArena: ['wampa'],
                        base: 'tarkintown'
                    },
                    player2: {
                        groundArena: ['battlefield-marine'],
                        spaceArena: ['awing']
                    }
                });
            });

            it('should be able to pass on the ability', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.doggedPursuers);
                expect(context.player1).toHavePassAbilityPrompt('Pay 1 resource to deal 2 damage to a ground unit');
                context.player1.clickPrompt('Pass');

                expect(context.player2).toBeActivePlayer();
                expect(context.player1.exhaustedResourceCount).toBe(5);
            });

            it('should be able to pay 1 resource and deal 2 damage to a ground unit', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.doggedPursuers);
                expect(context.player1).toHavePassAbilityPrompt('Pay 1 resource to deal 2 damage to a ground unit');
                context.player1.clickPrompt('Trigger');

                expect(context.player1).toHavePrompt('Deal 2 damage to a ground unit');
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.wampa, context.doggedPursuers]);
                expect(context.player1).not.toHavePassAbilityButton();
                expect(context.player1).not.toHaveChooseNothingButton();

                context.player1.clickCard(context.battlefieldMarine);

                expect(context.player2).toBeActivePlayer();
                expect(context.player1.exhaustedResourceCount).toBe(6);
                expect(context.battlefieldMarine.damage).toBe(2);
            });
        });
    });
});
