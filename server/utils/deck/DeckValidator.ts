import type { CardDataGetter } from '../cardData/CardDataGetter';
import { cards } from '../../game/cards/Index';
import { Card } from '../../game/core/card/Card';
import type { CardType } from '../../game/core/Constants';
import * as EnumHelpers from '../../game/core/utils/EnumHelpers';
import type { ISwuDbCardEntry } from './DeckInterfaces';
import { DeckValidationFailureReason, type IDeckValidationFailures, type ISwuDbDecklist } from './DeckInterfaces';
import { SwuGameFormat } from '../../SwuGameFormat';
import type { ICardDataJson } from '../cardData/CardDataInterfaces';

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

interface ICardCheckData {
    titleAndSubtitle: string;
    type: CardType;
    set: SwuSet;
    banned: boolean;
    implemented: boolean;
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
                titleAndSubtitle: `${cardData.title}${cardData.subtitle ? `, ${cardData.subtitle}` : ''}`,
                type: Card.buildTypeFromPrinted(cardData.types),
                set: EnumHelpers.checkConvertToEnum(cardData.setId.set, SwuSet)[0],
                banned: bannedCards.has(cardData.id),
                implemented: !Card.checkHasNonKeywordAbilityText(cardData.text) || implementedCardIds.has(cardData.id)
            };

            this.cardData.set(cardData.id, cardCheckData);

            // TODO: logic to populate the set id map directly from card data. blocked until we add support for reprints in the card data directly.
            // // add leading zeros to set id number
            // let setId = '000' + cardData.setId.number;
            // setId = setId.substring(setId.length - 3);

            // this.setCodeToId.set(`${cardData.setId.set.toUpperCase()}_${setId}`, cardData.id);
        }
    }

    public getUnimplementedCards(): { set: string; titleAndSubtitle: string }[] {
        const unimplementedCards: { set: string; titleAndSubtitle: string }[] = [];

        for (const [cardId, cardData] of this.cardData) {
            if (!cardData.implemented) {
                unimplementedCards.push({ set: cardData.set, titleAndSubtitle: cardData.titleAndSubtitle });
            }
        }

        unimplementedCards.sort((a, b) => a.set.localeCompare(b.set) || a.titleAndSubtitle.localeCompare(b.titleAndSubtitle));

        return unimplementedCards;
    }

    // TODO: account for new bases that modify these values
    public getMinimumSideboardedDeckSize(_deck: ISwuDbDecklist): number {
        return 50;
    }

    public validateDeck(deck: ISwuDbDecklist, format: SwuGameFormat): IDeckValidationFailures {
        try {
            if (!deck.leader || !deck.base || !deck.deck || deck.deck.length === 0) {
                return { [DeckValidationFailureReason.InvalidDeckData]: true };
            }

            if (deck.secondleader) {
                return { [DeckValidationFailureReason.TooManyLeaders]: true };
            }

            const failures: IDeckValidationFailures = {
                [DeckValidationFailureReason.NotImplemented]: [],
                [DeckValidationFailureReason.IllegalInFormat]: [],
                [DeckValidationFailureReason.TooManyCopiesOfCard]: [],
                [DeckValidationFailureReason.UnknownCardId]: [],
            };

            const deckCards = deck.sideboard ? deck.deck.concat(deck.sideboard) : deck.deck;

            const minBoardedSize = this.getMinimumSideboardedDeckSize(deck);

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

            if (sideboardCardsCount > DeckValidator.MaxSideboardSize) {
                failures[DeckValidationFailureReason.MaxSideboardSizeExceeded] = {
                    maxSideboardSize: DeckValidator.MaxSideboardSize,
                    actualSideboardSize: sideboardCardsCount
                };
            }

            this.checkFormatLegality(this.getCardCheckData(deck.leader.id), format, failures);
            this.checkFormatLegality(this.getCardCheckData(deck.base.id), format, failures);

            for (const card of deckCards) {
                const cardData = this.getCardCheckData(card.id);

                if (!cardData) {
                    failures[DeckValidationFailureReason.UnknownCardId].push({ id: card.id });
                    continue;
                }

                this.checkFormatLegality(cardData, format, failures);

                if (!cardData.implemented) {
                    failures[DeckValidationFailureReason.NotImplemented].push({ id: card.id, name: cardData.titleAndSubtitle });
                }

                if (card.count < 0) {
                    failures[DeckValidationFailureReason.InvalidDeckData] = true;
                }

                this.checkMaxCopiesOfCard(card, cardData, format, failures);
            }

            // clean up any unused failure reasons
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
        if (card.count > 3) {
            failures[DeckValidationFailureReason.TooManyCopiesOfCard].push({
                card: { id: card.id, name: cardData.titleAndSubtitle },
                maxCopies: 3,
                actualCopies: card.count
            });
        }
    }

    private getTotalCardCount(cardlist: ISwuDbCardEntry[]): number {
        return cardlist.reduce((sum, card) => sum + card.count, 0);
    }
}
