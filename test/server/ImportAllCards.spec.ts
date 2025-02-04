/* eslint jasmine/missing-expect: off */
describe('Importing all cards', function() {
    integration(function (contextRef) {
        it('all cards can be successfully imported and instantiated from their json data', function() {
            const { deckBuilder, implementedCardsCtors, unimplementedCardCtor } = contextRef.buildImportAllCardsTools();

            const { context } = contextRef;

            const cardsToSkipImport = [
                '0026166404', // Palpatine leader
            ];

            for (const [cardId, cardData] of Object.entries(deckBuilder.cards)) {
                if (cardsToSkipImport.includes(cardId)) {
                    continue;
                }

                const cardCtor = implementedCardsCtors.get(cardId) ?? unimplementedCardCtor;

                // the test here is just to confirm that cards can be created without an exception happening
                const card = new cardCtor(context.player1Object, cardData);
            }
        });
    });
});
