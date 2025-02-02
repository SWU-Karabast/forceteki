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

                // First check that the lookAt sends ALL the oppoents cards in hand to chat
                expect(context.getChatLogs(1)).toContain('Spark of Rebellion sees Battlefield Marine, Waylay, Protector, and Inferno Four');

                // Now the player can select any card in the opponents hand
                expect(context.player1).toBeAbleToSelectAllOf([context.battlefieldMarine, context.waylay, context.protector, context.infernoFourUnforgetting]);

                context.player1.clickCard(context.battlefieldMarine);
                expect(context.battlefieldMarine).toBeInZone('discard');

                context.player2.passAction();
                context.player1.moveCard(context.sparkOfRebellion, 'hand');
                context.player2.moveCard(context.waylay, 'discard');
                context.player2.moveCard(context.protector, 'discard');

                // Now test only one card to discard
                context.player1.clickCard(context.sparkOfRebellion);

                expect(context.getChatLogs(1)).toContain('Spark of Rebellion sees Inferno Four');
                expect(context.player1).toBeAbleToSelectAllOf([context.infernoFourUnforgetting]);
                context.player1.clickCard(context.infernoFourUnforgetting);
                expect(context.infernoFourUnforgetting).toBeInZone('discard');

                context.player2.passAction();

                // Now test no cards to dicard
                context.player1.moveCard(context.sparkOfRebellion, 'hand');

                // No choice here so no prompt
                context.player1.clickCard(context.sparkOfRebellion);
                // Nothing for lookAt to reveal either -- you get this default message
                expect(context.getChatLogs(1)).toContain('player1 plays Spark of Rebellion to look at a card');
            });
        });
    });
});
