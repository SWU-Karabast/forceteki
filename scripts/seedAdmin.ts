// scripts/seedAdmin.ts
import { getDynamoDbServiceAsync } from '../server/services/DynamoDBService';
import '../server/env';

const MY_USER_ID: string | null = null; // guid of generated user after logging in


// to run this script run on root folder ts-node scripts/seed-dynamo.ts
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
            'myUserId is null or empty. Set it to the ID of your local administrator before running this script.'
        );
    }

    await service.putItemAsync({
        pk: 'SERVER_ROLE_USERS',
        sk: 'ROLES',
        admins: [MY_USER_ID],
        developers: [],
        moderators: [],
        contributors: [MY_USER_ID],
        updatedAt: new Date().toISOString(),
    });

    console.log('Seeded admin:', MY_USER_ID);
}

run().catch((err) => {
    console.error(err);
    process.exit(1);
});
