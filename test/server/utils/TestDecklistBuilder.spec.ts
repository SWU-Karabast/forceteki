import { CardPool, SwuGameFormat } from '../../../server/game/core/Constants';
import { UnitTestCardDataGetter } from '../../../server/utils/cardData/UnitTestCardDataGetter';
import { DeckValidator } from '../../../server/utils/deck/DeckValidator';
import { buildTestDecklist } from '../../../server/utils/deck/TestDecklistBuilder';

/** Every format and card pool the client lets a player pick, for a lobby or for the queue. */
const offeredFormatsAndCardPools: [SwuGameFormat, CardPool][] = [
    [SwuGameFormat.Premier, CardPool.Current],
    [SwuGameFormat.Premier, CardPool.NextSet],
    [SwuGameFormat.Eternal, CardPool.Current],
    [SwuGameFormat.Eternal, CardPool.NextSet],
    [SwuGameFormat.Open, CardPool.Unlimited],
    [SwuGameFormat.Limited, CardPool.Current],
    [SwuGameFormat.Limited, CardPool.NextSet],
    [SwuGameFormat.Limited, CardPool.Unlimited],
    [SwuGameFormat.FauxSuns, CardPool.Unlimited],
];

describe('Test decklists', function () {
    let cardDataGetter: UnitTestCardDataGetter;
    let validator: DeckValidator;

    beforeAll(async function () {
        cardDataGetter = new UnitTestCardDataGetter('test/json');
        validator = await DeckValidator.createAsync(cardDataGetter);
    });

    for (const [format, cardPool] of offeredFormatsAndCardPools) {
        it(`are legal for ${format} with the ${cardPool} card pool`, function () {
            try {
                DeckValidator.getLegalSets(format, cardPool);
            } catch (error) {
                // e.g. Limited's next-set pool exists only while a mainline set is in preview
                pending(`the set catalog has no ${format}/${cardPool} card pool right now: ${error.message}`);
            }

            const decklist = buildTestDecklist(validator, { format, cardPool });

            expect(validator.validateSwuDbDeck(decklist, { format, cardPool })).toEqual({});
        });
    }

    it('use only implemented cards when the card pool has enough of them', function () {
        const decklist = buildTestDecklist(validator, { format: SwuGameFormat.Premier, cardPool: CardPool.Current });

        expect(validator.getUnimplementedCardsInDeck(decklist)).toEqual([]);
    });

    it('are refused for a card pool the format does not have', function () {
        expect(() => buildTestDecklist(validator, { format: SwuGameFormat.Premier, cardPool: CardPool.Unlimited })).toThrowError();
    });

    describe('candidates', function () {
        it('name each card once, under a single printing', function () {
            const { leaders, bases, deckCards } = validator.getDeckbuildingCandidates(SwuGameFormat.Open, CardPool.Unlimited);

            for (const setCodes of [leaders, bases, deckCards]) {
                const cardIds = setCodes.map((setCode) => cardDataGetter.setCodeMap.get(setCode));
                expect(cardIds).not.toContain(undefined);
                expect(new Set(cardIds).size).toBe(cardIds.length);
            }
        });

        it('put the cards whose abilities are implemented first', function () {
            const unimplementedCardIds = new Set(validator.getUnimplementedCards().map((card) => card.id));
            const { deckCards } = validator.getDeckbuildingCandidates(SwuGameFormat.Open, CardPool.Unlimited);

            const implemented = deckCards.map((setCode) => !unimplementedCardIds.has(cardDataGetter.setCodeMap.get(setCode)));
            const firstUnimplemented = implemented.indexOf(false);
            if (firstUnimplemented >= 0) {
                expect(implemented.slice(firstUnimplemented)).not.toContain(true);
            }
        });
    });
});
