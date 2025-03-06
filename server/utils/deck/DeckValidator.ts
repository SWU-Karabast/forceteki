import type { CardDataGetter } from '../cardData/CardDataGetter';
import { cards } from '../../game/cards/Index';
import { Card } from '../../game/core/card/Card';
import type { CardType } from '../../game/core/Constants';
import * as EnumHelpers from '../../game/core/utils/EnumHelpers';
import type { IDecklistInternal, ISwuDbCardEntry } from './DeckInterfaces';
import { DeckValidationFailureReason, type IDeckValidationFailures, type ISwuDbDecklist } from './DeckInterfaces';
import { SwuGameFormat } from '../../SwuGameFormat';
import type { ICardDataJson, ISetCode } from '../cardData/CardDataInterfaces';

enum SwuSet {
    SOR = 'sor',
    SHD = 'shd',
    TWI = 'twi',
    JTL = 'jtl'
}

const legalSets = [SwuSet.SOR, SwuSet.SHD, SwuSet.TWI];

const bannedCards = new Map([
    ['4626028465', 'boba-fett#collecting-the-bounty']
]);

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
    set: SwuSet;
    banned: boolean;
    implemented: boolean;
    minDeckSizeModifier?: number;
    maxCopiesOfCardOverride?: number;
}

export class DeckValidator {
    private readonly cardData: Map<string, ICardCheckData>;
    private readonly setCodeToId: Map<string, string>;

    private static readonly MaxSideboardSize = 10;

    public static async createAsync(cardDataGetter: CardDataGetter): Promise<DeckValidator> {
        const allCardsData: ICardDataJson[] = [];
        for (const cardId of cardDataGetter.cardIds) {
            allCardsData.push(await cardDataGetter.getCardAsync(cardId));
        }

        return new DeckValidator(allCardsData, cardDataGetter.setCodeMap);
    }

