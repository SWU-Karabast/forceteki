import { CardType } from '../Constants';
import type { Player } from '../Player';
import * as Contract from '../utils/Contract';
import { BaseCard } from './BaseCard';
import { Card } from './Card';
import { EventCard } from './EventCard';
import { NonLeaderUnitCard } from './NonLeaderUnitCard';
import { TokenCard, TokenUnitCard, TokenUpgradeCard } from './TokenCards';
import { UpgradeCard } from './UpgradeCard';
import { LeaderUnitCard } from './LeaderUnitCard';
import type { ICardDataJson } from '../../../utils/cardData/CardDataInterfaces';

/**
 * Create a default implementation for a card from cardData by calling the appropriate
 * derived class constructor based on the card type
 */
export function createUnimplementedCard(owner: Player, cardData: ICardDataJson): Card {
    Contract.assertNotNullLike(cardData?.types);
    const cardType = Card.buildTypeFromPrinted(cardData.types);

    let card: Card;

    switch (cardType) {
        case CardType.Event:
            card = new EventCard(owner, cardData);
            break;
        case CardType.Base:
            card = new BaseCard(owner, cardData);
            break;
        case CardType.BasicUpgrade:
            card = new UpgradeCard(owner, cardData);
            break;
        case CardType.Leader:
            card = new LeaderUnitCard(owner, cardData);
            break;
        case CardType.BasicUnit:
            card = new NonLeaderUnitCard(owner, cardData);
            break;
        case CardType.TokenUnit:
            card = new TokenUnitCard(owner, cardData);
            break;
        case CardType.TokenUpgrade:
            card = new TokenUpgradeCard(owner, cardData);
            break;
        case CardType.TokenCard:
            card = new TokenCard(owner, cardData);
            break;
        default:
            throw new Error(`Unexpected card type: ${cardType}`);
    }

    if (!card.initialized) {
        card.initialize();
    }

    return card;
}