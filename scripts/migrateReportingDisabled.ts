// scripts/migrateReportingDisabled.ts

// One-time migration script that converts the legacy `reportingDisabled` user-profile field into a
// first-class ReportingDisabled mod action (aligning it with Mute / Rename). For each profile that has
// the legacy field set, it creates a MODACTION# item indexed in the ACTIVE_MODACTION GSI and clears the
// legacy field from the profile.
//
// This is intended to be run once, during deployment downtime, AFTER the new code is deployed and BEFORE
// the server starts serving traffic (so no user ever loses the restriction during cutover).
//
// For it to work in production you'll need to set the environment variables for the DynamoDB (API_KEY and
// SECRET) and you'll need to set USE_LOCAL_DYNAMODB == false and use ENVIRONMENT for production.
// Additionally set DRY_RUN to false if you want the changes to actually happen.
//
// Usage: ts-node scripts/migrateReportingDisabled.ts

import { v4 as uuid } from 'uuid';
import { getDynamoDbServiceAsync } from '../server/services/DynamoDBService';
import { ModActionType, ModerationFieldState } from '../server/services/DynamoDBInterfaces';
import '../server/env';

const DRY_RUN = true; // set to false to actually write
const BATCH_SIZE = 25; // 25 per BatchWriteItem docs - https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_BatchWriteItem.html

// Moderator to attribute the migrated actions to. Override these to inject a real moderator's identity.
const MODERATOR_ID = 'migration';
const MODERATOR_USERNAME = 'migration';
const MIGRATION_NOTE = 'Migrated from legacy reportingDisabled field';

async function run() {
    if (process.env.ENVIRONMENT !== 'development' || process.env.USE_LOCAL_DYNAMODB !== 'true') {
        throw new Error('Environmental variables ENVIRONMENT and USE_LOCAL_DYNAMODB need to be set.');
    }

    const service = await getDynamoDbServiceAsync();
    if (!service) {
        throw new Error('DynamoDB service not available.');
    }

    console.log(`Starting reportingDisabled migration${DRY_RUN ? ' (DRY RUN)' : ''}...`);

    const profiles = await service.getAllUserProfilesAsync();
    console.log(`Found ${profiles.length} profiles to scan.\n`);

    let created = 0;
    let skipped = 0;
    let alreadyMigrated = 0;
    let errors = 0;
    let modActionBatch: Record<string, any>[] = [];

    const flushBatchAsync = async () => {
        if (modActionBatch.length === 0) {
            return;
        }
        try {
            await service.batchWriteItemsAsync(modActionBatch);
        } catch (error) {
            console.error('Batch write failed:', error.message);
            errors += modActionBatch.length;
            created -= modActionBatch.length;
        }
        modActionBatch = [];
    };

    for (const profile of profiles) {
        // The legacy field has been removed from the typed interface; read it via a narrow cast.
        const legacy = (profile as { reportingDisabled?: ModerationFieldState }).reportingDisabled;
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

        const now = new Date().toISOString();
        const modActionId = uuid();
        const item: Record<string, any> = {
            pk: `USER#${profile.id}`,
            sk: `MODACTION#${modActionId}`,
            id: modActionId,
            playerId: profile.id,
            actionType: ModActionType.ReportingDisabled,
            note: MIGRATION_NOTE,
            moderatorId: MODERATOR_ID,
            moderatorUsername: MODERATOR_USERNAME,
            createdAt: now,
            startedAt: now,
            hasSeen: legacy === ModerationFieldState.EnabledAndSeen,
            GSI_PK: 'ACTIVE_MODACTION',
        };

        if (DRY_RUN) {
            created++;
            continue;
        }

        modActionBatch.push(item);
        created++;

        if (modActionBatch.length >= BATCH_SIZE) {
            await flushBatchAsync();
        }

        // Clear the legacy field from the profile (individual update; can't be batched with the put).
        try {
            await service.updateUserProfileAsync(profile.id, { reportingDisabled: null } as any);
        } catch (error) {
            console.error(`Failed to clear legacy field for ${profile.id}:`, error.message);
            errors++;
        }
    }

    if (!DRY_RUN) {
        await flushBatchAsync();
    }

    console.log('\n--- Migration Summary ---');
    console.log(`Total profiles scanned: ${profiles.length}`);
    console.log(`ReportingDisabled actions created: ${created}`);
    console.log(`Already migrated (skipped): ${alreadyMigrated}`);
    console.log(`Skipped (no legacy field): ${skipped}`);
    console.log(`Errors: ${errors}`);
    if (DRY_RUN) {
        console.log('\nThis was a DRY RUN. Set DRY_RUN = false to write to the database.');
    }
}

run().catch((err) => {
    console.error(err);
    process.exit(1);
});
