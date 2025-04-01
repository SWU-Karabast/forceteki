import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
    DeleteCommand,
    DynamoDBDocumentClient,
    GetCommand,
    PutCommand,
    QueryCommand,
    ScanCommand,
    UpdateCommand
} from '@aws-sdk/lib-dynamodb';
import { logger } from '../logger';
import type { IDeckDataEntity, IDeckStatsEntity, IUserProfileDataEntity } from './DynamoDBInterfaces';

class DynamoDBService {
    private client: DynamoDBDocumentClient;
    private tableName: string;
    private isLocalMode: boolean;

    public constructor() {
        this.isLocalMode = process.env.ENVIRONMENT === 'development';
        this.tableName = 'KarabastGlobalTable';
        // Configure the DynamoDB client
        let dbClientConfig: any = {
            region: process.env.AWS_REGION || 'us-east-1',
        };
        // Configure for local testing if in development environment or explicitly specified
        if (this.isLocalMode) {
            const endpoint = 'http://localhost:8000';
            logger.info(`DynamoDB service initialized in LOCAL mode with endpoint: ${endpoint} (${process.env.ENVIRONMENT === 'development' ? 'auto-detected development environment' : 'explicitly configured'})`);

            dbClientConfig = {
                ...dbClientConfig,
                endpoint,
                credentials: {
                    accessKeyId: 'dummy',
                    secretAccessKey: 'dummy'
                }
            };
        } else {
            // Use actual AWS credentials for production
            dbClientConfig.credentials = {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
            };
        }

        const dbClient = new DynamoDBClient(dbClientConfig);
        this.client = DynamoDBDocumentClient.from(dbClient);

        if (this.isLocalMode) {
            this.ensureTableExists().catch((err) => {
                logger.error(`Failed to ensure DynamoDB local table exists: ${err}`);
            });
        }
    }

    /**
     * Ensures the table exists in DynamoDB Local with the appropriate GSI
     * This is only used in local development mode
     */
    private async ensureTableExists(): Promise<void> {
        if (!this.isLocalMode) {
            return;
        }

        try {
            // Import the necessary client for creating tables
            const { CreateTableCommand, ListTablesCommand } = await import('@aws-sdk/client-dynamodb');

            // Check if table already exists
            const listTablesResult = await this.client.send(
                new ListTablesCommand({})
            );

            if (listTablesResult.TableNames?.includes(this.tableName)) {
                logger.info(`DynamoDB local table '${this.tableName}' already exists`);
                return;
            }

            // Create the table with GSI for retrieving users by OAuth ID or email
            await this.client.send(
                new CreateTableCommand({
                    TableName: this.tableName,
                    KeySchema: [
                        { AttributeName: 'pk', KeyType: 'HASH' },
                        { AttributeName: 'sk', KeyType: 'RANGE' }
                    ],
                    AttributeDefinitions: [
                        { AttributeName: 'pk', AttributeType: 'S' },
                        { AttributeName: 'sk', AttributeType: 'S' },
                        { AttributeName: 'GSI_PK', AttributeType: 'S' }
                    ],
                    GlobalSecondaryIndexes: [
                        {
                            IndexName: 'GSI_PK_INDEX',
                            KeySchema: [
                                { AttributeName: 'GSI_PK', KeyType: 'HASH' }
                            ],
                            Projection: {
                                ProjectionType: 'ALL'
                            },
                            ProvisionedThroughput: {
                                ReadCapacityUnits: 5,
                                WriteCapacityUnits: 5
                            }
                        }
                    ],
                    BillingMode: 'PAY_PER_REQUEST'
                })
            );

            logger.info(`Created DynamoDB local table '${this.tableName}' with GSI`);
        } catch (error) {
            logger.error(`Error creating local DynamoDB table: ${error}`);
            throw error;
        }
    }

    /**
     * A utility method to wrap DB operations in a try-catch block
     */
    private async executeDbOperation<T>(operation: () => Promise<T>, errorMessage: string): Promise<T> {
        try {
            return await operation();
        } catch (error) {
            logger.error(`${errorMessage}: ${error}`);
            throw error;
        }
    }

    // Basic CRUD operations

    public async getItem(pk: string, sk: string) {
        return await this.executeDbOperation(async () => {
            const command = new GetCommand({
                TableName: this.tableName,
                Key: { pk, sk }
            });
            return await this.client.send(command);
        }, 'DynamoDB getItem error');
    }

