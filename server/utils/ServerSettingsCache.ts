import { TimedCache } from './TimedCache';
import { getDynamoDbServiceAsync } from '../services/DynamoDBService';
import type { IServerSettingsEntity } from '../services/DynamoDBInterfaces';

/**
 * Used when no settings have been stored yet, or when the database is unavailable. Games are
 * enabled by default so that neither a first-time rollout nor a local dev box without DynamoDB
 * ends up stuck in maintenance mode.
 */
const defaultSettings: IServerSettingsEntity = { gamesEnabled: true };

/**
 * Cache for the global server settings item, providing synchronous reads during request handling.
 *
 * Refreshes from DynamoDB on a periodic interval, and is written through on every moderator change
 * so that a toggle takes effect immediately rather than at the next refresh. With a single game
 * node the write-through is what makes a change global; the periodic refresh exists to pick up
 * out-of-band edits and to stay correct if the service is ever scaled past one task.
 */
export class ServerSettingsCache {
    private readonly cache: TimedCache<IServerSettingsEntity>;

    public static async createAsync(refreshIntervalMinutes: number): Promise<ServerSettingsCache> {
        const cache = new TimedCache<IServerSettingsEntity>(
            refreshIntervalMinutes,
            async () => {
                const db = await getDynamoDbServiceAsync();
                if (!db) {
                    return defaultSettings;
                }
                return await db.getServerSettingsAsync();
            },
            'ServerSettingsCache'
        );

        await cache.initializeAsync();

        return new ServerSettingsCache(cache);
    }

    private constructor(cache: TimedCache<IServerSettingsEntity>) {
        this.cache = cache;
    }

    public getSettings(): IServerSettingsEntity {
        return this.cache.getValue() ?? defaultSettings;
    }

    /**
     * Whether new games may currently be created, joined or requeued.
     */
    public isGamesEnabled(): boolean {
        return this.getSettings().gamesEnabled;
    }

    public getMaintenanceMessage(): string | undefined {
        return this.getSettings().maintenanceMessage;
    }

    /**
     * Persists a settings change and refreshes the cached value, so the moderator making the change
     * sees it applied immediately instead of waiting out the refresh interval.
     * @param updates Fields to change; omitted fields keep their current value
     * @param modUsername Username of the moderator making the change, recorded for auditing
     * @returns The settings as they now stand
     */
    public async updateSettingsAsync(
        updates: Partial<Pick<IServerSettingsEntity, 'gamesEnabled' | 'maintenanceMessage'>>,
        modUsername: string
    ): Promise<IServerSettingsEntity> {
        const db = await getDynamoDbServiceAsync();
        if (!db) {
            throw new Error('Cannot update server settings, no database connection is available');
        }

        const current = this.getSettings();
        await db.saveServerSettingsAsync({
            gamesEnabled: updates.gamesEnabled ?? current.gamesEnabled,
            maintenanceMessage: updates.maintenanceMessage ?? current.maintenanceMessage,
            updatedBy: modUsername,
            updatedAt: new Date().toISOString()
        });

        await this.cache.forceRefreshAsync();

        return this.getSettings();
    }
}
