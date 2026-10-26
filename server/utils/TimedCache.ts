import { logger } from '../logger';
import type { IScheduledTask, IScheduler } from './IScheduler';
import { RealScheduler } from './RealScheduler';

/**
 * A generic cache that periodically refreshes its value using a timer.
 * The cache fetches data immediately on construction and then refreshes
 * at the specified interval. On refresh errors, it keeps serving stale data.
 */
export class TimedCache<T> {
    private value?: T;
    private refreshTask?: IScheduledTask;
    private readonly refreshIntervalMinutes: number;
    private readonly fetchFunction: () => Promise<T>;
    private readonly cacheName: string;
    private readonly scheduler: IScheduler;

    /**
     * Creates a new TimedCache instance.
     * @param refreshIntervalMinutes - How often to refresh the cached value, in minutes
     * @param fetchFunction - Async function that fetches the value to cache
     * @param cacheName - Name for logging purposes
     * @param scheduler - Drives the periodic refresh; defaults to real timers
     */
    public constructor(
        refreshIntervalMinutes: number,
        fetchFunction: () => Promise<T>,
        cacheName: string,
        scheduler: IScheduler = new RealScheduler()
    ) {
        this.refreshIntervalMinutes = refreshIntervalMinutes;
        this.fetchFunction = fetchFunction;
        this.cacheName = cacheName;
        this.scheduler = scheduler;
    }

    /**
     * Initializes the cache by fetching data immediately.
     * Must be called before using getValue().
     */
    public async initializeAsync(): Promise<void> {
        logger.info(`${this.cacheName}: Initializing cache...`);

        this.value = await this.fetchFunction();

        // Set up periodic refresh
        const intervalMs = this.refreshIntervalMinutes * 60 * 1000;
        this.refreshTask?.cancel();
        this.refreshTask = this.scheduler.setInterval(async () => {
            try {
                logger.info(`${this.cacheName}: Refreshing cached value...`);
                this.value = await this.fetchFunction();
                logger.info(`${this.cacheName}: Successfully refreshed cache`);
            } catch (error) {
                logger.error(`${this.cacheName}: Failed to refresh cache, keeping stale data`, error);
            }
        }, intervalMs, { message: `${this.cacheName}: error during scheduled refresh` });

        logger.info(`${this.cacheName}: Cache initialized, will refresh every ${this.refreshIntervalMinutes} minutes`);
    }

    /**
     * Stops the periodic refresh. The last fetched value stays readable.
     */
    public stop(): void {
        this.refreshTask?.cancel();
        this.refreshTask = undefined;
    }

    /**
     * Gets the cached value synchronously.
     * @returns The cached value
     */
    public getValue(): T {
        return this.value;
    }

    /**
     * Forces an immediate refresh of the cached value.
     * Does not reset the periodic timer.
     */
    public async forceRefreshAsync(): Promise<void> {
        try {
            logger.info(`${this.cacheName}: Force refreshing cached value...`);
            this.value = await this.fetchFunction();
            logger.info(`${this.cacheName}: Successfully force refreshed cache`);
        } catch (error) {
            logger.error(`${this.cacheName}: Failed to force refresh cache, keeping stale data`, error);
            throw error;
        }
    }
}
