import { DynamoDBClient, ListTablesCommand, CreateTableCommand } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, GetCommand } from '@aws-sdk/lib-dynamodb';

/**
 * A simple script to test connection to DynamoDB Local and perform basic operations
 */
async function testDynamoDBLocal() {
    // Initialize the DynamoDB client
    const client = new DynamoDBClient({
        region: 'us-east-1',
        endpoint: 'http://localhost:8000',
        credentials: {
            accessKeyId: 'dummy',
            secretAccessKey: 'dummy'
        }
    });

    // Create a document client for easier item operations
    const docClient = DynamoDBDocumentClient.from(client);

    try {
        console.log('Testing connection to DynamoDB Local...');

        // List tables
        const listResponse = await client.send(new ListTablesCommand({}));
        console.log('Connection successful!');
        console.log('Existing tables:', listResponse.TableNames || []);

        // Create a test table if it doesn't exist
        const tableName = 'TestTable';
        if (!listResponse.TableNames?.includes(tableName)) {
            console.log(`Creating table: ${tableName}...`);

            const createTableResponse = await client.send(
                new CreateTableCommand({
                    TableName: tableName,
                    KeySchema: [
                        { AttributeName: 'pk', KeyType: 'HASH' },
                        { AttributeName: 'sk', KeyType: 'RANGE' }
                    ],
                    AttributeDefinitions: [
                        { AttributeName: 'pk', AttributeType: 'S' },
                        { AttributeName: 'sk', AttributeType: 'S' }
                    ],
                    ProvisionedThroughput: {
                        ReadCapacityUnits: 5,
                        WriteCapacityUnits: 5
                    }
                })
            );

            console.log(`Table created with status: ${createTableResponse.TableDescription?.TableStatus}`);
        } else {
            console.log(`Table ${tableName} already exists`);
        }

        // Add a test item
        const testItem = {
            pk: 'USER#1',
            sk: 'METADATA',
            username: 'testuser',
            email: 'test@example.com',
            createdAt: new Date().toISOString()
        };

        console.log('Adding test item:', testItem);

        await docClient.send(
            new PutCommand({
                TableName: tableName,
                Item: testItem
            })
        );

        console.log('Item added successfully!');

        // Retrieve the item
        const getResponse = await docClient.send(
            new GetCommand({
                TableName: tableName,
                Key: {
                    pk: 'USER#1',
                    sk: 'METADATA'
                }
            })
        );

        console.log('Retrieved item:', getResponse.Item);

        console.log('\nAll tests completed successfully!');
    } catch (error) {
        console.error('Error testing DynamoDB Local:', error);
    }
}

// Run the test function
testDynamoDBLocal().catch(console.error);