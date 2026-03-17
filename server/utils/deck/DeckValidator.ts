import type { CardDataGetter } from '../cardData/CardDataGetter';
import { cards, overrideNotImplementedCards } from '../../game/cards/Index';
import { Card } from '../../game/core/card/Card';
import { CardType, CardPool, SwuGameFormat } from '../../game/core/Constants';
import type { IDecklistInternal, ISwuDbFormatCardEntry, IDeckValidationProperties } from './DeckInterfaces';
import { DecklistLocation, DeckValidationFailureReason, type IDeckValidationFailures, type ISwuDbFormatDecklist } from './DeckInterfaces';
import type { ICardDataJson, ISetCode } from '../cardData/CardDataInterfaces';
import { Contract } from '../../game/core/utils/Contract';
import { EnumHelpers } from '../../game/core/utils/EnumHelpers';
import { formatRules, nonRotatingSets, rotationBlocks, SwuSetId } from './SwuSetData';

const maxCopiesOfCards = new Map([
    ['2177194044', 15], // Swarming Vulture Droid
]);

const minDeckSizeModifier = new Map([
    ['4301437393', -5], // Thermal Oscillator
    ['4028826022', 10], // Data Vault
]);

interface ICardCheckData {
    setId: ISetCode;
    titleAndSubtitle: string;
    type: CardType;
    sets: SwuSetId[];
    implemented: boolean;
    minDeckSizeModifier?: number;
    maxCopiesOfCardOverride?: number;
}

export class DeckValidator {
    private readonly cardData: Map<string, ICardCheckData>;
    private readonly setCodeToId: Map<string, string>;

    public static filterOutSideboardingErrors(failures: IDeckValidationFailures): IDeckValidationFailures {
        const filtered: IDeckValidationFailures = {};

        for (const [key, value] of Object.entries(failures)) {
            if (key !== DeckValidationFailureReason.MinMainboardSizeNotMet &&
              key !== DeckValidationFailureReason.MaxSideboardSizeExceeded) {
                filtered[key] = value;
            }
        }

        return filtered;
    }

    public static async createAsync(cardDataGetter: CardDataGetter): Promise<DeckValidator> {
        const allCardsData: ICardDataJson[] = [];
        for (const cardId of cardDataGetter.cardIds) {
            allCardsData.push(await cardDataGetter.getCardAsync(cardId));
        }

        return new DeckValidator(allCardsData, cardDataGetter.setCodeMap);
    }

    private static parseSets(cardData: ICardDataJson): SwuSetId[] {
        if (cardData.setCodes) {
            return cardData.setCodes.map((code) => EnumHelpers.checkConvertToEnum(code.set, SwuSetId)[0]);
        }
        return [EnumHelpers.checkConvertToEnum(cardData.setId.set, SwuSetId)[0]];
    }

