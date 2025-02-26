import type { PhaseName } from './game/core/Constants';

const defaultWindows = {
    action: true,
    regroup: true
};

const defaultSettings = {
    optionSettings: {
        autoSingleTarget: true
    },
};

export interface User {
    username: string;
    id: string;
    blockList: string[];
    promptedActionWindows: { [key in PhaseName]: boolean };
    settings: Partial<{
        optionSettings: Partial<{
            autoSingleTarget: boolean;
        }>;
    }>;
}

export function getUserWithDefaultsSet(user?: Partial<User> & Pick<User, 'username' | 'id'>): User | undefined {
    if (!user) {
        return undefined;
    }

    return {
        blockList: [],
        settings: defaultSettings,
        promptedActionWindows: defaultWindows,
        ...user
    };
}
