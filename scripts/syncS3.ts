// copyS3ToLocal.ts

// to run this script use ts-node scripts/syncS3.ts
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

const prodS3 = new S3Client({
    region: 'us-east-1',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? ''
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
        return;
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
}

copyAllObjects().catch((err) => {
    console.error('Fatal error while copying S3 objects:', err);
    process.exit(1);
});
