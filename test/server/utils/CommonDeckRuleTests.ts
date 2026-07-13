import { CardPool, SwuGameFormat } from '../../../server/game/core/Constants';
import { DeckValidationFailureReason, IllegalInFormatReason } from '../../../server/utils/deck/DeckInterfaces';
import type { IDecklistInternal } from '../../../server/utils/deck/DeckInterfaces';
import { DeckValidator } from '../../../server/utils/deck/DeckValidator';
import type { UnitTestCardDataGetter } from '../../../server/utils/cardData/UnitTestCardDataGetter';
import { formatRules, nonRotatingSets, rotationBlocks } from '../../../server/utils/deck/SwuSetData';
import { buildCardEntry, buildValidationTestDeck, getDeckFiller, getFirstBase, getFirstCardInSet, getFirstLeader, getLegalSetCodes } from './DeckValidatorTestUtils';

// Representative sets for the format-legality probes, derived from the set data so they don't need manual
// upkeep as sets release and rotate. Uppercased to match `card.setId.set`. Any probe may be undefined (e.g.
// there is currently no unreleased mainline set); undefined probes are skipped.
const rotationSets = rotationBlocks.flatMap((block) => block.sets);
const OLD_RELEASED_SET = rotationSets.find((s) => s.released)?.id.toUpperCase();           // earliest released set (rotated out of the rotating formats)
const NON_ROTATING_SET = nonRotatingSets[0]?.id.toUpperCase();                             // a non-rotating set (legal only in Eternal/Open)
const PREVIEW_SET = rotationSets.find((s) => !s.released && s.mainline)?.id.toUpperCase();  // upcoming unreleased mainline ("preview") set

/** Per-format configuration that drives the shared deck-building rule tests. */
export interface ICommonDeckRuleConfig {
    format: SwuGameFormat;
    cardPool: CardPool;

    /** Sets to draw filler cards from (must all be legal in this format/pool). */
    legalSets: Set<string>;

    // Deck size, copy limit, and sideboard cap are derived from `formatRules` / `getMaxSideboardSize`, and the
    // format-legality expectations are derived from the legal sets — see registerCommonDeckRuleTests — so none
    // of them need to be configured here.
}

/** Lazily-resolved test context; the validator and leader/base are set up in the spec's `beforeAll`. */
export interface ICommonTestContext {
    validator: DeckValidator;
    cardDataGetter: UnitTestCardDataGetter;
    leader: string;
    base: string;
}

/**
 * Registers the deck-building and format-legality tests that recur across formats, parameterized by the
 * format's {@link ICommonDeckRuleConfig}. Blocks that don't apply to a format are skipped automatically
 * (e.g. Limited gets the "no copy limit" case instead of the 3-copy cap; Open skips the NextSet check).
 *
 * Call this inside a format spec's top-level `describe`, passing a getter that returns the current
 * context so it resolves the validator/leader/base (set up in `beforeAll`) at test-run time.
 */
