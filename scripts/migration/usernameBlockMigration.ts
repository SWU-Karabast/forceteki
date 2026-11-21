import { v4 as uuid } from 'uuid';
import type { IModActionEntity, IUserProfileDataEntity } from '../../server/services/DynamoDBInterfaces';
import { ModActionType, ModerationFieldState } from '../../server/services/DynamoDBInterfaces';

/** The part of DynamoDBService the migration depends on. */
export interface IUsernameBlockMigrationDb {
    getAllUserProfilesAsync(): Promise<IUserProfileDataEntity[]>;
    getModActionsAsync(options: { userId?: string }): Promise<IModActionEntity[]>;
    saveModActionAsync(modAction: IModActionEntity): Promise<unknown>;
    updateUserProfileAsync(userId: string, updates: Partial<IUserProfileDataEntity>): Promise<unknown>;
    removeUserProfileAttributeAsync(userId: string, attributeName: keyof IUserProfileDataEntity): Promise<unknown>;
}

export interface IUsernameBlockMigrationOptions {

    /** When false nothing is written and the summary reports what would have been created. */
    apply: boolean;
    moderatorId: string;
    moderatorUsername: string;
}

export interface IUsernameBlockMigrationFailure {
    userId: string;
    stage: 'saveModAction' | 'updateProfile';
    message: string;
}

export interface IUsernameBlockMigrationSummary {
    scanned: number;
    created: number;
    alreadyMigrated: number;
    skipped: number;
    failures: IUsernameBlockMigrationFailure[];
}

export const LEGACY_USERNAME_BLOCK_FIELD = 'mustRequestUsernameChange';
export const USERNAME_BLOCK_MIGRATION_NOTE = 'Migrated from legacy mustRequestUsernameChange field';

/**
 * Converts the legacy `mustRequestUsernameChange` profile field into a UsernameChangesBlocked mod action.
 *
 * Writes are per user and action-first: the legacy field is only removed once the mod action is durably
 * written, so an interrupted run leaves every user in a state a re-run repairs.
 */
export async function migrateMustRequestUsernameChangeAsync(
    db: IUsernameBlockMigrationDb,
    options: IUsernameBlockMigrationOptions
): Promise<IUsernameBlockMigrationSummary> {
    const profiles = await db.getAllUserProfilesAsync();
    const summary: IUsernameBlockMigrationSummary = {
        scanned: profiles.length,
        created: 0,
        alreadyMigrated: 0,
        skipped: 0,
        failures: [],
    };

    for (const profile of profiles) {
        const legacy = profile.mustRequestUsernameChange;
        if (!profile.id || !legacy) {
            summary.skipped++;
            continue;
        }

        const existingActions = await db.getModActionsAsync({ userId: profile.id });
        const existing = existingActions.find(
            (action) => action.actionType === ModActionType.UsernameChangesBlocked && !action.cancelledAt
        );
        if (existing) {
            // A previous run may have saved the action but failed before finishing the profile, so finish it here.
            summary.alreadyMigrated++;
            if (options.apply) {
                await finishProfileAsync(db, profile, legacy, existing.id, summary);
            }
            continue;
        }

        const modAction: IModActionEntity = {
            id: uuid(),
            playerId: profile.id,
            actionType: ModActionType.UsernameChangesBlocked,
            note: USERNAME_BLOCK_MIGRATION_NOTE,
            moderatorId: options.moderatorId,
            moderatorUsername: options.moderatorUsername,
            createdAt: new Date().toISOString(),
        };

        if (!options.apply) {
            summary.created++;
            continue;
        }

        // Order matters: the restriction must exist before the legacy field is removed, otherwise a failure
        // here leaves the user unrestricted with nothing left to re-run against.
        try {
            await db.saveModActionAsync(modAction);
        } catch (error) {
            summary.failures.push({ userId: profile.id, stage: 'saveModAction', message: error.message });
            continue;
        }

        if (await finishProfileAsync(db, profile, legacy, modAction.id, summary)) {
            summary.created++;
        }
    }

    return summary;
}

async function finishProfileAsync(
    db: IUsernameBlockMigrationDb,
    profile: IUserProfileDataEntity,
    legacy: ModerationFieldState,
    modActionId: string,
    summary: IUsernameBlockMigrationSummary
): Promise<boolean> {
    try {
        // Carry over the legacy acknowledgement so already-notified users don't see the popup again.
        if (legacy === ModerationFieldState.EnabledAndSeen && !profile.usernameChangesBlockedSeenActionId) {
            await db.updateUserProfileAsync(profile.id, { usernameChangesBlockedSeenActionId: modActionId });
        }
        await db.removeUserProfileAttributeAsync(profile.id, LEGACY_USERNAME_BLOCK_FIELD);
        return true;
    } catch (error) {
        summary.failures.push({ userId: profile.id, stage: 'updateProfile', message: error.message });
        return false;
    }
}
