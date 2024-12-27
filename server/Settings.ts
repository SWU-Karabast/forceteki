const defaultWindows = {
    dynasty: true,
    draw: false,
    preConflict: true,
    conflict: true,
    fate: false,
    regroup: false
};

const defaultOptionSettings = {
    markCardsUnselectable: true,
    cancelOwnAbilities: false,
    orderForcedAbilities: false,
    confirmOneClick: false,
    disableCardStats: false,
    showStatusInSidebar: false,
    sortHandByName: false
};

const defaultSettings = {
    disableGravatar: false,
    windowTimer: 10,
    background: 'BG1'
};

const defaultTimerSettings = {
    events: true,
    eventsInDeck: false
};

interface User {
    username: string;
    email: string;
    emailHash: string;
    id: string;
    admin: boolean;
    permissions: unknown;
    blockList: string[];
    promptedActionWindows: {
        dynasty: boolean;
        draw: boolean;
        preConflict: boolean;
        conflict: boolean;
        fate: boolean;
        regroup: boolean;
    };
    settings: Partial<{
        disableGravatar: boolean;
        windowTimer: number;
        background: string;
        optionSettings: Partial<{
            markCardsUnselectable: boolean;
            cancelOwnAbilities: boolean;
            orderForcedAbilities: boolean;
            confirmOneClick: boolean;
            disableCardStats: boolean;
            showStatusInSidebar: boolean;
            sortHandByName: boolean;
        }>;
        timerSettings: Partial<{
            events: boolean;
            eventsInDeck: boolean;
        }>;
    }>;
}

export function getUserWithDefaultsSet(user?: Partial<User> & Pick<User, 'username' | 'id'>) {
    if (!user) {
        return undefined;
    }

    user.blockList = Array.isArray(user.blockList) ? user.blockList : [];
    user.settings = Object.assign({}, defaultSettings, user.settings);
    user.settings.optionSettings = Object.assign({}, defaultOptionSettings, user.settings.optionSettings);
    user.settings.timerSettings = Object.assign({}, defaultTimerSettings, user.settings.timerSettings);
    user.permissions = Object.assign({}, user.permissions);
    user.promptedActionWindows = Object.assign({}, defaultWindows, user.promptedActionWindows);

    return user;
}
