import { logger } from '../logger';
import { TimedCache } from './TimedCache';
import { getDynamoDbServiceAsync } from '../services/DynamoDBService';
import {
    type IActiveModActionCacheEntry,
    type IModActionEntity,
    isTrackedModAction,
    ModActionType
} from '../services/DynamoDBInterfaces';
import { Contract } from '../game/core/utils/Contract';
import { v4 as uuid } from 'uuid';

/**
 * Cache structure: Map<playerId, Map<ModActionType, IActiveModActionCacheEntry>>
 *
 * Each player can have at most one active entry per action type.
 * - Mute: can be pending (no startedAt/expiresAt) or active (both set).
 *   Pending mutes activate on the user's first login.
 *   If multiple mutes exist, the one with the longer duration/later expiresAt stays active.
 * - Rename: no expiry, stays active until user renames or mod cancels it.
 * - ReportingDisabled: no expiry, indefinite; stays active until a mod cancels it.
 * - Warning: not cached (just a paper trail).
 */
type ModActionCacheMap = Map<string, Map<ModActionType, IActiveModActionCacheEntry>>;

/**
 * In-memory cache on the GameServer that holds all currently active mod actions.
 * This allows checking whether a player is muted or needs a rename without querying DynamoDB on every connection.
 *
 * Lifecycle:
 * 1. Initialization (server start): Query GSI, build cache, clean up expired entries in DB
 * 2. Periodic full refresh (every REFRESH_INTERVAL_MINUTES): Same — query GSI, rebuild cache, clean up expired entries
 * 3. Write-through on mod actions:
 *    - submit-action: Upsert cache entry. For Mute, deactivate the shorter one in DB.
 *    - cancel-action: Remove entry if it was the cached one.
 * 4. Mute activation on user login:
 *    - Pending mute found → set startedAt + expiresAt in DB and cache
 */
export class ModActionService {
    private cache: TimedCache<ModActionCacheMap>;
    private dbServicePromise = getDynamoDbServiceAsync();
    private static readonly REFRESH_INTERVAL_MINUTES = 10;
    private static readonly MS_PER_DAY = 24 * 60 * 60 * 1000;

    /**
     * Write-through mutations that happened while a refresh was in flight. The refresh reads the GSI
     * and then replaces the map wholesale, so without this a cancel/submit issued mid-fetch would be
     * reverted by data that was already stale when it was read.
     */
    private pendingMutations: Map<string, IActiveModActionCacheEntry | null> | null = null;

    public static async createAsync(): Promise<ModActionService> {
        const modActionCacheInstance = new ModActionService();

        const db = await modActionCacheInstance.dbServicePromise;
        if (!db) {
            throw new Error('ModActionCache: DynamoDB service is required but unavailable');
        }

        const cache = new TimedCache<ModActionCacheMap>(
            ModActionService.REFRESH_INTERVAL_MINUTES,
            () => modActionCacheInstance.fetchAndCleanupAsync(),
            'ModActionCache'
        );

        await cache.initializeAsync();
        modActionCacheInstance.cache = cache;

        // Debug logging in development prints cache contents every minute
        if (process.env.ENVIRONMENT === 'development' && process.env.DEBUG_MOD_ACTION_CACHE) {
            setInterval(() => {
                modActionCacheInstance.logCacheContents();
            }, 60 * 1000);
        }

        return modActionCacheInstance;
    }

