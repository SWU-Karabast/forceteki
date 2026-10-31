// scripts/migration/migrateModActionRetention.ts

// One-time migration script for the mod action retention period (see ModActionRetentionService). Mod actions
// that ended before retention tracking existed have no `endedAt` and are not in an ended bucket, so the
// retention cleanup would never find them. This gives each of them both. Active actions are left alone.
//
// Where an action's data does not say when it ended (e.g. a resolved Force Rename without a linked username
// change), the migration time is used. Such actions are kept somewhat longer, never deleted too early.
//
// Run it once after the new code is deployed. It is safe to run while the server is serving traffic: every write
// only applies if the action is still neither active nor ended, so a mod action issued during the run is never
// ended by mistake. It is also safe to re-run: actions that already have `endedAt` are skipped.
//
// Configuration is by environment variable (no source edits needed):
//   MIGRATION_TARGET      'local' (default) or 'production'
//   MIGRATION_APPLY       'true' to actually write; anything else is a dry run
//
// For production you also need the usual DynamoDB credentials (API_KEY / SECRET) and ENVIRONMENT set to
// the production value so DynamoDBService does not redirect to local DynamoDB.
//
// Usage: MIGRATION_TARGET=production MIGRATION_APPLY=true ts-node scripts/migration/migrateModActionRetention.ts

import { getDynamoDbServiceAsync } from '../../server/services/DynamoDBService';
import { migrateModActionRetentionAsync } from './modActionRetentionMigration';
import '../../server/env';

const TARGET = process.env.MIGRATION_TARGET ?? 'local';
const APPLY = process.env.MIGRATION_APPLY === 'true';

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

    console.log(`Starting mod action retention migration against ${TARGET}${APPLY ? '' : ' (DRY RUN)'}...`);

    const summary = await migrateModActionRetentionAsync(service, { apply: APPLY, now: new Date() });

    console.log('\n--- Migration Summary ---');
    console.log(`Total profiles scanned: ${summary.scannedProfiles}`);
    console.log(`Ended actions given endedAt: ${summary.ended}`);
    console.log(`  of which the migration time was used: ${summary.endedAtMigrationTime}`);
    console.log(`Already migrated: ${summary.alreadyMigrated}`);
    console.log(`Still active (left alone): ${summary.stillActive}`);
    console.log(`Failed: ${summary.failures.length}`);
    for (const failure of summary.failures) {
        console.log(`  ${failure.userId} / ${failure.modActionId}: ${failure.message}`);
    }
    if (summary.failures.length > 0) {
        console.log('Failed actions are safe to re-run.');
    }
    if (!APPLY) {
        console.log('\nThis was a DRY RUN. Set MIGRATION_APPLY=true to write to the database.');
    }

    // Zero profiles in production means the script is not looking at the real table.
    if (TARGET === 'production' && summary.scannedProfiles === 0) {
        throw new Error('Scanned zero profiles in production. Refusing to report success; check the table configuration.');
    }
    if (summary.failures.length > 0) {
        process.exitCode = 1;
    }
}

run().catch((err) => {
    console.error(err);
    process.exit(1);
});
