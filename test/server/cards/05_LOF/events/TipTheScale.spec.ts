describe('Tip The Scale', function () {
    integration(function (contextRef) {
        describe('Tip The Scale\'s ability', function () {
            it('should look at an opponent\'s hand and discard a non-unit card from it.', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['tip-the-scale', 'open-fire'],
                        leader: 'jyn-erso#resisting-oppression',
                        base: 'chopper-base',
                        groundArena: ['wampa'],
                    },
                    player2: {
                        hand: ['sabine-wren#explosives-artist', 'battlefield-marine', 'waylay', 'protector', 'inferno-four#unforgetting'],
                    }
                });
                const { context } = contextRef;

                // Default test, gives the player two options
                context.player1.clickCard(context.tipTheScale);
                expect(context.tipTheScale.zoneName).toBe('discard');

                // Check that all cards in hand are displayed, with correct selectable state
                expect(context.player1).toHaveExactDisplayPromptCards({
                    invalid: [context.sabineWren, context.battlefieldMarine, context.infernoFour],
                    selectable: [context.waylay, context.protector]
                });
                expect(context.player1).not.toHaveEnabledPromptButton('Done');

                // Check that cards are revealed in chat
                expect(context.getChatLogs(1)[0]).toContain(context.sabineWren.title);
                expect(context.getChatLogs(1)[0]).toContain(context.battlefieldMarine.title);
                expect(context.getChatLogs(1)[0]).toContain(context.infernoFour.title);
                expect(context.getChatLogs(1)[0]).toContain(context.waylay.title);
                expect(context.getChatLogs(1)[0]).toContain(context.protector.title);
                expect(context.getChatLogs(1)[0]).toEqual(
                    'player1 plays Tip the Scale to look at the opponent\'s hand and sees Sabine Wren, Battlefield Marine, Waylay, Protector, and Inferno Four',
                );

                context.player1.clickCardInDisplayCardPrompt(context.waylay);
                expect(context.waylay).toBeInZone('discard');

                context.player2.passAction();
                context.player1.moveCard(context.tipTheScale, 'hand');

                // Only one possible choice -- autoSingleTarget is off, so this still asks to select
                context.player1.clickCard(context.tipTheScale);
                expect(context.player1).toHaveExactDisplayPromptCards({
                    invalid: [context.sabineWren, context.battlefieldMarine, context.infernoFour],
                    selectable: [context.protector]
                });
                context.player1.clickCardInDisplayCardPrompt(context.protector);
                expect(context.protector).toBeInZone('discard');

                context.player2.passAction();
                context.player1.moveCard(context.tipTheScale, 'hand');

                // No choice here so no prompt, but the player still sees an opponent hand reveal
                context.player1.clickCard(context.tipTheScale);
                expect(context.player1).toHaveExactDisplayPromptCards({
                    invalid: [context.sabineWren, context.battlefieldMarine, context.infernoFour]
                });
                context.player1.clickDone();
            });

            it('should look at an opponent\'s hand and discard a non-unit card from it.', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['tip-the-scale', 'open-fire'],
                        leader: 'jyn-erso#resisting-oppression',
                        base: 'chopper-base',
                        groundArena: ['wampa'],
                    },
                    player2: {
                        hand: [],
                    }
                });
                const { context } = contextRef;

                // Default test, gives the player two options
                context.player1.clickCard(context.tipTheScale);
                context.player1.clickPrompt('Play anyway');
                expect(context.tipTheScale.zoneName).toBe('discard');
                expect(context.player1.exhaustedResourceCount).toBe(2);
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});