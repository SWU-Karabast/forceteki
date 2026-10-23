import type { IUserProfileDataEntity } from '../../services/DynamoDBInterfaces';

export const defaultMaxCachedProfiles = 3000;
export const defaultMaxCachedIdentities = 6000;
export const defaultProfileTtlMs = 4 * 60 * 60 * 1000;

export interface IUserProfileCacheOptions {
    maxProfiles?: number;
    maxIdentities?: number;
    profileTtlMs?: number;

    /** Wall-clock source in milliseconds; injectable so specs can expire entries without waiting. */
    now?: () => number;
}

export interface IUserProfileCacheStats {
    profileHits: number;
    profileMisses: number;
    profileEvictions: number;
    identityHits: number;
    identityMisses: number;
    identityEvictions: number;
    profileCount: number;
    identityCount: number;
}

interface IProfileEntry {
    profile: IUserProfileDataEntity;
    expiresAt: number;
}

/**
 * A Map that evicts its least recently used entry once it is over capacity. Map iteration follows
 * insertion order, so re-inserting on read keeps the oldest-used key first.
 */
class LruMap<K, V> {
    private readonly entries = new Map<K, V>();

    public constructor(private readonly capacity: number, private readonly onEvict: () => void) {}

    public get size(): number {
        return this.entries.size;
    }

    public get(key: K): V | undefined {
        const value = this.entries.get(key);
        if (value !== undefined) {
            this.entries.delete(key);
            this.entries.set(key, value);
        }
        return value;
    }

    public set(key: K, value: V): void {
        this.entries.delete(key);
        this.entries.set(key, value);

        while (this.entries.size > this.capacity) {
            const oldest = this.entries.keys().next();
            this.entries.delete(oldest.value);
            this.onEvict();
        }
    }

    public delete(key: K): void {
        this.entries.delete(key);
    }

    public clear(): void {
        this.entries.clear();
    }
}

/**
 * Server-side store for the account data the game node resolves on nearly every request, so that
 * identity and profile are read from DynamoDB once and not per request.
 *
 * - `identity -> userId` links never change once written, so they are kept until evicted. Only
 *   positive results are stored: an identity with no account yet must be found as soon as one is created.
 * - Profiles are kept for a fixed time from when they were loaded (reads do not extend it), so a change
 *   made outside this process still shows up after the TTL.
 *
 * To keep an entry from ever holding data that was not saved:
 * - callers get a copy, so mutating a returned profile cannot change what is cached;
 * - concurrent loads of one profile share a single read;
 * - {@link invalidateProfile} also discards a load that is still in flight, so a read that began before a
 *   write cannot store the pre-write profile after it.
 */
export class UserProfileCache {
    private readonly profiles: LruMap<string, IProfileEntry>;
    private readonly identities: LruMap<string, string>;
    private readonly loadingProfiles = new Map<string, Promise<IUserProfileDataEntity | undefined>>();
    private readonly profileTtlMs: number;
    private readonly now: () => number;

    private profileHits = 0;
    private profileMisses = 0;
    private profileEvictions = 0;
    private identityHits = 0;
    private identityMisses = 0;
    private identityEvictions = 0;

    public constructor(options: IUserProfileCacheOptions = {}) {
        this.profileTtlMs = options.profileTtlMs ?? defaultProfileTtlMs;
        this.now = options.now ?? (() => Date.now());
        this.profiles = new LruMap(options.maxProfiles ?? defaultMaxCachedProfiles, () => this.profileEvictions++);
        this.identities = new LruMap(options.maxIdentities ?? defaultMaxCachedIdentities, () => this.identityEvictions++);
    }

    /** Identity key for an OAuth login, e.g. `discord:1234`. */
    public static identityKey(provider: string, providerId: string): string {
        return `${provider}:${providerId}`;
    }

    /**
     * The account id for an identity, from the cache or else `load`. An identity with no account is not cached.
     */
    public async getUserIdAsync(provider: string, providerId: string, load: () => Promise<string | undefined>): Promise<string | undefined> {
        const key = UserProfileCache.identityKey(provider, providerId);

        const cached = this.identities.get(key);
        if (cached !== undefined) {
            this.identityHits++;
            return cached;
        }

        this.identityMisses++;
        const userId = await load();
        if (userId !== undefined) {
            this.identities.set(key, userId);
        }

        return userId;
    }

    /** Records a link made while this process is running, so it need not be read back. */
    public setIdentity(provider: string, providerId: string, userId: string): void {
        this.identities.set(UserProfileCache.identityKey(provider, providerId), userId);
    }

    /**
     * A copy of the profile for `userId`, from the cache or else `load`.
     * A user with no profile is not cached.
     */
    public async getProfileAsync(
        userId: string,
        load: () => Promise<IUserProfileDataEntity | undefined>
    ): Promise<IUserProfileDataEntity | undefined> {
        const entry = this.profiles.get(userId);
        if (entry) {
            if (entry.expiresAt > this.now()) {
                this.profileHits++;
                return structuredClone(entry.profile);
            }
            this.profiles.delete(userId);
        }

        this.profileMisses++;

        let loading = this.loadingProfiles.get(userId);
        if (!loading) {
            const thisLoad: Promise<IUserProfileDataEntity | undefined> = load().then(
                (profile) => {
                    // only the load still registered for this user may store its result: an invalidation
                    // in the meantime removes it, and what it read may be out of date
                    if (this.loadingProfiles.get(userId) === thisLoad) {
                        this.loadingProfiles.delete(userId);
                        if (profile) {
                            this.profiles.set(userId, { profile: structuredClone(profile), expiresAt: this.now() + this.profileTtlMs });
                        }
                    }
                    return profile;
                },
                (error) => {
                    if (this.loadingProfiles.get(userId) === thisLoad) {
                        this.loadingProfiles.delete(userId);
                    }
                    throw error;
                }
            );
            this.loadingProfiles.set(userId, thisLoad);
            loading = thisLoad;
        }

        const profile = await loading;
        return profile ? structuredClone(profile) : undefined;
    }

    /** Drops the cached profile and any load in flight for it; the next read goes to the database. */
    public invalidateProfile(userId: string): void {
        this.profiles.delete(userId);
        this.loadingProfiles.delete(userId);
    }

    public clear(): void {
        this.profiles.clear();
        this.identities.clear();
        this.loadingProfiles.clear();
    }

    /** Counters since the last call, plus the current sizes. */
    public consumeStats(): IUserProfileCacheStats {
        const stats: IUserProfileCacheStats = {
            profileHits: this.profileHits,
            profileMisses: this.profileMisses,
            profileEvictions: this.profileEvictions,
            identityHits: this.identityHits,
            identityMisses: this.identityMisses,
            identityEvictions: this.identityEvictions,
            profileCount: this.profiles.size,
            identityCount: this.identities.size,
        };

        this.profileHits = 0;
        this.profileMisses = 0;
        this.profileEvictions = 0;
        this.identityHits = 0;
        this.identityMisses = 0;
        this.identityEvictions = 0;

        return stats;
    }
}
