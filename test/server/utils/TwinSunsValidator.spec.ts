import { CardPool, SwuGameFormat } from '../../../server/game/core/Constants';
import { DeckValidationFailureReason, IllegalInFormatReason } from '../../../server/utils/deck/DeckInterfaces';
import type { IDecklistInternal, IInternalCardEntry } from '../../../server/utils/deck/DeckInterfaces';
import { DeckValidator } from '../../../server/utils/deck/DeckValidator';
import { UnitTestCardDataGetter } from '../../../server/utils/cardData/UnitTestCardDataGetter';
import { makeDeckValidatorHelpers } from './DeckValidatorTestUtils';

// Leaders with known aspects used to verify TwinSuns dual-leader pairing rules.
const HEROISM_LEADER_1 = 'luke-skywalker#faithful-friend'; // Blue Hero
const HEROISM_LEADER_2 = 'leia-organa#alliance-general'; // Green Hero
const VILLAINY_LEADER = 'darth-vader#dark-lord-of-the-sith'; // Red Villain
const NEUTRAL_LEADER = 'saw-gerrera#bring-down-the-empire'; // Red Green
const NEUTRAL_LEADER_2 = 'tobias-beckett#people-are-predictable'; // Blue Yellow
const BASE = 'kestro-city'; // Yellow

