import type { CardDataGetter } from '../cardData/CardDataGetter';
import { cards } from '../../game/cards/Index';
import { Card } from '../../game/core/card/Card';
import type { CardType } from '../../game/core/Constants';
import * as EnumHelpers from '../../game/core/utils/EnumHelpers';
import { DeckValidationFailureReason, type IDeckValidationFailures, type ISwuDbDecklist } from './DeckInterfaces';
import { SwuGameFormat } from '../../SwuGameFormat';

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

    public constructor(cardDataGetter: CardDataGetter) {
        const implementedCardIds = new Set(cards.keys());

        this.cardData = new Map<string, ICardCheckData>();

        for (const cardId of cardDataGetter.cardIds) {
            const cardData = cardDataGetter.get(cardId);

            const cardCheckData: ICardCheckData = {
                titleAndSubtitle: `${cardData.title}${cardData.subtitle ? `, ${cardData.subtitle}` : ''}`,
                type: Card.buildTypeFromPrinted(cardData.types),
                set: EnumHelpers.checkConvertToEnum(cardData.setId.set, SwuSet)[0],
                banned: bannedCards.has(cardData.id),
                implemented: implementedCardIds.has(cardData.id)
            };

            this.cardData.set(cardData.id, cardCheckData);

            // add leading zeros to set id number
            let setId = '000' + cardData.id;
            setId = setId.substring(setId.length - 3);

            this.setCodeToId.set(`${cardData.setId.set.toUpperCase()}_${cardData.setId.number}`, setId);
        }
    }

    // TODO: account for new base that modifies this
    public getMinimumSideboardedDeckSize(_deck: ISwuDbDecklist): number {
        return 50;
    }

    public getMaximumSideboardedDeckSize(_deck: ISwuDbDecklist): number {
        return 60;
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

            const minDeckSize = this.getMinimumSideboardedDeckSize(deck);
            const maxDeckSize = this.getMaximumSideboardedDeckSize(deck);
            if (deckCards.length < minDeckSize) {
                failures[DeckValidationFailureReason.MinDeckSizeNotMet] = {
                    minDeckSize: minDeckSize,
                    actualDeckSize: deckCards.length
                };
            } else if (deckCards.length > maxDeckSize) {
                failures[DeckValidationFailureReason.MaxDeckSizeExceeded] = {
                    maxDeckSize: maxDeckSize,
                    actualDeckSize: deckCards.length
                };
            }

            for (const card of deckCards) {
                // slightly confusing - the SWUDB format calls the set code the "id" but we use it to mean the numerical card id
                const cardId = this.setCodeToId.get(card.id);
                const cardData = this.cardData.get(cardId);

                if (!cardData) {
                    failures[DeckValidationFailureReason.UnknownCardId].push({ id: card.id });
                    continue;
                }

                if (
                    (cardData.banned && format !== SwuGameFormat.Open) ||
                    (!legalSets.includes(cardData.set) && format === SwuGameFormat.Premier)
                ) {
                    failures[DeckValidationFailureReason.IllegalInFormat].push({ id: card.id, name: cardData.titleAndSubtitle });
                }

                if (!cardData.implemented) {
                    failures[DeckValidationFailureReason.NotImplemented].push({ id: card.id, name: cardData.titleAndSubtitle });
                }

                if (card.count < 0) {
                    failures[DeckValidationFailureReason.InvalidDeckData] = true;
                }

                if (card.count > 3) {
                    failures[DeckValidationFailureReason.TooManyCopiesOfCard].push({
                        card: { id: card.id, name: cardData.titleAndSubtitle },
                        maxCopies: 3,
                        actualCopies: card.count
                    });
                }
            }

            // clean up any unused failure reasons
            for (const [key, value] of Object.entries(failures)) {
                if (Array.isArray(value) && value.length === 0) {
                    failures[key] = undefined;
                }
            }

            return failures;
        } catch (_error) {
            // TODO: log the validation exception body here
            return { [DeckValidationFailureReason.InvalidDeckData]: true };
        }
    }
}
