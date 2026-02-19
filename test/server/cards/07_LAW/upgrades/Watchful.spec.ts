describe('Watchful', function() {
    integration(function(contextRef) {
        describe('Watchful\'s ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['watchful'],
                        groundArena: ['battlefield-marine'],
                        spaceArena: ['cartel-interceptor'],
                        deck: ['foundling', 'pyke-sentinel', 'atst', 'cartel-spacer', 'wampa'],
                    },
                    player2: {
                        groundArena: ['imperial-dark-trooper'],
                    }
                });
            });

            it('Attacking lets you look at the top card of the deck and decide whether to put it on the bottom or top of deck.', function () {
                const { context } = contextRef;
                const preSwapDeck = context.player1.deck.concat();

                context.player1.clickCard(context.watchful);
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.cartelInterceptor, context.imperialDarkTrooper]);
                context.player1.clickCard(context.battlefieldMarine);
                context.player2.passAction();

                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.p2Base);
                expect(context.player1).toHaveExactSelectableDisplayPromptCards([context.foundling]);
                expect(context.player1).toHaveExactDisplayPromptPerCardButtons(['Put on top', 'Put on bottom']);
                context.player1.clickDisplayCardPromptButton(context.foundling.uuid, 'bottom');

                expect(context.player1.deck.length).toBe(5);
                expect(context.player1.deck[0]).toBe(preSwapDeck[1]);
                expect(context.player1.deck[4]).toBe(preSwapDeck[0]);
                expect(context.player2).toBeActivePlayer();
            });

            it('Attacking lets you look at the top card of the deck and decide whether to put it on the bottom or top of deck.', function () {
                const { context } = contextRef;
                const preSwapDeck = context.player1.deck.concat();

                context.player1.clickCard(context.watchful);
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.cartelInterceptor, context.imperialDarkTrooper]);
                context.player1.clickCard(context.battlefieldMarine);
                context.player2.passAction();

                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.p2Base);
                expect(context.player1).toHaveExactSelectableDisplayPromptCards([context.foundling]);
                expect(context.player1).toHaveExactDisplayPromptPerCardButtons(['Put on top', 'Put on bottom']);
                context.player1.clickDisplayCardPromptButton(context.foundling.uuid, 'top');

                expect(context.player1.deck.length).toBe(5);
                expect(context.player1.deck).toEqualArray(preSwapDeck);
                expect(context.player2).toBeActivePlayer();
            });
        });

        describe('Watchful\'s ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['watchful'],
                        groundArena: ['imperial-dark-trooper'],
                        deck: [],
                    },
                    player2: {
                        groundArena: ['battlefield-marine'],
                    }
                });
            });

            it('while playing shouldn\'t trigger because the deck is empty.', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.watchful);
                context.player1.clickCard(context.imperialDarkTrooper);
                context.player2.passAction();

                context.player1.clickCard(context.imperialDarkTrooper);
                context.player1.clickCard(context.p2Base);

                expect(context.player1.deck.length).toBe(0);
                expect(context.player2).toBeActivePlayer();
                expect(context.p1Base.damage).toEqual(0);
                expect(context.p2Base.damage).toEqual(3);
            });
        });
    });
});