describe('Bodhi Rook', function () {
    integration(function (contextRef) {
        describe('Bodhi Rook\'s ability', function () {
            it('should look at an opponent\'s hand and discard a non-unit card from it.', function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['bodhi-rook#imperial-defector', 'open-fire'],
                        leader: 'jyn-erso#resisting-oppression', // double-yellow to not pay 7 for each bodhi
                        base: 'chopper-base',
                        groundArena: ['wampa'],
                    },
                    player2: {
                        hand: ['sabine-wren#explosives-artist', 'battlefield-marine', 'waylay', 'protector', 'inferno-four#unforgetting'],
                    }
                });
                const { context } = contextRef;

                // Default test, gives the player two options
                context.player1.clickCard(context.bodhiRook);
                expect(context.player1).toBeAbleToSelectAllOf([context.waylay, context.protector]);
                context.player1.clickCard(context.waylay);
                expect(context.waylay).toBeInZone('discard');

                context.player2.passAction();

                // Only one possible choice -- does the player still get to select?
                context.player1.moveCard(context.bodhiRook, 'hand');
                context.player1.clickCard(context.bodhiRook);
                //expect(context.player1).toBeAbleToSelectAllOf([context.protector]);
               // context.player1.clickCard(context.protector); // this might have auto-resolved here
                expect(context.protector).toBeInZone('discard');

                // No choice here, but the player still needs an opponent hand reveal
                context.player2.passAction();

                context.player1.moveCard(context.bodhiRook, 'hand');
                context.player1.clickCard(context.bodhiRook); // Broken here -- state does not change, but we have a reveal here, so it still has to happen..
                expect(context.player1).toHaveChooseNoTargetButton();


                /*
                expect(context.player1).toHavePassAbilityPrompt(prompt);
                context.player1.clickPrompt(prompt);

                // Choose one non-unit card
                expect(context.player1).toHaveDisabledPromptButtons([context.sabineWren.title, context.battleFieldMarine.title, context.infernoFour.title]);
                expect(context.player1).toHaveEnabledPromptButtons([context.waylay, context.protector.title, context.resupply.title]);

                context.player1.clickPrompt(context.waylay.title);
                expect(context.waylay).toBeInZone('discard');
                */
            });
        });
    });
});


