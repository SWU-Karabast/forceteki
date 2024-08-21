import { CardType } from '../Constants';
import Player from '../Player';
import Contract from '../utils/Contract';
import { BaseCard } from './BaseCard';
import { Card } from './Card';
import { EventCard } from './EventCard';
import { LeaderCard } from './LeaderCard';
import { NonLeaderUnitCard } from './NonLeaderUnitCard';
import { TokenNonLeaderUnitCard, TokenUpgradeCard } from './TokenCards';
import { UpgradeCard } from './UpgradeCard';


/**
 * Create a default implementation for a card from cardData by calling the appropriate
 * derived class constructor based on the card type
 */
export function createUnimplementedCard(owner: Player, cardData: any): Card {
    Contract.assertNotNullLike(cardData.types);
    const cardType = Card.buildTypeFromPrinted(cardData.types);

    switch (cardType) {
        case CardType.Event:
            return new EventCard(owner, cardData);
        case CardType.Base:
            return new BaseCard(owner, cardData);
        case CardType.Upgrade:
            return new UpgradeCard(owner, cardData);
        case CardType.Leader:
            return new LeaderCard(owner, cardData);
        case CardType.NonLeaderUnit:
            return new NonLeaderUnitCard(owner, cardData);
        case CardType.TokenUnit:
            return new TokenNonLeaderUnitCard(owner, cardData);
        case CardType.TokenUpgrade:
            return new TokenUpgradeCard(owner, cardData);
        default:
            throw new Error(`Unexpected card type: ${cardType}`);
    }
}