    /**
     * Computes the set of legal {@link SwuSetId}s for a given format and card pool combination.
     *
     * For **Open**, all sets are included.
     *
     * For **Limited**, only a single set is legal, unless the card pool is Unlimited in which
     * case all sets are legal. The single legal set is determined by:
     * - {@link CardPool.Current}: the most recently released set
     * - {@link CardPool.NextSet}: the most recent unreleased set
     *
     * For rotating formats (**Premier**), only released rotation blocks are considered
     * under {@link CardPool.Current}, whereas {@link CardPool.NextSet} also includes unreleased blocks.
     * The format's `rotationBlockCount` rule then trims to the latest N blocks.
     *
     * Non-rotating sets (e.g. TS26) are added if their `legalFormats` includes the requested format,
     * subject to the same released/unreleased filtering.
     */
    public static getLegalSets(format: SwuGameFormat, cardPool: CardPool): Set<SwuSetId> {
        // Open or Unlimited pool: everything, always
        if (format === SwuGameFormat.Open) {
            const all = new Set<SwuSetId>(rotationBlocks.flatMap((block) => block.sets.map((s) => s.id)));
            for (const nrs of nonRotatingSets) {
                all.add(nrs.id);
            }
            return all;
        }

        // Limited: restrict to a single set
        if (format === SwuGameFormat.Limited) {
            return this.getLimitedLegalSet(cardPool);
        }

        Contract.assertFalse(cardPool === CardPool.Unlimited, `Card pool '${CardPool.Unlimited}' is not supported for format '${format}'`);

        const rules = formatRules.get(format);

        // Determine candidate rotation blocks
        let candidateBlocks = cardPool === CardPool.Current
            ? rotationBlocks.filter((block) => block.sets.some((s) => s.released))
            : [...rotationBlocks];

        // Apply rotation window (take the last N blocks)
        if (rules.rotationBlockCount != null) {
            candidateBlocks = candidateBlocks.slice(-rules.rotationBlockCount);
        }

        const legalSets = new Set<SwuSetId>();
        for (const block of candidateBlocks) {
            for (const set of block.sets) {
                if (cardPool === CardPool.Current && !set.released) {
                    continue;
                }
                legalSets.add(set.id);
            }
        }

        // Add non-rotating sets that are legal in this format
        for (const nrs of nonRotatingSets) {
            if (nrs.legalFormats.has(format) && (cardPool === CardPool.NextSet || nrs.released)) {
                legalSets.add(nrs.id);
            }
        }

        return legalSets;
    }

    /**
     * Returns the legal sets for Limited format based on the card pool. Only mainline sets are legal in Limited.
     */
    private static getLimitedLegalSet(cardPool: CardPool): Set<SwuSetId> {
        const allSets = rotationBlocks.flatMap((block) => block.sets);

        if (cardPool === CardPool.Unlimited) {
            return new Set<SwuSetId>(allSets
                .filter((s) => s.mainline)
                .map((s) => s.id)
            );
        }

        const targetSet = cardPool === CardPool.Current
            ? [...allSets].reverse().find((s) => s.released && s.mainline)
            : allSets.find((s) => !s.released && s.mainline);

        Contract.assertNotNullLike(targetSet, `No ${cardPool === CardPool.Current ? 'released' : 'unreleased'} mainline sets found for Limited format`);

        return new Set<SwuSetId>([targetSet.id]);
    }

    private constructor(allCardsData: ICardDataJson[], setCodeToId: Map<string, string>) {
        const implementedCardIds = new Set(cards.keys());
        const overrideNotImplementedCardIds = new Set(overrideNotImplementedCards.keys());

        this.cardData = new Map<string, ICardCheckData>();
        this.setCodeToId = setCodeToId;

        for (const cardData of allCardsData) {
            const cardCheckData: ICardCheckData = {
                setId: cardData.setId,
                titleAndSubtitle: `${cardData.title}${cardData.subtitle ? `, ${cardData.subtitle}` : ''}`,
                type: Card.buildTypeFromPrinted(cardData.types),
                sets: DeckValidator.parseSets(cardData),
                implemented: !overrideNotImplementedCardIds.has(cardData.id) && (!Card.checkHasNonKeywordAbilityText(cardData) || implementedCardIds.has(cardData.id)),
                minDeckSizeModifier: minDeckSizeModifier.get(cardData.id),
                maxCopiesOfCardOverride: maxCopiesOfCards.get(cardData.id)
            };

            this.cardData.set(cardData.id, cardCheckData);
        }
    }

    public getUnimplementedCards(): { id: string; setId: ISetCode; types: string; titleAndSubtitle: string }[] {
        const unimplementedCards: { id: string; setId: ISetCode; types: string; titleAndSubtitle: string }[] = [];

        for (const [cardId, cardData] of this.cardData) {
            if (!cardData.implemented) {
                unimplementedCards.push({ id: cardId, setId: cardData.setId, types: cardData.type, titleAndSubtitle: cardData.titleAndSubtitle });
            }
        }

        unimplementedCards.sort((a, b) => a.setId.set.localeCompare(b.setId.set) || a.titleAndSubtitle.localeCompare(b.titleAndSubtitle));

        return unimplementedCards;
    }

