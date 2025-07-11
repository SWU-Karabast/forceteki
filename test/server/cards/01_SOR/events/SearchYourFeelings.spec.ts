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

            const buildCardName = (card) => `${card.title}${card.subtitle ? ', ' + card.subtitle : ''}`;

            // TODO: uncomment these when we revert back to using the full display prompt for deck search
            // it('should be able to retrieve ANY card from the deck', function () {
            //     const { context } = contextRef;

            //     // Play card
            //     context.player1.clickCard(context.searchYourFeelings);
            //     expect(context.searchYourFeelings).toBeInZone('discard');

            //     expect(context.player1).toHaveExactDisplayPromptCards({
            //         selectable: [context.battlefieldMarine, context.cartelSpacer, context.cellBlockGuard,
            //             context.pykeSentinel, context.volunteerSoldier],
            //     });
            //     expect(context.player1).toHaveEnabledPromptButton('Take nothing');

            //     // Choose card
            //     context.player1.clickCardInDisplayCardPrompt(context.battlefieldMarine);
            //     expect(context.player2).toBeActivePlayer();
            //     expect(context.battlefieldMarine).toBeInZone('hand');
            //     expect(context.player1.deck.length).toBe(4);
            // });

            // it('should be able to choose no cards', function () {
            //     const { context } = contextRef;

            //     // Play card
            //     context.player1.clickCard(context.searchYourFeelings);
            //     expect(context.searchYourFeelings).toBeInZone('discard');

            //     expect(context.player1).toHaveExactDisplayPromptCards({
            //         selectable: [context.battlefieldMarine, context.cartelSpacer, context.cellBlockGuard,
            //             context.pykeSentinel, context.volunteerSoldier],
            //     });
            //     expect(context.player1).toHaveEnabledPromptButton('Take nothing');

            //     // Choose card
            //     context.player1.clickPrompt('Take nothing');
            //     expect(context.player2).toBeActivePlayer();
            //     expect(context.player1.deck.length).toBe(5);
            // });

            // it('works with just one card in deck', function () {
            //     const { context } = contextRef;

            //     // Set up deck
            //     context.player1.setDeck([context.battlefieldMarine]);

            //     // Play card
            //     context.player1.clickCard(context.searchYourFeelings);
            //     expect(context.searchYourFeelings).toBeInZone('discard');
            //     expect(context.player1).toHaveExactDisplayPromptCards({
            //         selectable: [context.battlefieldMarine],
            //     });
            //     expect(context.player1).toHaveEnabledPromptButton('Take nothing');

            //     // Choose card
            //     context.player1.clickCardInDisplayCardPrompt(context.battlefieldMarine);
            //     expect(context.player2).toBeActivePlayer();
            // });

            it('should be able to retrieve ANY card from the deck', function () {
                const { context } = contextRef;

                // Play card
                context.player1.clickCard(context.searchYourFeelings);

                expect(context.player1).toHaveExactDropdownListOptions([
                    context.battlefieldMarine,
                    context.hanSolo,
                    context.cellBlockGuard,
                    context.pykeSentinel,
                    context.volunteerSoldier
                ].map((card) => buildCardName(card)));
                // expect(context.player1).toHaveEnabledPromptButton('Take nothing');   // TODO: uncomment when this works again

                // Choose card
                context.player1.chooseListOption('Battlefield Marine');
                expect(context.getChatLogs(3).join('\n')).not.toContain('Battlefield Marine');
                expect(context.player2).toBeActivePlayer();
                expect(context.searchYourFeelings).toBeInZone('discard');
                expect(context.battlefieldMarine).toBeInZone('hand');
                expect(context.player1.deck.length).toBe(4);
            });

            // TODO: uncomment this when we either (a) add the ability to choose no cards in the dropdown list prompt,
            // or (b) revert back to using the full display prompt for deck search

            // it('should be able to choose no cards', function () {
            //     const { context } = contextRef;

            //     // Play card
            //     context.player1.clickCard(context.searchYourFeelings);

            //     expect(context.player1).toHaveExactDropdownListOptions([
            //         context.battlefieldMarine,
            //         context.cartelSpacer,
            //         context.cellBlockGuard,
            //         context.pykeSentinel,
            //         context.volunteerSoldier
            //     ].map((card) => buildCardName(card)));
            //     expect(context.player1).toHaveEnabledPromptButton('Take nothing');

            //     // Choose card
            //     context.player1.clickPrompt('Take nothing');
            //     expect(context.player2).toBeActivePlayer();
            //     expect(context.player1.deck.length).toBe(5);
            //     expect(context.searchYourFeelings).toBeInZone('discard');
            // });

            it('works with just one card in deck', function () {
                const { context } = contextRef;

                // Set up deck
                context.player1.setDeck([context.battlefieldMarine]);

                // Play card
                context.player1.clickCard(context.searchYourFeelings);

                // Battlefield Marine is automatically selected since it's the only card
                expect(context.getChatLogs(3).join('\n')).not.toContain('Battlefield Marine');
                expect(context.battlefieldMarine).toBeInZone('hand');
                expect(context.player2).toBeActivePlayer();
            });

            it('does nothing if deck is empty', function () {
                const { context } = contextRef;

                // Set up deck
                context.player1.setDeck([]);

                // Play card
                context.player1.clickCard(context.searchYourFeelings);
                context.player1.clickPrompt('Play anyway');
                expect(context.searchYourFeelings).toBeInZone('discard');

                // Nothing happens since there are no cards in deck
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

                // Sanity check for the comparison
                expect(preShuffleDeck).toEqual(context.player1.deck);

                // Take nothing (deck will still shuffle)
                context.player1.clickCard(context.searchYourFeelings);
                // expect(context.player1).toHaveEnabledPromptButton('Take nothing');   // TODO: uncomment when this works again

                expect(preShuffleDeck).not.toEqual(context.player1.deck);
            });
        });
    });
});
