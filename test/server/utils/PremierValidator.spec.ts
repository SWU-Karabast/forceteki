import { CardPool, SwuGameFormat } from '../../../server/game/core/Constants';
import { DeckValidationFailureReason, IllegalInFormatReason } from '../../../server/utils/deck/DeckInterfaces';
import type { IInternalCardEntry, ISwuDbFormatDecklist } from '../../../server/utils/deck/DeckInterfaces';
import { DeckValidator } from '../../../server/utils/deck/DeckValidator';
import { UnitTestCardDataGetter } from '../../../server/utils/cardData/UnitTestCardDataGetter';
import {
    buildCardEntry,
    buildValidationTestDeck,
    createPreviewValidatorSetup,
    getDeckFiller,
    getFirstBase,
    getFirstLeader,
    getLegalSetCodes
} from './DeckValidatorTestUtils';
import { registerCommonDeckRuleTests } from './CommonDeckRuleTests';

const PREMIER_SETS = getLegalSetCodes(SwuGameFormat.Premier, CardPool.Current);
const PREMIER_NEXT_SETS = getLegalSetCodes(SwuGameFormat.Premier, CardPool.NextSet);

describe('Premier deck validation', function () {
    let validator: DeckValidator;
    let cardDataGetter: UnitTestCardDataGetter;
    let leader: string;
    let base: string;

    beforeAll(async function () {
        ({ validator, cardDataGetter } = await createPreviewValidatorSetup());
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

    registerCommonDeckRuleTests(() => ({ validator, cardDataGetter, leader, base }), {
        format: SwuGameFormat.Premier,
        cardPool: CardPool.Current,
        legalSets: PREMIER_SETS,
    });

    describe('format legality', function () {
        it('should reject a rotated-out base in the base slot', function () {
            const filler = getDeckFiller(cardDataGetter, 50, PREMIER_SETS);
            const deck = buildDeck(filler, { base: buildCardEntry(cardDataGetter, 'echo-base') }); // If Echo Base is ever reprinted, we will need to change this
            const failures = validator.validateInternalDeck(deck, premierProps());
            expect(failures[DeckValidationFailureReason.IllegalInFormat]).toBeDefined();
            expect(failures[DeckValidationFailureReason.IllegalInFormat][0].reason).toBe(IllegalInFormatReason.NotLegalInFormat);
        });

        it('should reject a rotated-out leader in the leader slot', function () {
            const filler = getDeckFiller(cardDataGetter, 50, PREMIER_SETS);
            const deck = buildDeck(filler, { leader: buildCardEntry(cardDataGetter, 'luke-skywalker#faithful-friend') }); // SOR leader, rotated out of Premier
            const failures = validator.validateInternalDeck(deck, premierProps());
            expect(failures[DeckValidationFailureReason.IllegalInFormat]).toBeDefined();
            expect(failures[DeckValidationFailureReason.IllegalInFormat][0].reason).toBe(IllegalInFormatReason.NotLegalInFormat);
        });
    });

    describe('NextSet card pool', function () {
        function nextSetProps() {
            return { format: SwuGameFormat.Premier, cardPool: CardPool.NextSet };
        }

        it('should not enforce the sideboard size cap', function () {
            const all = getDeckFiller(cardDataGetter, 61, PREMIER_NEXT_SETS);
            const deck = buildDeck(all.slice(0, 50), { sideboard: all.slice(50, 61) });
            const failures = validator.validateInternalDeck(deck, nextSetProps());
            expect(failures[DeckValidationFailureReason.MaxSideboardSizeExceeded]).toBeUndefined();
        });
    });
});
