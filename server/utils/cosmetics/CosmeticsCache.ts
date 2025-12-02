import { getDynamoDbServiceAsync } from '../../services/DynamoDBService';
import { TimedCache } from '../TimedCache';
import type { IRegisteredCosmeticOption } from './CosmeticsInterfaces';

/**
 * Cache for cosmetics data with automatic periodic refresh.
 */
export class CosmeticsCache {
    private readonly cache: TimedCache<IRegisteredCosmeticOption[]>;

    public constructor(refreshIntervalMinutes: number) {
        this.cache = new TimedCache<IRegisteredCosmeticOption[]>(
            refreshIntervalMinutes,
            async () => {
                const db = await getDynamoDbServiceAsync();
                return await db.getCosmeticsAsync();
            },
            'CosmeticsCache'
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
     * Gets the cached cosmetics synchronously.
     * @returns Array of registered cosmetic options
     */
    public getCosmetics(): IRegisteredCosmeticOption[] {
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
