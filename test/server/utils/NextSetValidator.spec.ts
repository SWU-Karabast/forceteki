import { CardPool, SwuGameFormat } from '../../../server/game/core/Constants';
import { DeckValidationFailureReason } from '../../../server/utils/deck/DeckInterfaces';
import type { IInternalCardEntry } from '../../../server/utils/deck/DeckInterfaces';
import { DeckValidator } from '../../../server/utils/deck/DeckValidator';
import { UnitTestCardDataGetter } from '../../../server/utils/cardData/UnitTestCardDataGetter';
import {
    buildValidationTestDeck,
    getDeckFiller,
    getFirstBase,
    getFirstCardInSet,
    getFirstLeader,
    getLegalSetCodes,
    RELEASED_SETS
} from './DeckValidatorTestUtils';

// The "NextSet" card pool previews the format's legal pool once the upcoming set releases.
// It applies to the constructed rotating formats (Premier, Eternal) and to Limited.
const PREMIER_SETS = getLegalSetCodes(SwuGameFormat.Premier, CardPool.Current);
const PREMIER_NEXT_SETS = getLegalSetCodes(SwuGameFormat.Premier, CardPool.NextSet);
const LIMITED_SETS = getLegalSetCodes(SwuGameFormat.Limited, CardPool.Current);
const LIMITED_NEXT_SETS = getLegalSetCodes(SwuGameFormat.Limited, CardPool.NextSet);

const ETERNAL_LEADER = 'luke-skywalker#faithful-friend'; // SOR — legal in Eternal
const ETERNAL_BASE = 'kestro-city';                      // SOR — legal in Eternal

describe('NextSet card pool validation', function () {
    let validator: DeckValidator;
    let cardDataGetter: UnitTestCardDataGetter;

    beforeAll(async function () {
        cardDataGetter = new UnitTestCardDataGetter('test/json');
        validator = await DeckValidator.createAsync(cardDataGetter);
    });

    describe('Premier', function () {
        let leader: string;
        let base: string;

        beforeAll(function () {
            leader = getFirstLeader(cardDataGetter, PREMIER_SETS).internalName;
            base = getFirstBase(cardDataGetter, PREMIER_SETS).internalName;
        });

        function nextSetProps() {
            return { format: SwuGameFormat.Premier, cardPool: CardPool.NextSet };
        }

        function buildDeck(deckCards: IInternalCardEntry[], overrides = {}) {
            return buildValidationTestDeck(cardDataGetter, leader, base, deckCards, overrides);
        }

        it('should accept an unreleased (ASH) card, which becomes legal in the NextSet pool', function () {
            const filler = getDeckFiller(cardDataGetter, 49, PREMIER_SETS);
            const ashCard = getFirstCardInSet(cardDataGetter, 'ASH');
            const deck = buildDeck([...filler, ashCard]);
            const failures = validator.validateInternalDeck(deck, nextSetProps());
            expect(failures[DeckValidationFailureReason.IllegalInFormat]).toBeUndefined();
        });

        it('should not enforce the sideboard size cap', function () {
            const all = getDeckFiller(cardDataGetter, 61, PREMIER_NEXT_SETS);
            const deck = buildDeck(all.slice(0, 50), { sideboard: all.slice(50, 61) });
            const failures = validator.validateInternalDeck(deck, nextSetProps());
            expect(failures[DeckValidationFailureReason.MaxSideboardSizeExceeded]).toBeUndefined();
        });
    });

    describe('Eternal', function () {
        function nextSetProps() {
            return { format: SwuGameFormat.Eternal, cardPool: CardPool.NextSet };
        }

        function buildDeck(deckCards: IInternalCardEntry[], overrides = {}) {
            return buildValidationTestDeck(cardDataGetter, ETERNAL_LEADER, ETERNAL_BASE, deckCards, overrides);
        }

        it('should accept an unreleased (ASH) card, which becomes legal in the NextSet pool', function () {
            const filler = getDeckFiller(cardDataGetter, 49, RELEASED_SETS);
            const ashCard = getFirstCardInSet(cardDataGetter, 'ASH');
            const deck = buildDeck([...filler, ashCard]);
            const failures = validator.validateInternalDeck(deck, nextSetProps());
            expect(failures[DeckValidationFailureReason.IllegalInFormat]).toBeUndefined();
        });

        it('should not enforce the sideboard size cap', function () {
            const all = getDeckFiller(cardDataGetter, 61, RELEASED_SETS);
            const deck = buildDeck(all.slice(0, 50), { sideboard: all.slice(50, 61) });
            const failures = validator.validateInternalDeck(deck, nextSetProps());
            expect(failures[DeckValidationFailureReason.MaxSideboardSizeExceeded]).toBeUndefined();
        });
    });

    describe('Limited', function () {
        function nextSetProps() {
            return { format: SwuGameFormat.Limited, cardPool: CardPool.NextSet };
        }

        it('should accept a deck built entirely from the upcoming set', function () {
            const nextLeader = getFirstLeader(cardDataGetter, LIMITED_NEXT_SETS).internalName;
            const nextBase = getFirstBase(cardDataGetter, LIMITED_NEXT_SETS).internalName;
            const deck = buildValidationTestDeck(cardDataGetter, nextLeader, nextBase, getDeckFiller(cardDataGetter, 30, LIMITED_NEXT_SETS));
            const failures = validator.validateInternalDeck(deck, nextSetProps());
            expect(Object.keys(failures).length).toBe(0);
        });

        it('should reject a card from the latest released set', function () {
            const nextLeader = getFirstLeader(cardDataGetter, LIMITED_NEXT_SETS).internalName;
            const nextBase = getFirstBase(cardDataGetter, LIMITED_NEXT_SETS).internalName;
            const filler = getDeckFiller(cardDataGetter, 29, LIMITED_NEXT_SETS);
            const currentSetCard = getDeckFiller(cardDataGetter, 1, LIMITED_SETS)[0];
            const deck = buildValidationTestDeck(cardDataGetter, nextLeader, nextBase, [...filler, currentSetCard]);
            const failures = validator.validateInternalDeck(deck, nextSetProps());
            expect(failures[DeckValidationFailureReason.IllegalInFormat]).toBeDefined();
        });
    });
});
