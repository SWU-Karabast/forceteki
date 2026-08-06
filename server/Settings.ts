import type { PhaseName } from './game/core/Constants';
import type { ICosmeticEntity } from './utils/cosmetics/CosmeticsInterfaces';

const defaultWindows = {
    setup: true,
    action: true,
    regroup: true
};

const defaultSettings = {
    optionSettings: {
        autoSingleTarget: true
    },
};

export interface IUser {
    username: string;
    id: string;
    blockList: string[];
    promptedActionWindows: Record<PhaseName, boolean>;
    settings: Partial<{
        optionSettings: Partial<{
            autoSingleTarget: boolean;
        }>;
    }>;
    cosmetics?: Partial<{
        cardback: ICosmeticEntity;
        background: ICosmeticEntity;
    }>;
}

export function getUserWithDefaultsSet(user?: Partial<IUser> & Pick<IUser, 'username' | 'id'>): IUser | undefined {
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
