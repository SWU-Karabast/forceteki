import { CardPool, SwuGameFormat } from '../../../server/game/core/Constants';
import { DeckValidationFailureReason } from '../../../server/utils/deck/DeckInterfaces';
import type { IInternalCardEntry } from '../../../server/utils/deck/DeckInterfaces';
import { DeckValidator } from '../../../server/utils/deck/DeckValidator';
import { UnitTestCardDataGetter } from '../../../server/utils/cardData/UnitTestCardDataGetter';
import { makeDeckValidatorHelpers } from './DeckValidatorTestUtils';

const PREMIER_HEROISM_LEADER = 'admiral-ackbar#its-a-trap'; // aspects: [cunning, heroism] JTL
const PREMIER_BASE = 'chopper-base';                        // JTL — legal in Premier rotation
const PREMIER_SETS = new Set(['JTL', 'LOF', 'IBH', 'SEC', 'LAW']);

// ────────────────────────────────────────────────────────────────────────────
// Setup
// ────────────────────────────────────────────────────────────────────────────

let validator: DeckValidator;
let helpers: ReturnType<typeof makeDeckValidatorHelpers>;

beforeAll(async function () {
    const cardDataGetter = new UnitTestCardDataGetter('test/json');
    validator = await DeckValidator.createAsync(cardDataGetter);
    helpers = makeDeckValidatorHelpers(cardDataGetter);
});

function premierProps() {
    return { format: SwuGameFormat.Premier, cardPool: CardPool.Current };
}

function buildDeck(deckCards: IInternalCardEntry[], overrides = {}) {
    return helpers.buildDeck(PREMIER_HEROISM_LEADER, PREMIER_BASE, deckCards, overrides);
}

// ────────────────────────────────────────────────────────────────────────────
// Tests
// ────────────────────────────────────────────────────────────────────────────

describe('Premier validation', function () {
    // Deck size
    it('should accept a valid deck with 50 Premier-legal cards and 1 leader', function () {
        const deck = buildDeck(helpers.getDeckFiller(50, PREMIER_SETS));
        const failures = validator.validateInternalDeck(deck, premierProps());
        expect(Object.keys(failures).length).toBe(0);
    });

    it('should reject a deck with fewer than 50 cards', function () {
        const deck = buildDeck(helpers.getDeckFiller(49, PREMIER_SETS));
        const failures = validator.validateInternalDeck(deck, premierProps());
        expect(failures[DeckValidationFailureReason.MinDecklistSizeNotMet]).toBeDefined();
        expect(failures[DeckValidationFailureReason.MinDecklistSizeNotMet].actualDecklistSize).toBe(49);
    });

    it('should reject a deck where the mainboard is short even if the sideboard brings the total to 50', function () {
        const all = helpers.getDeckFiller(50, PREMIER_SETS);
        const deck = buildDeck(all.slice(0, 49), { sideboard: [all[49]] });
        const failures = validator.validateInternalDeck(deck, premierProps());
        expect(failures[DeckValidationFailureReason.MinDecklistSizeNotMet]).toBeUndefined();
        expect(failures[DeckValidationFailureReason.MinMainboardSizeNotMet]).toBeDefined();
        expect(failures[DeckValidationFailureReason.MinMainboardSizeNotMet].actualBoardedSize).toBe(49);
    });

    // Copy limits
    it('should allow up to 3 copies of a card', function () {
        const filler = helpers.getDeckFiller(48, PREMIER_SETS);
        const tripleCard: IInternalCardEntry = { ...filler[0], count: 3 };
        const deck = buildDeck([tripleCard, ...filler.slice(1)]);
        const failures = validator.validateInternalDeck(deck, premierProps());
        expect(failures[DeckValidationFailureReason.TooManyCopiesOfCard]).toBeUndefined();
    });

    it('should reject 4 copies of a card', function () {
        const filler = helpers.getDeckFiller(48, PREMIER_SETS);
        const quadCard: IInternalCardEntry = { ...filler[0], count: 4 };
        const deck = buildDeck([quadCard, ...filler.slice(1)]);
        const failures = validator.validateInternalDeck(deck, premierProps());
        expect(failures[DeckValidationFailureReason.TooManyCopiesOfCard]).toBeDefined();
    });

    // Sideboard
    it('should allow a sideboard of up to 10 cards', function () {
        const all = helpers.getDeckFiller(60, PREMIER_SETS);
        const deck = buildDeck(all.slice(0, 50), { sideboard: all.slice(50, 60) });
        const failures = validator.validateInternalDeck(deck, premierProps());
        expect(failures[DeckValidationFailureReason.MaxSideboardSizeExceeded]).toBeUndefined();
    });

    it('should reject a sideboard of more than 10 cards', function () {
        const all = helpers.getDeckFiller(61, PREMIER_SETS);
        const deck = buildDeck(all.slice(0, 50), { sideboard: all.slice(50, 61) });
        const failures = validator.validateInternalDeck(deck, premierProps());
        expect(failures[DeckValidationFailureReason.MaxSideboardSizeExceeded]).toBeDefined();
        expect(failures[DeckValidationFailureReason.MaxSideboardSizeExceeded].actualSideboardSize).toBe(11);
    });

    // Format legality
    it('should reject a card from outside the current rotation (SOR)', function () {
        const filler = helpers.getDeckFiller(49, PREMIER_SETS);
        const sorCard = helpers.getFirstCardInSet('SOR');
        const deck = buildDeck([...filler, sorCard]);
        const failures = validator.validateInternalDeck(deck, premierProps());
        expect(failures[DeckValidationFailureReason.IllegalInFormat]).toBeDefined();
        expect(failures[DeckValidationFailureReason.IllegalInFormat].length).toBeGreaterThan(0);
    });

    it('should reject a card with an unknown set code', function () {
        const filler = helpers.getDeckFiller(49, PREMIER_SETS);
        const unknownCard: IInternalCardEntry = { id: 'ZZZ_999', count: 1, internalName: 'unknown-card' };
        const deck = buildDeck([...filler, unknownCard]);
        const failures = validator.validateInternalDeck(deck, premierProps());
        expect(failures[DeckValidationFailureReason.UnknownCardId]).toBeDefined();
        expect(failures[DeckValidationFailureReason.UnknownCardId].length).toBeGreaterThan(0);
    });

    it('should reject a leader card placed in the main deck', function () {
        const filler = helpers.getDeckFiller(49, PREMIER_SETS);
        const leaderInDeck = helpers.entry(PREMIER_HEROISM_LEADER);
        const deck = buildDeck([...filler, leaderInDeck]);
        const failures = validator.validateInternalDeck(deck, premierProps());
        expect(failures[DeckValidationFailureReason.InvalidDecklistLocation]).toBeDefined();
        expect(failures[DeckValidationFailureReason.InvalidDecklistLocation].length).toBeGreaterThan(0);
    });
});
