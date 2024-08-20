import { CardType } from '../Constants';
import Player from '../Player';
import Contract from '../utils/Contract';
import { checkConvertToEnum } from '../utils/EnumHelpers';
import { BaseCard } from './BaseCard';
import { Card } from './Card';
import { AnyCard, CardWithConstantAbilities, CardWithExhaustProperty, CardWithDamageProperty, CardWithTriggeredAbilities, InPlayCard, UnitCard } from './CardTypes';
import { EventCard } from './EventCard';
import { LeaderCard } from './LeaderCard';
import { LeaderUnitCard } from './LeaderUnitCard';
import { NonLeaderUnitCard } from './NonLeaderUnitCard';
import { TokenNonLeaderUnitCard, TokenUpgradeCard } from './TokenCards';
import { UpgradeCard } from './UpgradeCard';


/**
 * Create a default implementation for a card from cardData by calling the appropriate
 * derived class constructor based on the card type
 */
export function createUnimplementedCard(owner: Player, cardData: any): Card {
    Contract.assertNotNullLike(cardData.types);
    const cardTypes = new Set(checkConvertToEnum(cardData.types, CardType));

    if (cardTypes.has(CardType.Event)) {
        return new EventCard(owner, cardData);
    }
    if (cardTypes.has(CardType.Base)) {
        return new BaseCard(owner, cardData);
    }
    if (cardTypes.has(CardType.Upgrade)) {
        if (cardTypes.has(CardType.Token)) {
            return new TokenUpgradeCard(owner, cardData);
        }
        return new UpgradeCard(owner, cardData);
    }
    if (cardTypes.has(CardType.Leader)) {
        return new LeaderCard(owner, cardData);
    }
    if (cardTypes.has(CardType.Unit)) {
        if (cardTypes.has(CardType.Token)) {
            return new TokenNonLeaderUnitCard(owner, cardData);
        }
        return new NonLeaderUnitCard(owner, cardData);
    }

    throw new Error(`Invalid card type set: ${cardTypes}`);
}
