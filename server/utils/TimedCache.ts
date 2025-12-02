import { logger } from '../logger';

/**
 * A generic cache that periodically refreshes its value using a timer.
 * The cache fetches data immediately on construction and then refreshes
 * at the specified interval. On refresh errors, it keeps serving stale data.
 */
export class TimedCache<T> {
    private value?: T;
    private refreshTimer?: NodeJS.Timeout;
    private readonly refreshIntervalMinutes: number;
    private readonly fetchFunction: () => Promise<T>;
    private readonly cacheName: string;

    /**
     * Creates a new TimedCache instance.
     * @param refreshIntervalMinutes - How often to refresh the cached value, in minutes
     * @param fetchFunction - Async function that fetches the value to cache
     * @param cacheName - Name for logging purposes
     */
    public constructor(
        refreshIntervalMinutes: number,
        fetchFunction: () => Promise<T>,
        cacheName: string
    ) {
        this.refreshIntervalMinutes = refreshIntervalMinutes;
        this.fetchFunction = fetchFunction;
        this.cacheName = cacheName;
    }

    /**
     * Initializes the cache by fetching data immediately.
     * Must be called before using getValue().
     */
    public async initializeAsync(): Promise<void> {
        logger.info(`${this.cacheName}: Initializing cache...`);
        await this.refreshValue();

        // Set up periodic refresh
        const intervalMs = this.refreshIntervalMinutes * 60 * 1000;
        this.refreshTimer = setInterval(() => {
            this.refreshValue().catch((error) => {
                logger.error(`${this.cacheName}: Unhandled error in refresh timer`, error);
            });
        }, intervalMs);

        logger.info(`${this.cacheName}: Cache initialized, will refresh every ${this.refreshIntervalMinutes} minutes`);
    }

    /**
     * Gets the cached value synchronously.
     * @returns The cached value, or undefined if not yet initialized
     */
    public getValue(): T | undefined {
        return this.value;
    }

    /**
     * Refreshes the cached value by calling the fetch function.
     * On error, keeps the stale value and logs the error.
     */
    private async refreshValue(): Promise<void> {
        try {
            logger.info(`${this.cacheName}: Refreshing cached value...`);
            const newValue = await this.fetchFunction();
            this.value = newValue;
            logger.info(`${this.cacheName}: Successfully refreshed cache`);
        } catch (error) {
            logger.error(`${this.cacheName}: Failed to refresh cache, keeping stale data`, error);
        }
    }
}
