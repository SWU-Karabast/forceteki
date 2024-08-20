import { CardType } from '../Constants';
import Player from '../Player';
import Contract from '../utils/Contract';
import { checkConvertToEnum } from '../utils/EnumHelpers';
import { BaseCard } from './BaseCard';
import Card from './Card';
import { AnyCard, CardWithExhaustProperty, UnitCard } from './CardTypes';
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

export function asCardWithExhaustPropertyOrNull(card: Card): CardWithExhaustProperty | null {
    const concreteCard = cardAsConcrete(card);

    if (concreteCard instanceof BaseCard) {
        return null;
    }

    return concreteCard;
}

export function asUnitCardOrNull(card: Card): UnitCard | null {
    const concreteCard = cardAsConcrete(card);

    if (
        concreteCard instanceof NonLeaderUnitCard ||
        concreteCard instanceof TokenNonLeaderUnitCard
    ) {
        return concreteCard;
    }
    if (concreteCard instanceof LeaderUnitCard) {
        if (concreteCard.isDeployed) {
            return concreteCard;
        }
    }

    return null;
}

function cardAsConcrete(card: Card): AnyCard {
    if (card.isEvent()) {
        return card as EventCard;
    }
    if (card.isBase()) {
        return card as BaseCard;
    }
    if (card.isUpgrade()) {
        if (card.isToken()) {
            return card as TokenUpgradeCard;
        }
        return card as UpgradeCard;
    }
    if (card.isLeader()) {
        if (card.isLeaderUnit) {
            return card as LeaderUnitCard;
        }

        return card as LeaderCard;
    }
    if (card.isUnit()) {
        if (card.isToken()) {
            return card as TokenNonLeaderUnitCard;
        }
        return card as NonLeaderUnitCard;
    }

    Contract.fail(`Invalid card type set: ${card.types}`);
    return null;
}