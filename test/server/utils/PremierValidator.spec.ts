import { CardPool, SwuGameFormat } from '../../../server/game/core/Constants';
import { DeckValidationFailureReason, IllegalInFormatReason } from '../../../server/utils/deck/DeckInterfaces';
import type { IInternalCardEntry } from '../../../server/utils/deck/DeckInterfaces';
import { DeckValidator } from '../../../server/utils/deck/DeckValidator';
import { UnitTestCardDataGetter } from '../../../server/utils/cardData/UnitTestCardDataGetter';
import { makeDeckValidatorHelpers } from './DeckValidatorTestUtils';

const PREMIER_SETS = new Set([...DeckValidator.getLegalSets(SwuGameFormat.Premier, CardPool.Current)].map((s) => s.toUpperCase()));
const PREMIER_NEXT_SETS = new Set([...DeckValidator.getLegalSets(SwuGameFormat.Premier, CardPool.NextSet)].map((s) => s.toUpperCase()));

describe('Premier validation', function () {
    let validator: DeckValidator;
    let helpers: ReturnType<typeof makeDeckValidatorHelpers>;
    let premierLeader: string;
    let premierBase: string;

    beforeAll(async function () {
        const cardDataGetter = new UnitTestCardDataGetter('test/json');
        validator = await DeckValidator.createAsync(cardDataGetter);
        helpers = makeDeckValidatorHelpers(cardDataGetter);
        premierLeader = helpers.getFirstLeader(PREMIER_SETS).internalName;
        premierBase = helpers.getFirstBase(PREMIER_SETS).internalName;
    });

    function premierProps() {
        return { format: SwuGameFormat.Premier, cardPool: CardPool.Current };
    }

    function buildDeck(deckCards: IInternalCardEntry[], overrides = {}) {
        return helpers.buildDeck(premierLeader, premierBase, deckCards, overrides);
    }

    describe('deck size', function () {
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
    });

    describe('copy limits', function () {
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
    });

    describe('sideboard', function () {
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

        it('should allow a sideboard of more than 10 cards when using the NextSet card pool', function () {
            const all = helpers.getDeckFiller(61, PREMIER_NEXT_SETS);
            const deck = buildDeck(all.slice(0, 50), { sideboard: all.slice(50, 61) });
            const failures = validator.validateInternalDeck(deck, { format: SwuGameFormat.Premier, cardPool: CardPool.NextSet });
            expect(failures[DeckValidationFailureReason.MaxSideboardSizeExceeded]).toBeUndefined();
        });
    });

    describe('format legality', function () {
        it('should reject a card from outside the current rotation (SOR)', function () {
            const filler = helpers.getDeckFiller(49, PREMIER_SETS);
            const sorCard = helpers.getFirstCardInSet('SOR');
            const deck = buildDeck([...filler, sorCard]);
            const failures = validator.validateInternalDeck(deck, premierProps());
            expect(failures[DeckValidationFailureReason.IllegalInFormat]).toBeDefined();
            expect(failures[DeckValidationFailureReason.IllegalInFormat].length).toBeGreaterThan(0);
            expect(failures[DeckValidationFailureReason.IllegalInFormat][0].reason).toBe(IllegalInFormatReason.RotatedOut);
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
            const leaderInDeck = helpers.entry(premierLeader);
            const deck = buildDeck([...filler, leaderInDeck]);
            const failures = validator.validateInternalDeck(deck, premierProps());
            expect(failures[DeckValidationFailureReason.InvalidDecklistLocation]).toBeDefined();
            expect(failures[DeckValidationFailureReason.InvalidDecklistLocation].length).toBeGreaterThan(0);
        });

        it('should reject a base card placed in the main deck', function () {
            const filler = helpers.getDeckFiller(49, PREMIER_SETS);
            const baseInDeck = helpers.entry(premierBase);
            const deck = buildDeck([...filler, baseInDeck]);
            const failures = validator.validateInternalDeck(deck, premierProps());
            expect(failures[DeckValidationFailureReason.InvalidDecklistLocation]).toBeDefined();
            expect(failures[DeckValidationFailureReason.InvalidDecklistLocation].length).toBeGreaterThan(0);
        });

        it('should reject a sideboard containing a card from outside the current rotation', function () {
            const filler = helpers.getDeckFiller(50, PREMIER_SETS);
            const sorCard = helpers.getFirstCardInSet('SOR');
            const deck = buildDeck(filler, { sideboard: [sorCard] });
            const failures = validator.validateInternalDeck(deck, premierProps());
            expect(failures[DeckValidationFailureReason.IllegalInFormat]).toBeDefined();
            expect(failures[DeckValidationFailureReason.IllegalInFormat].length).toBeGreaterThan(0);
            expect(failures[DeckValidationFailureReason.IllegalInFormat][0].reason).toBe(IllegalInFormatReason.RotatedOut);
        });

        it('should reject a rotated-out base in the base slot', function () {
            const filler = helpers.getDeckFiller(50, PREMIER_SETS);
            const deck = buildDeck(filler, { base: helpers.entry('echo-base') }); // If Echo Base is ever reprinted, we will need to change this
            const failures = validator.validateInternalDeck(deck, premierProps());
            expect(failures[DeckValidationFailureReason.IllegalInFormat]).toBeDefined();
            expect(failures[DeckValidationFailureReason.IllegalInFormat].length).toBeGreaterThan(0);
            expect(failures[DeckValidationFailureReason.IllegalInFormat][0].reason).toBe(IllegalInFormatReason.RotatedOut);
        });
    });

    describe('leader', function () {
        it('should reject a deck with a second leader in a non-TwinSuns format', function () {
            const filler = helpers.getDeckFiller(50, PREMIER_SETS);
            const secondLeader = helpers.getFirstLeader(PREMIER_SETS);
            const deck = buildDeck(filler, { secondLeader: helpers.entry(secondLeader.internalName) });
            const failures = validator.validateInternalDeck(deck, premierProps());
            expect(failures[DeckValidationFailureReason.TooManyLeaders]).toBeDefined();
        });
    });
});
