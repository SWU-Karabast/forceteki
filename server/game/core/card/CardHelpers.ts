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

    switch (cardType) {
        case CardType.Event:
            return new EventCard(owner, cardData).initialize();
        case CardType.Base:
            return new BaseCard(owner, cardData).initialize();
        case CardType.BasicUpgrade:
            return new UpgradeCard(owner, cardData).initialize();
        case CardType.Leader:
            return new LeaderUnitCard(owner, cardData).initialize();
        case CardType.BasicUnit:
            return new NonLeaderUnitCard(owner, cardData).initialize();
        case CardType.TokenUnit:
            return new TokenUnitCard(owner, cardData).initialize();
        case CardType.TokenUpgrade:
            return new TokenUpgradeCard(owner, cardData).initialize();
        case CardType.TokenCard:
            return new TokenCard(owner, cardData).initialize();
        default:
            throw new Error(`Unexpected card type: ${cardType}`);
    }
}