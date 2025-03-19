import { DynamoDBService, IUserData } from '../../../server/services/DynamoDBService';

async function seedLocalDynamoDB() {
    console.log('Initializing local DynamoDB with test data...');

    // Create a DynamoDB service instance with local mode
    const dbService = new DynamoDBService(true);
    try {
        // Clear any existing data
        await dbService.clearAllData();
        console.log('Cleared existing data');

        // Create test users with separate email data
        const users: IUserData[] = [
            {
                id: 'google_123456',
                username: 'player1',
                lastLogin: new Date().toISOString(),
                createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
                username_set_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
                preferences: {
                    theme: 'dark',
                    notifications: true,
                    cardback: 'imperial'
                },
            },
            {
                id: 'discord_789012',
                username: 'player2',
                lastLogin: new Date().toISOString(),
                createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
                username_set_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
                preferences: {
                    theme: 'light',
                    notifications: false,
                    cardback: 'rebel'
                },
            },
            {
                id: 'google_admin123',
                username: 'admin',
                lastLogin: new Date().toISOString(),
                createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
                username_set_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
                preferences: {
                    theme: 'system',
                    notifications: true,
                    isAdmin: true,
                    cardback: 'admin'
                },
            }
        ];

        // Store email data separately
        const userEmails = {
            google_123456: 'player1@example.com',
            discord_789012: 'player2@example.com',
            google_admin123: 'admin@example.com'
        };

        // Create test decks
        const decks = [
            {
                id: 'deck1',
                userId: 'google_123456',
                deck: {
                    name: 'Player 1\'s First Deck',
                    cards: [/* card data would go here */]
                },
                stats: {
                    wins: 5,
                    losses: 2
                }
            },
            {
                id: 'deck2',
                userId: 'google_123456',
                deck: {
                    name: 'Player 1\'s Second Deck',
                    cards: [/* card data would go here */]
                },
                stats: {
                    wins: 3,
                    losses: 1
                }
            },
            {
                id: 'deck3',
                userId: 'discord_789012',
                deck: {
                    name: 'Player 2\'s Deck',
                    cards: [/* card data would go here */]
                },
                stats: {
                    wins: 2,
                    losses: 4
                }
            }
        ];

        // Create test game records
        const games = [
            {
                id: 'game1',
                player1: 'google_123456',
                player2: 'discord_789012',
                firstTurn: 'google_123456',
                winner: 'google_123456',
                winnerBaseHealthRemaining: 12,
                player1LeaderId: 'leader1',
                player1BaseId: 'base1',
                player2LeaderId: 'leader2',
                player2BaseId: 'base2'
            }
        ];

        // Save users with all their connections
        for (const user of users) {
            // Save user profile
            const result = await dbService.saveUserProfile(user);
            const userId = result.Attributes?.id || user.id;

            if (!userId) {
                throw new Error(`Failed to get ID for user ${user.username}`);
            }

            console.log(`Created user profile: ${user.username} (${userId})`);

            // Create OAuth link - extract provider and ID from user data
            const provider = 'discord';
            const providerId = user.id;

            if (provider && providerId) {
                await dbService.saveOAuthLink(provider, providerId, userId);
                console.log(`Created OAuth link for ${user.username}`);
            }

            // Create email link
            const email = userEmails[user.id];
            if (email) {
                await dbService.saveEmailLink(email, userId);
                console.log(`Created email link for ${user.username} (${email})`);
            }
        }

        // Save decks
        for (const deck of decks) {
            await dbService.saveDeck(deck);
            console.log(`Created deck: ${deck.deck.name}`);
        }

        // Save games
        for (const game of games) {
            await dbService.saveGameRecord(game);
            console.log(`Created game record: ${game.id}`);
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