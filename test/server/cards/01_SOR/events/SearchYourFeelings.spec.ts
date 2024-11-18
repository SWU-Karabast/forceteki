describe('Search Your Feelings', function() {
    integration(function(contextRef) {
        describe('Search Your Feelings\' ability', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['search-your-feelings'],
                        deck: ['battlefield-marine', 'cartel-spacer', 'cell-block-guard', 'pyke-sentinel', 'volunteer-soldier']
                    }
                });
            });

            it('should be able to retrieve ANY card from the deck', function () {
                const { context } = contextRef;

                // Play card
                context.player1.clickCard(context.searchYourFeelings);
                expect(context.searchYourFeelings).toBeInZone('discard');
                expect(context.player1).toHaveEnabledPromptButtons([context.battlefieldMarine, context.cartelSpacer.title, context.cellBlockGuard.title,
                    context.pykeSentinel.title, context.volunteerSoldier.title, 'Take nothing']);

                // Choose card
                context.player1.clickPrompt(context.battlefieldMarine.title);
                expect(context.player2).toBeActivePlayer();
                expect(context.battlefieldMarine).toBeInZone('hand');
                expect(context.player1.deck.length).toBe(4);
            });

            it('should be able to choose no cards', function () {
                const { context } = contextRef;

                // Play card
                context.player1.clickCard(context.searchYourFeelings);
                expect(context.searchYourFeelings).toBeInZone('discard');
                expect(context.player1).toHaveEnabledPromptButtons([context.battlefieldMarine, context.cartelSpacer.title, context.cellBlockGuard.title,
                    context.pykeSentinel.title, context.volunteerSoldier.title, 'Take nothing']);

                // Choose card
                context.player1.clickPrompt('Take nothing');
                expect(context.player2).toBeActivePlayer();
                expect(context.player1.deck.length).toBe(5);
            });

            it('works with just one card in deck', function () {
                const { context } = contextRef;

                // Set up deck
                context.player1.setDeck([context.battlefieldMarine]);

                // Play card
                context.player1.clickCard(context.searchYourFeelings);
                expect(context.searchYourFeelings).toBeInZone('discard');
                expect(context.player1).toHaveEnabledPromptButtons([context.battlefieldMarine, 'Take nothing']);

                // Choose card
                context.player1.clickPrompt(context.battlefieldMarine.title);
                expect(context.player2).toBeActivePlayer();
            });

            it('does nothing if deck is empty', function () {
                const { context } = contextRef;

                // Set up deck
                context.player1.setDeck([]);

                // Play card
                context.player1.clickCard(context.searchYourFeelings);
                expect(context.searchYourFeelings).toBeInZone('discard');

                // Nothing happens since there are no cards in deck
                expect(context.player2).toBeActivePlayer();
            });
        });

        describe('Search Your Feelings\' ability', function() {
            beforeEach(function () {
                contextRef.setupTest({
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

                // Sanity check for the comparison
                expect(preShuffleDeck).toEqual(context.player1.deck);

                // Take nothing (deck will still shuffle)
                context.player1.clickCard(context.searchYourFeelings);
                context.player1.clickPrompt('Take nothing');

                expect(preShuffleDeck).not.toEqual(context.player1.deck);
            });
        });
    });
});
