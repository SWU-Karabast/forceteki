// Open, Eternal, and Limited format validation tests.
// Premier tests → PremierValidator.spec.ts
// Twin Suns tests → TwinSunsValidator.spec.ts

import { CardPool, SwuGameFormat } from '../../../server/game/core/Constants';
import { DeckValidationFailureReason } from '../../../server/utils/deck/DeckInterfaces';
import type { IInternalCardEntry } from '../../../server/utils/deck/DeckInterfaces';
import { DeckValidator } from '../../../server/utils/deck/DeckValidator';
import { UnitTestCardDataGetter } from '../../../server/utils/cardData/UnitTestCardDataGetter';
import { formatRules } from '../../../server/utils/deck/SwuSetData';
import { makeDeckValidatorHelpers, RELEASED_SETS } from './DeckValidatorTestUtils';

// Derive banned card internal names directly from the format rules so this stays in sync automatically.
const eternalBannedCards = [...formatRules.get(SwuGameFormat.Eternal).bannedCards.values()];

const LEADER = 'luke-skywalker#faithful-friend'; // SOR — legal in Eternal and Open, not in Premier
const BASE = 'kestro-city';                      // SOR — legal in Eternal and Open, not in Premier

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

function eternalProps() {
    return { format: SwuGameFormat.Eternal, cardPool: CardPool.Current };
}

function openProps() {
    return { format: SwuGameFormat.Open, cardPool: CardPool.Current };
}

function buildDeck(deckCards: IInternalCardEntry[], overrides = {}) {
    return helpers.buildDeck(LEADER, BASE, deckCards, overrides);
}

// ────────────────────────────────────────────────────────────────────────────
// Tests
// ────────────────────────────────────────────────────────────────────────────

describe('Eternal validation', function () {
    // Deck size
    it('should accept a valid deck with 50 released cards', function () {
        const deck = buildDeck(helpers.getDeckFiller(50));
        const failures = validator.validateInternalDeck(deck, eternalProps());
        expect(Object.keys(failures).length).toBe(0);
    });

    it('should reject a deck with fewer than 50 cards', function () {
        const deck = buildDeck(helpers.getDeckFiller(49));
        const failures = validator.validateInternalDeck(deck, eternalProps());
        expect(failures[DeckValidationFailureReason.MinDecklistSizeNotMet]).toBeDefined();
        expect(failures[DeckValidationFailureReason.MinDecklistSizeNotMet].actualDecklistSize).toBe(49);
    });

    // Ban list
    for (const bannedCard of eternalBannedCards) {
        it(`should reject ${bannedCard}`, function () {
            const filler = helpers.getDeckFiller(49);
            const deck = buildDeck([...filler, helpers.entry(bannedCard)]);
            const failures = validator.validateInternalDeck(deck, eternalProps());
            expect(failures[DeckValidationFailureReason.IllegalInFormat]).toBeDefined();
            expect(failures[DeckValidationFailureReason.IllegalInFormat].length).toBeGreaterThan(0);
        });
    }

    // Format legality
    it('should accept cards from all released sets (no rotation lock)', function () {
        const sorFiller = helpers.getDeckFiller(50, new Set(['SOR']));
        const deck = buildDeck(sorFiller);
        const failures = validator.validateInternalDeck(deck, eternalProps());
        expect(failures[DeckValidationFailureReason.IllegalInFormat]).toBeUndefined();
    });

    it('should reject a card from an unrecognized set with the Current card pool', function () {
        const { validator: extValidator, unreleasedEntry } = helpers.makeValidatorWithUnreleasedCard();
        const filler = helpers.getDeckFiller(49);
        const deck = buildDeck([...filler, unreleasedEntry]);
        const failures = extValidator.validateInternalDeck(deck, eternalProps());
        expect(failures[DeckValidationFailureReason.IllegalInFormat]).toBeDefined();
    });
});

describe('Open validation', function () {
    // Deck size
    it('should accept a valid deck with 50 cards', function () {
        const deck = buildDeck(helpers.getDeckFiller(50));
        const failures = validator.validateInternalDeck(deck, openProps());
        expect(Object.keys(failures).length).toBe(0);
    });

    it('should reject a deck with fewer than 50 cards', function () {
        const deck = buildDeck(helpers.getDeckFiller(49));
        const failures = validator.validateInternalDeck(deck, openProps());
        expect(failures[DeckValidationFailureReason.MinDecklistSizeNotMet]).toBeDefined();
    });

    // No ban list
    for (const bannedCard of eternalBannedCards) {
        it(`should accept ${bannedCard}, which is banned in Eternal but not in Open`, function () {
            const filler = helpers.getDeckFiller(49);
            const deck = buildDeck([...filler, helpers.entry(bannedCard)]);
            const failures = validator.validateInternalDeck(deck, openProps());
            expect(failures[DeckValidationFailureReason.IllegalInFormat]).toBeUndefined();
        });
    }

    // Format legality
    it('should accept cards from all released sets (no rotation lock)', function () {
        const sorFiller = helpers.getDeckFiller(50, new Set(['SOR']));
        const deck = buildDeck(sorFiller);
        const failures = validator.validateInternalDeck(deck, openProps());
        expect(failures[DeckValidationFailureReason.IllegalInFormat]).toBeUndefined();
    });

    it('should accept unreleased (ASH) cards since Open includes preview sets', function () {
        const filler = helpers.getDeckFiller(49, RELEASED_SETS);
        const ashCard = helpers.getFirstCardInSet('ASH');
        const deck = buildDeck([...filler, ashCard]);
        const failures = validator.validateInternalDeck(deck, openProps());
        expect(failures[DeckValidationFailureReason.IllegalInFormat]).toBeUndefined();
    });
});
