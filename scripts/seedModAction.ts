/**
 * Seed script for inserting moderation actions directly into local DynamoDB.
 * Useful for testing mod features (mutes, warnings, renames) without going through the mod UI.
 *
 * Prerequisites:
 *   - ENVIRONMENT=development and USE_LOCAL_DYNAMODB=true in your env
 *   - Local DynamoDB Docker container running
 * Usage:
 *   1. Set MY_USER_ID to the target user's GUID
 *   2. Configure ACTION_TYPE, DURATION_DAYS, EXPIRES_IN_MINUTES, and NOTE as needed
 *   3. From the root of the project run: ts-node scripts/seedModAction.ts
 */

import { v4 as uuid } from 'uuid';
import '../server/env';
import { getDynamoDbServiceAsync } from '../server/services/DynamoDBService';
import { ModActionType } from '../server/services/DynamoDBInterfaces';
import { isTimedModAction } from '../server/game/core/utils/EnumHelpers';

const MY_USER_ID: string | null = ''; // guid of the target user to apply the action to
const ACTION_TYPE: ModActionType = ModActionType.Mute;
const DURATION_DAYS: number | null = 1; // only needed for Mute
const EXPIRES_IN_MINUTES: number | null = 2; // set to pre-activate mute with custom expiry, null for pending mute
const NOTE = 'Test action from seed script';

async function run() {
    if (process.env.ENVIRONMENT !== 'development' || process.env.USE_LOCAL_DYNAMODB !== 'true') {
        throw new Error('Environmental variables ENVIRONMENT and USE_LOCAL_DYNAMODB need to be set.');
    }

    const service = await getDynamoDbServiceAsync();
    if (!service) {
        throw new Error('DynamoDB service not available (are you in dev & DynamoDB Local running?)');
    }

    if (!MY_USER_ID) {
        throw new Error(
            'MY_USER_ID is null or empty. Set it to the ID of the target user before running this script.'
        );
    }

    if (ACTION_TYPE === 'Mute' && (!DURATION_DAYS || DURATION_DAYS <= 0)) {
        throw new Error('Mute actions require a positive DURATION_DAYS.');
    }

    const modActionId = uuid();
    const now = new Date();

    const item: Record<string, any> = {
        pk: `USER#${MY_USER_ID}`,
        sk: `MODACTION#${modActionId}`,
        id: modActionId,
        playerId: MY_USER_ID,
        actionType: ACTION_TYPE,
        note: NOTE,
        moderatorId: 'seed-script',
        createdAt: now.toISOString(),
    };

    if (DURATION_DAYS && ACTION_TYPE === 'Mute') {
        item.durationDays = DURATION_DAYS;
    }

    // Pre-activate the mute with a custom expiry for testing
    if (EXPIRES_IN_MINUTES && ACTION_TYPE === 'Mute') {
        item.startedAt = now.toISOString();
        item.expiresAt = new Date(now.getTime() + EXPIRES_IN_MINUTES * 60 * 1000).toISOString();
    }

    // Active action types get indexed via the sparse GSI
    if (isTimedModAction(ACTION_TYPE)) {
        item.GSI_PK = 'ACTIVE_MODACTION';
    }

    await service.putItemAsync(item);

    console.log(`Seeded ${ACTION_TYPE} action for user: ${MY_USER_ID}`);
    if (EXPIRES_IN_MINUTES && ACTION_TYPE === 'Mute') {
        console.log(`Pre-activated, expires in ${EXPIRES_IN_MINUTES} minutes (at ${item.expiresAt})`);
    } else if (ACTION_TYPE === 'Mute') {
        console.log(`Pending mute (${DURATION_DAYS} days), will activate on user login`);
    }
    console.log(JSON.stringify(item, null, 2));
}

run().catch((err) => {
    console.error(err);
    process.exit(1);
});