    private constructor(allCardsData: ICardDataJson[], setCodeToId: Map<string, string>) {
        const implementedCardIds = new Set(cards.keys());

        this.cardData = new Map<string, ICardCheckData>();
        this.setCodeToId = setCodeToId;

        for (const cardData of allCardsData) {
            const cardCheckData: ICardCheckData = {
                setId: cardData.setId,
                titleAndSubtitle: `${cardData.title}${cardData.subtitle ? `, ${cardData.subtitle}` : ''}`,
                type: Card.buildTypeFromPrinted(cardData.types),
                set: EnumHelpers.checkConvertToEnum(cardData.setId.set, SwuSet)[0],
                banned: bannedCards.has(cardData.id),
                implemented: !Card.checkHasNonKeywordAbilityText(cardData) || implementedCardIds.has(cardData.id),
                minDeckSizeModifier: minDeckSizeModifier.get(cardData.id),
                maxCopiesOfCardOverride: maxCopiesOfCards.get(cardData.id)
            };

            this.cardData.set(cardData.id, cardCheckData);

            // TODO: logic to populate the set id map directly from card data. blocked until we add support for reprints in the card data directly.
            // // add leading zeros to set id number
            // let setId = '000' + cardData.setId.number;
            // setId = setId.substring(setId.length - 3);

            // this.setCodeToId.set(`${cardData.setId.set.toUpperCase()}_${setId}`, cardData.id);
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

    public getMinimumSideboardedDeckSize(baseId: string): number {
        const baseData = this.getCardCheckData(baseId);
        return 50 + (baseData.minDeckSizeModifier ?? 0);
    }

    // update this function if anything affects the sideboard count
    public getMaxSideboardSize(format: SwuGameFormat): number {
        // sideboard is only restricted in Premier
        if (format === SwuGameFormat.Open || format === SwuGameFormat.NextSetPreview) {
            return -1;
        }
        return 10;
    }

    public getUnimplementedCardsInDeck(deck: IDecklistInternal | ISwuDbDecklist): { id: string; name: string }[] {
        if (!deck) {
            return [];
        }
        const deckCards: ISwuDbCardEntry[] = [...deck.deck, ...(deck.sideboard ?? [])];
        const unimplemented: { id: string; name: string }[] = [];

        // check leader
        const leaderData = this.getCardCheckData(deck.leader.id);
        if (!leaderData.implemented) {
            unimplemented.push({ id: deck.leader.id, name: leaderData.titleAndSubtitle });
        }

        // check base
        const baseData = this.getCardCheckData(deck.base.id);
        if (!baseData.implemented) {
            unimplemented.push({ id: deck.base.id, name: baseData.titleAndSubtitle });
        }

        // check other cards
        for (const card of deckCards) {
            const cardData = this.getCardCheckData(card.id);
            if (!cardData.implemented) {
                unimplemented.push({ id: card.id, name: cardData.titleAndSubtitle });
            }
        }

        return unimplemented;
    }

    // Validate IDecklistInternal
    public validateInternalDeck(deck: IDecklistInternal, format: SwuGameFormat): IDeckValidationFailures {
        // Basic structure check (internal decks have mandatory leader, base, and deck)
        if (!deck || !deck.leader || !deck.base || !deck.deck || deck.deck.length === 0) {
            return { [DeckValidationFailureReason.InvalidDeckData]: true };
        }
        return this.validateCommonDeck(deck, format);
    }

    // Validate the ISwuDbDeckList
    public validateSwuDbDeck(deck: ISwuDbDecklist, format: SwuGameFormat): IDeckValidationFailures {
        // Basic structure check (SWU‑DB decks use optional properties, so we check them explicitly)
        if (!deck || !deck.leader || !deck.base || !deck.deck || deck.deck.length === 0) {
            return { [DeckValidationFailureReason.InvalidDeckData]: true };
        }
        // SWU‑DB decks must not have a second leader.
        if (deck.secondleader) {
            return { [DeckValidationFailureReason.TooManyLeaders]: true };
        }
        return this.validateCommonDeck(deck, format);
    }

    private validateCommonDeck(deck: IDecklistInternal | ISwuDbDecklist, format: SwuGameFormat): IDeckValidationFailures {
        try {
            const failures: IDeckValidationFailures = {
                [DeckValidationFailureReason.IllegalInFormat]: [],
                [DeckValidationFailureReason.TooManyCopiesOfCard]: [],
                [DeckValidationFailureReason.UnknownCardId]: [],
            };

            // Combine main deck and sideboard cards.
            const deckCards: ISwuDbCardEntry[] = [...deck.deck, ...(deck.sideboard ?? [])];

            const baseData = this.getCardCheckData(deck.base.id);
            const minBoardedSize = this.getMinimumSideboardedDeckSize(deck.base.id);
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

            this.checkMaxSideboardSize(sideboardCardsCount, format, failures);

            // Validate leader.
            const leaderData = this.getCardCheckData(deck.leader.id);
            this.checkFormatLegality(leaderData, format, failures);

            // Validate base.
            this.checkFormatLegality(baseData, format, failures);

            // Validate each card in the deck (and sideboard).
            for (const card of deckCards) {
                const cardData = this.getCardCheckData(card.id);

                if (!cardData) {
                    failures[DeckValidationFailureReason.UnknownCardId].push({ id: card.id });
                    continue;
                }

                this.checkFormatLegality(cardData, format, failures);

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

    protected checkFormatLegality(cardData: ICardCheckData, format: SwuGameFormat, failures: IDeckValidationFailures) {
        if (
            (cardData.banned && format !== SwuGameFormat.Open) ||
            (!legalSets.includes(cardData.set) && format === SwuGameFormat.Premier)
        ) {
            failures[DeckValidationFailureReason.IllegalInFormat].push({ id: cardData.set, name: cardData.titleAndSubtitle });
        }
    }

    protected checkMaxCopiesOfCard(card: ISwuDbCardEntry, cardData: ICardCheckData, format: SwuGameFormat, failures: IDeckValidationFailures) {
        const maxCount = cardData.maxCopiesOfCardOverride ?? 3;

        if (card.count > maxCount) {
            failures[DeckValidationFailureReason.TooManyCopiesOfCard].push({
                card: { id: card.id, name: cardData.titleAndSubtitle },
                maxCopies: maxCount,
                actualCopies: card.count
            });
        }
    }

    protected checkMaxSideboardSize(sideboardCardsCount: number, format: SwuGameFormat, failures: IDeckValidationFailures) {
        // sideboard is only restricted in Premier
        if (format === SwuGameFormat.Open || format === SwuGameFormat.NextSetPreview) {
            return;
        }

        if (sideboardCardsCount > DeckValidator.MaxSideboardSize) {
            failures[DeckValidationFailureReason.MaxSideboardSizeExceeded] = {
                maxSideboardSize: DeckValidator.MaxSideboardSize,
                actualSideboardSize: sideboardCardsCount
            };
        }
    }

    private getTotalCardCount(cardlist: ISwuDbCardEntry[]): number {
        return cardlist.reduce((sum, card) => sum + card.count, 0);
    }
}
