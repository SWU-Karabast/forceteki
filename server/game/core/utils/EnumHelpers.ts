import type { CardTypeFilter, ZoneFilter, MoveZoneDestination, Aspect, Conjunction } from '../Constants';
import { CardType, ZoneName, DeckZoneDestination, RelativePlayer, WildcardCardType, WildcardZoneName } from '../Constants';
import type { Player } from '../Player';
import * as Helpers from './Helpers';

// Cache for enum lookup maps (lowercase string -> enum value)
const enumLookupCache = new Map<object, Map<string, unknown>>();

// Get or create a cached lookup map for an enum
function getEnumLookupMap<T extends object>(enumObj: T): Map<string, T[keyof T]> {
    let lookupMap = enumLookupCache.get(enumObj) as Map<string, T[keyof T]> | undefined;
    if (!lookupMap) {
        lookupMap = new Map<string, T[keyof T]>();
        for (const enumValue of Object.values(enumObj)) {
            lookupMap.set((enumValue as string).toLowerCase(), enumValue as T[keyof T]);
        }
        enumLookupCache.set(enumObj, lookupMap);
    }
    return lookupMap;
}

// convert a set of strings to map to an enum type, throw if any of them is not a legal value
export function checkConvertToEnum<T extends object>(values: string | string[], enumObj: T): T[keyof T][] {
    const result: T[keyof T][] = [];
    const lookupMap = getEnumLookupMap(enumObj);

    for (const value of Helpers.asArray(values)) {
        const matchingValue = lookupMap.get(value.toLowerCase());
        if (matchingValue !== undefined) {
            result.push(matchingValue);
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

export const isAttackableZone = (zone: ZoneFilter): zone is ZoneName.GroundArena | ZoneName.SpaceArena | ZoneName.Base | WildcardZoneName.AnyArena => {
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

export const isDeckMoveZone = (zoneName: MoveZoneDestination): zoneName is DeckZoneDestination.DeckBottom | DeckZoneDestination.DeckTop => {
    return zoneName === DeckZoneDestination.DeckBottom || zoneName === DeckZoneDestination.DeckTop;
};

export const zoneMoveRequiresControllerReset = (prevZone: ZoneName, nextZone: MoveZoneDestination): boolean => {
    const nextZoneName = asConcreteZone(nextZone);
    return (isArena(prevZone) || prevZone === ZoneName.Resource) && !(isArena(nextZoneName) || nextZoneName === ZoneName.Resource);
};

export const isUnit = (cardType: CardTypeFilter): cardType is WildcardCardType.Unit | WildcardCardType.NonLeaderUnit | CardType.BasicUnit | CardType.LeaderUnit | CardType.TokenUnit => {
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

export const isNonTokenUnit = (cardType: CardTypeFilter): cardType is CardType.BasicUnit | CardType.LeaderUnit => {
    switch (cardType) {
        case CardType.BasicUnit:
            return true;
        case CardType.LeaderUnit:
            return true;
        default:
            return false;
    }
};

export const isNonLeaderUnit = (cardType: CardTypeFilter): cardType is WildcardCardType.NonLeaderUnit | CardType.BasicUnit | CardType.TokenUnit => {
    switch (cardType) {
        case WildcardCardType.NonLeaderUnit:
        case CardType.BasicUnit:
        case CardType.TokenUnit:
            return true;
        default:
            return false;
    }
};

export const isNonLeaderUpgrade = (cardType: CardTypeFilter): cardType is WildcardCardType.NonLeaderUpgrade | CardType.BasicUpgrade | CardType.TokenUpgrade | CardType.NonLeaderUnitUpgrade => {
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

export const isUnitUpgrade = (cardType: CardTypeFilter): cardType is WildcardCardType.UnitUpgrade | CardType.NonLeaderUnitUpgrade | CardType.LeaderUpgrade => {
    switch (cardType) {
        case WildcardCardType.UnitUpgrade:
        case CardType.NonLeaderUnitUpgrade:
        case CardType.LeaderUpgrade:
            return true;
        default:
            return false;
    }
};

export const isUpgrade = (cardType: CardTypeFilter): cardType is WildcardCardType.Upgrade | WildcardCardType.UnitUpgrade | CardType.BasicUpgrade | CardType.LeaderUpgrade | CardType.TokenUpgrade | CardType.NonLeaderUnitUpgrade => {
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

export const isToken = (cardType: CardTypeFilter): cardType is WildcardCardType.Token | CardType.TokenUpgrade | CardType.TokenUnit | CardType.TokenCard => {
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

export const isPlayable = (cardType: CardTypeFilter): cardType is WildcardCardType.Playable | CardType.Event | CardType.BasicUnit | CardType.BasicUpgrade | CardType.NonLeaderUnitUpgrade => {
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
            case WildcardCardType.NonUnit:
                return !isUnit(cardType);
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
            return [CardType.Base, CardType.Event, CardType.Leader, CardType.BasicUnit, CardType.BasicUpgrade, CardType.TokenUnit, CardType.TokenUpgrade, CardType.TokenCard, CardType.LeaderUnit];
        case WildcardCardType.NonLeaderUnit:
            return [CardType.BasicUnit, CardType.TokenUnit];
        case WildcardCardType.NonLeaderUpgrade:
            return [CardType.BasicUpgrade, CardType.TokenUpgrade, CardType.NonLeaderUnitUpgrade];
        case WildcardCardType.NonUnit:
            return [CardType.BasicUpgrade, CardType.TokenUpgrade, CardType.NonLeaderUnitUpgrade, CardType.Event];
        case WildcardCardType.UnitUpgrade:
            return [CardType.LeaderUpgrade, CardType.NonLeaderUnitUpgrade];
        case WildcardCardType.Unit:
            return [CardType.BasicUnit, CardType.LeaderUnit, CardType.TokenUnit];
        case WildcardCardType.Upgrade:
            return [CardType.BasicUpgrade, CardType.LeaderUpgrade, CardType.TokenUpgrade, CardType.NonLeaderUnitUpgrade];
        case WildcardCardType.Token:
            return [CardType.TokenUnit, CardType.TokenUpgrade, CardType.TokenCard];
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

export function aspectString(
    aspects: Aspect[],
    conjunction: Conjunction | null = null
): string {
    return aspects
        .map((aspect, index) => {
            return (conjunction && aspects.length > 1 && index === aspects.length - 1)
                ? `${conjunction} ${Helpers.capitalize(aspect)}`
                : Helpers.capitalize(aspect);
        })
        .join((!conjunction || aspects.length > 2) ? ', ' : ' ');
}