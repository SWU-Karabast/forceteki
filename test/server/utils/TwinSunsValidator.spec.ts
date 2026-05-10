import { CardPool, SwuGameFormat } from '../../../server/game/core/Constants';
import { DeckValidationFailureReason } from '../../../server/utils/deck/DeckInterfaces';
import type { IDecklistInternal, IInternalCardEntry } from '../../../server/utils/deck/DeckInterfaces';
import { DeckValidator } from '../../../server/utils/deck/DeckValidator';
import { UnitTestCardDataGetter } from '../../../server/utils/cardData/UnitTestCardDataGetter';
import { makeDeckValidatorHelpers } from './DeckValidatorTestUtils';

// ────────────────────────────────────────────────────────────────────────────
// Leaders with known aspects used to verify Twin Suns pairing rules.
// Heroism + Heroism  →  valid
// Heroism + Villainy →  invalid (MixedAlignmentLeaders)
// Heroism + Neutral  →  valid
// ────────────────────────────────────────────────────────────────────────────
const HEROISM_LEADER_1 = 'luke-skywalker#faithful-friend';   // aspects: [heroism, command]     SOR_005
const HEROISM_LEADER_2 = 'leia-organa#alliance-general';     // aspects: [heroism, command]     SOR_009
const VILLAINY_LEADER = 'darth-vader#dark-lord-of-the-sith'; // aspects: [aggression, villainy] SOR_010
const NEUTRAL_LEADER = 'saw-gerrera#bring-down-the-empire';  // aspects: [command, aggression]  LAW_001
const BASE = 'kestro-city';

// Premier-legal leaders used for SWUDB cross-format rejection test
const PREMIER_HEROISM_LEADER = 'admiral-ackbar#its-a-trap';            // aspects: [cunning, heroism]  JTL
const PREMIER_VILLAINY_LEADER = 'admiral-piett#commanding-the-armada'; // aspects: [command, villainy] JTL

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

function twinSunsProps() {
    return { format: SwuGameFormat.TwinSuns, cardPool: CardPool.Current };
}

function premierProps() {
    return { format: SwuGameFormat.Premier, cardPool: CardPool.Current };
}

function buildDeck(deckCards: IInternalCardEntry[], overrides: Partial<IDecklistInternal> = {}) {
    return helpers.buildDeck(HEROISM_LEADER_1, BASE, deckCards, overrides);
}

// ────────────────────────────────────────────────────────────────────────────
// Tests
// ────────────────────────────────────────────────────────────────────────────

