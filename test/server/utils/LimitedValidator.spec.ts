import { CardPool, SwuGameFormat } from '../../../server/game/core/Constants';
import { DeckValidationFailureReason } from '../../../server/utils/deck/DeckInterfaces';
import type { ISwuDbFormatDecklist } from '../../../server/utils/deck/DeckInterfaces';
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

const LIMITED_SETS = getLegalSetCodes(SwuGameFormat.Limited, CardPool.Current);

// Under the Unlimited card pool, all mainline sets are legal, so a SOR leader/base is valid.
const UNLIMITED_LEADER = 'luke-skywalker#faithful-friend';
const UNLIMITED_BASE = 'kestro-city';

describe('Limited deck validation', function () {
    let validator: DeckValidator;
    let cardDataGetter: UnitTestCardDataGetter;
    let leader: string;
    let base: string;

    beforeAll(async function () {
        ({ validator, cardDataGetter } = await createPreviewValidatorSetup());
        leader = getFirstLeader(cardDataGetter, LIMITED_SETS).internalName;
        base = getFirstBase(cardDataGetter, LIMITED_SETS).internalName;
    });

    function limitedProps(cardPool: CardPool = CardPool.Current) {
        return { format: SwuGameFormat.Limited, cardPool };
    }

    describe('deck structure', function () {
        it('should reject a SWUDB deck with a second leader', function () {
            const deck: ISwuDbFormatDecklist = {
                metadata: { name: 'Test Deck', author: 'Test Author' },
                leader: buildCardEntry(cardDataGetter, leader),
                secondleader: buildCardEntry(cardDataGetter, leader),
                base: buildCardEntry(cardDataGetter, base),
                deck: getDeckFiller(cardDataGetter, 30, LIMITED_SETS)
            };
            const failures = validator.validateSwuDbDeck(deck, limitedProps());
            expect(failures[DeckValidationFailureReason.TooManyLeaders]).toBe(true);
        });
    });

    registerCommonDeckRuleTests(() => ({ validator, cardDataGetter, leader, base }), {
        format: SwuGameFormat.Limited,
        cardPool: CardPool.Current,
        legalSets: LIMITED_SETS,
    });

    describe('Unlimited card pool', function () {
        it('should accept cards from multiple mainline sets', function () {
            const sorFiller = getDeckFiller(cardDataGetter, 15, new Set(['SOR']));
            const currentSetFiller = getDeckFiller(cardDataGetter, 15, LIMITED_SETS);
            const deck = buildValidationTestDeck(cardDataGetter, UNLIMITED_LEADER, UNLIMITED_BASE, [...sorFiller, ...currentSetFiller]);
            const failures = validator.validateInternalDeck(deck, limitedProps(CardPool.Unlimited));
            expect(Object.keys(failures).length).toBe(0);
        });
    });

    // Limited's NextSet pool always exists in tests thanks to the injected synthetic preview set (see
    // DeckValidatorTestUtils), so this block runs unconditionally.
    describe('NextSet card pool', function () {
        const LIMITED_NEXT_SETS = getLegalSetCodes(SwuGameFormat.Limited, CardPool.NextSet);
        let nextSetLeader: string;
        let nextSetBase: string;

        beforeAll(function () {
            nextSetLeader = getFirstLeader(cardDataGetter, LIMITED_NEXT_SETS).internalName;
            nextSetBase = getFirstBase(cardDataGetter, LIMITED_NEXT_SETS).internalName;
        });

        it('should reject a card from the latest released set, which rotates out under NextSet', function () {
            const filler = getDeckFiller(cardDataGetter, 29, LIMITED_NEXT_SETS);
            const currentSetCard = getDeckFiller(cardDataGetter, 1, LIMITED_SETS)[0];
            const deck = buildValidationTestDeck(cardDataGetter, nextSetLeader, nextSetBase, [...filler, currentSetCard]);
            const failures = validator.validateInternalDeck(deck, limitedProps(CardPool.NextSet));
            expect(failures[DeckValidationFailureReason.IllegalInFormat]).toBeDefined();
        });
    });
});
