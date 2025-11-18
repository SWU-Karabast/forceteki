// scripts/seedCosmetics.ts
// to run this script run on root folder ts-node scripts/seed-dynamo.ts
import '../server/env';
import { getDynamoDbServiceAsync } from '../server/services/DynamoDBService';
import { type IRegisteredCosmeticOption } from '../server/utils/cosmetics/CosmeticsInterfaces';

async function run() {
    const service = await getDynamoDbServiceAsync();

    let cosmeticsData: any;

    if (process.env.ENVIRONMENT === 'development') {
        cosmeticsData = await import('../server/data/fallback-cosmetics-local.json');
    } else {
        cosmeticsData = await import('../server/data/fallback-cosmetics.json');
    }

    if (!service) {
        throw new Error('DynamoDB service not available (are you in dev & DynamoDB Local running?)');
    }

    // Cast the JSON data to the correct type
    const cosmetics = cosmeticsData.default as IRegisteredCosmeticOption[];

    console.log(`Starting to seed ${cosmetics.length} cosmetic items...`);

    // Use the initializeCosmeticsAsync method to bulk insert all cosmetics
    const result = await service.initializeCosmeticsAsync(cosmetics);

    console.log(`Successfully seeded ${result.initializedCount} cosmetic items!`);

    // Verify by fetching them back
    const fetchedCosmetics = await service.getCosmeticsAsync();
    console.log(`Verification: Found ${fetchedCosmetics.length} cosmetics in database`);

    // Group by type for summary
    const summary = fetchedCosmetics.reduce((acc, cosmetic) => {
        acc[cosmetic.type] = (acc[cosmetic.type] || 0) + 1;
        return acc;
    }, {} satisfies Record<string, number>);

    console.log('Summary by type:', summary);
}

run().catch((err) => {
    console.error('Error seeding cosmetics:', err);
    process.exit(1);
});