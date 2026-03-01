import { logger } from '../logger';
import { TimedCache } from './TimedCache';
import { getDynamoDbServiceAsync } from '../services/DynamoDBService';
import { ModActionType, ActiveModActionTypes, type IActiveModActionCacheEntry, type IModActionEntity } from '../services/DynamoDBInterfaces';

/** Resolved DynamoDB service type */
type DynamoDBService = NonNullable<Awaited<ReturnType<typeof getDynamoDbServiceAsync>>>;

/**
 * Cache structure: Map<playerId, Map<ModActionType, IActiveModActionCacheEntry>>
 *
 * Each player can have at most one active entry per action type.
 * - Mute: has expiresAt, auto-expires. If multiple active mutes, the one with the later expiresAt
 *   stays active and the shorter one is deactivated in DB.
 * - Rename: no expiry, stays active until user renames or mod cancels it.
 * - Warning: not cached (just a paper trail).
 */
type ModActionCacheMap = Map<string, Map<ModActionType, IActiveModActionCacheEntry>>;

/**
 * In-memory cache on the GameServer that holds all currently active mod actions.
 * This allows checking whether a player is muted or needs a rename without querying DynamoDB on every connection.
 *
 * Lifecycle:
 * 1. Initialization (server start): Query GSI, build cache, clean up expired entries in DB
 * 2. Periodic full refresh (every 24h): Same — query GSI, rebuild cache, clean up expired entries
 * 3. Write-through on mod actions:
 *    - submit-action: Upsert cache entry. For Mute, deactivate the shorter one in DB.
 *    - cancel-action: Remove entry if it was the cached one.
 */
export class ModActionCache {
    private readonly cache: TimedCache<ModActionCacheMap>;
    private readonly db: DynamoDBService;
    private static readonly REFRESH_INTERVAL_MINUTES = 24 * 60; // 24 hours

    public static async createAsync(): Promise<ModActionCache> {
        const db = await getDynamoDbServiceAsync();

        if (!db) {
            throw new Error('ModActionCache: DynamoDB service is required but unavailable');
        }

        const cache = new TimedCache<ModActionCacheMap>(
            ModActionCache.REFRESH_INTERVAL_MINUTES,
            () => ModActionCache.fetchAndCleanupAsync(db),
            'ModActionCache'
        );

        await cache.initializeAsync();

        return new ModActionCache(cache, db);
    }

    private constructor(cache: TimedCache<ModActionCacheMap>, db: DynamoDBService) {
        this.cache = cache;
        this.db = db;
    }

    /**
     * Fetch function passed to TimedCache.
     * Runs on init and every 24h refresh.
     * 1. Queries all active mod actions from the GSI
     * 2. Cleans up expired entries in DB (removes GSI_PK)
     * 3. Builds and returns the cache map
     */
    private static async fetchAndCleanupAsync(db: DynamoDBService): Promise<ModActionCacheMap> {
        const newCache: ModActionCacheMap = new Map();
        const activeActions = await db.getModActionsAsync();
        const now = new Date();
        let cleanedCount = 0;

        for (const action of activeActions) {
            // Clean up expired entries in DB
            if (action.expiresAt && new Date(action.expiresAt) <= now) {
                try {
                    await db.removeModActionFromActiveIndexAsync(action.playerId, action.id);
                    cleanedCount++;
                } catch (error) {
                    logger.error(`ModActionCache: Failed to clean up expired action ${action.id}`, {
                        error: { message: error.message, stack: error.stack }
                    });
                }
                continue;
            }

            if (!newCache.has(action.playerId)) {
                newCache.set(action.playerId, new Map());
            }
            const playerActions = newCache.get(action.playerId);

            const existing = playerActions.get(action.actionType);

            // For Mute: keep whichever expiresAt is later
            // For Rename: overwrite (there's only one active at a time)
            if (!existing || (action.expiresAt && existing.expiresAt && new Date(action.expiresAt) > new Date(existing.expiresAt))) {
                playerActions.set(action.actionType, {
                    id: action.id,
                    actionType: action.actionType,
                    expiresAt: action.expiresAt,
                    durationDays: action.durationDays,
                    modActionId: action.id,
                });
            }
        }

        if (cleanedCount > 0) {
            logger.info(`ModActionCache: Cleaned up ${cleanedCount} expired mod actions from DB`);
        }

        return newCache;
    }

    // ==================== Private Helpers ====================

    private getPlayerActions(playerId: string): Map<ModActionType, IActiveModActionCacheEntry> | null {
        const cacheMap = this.cache.getValue();
        if (!cacheMap) {
            return null;
        }

        return cacheMap.get(playerId) ?? null;
    }

