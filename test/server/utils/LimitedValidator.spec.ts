import { CardPool, SwuGameFormat } from '../../../server/game/core/Constants';
import { DeckValidationFailureReason, IllegalInFormatReason } from '../../../server/utils/deck/DeckInterfaces';
import type { IInternalCardEntry, ISwuDbFormatDecklist } from '../../../server/utils/deck/DeckInterfaces';
import { DeckValidator } from '../../../server/utils/deck/DeckValidator';
import { UnitTestCardDataGetter } from '../../../server/utils/cardData/UnitTestCardDataGetter';
import {
    buildCardEntry,
    buildValidationTestDeck,
    getDeckFiller,
    getFirstBase,
    getFirstCardInSet,
    getFirstLeader,
    getLegalSetCodes
} from './DeckValidatorTestUtils';

const LIMITED_SETS = getLegalSetCodes(SwuGameFormat.Limited, CardPool.Current);

// Under the Unlimited card pool, all mainline sets are legal, so a SOR leader/base is valid.
const UNLIMITED_LEADER = 'luke-skywalker#faithful-friend';
const UNLIMITED_BASE = 'kestro-city';

describe('Limited deck validation', function () {
    let validator: DeckValidator;
    let cardDataGetter: UnitTestCardDataGetter;
    let leader: string;
    let base: string;

    beforeAll(async function () {
        cardDataGetter = new UnitTestCardDataGetter('test/json');
        validator = await DeckValidator.createAsync(cardDataGetter);
        leader = getFirstLeader(cardDataGetter, LIMITED_SETS).internalName;
        base = getFirstBase(cardDataGetter, LIMITED_SETS).internalName;
    });

    function limitedProps(cardPool: CardPool = CardPool.Current) {
        return { format: SwuGameFormat.Limited, cardPool };
    }

    function buildDeck(deckCards: IInternalCardEntry[], overrides = {}) {
        return buildValidationTestDeck(cardDataGetter, leader, base, deckCards, overrides);
    }

    describe('deck structure', function () {
        it('should reject a SWUDB deck with a second leader', function () {
            const deck: ISwuDbFormatDecklist = {
                metadata: { name: 'Test Deck', author: 'Test Author' },
                leader: buildCardEntry(cardDataGetter, leader),
                secondleader: buildCardEntry(cardDataGetter, leader),
                base: buildCardEntry(cardDataGetter, base),
                deck: getDeckFiller(cardDataGetter, 30, LIMITED_SETS)
            };
            const failures = validator.validateSwuDbDeck(deck, limitedProps());
            expect(failures[DeckValidationFailureReason.TooManyLeaders]).toBe(true);
        });
    });

    describe('deck size', function () {
        // 30 is a minimum, not an exact size.
        it('should accept a valid deck with exactly 30 cards', function () {
            const deck = buildDeck(getDeckFiller(cardDataGetter, 30, LIMITED_SETS));
            const failures = validator.validateInternalDeck(deck, limitedProps());
            expect(Object.keys(failures).length).toBe(0);
        });

        it('should accept a deck with more than 30 cards', function () {
            const deck = buildDeck(getDeckFiller(cardDataGetter, 35, LIMITED_SETS));
            const failures = validator.validateInternalDeck(deck, limitedProps());
            expect(Object.keys(failures).length).toBe(0);
        });

        it('should reject a deck with fewer than 30 cards', function () {
            const deck = buildDeck(getDeckFiller(cardDataGetter, 29, LIMITED_SETS));
            const failures = validator.validateInternalDeck(deck, limitedProps());
            expect(failures[DeckValidationFailureReason.MinDecklistSizeNotMet]).toBeDefined();
            expect(failures[DeckValidationFailureReason.MinDecklistSizeNotMet].actualDecklistSize).toBe(29);
        });
    });

    describe('copy limits', function () {
        // Limited has no per-card copy limit.
        it('should allow more than 3 copies of a card', function () {
            const filler = getDeckFiller(cardDataGetter, 29, LIMITED_SETS);
            const quadCard: IInternalCardEntry = { ...filler[0], count: 4 };
            const deck = buildDeck([quadCard, ...filler.slice(1)]);
            const failures = validator.validateInternalDeck(deck, limitedProps());
            expect(failures[DeckValidationFailureReason.TooManyCopiesOfCard]).toBeUndefined();
        });
    });

    describe('sideboard', function () {
        // Limited has no sideboard cap.
        it('should allow a sideboard larger than 10 cards', function () {
            const all = getDeckFiller(cardDataGetter, 45, LIMITED_SETS);
            const deck = buildDeck(all.slice(0, 30), { sideboard: all.slice(30, 45) });
            const failures = validator.validateInternalDeck(deck, limitedProps());
            expect(failures[DeckValidationFailureReason.MaxSideboardSizeExceeded]).toBeUndefined();
        });
    });

    describe('Current card pool', function () {
        it('should reject a card from outside the latest released set (SOR)', function () {
            const filler = getDeckFiller(cardDataGetter, 29, LIMITED_SETS);
            const sorCard = getFirstCardInSet(cardDataGetter, 'SOR');
            const deck = buildDeck([...filler, sorCard]);
            const failures = validator.validateInternalDeck(deck, limitedProps());
            expect(failures[DeckValidationFailureReason.IllegalInFormat]).toBeDefined();
            expect(failures[DeckValidationFailureReason.IllegalInFormat][0].reason).toBe(IllegalInFormatReason.RotatedOut);
        });
    });

    describe('Unlimited card pool', function () {
        it('should accept cards from multiple mainline sets', function () {
            const sorFiller = getDeckFiller(cardDataGetter, 15, new Set(['SOR']));
            const currentSetFiller = getDeckFiller(cardDataGetter, 15, LIMITED_SETS);
            const deck = buildValidationTestDeck(cardDataGetter, UNLIMITED_LEADER, UNLIMITED_BASE, [...sorFiller, ...currentSetFiller]);
            const failures = validator.validateInternalDeck(deck, limitedProps(CardPool.Unlimited));
            expect(Object.keys(failures).length).toBe(0);
        });
    });
});
