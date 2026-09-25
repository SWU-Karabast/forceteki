import { CardPool, SwuGameFormat } from '../../../server/game/core/Constants';
import type { DeckValidator } from '../../../server/utils/deck/DeckValidator';
import type { UnitTestCardDataGetter } from '../../../server/utils/cardData/UnitTestCardDataGetter';
import { isReleased, rotationBlocks } from '../../../server/utils/deck/SwuSetData';
import {
    createPreviewValidatorSetup,
    getLegalSetCodes,
    TEST_BANNED_CARD_NAME,
    TEST_FUTURE_SET_CODE,
    TEST_PREVIEW_SET_CODE
} from './DeckValidatorTestUtils';

// Titles backing "name a card" prompts (e.g. Garindan). A title is legal if any non-leader card with that
// title is in a legal set and not suspended. Real cards cover rotation and reprints; the synthetic fixtures
// cover preview/future sets and ban expiry so these stay valid as the release calendar moves.
const ROTATED_UNIT = '97th Legion';  // SOR only — rotated out of Premier
const REPRINTED_UNIT = 'Wampa';      // SOR, reprinted in LOF — still legal in Premier
const ROTATED_BASE = 'Echo Base';    // SOR only — rotated out of Premier
const SOR_TOKEN = 'Shield';          // token printed in SOR

// Derived from the set data rather than pinned, so these keep pointing at the right sets as releases move
const LIMITED_CURRENT_SETS = getLegalSetCodes(SwuGameFormat.Limited, CardPool.Current);
const NON_MAINLINE_RELEASED_SETS = new Set(rotationBlocks.flatMap((block) => block.sets)
    .filter((set) => isReleased(set) && !set.mainline)
    .map((set) => set.id.toUpperCase()));

/** First title whose every non-leader, non-token printing is in one of `setCodes`, or throws if none exists. */
function findTitleOnlyInSets(cardDataGetter: UnitTestCardDataGetter, setCodes: Set<string>): string {
    const setsByTitle = new Map<string, string[]>();
    for (const cardId of cardDataGetter.cardIds) {
        const card = cardDataGetter.getCardSync(cardId);
        if (card.types.includes('leader') || card.types.includes('token') || card.internalName.startsWith('__')) {
            continue;
        }
        const printedSets = (card.setCodes ?? [card.setId]).map((setCode) => setCode.set);
        setsByTitle.set(card.title, [...(setsByTitle.get(card.title) ?? []), ...printedSets]);
    }

    for (const [title, sets] of setsByTitle) {
        if (sets.every((set) => setCodes.has(set))) {
            return title;
        }
    }
    throw new Error(`No title found that is only printed in sets ${[...setCodes].join(', ')}`);
}

