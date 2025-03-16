import { DynamoDBService, IUserData } from '../../../server/services/DynamoDBService';


async function seedLocalDynamoDB() {
    console.log('Initializing local DynamoDB with test data...');

    // Create a DynamoDB service instance with local mode
    const dbService = new DynamoDBService(true);
    try {
        // Clear any existing data
        await dbService.clearAllData();
        console.log('Cleared existing data');

        // Create test users
        const users: IUserData[] = [
            {
                id: 'user1',
                username: 'player1',
                email: 'player1@example.com',
                provider: 'local',
                avatarUrl: 'https://example.com/avatar1.jpg',
                lastLogin: new Date().toISOString(),
                createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
                settings: {
                    theme: 'dark',
                    notifications: true
                }
            },
            {
                id: 'user2',
                username: 'player2',
                email: 'player2@example.com',
                provider: 'google',
                avatarUrl: 'https://example.com/avatar2.jpg',
                lastLogin: new Date().toISOString(),
                createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
                settings: {
                    theme: 'light',
                    notifications: false
                }
            },
            {
                id: 'admin1',
                username: 'admin',
                email: 'admin@example.com',
                provider: 'local',
                lastLogin: new Date().toISOString(),
                createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
                settings: {
                    theme: 'system',
                    notifications: true,
                    isAdmin: true
                }
            }
        ];

        // Save each test user
        for (const user of users) {
            await dbService.saveUser(user);
            console.log(`Created user: ${user.username}`);
        }

        console.log('Successfully seeded local DynamoDB with test data!');
    } catch (error) {
        console.error('Error seeding local DynamoDB:', error);
        process.exit(1);
    }
}

// Only run this script directly (not when imported)
if (require.main === module) {
    seedLocalDynamoDB().catch(console.error);
}

export { seedLocalDynamoDB };