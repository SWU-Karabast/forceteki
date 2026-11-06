import { mergeUserPreferences } from '../utils/user/UserPreferences';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
    DeleteCommand,
    DynamoDBDocumentClient,
    GetCommand,
    PutCommand,
    QueryCommand,
    ScanCommand,
    UpdateCommand,
    BatchWriteCommand
} from '@aws-sdk/lib-dynamodb';
import { logger } from '../logger';
import { Contract } from '../game/core/utils/Contract';
import type {
    IModActionEntity,
    IUsernameChangeEntity
} from './DynamoDBInterfaces';
import {
    type IDeckDataEntity,
    type IDeckStatsEntity,
    type IUserProfileDataEntity,
    type IUserPreferences,
    type IServerRoleUsersListsEntity,
    type IServerSettingsEntity,
    isTrackedModAction
} from './DynamoDBInterfaces';
import { z } from 'zod';
import { IDeckDataEntitySchema, IDeckStatsEntitySchema, ModActionEntitySchema, UsernameChangeEntitySchema } from './DynamoDBInterfaceSchemas';
import { getDefaultPreferences } from '../utils/user/UserFactory';
import { type ICosmeticEntity, type RegisteredCosmeticType } from '../utils/cosmetics/CosmeticsInterfaces';

// global variable
let dynamoDbService: DynamoDBService;

/**
 * The key of an item: its table key (`pk`, `sk`) and, for item types in the `GSI_PK_INDEX`, the index key.
 * The save methods always compute these themselves and pass them to {@link DynamoDBService.putItemAsync}, which takes
 * none from the data it stores. (`batchWriteItemsAsync`, used only by one-off migration scripts, writes whole items
 * as it is given them.)
 */
export interface IItemKey {
    pk: string;
    sk: string;
    GSI_PK?: string;
}

const itemKeyAttributes: readonly (keyof IItemKey)[] = ['pk', 'sk', 'GSI_PK'];

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
            if (process.env.USE_LOCAL_DYNAMODB === 'true') {
                throw new Error('Local DynamoDB isn\'t initialized while USE_LOCAL_DYNAMODB env variable is set to true');
            }

            logger.error(`Failed to ensure DynamoDB local table exists: ${err}`);
            return null;
        }
    }

    return dynamoDbService;
}

export class DynamoDBService {
    private client: DynamoDBDocumentClient;
    private tableName: string;
    public isLocalMode: boolean;

