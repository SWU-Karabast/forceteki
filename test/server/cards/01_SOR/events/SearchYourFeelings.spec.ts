describe('Search Your Feelings', function() {
    integration(function(contextRef) {
        describe('Search Your Feelings\' ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['search-your-feelings'],
                        deck: ['battlefield-marine', 'han-solo#has-his-moments', 'cell-block-guard', 'pyke-sentinel', 'volunteer-soldier']
                    }
                });
            });

            it('should be able to retrieve ANY card from the deck', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.searchYourFeelings);
                expect(context.searchYourFeelings).toBeInZone('discard');

                expect(context.player1).toHaveExactDisplayPromptCards({
                    selectable: [context.battlefieldMarine, context.hanSolo, context.cellBlockGuard,
                        context.pykeSentinel, context.volunteerSoldier],
                });
                expect(context.player1).toHaveEnabledPromptButton('Take nothing');

                context.player1.clickCardInDisplayCardPrompt(context.battlefieldMarine);
                expect(context.battlefieldMarine).toBeInZone('hand');
                expect(context.player1.deck.length).toBe(4);
                expect(context.player2).toBeActivePlayer();
            });

            it('should be able to choose no cards', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.searchYourFeelings);
                expect(context.searchYourFeelings).toBeInZone('discard');

                expect(context.player1).toHaveExactDisplayPromptCards({
                    selectable: [context.battlefieldMarine, context.hanSolo, context.cellBlockGuard,
                        context.pykeSentinel, context.volunteerSoldier],
                });
                expect(context.player1).toHaveEnabledPromptButton('Take nothing');

                context.player1.clickPrompt('Take nothing');
                expect(context.player1.deck.length).toBe(5);
                expect(context.player2).toBeActivePlayer();
            });

            it('works with just one card in deck', function () {
                const { context } = contextRef;

                context.player1.setDeck([context.battlefieldMarine]);

                context.player1.clickCard(context.searchYourFeelings);
                expect(context.searchYourFeelings).toBeInZone('discard');
                expect(context.player1).toHaveExactDisplayPromptCards({
                    selectable: [context.battlefieldMarine],
                });
                expect(context.player1).toHaveEnabledPromptButton('Take nothing');

                context.player1.clickCardInDisplayCardPrompt(context.battlefieldMarine);
                expect(context.battlefieldMarine).toBeInZone('hand');
                expect(context.player2).toBeActivePlayer();
            });

            it('does not leak the drawn card\'s name to the chat log', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.searchYourFeelings);
                context.player1.clickCardInDisplayCardPrompt(context.battlefieldMarine);

                // The drawn card stays hidden — its name must not appear in the search-effect chat lines
                expect(context.getChatLogs(3).join('\n')).not.toContain('Battlefield Marine');
            });

            it('does nothing if deck is empty', function () {
                const { context } = contextRef;

                context.player1.setDeck([]);

                context.player1.clickCard(context.searchYourFeelings);
                context.player1.clickPrompt('Play anyway');
                expect(context.searchYourFeelings).toBeInZone('discard');

                expect(context.player2).toBeActivePlayer();
            });
        });

        describe('Search Your Feelings\' ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['search-your-feelings'],
                        deck: 30
                    }
                });
            });

            it('shuffles the deck', function () {
                const { context } = contextRef;

                const preShuffleDeck = context.player1.deck;

                expect(preShuffleDeck).toEqual(context.player1.deck);

                context.player1.clickCard(context.searchYourFeelings);
                expect(context.player1).toHaveEnabledPromptButton('Take nothing');
                context.player1.clickPrompt('Take nothing');

                expect(preShuffleDeck).not.toEqual(context.player1.deck);
            });
        });
    });
});
