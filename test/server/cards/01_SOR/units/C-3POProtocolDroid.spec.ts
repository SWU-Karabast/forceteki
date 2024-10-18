describe('C-3PO, Protocol Droid', function() {
    integration(function(contextRef) {
        describe('C-3PO\'s ability', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['c3po#protocol-droid'],
                        deck: ['wampa', 'atst', 'atst', 'atst'],
                    }
                });
            });

            it('should prompt to choose a Rebel from the top 5 cards, reveal it, draw it, and move the rest to the bottom of the deck', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.c3po);
                expect(context.player1).toHavePrompt('Select a card to reveal');

                // should have prompt options from 0 to 20
                expect(context.player1).toHaveExactListOptions(Array.from({ length: 21 }, (x, i) => `${i}`));
            });
        });
    });
});
