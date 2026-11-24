import { EnumHelpers } from '../../game/core/utils/EnumHelpers';

/**
 * Every feature flag the server knows. Who each one is on for is stored in DynamoDB and set from the
 * admin panel; adding a flag here is what makes it exist. To retire a flag, remove it here and remove the
 * code that reads it. Its stored item is then ignored.
 */
export enum FeatureFlag {
    FauxSunsAccess = 'fauxSunsAccess',
}

export function isFeatureFlag(value: string): value is FeatureFlag {
    return EnumHelpers.isEnumValue(value, FeatureFlag);
}

export interface IFeatureFlagDefinition {

    /** What turning the flag on does, shown in the admin panel. */
    description: string;

    /**
     * Whether the flag is enabled (on for everyone) before any admin has set it. A flag that gates
     * something new starts off, so deploying it changes nothing until someone assigns it or enables it.
     */
    defaultEnabled: boolean;

    /** Whether the client is told the flag's value for the caller. Leave false for flags only the server reads. */
    exposeToClient: boolean;
}

export const featureFlagDefinitions: Record<FeatureFlag, IFeatureFlagDefinition> = {
    [FeatureFlag.FauxSunsAccess]: {
        description: 'Can create Faux Suns lobbies',
        defaultEnabled: false,
        exposeToClient: true,
    },
};
