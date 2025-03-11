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
export interface UserData {
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
    private tableName = 'KarabastGlobalTable';

    public constructor() {
        // Configure the DynamoDB client
        const dbClient = new DynamoDBClient({
            region: process.env.AWS_REGION || 'us-east-1',
            credentials: {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
            }
        });

        this.client = DynamoDBDocumentClient.from(dbClient);
    }

    // Get an item by its primary key
    public async getItem(pk: string, sk: string) {
        try {
            const command = new GetCommand({
                TableName: this.tableName,
                Key: { pk, sk }
            });

            return await this.client.send(command);
        } catch (error) {
            logger.error(`DynamoDB getItem error: ${error}`);
            throw error;
        }
    }

    // Put an item
    public async putItem(item: Record<string, any>) {
        try {
            const command = new PutCommand({
                TableName: this.tableName,
                Item: item
            });

            return await this.client.send(command);
        } catch (error) {
            logger.error(`DynamoDB putItem error: ${error}`);
            throw error;
        }
    }

    // Query items with the same partition key
    public async queryItems(pk: string, options: {
        beginsWith?: string;
        filters?: Record<string, any>;
    } = {}) {
        try {
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
        } catch (error) {
            logger.error(`DynamoDB queryItems error: ${error}`);
            throw error;
        }
    }

    // Update an item
    public async updateItem(pk: string, sk: string, updateExpression: string, expressionAttributeValues: Record<string, any>) {
        try {
            const command = new UpdateCommand({
                TableName: this.tableName,
                Key: { pk, sk },
                UpdateExpression: updateExpression,
                ExpressionAttributeValues: expressionAttributeValues,
                ReturnValues: 'ALL_NEW'
            });

            return await this.client.send(command);
        } catch (error) {
            logger.error(`DynamoDB updateItem error: ${error}`);
            throw error;
        }
    }

    // Delete an item
    public async deleteItem(pk: string, sk: string) {
        try {
            const command = new DeleteCommand({
                TableName: this.tableName,
                Key: { pk, sk }
            });

            return await this.client.send(command);
        } catch (error) {
            logger.error(`DynamoDB deleteItem error: ${error}`);
            throw error;
        }
    }

    // User-specific methods

    // Save or update user
    public async saveUser(userData: UserData) {
        try {
            const item = {
                pk: `USER#${userData.id}`,
                sk: 'METADATA',
                ...userData,
                lastLogin: new Date().toISOString()
            };

            return await this.putItem(item);
        } catch (error) {
            logger.error(`Error saving user to DynamoDB: ${error}`);
            throw error;
        }
    }

    // Get user by ID
    public async getUserById(userId: string) {
        try {
            const result = await this.getItem(`USER#${userId}`, 'METADATA');
            return result.Item as UserData | undefined;
        } catch (error) {
            logger.error(`Error getting user from DynamoDB: ${error}`);
            throw error;
        }
    }

    // Update user's last login time
    public async updateUserLogin(userId: string) {
        try {
            return await this.updateItem(
                `USER#${userId}`,
                'METADATA',
                'SET lastLogin = :lastLogin',
                { ':lastLogin': new Date().toISOString() }
            );
        } catch (error) {
            logger.error(`Error updating user login time: ${error}`);
            throw error;
        }
    }

    // Save user settings
    public async saveUserSettings(userId: string, settings: Record<string, any>) {
        try {
            return await this.updateItem(
                `USER#${userId}`,
                'METADATA',
                'SET settings = :settings',
                { ':settings': settings }
            );
        } catch (error) {
            logger.error(`Error saving user settings: ${error}`);
            throw error;
        }
    }
}