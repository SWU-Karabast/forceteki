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
    RELEASED_SETS,
    TEST_BANNED_CARD_NAME
} from './DeckValidatorTestUtils';
import { registerCommonDeckRuleTests } from './CommonDeckRuleTests';

const LEADER = 'luke-skywalker#faithful-friend'; // SOR — legal in Eternal
const BASE = 'kestro-city';                      // SOR — legal in Eternal

describe('Eternal deck validation', function () {
    let validator: DeckValidator;
    let cardDataGetter: UnitTestCardDataGetter;

    beforeAll(async function () {
        ({ validator, cardDataGetter } = await createPreviewValidatorSetup());
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

    describe('suspended base', function () {
        // The common ban list tests put each suspended card in the main deck; a base is only ever played in
        // the base slot, so check it is rejected there too. Data Vault raises the minimum deck size by 10.
        it('should reject Data Vault as the deck\'s base', function () {
            const deck = buildDeck(getDeckFiller(cardDataGetter, 60, RELEASED_SETS), { base: buildCardEntry(cardDataGetter, 'data-vault') });
            const failures = validator.validateInternalDeck(deck, eternalProps());
            expect(failures[DeckValidationFailureReason.IllegalInFormat]).toEqual([
                jasmine.objectContaining({ reason: IllegalInFormatReason.Suspended })
            ]);
        });

        it('should still allow Data Vault as the deck\'s base in Open', function () {
            const deck = buildDeck(getDeckFiller(cardDataGetter, 60, RELEASED_SETS), { base: buildCardEntry(cardDataGetter, 'data-vault') });
            const failures = validator.validateInternalDeck(deck, { format: SwuGameFormat.Open, cardPool: CardPool.Current });
            expect(failures[DeckValidationFailureReason.IllegalInFormat]).toBeUndefined();
        });
    });

    registerCommonDeckRuleTests(() => ({ validator, cardDataGetter, leader: LEADER, base: BASE }), {
        format: SwuGameFormat.Eternal,
        cardPool: CardPool.Current,
        legalSets: RELEASED_SETS,
    });

    describe('NextSet card pool', function () {
        function nextSetProps() {
            return { format: SwuGameFormat.Eternal, cardPool: CardPool.NextSet };
        }

        it('should not enforce the sideboard size cap', function () {
            const all = getDeckFiller(cardDataGetter, 61, RELEASED_SETS);
            const deck = buildDeck(all.slice(0, 50), { sideboard: all.slice(50, 61) });
            const failures = validator.validateInternalDeck(deck, nextSetProps());
            expect(failures[DeckValidationFailureReason.MaxSideboardSizeExceeded]).toBeUndefined();
        });

        // A suspension whose `expiresWith` set is the upcoming set is active under Current but lifts under
        // NextSet (which includes that set) — the behavior the real "expires with the next release" bans rely
        // on. Exercised here with the synthetic ban (expiring with the synthetic TPRV set) so it stays valid
        // regardless of the real ban list.
        it('should keep the card suspended under Current while its ban is active', function () {
            const filler = getDeckFiller(cardDataGetter, 49, RELEASED_SETS);
            const deck = buildDeck([...filler, buildCardEntry(cardDataGetter, TEST_BANNED_CARD_NAME)]);
            const failures = validator.validateInternalDeck(deck, eternalProps());
            expect(failures[DeckValidationFailureReason.IllegalInFormat]).toBeDefined();
            expect(failures[DeckValidationFailureReason.IllegalInFormat][0].reason).toBe(IllegalInFormatReason.Suspended);
        });

        it('should accept the card under NextSet once its ban has expired', function () {
            const filler = getDeckFiller(cardDataGetter, 49, RELEASED_SETS);
            const deck = buildDeck([...filler, buildCardEntry(cardDataGetter, TEST_BANNED_CARD_NAME)]);
            const failures = validator.validateInternalDeck(deck, nextSetProps());
            expect(failures[DeckValidationFailureReason.IllegalInFormat]).toBeUndefined();
        });
    });
});
