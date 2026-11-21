// scripts/migration/migrateMustRequestUsernameChange.ts

// One-time migration script that converts the legacy `mustRequestUsernameChange` user-profile field into a
// first-class UsernameChangesBlocked mod action (aligning it with Mute / Rename / ReportingDisabled). For each
// profile that has the legacy field set, it creates a MODACTION# item indexed in the ACTIVE_MODACTION GSI,
// carries over the "seen" acknowledgement, and removes the legacy field from the profile.
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
// Usage: MIGRATION_TARGET=production MIGRATION_APPLY=true ts-node scripts/migration/migrateMustRequestUsernameChange.ts

import { getDynamoDbServiceAsync } from '../../server/services/DynamoDBService';
import { migrateMustRequestUsernameChangeAsync } from './usernameBlockMigration';
import '../../server/env';

const TARGET = process.env.MIGRATION_TARGET ?? 'local';
const APPLY = process.env.MIGRATION_APPLY === 'true';

const MODERATOR_ID = process.env.MIGRATION_MODERATOR_ID ?? 'migration';
const MODERATOR_USERNAME = process.env.MIGRATION_MODERATOR_USERNAME ?? 'migration';

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

    console.log(`Starting mustRequestUsernameChange migration against ${TARGET}${APPLY ? '' : ' (DRY RUN)'}...`);
    console.log(`Attributing created actions to ${MODERATOR_USERNAME} (${MODERATOR_ID}).`);

    const summary = await migrateMustRequestUsernameChangeAsync(service, {
        apply: APPLY,
        moderatorId: MODERATOR_ID,
        moderatorUsername: MODERATOR_USERNAME,
    });

    console.log('\n--- Migration Summary ---');
    console.log(`Total profiles scanned: ${summary.scanned}`);
    console.log(`UsernameChangesBlocked actions created: ${summary.created}`);
    console.log(`Already migrated (legacy field cleaned up): ${summary.alreadyMigrated}`);
    console.log(`Skipped (no legacy field): ${summary.skipped}`);
    console.log(`Failed: ${summary.failures.length}`);
    for (const failure of summary.failures) {
        console.log(`  ${failure.userId} (${failure.stage}): ${failure.message}`);
    }
    if (summary.failures.length > 0) {
        console.log('Failed users are safe to re-run.');
    }
    if (!APPLY) {
        console.log('\nThis was a DRY RUN. Set MIGRATION_APPLY=true to write to the database.');
    }

    // Zero profiles in production means the script is not looking at the real table.
    if (TARGET === 'production' && summary.scanned === 0) {
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
