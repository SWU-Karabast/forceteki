// Copies all objects from the production S3 bucket (karabast-customization)
// to the local S3Mock bucket. Only runs in development when USE_LOCAL_DYNAMODB=true.

// to run this script use ts-node scripts/syncS3.ts
import { getDynamoDbServiceAsync } from '../server/services/DynamoDBService';
import { type IRegisteredCosmeticOption } from '../server/utils/cosmetics/CosmeticsInterfaces';
import {
    S3Client,
    ListObjectsV2Command,
    GetObjectCommand,
    PutObjectCommand,
    CreateBucketCommand
} from '@aws-sdk/client-s3';
import type { Readable } from 'stream';
import '../server/env';

const BUCKET_NAME = 'karabast-customization';
const { AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY } = process.env;

if (!AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY) {
    throw new Error(
        'Missing AWS credentials. Set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY to sync S3.'
    );
}


const prodS3 = new S3Client({
    region: 'us-east-1',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});

const localS3 = new S3Client({
    region: 'us-east-1',
    endpoint: 'http://localhost:9090',
    forcePathStyle: true,
    credentials: {
        accessKeyId: 'accessKey1',
        secretAccessKey: 'verySecretKey1'
    }
});


/**
 * Seeds the local DynamoDB with fallback cosmetics data.
 * Only runs when ENVIRONMENT=development and USE_LOCAL_DYNAMODB=true
 */
async function seedCosmetics(): Promise<void> {
    const service = await getDynamoDbServiceAsync();
    const cosmeticsData = await import('../server/data/initialize-cosmetics-local.json');
    //  cosmeticsData = await import('../server/data/initialize-cosmetics.json'); For PROD
    if (!service) {
        throw new Error('DynamoDB service not available (are you in dev & DynamoDB Local running?)');
    }

    // Cast the JSON data to the correct type
    const cosmetics = cosmeticsData.default as IRegisteredCosmeticOption[];

    console.log(`Starting to seed ${cosmetics.length} cosmetic items...`);

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


// Helper: convert stream to Buffer
function streamToBuffer(stream: Readable): Promise<Buffer> {
    const chunks: Buffer[] = [];
    return new Promise((resolve, reject) => {
        stream.on('data', (chunk) => {
            chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
        });
        stream.on('end', () => resolve(Buffer.concat(chunks)));
        stream.on('error', reject);
    });
}

// Ensure bucket exists on local S3 (S3Mock will usually auto-create, but this is safe)
async function ensureLocalBucketExists() {
    try {
        await localS3.send(
            new CreateBucketCommand({
                Bucket: BUCKET_NAME
            })
        );
        console.log(`Created local bucket: ${BUCKET_NAME}`);
    } catch (err: any) {
        // If it already exists, ignore the error
        if (err?.$metadata?.httpStatusCode === 409) {
            console.log(`Local bucket ${BUCKET_NAME} already exists`);
        } else {
            console.log('CreateBucket error (usually safe to ignore if it exists):', err?.message || err);
        }
    }
}

async function copyAllObjects() {
    if (process.env.ENVIRONMENT !== 'development' || process.env.USE_LOCAL_DYNAMODB !== 'true') {
        console.log('This script only runs in local development mode. Required variables:\nENVIRONMENT=development\nUSE_LOCAL_DYNAMODB=true');
        throw new Error('Must be in a development environment and USE_LOCAL_DYNAMODB environment needs to be set to true');
    }

    await ensureLocalBucketExists();
    let continuationToken: string | undefined = undefined;
    let totalCopied = 0;

    do {
        const listResult = await prodS3.send(
            new ListObjectsV2Command({
                Bucket: BUCKET_NAME,
                ContinuationToken: continuationToken
            })
        );

        const contents = listResult.Contents || [];
        console.log(`Found ${contents.length} objects in this page`);

        for (const obj of contents) {
            if (!obj.Key) {
                continue;
            }

            console.log(`Copying: ${obj.Key}`);

            const getRes = await prodS3.send(
                new GetObjectCommand({
                    Bucket: BUCKET_NAME,
                    Key: obj.Key
                })
            );

            const bodyStream = getRes.Body as Readable;
            const buffer = await streamToBuffer(bodyStream);

            await localS3.send(
                new PutObjectCommand({
                    Bucket: BUCKET_NAME,
                    Key: obj.Key,
                    Body: buffer,
                    ContentType: getRes.ContentType // might be undefined, but that's fine
                })
            );

            totalCopied++;
        }

        continuationToken = listResult.IsTruncated ? listResult.NextContinuationToken : undefined;
    } while (continuationToken);

    console.log(`Done. Copied ${totalCopied} objects to local S3.`);
    await seedCosmetics();
}

copyAllObjects().catch((err) => {
    console.error('Fatal error while copying S3 objects:', err);
    process.exit(1);
});


