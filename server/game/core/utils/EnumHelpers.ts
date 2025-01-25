import type { CardTypeFilter, ZoneFilter, MoveZoneDestination } from '../Constants';
import { CardType, ZoneName, DeckZoneDestination, RelativePlayer, WildcardCardType, WildcardZoneName } from '../Constants';

// convert a set of strings to map to an enum type, throw if any of them is not a legal value
export function checkConvertToEnum<T>(values: string[], enumObj: T): T[keyof T][] {
    const result: T[keyof T][] = [];

    for (const value of values) {
        if (Object.values(enumObj).indexOf(value.toLowerCase()) >= 0) {
            result.push(value as T[keyof T]);
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

export const isHidden = (zone: ZoneFilter, controller: RelativePlayer) => {
    switch (zone) {
        case ZoneName.Hand:
        case ZoneName.Resource:
            return controller !== RelativePlayer.Opponent;
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

export const isLeavingPlay = (prevZone: ZoneName, nextZone: MoveZoneDestination): boolean => {
    const outOfPlayZones = [ZoneName.OutsideTheGame, ZoneName.Hand, ZoneName.Deck, ZoneName.Discard,
        DeckZoneDestination.DeckBottom, DeckZoneDestination.DeckTop];
    return !outOfPlayZones.includes(prevZone) && outOfPlayZones.includes(nextZone);
}

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

export const isUpgrade = (cardType: CardTypeFilter) => {
    switch (cardType) {
        case WildcardCardType.Upgrade:
        case CardType.BasicUpgrade:
        case CardType.TokenUpgrade:
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
        case WildcardCardType.Unit:
            return [CardType.BasicUnit, CardType.LeaderUnit, CardType.TokenUnit];
        case WildcardCardType.Upgrade:
            return [CardType.BasicUpgrade, CardType.TokenUpgrade];
        case WildcardCardType.Token:
            return [CardType.TokenUnit, CardType.TokenUpgrade];
        case WildcardCardType.Playable:
            return [CardType.Event, CardType.BasicUnit, CardType.BasicUpgrade];
        default:
            return [cardTypeFilter];
    }
};