    public getMinimumSideboardedDeckSize(baseId: string, format: SwuGameFormat): number {
        const rules = formatRules.get(format);
        Contract.assertNotNullLike(rules, `No format rules found for format '${format}'`);
        const startingDeckSizeValue = rules.minDeckSize;

        const baseData = this.getCardCheckData(baseId);
        if (!baseData) {
            return startingDeckSizeValue;
        }
        return startingDeckSizeValue + (baseData.minDeckSizeModifier ?? 0);
    }

    // update this function if anything affects the sideboard count
    public getMaxSideboardSize(format: SwuGameFormat, cardPool: CardPool): number {
        // Sideboard is only restricted in Premier and Eternal. We relax the restriction in Next Set mode.
        if (format === SwuGameFormat.Open || format === SwuGameFormat.Limited || cardPool === CardPool.NextSet) {
            return -1;
        }
        return 10;
    }

    public getUnimplementedCardsInDeck(deck: IDecklistInternal | ISwuDbFormatDecklist): { id: string; name: string }[] {
        if (!deck) {
            return [];
        }
        const deckCards: ISwuDbFormatCardEntry[] = [...deck.deck, ...(deck.sideboard ?? [])];
        const unimplemented: { id: string; name: string }[] = [];

        // check leader
        const leaderData = this.getCardCheckData(deck.leader.id);
        if (leaderData && !leaderData.implemented) {
            unimplemented.push({ id: deck.leader.id, name: leaderData.titleAndSubtitle });
        }

        // check base
        const baseData = this.getCardCheckData(deck.base.id);
        if (baseData && !baseData.implemented) {
            unimplemented.push({ id: deck.base.id, name: baseData.titleAndSubtitle });
        }

        // check other cards
        for (const card of deckCards) {
            const cardData = this.getCardCheckData(card.id);
            if (cardData && !cardData.implemented) {
                unimplemented.push({ id: card.id, name: cardData.titleAndSubtitle });
            }
        }

        return unimplemented;
    }

    // Validate IDecklistInternal
    public validateInternalDeck(deck: IDecklistInternal, properties: IDeckValidationProperties): IDeckValidationFailures {
        // Basic structure check (internal decks have mandatory leader, base, and deck)
        if (!deck || !deck.leader || !deck.base || !deck.deck || deck.deck.length === 0) {
            return { [DeckValidationFailureReason.InvalidDeckData]: true };
        }
        return this.validateCommonDeck(deck, properties.format, properties.cardPool);
    }

    // Validate the ISwuDbDeckList
    public validateSwuDbDeck(deck: ISwuDbFormatDecklist, properties: IDeckValidationProperties): IDeckValidationFailures {
        // Basic structure check (SWU‑DB decks use optional properties, so we check them explicitly)
        if (!deck || !deck.leader || !deck.base || !deck.deck || deck.deck.length === 0) {
            return { [DeckValidationFailureReason.InvalidDeckData]: true };
        }
        // SWU‑DB decks must not have a second leader.
        if (deck.secondleader) {
            return { [DeckValidationFailureReason.TooManyLeaders]: true };
        }
        return this.validateCommonDeck(deck, properties.format, properties.cardPool);
    }

    private normalizeSetCodeId(id: string): string {
        const underscoreIndex = id.indexOf('_');
        if (underscoreIndex === -1 || id.length - underscoreIndex - 1 >= 3) {
            return id;
        }
        const setCode = id.substring(0, underscoreIndex);
        const cardNumber = id.substring(underscoreIndex + 1);
        return `${setCode}_${cardNumber.padStart(3, '0')}`;
    }

