import { TimedCache } from '../TimedCache';
import { getDynamoDbServiceAsync } from '../../services/DynamoDBService';
import type { IFeatureFlagEntity, ServerRole } from '../../services/DynamoDBInterfaces';
import type { IScheduler } from '../IScheduler';
import { RealScheduler } from '../RealScheduler';
import type { ServerRoleUsersCache } from '../ServerRoleUsersCache';
import { checkServerRoleUserPrivileges } from '../authUtils';
import type { User } from '../user/User';
import { FeatureFlag, featureFlagDefinitions, isFeatureFlag } from './FeatureFlags';

/** A flag's stored state merged with its definition, as the admin panel shows it. */
export interface IFeatureFlagState extends IFeatureFlagEntity {
    flag: FeatureFlag;
    description: string;
    defaultEnabled: boolean;
    exposeToClient: boolean;
}

export type FeatureFlagUpdate = Partial<Pick<IFeatureFlagEntity, 'enabled' | 'roles' | 'userIds'>>;

/**
 * Cache of every feature flag's stored state, giving synchronous answers to "is this flag on for this
 * user" during request handling.
 *
 * Refreshes from DynamoDB on a periodic interval and is written through on every admin change, like
 * `ServerSettingsCache`, so a change takes effect immediately on this node.
 */
export class FeatureFlagsCache {
    private readonly cache: TimedCache<Map<FeatureFlag, IFeatureFlagEntity>>;

    /**
     * @param serverRoleUsersCache Answers the role half of a flag's audience
     * @param scheduler Drives the periodic refresh and supplies the clock for `updatedAt`; defaults to
     * real timers and the system clock
     */
    public static async createAsync(
        refreshIntervalMinutes: number,
        serverRoleUsersCache: ServerRoleUsersCache | undefined,
        scheduler: IScheduler = new RealScheduler()
    ): Promise<FeatureFlagsCache> {
        const cache = new TimedCache<Map<FeatureFlag, IFeatureFlagEntity>>(
            refreshIntervalMinutes,
            async () => {
                const db = await getDynamoDbServiceAsync();
                const stored = db ? await db.getFeatureFlagsAsync() : [];

                // items for flags no longer defined in code are dropped here, so nothing downstream sees them
                const flags = new Map<FeatureFlag, IFeatureFlagEntity>();
                for (const item of stored) {
                    const flag = item.flag;
                    if (isFeatureFlag(flag)) {
                        flags.set(flag, item);
                    }
                }
                return flags;
            },
            'FeatureFlagsCache',
            scheduler
        );

        await cache.initializeAsync();

        return new FeatureFlagsCache(cache, serverRoleUsersCache, scheduler);
    }

    private constructor(
        cache: TimedCache<Map<FeatureFlag, IFeatureFlagEntity>>,
        private readonly serverRoleUsersCache: ServerRoleUsersCache | undefined,
        private readonly scheduler: IScheduler
    ) {
        this.cache = cache;
    }

    /**
     * Stops the periodic refresh. Reads keep answering from the last fetched flags.
     */
    public stop(): void {
        this.cache.stop();
    }

    /**
     * Whether the flag is on for this user: it is enabled, which means on for everyone, or the user is
     * signed in and is on its user list or passes the role check for one of its roles.
     */
    public isEnabledFor(flag: FeatureFlag, user: User): boolean {
        const state = this.getStoredState(flag);
        if (state.enabled) {
            return true;
        }

        // an anonymous id is minted by the browser, so it can't be trusted to name a particular person
        if (!user.isAuthenticatedUser()) {
            return false;
        }

        const userId = user.getId();
        return state.userIds.includes(userId) ||
          state.roles.some((role) => this.passesRoleCheck(userId, role));
    }

    /**
     * Every defined flag, with its stored state or its default if nobody has set it yet.
     */
    public getAllStates(): IFeatureFlagState[] {
        return Object.values(FeatureFlag).map((flag) => this.getState(flag));
    }

    public getState(flag: FeatureFlag): IFeatureFlagState {
        return { ...this.getStoredState(flag), flag, ...featureFlagDefinitions[flag] };
    }

    /**
     * Persists a change to one flag and refreshes the cached value, so the admin making the change sees
     * it applied immediately instead of waiting out the refresh interval.
     * @param updates Fields to change; omitted fields keep their current value
     * @param adminUsername Username of the admin making the change, recorded for auditing
     * @returns The flag as it now stands
     */
    public async updateFlagAsync(flag: FeatureFlag, updates: FeatureFlagUpdate, adminUsername: string): Promise<IFeatureFlagState> {
        const db = await getDynamoDbServiceAsync();
        if (!db) {
            throw new Error('Cannot update feature flags, no database connection is available');
        }

        const current = this.getStoredState(flag);
        await db.saveFeatureFlagAsync({
            flag,
            enabled: updates.enabled ?? current.enabled,
            roles: [...new Set(updates.roles ?? current.roles)],
            userIds: [...new Set(updates.userIds ?? current.userIds)],
            updatedBy: adminUsername,
            updatedAt: this.scheduler.currentDate().toISOString()
        });

        await this.cache.forceRefreshAsync();

        return this.getState(flag);
    }

    /**
     * The flag's stored state. A flag nobody has set yet has no audience and is enabled as its
     * definition's `defaultEnabled` says, so it is on for everyone or for no one.
     */
    private getStoredState(flag: FeatureFlag): IFeatureFlagEntity {
        const stored = this.cache.getValue()?.get(flag);
        if (stored) {
            return stored;
        }

        const defaultEnabled = featureFlagDefinitions[flag].defaultEnabled;
        return { flag, enabled: defaultEnabled, roles: [], userIds: [] };
    }

    private passesRoleCheck(userId: string, role: ServerRole): boolean {
        return checkServerRoleUserPrivileges('feature-flags', userId, role, this.serverRoleUsersCache).success;
    }
}
