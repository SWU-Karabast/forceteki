// scripts/migrateReportingDisabled.ts

// One-time migration script that converts the legacy `reportingDisabled` user-profile field into a
// first-class ReportingDisabled mod action (aligning it with Mute / Rename). For each profile that has
// the legacy field set, it creates a MODACTION# item indexed in the ACTIVE_MODACTION GSI and removes
// the legacy field from the profile.
//
// This is intended to be run once, during deployment downtime, AFTER the new code is deployed and BEFORE
// the server starts serving traffic (so no user ever loses the restriction during cutover).
//
// Writes are deliberately per-user and ordered action-first: the legacy field is only removed once the
// mod action is durably written, so an interrupted run always leaves users in a re-runnable state.
//
// Configuration is by environment variable (no source edits needed):
//   MIGRATION_TARGET      'local' (default) or 'production'
//   MIGRATION_APPLY       'true' to actually write; anything else is a dry run
//   MIGRATION_MODERATOR_ID / MIGRATION_MODERATOR_USERNAME   attribution for the created actions
//
// For production you also need the usual DynamoDB credentials (API_KEY / SECRET) and ENVIRONMENT set to
// the production value so DynamoDBService does not redirect to local DynamoDB.
//
// Usage: MIGRATION_TARGET=production MIGRATION_APPLY=true ts-node scripts/migrateReportingDisabled.ts

import { v4 as uuid } from 'uuid';
import { getDynamoDbServiceAsync } from '../server/services/DynamoDBService';
import { type IModActionEntity, ModActionType, ModerationFieldState } from '../server/services/DynamoDBInterfaces';
import '../server/env';

const TARGET = process.env.MIGRATION_TARGET ?? 'local';
const APPLY = process.env.MIGRATION_APPLY === 'true';

const MODERATOR_ID = process.env.MIGRATION_MODERATOR_ID ?? 'migration';
const MODERATOR_USERNAME = process.env.MIGRATION_MODERATOR_USERNAME ?? 'migration';
const MIGRATION_NOTE = 'Migrated from legacy reportingDisabled field';

const LEGACY_FIELD = 'reportingDisabled';

function assertEnvironmentMatchesTarget(isLocalMode: boolean) {
    if (TARGET !== 'local' && TARGET !== 'production') {
        throw new Error(`MIGRATION_TARGET must be 'local' or 'production', got '${TARGET}'.`);
    }

    // DynamoDBService decides local-vs-real purely from ENVIRONMENT. Fail loudly on a mismatch so a
    // production run can never silently succeed against an empty local table.
    if (TARGET === 'production' && isLocalMode) {
        throw new Error(
            'MIGRATION_TARGET=production but DynamoDB is in local mode (ENVIRONMENT=development). ' +
            'Set ENVIRONMENT to the production value so the script talks to the real table.'
        );
    }
    if (TARGET === 'local' && !isLocalMode) {
        throw new Error(
            'MIGRATION_TARGET=local but DynamoDB is not in local mode. ' +
            'Set ENVIRONMENT=development, or pass MIGRATION_TARGET=production if that was intended.'
        );
    }
}

async function run() {
    const service = await getDynamoDbServiceAsync();
    if (!service) {
        throw new Error('DynamoDB service not available.');
    }

    assertEnvironmentMatchesTarget(service.isLocalMode);

    console.log(`Starting reportingDisabled migration against ${TARGET}${APPLY ? '' : ' (DRY RUN)'}...`);
    console.log(`Attributing created actions to ${MODERATOR_USERNAME} (${MODERATOR_ID}).`);

    const profiles = await service.getAllUserProfilesAsync();
    console.log(`Found ${profiles.length} profiles to scan.\n`);

    if (TARGET === 'production' && profiles.length === 0) {
        throw new Error('Scanned zero profiles in production. Refusing to report success; check the table configuration.');
    }

    let created = 0;
    let skipped = 0;
    let alreadyMigrated = 0;
    const failedUserIds: string[] = [];

    for (const profile of profiles) {
        const legacy = profile.reportingDisabled;
        if (!profile.id || !legacy) {
            skipped++;
            continue;
        }

        // Idempotency: skip if this player already has an active (non-cancelled) ReportingDisabled action.
        const existingActions = await service.getModActionsAsync({ userId: profile.id });
        const alreadyHasActive = existingActions.some(
            (action) => action.actionType === ModActionType.ReportingDisabled && !action.cancelledAt
        );
        if (alreadyHasActive) {
            alreadyMigrated++;
            continue;
        }

        const modAction: IModActionEntity = {
            id: uuid(),
            playerId: profile.id,
            actionType: ModActionType.ReportingDisabled,
            note: MIGRATION_NOTE,
            moderatorId: MODERATOR_ID,
            moderatorUsername: MODERATOR_USERNAME,
            createdAt: new Date().toISOString(),
        };

        if (!APPLY) {
            created++;
            continue;
        }

        // Order matters: the restriction must exist before the legacy field is removed, otherwise a
        // failure here leaves the user unrestricted with nothing left to re-run against.
        try {
            await service.saveModActionAsync(modAction);
        } catch (error) {
            console.error(`Failed to create mod action for ${profile.id}:`, error.message);
            failedUserIds.push(profile.id);
            continue;
        }

        // Carry over the legacy acknowledgement so already-notified users don't see the popup again.
        try {
            if (legacy === ModerationFieldState.EnabledAndSeen) {
                await service.updateUserProfileAsync(profile.id, { reportingDisabledSeenActionId: modAction.id });
            }
            await service.removeUserProfileAttributeAsync(profile.id, LEGACY_FIELD);
        } catch (error) {
            console.error(`Created mod action for ${profile.id} but failed to update profile:`, error.message);
            failedUserIds.push(profile.id);
            continue;
        }

        created++;
    }

    console.log('\n--- Migration Summary ---');
    console.log(`Total profiles scanned: ${profiles.length}`);
    console.log(`ReportingDisabled actions created: ${created}`);
    console.log(`Already migrated (skipped): ${alreadyMigrated}`);
    console.log(`Skipped (no legacy field): ${skipped}`);
    console.log(`Failed: ${failedUserIds.length}`);
    if (failedUserIds.length > 0) {
        console.log(`Failed user IDs (safe to re-run):\n${failedUserIds.join('\n')}`);
    }
    if (!APPLY) {
        console.log('\nThis was a DRY RUN. Set MIGRATION_APPLY=true to write to the database.');
    }
}

run().catch((err) => {
    console.error(err);
    process.exit(1);
});
