describe('Reveal Intentions', function () {
    integration(function (contextRef) {
        it('Reveal Intentions\' ability should reveal both players hand and discard a card from hands. Player must draw at the end', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['battlefield-marine', 'green-squadron-awing', 'reveal-intentions']
                },
                player2: {
                    hand: ['atst', 'wampa']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.revealIntentions);
            expect(context.player1).toHavePrompt('Discard a card from opponent\'s hand');
            expect(context.player1).toHaveExactSelectableDisplayPromptCards([context.atst, context.wampa]);
            expect(context.player1).not.toHaveEnabledPromptButton('Take nothing');
            context.player1.clickCardInDisplayCardPrompt(context.wampa);

            expect(context.player2).toHavePrompt('Discard a card from opponent\'s hand');
            expect(context.player2).toHaveExactSelectableDisplayPromptCards([context.battlefieldMarine, context.greenSquadronAwing]);
            expect(context.player2).not.toHaveEnabledPromptButton('Take nothing');
            context.player2.clickCardInDisplayCardPrompt(context.battlefieldMarine);

            expect(context.player2).toBeActivePlayer();
            expect(context.battlefieldMarine).toBeInZone('discard', context.player1);
            expect(context.wampa).toBeInZone('discard', context.player2);
            expect(context.player1.hand.length).toBe(2);
            expect(context.player2.hand.length).toBe(2);
        });

        it('Reveal Intentions\' ability should reveal players non-empty hand and discard a card from them. Player must draw at the end (even if hand was empty)', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['reveal-intentions']
                },
                player2: {
                    hand: ['atst', 'wampa']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.revealIntentions);
            expect(context.player1).toHaveExactSelectableDisplayPromptCards([context.atst, context.wampa]);
            context.player1.clickCardInDisplayCardPrompt(context.wampa);

            expect(context.player2).toBeActivePlayer();
            expect(context.wampa).toBeInZone('discard', context.player2);
            expect(context.player1.hand.length).toBe(1);
            expect(context.player2.hand.length).toBe(2);
        });

        it('Reveal Intentions\' ability should reveal players non-empty hand and discard a card from them. Player must draw at the end (even if decks are empty)', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['reveal-intentions'],
                    deck: []
                },
                player2: {
                    hand: ['atst', 'wampa'],
                    deck: []
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.revealIntentions);
            expect(context.player1).toHaveExactSelectableDisplayPromptCards([context.atst, context.wampa]);
            context.player1.clickCardInDisplayCardPrompt(context.wampa);

            expect(context.player2).toBeActivePlayer();
            expect(context.wampa).toBeInZone('discard', context.player2);
            expect(context.player1.hand.length).toBe(0);
            expect(context.player2.hand.length).toBe(1);
            expect(context.p1Base.damage).toBe(3);
            expect(context.p2Base.damage).toBe(3);
        });
    });
});