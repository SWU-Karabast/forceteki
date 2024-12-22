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
                expect(context.bodhiRook.zoneName).toBe('groundArena');

                // First check that the lookAt sends ALL the oppoents cards in hand to chat
                expect(context.getChatLogs(1)).toContain('Bodhi Rook sees Sabine Wren, Battlefield Marine, Waylay, Protector, and Inferno Four');

                // Now the player can select using the card filters
                expect(context.player1).toBeAbleToSelectAllOf([context.waylay, context.protector]);

                context.player1.clickCard(context.waylay);
                expect(context.waylay).toBeInZone('discard');

                context.player2.passAction();
                context.player1.moveCard(context.bodhiRook, 'hand');

                // Only one possible choice -- autoSingleTarget is off, so this still asks to select
                context.player1.clickCard(context.bodhiRook);
                expect(context.getChatLogs(1)).toContain('Bodhi Rook sees Sabine Wren, Battlefield Marine, Protector, and Inferno Four');
                expect(context.player1).toBeAbleToSelectAllOf([context.protector]);
                context.player1.clickCard(context.protector);
                expect(context.protector).toBeInZone('discard');

                context.player2.passAction();
                context.player1.moveCard(context.bodhiRook, 'hand');

                // No choice here so no prompt, but the player still sees an opponent hand reveal
                context.player1.clickCard(context.bodhiRook);
                expect(context.getChatLogs(1)).toContain('Bodhi Rook sees Sabine Wren, Battlefield Marine, and Inferno Four');
            });
        });
    });
});


