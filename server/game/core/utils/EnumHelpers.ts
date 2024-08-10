import { Location, LocationFilter, WildcardLocation } from '../Constants';

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