describe('Legal card titles', function () {
    let validator: DeckValidator;
    let cardDataGetter: UnitTestCardDataGetter;
    let bannedCardTitle: string;

    const previewSetTitle = `${TEST_PREVIEW_SET_CODE} unit 1`;
    const futureSetTitle = `${TEST_FUTURE_SET_CODE} unit 1`;

    beforeAll(async function () {
        ({ validator, cardDataGetter } = await createPreviewValidatorSetup());
        bannedCardTitle = cardDataGetter.getCardByNameSync(TEST_BANNED_CARD_NAME).title;
    });

    describe('Premier', function () {
        it('should exclude titles whose cards have all rotated out', function () {
            const titles = validator.getLegalCardTitles(SwuGameFormat.Premier, CardPool.Current);
            expect(titles.has(ROTATED_UNIT)).toBeFalse();
            expect(titles.has(ROTATED_BASE)).toBeFalse();
        });

        it('should keep a title that has a reprint in a legal set', function () {
            const titles = validator.getLegalCardTitles(SwuGameFormat.Premier, CardPool.Current);
            expect(titles.has(REPRINTED_UNIT)).toBeTrue();
        });

        it('should always include tokens', function () {
            const titles = validator.getLegalCardTitles(SwuGameFormat.Premier, CardPool.Current);
            expect(titles.has(SOR_TOKEN)).toBeTrue();
        });
    });

    describe('Eternal', function () {
        it('should include rotated titles', function () {
            const titles = validator.getLegalCardTitles(SwuGameFormat.Eternal, CardPool.Current);
            expect(titles.has(ROTATED_UNIT)).toBeTrue();
            expect(titles.has(ROTATED_BASE)).toBeTrue();
        });

        it('should exclude a suspended card', function () {
            const titles = validator.getLegalCardTitles(SwuGameFormat.Eternal, CardPool.Current);
            expect(titles.has(bannedCardTitle)).toBeFalse();
        });

        it('should include a suspended card once its ban has expired under NextSet', function () {
            const titles = validator.getLegalCardTitles(SwuGameFormat.Eternal, CardPool.NextSet);
            expect(titles.has(bannedCardTitle)).toBeTrue();
        });
    });

    describe('preview sets', function () {
        it('should exclude the next set under the Current pool', function () {
            const titles = validator.getLegalCardTitles(SwuGameFormat.Premier, CardPool.Current);
            expect(titles.has(previewSetTitle)).toBeFalse();
        });

        it('should include the next set under the NextSet pool', function () {
            const titles = validator.getLegalCardTitles(SwuGameFormat.Premier, CardPool.NextSet);
            expect(titles.has(previewSetTitle)).toBeTrue();
        });

        it('should never include a future set in a constructed pool', function () {
            expect(validator.getLegalCardTitles(SwuGameFormat.Premier, CardPool.Current).has(futureSetTitle)).toBeFalse();
            expect(validator.getLegalCardTitles(SwuGameFormat.Premier, CardPool.NextSet).has(futureSetTitle)).toBeFalse();
        });
    });

    describe('Limited', function () {
        let currentSetTitle: string;
        let nonMainlineTitle: string;

        beforeAll(function () {
            currentSetTitle = findTitleOnlyInSets(cardDataGetter, LIMITED_CURRENT_SETS);
            nonMainlineTitle = findTitleOnlyInSets(cardDataGetter, NON_MAINLINE_RELEASED_SETS);
        });

        it('should only include the current mainline set under the Current pool', function () {
            const titles = validator.getLegalCardTitles(SwuGameFormat.Limited, CardPool.Current);
            expect(titles.has(currentSetTitle)).toBeTrue();
            expect(titles.has(ROTATED_UNIT)).toBeFalse();
        });

        it('should include every mainline set under the Unlimited pool, e.g. for chaos drafts', function () {
            const titles = validator.getLegalCardTitles(SwuGameFormat.Limited, CardPool.Unlimited);
            expect(titles.has(currentSetTitle)).toBeTrue();
            expect(titles.has(ROTATED_UNIT)).toBeTrue();
        });

        it('should exclude non-mainline sets under the Unlimited pool, as they cannot be drafted', function () {
            const titles = validator.getLegalCardTitles(SwuGameFormat.Limited, CardPool.Unlimited);
            expect(titles.has(nonMainlineTitle)).toBeFalse();
        });

        it('should always include tokens', function () {
            expect(validator.getLegalCardTitles(SwuGameFormat.Limited, CardPool.Current).has(SOR_TOKEN)).toBeTrue();
            expect(validator.getLegalCardTitles(SwuGameFormat.Limited, CardPool.Unlimited).has(SOR_TOKEN)).toBeTrue();
        });
    });

    describe('leaders', function () {
        it('should never include a title that only exists on leaders', function () {
            const titles = validator.getLegalCardTitles(SwuGameFormat.Open, CardPool.Unlimited);
            const leaderOnlyTitles = cardDataGetter.getLeaderCards()
                .map((leader) => leader.name)
                .filter((name) => !cardDataGetter.allNonLeaderCardTitles.includes(name));

            expect(leaderOnlyTitles.length).toBeGreaterThan(0);
            expect(leaderOnlyTitles.filter((title) => titles.has(title))).toEqual([]);
        });
    });

    describe('Open', function () {
        it('should include every non-leader title', function () {
            const titles = validator.getLegalCardTitles(SwuGameFormat.Open, CardPool.Unlimited);
            expect(cardDataGetter.allNonLeaderCardTitles.filter((title) => !titles.has(title))).toEqual([]);
        });
    });

    it('should return the cached result for repeated calls with the same format and card pool', function () {
        const first = validator.getLegalCardTitles(SwuGameFormat.Premier, CardPool.Current);
        const second = validator.getLegalCardTitles(SwuGameFormat.Premier, CardPool.Current);
        expect(second).toBe(first);
    });
});
