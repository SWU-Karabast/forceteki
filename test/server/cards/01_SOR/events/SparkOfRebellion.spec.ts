describe('Spark Of Rebellion', function () {
    integration(function (contextRef) {
        describe('Spark Of Rebellion\'s ability', function () {
            it('should look at an opponent\'s hand and discard a non-unit card from it.', function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['spark-of-rebellion', 'open-fire'],
                        groundArena: ['wampa'],
                    },
                    player2: {
                        hand: ['battlefield-marine', 'waylay', 'protector', 'inferno-four#unforgetting'],
                    }
                });
                const { context } = contextRef;

                context.player1.clickCard(context.sparkOfRebellion);

                // First check that the lookAt sends ALL the opponents cards in hand to chat
                expect(context.player1).toHaveExactSelectableDisplayPromptCards([context.battlefieldMarine, context.waylay, context.protector, context.infernoFour]);
                expect(context.player1).not.toHaveEnabledPromptButton('Done');
                expect(context.getChatLogs(1)[0]).not.toContain(context.battlefieldMarine.title);
                expect(context.getChatLogs(1)[0]).not.toContain(context.waylay.title);
                expect(context.getChatLogs(1)[0]).not.toContain(context.protector.title);
                expect(context.getChatLogs(1)[0]).not.toContain(context.infernoFour.title);

                context.player1.clickCardInDisplayCardPrompt(context.battlefieldMarine);
                expect(context.battlefieldMarine).toBeInZone('discard');

                context.player2.passAction();
                context.player1.moveCard(context.sparkOfRebellion, 'hand');
                context.player2.moveCard(context.waylay, 'discard');
                context.player2.moveCard(context.protector, 'discard');

                // Now test only one card to discard
                context.player1.clickCard(context.sparkOfRebellion);

                expect(context.player1).toHaveExactSelectableDisplayPromptCards([context.infernoFour]);
                expect(context.player1).not.toHaveEnabledPromptButton('Done');
                expect(context.getChatLogs(1)[0]).not.toContain(context.infernoFour.title);

                context.player1.clickCardInDisplayCardPrompt(context.infernoFour);
                expect(context.infernoFour).toBeInZone('discard');

                context.player2.passAction();

                // Now test no cards to dicard
                context.player1.moveCard(context.sparkOfRebellion, 'hand');

                // No choice here so no prompt
                context.player1.clickCard(context.sparkOfRebellion);
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
