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

const PREMIER_SETS = getLegalSetCodes(SwuGameFormat.Premier, CardPool.Current);

describe('Premier deck validation', function () {
    let validator: DeckValidator;
    let cardDataGetter: UnitTestCardDataGetter;
    let leader: string;
    let base: string;

    beforeAll(async function () {
        cardDataGetter = new UnitTestCardDataGetter('test/json');
        validator = await DeckValidator.createAsync(cardDataGetter);
        leader = getFirstLeader(cardDataGetter, PREMIER_SETS).internalName;
        base = getFirstBase(cardDataGetter, PREMIER_SETS).internalName;
    });

    function premierProps() {
        return { format: SwuGameFormat.Premier, cardPool: CardPool.Current };
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
                deck: getDeckFiller(cardDataGetter, 50, PREMIER_SETS)
            };
            const failures = validator.validateSwuDbDeck(deck, premierProps());
            expect(failures[DeckValidationFailureReason.TooManyLeaders]).toBe(true);
        });
    });

    describe('deck size', function () {
        it('should accept a valid deck with 50 Premier-legal cards', function () {
            const deck = buildDeck(getDeckFiller(cardDataGetter, 50, PREMIER_SETS));
            const failures = validator.validateInternalDeck(deck, premierProps());
            expect(Object.keys(failures).length).toBe(0);
        });

        it('should reject a deck with fewer than 50 cards', function () {
            const deck = buildDeck(getDeckFiller(cardDataGetter, 49, PREMIER_SETS));
            const failures = validator.validateInternalDeck(deck, premierProps());
            expect(failures[DeckValidationFailureReason.MinDecklistSizeNotMet]).toBeDefined();
            expect(failures[DeckValidationFailureReason.MinDecklistSizeNotMet].actualDecklistSize).toBe(49);
        });

        it('should reject a deck where the mainboard is short even if the sideboard brings the total to 50', function () {
            const all = getDeckFiller(cardDataGetter, 50, PREMIER_SETS);
            const deck = buildDeck(all.slice(0, 49), { sideboard: [all[49]] });
            const failures = validator.validateInternalDeck(deck, premierProps());
            expect(failures[DeckValidationFailureReason.MinDecklistSizeNotMet]).toBeUndefined();
            expect(failures[DeckValidationFailureReason.MinMainboardSizeNotMet]).toBeDefined();
            expect(failures[DeckValidationFailureReason.MinMainboardSizeNotMet].actualBoardedSize).toBe(49);
        });
    });

    describe('copy limits', function () {
        it('should allow up to 3 copies of a card', function () {
            const filler = getDeckFiller(cardDataGetter, 48, PREMIER_SETS);
            const tripleCard: IInternalCardEntry = { ...filler[0], count: 3 };
            const deck = buildDeck([tripleCard, ...filler.slice(1)]);
            const failures = validator.validateInternalDeck(deck, premierProps());
            expect(failures[DeckValidationFailureReason.TooManyCopiesOfCard]).toBeUndefined();
        });

        it('should reject 4 copies of a card', function () {
            const filler = getDeckFiller(cardDataGetter, 48, PREMIER_SETS);
            const quadCard: IInternalCardEntry = { ...filler[0], count: 4 };
            const deck = buildDeck([quadCard, ...filler.slice(1)]);
            const failures = validator.validateInternalDeck(deck, premierProps());
            expect(failures[DeckValidationFailureReason.TooManyCopiesOfCard]).toBeDefined();
        });
    });

    describe('sideboard', function () {
        it('should allow a sideboard of fewer than 10 cards', function () {
            const all = getDeckFiller(cardDataGetter, 55, PREMIER_SETS);
            const deck = buildDeck(all.slice(0, 50), { sideboard: all.slice(50, 55) });
            const failures = validator.validateInternalDeck(deck, premierProps());
            expect(failures[DeckValidationFailureReason.MaxSideboardSizeExceeded]).toBeUndefined();
        });

        it('should allow a sideboard of up to 10 cards', function () {
            const all = getDeckFiller(cardDataGetter, 60, PREMIER_SETS);
            const deck = buildDeck(all.slice(0, 50), { sideboard: all.slice(50, 60) });
            const failures = validator.validateInternalDeck(deck, premierProps());
            expect(failures[DeckValidationFailureReason.MaxSideboardSizeExceeded]).toBeUndefined();
        });

        it('should reject a sideboard of more than 10 cards', function () {
            const all = getDeckFiller(cardDataGetter, 61, PREMIER_SETS);
            const deck = buildDeck(all.slice(0, 50), { sideboard: all.slice(50, 61) });
            const failures = validator.validateInternalDeck(deck, premierProps());
            expect(failures[DeckValidationFailureReason.MaxSideboardSizeExceeded]).toBeDefined();
            expect(failures[DeckValidationFailureReason.MaxSideboardSizeExceeded].actualSideboardSize).toBe(11);
        });
    });

    describe('format legality', function () {
        it('should reject a card from outside the current rotation (SOR)', function () {
            const filler = getDeckFiller(cardDataGetter, 49, PREMIER_SETS);
            const sorCard = getFirstCardInSet(cardDataGetter, 'SOR');
            const deck = buildDeck([...filler, sorCard]);
            const failures = validator.validateInternalDeck(deck, premierProps());
            expect(failures[DeckValidationFailureReason.IllegalInFormat]).toBeDefined();
            expect(failures[DeckValidationFailureReason.IllegalInFormat][0].reason).toBe(IllegalInFormatReason.RotatedOut);
        });

        it('should reject a rotated-out base in the base slot', function () {
            const filler = getDeckFiller(cardDataGetter, 50, PREMIER_SETS);
            const deck = buildDeck(filler, { base: buildCardEntry(cardDataGetter, 'echo-base') }); // If Echo Base is ever reprinted, we will need to change this
            const failures = validator.validateInternalDeck(deck, premierProps());
            expect(failures[DeckValidationFailureReason.IllegalInFormat]).toBeDefined();
            expect(failures[DeckValidationFailureReason.IllegalInFormat][0].reason).toBe(IllegalInFormatReason.RotatedOut);
        });

        it('should reject a card from a non-rotating set that is not Premier-legal (TS26)', function () {
            const filler = getDeckFiller(cardDataGetter, 49, PREMIER_SETS);
            const ts26Card = getFirstCardInSet(cardDataGetter, 'TS26');
            const deck = buildDeck([...filler, ts26Card]);
            const failures = validator.validateInternalDeck(deck, premierProps());
            expect(failures[DeckValidationFailureReason.IllegalInFormat]).toBeDefined();
            expect(failures[DeckValidationFailureReason.IllegalInFormat].length).toBeGreaterThan(0);
        });

        // TODO: this will need to be removed when we mark ASH as released
        it('should reject an unreleased (ASH) card with the Current card pool', function () {
            const filler = getDeckFiller(cardDataGetter, 49, PREMIER_SETS);
            const ashCard = getFirstCardInSet(cardDataGetter, 'ASH');
            const deck = buildDeck([...filler, ashCard]);
            const failures = validator.validateInternalDeck(deck, premierProps());
            expect(failures[DeckValidationFailureReason.IllegalInFormat]).toBeDefined();
            expect(failures[DeckValidationFailureReason.IllegalInFormat][0].reason).toBe(IllegalInFormatReason.Preview);
        });

        it('should reject a sideboard containing a card from outside the current rotation', function () {
            const filler = getDeckFiller(cardDataGetter, 50, PREMIER_SETS);
            const sorCard = getFirstCardInSet(cardDataGetter, 'SOR');
            const deck = buildDeck(filler, { sideboard: [sorCard] });
            const failures = validator.validateInternalDeck(deck, premierProps());
            expect(failures[DeckValidationFailureReason.IllegalInFormat]).toBeDefined();
            expect(failures[DeckValidationFailureReason.IllegalInFormat][0].reason).toBe(IllegalInFormatReason.RotatedOut);
        });
    });
});
