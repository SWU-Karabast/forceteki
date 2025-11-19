// scripts/seedAdmin.ts
import { getDynamoDbServiceAsync } from '../server/services/DynamoDBService';
import '../server/env';
// to run this script run on root folder ts-node scripts/seed-dynamo.ts


async function run() {
    if (process.env.ENVIRONMENT !== 'development' || process.env.USE_LOCAL_DYNAMODB !== 'true') {
        return;
    }
    const service = await getDynamoDbServiceAsync();
    if (!service) {
        throw new Error('DynamoDB service not available (are you in dev & DynamoDB Local running?)');
    }

    const myUserId = 'None'; // e.g. 'ID of your local administrator'

    await service.putItemAsync({
        pk: 'SERVER_ROLE_USERS',
        sk: 'ROLES',
        admins: [myUserId],
        developers: [],
        moderators: [],
        updatedAt: new Date().toISOString(),
    });

    console.log('Seeded admin:', myUserId);
}

run().catch((err) => {
    console.error(err);
    process.exit(1);
});