export function registerCommonDeckRuleTests(getContext: () => ICommonTestContext, config: ICommonDeckRuleConfig): void {
    // Derive the rule values from the same source the validator uses, so any change there flows into the tests.
    const rules = formatRules.get(config.format);
    const minDeckSize = rules.minDeckSize;
    const maxCardCopies = rules.maxCardCopies;
    const sideboardCap = DeckValidator.getMaxSideboardSize(config.format, config.cardPool);

    // A card is legal exactly when its set is in the pool's legal sets, so the legality expectations below
    // are derived rather than configured. Any illegal (but recognized) set yields the single NotLegalInFormat reason.
    const currentLegalSets = getLegalSetCodes(config.format, config.cardPool);
    const nextSetLegalSets = getLegalSetCodes(config.format, CardPool.NextSet);

    // A probe set that is illegal in this format (if any), used to check that legality applies to the sideboard.
    const illegalProbeSet = [OLD_RELEASED_SET, NON_ROTATING_SET, PREVIEW_SET].find((s) => s != null && !currentLegalSets.has(s));

    function props() {
        return { format: config.format, cardPool: config.cardPool };
    }

    /** Builds a deck of `size` legal filler cards (each a single copy). */
    function deckOfSize(ctx: ICommonTestContext, size: number): IDecklistInternal {
        return buildValidationTestDeck(ctx.cardDataGetter, ctx.leader, ctx.base, getDeckFiller(ctx.cardDataGetter, size, config.legalSets));
    }

    /** Builds a minimum-size deck in which one card appears `count` times. */
    function deckWithCardCount(ctx: ICommonTestContext, count: number): IDecklistInternal {
        const filler = getDeckFiller(ctx.cardDataGetter, minDeckSize - count + 1, config.legalSets);
        const multiCard = { ...filler[0], count };
        return buildValidationTestDeck(ctx.cardDataGetter, ctx.leader, ctx.base, [multiCard, ...filler.slice(1)]);
    }

    /** Builds a minimum-size main deck plus a sideboard of `sideboardSize` cards. */
    function deckWithSideboard(ctx: ICommonTestContext, sideboardSize: number): IDecklistInternal {
        const all = getDeckFiller(ctx.cardDataGetter, minDeckSize + sideboardSize, config.legalSets);
        return buildValidationTestDeck(ctx.cardDataGetter, ctx.leader, ctx.base, all.slice(0, minDeckSize), { sideboard: all.slice(minDeckSize) });
    }

    /** Builds a minimum-size legal deck with one extra card drawn from `set`. */
    function deckWithCardFromSet(ctx: ICommonTestContext, set: string): IDecklistInternal {
        const filler = getDeckFiller(ctx.cardDataGetter, minDeckSize - 1, config.legalSets);
        const extraCard = getFirstCardInSet(ctx.cardDataGetter, set);
        return buildValidationTestDeck(ctx.cardDataGetter, ctx.leader, ctx.base, [...filler, extraCard]);
    }

    describe('deck size', function () {
        it(`should accept a valid deck of the minimum size (${minDeckSize} cards)`, function () {
            const ctx = getContext();
            const failures = ctx.validator.validateInternalDeck(deckOfSize(ctx, minDeckSize), props());
            expect(Object.keys(failures).length).toBe(0);
        });

        it('should accept a valid deck larger than the minimum size', function () {
            const ctx = getContext();
            const failures = ctx.validator.validateInternalDeck(deckOfSize(ctx, minDeckSize + 5), props());
            expect(Object.keys(failures).length).toBe(0);
        });

        it(`should reject a deck with fewer than ${minDeckSize} cards`, function () {
            const ctx = getContext();
            const failures = ctx.validator.validateInternalDeck(deckOfSize(ctx, minDeckSize - 1), props());
            expect(failures[DeckValidationFailureReason.MinDecklistSizeNotMet]).toBeDefined();
            expect(failures[DeckValidationFailureReason.MinDecklistSizeNotMet].actualDecklistSize).toBe(minDeckSize - 1);
        });

        it('should reject a deck whose mainboard is short even if the sideboard brings the total to the minimum', function () {
            const ctx = getContext();
            const all = getDeckFiller(ctx.cardDataGetter, minDeckSize, config.legalSets);
            const deck = buildValidationTestDeck(ctx.cardDataGetter, ctx.leader, ctx.base, all.slice(0, minDeckSize - 1), { sideboard: [all[minDeckSize - 1]] });
            const failures = ctx.validator.validateInternalDeck(deck, props());
            expect(failures[DeckValidationFailureReason.MinDecklistSizeNotMet]).toBeUndefined();
            expect(failures[DeckValidationFailureReason.MinMainboardSizeNotMet]).toBeDefined();
            expect(failures[DeckValidationFailureReason.MinMainboardSizeNotMet].actualBoardedSize).toBe(minDeckSize - 1);
        });
    });

    describe('copy limits', function () {
        if (maxCardCopies != null) {
            it(`should allow up to ${maxCardCopies} copies of a card`, function () {
                const ctx = getContext();
                const failures = ctx.validator.validateInternalDeck(deckWithCardCount(ctx, maxCardCopies), props());
                expect(failures[DeckValidationFailureReason.TooManyCopiesOfCard]).toBeUndefined();
            });

            it(`should reject ${maxCardCopies + 1} copies of a card`, function () {
                const ctx = getContext();
                const failures = ctx.validator.validateInternalDeck(deckWithCardCount(ctx, maxCardCopies + 1), props());
                expect(failures[DeckValidationFailureReason.TooManyCopiesOfCard]).toBeDefined();
            });
        } else {
            it('should allow more than 3 copies of a card (no copy limit)', function () {
                const ctx = getContext();
                const failures = ctx.validator.validateInternalDeck(deckWithCardCount(ctx, 4), props());
                expect(failures[DeckValidationFailureReason.TooManyCopiesOfCard]).toBeUndefined();
            });
        }
    });

    describe('sideboard', function () {
        if (sideboardCap != null) {
            it(`should allow a sideboard of fewer than ${sideboardCap} cards`, function () {
                const ctx = getContext();
                const failures = ctx.validator.validateInternalDeck(deckWithSideboard(ctx, sideboardCap - 5), props());
                expect(failures[DeckValidationFailureReason.MaxSideboardSizeExceeded]).toBeUndefined();
            });

            it(`should allow a sideboard of up to ${sideboardCap} cards`, function () {
                const ctx = getContext();
                const failures = ctx.validator.validateInternalDeck(deckWithSideboard(ctx, sideboardCap), props());
                expect(failures[DeckValidationFailureReason.MaxSideboardSizeExceeded]).toBeUndefined();
            });

            it(`should reject a sideboard of more than ${sideboardCap} cards`, function () {
                const ctx = getContext();
                const failures = ctx.validator.validateInternalDeck(deckWithSideboard(ctx, sideboardCap + 1), props());
                expect(failures[DeckValidationFailureReason.MaxSideboardSizeExceeded]).toBeDefined();
                expect(failures[DeckValidationFailureReason.MaxSideboardSizeExceeded].actualSideboardSize).toBe(sideboardCap + 1);
            });
        } else {
            it('should allow a sideboard larger than 10 cards (no cap)', function () {
                const ctx = getContext();
                const failures = ctx.validator.validateInternalDeck(deckWithSideboard(ctx, 15), props());
                expect(failures[DeckValidationFailureReason.MaxSideboardSizeExceeded]).toBeUndefined();
            });
        }

        // Format legality applies to sideboard cards too, not just the mainboard.
        if (illegalProbeSet != null) {
            it(`should reject a sideboard containing a card from an illegal set (${illegalProbeSet})`, function () {
                const ctx = getContext();
                const mainboard = getDeckFiller(ctx.cardDataGetter, minDeckSize, config.legalSets);
                const illegalCard = getFirstCardInSet(ctx.cardDataGetter, illegalProbeSet);
                const deck = buildValidationTestDeck(ctx.cardDataGetter, ctx.leader, ctx.base, mainboard, { sideboard: [illegalCard] });
                const failures = ctx.validator.validateInternalDeck(deck, props());
                expect(failures[DeckValidationFailureReason.IllegalInFormat]).toBeDefined();
                expect(failures[DeckValidationFailureReason.IllegalInFormat][0].reason).toBe(IllegalInFormatReason.NotLegalInFormat);
            });
        }
    });

    describe('format legality', function () {
        // One representative card from each kind of set; whether it's legal (and why not) is derived from
        // the format's legal sets rather than hard-coded per format.
        for (const probeSet of [OLD_RELEASED_SET, NON_ROTATING_SET, PREVIEW_SET].filter((s): s is string => s != null)) {
            const legal = currentLegalSets.has(probeSet);

            it(legal
                ? `should accept a card from ${probeSet}`
                : `should reject a card from ${probeSet} (NotLegalInFormat)`, function () {
                const ctx = getContext();
                const failures = ctx.validator.validateInternalDeck(deckWithCardFromSet(ctx, probeSet), props());
                if (legal) {
                    expect(failures[DeckValidationFailureReason.IllegalInFormat]).toBeUndefined();
                } else {
                    expect(failures[DeckValidationFailureReason.IllegalInFormat]).toBeDefined();
                    expect(failures[DeckValidationFailureReason.IllegalInFormat][0].reason).toBe(IllegalInFormatReason.NotLegalInFormat);
                }
            });
        }

        // When the preview set is illegal now but legal once previews are included, verify that switching
        // the pool to NextSet makes it legal.
        if (!currentLegalSets.has(PREVIEW_SET) && nextSetLegalSets.has(PREVIEW_SET)) {
            it(`should accept a ${PREVIEW_SET} card once the pool is switched to NextSet`, function () {
                const ctx = getContext();
                const filler = getDeckFiller(ctx.cardDataGetter, minDeckSize - 1, nextSetLegalSets);
                const previewCard = getFirstCardInSet(ctx.cardDataGetter, PREVIEW_SET);
                const leader = getFirstLeader(ctx.cardDataGetter, nextSetLegalSets).internalName;
                const base = getFirstBase(ctx.cardDataGetter, nextSetLegalSets).internalName;
                const deck = buildValidationTestDeck(ctx.cardDataGetter, leader, base, [...filler, previewCard]);
                const failures = ctx.validator.validateInternalDeck(deck, { format: config.format, cardPool: CardPool.NextSet });
                expect(failures[DeckValidationFailureReason.IllegalInFormat]).toBeUndefined();
            });
        }
    });

    // Ban list — derived from the format's own suspended cards, so any format with a ban list (Eternal now,
    // Premier again in the future) is covered automatically.
    const bannedCards = [...rules.bannedCards.values()];
    if (bannedCards.length > 0) {
        describe('ban list', function () {
            for (const bannedCard of bannedCards) {
                it(`should reject the suspended card ${bannedCard}`, function () {
                    const ctx = getContext();
                    const filler = getDeckFiller(ctx.cardDataGetter, minDeckSize - 1, config.legalSets);
                    const deck = buildValidationTestDeck(ctx.cardDataGetter, ctx.leader, ctx.base, [...filler, buildCardEntry(ctx.cardDataGetter, bannedCard)]);
                    const failures = ctx.validator.validateInternalDeck(deck, props());
                    expect(failures[DeckValidationFailureReason.IllegalInFormat]).toBeDefined();
                    expect(failures[DeckValidationFailureReason.IllegalInFormat][0].reason).toBe(IllegalInFormatReason.Suspended);
                });
            }
        });
    }
}
