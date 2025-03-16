import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
    DynamoDBDocumentClient,
    PutCommand,
    GetCommand,
    QueryCommand,
    UpdateCommand,
    DeleteCommand
} from '@aws-sdk/lib-dynamodb';
import { logger } from '../logger';

// Define user interface
export interface IUserData {
    id: string;
    username: string;
    email?: string;
    provider: string;
    avatarUrl?: string;
    lastLogin: string;
    createdAt: string;
    settings?: Record<string, any>;
}

export class DynamoDBService {
    private client: DynamoDBDocumentClient;
    private tableName: string;
    private isLocalMode: boolean;

    public constructor(localMode?: boolean) {
        this.isLocalMode = localMode || process.env.ENVIRONMENT === 'development';
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
     * Ensures the table exists in DynamoDB Local
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

            // Create the table with the same schema as in production
            await this.client.send(
                new CreateTableCommand({
                    TableName: this.tableName,
                    KeySchema: [
                        { AttributeName: 'pk', KeyType: 'HASH' },
                        { AttributeName: 'sk', KeyType: 'RANGE' }
                    ],
                    AttributeDefinitions: [
                        { AttributeName: 'pk', AttributeType: 'S' },
                        { AttributeName: 'sk', AttributeType: 'S' }
                    ],
                    BillingMode: 'PAY_PER_REQUEST'
                })
            );

            logger.info(`Created DynamoDB local table '${this.tableName}'`);
        } catch (error) {
            logger.error(`Error creating local DynamoDB table: ${error}`);
            throw error;
        }
    }

    /**
     * A utility method to wrap DB operations in a try-catch block
     * @param operation - The operation to perform
     * @param errorMessage - The error message to log
     * @returns The result of the operation
     */
    private async executeDbOperation<T>(operation: () => Promise<T>, errorMessage: string): Promise<T> {
        try {
            return await operation();
        } catch (error) {
            logger.error(`${errorMessage}: ${error}`);
            throw error;
        }
    }

    // Get an item by its primary key
    public async getItem(pk: string, sk: string) {
        return await this.executeDbOperation(async () => {
            const command = new GetCommand({
                TableName: this.tableName,
                Key: { pk, sk }
            });
            return await this.client.send(command);
        }, 'DynamoDB getItem error');
    }

    // Put an item
    public async putItem(item: Record<string, any>) {
        return await this.executeDbOperation(async () => {
            const command = new PutCommand({
                TableName: this.tableName,
                Item: item
            });
            return await this.client.send(command);
        }, 'DynamoDB putItem error');
    }

    // Query items with the same partition key
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

    // Update an item
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

    // Delete an item
    public async deleteItem(pk: string, sk: string) {
        return await this.executeDbOperation(async () => {
            const command = new DeleteCommand({
                TableName: this.tableName,
                Key: { pk, sk }
            });

            return await this.client.send(command);
        }, 'DynamoDB deleteItem error');
    }

    // Clear all data (for testing purposes only)
    public async clearAllData() {
        if (!this.isLocalMode) {
            throw new Error('clearAllData can only be called in local mode');
        }

        return await this.executeDbOperation(async () => {
            // For local testing only - scan and delete all items
            const { ScanCommand } = await import('@aws-sdk/lib-dynamodb');

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

    // User-specific methods

    // Save or update user
    public async saveUser(userData: IUserData) {
        return await this.executeDbOperation(async () => {
            const item = {
                pk: `USER#${userData.id}`,
                sk: 'METADATA',
                ...userData,
                lastLogin: userData.lastLogin || new Date().toISOString()
            };

            return await this.putItem(item);
        }, 'Error saving user to DynamoDB');
    }

    // Get user by ID
    public async getUserById(userId: string) {
        return await this.executeDbOperation(async () => {
            const result = await this.getItem(`USER#${userId}`, 'METADATA');
            return result.Item as IUserData | undefined;
        }, 'Error getting user from DynamoDB');
    }

    // Update user's last login time
    public async recordNewLogin(userId: string) {
        return await this.executeDbOperation(async () => {
            return await this.updateItem(
                `USER#${userId}`,
                'METADATA',
                'SET lastLogin = :lastLogin',
                { ':lastLogin': new Date().toISOString() }
            );
        }, 'Error updating user login time');
    }

    // Save user settings
    public async saveUserSettings(userId: string, settings: Record<string, any>) {
        return await this.executeDbOperation(async () => {
            return await this.updateItem(
                `USER#${userId}`,
                'METADATA',
                'SET settings = :settings',
                { ':settings': settings }
            );
        }, 'Error saving user settings');
    }
}