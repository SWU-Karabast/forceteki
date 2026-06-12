import { CardPool, SwuGameFormat } from '../../../server/game/core/Constants';
import { DeckValidationFailureReason, IllegalInFormatReason } from '../../../server/utils/deck/DeckInterfaces';
import type { IInternalCardEntry } from '../../../server/utils/deck/DeckInterfaces';
import { DeckValidator } from '../../../server/utils/deck/DeckValidator';
import { UnitTestCardDataGetter } from '../../../server/utils/cardData/UnitTestCardDataGetter';
import { formatRules } from '../../../server/utils/deck/SwuSetData';
import { makeDeckValidatorHelpers, RELEASED_SETS } from './DeckValidatorTestUtils';

// Open, Eternal, and Limited format validation tests.
// Premier tests → PremierValidator.spec.ts

// Derive banned card internal names directly from the format rules so this stays in sync automatically.
const eternalBannedCards = [...formatRules.get(SwuGameFormat.Eternal).bannedCards.values()];

const LEADER = 'luke-skywalker#faithful-friend'; // SOR — legal in Eternal and Open, not in Premier
const BASE = 'kestro-city';                      // SOR — legal in Eternal and Open, not in Premier

describe('Deck validation', function () {
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

        // Copy limits
        it('should allow up to 3 copies of a card', function () {
            const filler = helpers.getDeckFiller(48);
            const tripleCard: IInternalCardEntry = { ...filler[0], count: 3 };
            const deck = buildDeck([tripleCard, ...filler.slice(1)]);
            const failures = validator.validateInternalDeck(deck, eternalProps());
            expect(failures[DeckValidationFailureReason.TooManyCopiesOfCard]).toBeUndefined();
        });

        it('should reject 4 copies of a card', function () {
            const filler = helpers.getDeckFiller(48);
            const quadCard: IInternalCardEntry = { ...filler[0], count: 4 };
            const deck = buildDeck([quadCard, ...filler.slice(1)]);
            const failures = validator.validateInternalDeck(deck, eternalProps());
            expect(failures[DeckValidationFailureReason.TooManyCopiesOfCard]).toBeDefined();
        });

        // Sideboard
        it('should allow a sideboard of up to 10 cards', function () {
            const all = helpers.getDeckFiller(60);
            const deck = buildDeck(all.slice(0, 50), { sideboard: all.slice(50, 60) });
            const failures = validator.validateInternalDeck(deck, eternalProps());
            expect(failures[DeckValidationFailureReason.MaxSideboardSizeExceeded]).toBeUndefined();
        });

        it('should reject a sideboard of more than 10 cards', function () {
            const all = helpers.getDeckFiller(61);
            const deck = buildDeck(all.slice(0, 50), { sideboard: all.slice(50, 61) });
            const failures = validator.validateInternalDeck(deck, eternalProps());
            expect(failures[DeckValidationFailureReason.MaxSideboardSizeExceeded]).toBeDefined();
            expect(failures[DeckValidationFailureReason.MaxSideboardSizeExceeded].actualSideboardSize).toBe(11);
        });

        // Ban list
        for (const bannedCard of eternalBannedCards) {
            it(`should reject ${bannedCard}`, function () {
                const filler = helpers.getDeckFiller(49);
                const deck = buildDeck([...filler, helpers.entry(bannedCard)]);
                const failures = validator.validateInternalDeck(deck, eternalProps());
                expect(failures[DeckValidationFailureReason.IllegalInFormat]).toBeDefined();
                expect(failures[DeckValidationFailureReason.IllegalInFormat].length).toBeGreaterThan(0);
                expect(failures[DeckValidationFailureReason.IllegalInFormat][0].reason).toBe(IllegalInFormatReason.Suspended);
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
            expect(failures[DeckValidationFailureReason.IllegalInFormat][0].reason).toBe(IllegalInFormatReason.Unreleased);
        });

        it('should reject a leader card placed in the main deck', function () {
            const filler = helpers.getDeckFiller(49);
            const deck = buildDeck([...filler, helpers.entry(LEADER)]);
            const failures = validator.validateInternalDeck(deck, eternalProps());
            expect(failures[DeckValidationFailureReason.InvalidDecklistLocation]).toBeDefined();
            expect(failures[DeckValidationFailureReason.InvalidDecklistLocation].length).toBeGreaterThan(0);
        });

        it('should reject a base card placed in the main deck', function () {
            const filler = helpers.getDeckFiller(49);
            const deck = buildDeck([...filler, helpers.entry(BASE)]);
            const failures = validator.validateInternalDeck(deck, eternalProps());
            expect(failures[DeckValidationFailureReason.InvalidDecklistLocation]).toBeDefined();
            expect(failures[DeckValidationFailureReason.InvalidDecklistLocation].length).toBeGreaterThan(0);
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

        // Copy limits
        it('should allow up to 3 copies of a card', function () {
            const filler = helpers.getDeckFiller(48);
            const tripleCard: IInternalCardEntry = { ...filler[0], count: 3 };
            const deck = buildDeck([tripleCard, ...filler.slice(1)]);
            const failures = validator.validateInternalDeck(deck, openProps());
            expect(failures[DeckValidationFailureReason.TooManyCopiesOfCard]).toBeUndefined();
        });

        it('should reject 4 copies of a card', function () {
            const filler = helpers.getDeckFiller(48);
            const quadCard: IInternalCardEntry = { ...filler[0], count: 4 };
            const deck = buildDeck([quadCard, ...filler.slice(1)]);
            const failures = validator.validateInternalDeck(deck, openProps());
            expect(failures[DeckValidationFailureReason.TooManyCopiesOfCard]).toBeDefined();
        });

        // Sideboard — no cap in Open
        it('should allow a sideboard larger than 10 cards', function () {
            const all = helpers.getDeckFiller(61);
            const deck = buildDeck(all.slice(0, 50), { sideboard: all.slice(50, 61) });
            const failures = validator.validateInternalDeck(deck, openProps());
            expect(failures[DeckValidationFailureReason.MaxSideboardSizeExceeded]).toBeUndefined();
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

        it('should reject a leader card placed in the main deck', function () {
            const filler = helpers.getDeckFiller(49);
            const deck = buildDeck([...filler, helpers.entry(LEADER)]);
            const failures = validator.validateInternalDeck(deck, openProps());
            expect(failures[DeckValidationFailureReason.InvalidDecklistLocation]).toBeDefined();
            expect(failures[DeckValidationFailureReason.InvalidDecklistLocation].length).toBeGreaterThan(0);
        });

        it('should reject a base card placed in the main deck', function () {
            const filler = helpers.getDeckFiller(49);
            const deck = buildDeck([...filler, helpers.entry(BASE)]);
            const failures = validator.validateInternalDeck(deck, openProps());
            expect(failures[DeckValidationFailureReason.InvalidDecklistLocation]).toBeDefined();
            expect(failures[DeckValidationFailureReason.InvalidDecklistLocation].length).toBeGreaterThan(0);
        });
    });

    describe('Limited validation', function () {
        let limitedLeader: string;
        let limitedBase: string;

        beforeAll(function () {
            const limitedSets = new Set([...DeckValidator.getLegalSets(SwuGameFormat.Limited, CardPool.Current)].map((s) => s.toUpperCase()));
            limitedLeader = helpers.getFirstLeader(limitedSets).internalName;
            limitedBase = helpers.getFirstBase(limitedSets).internalName;
        });

        function limitedProps() {
            return { format: SwuGameFormat.Limited, cardPool: CardPool.Current };
        }

        function buildLimitedDeck(deckCards: IInternalCardEntry[], overrides = {}) {
            return helpers.buildDeck(limitedLeader, limitedBase, deckCards, overrides);
        }

        it('should accept a valid deck with exactly 30 cards', function () {
            const limitedSets = new Set([...DeckValidator.getLegalSets(SwuGameFormat.Limited, CardPool.Current)].map((s) => s.toUpperCase()));
            const deck = buildLimitedDeck(helpers.getDeckFiller(30, limitedSets));
            const failures = validator.validateInternalDeck(deck, limitedProps());
            expect(failures[DeckValidationFailureReason.MinDecklistSizeNotMet]).toBeUndefined();
        });

        it('should reject a deck with fewer than 30 cards', function () {
            const limitedSets = new Set([...DeckValidator.getLegalSets(SwuGameFormat.Limited, CardPool.Current)].map((s) => s.toUpperCase()));
            const deck = buildLimitedDeck(helpers.getDeckFiller(29, limitedSets));
            const failures = validator.validateInternalDeck(deck, limitedProps());
            expect(failures[DeckValidationFailureReason.MinDecklistSizeNotMet]).toBeDefined();
            expect(failures[DeckValidationFailureReason.MinDecklistSizeNotMet].actualDecklistSize).toBe(29);
        });
    });
});
