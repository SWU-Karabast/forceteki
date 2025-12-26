import { TimedCache } from './TimedCache';
import { getDynamoDbServiceAsync } from '../services/DynamoDBService';
import type { IServerRoleUsersListsEntity } from '../services/DynamoDBInterfaces';

/**
 * Cache for server role users that provides synchronous role checking.
 * Refreshes data from DynamoDB on a periodic interval.
 */
export class ServerRoleUsersCache {
    private readonly cache: TimedCache<IServerRoleUsersListsEntity>;

    public static async createAsync(refreshIntervalMinutes: number): Promise<ServerRoleUsersCache> {
        const cache = new TimedCache<IServerRoleUsersListsEntity>(
            refreshIntervalMinutes,
            async () => {
                const db = await getDynamoDbServiceAsync();
                return await db.getServerRoleUsersAsync();
            },
            'ServerRoleUsersCache'
        );

        await cache.initializeAsync();

        const instance = new ServerRoleUsersCache(cache);

        return instance;
    }

    private constructor(cache: TimedCache<IServerRoleUsersListsEntity>) {
        this.cache = cache;
    }

    /**
     * Initializes the cache by fetching data from the database.
     * Must be called before using any check methods.
     */
    public async initializeAsync(): Promise<void> {
        await this.cache.initializeAsync();
    }

    /**
     * Checks if a user is an admin.
     * @param userId - The user ID to check
     * @returns true if the user is an admin, false otherwise
     */
    public isAdmin(userId: string): boolean {
        const data = this.cache.getValue();
        if (!data) {
            return false;
        }
        return data.admins.some((adminUser) => adminUser.id === userId);
    }

    /**
     * Checks if a user is a developer.
     * @param userId - The user ID to check
     * @returns true if the user is a developer, false otherwise
     */
    public isDeveloper(userId: string): boolean {
        const data = this.cache.getValue();
        if (!data) {
            return false;
        }
        return data.developers.some((devUser) => devUser.id === userId);
    }

    /**
     * Checks if a user is a moderator.
     * @param userId - The user ID to check
     * @returns true if the user is a moderator, false otherwise
     */
    public isModerator(userId: string): boolean {
        const data = this.cache.getValue();
        if (!data) {
            return false;
        }
        return data.moderators.some((modUser) => modUser.id === userId);
    }

    /**
     * Checks if a user is a contributor.
     * @param userId - The user ID to check
     * @returns true if the user is a contributor, false otherwise
     */
    public isContributor(userId: string): boolean {
        const data = this.cache.getValue();
        if (!data) {
            return false;
        }
        return data.contributors.some((conUser) => conUser.id === userId);
    }
}
