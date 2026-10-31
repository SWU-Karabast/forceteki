import { CardPool, SwuGameFormat } from '../../../server/game/core/Constants';
import { DeckValidationFailureReason, IllegalInFormatReason } from '../../../server/utils/deck/DeckInterfaces';
import type { IInternalCardEntry } from '../../../server/utils/deck/DeckInterfaces';
import { DeckValidator } from '../../../server/utils/deck/DeckValidator';
import { UnitTestCardDataGetter } from '../../../server/utils/cardData/UnitTestCardDataGetter';
import {
    buildCardEntry,
    buildValidationTestDeck,
    getDeckFiller,
    makeValidatorWithUnknownSetCard
} from './DeckValidatorTestUtils';

// Format-independent validation behavior. These checks run before (or regardless of) any format-specific
// rules, so they are exercised once here under a representative format (Open) rather than in every format
// file. Format-specific behavior lives in the per-format specs (Premier/Eternal/Open/Limited/NextSet/TwinSuns).
const LEADER = 'luke-skywalker#faithful-friend'; // SOR
const BASE = 'kestro-city';                      // SOR

describe('Deck validation (format-independent)', function () {
    let validator: DeckValidator;
    let cardDataGetter: UnitTestCardDataGetter;

    beforeAll(async function () {
        cardDataGetter = new UnitTestCardDataGetter('test/json');
        validator = await DeckValidator.createAsync(cardDataGetter);
    });

    // Default tests run with minimal restrictions
    function props() {
        return { format: SwuGameFormat.Open, cardPool: CardPool.Unlimited };
    }

    function buildDeck(deckCards: IInternalCardEntry[], overrides = {}) {
        return buildValidationTestDeck(cardDataGetter, LEADER, BASE, deckCards, overrides);
    }

    describe('deck structure', function () {
        it('should reject a missing deck', function () {
            const failures = validator.validateInternalDeck(null, props());
            expect(failures[DeckValidationFailureReason.InvalidDeckData]).toBe(true);
        });

        it('should reject a deck with no leader', function () {
            const deck = buildDeck(getDeckFiller(cardDataGetter, 50));
            const failures = validator.validateInternalDeck({ ...deck, leader: undefined }, props());
            expect(failures[DeckValidationFailureReason.InvalidDeckData]).toBe(true);
        });

        it('should reject a deck with no base', function () {
            const deck = buildDeck(getDeckFiller(cardDataGetter, 50));
            const failures = validator.validateInternalDeck({ ...deck, base: undefined }, props());
            expect(failures[DeckValidationFailureReason.InvalidDeckData]).toBe(true);
        });

        it('should reject a deck with an empty deck list', function () {
            const deck = buildDeck([]);
            const failures = validator.validateInternalDeck(deck, props());
            expect(failures[DeckValidationFailureReason.InvalidDeckData]).toBe(true);
        });
    });

    describe('card locations', function () {
        it('should reject a leader card placed in the main deck', function () {
            const filler = getDeckFiller(cardDataGetter, 49);
            const deck = buildDeck([...filler, buildCardEntry(cardDataGetter, LEADER)]);
            const failures = validator.validateInternalDeck(deck, props());
            expect(failures[DeckValidationFailureReason.InvalidDecklistLocation]).toBeDefined();
            expect(failures[DeckValidationFailureReason.InvalidDecklistLocation].length).toBeGreaterThan(0);
        });

        it('should reject a base card placed in the main deck', function () {
            const filler = getDeckFiller(cardDataGetter, 49);
            const deck = buildDeck([...filler, buildCardEntry(cardDataGetter, BASE)]);
            const failures = validator.validateInternalDeck(deck, props());
            expect(failures[DeckValidationFailureReason.InvalidDecklistLocation]).toBeDefined();
            expect(failures[DeckValidationFailureReason.InvalidDecklistLocation].length).toBeGreaterThan(0);
        });
    });

    describe('unknown cards', function () {
        it('should reject a card whose set code is not in the card database', function () {
            const filler = getDeckFiller(cardDataGetter, 49);
            const unknownCard: IInternalCardEntry = { id: 'ZZZ_999', count: 1, internalName: 'unknown-card' };
            const deck = buildDeck([...filler, unknownCard]);
            const failures = validator.validateInternalDeck(deck, props());
            expect(failures[DeckValidationFailureReason.UnknownCardId]).toBeDefined();
            expect(failures[DeckValidationFailureReason.UnknownCardId].length).toBeGreaterThan(0);
        });

        it('should reject a card from an unrecognized set with the UnknownSet reason', async function () {
            const { validator: extValidator, unknownSetEntry } = await makeValidatorWithUnknownSetCard(cardDataGetter);
            const filler = getDeckFiller(cardDataGetter, 49);
            const deck = buildDeck([...filler, unknownSetEntry]);
            const failures = extValidator.validateInternalDeck(deck, props());
            expect(failures[DeckValidationFailureReason.IllegalInFormat]).toBeDefined();
            expect(failures[DeckValidationFailureReason.IllegalInFormat][0].reason).toBe(IllegalInFormatReason.UnknownSet);
        });
    });
});