describe('FauxSuns deck validation', function () {
    let validator: DeckValidator;
    let helpers: ReturnType<typeof makeDeckValidatorHelpers>;

    // Premier-legal leaders resolved dynamically for the SWUDB cross-format rejection test,
    // so the test isn't coupled to specific card names that could be reprinted or rotated.
    let premierHeroismLeader: string;
    let premierVillainyLeader: string;

    beforeAll(async function () {
        const cardDataGetter = new UnitTestCardDataGetter('test/json');
        validator = await DeckValidator.createAsync(cardDataGetter);
        helpers = makeDeckValidatorHelpers(cardDataGetter);

        const premierSets = new Set([...DeckValidator.getLegalSets(SwuGameFormat.Premier, CardPool.Current)].map((s) => s.toUpperCase()));
        premierHeroismLeader = helpers.getFirstLeader(premierSets, (card) => card.aspects.includes('heroism')).internalName;
        premierVillainyLeader = helpers.getFirstLeader(premierSets, (card) => card.aspects.includes('villainy')).internalName;
    });

    /** FauxSuns = 1v1 Twin Suns variant */
    function fauxSunsProps() {
        return { format: SwuGameFormat.FauxSuns, cardPool: CardPool.Current };
    }

    function premierProps() {
        return { format: SwuGameFormat.Premier, cardPool: CardPool.Current };
    }

    function buildDeck(deckCards: IInternalCardEntry[], overrides: Partial<IDecklistInternal> = {}) {
        return helpers.buildDeck(HEROISM_LEADER_1, BASE, deckCards, overrides);
    }

    describe('deck size and copy limits', function () {
        it('should accept a valid deck with 80 cards, 1 copy each, and two non-conflicting leaders', function () {
            const deck = buildDeck(helpers.getDeckFiller(80), {
                leader: helpers.entry(HEROISM_LEADER_1),
                secondLeader: helpers.entry(HEROISM_LEADER_2),
            });
            const failures = validator.validateInternalDeck(deck, fauxSunsProps());
            expect(Object.keys(failures).length).toBe(0);
        });

        it('should reject a deck with fewer than 80 cards', function () {
            const deck = buildDeck(helpers.getDeckFiller(79), {
                secondLeader: helpers.entry(HEROISM_LEADER_2),
            });
            const failures = validator.validateInternalDeck(deck, fauxSunsProps());
            expect(failures[DeckValidationFailureReason.MinDecklistSizeNotMet]).toBeDefined();
            expect(failures[DeckValidationFailureReason.MinDecklistSizeNotMet].actualDecklistSize).toBe(79);
        });

        it('should reject a deck where the mainboard is short even if the sideboard brings the total to 80', function () {
            const all = helpers.getDeckFiller(80);
            const deck = buildDeck(all.slice(0, 79), {
                secondLeader: helpers.entry(HEROISM_LEADER_2),
                sideboard: [all[79]],
            });
            const failures = validator.validateInternalDeck(deck, fauxSunsProps());
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
            const failures = validator.validateInternalDeck(deck, fauxSunsProps());
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
            const failures = validator.validateInternalDeck(deck, fauxSunsProps());
            expect(failures[DeckValidationFailureReason.TooManyCopiesOfCard]).toBeUndefined();
        });
    });

    describe('leader aspect validation', function () {
        it('should require a second leader', function () {
            const deck = buildDeck(helpers.getDeckFiller(80));
            const failures = validator.validateInternalDeck(deck, fauxSunsProps());
            expect(failures[DeckValidationFailureReason.MissingSecondLeader]).toBeTrue();
        });

        it('should reject a Heroism + Villainy leader pair', function () {
            const deck = buildDeck(helpers.getDeckFiller(80), {
                leader: helpers.entry(HEROISM_LEADER_1),
                secondLeader: helpers.entry(VILLAINY_LEADER),
            });
            const failures = validator.validateInternalDeck(deck, fauxSunsProps());
            expect(failures[DeckValidationFailureReason.MixedAlignmentLeaders]).toBeTrue();
        });

        it('should reject a Villainy + Heroism leader pair (order reversed)', function () {
            const deck = buildDeck(helpers.getDeckFiller(80), {
                leader: helpers.entry(VILLAINY_LEADER),
                secondLeader: helpers.entry(HEROISM_LEADER_1),
            });
            const failures = validator.validateInternalDeck(deck, fauxSunsProps());
            expect(failures[DeckValidationFailureReason.MixedAlignmentLeaders]).toBeTrue();
        });

        it('should accept a Heroism + Heroism leader pair', function () {
            const deck = buildDeck(helpers.getDeckFiller(80), {
                leader: helpers.entry(HEROISM_LEADER_1),
                secondLeader: helpers.entry(HEROISM_LEADER_2),
            });
            const failures = validator.validateInternalDeck(deck, fauxSunsProps());
            expect(failures[DeckValidationFailureReason.MixedAlignmentLeaders]).toBeUndefined();
        });

        it('should accept a Heroism + Neutral leader pair', function () {
            const deck = buildDeck(helpers.getDeckFiller(80), {
                leader: helpers.entry(HEROISM_LEADER_1),
                secondLeader: helpers.entry(NEUTRAL_LEADER),
            });
            const failures = validator.validateInternalDeck(deck, fauxSunsProps());
            expect(failures[DeckValidationFailureReason.MixedAlignmentLeaders]).toBeUndefined();
            expect(Object.keys(failures).length).toBe(0);
        });

        it('should accept a Villainy + Neutral leader pair', function () {
            const deck = buildDeck(helpers.getDeckFiller(80), {
                leader: helpers.entry(VILLAINY_LEADER),
                secondLeader: helpers.entry(NEUTRAL_LEADER),
            });
            const failures = validator.validateInternalDeck(deck, fauxSunsProps());
            expect(failures[DeckValidationFailureReason.MixedAlignmentLeaders]).toBeUndefined();
            expect(Object.keys(failures).length).toBe(0);
        });

        it('should accept a Neutral + Neutral leader pair', function () {
            const deck = buildDeck(helpers.getDeckFiller(80), {
                leader: helpers.entry(NEUTRAL_LEADER),
                secondLeader: helpers.entry(NEUTRAL_LEADER_2),
            });
            const failures = validator.validateInternalDeck(deck, fauxSunsProps());
            expect(failures[DeckValidationFailureReason.MixedAlignmentLeaders]).toBeUndefined();
            expect(Object.keys(failures).length).toBe(0);
        });
    });

    describe('format legality', function () {
        it('should reject a deck card from an unrecognized set', function () {
            const { validator: extValidator, unreleasedEntry } = helpers.makeValidatorWithUnreleasedCard();
            const filler = helpers.getDeckFiller(79);
            const deck = buildDeck([...filler, unreleasedEntry], {
                secondLeader: helpers.entry(HEROISM_LEADER_2),
            });
            const failures = extValidator.validateInternalDeck(deck, fauxSunsProps());
            expect(failures[DeckValidationFailureReason.IllegalInFormat]).toBeDefined();
            expect(failures[DeckValidationFailureReason.IllegalInFormat].length).toBeGreaterThan(0);
            expect(failures[DeckValidationFailureReason.IllegalInFormat][0].reason).toBe(IllegalInFormatReason.Unreleased);
        });

        it('should reject a deck card with an unknown set code', function () {
            const filler = helpers.getDeckFiller(79);
            const unknownCard: IInternalCardEntry = { id: 'ZZZ_999', count: 1, internalName: 'unknown-card' };
            const deck = buildDeck([...filler, unknownCard], {
                secondLeader: helpers.entry(HEROISM_LEADER_2),
            });
            const failures = validator.validateInternalDeck(deck, fauxSunsProps());
            expect(failures[DeckValidationFailureReason.UnknownCardId]).toBeDefined();
            expect(failures[DeckValidationFailureReason.UnknownCardId].length).toBeGreaterThan(0);
        });

        it('should reject a leader card placed in the main deck', function () {
            const filler = helpers.getDeckFiller(79);
            const leaderInDeck = helpers.entry(VILLAINY_LEADER);
            const deck = buildDeck([...filler, leaderInDeck], {
                secondLeader: helpers.entry(HEROISM_LEADER_2),
            });
            const failures = validator.validateInternalDeck(deck, fauxSunsProps());
            expect(failures[DeckValidationFailureReason.InvalidDecklistLocation]).toBeDefined();
            expect(failures[DeckValidationFailureReason.InvalidDecklistLocation].length).toBeGreaterThan(0);
        });

        it('should reject a deck where the second leader has an unknown set code', function () {
            const filler = helpers.getDeckFiller(80);
            const deck = buildDeck(filler, {
                secondLeader: { id: 'ZZZ_999', count: 1, internalName: 'unknown-leader' },
            });
            const failures = validator.validateInternalDeck(deck, fauxSunsProps());
            expect(failures[DeckValidationFailureReason.UnknownCardId]).toBeDefined();
            expect(failures[DeckValidationFailureReason.UnknownCardId].length).toBeGreaterThan(0);
        });

        it('should reject a deck where the second leader is from an unrecognized set', function () {
            const { validator: extValidator, unreleasedEntry } = helpers.makeValidatorWithUnreleasedCard();
            const filler = helpers.getDeckFiller(80);
            const deck = buildDeck(filler, {
                secondLeader: { ...unreleasedEntry, internalName: 'tst-leader-placeholder' },
            });
            const failures = extValidator.validateInternalDeck(deck, fauxSunsProps());
            expect(failures[DeckValidationFailureReason.IllegalInFormat]).toBeDefined();
            expect(failures[DeckValidationFailureReason.IllegalInFormat].length).toBeGreaterThan(0);
            expect(failures[DeckValidationFailureReason.IllegalInFormat][0].reason).toBe(IllegalInFormatReason.Unreleased);
        });

        it('should reject a base card placed in the main deck', function () {
            const filler = helpers.getDeckFiller(79);
            const deck = buildDeck([...filler, helpers.entry(BASE)], {
                secondLeader: helpers.entry(HEROISM_LEADER_2),
            });
            const failures = validator.validateInternalDeck(deck, fauxSunsProps());
            expect(failures[DeckValidationFailureReason.InvalidDecklistLocation]).toBeDefined();
            expect(failures[DeckValidationFailureReason.InvalidDecklistLocation].length).toBeGreaterThan(0);
        });

        it('should reject a deck where the second leader slot contains a non-leader card', function () {
            const filler = helpers.getDeckFiller(80);
            const nonLeaderCard = filler[0];
            const deck = buildDeck(filler, {
                secondLeader: nonLeaderCard,
            });
            const failures = validator.validateInternalDeck(deck, fauxSunsProps());
            expect(failures[DeckValidationFailureReason.InvalidDecklistLocation]).toBeDefined();
            expect(failures[DeckValidationFailureReason.InvalidDecklistLocation].length).toBeGreaterThan(0);
        });
    });

    describe('SWUDB format', function () {
        it('should allow secondleader in FauxSuns SWUDB format', function () {
            const deck = {
                metadata: { name: 'Test', author: 'Test' },
                leader: { id: helpers.sc(HEROISM_LEADER_1), count: 1 },
                secondleader: { id: helpers.sc(HEROISM_LEADER_2), count: 1 },
                base: { id: helpers.sc(BASE), count: 1 },
                deck: helpers.getDeckFiller(80),
            };
            const failures = validator.validateSwuDbDeck(deck, fauxSunsProps());
            expect(failures[DeckValidationFailureReason.TooManyLeaders]).toBeUndefined();
        });

        it('should reject secondleader in Premier SWUDB format', function () {
            const premierSets = new Set([...DeckValidator.getLegalSets(SwuGameFormat.Premier, CardPool.Current)].map((s) => s.toUpperCase()));
            const deck = {
                metadata: { name: 'Test', author: 'Test' },
                leader: { id: helpers.sc(premierHeroismLeader), count: 1 },
                secondleader: { id: helpers.sc(premierVillainyLeader), count: 1 },
                base: { id: helpers.sc(BASE), count: 1 },
                deck: helpers.getDeckFiller(50, premierSets),
            };
            const failures = validator.validateSwuDbDeck(deck, premierProps());
            expect(failures[DeckValidationFailureReason.TooManyLeaders]).toBeTrue();
        });
    });
});
