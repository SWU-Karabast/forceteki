import { logger } from '../logger';
import { endedModActionGsiKey, getDynamoDbServiceAsync } from '../services/DynamoDBService';
import { lastExpiredMonth, nextMonth, previousMonth } from './RetentionBuckets';

/**
 * Deletes mod actions RetentionMonths after they ended (see IModActionEntity.endedAt). Deletion works on whole
 * month buckets, so an action is deleted RetentionMonths to RetentionMonths + 1 months after it ended. Active actions are
 * never touched: they stay in the ACTIVE_MODACTION index and only move to an ended bucket once they end.
 *
 * Username change history is not affected; a rename made by a moderator stays in the player's history after
 * the action that caused it has been deleted.
 */
export class ModActionRetentionService {
    /** Stated in the Terms (Privacy & Data Use); change both together */
    public static readonly RetentionMonths = 24;

    /** How often the backend runs the cleanup */
    public static readonly CleanupIntervalMs = 6 * 60 * 60 * 1000;

    /** Mod actions exist since this month, so no ended bucket is older */
    public static readonly FirstModActionMonth = '2026-05';

    private readonly dbServicePromise = getDynamoDbServiceAsync();

    /** @returns the number of deleted mod actions */
    public async runCleanupAsync(now: Date = new Date()): Promise<number> {
        const dbService = await this.dbServicePromise;
        if (!dbService) {
            return 0;
        }

        const firstRunCursor = { lastMonth: previousMonth(ModActionRetentionService.FirstModActionMonth) };
        const cursor = await dbService.getModActionCleanupCursorAsync() ?? firstRunCursor;
        const lastMonth = lastExpiredMonth(now, ModActionRetentionService.RetentionMonths);

        let deleted = 0;
        for (let month = nextMonth(cursor.lastMonth); month <= lastMonth; month = nextMonth(month)) {
            const actions = await dbService.queryAttributesByGsiAsync(endedModActionGsiKey(month), ['id', 'playerId']);
            let failed = false;
            for (const action of actions) {
                try {
                    await dbService.deleteModActionAsync(action.playerId, action.id);
                    deleted++;
                } catch (error) {
                    failed = true;
                    logger.error(`ModActionRetentionService: Failed to delete mod action ${action.id}, it is retried on the next run`, {
                        error: { message: error?.message, stack: error?.stack },
                        userId: action.playerId,
                    });
                }
            }
            if (failed) {
                // The cursor stays before this month so the next run retries it; later months wait until then
                break;
            }
            // Saved per month so an interrupted run resumes where it stopped
            await dbService.saveModActionCleanupCursorAsync({ lastMonth: month });
        }

        if (deleted > 0) {
            logger.info(`ModActionRetentionService: Deleted ${deleted} mod actions that ended ${ModActionRetentionService.RetentionMonths} or more months ago`);
        }
        return deleted;
    }
}
