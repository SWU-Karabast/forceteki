describe('R2D2 - Ignoring Protocol', function() {
    integration(function(contextRef) {
        describe('R2D2 - Ignoring Protocol\'s ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['r2d2#ignoring-protocol'],
                        deck: ['foundling', 'pyke-sentinel', 'atst', 'cartel-spacer', 'wampa'],
                    },
                    player2: {
                        groundArena: ['battlefield-marine'],
                    }
                });
            });

            it('while playing/attacking lets you look at the top card of the deck and decide whether to put it on the bottom or top of deck.', function () {
                const { context } = contextRef;
                let preSwapDeck = context.player1.deck;

                // Case 1 on play move top card to bottom
                context.player1.clickCard(context.r2d2);
                expect(context.player1).toHaveExactSelectableDisplayPromptCards([context.foundling]);
                expect(context.player1).toHaveExactDisplayPromptPerCardButtons(['Put on top', 'Put on bottom']);
                context.player1.clickDisplayCardPromptButton(context.foundling.uuid, 'bottom');

                // check board state
                expect(context.player1.deck.length).toBe(5);
                expect(context.player1.deck[0]).toEqual(preSwapDeck[1]);
                expect(context.player1.deck[4]).toEqual(preSwapDeck[0]);
                expect(context.player2).toBeActivePlayer();

                // record new state.
                context.player2.passAction();
                context.r2d2.exhausted = false;
                preSwapDeck = context.player1.deck;

                // Case 2 on attack move to top
                context.player1.clickCard(context.r2d2);
                context.player1.clickCard(context.battlefieldMarine);
                expect(context.player1).toHaveExactSelectableDisplayPromptCards([context.pykeSentinel]);
                expect(context.player1).toHaveExactDisplayPromptPerCardButtons(['Put on top', 'Put on bottom']);
                context.player1.clickDisplayCardPromptButton(context.pykeSentinel.uuid, 'top');

                // Check board state
                expect(context.player1.deck.length).toBe(5);
                expect(context.player1.deck).toEqual(preSwapDeck);
                expect(context.player2).toBeActivePlayer();
            });
        });

        describe('R2D2 - Ignoring Protocol\'s ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['r2d2#ignoring-protocol'],
                        deck: [],
                    },
                    player2: {
                        groundArena: ['battlefield-marine'],
                    }
                });
            });

            it('while playing shouldn\'t trigger because the deck is empty.', function () {
                const { context } = contextRef;
                context.player1.clickCard(context.r2d2);

                // check board state
                expect(context.player1.deck.length).toBe(0);
                expect(context.player2).toBeActivePlayer();
                expect(context.p1Base.damage).toEqual(0);
                expect(context.p2Base.damage).toEqual(0);
            });
        });
    });
});
