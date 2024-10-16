describe('Inferno Four - Unforgetting', function() {
    integration(function(contextRef) {
        describe('Inferno Four - Unforgetting\'s ability', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['inferno-four#unforgetting'],
                        deck: ['foundling', 'pyke-sentinel', 'atst', 'cartel-spacer', 'wampa'],
                    },
                    player2: {
                        spaceArena: ['tie-advanced'],
                    }
                });
            });

            it('While playing/defeating lets you look at the top 2 cards of the deck and decide whether to put either them on the bottom or top of deck in any order.', function () {
                const { context } = contextRef;
                let preSwapDeck = context.player1.deck;

                // Case 1 on play move top card to bottom
                context.player1.clickCard(context.infernoFour);
                context.player1.clickPrompt('pyke-sentinel-bottom');
                context.player1.clickPrompt('foundling-bottom');


                // check board state
                expect(context.player1.deck.length).toBe(5);

                // preswap deck: ['foundling', 'pyke-sentinel', 'atst', 'cartel-spacer', 'wampa']
                // expected after deck: ['atst', 'cartel-spacer', 'wampa', 'pyke-sentinel', 'foundling']
                expect(context.player1.deck[0]).toEqual(preSwapDeck[2]);
                expect(context.player1.deck[3]).toEqual(preSwapDeck[1]);
                expect(context.player1.deck[4]).toEqual(preSwapDeck[0]);
                expect(context.player2).toBeActivePlayer();


                // restart state
                preSwapDeck = context.player1.deck;

                // Case 2 on attack move to top
                context.player2.clickCard(context.tieAdvanced);
                context.player2.clickCard(context.infernoFour);
                context.player1.clickPrompt('atst-top');
                context.player1.clickPrompt('cartel-spacer-top');

                // Check board state
                // preswap deck deck: ['atst', 'cartel-spacer', 'wampa', 'pyke-sentinel', 'foundling']
                // expected after deck: ['cartel-spacer', 'atst', 'wampa', 'pyke-sentinel', 'foundling']
                expect(context.player1.deck.length).toBe(5);
                expect(context.player1.deck[0]).toEqual(preSwapDeck[1]);
                expect(context.player1.deck[1]).toEqual(preSwapDeck[0]);
                expect(context.player1).toBeActivePlayer();
            });
        });
    });
});
