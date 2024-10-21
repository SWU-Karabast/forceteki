import { CardType, CardTypeFilter, Location, LocationFilter, WildcardCardType, WildcardLocation } from '../Constants';

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

export const isArena = (location: LocationFilter) => {
    switch (location) {
        case Location.GroundArena:
        case Location.SpaceArena:
        case WildcardLocation.AnyArena:
            return true;
        default:
            return false;
    }
};

export const isAttackableLocation = (location: LocationFilter) => {
    switch (location) {
        case Location.GroundArena:
        case Location.SpaceArena:
        case WildcardLocation.AnyArena:
        case Location.Base:
            return true;
        default:
            return false;
    }
};

// return true if the card location matches one of the allowed location filters
export const cardLocationMatches = (cardLocation: Location, locationFilter: LocationFilter | LocationFilter[]) => {
    if (!Array.isArray(locationFilter)) {
        locationFilter = [locationFilter];
    }

    return locationFilter.some((allowedLocation) => {
        switch (allowedLocation) {
            case WildcardLocation.Any:
                return true;
            case WildcardLocation.AnyArena:
                return isArena(cardLocation);
            case WildcardLocation.AnyAttackable:
                return isAttackableLocation(cardLocation);
            default:
                return cardLocation === allowedLocation;
        }
    });
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

// return true if the card location matches one of the allowed location filters
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