    /**
     * Fetch function passed to TimedCache.
     * Runs on init and on every periodic refresh.
     * 1. Queries all active mod actions from the GSI
     * 2. Cleans up expired entries in DB (removes GSI_PK)
     * 3. Builds and returns the cache map, re-applying any write-through mutations that landed
     *    while the query was in flight (those are newer than anything the query could have seen)
     */
    private async fetchAndCleanupAsync(): Promise<ModActionCacheMap> {
        const db = await this.dbServicePromise;

        // Full resync: build a fresh cache entirely from the ACTIVE_MODACTION GSI.
        // The old cache is discarded — TimedCache replaces it with the returned map.
        const newCache: ModActionCacheMap = new Map();
        this.pendingMutations = new Map();

        try {
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
                        logger.error(`ModActionService: Failed to clean up expired action ${action.id}`, {
                            error: { message: error.message, stack: error.stack }
                        });
                    }
                    continue;
                }
                this.setOrAddUserAction(action.playerId, action, newCache);
            }

            if (cleanedCount > 0) {
                logger.info(`ModActionService: Cleaned up ${cleanedCount} expired mod actions from DB`);
            }

            this.applyPendingMutations(newCache);
            return newCache;
        } finally {
            this.pendingMutations = null;
        }
    }

    /**
     * Re-applies mutations recorded during an in-flight refresh onto the freshly built map.
     */
    private applyPendingMutations(newCache: ModActionCacheMap): void {
        if (!this.pendingMutations?.size) {
            return;
        }

        for (const [key, entry] of this.pendingMutations) {
            const separatorIndex = key.indexOf('|');
            const playerId = key.slice(0, separatorIndex);
            const actionType = key.slice(separatorIndex + 1) as ModActionType;

            if (entry) {
                if (!newCache.has(playerId)) {
                    newCache.set(playerId, new Map());
                }
                newCache.get(playerId).set(actionType, entry);
                continue;
            }

            const playerActions = newCache.get(playerId);
            if (playerActions) {
                playerActions.delete(actionType);
                if (playerActions.size === 0) {
                    newCache.delete(playerId);
                }
            }
        }

        logger.info(`ModActionService: Re-applied ${this.pendingMutations.size} mutation(s) that raced the refresh`);
    }

    /**
     * Records a write-through mutation so it survives a refresh that is currently in flight.
     * `entry` is null for removals.
     */
    private recordMutation(playerId: string, actionType: ModActionType, entry: IActiveModActionCacheEntry | null): void {
        this.pendingMutations?.set(`${playerId}|${actionType}`, entry);
    }

    // ==================== Private Helpers ====================

    private getPlayerActions(playerId: string): Map<ModActionType, IActiveModActionCacheEntry> | null {
        const cacheMap = this.cache.getValue();
        return cacheMap?.get(playerId);
    }

    /**
     * Adds or updates a mod action entry in the cache for a player.
     * Initializes the player's action map if it doesn't exist.
     */
    private setOrAddUserAction(playerId: string, modAction: IModActionEntity, cacheMap: ModActionCacheMap): void {
        if (!cacheMap.has(playerId)) {
            cacheMap.set(playerId, new Map());
        }

        const entry: IActiveModActionCacheEntry = {
            id: modAction.id,
            actionType: modAction.actionType,
            durationDays: modAction.durationDays,
            startedAt: modAction.startedAt,
            expiresAt: modAction.expiresAt,
            modActionId: modAction.id,
        };

        cacheMap.get(playerId).set(modAction.actionType, entry);

        // Only write-through calls target the live map; refresh builds its own and reconciles separately.
        if (cacheMap === this.cache?.getValue()) {
            this.recordMutation(playerId, modAction.actionType, entry);
        }
    }

    private logCacheContents(): void {
        const cacheMap = this.cache.getValue();
        if (cacheMap.size === 0) {
            logger.info('ModActionService [DEBUG]: Cache is empty');
            return;
        }

        const summary: Record<string, Record<string, unknown>> = {};
        for (const [playerId, actions] of cacheMap) {
            summary[playerId] = {};
            for (const [actionType, entry] of actions) {
                summary[playerId][actionType] = {
                    modActionId: entry.modActionId,
                    durationDays: entry.durationDays,
                    startedAt: entry.startedAt ?? 'pending',
                    expiresAt: entry.expiresAt ?? 'none',
                };
            }
        }

        logger.info(`ModActionService [DEBUG]: Cache contents (${cacheMap.size} players)`, { cache: summary });
    }

    /**
     * Cancel a mod action.
     * Sets cancelledAt/cancelledBy and removes it from the active index.
     * @throws Error if the mod action is not found.
     */
    private async cancelModActionAsync(playerId: string, modActionId: string, cancelledById: string, cancelledByUsername: string): Promise<void> {
        try {
            const dbService = await this.dbServicePromise;
            const result = await dbService.cancelModActionAsync(playerId, modActionId, cancelledById, cancelledByUsername);
            Contract.assertNotNullLike(result.Attributes, `Mod action not found: ${modActionId}`);

            logger.info(`ModActionService: Moderator ${cancelledByUsername} cancelled action ${modActionId} on player ${playerId}`, {
                userId: playerId,
            });
        } catch (error) {
            logger.error('Error cancelling mod action:', {
                error: { message: error.message, stack: error.stack },
                userId: playerId,
            });
            throw error;
        }
    }

    /**
     * Submit a new mod action against a player.
     * Verifies the target player exists, builds the entity, and saves to DynamoDB.
     * @returns The saved mod action entity.
     * @throws Error if the target player is not found.
     */
    private async submitModActionAsync(
        playerId: string,
        actionType: ModActionType,
        moderatorId: string,
        moderatorUsername: string,
        note: string,
        durationDays?: number,
    ): Promise<IModActionEntity> {
        try {
            const dbService = await this.dbServicePromise;

            // Verify target player exists
            const playerProfile = await dbService.getUserProfileAsync(playerId);
            Contract.assertNotNullLike(playerProfile, `Target player not found: ${playerId}`);

            const modAction: IModActionEntity = {
                id: uuid(),
                playerId,
                actionType,
                durationDays,
                note,
                moderatorId,
                moderatorUsername,
                createdAt: new Date().toISOString(),
            };

            await dbService.saveModActionAsync(modAction);

            logger.info(`ModActionService: Moderator ${moderatorId} issued ${actionType} on player ${playerId}`, {
                moderatorId,
                playerId,
                actionType,
                modActionId: modAction.id,
                durationDays: durationDays ?? null,
            });

            return modAction;
        } catch (error) {
            logger.error('Error submitting mod action:', {
                error: { message: error.message, stack: error.stack },
                userId: playerId,
                actionType,
            });
            throw error;
        }
    }

    /**
     * Removes a specific action type entry from the cache for a player.
     * If the player has no remaining active actions after removal, their entire cache entry is cleaned up.
     * @returns The removed cache entry, or null if not found.
     */
    private removeFromCache(playerId: string, actionType: ModActionType): IActiveModActionCacheEntry | null {
        const playerActions = this.getPlayerActions(playerId);
        if (!playerActions) {
            // Still record it: a refresh in flight may be about to re-add the action we just removed in DB.
            this.recordMutation(playerId, actionType, null);
            return null;
        }

        const entry = playerActions.get(actionType) ?? null;
        playerActions.delete(actionType);
        this.recordMutation(playerId, actionType, null);

        if (playerActions.size === 0) {
            this.cache.getValue()?.delete(playerId);
        }

        return entry;
    }

    /**
     * Check if a Mute entry has expired, and remove it if so.
     * Pending mutes (no expiresAt) are never expired.
     */
    private validateMuteExpiry(entry: IActiveModActionCacheEntry): boolean {
        Contract.assertTrue(
            entry.actionType === ModActionType.Mute,
            `validateMuteExpiry called with non-Mute action type: ${entry.actionType}`
        );

        // Pending mutes haven't started yet they're valid
        if (!entry.expiresAt) {
            return true;
        }

        return new Date(entry.expiresAt) > new Date();
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
            if (entry.actionType === ModActionType.Mute) {
                if (this.validateMuteExpiry(entry)) {
                    activeEntries.push(entry);
                } else {
                    this.removeFromCache(playerId, ModActionType.Mute);
                }
            } else {
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

        return this.validateMuteExpiry(muteEntry);
    }

    /**
     * Checks if a player has an active force rename.
     */
    public playerActiveRename(playerId: string): IActiveModActionCacheEntry | null {
        const playerActions = this.getPlayerActions(playerId);

        return playerActions?.get(ModActionType.Rename);
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

        return this.validateMuteExpiry(muteEntry) ? muteEntry : null;
    }

    /**
     * Checks if a player has an active ReportingDisabled restriction.
     */
    public isReportingDisabled(playerId: string): boolean {
        return !!this.getPlayerActions(playerId)?.get(ModActionType.ReportingDisabled);
    }

    /**
     * Id of the player's active ReportingDisabled action, or null if reporting is not disabled.
     * Callers compare this against the profile's acknowledged id to decide whether to show the notice.
     */
    public getActiveReportingDisabledActionId(playerId: string): string | null {
        return this.getPlayerActions(playerId)?.get(ModActionType.ReportingDisabled)?.modActionId ?? null;
    }

    // ==================== Mute Activation ====================

    /**
     * Activates a pending mute when the user first logs in.
     * Sets startedAt and expiresAt in both DB and cache.
     *
     * @returns The updated cache entry with startedAt and expiresAt set, or null if no pending mute.
     */
    public async activatePendingMuteAsync(playerId: string): Promise<IActiveModActionCacheEntry | null> {
        const db = await this.dbServicePromise;
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

        Contract.assertNotNullLike(muteEntry.durationDays, `Cannot activate mute ${muteEntry.modActionId}: durationDays is missing`);

        const expiresAt = new Date(now.getTime() + muteEntry.durationDays * ModActionService.MS_PER_DAY).toISOString();

        // Update DB
        try {
            await db.activateMuteAsync(playerId, muteEntry.modActionId, startedAt, expiresAt);
        } catch (error) {
            logger.error(`ModActionCache: Failed to activate mute ${muteEntry.modActionId} in DB`, {
                error: { message: error.message, stack: error.stack }
            });
            return null;
        }

        // Re-read: a refresh may have replaced the map while the DB write was in flight.
        const currentEntry = this.getPlayerActions(playerId)?.get(ModActionType.Mute);
        const target = currentEntry?.modActionId === muteEntry.modActionId ? currentEntry : muteEntry;

        target.startedAt = startedAt;
        target.expiresAt = expiresAt;
        this.recordMutation(playerId, ModActionType.Mute, target);

        logger.info(`ModActionCache: Activated pending mute for player ${playerId} (expires ${expiresAt})`, {
            userId: playerId,
        });

        return target;
    }

    // ==================== Write-Through Methods ====================

    /**
     * Called after a new mod action is submitted.
     * Upserts the cache entry for the relevant action type.
     *
     * For Mute: if an existing Mute is in cache it prevents the user from submitting a new one.
     * stays active and the shorter one is deactivated in DB (GSI_PK removed).
     */
    public async onActionSubmitted(playerId: string, actionType: ModActionType,
        moderatorId: string,
        moderatorUsername: string,
        note: string,
        durationDays?: number
    ): Promise<{ success: boolean; message: string }> {
        const existing = this.getPlayerActions(playerId)?.get(actionType);
        if (existing) {
            return {
                success: false,
                message: `Player already has an active ${actionType}. Cancel it before issuing a new one.`,
            };
        }

        const modAction = await this.submitModActionAsync(playerId, actionType, moderatorId, moderatorUsername, note, durationDays);

        if (!isTrackedModAction(modAction.actionType)) {
            return {
                success: true,
                message: `${modAction.actionType} submitted successfully for player ${playerId}.`,
            };
        }

        const cacheMap = this.cache.getValue();
        if (!cacheMap) {
            return {
                success: false,
                message: 'Mod action service is not initialized.',
            };
        }

        this.setOrAddUserAction(playerId, modAction, cacheMap);

        logger.info(`ModActionCache: Updated cache for player ${playerId} (${modAction.actionType})`, {
            userId: playerId,
        });

        return {
            success: true,
            message: `${modAction.actionType} submitted successfully for player ${playerId}.`,
        };
    }

    /**
     * Called after a mod action is cancelled.
     * Removes the entry only if the cancelled action was the one in cache.
     * If there are other active actions of the same type, the next refresh will pick them up.
     */
    public async onActionCancelled(playerId: string, cancelledModActionId: string, cancelledById: string, cancelledByUsername: string): Promise<void> {
        const playerActions = this.getPlayerActions(playerId);
        // DB cancellation
        await this.cancelModActionAsync(playerId, cancelledModActionId, cancelledById, cancelledByUsername);

        // Cache cancellation
        if (!playerActions) {
            return;
        }

        for (const [actionType, entry] of playerActions) {
            if (entry.modActionId === cancelledModActionId) {
                this.removeFromCache(playerId, actionType);
                logger.info(`ModActionService: Cancelled ${actionType} for player ${playerId} (action ${cancelledModActionId})`);
                break;
            }
        }
    }

    /**
     * Remove GSI_PK from a mod action in DynamoDB, deactivating it from the sparse index.
     */
    private async deactivateModActionInDb(playerId: string, modActionId: string): Promise<void> {
        const db = await this.dbServicePromise;
        try {
            await db.removeModActionFromActiveIndexAsync(playerId, modActionId);
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
        const removedEntry = this.removeFromCache(playerId, ModActionType.Rename);
        if (!removedEntry) {
            return;
        }

        await this.deactivateModActionInDb(playerId, removedEntry.modActionId);

        logger.info(`ModActionService: Rename completed for player ${playerId}, deactivated action ${removedEntry.modActionId}`, {
            userId: playerId,
        });
    }
}