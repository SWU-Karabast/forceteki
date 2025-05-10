/**
 * This test is here to validate that all mocked cards can be legally instantiated from their json card data.
 */

/* eslint jasmine/missing-expect: off */
describe('Importing all cards', function() {
    integration(function (contextRef) {
        it('all cards can be successfully imported and instantiated from their json data', function() {
            const { deckBuilder, implementedCardsCtors, unimplementedCardCtor } = contextRef.buildImportAllCardsTools();

            const { context } = contextRef;

            // eslint-disable-next-line @typescript-eslint/no-require-imports
            const cardsToImport = require('../json/_mockCardNames.json');

            for (const cardId of cardsToImport) {
                const cardData = deckBuilder.cards.get(cardId);

                if (!cardData) {
                    throw new Error(`Card data for ${cardId} not found`);
                }

                const cardCtor = implementedCardsCtors.get(cardId) ?? unimplementedCardCtor;

                // the test here is just to confirm that cards can be created without an exception happening
                const card = new cardCtor(context.player1Object, cardData);
            }
        });
    });
});
