import { getDynamoDbServiceAsync } from '../../services/DynamoDBService';
import type { IScheduler } from '../IScheduler';
import { TimedCache } from '../TimedCache';
import type { ICosmeticEntity } from './CosmeticsInterfaces';

/**
 * Cache for cosmetics data with automatic periodic refresh.
 */
export class CosmeticsCache {
    private readonly cache: TimedCache<ICosmeticEntity[]>;

    /**
     * @param scheduler Drives the periodic refresh; defaults to real timers
     */
    public constructor(refreshIntervalMinutes: number, scheduler?: IScheduler) {
        this.cache = new TimedCache<ICosmeticEntity[]>(
            refreshIntervalMinutes,
            async () => {
                const db = await getDynamoDbServiceAsync();
                return await db.getCosmeticsAsync();
            },
            'CosmeticsCache',
            scheduler
        );
    }

    /**
     * Initializes the cache by fetching data immediately.
     * Must be called before using getCosmetics().
     */
    public async initializeAsync(): Promise<void> {
        await this.cache.initializeAsync();
    }

    /**
     * Stops the periodic refresh. Reads keep answering from the last fetched cosmetics.
     */
    public stop(): void {
        this.cache.stop();
    }

    /**
     * Gets the cached cosmetics synchronously.
     * @returns Array of registered cosmetic options
     */
    public getCosmetics(): ICosmeticEntity[] {
        return this.cache.getValue();
    }

    /**
     * Forces an immediate refresh of the cache.
     * Should be called after any write operations.
     */
    public async forceRefreshAsync(): Promise<void> {
        await this.cache.forceRefreshAsync();
    }
}
