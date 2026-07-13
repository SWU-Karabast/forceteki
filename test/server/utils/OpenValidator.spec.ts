import { CardPool, SwuGameFormat } from '../../../server/game/core/Constants';
import { DeckValidationFailureReason } from '../../../server/utils/deck/DeckInterfaces';
import type { IInternalCardEntry, ISwuDbFormatDecklist } from '../../../server/utils/deck/DeckInterfaces';
import { DeckValidator } from '../../../server/utils/deck/DeckValidator';
import { UnitTestCardDataGetter } from '../../../server/utils/cardData/UnitTestCardDataGetter';
import { formatRules } from '../../../server/utils/deck/SwuSetData';
import {
    buildCardEntry,
    buildValidationTestDeck,
    getDeckFiller,
    RELEASED_SETS
} from './DeckValidatorTestUtils';
import { registerCommonDeckRuleTests } from './CommonDeckRuleTests';

const LEADER = 'luke-skywalker#faithful-friend'; // SOR — legal in Open
const BASE = 'kestro-city';                      // SOR — legal in Open

// Cards on the Eternal ban list, used to confirm Open enforces no ban list of its own.
const ETERNAL_BANNED_CARDS = [...formatRules.get(SwuGameFormat.Eternal).bannedCards.values()];

describe('Open deck validation', function () {
    let validator: DeckValidator;
    let cardDataGetter: UnitTestCardDataGetter;

    beforeAll(async function () {
        cardDataGetter = new UnitTestCardDataGetter('test/json');
        validator = await DeckValidator.createAsync(cardDataGetter);
    });

    function openProps() {
        return { format: SwuGameFormat.Open, cardPool: CardPool.Current };
    }

    function buildDeck(deckCards: IInternalCardEntry[], overrides = {}) {
        return buildValidationTestDeck(cardDataGetter, LEADER, BASE, deckCards, overrides);
    }

    describe('deck structure', function () {
        it('should reject a SWUDB deck with a second leader', function () {
            const deck: ISwuDbFormatDecklist = {
                metadata: { name: 'Test Deck', author: 'Test Author' },
                leader: buildCardEntry(cardDataGetter, LEADER),
                secondleader: buildCardEntry(cardDataGetter, LEADER),
                base: buildCardEntry(cardDataGetter, BASE),
                deck: getDeckFiller(cardDataGetter, 50)
            };
            const failures = validator.validateSwuDbDeck(deck, openProps());
            expect(failures[DeckValidationFailureReason.TooManyLeaders]).toBe(true);
        });
    });

    registerCommonDeckRuleTests(() => ({ validator, cardDataGetter, leader: LEADER, base: BASE }), {
        format: SwuGameFormat.Open,
        cardPool: CardPool.Current,
        legalSets: RELEASED_SETS,
    });

    describe('ban list', function () {
        it('should not enforce any ban list (cards banned in other formats are legal in Open)', function () {
            const bannedEntries = ETERNAL_BANNED_CARDS.map((name) => buildCardEntry(cardDataGetter, name));
            const filler = getDeckFiller(cardDataGetter, 50 - bannedEntries.length);
            const deck = buildDeck([...filler, ...bannedEntries]);
            const failures = validator.validateInternalDeck(deck, openProps());
            expect(failures[DeckValidationFailureReason.IllegalInFormat]).toBeUndefined();
        });
    });
});
