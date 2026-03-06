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
 * - Mute: can be pending (no startedAt/expiresAt) or active (both set).
 *   Pending mutes activate on the user's first login.
 *   If multiple mutes exist, the one with the longer duration/later expiresAt stays active.
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
 * 4. Mute activation on user login:
 *    - Pending mute found → set startedAt + expiresAt in DB and cache
 */
export class ModActionCache {
    private readonly cache: TimedCache<ModActionCacheMap>;
    private readonly db: DynamoDBService;
    private static readonly REFRESH_INTERVAL_MINUTES = 24 * 60; // 24 hours
    private static readonly MS_PER_DAY = 24 * 60 * 60 * 1000;

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
            // Clean up expired entries in DB (only those that have been activated)
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

            // Only cache active action types (Mute, Rename)
            if (!ActiveModActionTypes.has(action.actionType)) {
                continue;
            }

            if (!newCache.has(action.playerId)) {
                newCache.set(action.playerId, new Map());
            }
            const playerActions = newCache.get(action.playerId);

            const existing = playerActions.get(action.actionType);

            const shouldUpdate = !existing ||
              action.actionType === ModActionType.Rename ||
              ModActionCache.compareMutePriority(action, existing);

            if (shouldUpdate) {
                playerActions.set(action.actionType, {
                    id: action.id,
                    actionType: action.actionType,
                    durationDays: action.durationDays,
                    startedAt: action.startedAt,
                    expiresAt: action.expiresAt,
                    modActionId: action.id,
                });
            }
        }

        if (cleanedCount > 0) {
            logger.info(`ModActionCache: Cleaned up ${cleanedCount} expired mod actions from DB`);
        }

        return newCache;
    }

    /**
     * Compare which mute should take priority.
     * Active mutes (with expiresAt) are compared by expiresAt.
     * Pending mutes (no expiresAt) are compared by durationDays.
     * A pending mute with longer durationDays beats an active mute only if it would expire later.
     */
    private static compareMutePriority(
        incoming: Pick<IActiveModActionCacheEntry, 'expiresAt' | 'durationDays'>,
        existing: Pick<IActiveModActionCacheEntry, 'expiresAt' | 'durationDays'>
    ): boolean {
        // Both active: compare expiresAt
        if (incoming.expiresAt && existing.expiresAt) {
            return new Date(incoming.expiresAt) > new Date(existing.expiresAt);
        }

        // Incoming is pending, existing is active: compare potential expiresAt
        if (!incoming.expiresAt && existing.expiresAt) {
            const incomingPotentialExpiry = Date.now() + (incoming.durationDays ?? 0) * ModActionCache.MS_PER_DAY;
            return incomingPotentialExpiry > new Date(existing.expiresAt).getTime();
        }

        // Incoming is active, existing is pending: compare potential expiresAt
        if (incoming.expiresAt && !existing.expiresAt) {
            const existingPotentialExpiry = Date.now() + (existing.durationDays ?? 0) * ModActionCache.MS_PER_DAY;
            return new Date(incoming.expiresAt).getTime() > existingPotentialExpiry;
        }

        // Both pending: compare durationDays
        return (incoming.durationDays ?? 0) > (existing.durationDays ?? 0);
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
     * Pending mutes (no expiresAt) are never expired.
     */
    private validateMuteExpiry(playerId: string, entry: IActiveModActionCacheEntry): boolean {
        if (entry.actionType !== ModActionType.Mute) {
            return true;
        }

        // Pending mutes haven't started yet — they're valid
        if (!entry.expiresAt) {
            return true;
        }

        if (new Date(entry.expiresAt) <= new Date()) {
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
     * Checks if a player currently has an active or pending mute.
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

    /**
     * Gets the active mute cache entry for a player, or null if not muted.
     * If the mute is pending, it stays pending — call activatePendingMuteAsync to start the timer.
     */
    public getActiveMuteForPlayer(playerId: string): IActiveModActionCacheEntry | null {
        const playerActions = this.getPlayerActions(playerId);
        if (!playerActions) {
            return null;
        }

        const muteEntry = playerActions.get(ModActionType.Mute);
        if (!muteEntry) {
            return null;
        }

        return this.validateMuteExpiry(playerId, muteEntry) ? muteEntry : null;
    }

    // ==================== Mute Activation ====================

    /**
     * Activates a pending mute when the user first logs in.
     * Sets startedAt and expiresAt in both DB and cache.
     *
     * @returns The updated cache entry with startedAt and expiresAt set, or null if no pending mute.
     */
    public async activatePendingMuteAsync(playerId: string): Promise<IActiveModActionCacheEntry | null> {
        const muteEntry = this.getActiveMuteForPlayer(playerId);
        if (!muteEntry) {
            return null;
        }

        // Already activated
        if (muteEntry.startedAt) {
            return muteEntry;
        }

        const now = new Date();
        const startedAt = now.toISOString();
        const expiresAt = new Date(now.getTime() + (muteEntry.durationDays ?? 0) * ModActionCache.MS_PER_DAY).toISOString();

        // Update DB
        try {
            await this.db.activateMuteAsync(playerId, muteEntry.modActionId, startedAt, expiresAt);
        } catch (error) {
            logger.error(`ModActionCache: Failed to activate mute ${muteEntry.modActionId} in DB`, {
                error: { message: error.message, stack: error.stack }
            });
            return null;
        }

        // Update cache
        muteEntry.startedAt = startedAt;
        muteEntry.expiresAt = expiresAt;

        logger.info(`ModActionCache: Activated pending mute for player ${playerId} (expires ${expiresAt})`, {
            playerId,
            modActionId: muteEntry.modActionId,
            durationDays: muteEntry.durationDays,
        });

        return muteEntry;
    }

    // ==================== Write-Through Methods ====================

    /**
     * Called after a new mod action is submitted.
     * Upserts the cache entry for the relevant action type.
     *
     * For Mute: if an existing Mute is in cache, the one with the longer effective duration
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
            const incomingEntry = { expiresAt: modAction.expiresAt, durationDays: modAction.durationDays };
            const existingEntry = { expiresAt: existing.expiresAt, durationDays: existing.durationDays };

            if (ModActionCache.compareMutePriority(incomingEntry, existingEntry)) {
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
            durationDays: modAction.durationDays,
            startedAt: modAction.startedAt,
            expiresAt: modAction.expiresAt,
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

    /**
     * Called when a user completes a username change, resolving an active Rename action.
     * Removes the Rename entry from cache and deactivates it in DB.
     */
    public async onRenameCompleted(playerId: string): Promise<void> {
        const playerActions = this.getPlayerActions(playerId);
        if (!playerActions) {
            return;
        }

        const renameEntry = playerActions.get(ModActionType.Rename);
        if (!renameEntry) {
            return;
        }

        // Remove from cache
        playerActions.delete(ModActionType.Rename);
        if (playerActions.size === 0) {
            this.cache.getValue()?.delete(playerId);
        }

        // Deactivate in DB (remove GSI_PK)
        await this.deactivateModActionInDb(playerId, renameEntry.modActionId);

        logger.info(`ModActionCache: Rename completed for player ${playerId}, deactivated action ${renameEntry.modActionId}`, {
            playerId,
            modActionId: renameEntry.modActionId,
        });
    }
}