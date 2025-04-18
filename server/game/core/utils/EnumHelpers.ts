import type { CardTypeFilter, ZoneFilter, MoveZoneDestination } from '../Constants';
import { CardType, ZoneName, DeckZoneDestination, RelativePlayer, WildcardCardType, WildcardZoneName } from '../Constants';
import type { Player } from '../Player';
import * as Helpers from './Helpers';

// convert a set of strings to map to an enum type, throw if any of them is not a legal value
export function checkConvertToEnum<T>(values: string | string[], enumObj: T): T[keyof T][] {
    const result: T[keyof T][] = [];

    const enumValues = Object.values(enumObj);
    for (const value of Helpers.asArray(values)) {
        const matchingValue = enumValues.find((enumValue) => enumValue.toLowerCase() === value.toLowerCase());
        if (matchingValue) {
            result.push(matchingValue as T[keyof T]);
        } else {
            throw new Error(`Invalid value for enum: ${value}`);
        }
    }

    return result;
}

// return true if the passed value is a member of the given enum type (case-sensitive)
export function isEnumValue<T>(value: string, enumObj: T): boolean {
    return Object.values(enumObj).indexOf(value) >= 0;
}

// TODO: Use type predicates in similar functions in this file to enable type narrowing
export const isArena = (zone: ZoneFilter): zone is ZoneName.GroundArena | ZoneName.SpaceArena | WildcardZoneName.AnyArena => {
    switch (zone) {
        case ZoneName.GroundArena:
        case ZoneName.SpaceArena:
        case WildcardZoneName.AnyArena:
            return true;
        default:
            return false;
    }
};

export const isAttackableZone = (zone: ZoneFilter) => {
    switch (zone) {
        case ZoneName.GroundArena:
        case ZoneName.SpaceArena:
        case WildcardZoneName.AnyArena:
        case ZoneName.Base:
            return true;
        default:
            return false;
    }
};

export const isHiddenFromOpponent = (zone: ZoneFilter, zoneController: RelativePlayer) => {
    switch (zone) {
        case ZoneName.Hand:
        case ZoneName.Resource:
            // TODO: switching this to be 'zoneController === RelativePlayer.Self' breaks a lot of tests for some reason
            return zoneController !== RelativePlayer.Opponent;
        case ZoneName.Deck:
            return true;
        default:
            return false;
    }
};

// return true if the card zone matches one of the allowed zone filters
export const cardZoneMatches = (cardZone: ZoneName, zoneFilter: ZoneFilter | ZoneFilter[]) => {
    if (!Array.isArray(zoneFilter)) {
        zoneFilter = [zoneFilter];
    }

    return zoneFilter.some((allowedZone) => {
        switch (allowedZone) {
            case WildcardZoneName.Any:
                return true;
            case WildcardZoneName.AnyArena:
                return isArena(cardZone);
            case WildcardZoneName.AnyAttackable:
                return isAttackableZone(cardZone);
            default:
                return cardZone === allowedZone;
        }
    });
};

/** Converts a MoveZoneDestination to a ZoneName by converting deck move zones to ZoneName.Deck */
export const asConcreteZone = (zoneName: ZoneName | MoveZoneDestination): ZoneName => {
    return zoneName === DeckZoneDestination.DeckBottom || zoneName === DeckZoneDestination.DeckTop
        ? ZoneName.Deck
        : zoneName;
};

export const isDeckMoveZone = (zoneName: MoveZoneDestination): boolean => {
    return zoneName === DeckZoneDestination.DeckBottom || zoneName === DeckZoneDestination.DeckTop;
};

export const zoneMoveRequiresControllerReset = (prevZone: ZoneName, nextZone: MoveZoneDestination): boolean => {
    const nextZoneName = asConcreteZone(nextZone);
    return (isArena(prevZone) || prevZone === ZoneName.Resource) && !(isArena(nextZoneName) || nextZoneName === ZoneName.Resource);
};

export const isUnit = (cardType: CardTypeFilter) => {
    switch (cardType) {
        case WildcardCardType.Unit:
        case WildcardCardType.NonLeaderUnit:
        case CardType.BasicUnit:
        case CardType.LeaderUnit:
        case CardType.TokenUnit:
            return true;
        default:
            return false;
    }
};

export const isNonLeaderUnit = (cardType: CardTypeFilter) => {
    switch (cardType) {
        case WildcardCardType.NonLeaderUnit:
        case CardType.BasicUnit:
        case CardType.TokenUnit:
            return true;
        default:
            return false;
    }
};