    /**
     * Check if a Mute entry has expired, and remove it if so.
     */
    private validateMuteExpiry(playerId: string, entry: IActiveModActionCacheEntry): boolean {
        if (entry.actionType !== ModActionType.Mute) {
            return true;
        }

        if (entry.expiresAt && new Date(entry.expiresAt) <= new Date()) {
            const playerActions = this.getPlayerActions(playerId);
            if (playerActions) {
                playerActions.delete(ModActionType.Mute);
                if (playerActions.size === 0) {
                    this.cache.getValue()?.delete(playerId);
                }
            }
            return false;
        }

        return true;
    }

    // ==================== Public Query Methods ====================

    /**
     * Gets all active mod action entries for a player, or null if none.
     */
    public getActiveActionsForPlayer(playerId: string): IActiveModActionCacheEntry[] | null {
        const playerActions = this.getPlayerActions(playerId);
        if (!playerActions) {
            return null;
        }

        const activeEntries: IActiveModActionCacheEntry[] = [];

        for (const entry of playerActions.values()) {
            if (this.validateMuteExpiry(playerId, entry)) {
                activeEntries.push(entry);
            }
        }

        return activeEntries.length > 0 ? activeEntries : null;
    }

    /**
     * Checks if a player currently has an active mute.
     */
    public isPlayerMuted(playerId: string): boolean {
        const playerActions = this.getPlayerActions(playerId);
        if (!playerActions) {
            return false;
        }

        const muteEntry = playerActions.get(ModActionType.Mute);
        if (!muteEntry) {
            return false;
        }

        return this.validateMuteExpiry(playerId, muteEntry);
    }

    /**
     * Checks if a player has an active force rename.
     */
    public playerNeedsRename(playerId: string): boolean {
        const playerActions = this.getPlayerActions(playerId);
        if (!playerActions) {
            return false;
        }

        return playerActions.has(ModActionType.Rename);
    }

    // ==================== Write-Through Methods ====================

    /**
     * Called after a new mod action is submitted.
     * Upserts the cache entry for the relevant action type.
     *
     * For Mute: if an existing Mute is in cache, the one with the later expiresAt
     * stays active and the shorter one is deactivated in DB (GSI_PK removed).
     */
    public async onActionSubmitted(playerId: string, modAction: IModActionEntity): Promise<void> {
        if (!ActiveModActionTypes.has(modAction.actionType)) {
            return;
        }

        const cacheMap = this.cache.getValue();
        if (!cacheMap) {
            return;
        }

        if (!cacheMap.has(playerId)) {
            cacheMap.set(playerId, new Map());
        }
        const playerActions = cacheMap.get(playerId);

        const existing = playerActions.get(modAction.actionType);

        // For Mute: determine which one stays active and deactivate the shorter one in DB
        if (modAction.actionType === ModActionType.Mute && existing) {
            const newExpiresAt = new Date(modAction.expiresAt);
            const existingExpiresAt = new Date(existing.expiresAt);

            if (newExpiresAt > existingExpiresAt) {
                // New mute is longer — deactivate the old one in DB
                await this.deactivateModActionInDb(playerId, existing.modActionId);
            } else {
                // Existing mute is longer — deactivate the new one in DB, keep existing in cache
                await this.deactivateModActionInDb(playerId, modAction.id);
                logger.info(`ModActionCache: New mute for player ${playerId} is shorter than existing, deactivated new action ${modAction.id}`);
                return;
            }
        }

        playerActions.set(modAction.actionType, {
            id: modAction.id,
            actionType: modAction.actionType,
            expiresAt: modAction.expiresAt,
            durationDays: modAction.durationDays,
            modActionId: modAction.id,
        });

        logger.info(`ModActionCache: Updated cache for player ${playerId} (${modAction.actionType})`, {
            playerId,
            actionType: modAction.actionType,
            modActionId: modAction.id,
        });
    }

    /**
     * Called after a mod action is cancelled.
     * Removes the entry only if the cancelled action was the one in cache.
     * If there are other active actions of the same type, the next refresh will pick them up.
     */
    public onActionCancelled(playerId: string, cancelledModActionId: string): void {
        const playerActions = this.getPlayerActions(playerId);
        if (!playerActions) {
            return;
        }

        for (const [actionType, entry] of playerActions) {
            if (entry.modActionId === cancelledModActionId) {
                playerActions.delete(actionType);
                logger.info(`ModActionCache: Removed ${actionType} entry for player ${playerId} (action ${cancelledModActionId} cancelled)`);

                // Clean up player entry if no more active actions
                if (playerActions.size === 0) {
                    this.cache.getValue()?.delete(playerId);
                }
                break;
            }
        }
    }

    /**
     * Remove GSI_PK from a mod action in DynamoDB, deactivating it from the sparse index.
     */
    private async deactivateModActionInDb(playerId: string, modActionId: string): Promise<void> {
        try {
            await this.db.removeModActionFromActiveIndexAsync(playerId, modActionId);
        } catch (error) {
            logger.error(`ModActionCache: Failed to deactivate mod action ${modActionId} in DB`, {
                error: { message: error.message, stack: error.stack }
            });
        }
    }
}