    private normalizeCardEntryIds(entries: ISwuDbFormatCardEntry[]): void {
        for (const entry of entries) {
            entry.id = this.normalizeSetCodeId(entry.id);
        }
    }

    private validateCommonDeck(deck: IDecklistInternal | ISwuDbFormatDecklist, format: SwuGameFormat, cardPool: CardPool): IDeckValidationFailures {
        try {
            // Normalize set code IDs to ensure card numbers are zero-padded (e.g. LAW_3 -> LAW_003)
            deck.leader.id = this.normalizeSetCodeId(deck.leader.id);
            deck.base.id = this.normalizeSetCodeId(deck.base.id);
            this.normalizeCardEntryIds(deck.deck);
            if (deck.sideboard) {
                this.normalizeCardEntryIds(deck.sideboard);
            }

            const failures: IDeckValidationFailures = {
                [DeckValidationFailureReason.IllegalInFormat]: [],
                [DeckValidationFailureReason.TooManyCopiesOfCard]: [],
                [DeckValidationFailureReason.UnknownCardId]: [],
                [DeckValidationFailureReason.InvalidDecklistLocation]: []
            };

            // Compute the legal sets for this format + card pool
            const legalSets = DeckValidator.getLegalSets(format, cardPool);

            // Combine main deck and sideboard cards.
            const deckCards: ISwuDbFormatCardEntry[] = [...deck.deck, ...(deck.sideboard ?? [])];

            const baseData = this.getCardCheckData(deck.base.id);
            const minBoardedSize = this.getMinimumSideboardedDeckSize(deck.base.id, format);
            const decklistCardsCount = this.getTotalCardCount(deckCards);
            const boardedCardsCount = this.getTotalCardCount(deck.deck);
            const sideboardCardsCount = deck.sideboard ? this.getTotalCardCount(deck.sideboard) : 0;

            if (decklistCardsCount < minBoardedSize) {
                failures[DeckValidationFailureReason.MinDecklistSizeNotMet] = {
                    minDecklistSize: minBoardedSize,
                    actualDecklistSize: decklistCardsCount
                };
            }

            if (boardedCardsCount < minBoardedSize) {
                failures[DeckValidationFailureReason.MinMainboardSizeNotMet] = {
                    minBoardedSize: minBoardedSize,
                    actualBoardedSize: boardedCardsCount
                };
            }

            this.checkMaxSideboardSize(sideboardCardsCount, format, cardPool, failures);

            // Validate leader.
            const leaderData = this.getCardCheckData(deck.leader.id);
            if (!leaderData) {
                failures[DeckValidationFailureReason.UnknownCardId].push({ id: deck.leader.id });
            } else {
                this.checkCardLocation(deck.leader, leaderData, DecklistLocation.Leader, failures);
                this.checkFormatLegality(leaderData, format, legalSets, failures);
            }

            // Validate base.
            if (!baseData) {
                failures[DeckValidationFailureReason.UnknownCardId].push({ id: deck.base.id });
            } else {
                this.checkCardLocation(deck.base, baseData, DecklistLocation.Base, failures);
                this.checkFormatLegality(baseData, format, legalSets, failures);
            }

            // Validate each card in the deck (and sideboard).
            for (const card of deckCards) {
                const cardData = this.getCardCheckData(card.id);

                if (!cardData) {
                    failures[DeckValidationFailureReason.UnknownCardId].push({ id: card.id });
                    continue;
                }

                this.checkCardLocation(card, cardData, DecklistLocation.Deck, failures);
                this.checkFormatLegality(cardData, format, legalSets, failures);

                if (card.count < 0) {
                    failures[DeckValidationFailureReason.InvalidDeckData] = true;
                }

                this.checkMaxCopiesOfCard(card, cardData, format, failures);
            }

            // Remove any failure entries that are empty arrays.
            const failuresCleaned: IDeckValidationFailures = {};
            for (const [key, value] of Object.entries(failures)) {
                if (Array.isArray(value) && value.length === 0) {
                    continue;
                }
                failuresCleaned[key] = value;
            }

            return failuresCleaned;
        } catch (error) {
            console.error(error);
            return { [DeckValidationFailureReason.InvalidDeckData]: true };
        }
    }