    public async putItem(item: Record<string, any>) {
        return await this.executeDbOperation(async () => {
            const command = new PutCommand({
                TableName: this.tableName,
                Item: item
            });
            return await this.client.send(command);
        }, 'DynamoDB putItem error');
    }

    public async queryItems(pk: string, options: {
        beginsWith?: string;
        filters?: Record<string, any>;
    } = {}) {
        return await this.executeDbOperation(async () => {
            let keyConditionExpression = 'pk = :pk';
            const expressionAttributeValues: Record<string, any> = { ':pk': pk };

            // Add sort key condition if beginsWith is provided
            if (options.beginsWith) {
                keyConditionExpression += ' AND begins_with(sk, :skPrefix)';
                expressionAttributeValues[':skPrefix'] = options.beginsWith;
            }

            const command = new QueryCommand({
                TableName: this.tableName,
                KeyConditionExpression: keyConditionExpression,
                ExpressionAttributeValues: expressionAttributeValues
            });

            return await this.client.send(command);
        }, 'DynamoDB queryItems error');
    }

    public async updateItem(pk: string, sk: string, updateExpression: string, expressionAttributeValues: Record<string, any>) {
        return await this.executeDbOperation(async () => {
            const command = new UpdateCommand({
                TableName: this.tableName,
                Key: { pk, sk },
                UpdateExpression: updateExpression,
                ExpressionAttributeValues: expressionAttributeValues,
                ReturnValues: 'ALL_NEW'
            });

            return await this.client.send(command);
        }, 'DynamoDB updateItem error');
    }

    public async deleteItem(pk: string, sk: string) {
        return await this.executeDbOperation(async () => {
            const command = new DeleteCommand({
                TableName: this.tableName,
                Key: { pk, sk }
            });

            return await this.client.send(command);
        }, 'DynamoDB deleteItem error');
    }

    // User Profile Methods

    public async saveUserProfile(userData: IUserProfileDataEntity) {
        const item = {
            pk: `USER#${userData.id}`,
            sk: 'PROFILE',
            ...userData,
            usernameSetAt: userData.usernameSetAt || new Date().toISOString(),
            preferences: userData.preferences || { cardback: 'default' },
        };
        return await this.putItem(item);
    }

    public async getUserProfile(userId: string) {
        return await this.executeDbOperation(async () => {
            const result = await this.getItem(`USER#${userId}`, 'PROFILE');
            return result.Item as IUserProfileDataEntity | undefined;
        }, 'Error getting user profile');
    }

    public async updateUserProfile(userId: string, updates: Partial<IUserProfileDataEntity>) {
        return await this.executeDbOperation(async () => {
            // Build update expression and expression attribute values
            let updateExpression = 'SET';
            const expressionAttributeValues: Record<string, any> = {};

            for (const [key, value] of Object.entries(updates)) {
                if (key !== 'id') { // Don't update primary key
                    updateExpression += ` ${key} = :${key},`;
                    expressionAttributeValues[`:${key}`] = value;
                }
            }

            // Remove trailing comma
            updateExpression = updateExpression.slice(0, -1);

            return await this.updateItem(
                `USER#${userId}`,
                'PROFILE',
                updateExpression,
                expressionAttributeValues
            );
        }, 'Error updating user profile');
    }

    /**
     * Put an item with a condition expression
     */
    public async putItemWithCondition(item: Record<string, any>, conditionExpression: string) {
        return await this.executeDbOperation(async () => {
            const command = new PutCommand({
                TableName: this.tableName,
                Item: item,
                ConditionExpression: conditionExpression
            });
            return await this.client.send(command);
        }, 'DynamoDB putItemWithCondition error');
    }

    // OAuth Link Methods
    public async saveOAuthLink(provider: string, providerId: string, userId: string) {
        await this.putItemWithCondition(
            {
                pk: `OAUTH#${provider}_${providerId}`,
                sk: 'LINK',
                GSI_PK: userId,
            },
            'attribute_not_exists(pk)'
        );
    }

    public async getUserIdByOAuth(provider: string, providerId: string) {
        return await this.executeDbOperation(async () => {
            const result = await this.getItem(`OAUTH#${provider}_${providerId}`, 'LINK');
            return result.Item?.GSI_PK as string | undefined;
        }, 'Error getting user ID by OAuth');
    }

    // Email Link Methods

