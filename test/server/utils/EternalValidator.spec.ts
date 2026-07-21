import { CardPool, SwuGameFormat } from '../../../server/game/core/Constants';
import { DeckValidationFailureReason } from '../../../server/utils/deck/DeckInterfaces';
import type { IInternalCardEntry, ISwuDbFormatDecklist } from '../../../server/utils/deck/DeckInterfaces';
import { DeckValidator } from '../../../server/utils/deck/DeckValidator';
import { UnitTestCardDataGetter } from '../../../server/utils/cardData/UnitTestCardDataGetter';
import {
    buildCardEntry,
    buildValidationTestDeck,
    createPreviewValidatorSetup,
    getDeckFiller,
    RELEASED_SETS
} from './DeckValidatorTestUtils';
import { registerCommonDeckRuleTests } from './CommonDeckRuleTests';

const LEADER = 'luke-skywalker#faithful-friend'; // SOR — legal in Eternal
const BASE = 'kestro-city';                      // SOR — legal in Eternal

describe('Eternal deck validation', function () {
    let validator: DeckValidator;
    let cardDataGetter: UnitTestCardDataGetter;

    beforeAll(async function () {
        ({ validator, cardDataGetter } = await createPreviewValidatorSetup());
    });

    function eternalProps() {
        return { format: SwuGameFormat.Eternal, cardPool: CardPool.Current };
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
            const failures = validator.validateSwuDbDeck(deck, eternalProps());
            expect(failures[DeckValidationFailureReason.TooManyLeaders]).toBe(true);
        });
    });

    registerCommonDeckRuleTests(() => ({ validator, cardDataGetter, leader: LEADER, base: BASE }), {
        format: SwuGameFormat.Eternal,
        cardPool: CardPool.Current,
        legalSets: RELEASED_SETS,
    });

    describe('NextSet card pool', function () {
        function nextSetProps() {
            return { format: SwuGameFormat.Eternal, cardPool: CardPool.NextSet };
        }

        it('should not enforce the sideboard size cap', function () {
            const all = getDeckFiller(cardDataGetter, 61, RELEASED_SETS);
            const deck = buildDeck(all.slice(0, 50), { sideboard: all.slice(50, 61) });
            const failures = validator.validateInternalDeck(deck, nextSetProps());
            expect(failures[DeckValidationFailureReason.MaxSideboardSizeExceeded]).toBeUndefined();
        });
    });
});
