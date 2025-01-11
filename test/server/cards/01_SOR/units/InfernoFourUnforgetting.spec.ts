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

            it('while playing/defeating lets you look at the top 2 cards of the deck and decide whether to put either them on the bottom or top of deck in any order.', function () {
                const { context } = contextRef;
                let preSwapDeck = context.player1.deck;

                // Case 1 on play move the first top card to top and second card to bottom.
                context.player1.clickCard(context.infernoFour);
                expect(context.player1).toHaveExactDisplayPromptCards([context.foundling, context.pykeSentinel]);
                expect(context.player1).toHaveExactDisplayPromptPerCardButtons(['Put on top', 'Put on bottom']);
                context.player1.clickDisplayCardPromptButton(context.pykeSentinel.uuid, 'top');
                expect(context.player1.deck).toEqual(preSwapDeck);
                context.player1.clickDisplayCardPromptButton(context.foundling.uuid, 'bottom');

                // check board state
                expect(context.player1.deck.length).toBe(5);

                // preswap deck: ['foundling', 'pyke-sentinel', 'atst', 'cartel-spacer', 'wampa']
                // expected after deck: ['atst', 'cartel-spacer', 'wampa', 'pyke-sentinel', 'foundling']
                expect(context.player1.deck[0]).toEqual(preSwapDeck[1]);
                expect(context.player1.deck[1]).toEqual(preSwapDeck[2]);
                expect(context.player1.deck[4]).toEqual(preSwapDeck[0]);
                expect(context.player2).toBeActivePlayer();

                // record new state.
                preSwapDeck = context.player1.deck;

                // Case 2 on defeat move both cards to the top of the deck
                context.player2.clickCard(context.tieAdvanced);
                context.player2.clickCard(context.infernoFour);
                expect(context.player1).toHaveExactDisplayPromptCards([context.pykeSentinel, context.atst]);
                expect(context.player1).toHaveExactDisplayPromptPerCardButtons(['Put on top', 'Put on bottom']);
                context.player1.clickDisplayCardPromptButton(context.pykeSentinel.uuid, 'top');
                expect(context.player1.deck).toEqual(preSwapDeck);
                context.player1.clickDisplayCardPromptButton(context.atst.uuid, 'top');

                // Check board state
                // preswap deck deck: ['pyke-sentinel', 'atst', 'cartel-spacer', 'wampa', 'foundling']
                // expected after deck: ['atst', 'pyke-sentinel', 'cartel-spacer', 'wampa', 'foundling']
                expect(context.player1.deck.length).toBe(5);
                expect(context.player1.deck[0]).toEqual(preSwapDeck[1]);
                expect(context.player1.deck[1]).toEqual(preSwapDeck[0]);
                expect(context.player1).toBeActivePlayer();
            });
        });

        describe('Inferno Four - Unforgetting\'s ability', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['inferno-four#unforgetting'],
                        deck: ['foundling'],
                    },
                    player2: {}
                });
            });

            it('while playing should only show card and put it back on top of deck since the deck size is 1', function () {
                const { context } = contextRef;
                context.player1.clickCard(context.infernoFour);
                expect(context.getChatLogs(1)).toContain('Inferno Four sees Foundling');
                expect(context.player2).toBeActivePlayer();
                expect(context.p1Base.damage).toEqual(0);
                expect(context.p2Base.damage).toEqual(0);
            });
        });
    });
});
