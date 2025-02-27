describe('Never Tell Me The Odds', function() {
    integration(function(contextRef) {
        it('Discards 3 cards from both players\' decks and then deals damage equal to the number of odd-cost cards', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['never-tell-me-the-odds'],
                    spaceArena: ['concord-dawn-interceptors'],
                    deck: ['foresight', 'vanguard-infantry', 'wampa', 'spark-of-hope']
                },
                player2: {
                    groundArena: ['phaseiii-dark-trooper'],
                    deck: ['battlefield-marine', 'pyke-sentinel', 'volunteer-soldier', 'the-chaos-of-war']
                },
            });

            const { context } = contextRef;

            expect(context.player1.deck.length).toBe(4);
            expect(context.player2.deck.length).toBe(4);

            context.player1.clickCard(context.neverTellMeTheOdds);

            expect(context.player1.deck.length).toBe(1);
            expect(context.player2.deck.length).toBe(1);

            expect(context.player1).toBeAbleToSelectExactly([context.concordDawnInterceptors, context.phaseiiiDarkTrooper]);
            context.player1.clickCard(context.concordDawnInterceptors);
            expect(context.concordDawnInterceptors.damage).toBe(3);
        });
    });
});