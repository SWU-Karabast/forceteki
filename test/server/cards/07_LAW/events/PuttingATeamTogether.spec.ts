describe('Putting a Team Together', function () {
    integration(function (contextRef) {
        it('Putting a Team Together\'s ability should search the top 8 cards of the deck and draw a Vigilance, Aggression, or Cunning unit', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['putting-a-team-together'],
                    deck: ['wampa', 'isb-agent', 'yoda#old-master', 'battlefield-marine', 'vanquish', 'sudden-ferocity', 'atst', 'awing', 'waylay']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.puttingATeamTogether);

            expect(context.player1).toHaveExactDisplayPromptCards({
                invalid: [context.battlefieldMarine, context.vanquish, context.suddenFerocity, context.atst],
                selectable: [context.wampa, context.isbAgent, context.yoda, context.awing]
            });
            expect(context.player1).toHaveEnabledPromptButton('Take nothing');

            context.player1.clickCardInDisplayCardPrompt(context.wampa);

            // P2 is prompted to see the revealed card
            expect(context.player2).toHaveExactViewableDisplayPromptCards([context.wampa]);
            context.player2.clickDone();

            expect(context.player2).toBeActivePlayer();
            expect(context.wampa).toBeInZone('hand', context.player1);
            expect(context.getChatLog()).toContain('player1 uses Putting a Team Together to reveal and draw Wampa');

            expect(context.isbAgent).toBeInBottomOfDeck(context.player1, 7);
            expect(context.yoda).toBeInBottomOfDeck(context.player1, 7);
            expect(context.battlefieldMarine).toBeInBottomOfDeck(context.player1, 7);
            expect(context.vanquish).toBeInBottomOfDeck(context.player1, 7);
            expect(context.suddenFerocity).toBeInBottomOfDeck(context.player1, 7);
            expect(context.atst).toBeInBottomOfDeck(context.player1, 7);
            expect(context.awing).toBeInBottomOfDeck(context.player1, 7);
        });
    });
});
