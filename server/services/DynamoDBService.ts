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
import * as Contract from '../game/core/utils/Contract';
import type { IDeckDataEntity, IDeckStatsEntity, IUserProfileDataEntity } from './DynamoDBInterfaces';
import { z } from 'zod';
import { iDeckDataEntitySchema, iDeckStatsEntitySchema } from './DynamoDBInterfaceSchemas';

// global variable
let dynamoDbService: DynamoDBService;

/**
 * Get a properly initialized DynamoDB service
 * This ensures the service is only created once and properly initialized
 */
export async function getDynamoDbServiceAsync() {
    if (dynamoDbService) {
        return dynamoDbService;
    }

    if (process.env.ENVIRONMENT === 'development' && process.env.USE_LOCAL_DYNAMODB !== 'true') {
        return null;
    }

    // Create a new instance
    dynamoDbService = new DynamoDBService();

    // Initialize it (this will ensure local tables exist if in local mode)
    if (dynamoDbService.isLocalMode) {
        try {
            await dynamoDbService.ensureLocalTableExistsAsync();
        } catch (err) {
            logger.error(`Failed to ensure DynamoDB local table exists: ${err}`);
            return null;
        }
    }

    return dynamoDbService;
}

class DynamoDBService {
    private client: DynamoDBDocumentClient;
    private tableName: string;
    public isLocalMode: boolean;

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
            Contract.assertNotNullLike(process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY,
                'AWS_ACCESS_KEY_ID or AWS_SECRET_ACCESS_KEY are undefined');
            dbClientConfig.credentials = {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
            };
        }

        const dbClient = new DynamoDBClient(dbClientConfig);
        this.client = DynamoDBDocumentClient.from(dbClient);
    }

    private async validateAndHandleAsync<T>(
        schema: z.ZodType<T>,
        data: unknown,
        context: string,
        deleteCorruptedData?: () => Promise<any>
    ): Promise<T> {
        if (!data) {
            return undefined;
        }
        const result = schema.safeParse(data);

        if (result.success) {
            return result.data;
        }

        // Handle validation failure
        logger.error(`Validation error in ${context}: attempting to delete corrupted data`, result.error.format());

        // If a deletion function is provided, execute it
        if (deleteCorruptedData) {
            try {
                await deleteCorruptedData();
                logger.info(`Successfully deleted corrupted data in ${context}`);
            } catch (deleteError) {
                logger.error(`Failed to delete corrupted data in ${context}:`, deleteError);
            }
        }

        throw new Error(`Data validation failed in ${context}: ${result.error.message}`);
    }

    /**
     * Ensures the table exists in DynamoDB Local with the appropriate GSI
     * This is only used in local development mode
     */
    public async ensureLocalTableExistsAsync(): Promise<void> {
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
            if (error.code === 'ECONNREFUSED') {
                logger.warn('unable to form a connection to the local dynamodb container. A gentle reminder that the docker container for the DynamoDB might not be turned on');
            } else {
                logger.error('Error creating local DynamoDB table:', { error: { message: error.message, stack: error.stack } });
            }
            throw error;
        }
    }

    /**
     * A utility method to wrap DB operations in a try-catch block
     */
    private async executeDbOperationAsync<T>(operation: () => Promise<T>, errorMessage: string): Promise<T> {
        try {
            return await operation();
        } catch (error) {
            logger.error('An error occurred executing Db operation', { error: { message: error.message, stack: error.stack } });
            throw error;
        }
    }

    // Basic CRUD operations

    public getItemAsync(pk: string, sk: string) {
        return this.executeDbOperationAsync(() => {
            const command = new GetCommand({
                TableName: this.tableName,
                Key: { pk, sk }
            });
            return this.client.send(command);
        }, 'DynamoDB getItem error');
    }

    public putItemAsync(item: Record<string, any>) {
        return this.executeDbOperationAsync(() => {
            const command = new PutCommand({
                TableName: this.tableName,
                Item: item
            });
            return this.client.send(command);
        }, 'DynamoDB putItem error');
    }

    public queryItemsAsync(pk: string, options: {
        beginsWith?: string;
        filters?: Record<string, any>;
    } = {}) {
        return this.executeDbOperationAsync(() => {
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

            return this.client.send(command);
        }, 'DynamoDB queryItems error');
    }

    public updateItemAsync(pk: string, sk: string, updateExpression: string, expressionAttributeValues: Record<string, any>) {
        return this.executeDbOperationAsync(() => {
            const command = new UpdateCommand({
                TableName: this.tableName,
                Key: { pk, sk },
                UpdateExpression: updateExpression,
                ExpressionAttributeValues: expressionAttributeValues,
                ReturnValues: 'ALL_NEW'
            });

            return this.client.send(command);
        }, 'DynamoDB updateItem error');
    }

    public deleteItemAsync(pk: string, sk: string) {
        return this.executeDbOperationAsync(() => {
            const command = new DeleteCommand({
                TableName: this.tableName,
                Key: { pk, sk }
            });

            return this.client.send(command);
        }, 'DynamoDB deleteItem error');
    }

    // User Profile Methods

    public saveUserProfileAsync(userData: IUserProfileDataEntity) {
        const item = {
            pk: `USER#${userData.id}`,
            sk: 'PROFILE',
            ...userData,
            preferences: userData.preferences || { cardback: null },
        };
        return this.putItemAsync(item);
    }

    public getUserProfileAsync(userId: string) {
        return this.executeDbOperationAsync(async () => {
            const result = await this.getItemAsync(`USER#${userId}`, 'PROFILE');
            return result.Item as IUserProfileDataEntity | undefined;
        }, 'Error getting user profile');
    }

    public updateUserProfileAsync(userId: string, updates: Partial<IUserProfileDataEntity>) {
        return this.executeDbOperationAsync(() => {
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

            return this.updateItemAsync(
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
    public putItemWithConditionAsync(item: Record<string, any>, conditionExpression: string) {
        return this.executeDbOperationAsync(() => {
            const command = new PutCommand({
                TableName: this.tableName,
                Item: item,
                ConditionExpression: conditionExpression
            });
            return this.client.send(command);
        }, 'DynamoDB putItemWithCondition error');
    }

    // OAuth Link Methods
    public saveOAuthLinkAsync(provider: string, providerId: string, userId: string) {
        return this.putItemWithConditionAsync(
            {
                pk: `OAUTH#${provider}_${providerId}`,
                sk: 'LINK',
                GSI_PK: userId,
            },
            'attribute_not_exists(pk)'
        );
    }

    public getUserIdByOAuthAsync(provider: string, providerId: string) {
        return this.executeDbOperationAsync(async () => {
            const result = await this.getItemAsync(`OAUTH#${provider}_${providerId}`, 'LINK');
            return result.Item?.GSI_PK as string | undefined;
        }, 'Error getting user ID by OAuth');
    }

    // Email Link Methods
    public saveEmailLinkAsync(email: string, userId: string) {
        return this.executeDbOperationAsync(() => {
            const item = {
                pk: `EMAIL#${email.toLowerCase()}`,
                sk: 'LINK',
                GSI_PK: userId,
                email: email.toLowerCase()
            };

            return this.putItemAsync(item);
        }, 'Error saving email link');
    }

    public getUserIdByEmailAsync(email: string) {
        return this.executeDbOperationAsync(async () => {
            const result = await this.getItemAsync(`EMAIL#${email.toLowerCase()}`, 'LINK');
            return result.Item?.GSI_PK as string | undefined;
        }, 'Error getting user ID by email');
    }

    // User Deck Methods
    public saveDeckAsync(deckData: IDeckDataEntity) {
        return this.executeDbOperationAsync(async () => {
            await this.validateAndHandleAsync(
                iDeckDataEntitySchema,
                deckData,
                'Save deck'
            );
            const item = {
                pk: `USER#${deckData.userId}`,
                sk: `DECK#${deckData.id}`,
                ...deckData,
                stats: deckData.stats || { wins: 0, losses: 0, draws: 0 }
            };

            return this.putItemAsync(item);
        }, 'Error saving deck');
    }

    public getDeckAsync(userId: string, deckId: string) {
        return this.executeDbOperationAsync(async () => {
            const result = await this.getItemAsync(`USER#${userId}`, `DECK#${deckId}`);
            return this.validateAndHandleAsync<IDeckDataEntity>(
                iDeckDataEntitySchema,
                result.Item,
                `Get deck ${deckId}`,
                () => this.deleteItemAsync(`USER#${userId}`, `DECK#${deckId}`)
            );
        }, 'Error getting deck');
    }


    /**
     * Find a deck by its deckLink property
     * @param userId The user ID
     * @param deckLinkID the deckLinkID of a deck from swu stats or swudb
     * @returns The deck data if found, undefined otherwise
     */
    public getDeckByLinkAsync(userId: string, deckLinkID: string): Promise<IDeckDataEntity | undefined> {
        return this.executeDbOperationAsync(async () => {
            // Query all decks for this user
            const result = await this.queryItemsAsync(`USER#${userId}`, { beginsWith: 'DECK#' });

            if (!result.Items || result.Items.length === 0) {
                return undefined;
            }

            // Find the deck with matching deckLink
            const foundDeck = result.Items.find((item: any) =>
                item.deck && item.deck.deckLinkID === deckLinkID
            );

            if (!foundDeck) {
                return undefined;
            }

            return this.validateAndHandleAsync<IDeckDataEntity>(
                iDeckDataEntitySchema,
                foundDeck,
                `Get deck by link ${deckLinkID}`,
                () => this.deleteItemAsync(foundDeck.pk, foundDeck.sk)
            );
        }, 'Error finding deck by link');
    }

    public getUserDecksAsync(userId: string) {
        return this.executeDbOperationAsync(async () => {
            const result = await this.queryItemsAsync(`USER#${userId}`, { beginsWith: 'DECK#' });
            if (!result.Items || result.Items.length === 0) {
                return [];
            }

            // Loop through each deck and validate
            const validDecks: IDeckDataEntity[] = [];

            for (const item of result.Items) {
                try {
                    const validDeck = await this.validateAndHandleAsync<IDeckDataEntity>(
                        iDeckDataEntitySchema,
                        item,
                        `Validate deck ${item.id} in getUserDecks`,
                        () => this.deleteItemAsync(item.pk, item.sk)
                    );
                    validDecks.push(validDeck);
                } catch (error) {
                    logger.error('DynamoDBService: Error in getUserDecks ', error);
                    continue; // @Veld Is this something we want to do here? Basically continue the operation if it fails?
                }
            }

            return validDecks;
        }, 'Error getting user decks');
    }

    public recordNewLoginAsync(userId: string) {
        return this.executeDbOperationAsync(() => {
            return this.updateItemAsync(
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
    public updateDeckStatsAsync(userId: string, deckId: string, stats: IDeckStatsEntity) {
        return this.executeDbOperationAsync(() => {
            try {
                iDeckStatsEntitySchema.parse(stats);
                return this.updateItemAsync(
                    `USER#${userId}`,
                    `DECK#${deckId}`,
                    'SET stats = :stats',
                    { ':stats': stats }
                );
            } catch (error) {
                if (error instanceof z.ZodError) {
                    logger.error(`Invalid deck stats data for deck ${deckId}:`, error.format());
                    throw new Error(`Cannot update deck stats with invalid data: ${error.message}`);
                }
                throw error;
            }
        }, `Error updating deck stats for deck ${deckId}, user ${userId}`);
    }

    public saveUserSettingsAsync(userId: string, settings: Record<string, any>) {
        return this.executeDbOperationAsync(() => {
            return this.updateItemAsync(
                `USER#${userId}`,
                'PROFILE',
                'SET preferences = :preferences',
                { ':preferences': settings }
            );
        }, 'Error saving user settings');
    }

    // Clear all data (for testing purposes only)
    public clearAllDataAsync() {
        if (!this.isLocalMode) {
            throw new Error('clearAllData can only be called in local mode');
        }

        return this.executeDbOperationAsync(async () => {
            // For local testing only - scan and delete all items
            const scanResult = await this.client.send(
                new ScanCommand({
                    TableName: this.tableName
                })
            );

            const deletePromises = scanResult.Items?.map((item) =>
                this.client.send(
                    new DeleteCommand({
                        TableName: this.tableName,
                        Key: {
                            pk: item.pk,
                            sk: item.sk
                        }
                    })
                )
            ) || [];

            await Promise.all(deletePromises);
            logger.info(`Cleared all data from local DynamoDB table '${this.tableName}'`);
        }, 'Error clearing local DynamoDB data');
    }
}