    /**
     * @param client the document client every command is sent through; by default one is built from the environment
     */
    public constructor(client?: DynamoDBDocumentClient) {
        this.isLocalMode = process.env.ENVIRONMENT === 'development';
        this.tableName = 'KarabastGlobalTable';
        if (client) {
            this.client = client;
            return;
        }

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

    /**
     * @param options.consistentRead read the latest committed value rather than a possibly lagging replica; use it
     * where the result is cached or acted on straight after a write
     */
    public getItemAsync(pk: string, sk: string, options: { consistentRead?: boolean } = {}) {
        return this.executeDbOperationAsync(() => {
            const command = new GetCommand({
                TableName: this.tableName,
                Key: { pk, sk },
                ...(options.consistentRead ? { ConsistentRead: true } : {})
            });
            return this.client.send(command);
        }, 'DynamoDB getItem error');
    }

    /**
     * Writes one item: `key` is its key and `attributes` everything else stored on it. The key is only ever taken
     * from `key`, so attributes that name a key field are refused rather than written.
     * @param conditionExpression if given, the write only happens when this holds for the item already stored
     * @throws if `attributes` has a `pk`, `sk` or `GSI_PK` field
     */
    public putItemAsync(key: IItemKey, attributes: Record<string, unknown> = {}, conditionExpression?: string) {
        const keyField = itemKeyAttributes.find((name) => Object.prototype.hasOwnProperty.call(attributes, name));
        if (keyField !== undefined) {
            return Promise.reject(new Error(`Item attributes must not include the key field '${keyField}'`));
        }

        // the document client is not configured with removeUndefinedValues, so an unset index key is left out
        const item = { ...attributes, pk: key.pk, sk: key.sk, ...(key.GSI_PK !== undefined ? { GSI_PK: key.GSI_PK } : {}) };

        return this.executeDbOperationAsync(() => {
            const command = new PutCommand({
                TableName: this.tableName,
                Item: item,
                ...(conditionExpression ? { ConditionExpression: conditionExpression } : {})
            });
            return this.client.send(command);
        }, 'DynamoDB putItem error');
    }

    /**
     * Batch write multiple items to DynamoDB.
     * Handles chunking into batches of 25 (DynamoDB limit) and retries unprocessed items.
     */
    public batchWriteItemsAsync(items: Record<string, any>[]) {
        return this.executeDbOperationAsync(async () => {
            const chunks = [];
            for (let i = 0; i < items.length; i += 25) {
                chunks.push(items.slice(i, i + 25));
            }

            for (const chunk of chunks) {
                let unprocessed = chunk;

                while (unprocessed.length > 0) {
                    const result = await this.client.send(new BatchWriteCommand({
                        RequestItems: {
                            [this.tableName]: unprocessed.map((item) => ({
                                PutRequest: { Item: item }
                            }))
                        }
                    }));

                    const retryItems = result.UnprocessedItems?.[this.tableName];
                    if (retryItems && retryItems.length > 0) {
                        logger.info(`Retrying ${retryItems.length} unprocessed items...`);
                        unprocessed = retryItems.map((r: any) => r.PutRequest.Item);
                        // Back off before retry
                        await new Promise((resolve) => setTimeout(resolve, 500));
                    } else {
                        break;
                    }
                }
            }
        }, 'Error in batch write');
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

    public updateItemAsync(pk: string, sk: string, updateExpression: string, expressionAttributeValues: Record<string, any>, expressionAttributeNames?: Record<string, string>) {
        return this.executeDbOperationAsync(() => {
            const commandParams: any = {
                TableName: this.tableName,
                Key: { pk, sk },
                UpdateExpression: updateExpression,
                ExpressionAttributeValues: expressionAttributeValues,
                ReturnValues: 'ALL_NEW'
            };
            if (expressionAttributeNames) {
                commandParams.ExpressionAttributeNames = expressionAttributeNames;
            }
            const command = new UpdateCommand(commandParams);
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
        return this.putItemAsync(
            { pk: `USER#${userData.id}`, sk: 'PROFILE' },
            { ...userData, preferences: userData.preferences || getDefaultPreferences() }
        );
    }

    public getUserProfileAsync(userId: string) {
        return this.executeDbOperationAsync(async () => {
            // consistent, because the result is cached and a lagging read right after a write would stay cached
            const result = await this.getItemAsync(`USER#${userId}`, 'PROFILE', { consistentRead: true });
            return result.Item as IUserProfileDataEntity | undefined;
        }, 'Error getting user profile');
    }

    /**
     * Sets the given profile fields. `id` is skipped, as the profile's key already holds it. Field names go into the
     * update expression only as `#name` placeholders.
     * @throws if `updates` has a `pk`, `sk` or `GSI_PK` field
     */
    public updateUserProfileAsync(userId: string, updates: Partial<IUserProfileDataEntity>) {
        const keyField = itemKeyAttributes.find((name) => Object.prototype.hasOwnProperty.call(updates, name));
        if (keyField !== undefined) {
            return Promise.reject(new Error(`Profile updates must not include the key field '${keyField}'`));
        }

        return this.executeDbOperationAsync(() => {
            const assignments: string[] = [];
            const expressionAttributeNames: Record<string, string> = {};
            const expressionAttributeValues: Record<string, any> = {};

            for (const [key, value] of Object.entries(updates)) {
                if (key === 'id') {
                    continue;
                }

                const index = assignments.length;
                assignments.push(`#field${index} = :value${index}`);
                expressionAttributeNames[`#field${index}`] = key;
                expressionAttributeValues[`:value${index}`] = value;
            }

            return this.updateItemAsync(
                `USER#${userId}`,
                'PROFILE',
                `SET ${assignments.join(', ')}`,
                expressionAttributeValues,
                expressionAttributeNames
            );
        }, 'Error updating user profile');
    }

    public removeUserProfileAttributeAsync(userId: string, attributeName: keyof IUserProfileDataEntity) {
        return this.executeDbOperationAsync(() => {
            const command = new UpdateCommand({
                TableName: this.tableName,
                Key: { pk: `USER#${userId}`, sk: 'PROFILE' },
                UpdateExpression: 'REMOVE #attribute',
                ExpressionAttributeNames: { '#attribute': attributeName }
            });
            return this.client.send(command);
        }, 'Error removing user profile attribute');
    }

    // OAuth Link Methods
    public saveOAuthLinkAsync(provider: string, providerId: string, userId: string) {
        return this.putItemAsync(
            { pk: `OAUTH#${provider}_${providerId}`, sk: 'LINK', GSI_PK: userId },
            {},
            'attribute_not_exists(pk)'
        );
    }

    public getUserIdByOAuthAsync(provider: string, providerId: string) {
        return this.executeDbOperationAsync(async () => {
            const result = await this.getItemAsync(`OAUTH#${provider}_${providerId}`, 'LINK', { consistentRead: true });
            return result.Item?.GSI_PK as string | undefined;
        }, 'Error getting user ID by OAuth');
    }

    // Email Link Methods
    public saveEmailLinkAsync(email: string, userId: string) {
        return this.executeDbOperationAsync(() => {
            return this.putItemAsync(
                { pk: `EMAIL#${email.toLowerCase()}`, sk: 'LINK', GSI_PK: userId },
                { email: email.toLowerCase() }
            );
        }, 'Error saving email link');
    }

    public getUserIdByEmailAsync(email: string) {
        return this.executeDbOperationAsync(async () => {
            const result = await this.getItemAsync(`EMAIL#${email.toLowerCase()}`, 'LINK');
            return result.Item?.GSI_PK as string | undefined;
        }, 'Error getting user ID by email');
    }

    // User Deck Methods
    /** Saves a deck under its owner. Only the fields of a deck are stored: anything else on `deckData` is left out. */
    public saveDeckAsync(deckData: IDeckDataEntity) {
        return this.executeDbOperationAsync(async () => {
            const deck = await this.validateAndHandleAsync(
                IDeckDataEntitySchema,
                deckData,
                'Save deck'
            );

            return this.putItemAsync(
                { pk: `USER#${deck.userId}`, sk: `DECK#${deck.id}` },
                { ...deck, stats: deck.stats || { wins: 0, losses: 0, draws: 0 } }
            );
        }, 'Error saving deck');
    }

    /**
     * Whether a stored deck item sits under the key its own owner and id give it. {@link saveDeckAsync} only ever writes
     * a deck there, so the deck reads leave out any item that does not, rather than let its stored owner or id decide
     * where a later save of it goes.
     */
    private isStoredUnderOwnKey(item: Record<string, unknown>): boolean {
        const isOwnKey = item.pk === `USER#${item.userId}` && item.sk === `DECK#${item.id}`;
        if (!isOwnKey) {
            logger.error(`DynamoDBService: ignoring a deck item whose owner or id does not match its key (${item.pk} / ${item.sk})`);
        }
        return isOwnKey;
    }

    public getDeckAsync(userId: string, deckId: string) {
        return this.executeDbOperationAsync(async () => {
            const result = await this.getItemAsync(`USER#${userId}`, `DECK#${deckId}`);
            if (result.Item && !this.isStoredUnderOwnKey(result.Item)) {
                return undefined;
            }
            return this.validateAndHandleAsync<IDeckDataEntity>(
                IDeckDataEntitySchema,
                result.Item,
                `Get deck ${deckId}`,
                () => this.deleteItemAsync(`USER#${userId}`, `DECK#${deckId}`)
            );
        }, 'Error getting deck');
    }

    /**
     * Update deck name
     * @param userId User ID
     * @param deckId Deck ID
     * @param newName New name for the deck
     * @returns Updated deck record
     */
    public updateDeckNameAsync(userId: string, deckId: string, newName: string) {
        return this.executeDbOperationAsync(() => {
            return this.updateItemAsync(
                `USER#${userId}`,
                `DECK#${deckId}`,
                'SET #deckAttr.#nameAttr = :newName',
                { ':newName': newName },
                {
                    '#deckAttr': 'deck',
                    '#nameAttr': 'name'
                }
            );
        }, `Error updating deck name for deck ${deckId}, user ${userId}`);
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
                item.deck && item.deck.deckLinkID === deckLinkID && this.isStoredUnderOwnKey(item)
            );

            if (!foundDeck) {
                return undefined;
            }

            return this.validateAndHandleAsync<IDeckDataEntity>(
                IDeckDataEntitySchema,
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
                if (!this.isStoredUnderOwnKey(item)) {
                    continue;
                }

                try {
                    const validDeck = await this.validateAndHandleAsync<IDeckDataEntity>(
                        IDeckDataEntitySchema,
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
                IDeckStatsEntitySchema.parse(stats);
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

    /**
     * Read the stored preferences object for a user (or undefined if none exist yet).
     */
    private async getStoredPreferencesAsync(userId: string): Promise<Record<string, any> | undefined> {
        const result = await this.client.send(new GetCommand({
            TableName: this.tableName,
            Key: { pk: `USER#${userId}`, sk: 'PROFILE' }
        }));

        return result.Item?.preferences;
    }

    /**
     * Update user preferences, merging the given partial update into what's already stored.
     *
     * Uses a read-merge-replace strategy: load the stored preferences, layer the current defaults
     * underneath to backfill any keys added since the profile was last written, apply the incoming
     * update on top, then write the whole object back. This deliberately avoids per-field nested
     * update expressions, which fail when a parent map (e.g. gameOptions.autoResolve) doesn't yet
     * exist. As a result, adding a new preference only requires extending getDefaultPreferences().
     *
     * Note: this is a non-atomic read-modify-write. Concurrent updates for the same user resolve
     * last-write-wins, which is acceptable for single-user settings saved from the preferences UI.
     *
     * @param userId User ID
     * @param preferences Partial preferences to merge in
     */
    public updateUserPreferencesAsync(userId: string, preferences: Partial<IUserPreferences>): Promise<void> {
        return this.executeDbOperationAsync(async () => {
            const currentPrefs = await this.getStoredPreferencesAsync(userId);
            const merged = mergeUserPreferences(
                mergeUserPreferences(getDefaultPreferences(), currentPrefs ?? {}),
                preferences
            );

            await this.client.send(new UpdateCommand({
                TableName: this.tableName,
                Key: { pk: `USER#${userId}`, sk: 'PROFILE' },
                UpdateExpression: 'SET preferences = :preferences',
                ExpressionAttributeValues: { ':preferences': merged }
            }));
        }, 'Error updating user preferences');
    }

    // Registered Cosmetics Methods
    public getCosmeticsAsync(): Promise<ICosmeticEntity[]> {
        return this.executeDbOperationAsync(async () => {
            const result = await this.queryItemsAsync('COSMETICS', { beginsWith: 'ITEM#' });

            return (result.Items || []).map((item) => ({
                id: item.id as string,
                title: item.title as string,
                type: item.type as RegisteredCosmeticType,
                path: item.path as string,
            }));
        }, 'Error getting cosmetics data');
    }

    /**
     * Saves a cosmetic's id, title, type and path.
     * @param options.createOnly refuse to replace a cosmetic that already has this id: the write then fails with a
     * `ConditionalCheckFailedException`
     */
    public saveCosmeticAsync(cosmeticData: ICosmeticEntity, options: { createOnly?: boolean } = {}) {
        return this.executeDbOperationAsync(() => {
            const now = new Date().toISOString();
            return this.putItemAsync(
                { pk: 'COSMETICS', sk: `ITEM#${cosmeticData.id}` },
                {
                    id: cosmeticData.id,
                    title: cosmeticData.title,
                    type: cosmeticData.type,
                    path: cosmeticData.path,
                    createdAt: now,
                    updatedAt: now
                },
                options.createOnly ? 'attribute_not_exists(pk)' : undefined
            );
        }, 'Error saving cosmetic item');
    }

    public initializeCosmeticsAsync(cosmetics: ICosmeticEntity[]) {
        return this.executeDbOperationAsync(async () => {
            const savePromises = cosmetics.map((cosmetic) => this.saveCosmeticAsync(cosmetic));
            await Promise.all(savePromises);
            return { initializedCount: cosmetics.length };
        }, 'Error initializing cosmetics data');
    }

    public deleteCosmeticAsync(cosmeticId: string) {
        return this.executeDbOperationAsync(() => {
            return this.deleteItemAsync('COSMETICS', `ITEM#${cosmeticId}`);
        }, 'Error deleting cosmetic item');
    }

    public clearAllCosmeticsAsync() {
        Contract.assertTrue(this.isLocalMode, 'Cosmetic cleanup is only allowed in local mode');

        return this.executeDbOperationAsync(async () => {
            // Get all cosmetics first
            const cosmetics = await this.getCosmeticsAsync();

            // Delete each cosmetic
            const deletePromises = cosmetics.map((cosmetic) =>
                this.deleteCosmeticAsync(cosmetic.id)
            );

            await Promise.all(deletePromises);

            return { deletedCount: cosmetics.length };
        }, 'Error clearing all cosmetics');
    }

    // Admin user methods
    public getServerRoleUsersAsync(): Promise<IServerRoleUsersListsEntity> {
        return this.executeDbOperationAsync(async () => {
            const result = await this.getItemAsync('SERVER_ROLE_USERS', 'ROLES');
            if (!result.Item) {
                return {
                    admins: [],
                    developers: [],
                    moderators: [],
                    contributors: []
                };
            }

            return {
                admins: result.Item.admins || [],
                developers: result.Item.developers || [],
                moderators: result.Item.moderators || [],
                contributors: result.Item.contributors || []
            };
        }, 'Error getting admin users');
    }

    // Server settings methods
    public getServerSettingsAsync(): Promise<IServerSettingsEntity> {
        return this.executeDbOperationAsync(async () => {
            const result = await this.getItemAsync('SERVER_SETTINGS', 'GLOBAL');

            // A missing item means no moderator has ever set these, which is the state on the first
            // deploy of this feature. Default to enabled so that the rollout itself can't black out
            // the site - unlike a read failure, this is a known state rather than an unknown one.
            if (!result.Item) {
                return { gamesEnabled: true };
            }

            return {
                gamesEnabled: result.Item.gamesEnabled !== false,
                maintenanceMessage: result.Item.maintenanceMessage,
                updatedBy: result.Item.updatedBy,
                updatedAt: result.Item.updatedAt
            };
        }, 'Error getting server settings');
    }

    public saveServerSettingsAsync(settings: IServerSettingsEntity) {
        return this.executeDbOperationAsync(() => {
            const attributes: Record<string, unknown> = {
                gamesEnabled: settings.gamesEnabled
            };

            // The document client is not configured with removeUndefinedValues, so undefined
            // fields have to be omitted rather than written.
            for (const key of ['maintenanceMessage', 'updatedBy', 'updatedAt'] as const) {
                if (settings[key] !== undefined) {
                    attributes[key] = settings[key];
                }
            }

            return this.putItemAsync({ pk: 'SERVER_SETTINGS', sk: 'GLOBAL' }, attributes);
        }, 'Error saving server settings');
    }

    // Mod Actions
    /**
     * Query items using the GSI_PK_INDEX
     * @param gsiPkValue The value for the GSI_PK partition key
     */
    public queryByGSIAsync(gsiPkValue: string) {
        return this.executeDbOperationAsync(() => {
            const command = new QueryCommand({
                TableName: this.tableName,
                IndexName: 'GSI_PK_INDEX',
                KeyConditionExpression: 'GSI_PK = :gsiPk',
                ExpressionAttributeValues: { ':gsiPk': gsiPkValue }
            });

            return this.client.send(command);
        }, 'DynamoDB queryByGSI error');
    }

    /**
     * Get mod actions from DynamoDB.
     * - { playerId }  All mod actions for a specific player (main table query)
     */
    public getModActionsAsync(options: { userId?: string } = {}): Promise<IModActionEntity[]> {
        return this.executeDbOperationAsync(async () => {
            const result = options.userId
                ? await this.queryItemsAsync(`USER#${options.userId}`, { beginsWith: 'MODACTION#' })
                : await this.queryByGSIAsync('ACTIVE_MODACTION');

            if (!result.Items || result.Items.length === 0) {
                return [];
            }

            return Promise.all(
                result.Items.map((item: any) =>
                    this.validateAndHandleAsync<IModActionEntity>(
                        ModActionEntitySchema,
                        item,
                        `getModActionsAsync (action ${item.id})`,
                    )
                )
            ).then((actions) => actions.filter(Boolean));
        }, 'Error getting mod actions');
    }

    /**
     * Get the username change history for a player (main table query).
     */
    public getUsernameChangesAsync(userId: string): Promise<IUsernameChangeEntity[]> {
        return this.executeDbOperationAsync(async () => {
            const result = await this.queryItemsAsync(`USER#${userId}`, { beginsWith: 'NAMECHANGE#' });

            if (!result.Items || result.Items.length === 0) {
                return [];
            }

            return Promise.all(
                result.Items.map((item: any) =>
                    this.validateAndHandleAsync<IUsernameChangeEntity>(
                        UsernameChangeEntitySchema,
                        item,
                        `getUsernameChangesAsync (record ${item.id})`,
                    )
                )
            ).then((records) => records.filter(Boolean));
        }, 'Error getting username changes');
    }

    /**
     * Save a username change history record.
     */
    public saveUsernameChangeAsync(record: IUsernameChangeEntity) {
        return this.executeDbOperationAsync(() => {
            return this.putItemAsync({ pk: `USER#${record.playerId}`, sk: `NAMECHANGE#${record.id}` }, { ...record });
        }, 'Error saving username change');
    }

    /**
     * Save a new mod action item.
     * For Mute actions, GSI_PK is set to 'ACTIVE_MODACTION' so it appears in the sparse index.
     */
    public saveModActionAsync(modAction: IModActionEntity) {
        return this.executeDbOperationAsync(() => {
            const key: IItemKey = { pk: `USER#${modAction.playerId}`, sk: `MODACTION#${modAction.id}` };
            if (isTrackedModAction(modAction.actionType) && !modAction.cancelledAt) {
                key.GSI_PK = 'ACTIVE_MODACTION';
            }

            return this.putItemAsync(key, { ...modAction });
        }, 'Error saving mod action');
    }

    /**
     * Activate a pending mute: set startedAt and expiresAt.
     * Called when the muted user first logs in.
     */
    public activateMuteAsync(playerId: string, modActionId: string, startedAt: string, expiresAt: string) {
        return this.executeDbOperationAsync(() => {
            return this.updateItemAsync(
                `USER#${playerId}`,
                `MODACTION#${modActionId}`,
                'SET startedAt = :startedAt, expiresAt = :expiresAt',
                {
                    ':startedAt': startedAt,
                    ':expiresAt': expiresAt,
                }
            );
        }, 'Error activating mute');
    }

    /**
     * Cancel a mod action: set cancelledAt and cancelledBy, remove GSI_PK to drop it from the active index.
     */
    public cancelModActionAsync(playerId: string, modActionId: string, cancelledById: string, cancelledByUsername: string) {
        return this.executeDbOperationAsync(() => {
            const command = new UpdateCommand({
                TableName: this.tableName,
                Key: {
                    pk: `USER#${playerId}`,
                    sk: `MODACTION#${modActionId}`,
                },
                UpdateExpression: 'SET cancelledAt = :cancelledAt, cancelledById = :cancelledById, cancelledByUsername = :cancelledByUsername ' +
                  'REMOVE GSI_PK',
                ConditionExpression: 'attribute_exists(pk) AND attribute_not_exists(cancelledAt)',
                ExpressionAttributeValues: {
                    ':cancelledAt': new Date().toISOString(),
                    ':cancelledById': cancelledById,
                    ':cancelledByUsername': cancelledByUsername
                },
                ReturnValues: 'ALL_NEW'
            });

            return this.client.send(command);
        }, 'Error cancelling mod action');
    }

    /**
     * Remove GSI_PK from an expired mod action (cleanup only, doesn't set cancelledAt/cancelledBy).
     * This drops the item from the ACTIVE_MODACTION sparse index.
     */
    public removeModActionFromActiveIndexAsync(playerId: string, modActionId: string) {
        return this.executeDbOperationAsync(() => {
            const command = new UpdateCommand({
                TableName: this.tableName,
                Key: {
                    pk: `USER#${playerId}`,
                    sk: `MODACTION#${modActionId}`,
                },
                UpdateExpression: 'REMOVE GSI_PK',
                ReturnValues: 'ALL_NEW'
            });

            return this.client.send(command);
        }, 'Error removing mod action from active index');
    }

    // Username
    /**
     * Save a username -> userId link for mod tools username search.
     * Uses lowercase username to ensure case-insensitive lookups.
     */
    public saveUsernameLinkAsync(username: string, userId: string) {
        return this.executeDbOperationAsync(() => {
            return this.putItemAsync({ pk: `USERNAME#${username.toLowerCase()}`, sk: `USER#${userId}`, GSI_PK: userId });
        }, 'Error saving username link');
    }

    /**
     * Look up all userIds that share a given username.
     * @returns Array of userIds
     */
    public getUserIdsByUsernameAsync(username: string): Promise<string[]> {
        return this.executeDbOperationAsync(async () => {
            const result = await this.queryItemsAsync(`USERNAME#${username.toLowerCase()}`);
            return (result.Items || []).map((item: any) => item.GSI_PK as string);
        }, 'Error getting user IDs by username');
    }

    /**
     * Delete a specific username link for a user.
     * Uses both username and userId
     */
    public deleteUsernameLinkAsync(username: string, userId: string) {
        return this.executeDbOperationAsync(() => {
            return this.deleteItemAsync(`USERNAME#${username.toLowerCase()}`, `USER#${userId}`);
        }, 'Error deleting username link');
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

    /**
     * Get all user profiles via table scan.
     * Note: Use sparingly scans are expensive on large tables.
     */
    public getAllUserProfilesAsync(): Promise<IUserProfileDataEntity[]> {
        return this.executeDbOperationAsync(async () => {
            const profiles: IUserProfileDataEntity[] = [];
            let lastEvaluatedKey: Record<string, any> | undefined;

            do {
                const result = await this.client.send(new ScanCommand({
                    TableName: this.tableName,
                    FilterExpression: 'sk = :sk',
                    ExpressionAttributeValues: { ':sk': 'PROFILE' },
                    ExclusiveStartKey: lastEvaluatedKey,
                }));

                for (const item of result.Items || []) {
                    profiles.push(item as IUserProfileDataEntity);
                }

                lastEvaluatedKey = result.LastEvaluatedKey;
            } while (lastEvaluatedKey);

            return profiles;
        }, 'Error scanning all user profiles');
    }
}