    public async saveEmailLink(email: string, userId: string) {
        return await this.executeDbOperation(async () => {
            const item = {
                pk: `EMAIL#${email.toLowerCase()}`,
                sk: 'LINK',
                GSI_PK: userId,
                email: email.toLowerCase()
            };

            return await this.putItem(item);
        }, 'Error saving email link');
    }

    public async getUserIdByEmail(email: string) {
        return await this.executeDbOperation(async () => {
            const result = await this.getItem(`EMAIL#${email.toLowerCase()}`, 'LINK');
            return result.Item?.GSI_PK as string | undefined;
        }, 'Error getting user ID by email');
    }

    // User Deck Methods
    public async saveDeck(deckData: IDeckDataEntity) {
        return await this.executeDbOperation(async () => {
            const item = {
                pk: `USER#${deckData.userId}`,
                sk: `DECK#${deckData.id}`,
                ...deckData,
                stats: deckData.stats || { wins: 0, losses: 0, draws: 0 }
            };

            return await this.putItem(item);
        }, 'Error saving deck');
    }

    public async getDeck(userId: string, deckId: string) {
        return await this.executeDbOperation(async () => {
            const result = await this.getItem(`USER#${userId}`, `DECK#${deckId}`);
            return result.Item as IDeckDataEntity | undefined;
        }, 'Error getting deck');
    }


    /**
     * Find a deck by its deckLink property
     * @param userId The user ID
     * @param deckLink The deck link to search for
     * @returns The deck data if found, undefined otherwise
     */
    public async getDeckByLink(userId: string, deckLink: string): Promise<IDeckDataEntity | undefined> {
        return await this.executeDbOperation(async () => {
            // Query all decks for this user
            const result = await this.queryItems(`USER#${userId}`, { beginsWith: 'DECK#' });

            if (!result.Items || result.Items.length === 0) {
                return undefined;
            }

            // Find the deck with matching deckLink
            return result.Items.find((item: any) =>
                item.deck && item.deck.deckLink === deckLink
            ) as IDeckDataEntity | undefined;
        }, 'Error finding deck by link');
    }

    public async getUserDecks(userId: string) {
        return await this.executeDbOperation(async () => {
            const result = await this.queryItems(`USER#${userId}`, { beginsWith: 'DECK#' });
            return result.Items as IDeckDataEntity[] | undefined;
        }, 'Error getting user decks');
    }

    public async recordNewLogin(userId: string) {
        return await this.executeDbOperation(async () => {
            return await this.updateItem(
                `USER#${userId}`,
                'PROFILE',
                'SET lastLogin = :lastLogin',
                { ':lastLogin': new Date().toISOString() }
            );
        }, 'Error recording new login');
    }

    /**
     * Update deck stats with specified values
     * @param userId User ID
     * @param deckId Deck ID
     * @param stats Stats object with updated values
     * @returns Updated deck record
     */
    public async updateDeckStats(userId: string, deckId: string, stats: IDeckStatsEntity) {
        return await this.executeDbOperation(async () => {
            return await this.updateItem(
                `USER#${userId}`,
                `DECK#${deckId}`,
                'SET stats = :stats',
                { ':stats': stats }
            );
        }, `Error updating deck stats for deck ${deckId}, user ${userId}`);
    }

    public async saveUserSettings(userId: string, settings: Record<string, any>) {
        return await this.executeDbOperation(async () => {
            return await this.updateItem(
                `USER#${userId}`,
                'PROFILE',
                'SET preferences = :preferences',
                { ':preferences': settings }
            );
        }, 'Error saving user settings');
    }

    // Clear all data (for testing purposes only)
    public async clearAllData() {
        if (!this.isLocalMode) {
            throw new Error('clearAllData can only be called in local mode');
        }

        return await this.executeDbOperation(async () => {
            // For local testing only - scan and delete all items
            const scanResult = await this.client.send(
                new ScanCommand({
                    TableName: this.tableName
                })
            );

            const deletePromises = scanResult.Items?.map((item) => {
                return this.client.send(
                    new DeleteCommand({
                        TableName: this.tableName,
                        Key: {
                            pk: item.pk,
                            sk: item.sk
                        }
                    })
                );
            }) || [];

            await Promise.all(deletePromises);
            logger.info(`Cleared all data from local DynamoDB table '${this.tableName}'`);
        }, 'Error clearing local DynamoDB data');
    }
}

export const dynamoDbService = new DynamoDBService();