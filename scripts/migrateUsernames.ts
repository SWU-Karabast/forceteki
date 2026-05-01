// scripts/migrateUsernameLinks.ts
//
// One-time migration script that creates USERNAME# link items for all existing user profiles.
// This enables the mod tools username search for accounts created before the feature was added.
//

import { getDynamoDbServiceAsync } from '../server/services/DynamoDBService';
import '../server/env';

const DRY_RUN = true; // set to false to actually write

// Usage: ts-node scripts/migrateUsernameLinks.ts
async function run() {
    const service = await getDynamoDbServiceAsync();
    if (!service) {
        throw new Error('DynamoDB service not available.');
    }

    console.log(`Starting username link migration${DRY_RUN ? ' (DRY RUN)' : ''}...`);

    const profiles = await service.getAllUserProfilesAsync();
    let created = 0;
    let skipped = 0;
    let errors = 0;

    for (const profile of profiles) {
        if (!profile.id || !profile.username) {
            console.warn(`  Skipping profile ${profile} with missing id or username`);
            skipped++;
            continue;
        }

        if (DRY_RUN) {
            console.log(`  [DRY RUN] Would create link: USERNAME#${profile.username.toLowerCase()} -> USER#${profile.id}`);
            created++;
        } else {
            try {
                await service.saveUsernameLinkAsync(profile.username, profile.id);
                console.log(`  Created link: USERNAME#${profile.username.toLowerCase()} -> USER#${profile.id} (${profile.username})`);
                created++;
            } catch (error) {
                console.error(`  Failed to create link for ${profile.username} (${profile.id}):`, error.message);
                errors++;
            }
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