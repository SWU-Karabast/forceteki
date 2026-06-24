// scripts/migrateUsernameChangeHistory.ts

// One-time migration script that creates an "Initial" username change history record for all existing
// user profiles. This seeds the username change history (shown in the mod tools) with each account's
// current username so that future changes have a starting point to display a before/after.
// For it to work in production you'll need to set the environment variables for the DynamoDB (API_KEY and SECRET)
// and you'll need to set USE_LOCAL_DYNAMODB == false and use ENVIRONMENT for production. Additionally set the DRY_RUN
// to false if you want the changes to actually happen.

// Usage: ts-node scripts/migrateUsernameChangeHistory.ts
import { v4 as uuid } from 'uuid';
import { getDynamoDbServiceAsync } from '../server/services/DynamoDBService';
import { UsernameChangeSource } from '../server/services/DynamoDBInterfaces';
import '../server/env';

const DRY_RUN = true; // set to false to actually write
const BATCH_SIZE = 25; // we set to 25 per documentation - https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_BatchWriteItem.html

async function run() {
    if (process.env.ENVIRONMENT !== 'development' || process.env.USE_LOCAL_DYNAMODB !== 'true') {
        throw new Error('Environmental variables ENVIRONMENT and USE_LOCAL_DYNAMODB need to be set.');
    }

    const service = await getDynamoDbServiceAsync();
    if (!service) {
        throw new Error('DynamoDB service not available.');
    }

    console.log(`Starting username change history migration${DRY_RUN ? ' (DRY RUN)' : ''}...`);

    const profiles = await service.getAllUserProfilesAsync();
    console.log(`Found ${profiles.length} profiles to migrate.\n`);

    let created = 0;
    let skipped = 0;
    let errors = 0;
    const batch: Record<string, any>[] = [];

    const flushAsync = async () => {
        if (batch.length === 0 || DRY_RUN) {
            return;
        }
        try {
            await service.batchWriteItemsAsync(batch);
        } catch (error) {
            console.error('Batch write failed:', error.message);
            errors += batch.length;
            created -= batch.length;
        }
        batch.length = 0;
    };

    for (const profile of profiles) {
        if (!profile.id || !profile.username) {
            skipped++;
            continue;
        }

        // Idempotency guard: skip profiles that already have any username change history.
        const existing = await service.getUsernameChangesAsync(profile.id);
        if (existing.length > 0) {
            skipped++;
            continue;
        }

        const id = uuid();
        const item = {
            pk: `USER#${profile.id}`,
            sk: `NAMECHANGE#${id}`,
            id,
            playerId: profile.id,
            previousUsername: null,
            newUsername: profile.username,
            source: UsernameChangeSource.Initial,
            createdAt: profile.createdAt ?? new Date().toISOString(),
        };

        if (DRY_RUN) {
            created++;
            continue;
        }

        batch.push(item);
        created++;

        if (batch.length >= BATCH_SIZE) {
            await flushAsync();

            // Progress log every 1000
            if (created % 1000 === 0) {
                console.log(`  Progress: ${created}/${profiles.length} (${Math.round(created / profiles.length * 100)}%)`);
            }
        }
    }

    // Flush remaining
    await flushAsync();

    console.log('\n--- Migration Summary ---');
    console.log(`Total profiles scanned: ${profiles.length}`);
    console.log(`Records created: ${created}`);
    console.log(`Skipped: ${skipped}`);
    console.log(`Errors: ${errors}`);
    if (DRY_RUN) {
        console.log('\nThis was a DRY RUN. Set DRY_RUN = false to write to the database.');
    }
}

run().catch((err) => {
    console.error(err);
    process.exit(1);
});
