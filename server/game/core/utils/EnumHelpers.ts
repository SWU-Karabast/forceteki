import { Location, TargetableLocation, WildcardLocation } from "../Constants";

// convert a set of strings to map to an enum type, throw if any of them is not a legal value
export function checkConvertToEnum<T>(values: string[], enumObj: T): Array<T[keyof T]> {
    let result: Array<T[keyof T]> = [];

    for (const value of values) {
        if (Object.values(enumObj).indexOf(value.toLowerCase()) >= 0) {
            result.push(value as T[keyof T]);
        } else {
            throw new Error(`Invalid value for enum: ${value}`);
        }
    }

    return result;
}

// TODO: where to put these helpers?
export const isArena = (location: TargetableLocation) => {
    switch (location) {
        case Location.GroundArena:
        case Location.SpaceArena:
        case WildcardLocation.AnyArena:
            return true;
        default:
            return false;
    }
}

export const isAttackableLocation = (location: TargetableLocation) => {
    switch (location) {
        case Location.GroundArena:
        case Location.SpaceArena:
        case WildcardLocation.AnyArena:
        case Location.Base:
            return true;
        default:
            return false;
    }
}

// return true if the location matches one of the allowed location filters
export const cardLocationMatches = (cardLocation: Location, allowedLocations: TargetableLocation | TargetableLocation[]) => {
    if (!Array.isArray(allowedLocations)) {
        allowedLocations = [allowedLocations];
    }

    return allowedLocations.some((allowedLocation) => {
        switch (allowedLocation) {
            case WildcardLocation.Any:
                return true;
            case WildcardLocation.AnyArena:
                return isArena(cardLocation);
            case WildcardLocation.AnyAttackable:
                return isAttackableLocation(cardLocation);
            default:
                return cardLocation === allowedLocation;
        }});
}