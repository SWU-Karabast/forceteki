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
}