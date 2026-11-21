import { v4 as uuid } from 'uuid';
import { logger } from '../logger';
import { getDynamoDbServiceAsync } from '../services/DynamoDBService';
import type { IPlayerNoticeEntity, IPlayerNoticeView, PlayerNoticeKind } from '../services/DynamoDBInterfaces';
import type { IScheduler } from './IScheduler';
import { RealScheduler } from './RealScheduler';

export interface IPlayerNoticeSender {
    id: string;
    username: string;
}

export interface INewPlayerNotice {
    playerId: string;
    kind: PlayerNoticeKind;
    message: string;
    sender: IPlayerNoticeSender;
    relatedModActionId?: string;
}

/** The part of {@link PlayerNoticeService} the mod action submission handler depends on. */
export interface IPlayerNoticeStore {
    sendNoticeAsync(notice: INewPlayerNotice): Promise<IPlayerNoticeEntity | null>;
}

/**
 * Messages from the Karabast team to a player (replies to bug reports, warnings, …), shown to the player the next
 * time they sign in until they acknowledge them.
 *
 * Without DynamoDB (local development) there is nowhere to keep them: a player has none, and sending one fails.
 */
export class PlayerNoticeService implements IPlayerNoticeStore {
    /** At most this many unseen notices are sent to the player at once, oldest first; the rest follow once these are acknowledged */
    public static readonly MaxDeliveredNotices = 10;

    private readonly dbServicePromise = getDynamoDbServiceAsync();

    public constructor(private readonly scheduler: IScheduler = new RealScheduler()) {}

    private async requireDbServiceAsync() {
        const dbService = await this.dbServicePromise;
        if (!dbService) {
            throw new Error('Player notices are unavailable: DynamoDB service unavailable');
        }
        return dbService;
    }

    /**
     * Stores a notice for the player.
     * @returns the stored notice, or null if there is no such player
     */
    public async sendNoticeAsync(notice: INewPlayerNotice): Promise<IPlayerNoticeEntity | null> {
        const dbService = await this.requireDbServiceAsync();
        if (!await dbService.getUserProfileAsync(notice.playerId)) {
            return null;
        }

        const entity: IPlayerNoticeEntity = {
            id: uuid(),
            playerId: notice.playerId,
            kind: notice.kind,
            message: notice.message,
            senderId: notice.sender.id,
            senderUsername: notice.sender.username,
            createdAt: this.scheduler.currentDate().toISOString(),
            relatedModActionId: notice.relatedModActionId,
        };
        await dbService.savePlayerNoticeAsync(entity);

        logger.info(`PlayerNoticeService: ${notice.sender.username} sent a ${notice.kind} notice to player ${notice.playerId}`, {
            userId: notice.playerId,
            moderatorId: notice.sender.id,
            noticeId: entity.id,
        });
        return entity;
    }

    /** The notices the player has not acknowledged yet, oldest first, without who sent them. */
    public async getUnseenNoticesAsync(playerId: string): Promise<IPlayerNoticeView[]> {
        const dbService = await this.dbServicePromise;
        if (!dbService) {
            return [];
        }

        const notices = await dbService.getPlayerNoticesAsync(playerId);
        return notices
            .filter((notice) => !notice.seenAt)
            .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
            .slice(0, PlayerNoticeService.MaxDeliveredNotices)
            .map(({ id, kind, message, createdAt }) => ({ id, kind, message, createdAt }));
    }

    /**
     * Records that the player acknowledged one of their notices.
     * @returns false if the player has no notice with this id
     */
    public async markSeenAsync(playerId: string, noticeId: string): Promise<boolean> {
        const dbService = await this.requireDbServiceAsync();
        return dbService.markPlayerNoticeSeenAsync(playerId, noticeId, this.scheduler.currentDate().toISOString());
    }

    /** Every notice sent to the player, newest first, for the mod tools. */
    public async getNoticeHistoryAsync(playerId: string): Promise<IPlayerNoticeEntity[]> {
        const dbService = await this.requireDbServiceAsync();
        const notices = await dbService.getPlayerNoticesAsync(playerId);
        return notices.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    }
}
