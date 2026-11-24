import { TimedCache } from './TimedCache';
import { getDynamoDbServiceAsync } from '../services/DynamoDBService';
import { ServerRole } from '../services/DynamoDBInterfaces';
import type { IServerRoleUsersListsEntity } from '../services/DynamoDBInterfaces';
import type { IScheduler } from './IScheduler';
import { RealScheduler } from './RealScheduler';

/**
 * A role change asked for by someone this cache still lists as an admin, but who is no longer one in the stored lists
 * (their admin role was removed by hand since the last refresh).
 */
export class NotStoredAdminError extends Error {
    public constructor(message = 'Admin privileges required') {
        super(message);
        this.name = 'NotStoredAdminError';
    }
}

/**
 * Cache for server role users that provides synchronous role checking.
 * Refreshes data from DynamoDB on a periodic interval, and is written through when an admin changes a role, so the
 * change applies at once rather than at the next refresh.
 */
export class ServerRoleUsersCache {
    private readonly cache: TimedCache<IServerRoleUsersListsEntity>;
    private readonly scheduler: IScheduler;

    /**
     * @param scheduler Drives the periodic refresh and supplies the clock for `updatedAt`; defaults to real timers and
     * the system clock
     */
    public static async createAsync(refreshIntervalMinutes: number, scheduler: IScheduler = new RealScheduler()): Promise<ServerRoleUsersCache> {
        const cache = new TimedCache<IServerRoleUsersListsEntity>(
            refreshIntervalMinutes,
            async () => {
                const db = await getDynamoDbServiceAsync();
                // consistent, because it also runs straight after a change, when a lagging read would bring the old lists back
                return await db.getServerRoleUsersAsync({ consistentRead: true });
            },
            'ServerRoleUsersCache',
            scheduler
        );

        await cache.initializeAsync();

        const instance = new ServerRoleUsersCache(cache, scheduler);

        return instance;
    }

    private constructor(cache: TimedCache<IServerRoleUsersListsEntity>, scheduler: IScheduler) {
        this.cache = cache;
        this.scheduler = scheduler;
    }

    /**
     * The role lists as stored now, read from the database rather than this cache, so they include a change made by
     * hand since the last refresh.
     */
    public async getStoredRoleUsersAsync(): Promise<IServerRoleUsersListsEntity> {
        const db = await getDynamoDbServiceAsync();
        return await db.getServerRoleUsersAsync({ consistentRead: true });
    }

    /**
     * Grants a role to a user or takes it away, and refreshes the cache so the change applies at once (or at the next
     * refresh, if that read fails). The change is made to the lists as stored now, not to this cache's copy, so it keeps
     * any edit made since the last refresh.
     * @param note stored beside a newly granted user, to say who they are to whoever reads the lists
     * @param changedById id of the admin making the change; checked against the stored lists, and recorded on them
     * @returns the lists as they now stand, and whether this changed them (false if the user already had the role, or
     * already did not)
     * @throws a {@link NotStoredAdminError} if `changedById` is not an admin in the stored lists, in which case the cache
     * is refreshed so they lose their admin access at once
     * @throws a `ConditionalCheckFailedException` if the lists changed between being read and written
     */
    public async setUserRoleAsync(userId: string, role: ServerRole, granted: boolean, note: string, changedById: string): Promise<{ lists: IServerRoleUsersListsEntity; changed: boolean }> {
        const db = await getDynamoDbServiceAsync();
        const stored = await db.getServerRoleUsersAsync({ consistentRead: true });

        // the auth check used this cache, which can lag a hand edit by up to a refresh interval
        if (!stored[ServerRole.Admin].some((admin) => admin.id === changedById)) {
            await this.cache.forceRefreshAsync();
            throw new NotStoredAdminError();
        }

        const holders = stored[role];
        if (holders.some((holder) => holder.id === userId) === granted) {
            return { lists: stored, changed: false };
        }

        const updated = {
            ...stored,
            [role]: granted ? [...holders, { id: userId, note }] : holders.filter((holder) => holder.id !== userId),
            updatedAt: this.scheduler.currentDate().toISOString(),
            updatedById: changedById
        };
        await db.saveServerRoleUsersAsync(updated, role, stored.updatedAt);

        // the change is stored, so a failed reload must not hide it from the caller; the cache catches up at its next
        // refresh, and has logged the failure
        try {
            await this.cache.forceRefreshAsync();
        } catch {
            // already logged by the cache
        }

        return { lists: updated, changed: true };
    }

    /**
     * Stops the periodic refresh. Role checks keep answering from the last fetched lists.
     */
    public stop(): void {
        this.cache.stop();
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
        return data[ServerRole.Admin].some((adminUser) => adminUser.id === userId);
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
        return data[ServerRole.Developer].some((devUser) => devUser.id === userId);
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
        return data[ServerRole.Moderator].some((modUser) => modUser.id === userId);
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
        return data[ServerRole.Contributor].some((conUser) => conUser.id === userId);
    }
}
