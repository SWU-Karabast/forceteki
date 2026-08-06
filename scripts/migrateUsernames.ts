// scripts/migrateUsernameLinks.ts

// One-time migration script that creates USERNAME# link items for all existing user profiles.
// This enables the mod tools username search for accounts created before the feature was added.
// For it to work in production you'll need to set the environment variables for the DynamoDB (API_KEY and SECRET)
// and you'll need to set USE_LOCAL_DYNAMODB == false and use ENVIRONMENT for production. Additionally set the DRY_RUN
// to false if you want the changes to actually happen.


// Usage: ts-node scripts/migrateUsernameLinks.ts
import { getDynamoDbServiceAsync } from '../server/services/DynamoDBService';
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

    console.log(`Starting username link migration${DRY_RUN ? ' (DRY RUN)' : ''}...`);

    const profiles = await service.getAllUserProfilesAsync();
    console.log(`Found ${profiles.length} profiles to migrate.\n`);

    let created = 0;
    let skipped = 0;
    let errors = 0;
    const batch: Record<string, any>[] = [];

    for (const profile of profiles) {
        if (!profile.id || !profile.username) {
            skipped++;
            continue;
        }

        const item = {
            pk: `USERNAME#${profile.username.toLowerCase()}`,
            sk: `USER#${profile.id}`,
            GSI_PK: profile.id,
        };

        if (DRY_RUN) {
            created++;
            continue;
        }

        batch.push(item);
        created++;

        if (batch.length >= BATCH_SIZE) {
            try {
                await service.batchWriteItemsAsync(batch);
            } catch (error) {
                console.error('Batch write failed:', error.message);
                errors += batch.length;
                created -= batch.length;
            }
            batch.length = 0;

            // Progress log every 1000
            if (created % 1000 === 0) {
                console.log(`  Progress: ${created}/${profiles.length} (${Math.round(created / profiles.length * 100)}%)`);
            }
        }
    }

    // Flush remaining
    if (batch.length > 0 && !DRY_RUN) {
        try {
            await service.batchWriteItemsAsync(batch);
        } catch (error) {
            console.error('Final batch write failed:', error.message);
            errors += batch.length;
            created -= batch.length;
        }
    }

    console.log('\n--- Migration Summary ---');
    console.log(`Total profiles scanned: ${profiles.length}`);
    console.log(`Links created: ${created}`);
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