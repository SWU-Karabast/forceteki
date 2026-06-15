import { CardPool, SwuGameFormat } from '../../../server/game/core/Constants';
import { DeckValidationFailureReason, IllegalInFormatReason } from '../../../server/utils/deck/DeckInterfaces';
import type { IInternalCardEntry, ISwuDbFormatDecklist } from '../../../server/utils/deck/DeckInterfaces';
import { DeckValidator } from '../../../server/utils/deck/DeckValidator';
import { UnitTestCardDataGetter } from '../../../server/utils/cardData/UnitTestCardDataGetter';
import { formatRules } from '../../../server/utils/deck/SwuSetData';
import {
    buildCardEntry,
    buildValidationTestDeck,
    getDeckFiller,
    getFirstCardInSet,
    RELEASED_SETS
} from './DeckValidatorTestUtils';

// Derive banned card internal names directly from the format rules so this stays in sync automatically.
const eternalBannedCards = [...formatRules.get(SwuGameFormat.Eternal).bannedCards.values()];

const LEADER = 'luke-skywalker#faithful-friend'; // SOR — legal in Eternal
const BASE = 'kestro-city';                      // SOR — legal in Eternal

describe('Eternal deck validation', function () {
    let validator: DeckValidator;
    let cardDataGetter: UnitTestCardDataGetter;

    beforeAll(async function () {
        cardDataGetter = new UnitTestCardDataGetter('test/json');
        validator = await DeckValidator.createAsync(cardDataGetter);
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

    describe('deck size', function () {
        it('should accept a valid deck with 50 released cards', function () {
            const deck = buildDeck(getDeckFiller(cardDataGetter, 50));
            const failures = validator.validateInternalDeck(deck, eternalProps());
            expect(Object.keys(failures).length).toBe(0);
        });

        it('should reject a deck with fewer than 50 cards', function () {
            const deck = buildDeck(getDeckFiller(cardDataGetter, 49));
            const failures = validator.validateInternalDeck(deck, eternalProps());
            expect(failures[DeckValidationFailureReason.MinDecklistSizeNotMet]).toBeDefined();
            expect(failures[DeckValidationFailureReason.MinDecklistSizeNotMet].actualDecklistSize).toBe(49);
        });

        it('should reject a deck where the mainboard is short even if the sideboard brings the total to 50', function () {
            const all = getDeckFiller(cardDataGetter, 50);
            const deck = buildDeck(all.slice(0, 49), { sideboard: [all[49]] });
            const failures = validator.validateInternalDeck(deck, eternalProps());
            expect(failures[DeckValidationFailureReason.MinDecklistSizeNotMet]).toBeUndefined();
            expect(failures[DeckValidationFailureReason.MinMainboardSizeNotMet]).toBeDefined();
            expect(failures[DeckValidationFailureReason.MinMainboardSizeNotMet].actualBoardedSize).toBe(49);
        });
    });

    describe('copy limits', function () {
        it('should allow up to 3 copies of a card', function () {
            const filler = getDeckFiller(cardDataGetter, 48);
            const tripleCard: IInternalCardEntry = { ...filler[0], count: 3 };
            const deck = buildDeck([tripleCard, ...filler.slice(1)]);
            const failures = validator.validateInternalDeck(deck, eternalProps());
            expect(failures[DeckValidationFailureReason.TooManyCopiesOfCard]).toBeUndefined();
        });

        it('should reject 4 copies of a card', function () {
            const filler = getDeckFiller(cardDataGetter, 48);
            const quadCard: IInternalCardEntry = { ...filler[0], count: 4 };
            const deck = buildDeck([quadCard, ...filler.slice(1)]);
            const failures = validator.validateInternalDeck(deck, eternalProps());
            expect(failures[DeckValidationFailureReason.TooManyCopiesOfCard]).toBeDefined();
        });
    });

    describe('sideboard', function () {
        it('should allow a sideboard of fewer than 10 cards', function () {
            const all = getDeckFiller(cardDataGetter, 55);
            const deck = buildDeck(all.slice(0, 50), { sideboard: all.slice(50, 55) });
            const failures = validator.validateInternalDeck(deck, eternalProps());
            expect(failures[DeckValidationFailureReason.MaxSideboardSizeExceeded]).toBeUndefined();
        });

        it('should allow a sideboard of up to 10 cards', function () {
            const all = getDeckFiller(cardDataGetter, 60);
            const deck = buildDeck(all.slice(0, 50), { sideboard: all.slice(50, 60) });
            const failures = validator.validateInternalDeck(deck, eternalProps());
            expect(failures[DeckValidationFailureReason.MaxSideboardSizeExceeded]).toBeUndefined();
        });

        it('should reject a sideboard of more than 10 cards', function () {
            const all = getDeckFiller(cardDataGetter, 61);
            const deck = buildDeck(all.slice(0, 50), { sideboard: all.slice(50, 61) });
            const failures = validator.validateInternalDeck(deck, eternalProps());
            expect(failures[DeckValidationFailureReason.MaxSideboardSizeExceeded]).toBeDefined();
            expect(failures[DeckValidationFailureReason.MaxSideboardSizeExceeded].actualSideboardSize).toBe(11);
        });
    });

    describe('ban list', function () {
        for (const bannedCard of eternalBannedCards) {
            it(`should reject ${bannedCard}`, function () {
                const filler = getDeckFiller(cardDataGetter, 49);
                const deck = buildDeck([...filler, buildCardEntry(cardDataGetter, bannedCard)]);
                const failures = validator.validateInternalDeck(deck, eternalProps());
                expect(failures[DeckValidationFailureReason.IllegalInFormat]).toBeDefined();
                expect(failures[DeckValidationFailureReason.IllegalInFormat][0].reason).toBe(IllegalInFormatReason.Suspended);
            });
        }
    });

    describe('format legality', function () {
        it('should accept cards from all released sets (no rotation lock)', function () {
            const sorFiller = getDeckFiller(cardDataGetter, 50, new Set(['SOR']));
            const deck = buildDeck(sorFiller);
            const failures = validator.validateInternalDeck(deck, eternalProps());
            expect(failures[DeckValidationFailureReason.IllegalInFormat]).toBeUndefined();
        });

        it('should accept a card from a non-rotating Eternal-legal set (TS26)', function () {
            const filler = getDeckFiller(cardDataGetter, 49, RELEASED_SETS);
            const ts26Card = getFirstCardInSet(cardDataGetter, 'TS26');
            const deck = buildDeck([...filler, ts26Card]);
            const failures = validator.validateInternalDeck(deck, eternalProps());
            expect(failures[DeckValidationFailureReason.IllegalInFormat]).toBeUndefined();
        });

        it('should reject an unreleased (ASH) card with the Current card pool', function () {
            const filler = getDeckFiller(cardDataGetter, 49, RELEASED_SETS);
            const ashCard = getFirstCardInSet(cardDataGetter, 'ASH');
            const deck = buildDeck([...filler, ashCard]);
            const failures = validator.validateInternalDeck(deck, eternalProps());
            expect(failures[DeckValidationFailureReason.IllegalInFormat]).toBeDefined();
            expect(failures[DeckValidationFailureReason.IllegalInFormat][0].reason).toBe(IllegalInFormatReason.Preview);
        });
    });
});
