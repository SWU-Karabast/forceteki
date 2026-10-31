import type { IModActionEntity, IUserProfileDataEntity, IUsernameChangeEntity } from '../../server/services/DynamoDBInterfaces';
import { isTrackedModAction, ModActionType } from '../../server/services/DynamoDBInterfaces';

/** The part of DynamoDBService the migration depends on. */
export interface IModActionRetentionMigrationDb {
    getAllUserProfilesAsync(): Promise<IUserProfileDataEntity[]>;

    /** With a userId: all actions of that player. Without: only the actions in the ACTIVE_MODACTION index. */
    getModActionsAsync(options: { userId?: string }): Promise<IModActionEntity[]>;
    getUsernameChangesAsync(userId: string): Promise<IUsernameChangeEntity[]>;
    endModActionAsync(playerId: string, modActionId: string, endedAt: string, options: { onlyIfInactive?: boolean }): Promise<boolean>;
}

export interface IModActionRetentionMigrationOptions {

    /** When false nothing is written and the summary reports what would have been changed. */
    apply: boolean;
    now: Date;
}

export interface IModActionRetentionMigrationSummary {
    scannedProfiles: number;
    ended: number;

    /** Actions whose end could not be read from their data, so the migration time was used (kept longer, never shorter) */
    endedAtMigrationTime: number;
    alreadyMigrated: number;
    stillActive: number;
    failures: { userId: string; modActionId: string; message: string }[];
}

/**
 * When an action that is no longer active ended, as far as its stored data tells. Falls back to `now` where it
 * does not, which keeps the action for longer rather than deleting it before its retention period is over.
 */
export function deriveEndedAt(
    action: IModActionEntity,
    usernameChanges: IUsernameChangeEntity[],
    now: Date
): { endedAt: string; fromMigrationTime: boolean } {
    if (action.cancelledAt) {
        return { endedAt: action.cancelledAt, fromMigrationTime: false };
    }
    if (!isTrackedModAction(action.actionType)) {
        return { endedAt: action.createdAt, fromMigrationTime: false };
    }
    if (action.actionType === ModActionType.Mute && action.expiresAt) {
        // A mute superseded under the old rules can be inactive while its expiry is still ahead; it ended now at the latest
        const nowIso = now.toISOString();
        return action.expiresAt < nowIso
            ? { endedAt: action.expiresAt, fromMigrationTime: false }
            : { endedAt: nowIso, fromMigrationTime: true };
    }
    if (action.actionType === ModActionType.Rename) {
        // A forced rename ends when the player picks a new name, which is recorded against the action
        const rename = usernameChanges.find((change) => change.relatedModActionId === action.id);
        if (rename) {
            return { endedAt: rename.createdAt, fromMigrationTime: false };
        }
    }
    return { endedAt: now.toISOString(), fromMigrationTime: true };
}

/**
 * Gives every mod action that ended before retention tracking existed its `endedAt` and ended-bucket index
 * entry, so the retention cleanup can find it. Active actions are left alone: they get both when they end.
 * Safe to re-run; actions that already have `endedAt` are skipped.
 */
export async function migrateModActionRetentionAsync(
    db: IModActionRetentionMigrationDb,
    options: IModActionRetentionMigrationOptions
): Promise<IModActionRetentionMigrationSummary> {
    const profiles = await db.getAllUserProfilesAsync();
    const activeIds = new Set((await db.getModActionsAsync({})).map((action) => action.id));
    const summary: IModActionRetentionMigrationSummary = {
        scannedProfiles: profiles.length,
        ended: 0,
        endedAtMigrationTime: 0,
        alreadyMigrated: 0,
        stillActive: 0,
        failures: [],
    };

    for (const profile of profiles) {
        if (!profile.id) {
            continue;
        }

        let actions: IModActionEntity[];
        try {
            actions = await db.getModActionsAsync({ userId: profile.id });
        } catch (error) {
            summary.failures.push({ userId: profile.id, modActionId: '(all)', message: error?.message ?? String(error) });
            continue;
        }
        const pending = actions.filter((action) => {
            if (action.endedAt) {
                summary.alreadyMigrated++;
                return false;
            }
            if (activeIds.has(action.id)) {
                summary.stillActive++;
                return false;
            }
            return true;
        });
        if (pending.length === 0) {
            continue;
        }

        let usernameChanges: IUsernameChangeEntity[];
        try {
            usernameChanges = await db.getUsernameChangesAsync(profile.id);
        } catch (error) {
            summary.failures.push({ userId: profile.id, modActionId: '(all)', message: error?.message ?? String(error) });
            continue;
        }
        for (const action of pending) {
            const { endedAt, fromMigrationTime } = deriveEndedAt(action, usernameChanges, options.now);
            try {
                // Conditional on the action still being inactive: one created or reactivated after the snapshot of
                // active actions above is left alone instead of being ended by mistake
                if (options.apply && !await db.endModActionAsync(action.playerId, action.id, endedAt, { onlyIfInactive: true })) {
                    summary.stillActive++;
                    continue;
                }
                summary.ended++;
                if (fromMigrationTime) {
                    summary.endedAtMigrationTime++;
                }
            } catch (error) {
                summary.failures.push({ userId: profile.id, modActionId: action.id, message: error?.message ?? String(error) });
            }
        }
    }

    return summary;
}
