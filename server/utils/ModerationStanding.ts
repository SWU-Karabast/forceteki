import type { IModActionEntity } from '../services/DynamoDBInterfaces';
import { ModActionDefinitions } from '../services/DynamoDBInterfaces';

/**
 * A player's moderation record at a glance, for the report dashboard: whether a mute or forced rename is in
 * effect right now, happened in the past, or never happened. Which action types count is set by
 * `countsTowardStanding` in the mod action definitions.
 */
export enum ModerationStanding {
    Active = 'active',
    History = 'history',
    Clean = 'clean',
}

/** What is in effect for the player right now, as the ModActionService cache reports it */
export interface IActiveModerationState {

    /** Also true for a mute that starts at the next login */
    isMuted: boolean;
    hasPendingRename: boolean;
}

export const getModerationStanding = (modActions: readonly IModActionEntity[], active: IActiveModerationState): ModerationStanding => {
    if (active.isMuted || active.hasPendingRename) {
        return ModerationStanding.Active;
    }

    // A cancelled action was taken back, usually because it was issued by mistake, so it leaves no record
    const hasRecord = modActions.some((action) => !action.cancelledAt && ModActionDefinitions[action.actionType]?.countsTowardStanding);
    return hasRecord ? ModerationStanding.History : ModerationStanding.Clean;
};

const SEVERITY: Record<ModerationStanding, number> = {
    [ModerationStanding.Active]: 2,
    [ModerationStanding.History]: 1,
    [ModerationStanding.Clean]: 0,
};

/** Sort comparator putting the most severe standing first */
export const bySeverityDescending = (a: ModerationStanding, b: ModerationStanding): number => SEVERITY[b] - SEVERITY[a];