describe('Twin Suns validation', function () {
    // Deck size and copy limits
    it('should accept a valid deck with 80 cards, 1 copy each, and two non-conflicting leaders', function () {
        const deck = buildDeck(helpers.getDeckFiller(80), {
            leader: helpers.entry(HEROISM_LEADER_1),
            secondLeader: helpers.entry(HEROISM_LEADER_2),
        });
        const failures = validator.validateInternalDeck(deck, twinSunsProps());
        expect(Object.keys(failures).length).toBe(0);
    });

    it('should reject a deck with fewer than 80 cards', function () {
        const deck = buildDeck(helpers.getDeckFiller(79), {
            secondLeader: helpers.entry(HEROISM_LEADER_2),
        });
        const failures = validator.validateInternalDeck(deck, twinSunsProps());
        expect(failures[DeckValidationFailureReason.MinDecklistSizeNotMet]).toBeDefined();
        expect(failures[DeckValidationFailureReason.MinDecklistSizeNotMet].actualDecklistSize).toBe(79);
    });

    it('should reject a deck where the mainboard is short even if the sideboard brings the total to 80', function () {
        const all = helpers.getDeckFiller(80);
        const deck = buildDeck(all.slice(0, 79), {
            secondLeader: helpers.entry(HEROISM_LEADER_2),
            sideboard: [all[79]],
        });
        const failures = validator.validateInternalDeck(deck, twinSunsProps());
        expect(failures[DeckValidationFailureReason.MinDecklistSizeNotMet]).toBeUndefined();
        expect(failures[DeckValidationFailureReason.MinMainboardSizeNotMet]).toBeDefined();
        expect(failures[DeckValidationFailureReason.MinMainboardSizeNotMet].actualBoardedSize).toBe(79);
    });

    it('should reject a deck with 2 copies of the same card', function () {
        const filler = helpers.getDeckFiller(80);
        const deckWith2Copies = [
            { ...filler[0], count: 2 },
            ...filler.slice(1, 79),
        ];
        const deck = buildDeck(deckWith2Copies, {
            secondLeader: helpers.entry(HEROISM_LEADER_2),
        });
        const failures = validator.validateInternalDeck(deck, twinSunsProps());
        expect(failures[DeckValidationFailureReason.TooManyCopiesOfCard]).toBeDefined();
        expect(failures[DeckValidationFailureReason.TooManyCopiesOfCard].length).toBeGreaterThan(0);
    });

    it('should allow Swarming Vulture Droid with more than 1 copy due to its built-in override', function () {
        // 70 unique fillers + 10 Vulture Droids = 80 total cards
        const filler = helpers.getDeckFiller(70);
        const vultureEntry = helpers.entry('swarming-vulture-droid', 10);
        const deck = buildDeck([...filler, vultureEntry], {
            secondLeader: helpers.entry(HEROISM_LEADER_2),
        });
        const failures = validator.validateInternalDeck(deck, twinSunsProps());
        expect(failures[DeckValidationFailureReason.TooManyCopiesOfCard]).toBeUndefined();
    });

    // Leader aspect validation
    it('should reject a Heroism + Villainy leader pair', function () {
        const deck = buildDeck(helpers.getDeckFiller(80), {
            leader: helpers.entry(HEROISM_LEADER_1),
            secondLeader: helpers.entry(VILLAINY_LEADER),
        });
        const failures = validator.validateInternalDeck(deck, twinSunsProps());
        expect(failures[DeckValidationFailureReason.MixedAlignmentLeaders]).toBeTrue();
    });

    it('should reject a Villainy + Heroism leader pair (order reversed)', function () {
        const deck = buildDeck(helpers.getDeckFiller(80), {
            leader: helpers.entry(VILLAINY_LEADER),
            secondLeader: helpers.entry(HEROISM_LEADER_1),
        });
        const failures = validator.validateInternalDeck(deck, twinSunsProps());
        expect(failures[DeckValidationFailureReason.MixedAlignmentLeaders]).toBeTrue();
    });

    it('should accept a Heroism + Heroism leader pair', function () {
        const deck = buildDeck(helpers.getDeckFiller(80), {
            leader: helpers.entry(HEROISM_LEADER_1),
            secondLeader: helpers.entry(HEROISM_LEADER_2),
        });
        const failures = validator.validateInternalDeck(deck, twinSunsProps());
        expect(failures[DeckValidationFailureReason.MixedAlignmentLeaders]).toBeUndefined();
    });

    it('should accept a Heroism + Neutral leader pair', function () {
        const deck = buildDeck(helpers.getDeckFiller(80), {
            leader: helpers.entry(HEROISM_LEADER_1),
            secondLeader: helpers.entry(NEUTRAL_LEADER),
        });
        const failures = validator.validateInternalDeck(deck, twinSunsProps());
        expect(failures[DeckValidationFailureReason.MixedAlignmentLeaders]).toBeUndefined();
        expect(Object.keys(failures).length).toBe(0);
    });

    it('should accept a Villainy + Neutral leader pair', function () {
        const deck = buildDeck(helpers.getDeckFiller(80), {
            leader: helpers.entry(VILLAINY_LEADER),
            secondLeader: helpers.entry(NEUTRAL_LEADER),
        });
        const failures = validator.validateInternalDeck(deck, twinSunsProps());
        expect(failures[DeckValidationFailureReason.MixedAlignmentLeaders]).toBeUndefined();
        expect(Object.keys(failures).length).toBe(0);
    });

    it('should require a second leader', function () {
        const deck = buildDeck(helpers.getDeckFiller(80));
        const failures = validator.validateInternalDeck(deck, twinSunsProps());
        expect(failures[DeckValidationFailureReason.MissingSecondLeader]).toBeTrue();
    });

    // Format legality
    it('should reject a card from an unrecognized set', function () {
        const { validator: extValidator, unreleasedEntry } = helpers.makeValidatorWithUnreleasedCard();
        const filler = helpers.getDeckFiller(79);
        const deck = buildDeck([...filler, unreleasedEntry], {
            secondLeader: helpers.entry(HEROISM_LEADER_2),
        });
        const failures = extValidator.validateInternalDeck(deck, twinSunsProps());
        expect(failures[DeckValidationFailureReason.IllegalInFormat]).toBeDefined();
        expect(failures[DeckValidationFailureReason.IllegalInFormat].length).toBeGreaterThan(0);
    });

    it('should reject a card with an unknown set code', function () {
        const filler = helpers.getDeckFiller(79);
        const unknownCard: IInternalCardEntry = { id: 'ZZZ_999', count: 1, internalName: 'unknown-card' };
        const deck = buildDeck([...filler, unknownCard], {
            secondLeader: helpers.entry(HEROISM_LEADER_2),
        });
        const failures = validator.validateInternalDeck(deck, twinSunsProps());
        expect(failures[DeckValidationFailureReason.UnknownCardId]).toBeDefined();
        expect(failures[DeckValidationFailureReason.UnknownCardId].length).toBeGreaterThan(0);
    });

    it('should reject a leader card placed in the main deck', function () {
        const filler = helpers.getDeckFiller(79);
        const leaderInDeck = helpers.entry(VILLAINY_LEADER);
        const deck = buildDeck([...filler, leaderInDeck], {
            secondLeader: helpers.entry(HEROISM_LEADER_2),
        });
        const failures = validator.validateInternalDeck(deck, twinSunsProps());
        expect(failures[DeckValidationFailureReason.InvalidDecklistLocation]).toBeDefined();
        expect(failures[DeckValidationFailureReason.InvalidDecklistLocation].length).toBeGreaterThan(0);
    });

    // SWUDB secondleader field
    it('should allow secondleader in TwinSuns SWUDB format', function () {
        const deck = {
            metadata: { name: 'Test', author: 'Test' },
            leader: { id: helpers.sc(HEROISM_LEADER_1), count: 1 },
            secondleader: { id: helpers.sc(HEROISM_LEADER_2), count: 1 },
            base: { id: helpers.sc(BASE), count: 1 },
            deck: helpers.getDeckFiller(80),
        };
        const failures = validator.validateSwuDbDeck(deck, twinSunsProps());
        expect(failures[DeckValidationFailureReason.TooManyLeaders]).toBeUndefined();
    });

    it('should reject secondleader in Premier SWUDB format', function () {
        const premierSets = new Set(['JTL', 'LOF', 'IBH', 'SEC', 'LAW']);
        const deck = {
            metadata: { name: 'Test', author: 'Test' },
            leader: { id: helpers.sc(PREMIER_HEROISM_LEADER), count: 1 },
            secondleader: { id: helpers.sc(PREMIER_VILLAINY_LEADER), count: 1 },
            base: { id: helpers.sc(BASE), count: 1 },
            deck: helpers.getDeckFiller(50, premierSets),
        };
        const failures = validator.validateSwuDbDeck(deck, premierProps());
        expect(failures[DeckValidationFailureReason.TooManyLeaders]).toBeTrue();
    });
});