    private getCardCheckData(setCode: string): ICardCheckData {
        // slightly confusing - the SWUDB format calls the set code the "id" but we use it to mean the numerical card id
        const cardId = this.setCodeToId.get(setCode);
        return this.cardData.get(cardId);
    }

    protected getCardLocation(cardData: ICardCheckData): DecklistLocation | null {
        switch (cardData.type) {
            case CardType.Leader:
                return DecklistLocation.Leader;
            case CardType.Base:
                return DecklistLocation.Base;
            case CardType.Event:
            case CardType.BasicUnit:
            case CardType.BasicUpgrade:
                return DecklistLocation.Deck;
            case CardType.TokenCard:
            case CardType.TokenUnit:
            case CardType.TokenUpgrade:
                return null;
            default:
                Contract.fail(`Unexpected card type: '${cardData.type}'`);
        }
    }

    protected checkFormatLegality(cardData: ICardCheckData, format: SwuGameFormat, legalSets: Set<SwuSetId>, failures: IDeckValidationFailures) {
        const setCode = `${cardData.setId.set}_${String(cardData.setId.number).padStart(3, '0')}`;

        const isLegalInFormat = cardData.sets.some((set) => legalSets.has(set));
        if (!isLegalInFormat) {
            failures[DeckValidationFailureReason.IllegalInFormat].push({
                id: setCode,
                name: cardData.titleAndSubtitle
            });
            return;
        }

        const rules = formatRules.get(format);
        if (rules?.bannedCards.has(this.setCodeToId.get(setCode))) {
            failures[DeckValidationFailureReason.IllegalInFormat].push({
                id: setCode,
                name: cardData.titleAndSubtitle
            });
        }
    }

    protected checkCardLocation(card: ISwuDbFormatCardEntry, cardData: ICardCheckData, location: DecklistLocation, failures: IDeckValidationFailures) {
        if (this.getCardLocation(cardData) !== location) {
            failures[DeckValidationFailureReason.InvalidDecklistLocation].push({
                card: { id: card.id, name: cardData.titleAndSubtitle },
                location
            });
        }
    }

    protected checkMaxCopiesOfCard(
        card: ISwuDbFormatCardEntry,
        cardData: ICardCheckData,
        format: SwuGameFormat,
        failures: IDeckValidationFailures
    ) {
        const rules = formatRules.get(format);

        if (!rules.maxCardCopies) {
            return;
        }

        const maxCount = cardData.maxCopiesOfCardOverride ?? rules.maxCardCopies;

        if (card.count > maxCount) {
            failures[DeckValidationFailureReason.TooManyCopiesOfCard].push({
                card: { id: card.id, name: cardData.titleAndSubtitle },
                maxCopies: maxCount,
                actualCopies: card.count
            });
        }
    }

    protected checkMaxSideboardSize(sideboardCardsCount: number, format: SwuGameFormat, cardPool: CardPool, failures: IDeckValidationFailures) {
        const maxSideboardSize = this.getMaxSideboardSize(format, cardPool);

        // sideboard is not restricted in all formats (e.g. Open)
        if (maxSideboardSize < 0) {
            return;
        }

        if (sideboardCardsCount > maxSideboardSize) {
            failures[DeckValidationFailureReason.MaxSideboardSizeExceeded] = {
                maxSideboardSize: maxSideboardSize,
                actualSideboardSize: sideboardCardsCount
            };
        }
    }

    private getTotalCardCount(cardlist: ISwuDbFormatCardEntry[]): number {
        return cardlist.reduce((sum, card) => sum + card.count, 0);
    }
}
