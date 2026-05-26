import { UnitTestCardDataGetter } from '../../../../server/utils/cardData/UnitTestCardDataGetter';
import { MeleeDeckParseError, MeleeDeckParser } from '../../../../server/utils/deck/MeleeDeckParser';

describe('MeleeDeckParser', function () {
    const cardDataGetter = new UnitTestCardDataGetter('test/json');
    const parser = new MeleeDeckParser(cardDataGetter);

    it('parses Melee deck sections into a decklist', function () {
        const deck = parser.parse(`
            MainDeck
            2 Millennium Falcon | Piece of Junk
            3 Battlefield Marine

            Leader
            1 Quinlan Vos | Sticking the Landing

            Base
            1 Energy Conversion Lab

            Sideboard
            2 Timely Reinforcements
        `);

        expect(deck.leader.id).toBe('TWI_018');
        expect(deck.base.id).toBe('SOR_022');
        expect(deck.deck).toContain({ id: 'SOR_193', count: 2 });
        expect(deck.sideboard).toContain({ id: 'JTL_130', count: 2 });
    });

    it('rejects unknown card names', function () {
        expect(() => parser.parse(`
            MainDeck
            1 Not A Real Card

            Leader
            1 Quinlan Vos | Sticking the Landing

            Base
            1 Energy Conversion Lab
        `)).toThrowError(MeleeDeckParseError, 'Unknown Melee card name: Not A Real Card');
    });
});
