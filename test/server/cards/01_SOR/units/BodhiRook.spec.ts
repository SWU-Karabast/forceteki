describe('Bodhi Rook', function () {
    integration(function (contextRef) {
        describe('Bodhi Rook\'s ability', function () {
            it('should look at an opponent\'s hand and discard a non-unit card from it.', function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['bodhi-rook#imperial-defector', 'open-fire'],
                        groundArena: ['wampa'],
                    },
                    player2: {
                        hand: ['sabine-wren#explosives-artist', 'battlefield-marine', 'waylay', 'protector', 'inferno-four#unforgetting'],
                    }
                });
                const { context } = contextRef;

                context.player1.clickCard(context.bodhiRook);
                expect(context.player1).toBeAbleToSelectAllOf([context.waylay, context.protector]);
                context.player1.clickCard(context.waylay);
                expect(context.waylay).toBeInZone('discard');

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