export const isNonLeaderUpgrade = (cardType: CardTypeFilter) => {
    switch (cardType) {
        case WildcardCardType.NonLeaderUpgrade:
        case CardType.BasicUpgrade:
        case CardType.TokenUpgrade:
        case CardType.NonLeaderUnitUpgrade:
            return true;
        default:
            return false;
    }
};

export const isUnitUpgrade = (cardType: CardTypeFilter) => {
    switch (cardType) {
        case WildcardCardType.UnitUpgrade:
        case CardType.NonLeaderUnitUpgrade:
        case CardType.LeaderUpgrade:
            return true;
        default:
            return false;
    }
};

export const isUpgrade = (cardType: CardTypeFilter) => {
    switch (cardType) {
        case WildcardCardType.Upgrade:
        case WildcardCardType.UnitUpgrade:
        case CardType.BasicUpgrade:
        case CardType.LeaderUpgrade:
        case CardType.TokenUpgrade:
        case CardType.NonLeaderUnitUpgrade:
            return true;
        default:
            return false;
    }
};

export const isToken = (cardType: CardTypeFilter) => {
    switch (cardType) {
        case WildcardCardType.Token:
        case CardType.TokenUpgrade:
        case CardType.TokenUnit:
        case CardType.TokenCard:
            return true;
        default:
            return false;
    }
};

export const isPlayable = (cardType: CardTypeFilter) => {
    switch (cardType) {
        case WildcardCardType.Playable:
        case CardType.Event:
        case CardType.BasicUnit:
        case CardType.BasicUpgrade:
        case CardType.NonLeaderUnitUpgrade:
            return true;
        default:
            return false;
    }
};

// return true if the card zone matches one of the allowed zone filters
export const cardTypeMatches = (cardType: CardType, cardTypeFilter: CardTypeFilter | CardTypeFilter[]) => {
    if (!Array.isArray(cardTypeFilter)) {
        cardTypeFilter = [cardTypeFilter];
    }

    return cardTypeFilter.some((allowedCardType) => {
        switch (allowedCardType) {
            case WildcardCardType.Any:
                return true;
            case WildcardCardType.NonLeaderUnit:
                return isNonLeaderUnit(cardType);
            case WildcardCardType.NonLeaderUpgrade:
                return isNonLeaderUpgrade(cardType);
            case WildcardCardType.UnitUpgrade:
                return isUnitUpgrade(cardType);
            case WildcardCardType.Unit:
                return isUnit(cardType);
            case WildcardCardType.Upgrade:
                return isUpgrade(cardType);
            case WildcardCardType.Token:
                return isToken(cardType);
            case WildcardCardType.Playable:
                return isPlayable(cardType);
            default:
                return cardType === allowedCardType;
        }
    });
};

export const getCardTypesForFilter = (cardTypeFilter: CardTypeFilter): CardType[] => {
    switch (cardTypeFilter) {
        case WildcardCardType.Any:
            return [CardType.Base, CardType.Event, CardType.Leader, CardType.BasicUnit, CardType.BasicUpgrade, CardType.TokenUnit, CardType.TokenUpgrade, CardType.LeaderUnit];
        case WildcardCardType.NonLeaderUnit:
            return [CardType.BasicUnit, CardType.TokenUnit];
        case WildcardCardType.NonLeaderUpgrade:
            return [CardType.BasicUpgrade, CardType.TokenUpgrade, CardType.NonLeaderUnitUpgrade];
        case WildcardCardType.UnitUpgrade:
            return [CardType.LeaderUpgrade, CardType.NonLeaderUnitUpgrade];
        case WildcardCardType.Unit:
            return [CardType.BasicUnit, CardType.LeaderUnit, CardType.TokenUnit];
        case WildcardCardType.Upgrade:
            return [CardType.BasicUpgrade, CardType.LeaderUpgrade, CardType.TokenUpgrade, CardType.NonLeaderUnitUpgrade];
        case WildcardCardType.Token:
            return [CardType.TokenUnit, CardType.TokenUpgrade];
        case WildcardCardType.Playable:
            return [CardType.Event, CardType.BasicUnit, CardType.BasicUpgrade];
        default:
            return [cardTypeFilter];
    }
};

export const asConcretePlayer = (player: Player | RelativePlayer, contextPlayer: Player): Player => {
    if (player === RelativePlayer.Self) {
        return contextPlayer;
    } else if (player === RelativePlayer.Opponent) {
        return contextPlayer.opponent;
    }
    return player;
};

export const asRelativePlayer = (player: Player, otherPlayer: Player): RelativePlayer => {
    return player === otherPlayer ? RelativePlayer.Self : RelativePlayer.Opponent;
};
