describe('Bodhi Rook', function () {
    integration(function (contextRef) {
        describe('Bodhi Rook\'s ability', function () {
            it('should look at an opponent\'s hand and discard a non-unit card from it.', async function () {
                await contextRef.setupTestAsync({
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

                // Check that all cards in hand are displayed, with correct selectable state
                expect(context.player1).toHaveExactDisplayPromptCards({
                    invalid: [context.sabineWren, context.battlefieldMarine, context.infernoFour],
                    selectable: [context.waylay, context.protector]
                });
                expect(context.player1).not.toHaveEnabledPromptButton('Done');

                // Check that cards are not revealed in chat
                expect(context.getChatLogs(1)[0]).not.toContain(context.sabineWren.title);
                expect(context.getChatLogs(1)[0]).not.toContain(context.battlefieldMarine.title);
                expect(context.getChatLogs(1)[0]).not.toContain(context.infernoFour.title);
                expect(context.getChatLogs(1)[0]).not.toContain(context.waylay.title);
                expect(context.getChatLogs(1)[0]).not.toContain(context.protector.title);

                context.player1.clickCardInDisplayCardPrompt(context.waylay);
                expect(context.waylay).toBeInZone('discard');

                context.player2.passAction();
                context.player1.moveCard(context.bodhiRook, 'hand');

                // Only one possible choice -- autoSingleTarget is off, so this still asks to select
                context.player1.clickCard(context.bodhiRook);
                expect(context.player1).toHaveExactDisplayPromptCards({
                    invalid: [context.sabineWren, context.battlefieldMarine, context.infernoFour],
                    selectable: [context.protector]
                });
                context.player1.clickCardInDisplayCardPrompt(context.protector);
                expect(context.protector).toBeInZone('discard');

                context.player2.passAction();
                context.player1.moveCard(context.bodhiRook, 'hand');

                // No choice here so no prompt, but the player still sees an opponent hand reveal
                context.player1.clickCard(context.bodhiRook);
                expect(context.player1).toHaveExactDisplayPromptCards({
                    invalid: [context.sabineWren, context.battlefieldMarine, context.infernoFour]
                });
                context.player1.clickPrompt('Done');
            });
        });
    });
});


