import inspector from 'inspector';
import * as env from '../env';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

/**
 * Generate a timestamp string suitable for filenames
 * @returns ISO timestamp with colons and periods replaced by hyphens
 */
function ts() {
    return new Date().toISOString()
        .replace(/[:.]/g, '-');
}

export class RuntimeProfiler {
    private static instance: RuntimeProfiler | null = null;
    private session: inspector.Session;
    private cpuActive = false;
    private samplingActive = false;

    /**
     * Private constructor for singleton pattern
     * Initialize the RuntimeProfiler with an inspector session
     * The session is connected internally without exposing any TCP ports
     */
    private constructor() {
        this.session = new inspector.Session();
        this.session.connect(); // internal, no TCP port exposure
    }

    /**
     * Get the singleton instance of RuntimeProfiler
     * @returns The singleton RuntimeProfiler instance
     */
    public static getInstance(): RuntimeProfiler {
        if (!RuntimeProfiler.instance) {
            RuntimeProfiler.instance = new RuntimeProfiler();
        }
        return RuntimeProfiler.instance;
    }

    /**
     * Start CPU profiling
     * Enables the V8 profiler and begins collecting CPU profile data
     * @returns Promise that resolves to true if profiling was started, false if already active
     */
    public async startCPU(): Promise<boolean> {
        if (this.cpuActive) {
            return false;
        }
        // Set flag immediately to prevent race conditions
        this.cpuActive = true;
        try {
            await this.post('Profiler.enable');
            await this.post('Profiler.start');
            return true;
        } catch (error) {
            // Reset flag if start failed
            this.cpuActive = false;
            throw error;
        }
    }

    /**
     * Stop CPU profiling and return the profile data as a buffer
     * @param label - Label to use in the generated filename (default: 'cpu')
     * @returns Object containing the profile buffer and filename, or null if profiling was not active
     */
    public async stopCPUAsBuffer(label = 'cpu'): Promise<{ buffer: Buffer; filename: string } | null> {
        if (!this.cpuActive) {
            return null;
        }
        const { profile } = await this.post('Profiler.stop') as { profile: any };
        this.cpuActive = false;
        await this.post('Profiler.disable');
        const filename = `${label}.${ts()}.cpuprofile`;
        const buffer = Buffer.from(JSON.stringify(profile), 'utf-8');
        return { buffer, filename };
    }

    /**
     * Start heap allocation sampling
     * Enables the V8 heap profiler and begins collecting allocation data
     * @param samplingIntervalBytes - Sampling interval in bytes (default: 64KB). Smaller values provide more detail but higher overhead
     * @returns Promise that resolves to true if sampling was started, false if already active
     */
    public async startAllocSampling(samplingIntervalBytes = 1024 * 64 /* 64KB */): Promise<boolean> {
        if (this.samplingActive) {
            return false;
        }
        // Set flag immediately to prevent race conditions
        this.samplingActive = true;
        try {
            await this.post('HeapProfiler.enable');
            await this.post('HeapProfiler.startSampling', {
                samplingInterval: samplingIntervalBytes, // smaller = more detail, more overhead
                stackDepth: 64
            });
            return true;
        } catch (error) {
            // Reset flag if start failed
            this.samplingActive = false;
            throw error;
        }
    }

    /**
     * Stop heap allocation sampling and return the profile data as a buffer
     * @param label - Label to use in the generated filename (default: 'alloc-sampling')
     * @returns Object containing the profile buffer and filename, or null if sampling was not active
     */
    public async stopAllocSamplingAsBuffer(label = 'alloc-sampling'): Promise<{ buffer: Buffer; filename: string } | null> {
        if (!this.samplingActive) {
            return null;
        }
        const { profile } = await this.post('HeapProfiler.stopSampling') as { profile: any };
        this.samplingActive = false;
        await this.post('HeapProfiler.disable');
        const filename = `${label}.${ts()}.heapprofile`;
        const buffer = Buffer.from(JSON.stringify(profile), 'utf-8');
        return { buffer, filename };
    }

    /**
     * Send a command to the inspector session
     * @param method - The inspector protocol method to invoke
     * @param params - Parameters to pass to the method (default: empty object)
     * @returns Promise that resolves with the result of the inspector command
     */
    private post(method: string, params: Record<string, unknown> = {}) {
        return new Promise<unknown>((resolve, reject) => {
            this.session.post(method, params, (err, result) => (err ? reject(err) : resolve(result)));
        });
    }

    /**
     * Upload a profile buffer to S3
     * Creates an S3 client on-demand, uploads the file, and properly cleans up resources.
     * @param buffer - The profile data as a Buffer
     * @param filename - The filename for the profile
     * @param devMode - Whether the server is running in development mode
     * @returns The S3 key where the file was uploaded
     * @throws Error if AWS credentials or PROFILE_S3_BUCKET are not configured
     */
    public async uploadProfileToS3(buffer: Buffer, filename: string, devMode: boolean): Promise<string> {
        // Validate input parameters
        if (!buffer) {
            throw new Error('Buffer is required for S3 upload');
        }
        if (!filename || filename.trim() === '') {
            throw new Error('Filename is required for S3 upload');
        }
        if (buffer.length === 0) {
            throw new Error('Buffer is empty, cannot upload to S3');
        }

        // Validate required environment variables
        if (!env.AWS_REGION || !env.AWS_ACCESS_KEY_ID || !env.AWS_SECRET_ACCESS_KEY || !env.PROFILE_CAPTURE_S3_BUCKET) {
            throw new Error('S3 upload requires AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, and PROFILE_CAPTURE_S3_BUCKET env vars.');
        }

        let s3Client: S3Client | null = null;

        try {
            // Create S3 client on-demand
            s3Client = new S3Client({
                region: env.AWS_REGION,
                credentials: {
                    accessKeyId: env.AWS_ACCESS_KEY_ID,
                    secretAccessKey: env.AWS_SECRET_ACCESS_KEY
                }
            });

            // Organize profiles by environment and date
            const environment = devMode ? 'dev' : 'prod';
            const datePrefix = new Date().toISOString()
                .split('T')[0]; // YYYY-MM-DD
            const key = `${environment}/${datePrefix}/${filename}`;

            // Validate file extension - both .cpuprofile and .heapprofile are JSON format
            if (!filename.endsWith('.cpuprofile') && !filename.endsWith('.heapprofile')) {
                throw new Error(`Invalid profile file extension. Expected .cpuprofile or .heapprofile, got: ${filename}`);
            }
            const contentType = 'application/json';

            const command = new PutObjectCommand({
                Bucket: env.PROFILE_CAPTURE_S3_BUCKET,
                Key: key,
                Body: buffer,
                ContentType: contentType,
                ServerSideEncryption: 'AES256'
            });

            await s3Client.send(command);

            return key;
        } catch (error) {
            throw new Error(`Failed to upload profile to S3: ${error instanceof Error ? error.message : String(error)}`);
        } finally {
            // Clean up S3 client resources if it was created
            if (s3Client) {
                s3Client.destroy();
            }
        }
    }
}
