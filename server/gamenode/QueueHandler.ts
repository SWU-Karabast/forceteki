import type Socket from '../socket';
import { logger } from '../logger';
import type { User } from '../utils/user/User';
import { Contract } from '../game/core/utils/Contract';
import type { ISwuDbFormatDecklist } from '../utils/deck/DeckInterfaces';
import { CardPool } from '../game/core/Constants';
import { GamesToWinMode } from '../game/core/Constants';
import { SwuGameFormat } from '../game/core/Constants';
import { MatchmakingCompetitivenessPreference } from '../game/core/Constants';
import { EnumHelpers } from '../game/core/utils/EnumHelpers';

import type { IMatchmakingPlayerEntry, IMatchmakingRule } from './MatchmakingRules';
import { getQueueMatchmakingStatus, MatchmakingRule } from './MatchmakingRules';
import type { IScheduledTask, IScheduler } from '../utils/IScheduler';
import type { IGameNodeConfig, IMatchmakingPreferencePolicy } from './GameNodeConfig';
import { defaultMatchmakingPreferencePolicy, MatchmakingCompetitivenessPreferencePolicyKey } from './GameNodeConfig';

export interface QueuedPlayerToAdd {
    deck: ISwuDbFormatDecklist;
    socket?: Socket;
    user: User;
    matchmakingPreference?: MatchmakingCompetitivenessPreference;
    searchStartedAt?: number;
    preferencesPublishedAt?: Partial<Record<MatchmakingCompetitivenessPreference, number>>;
}

export enum QueuedPlayerState {
    Connected = 'connected',
    WaitingForConnection = 'waitingForConnection',
}

export interface QueuedPlayer extends QueuedPlayerToAdd {
    state: QueuedPlayerState;
    matchmakingPreference: MatchmakingCompetitivenessPreference;
    preferencesPublishedAt: Partial<Record<MatchmakingCompetitivenessPreference, number>>;
    disconnectedSocketId?: string;
}

interface QueuedPlayerEntry {
    format: IQueueFormatKey;
    player: QueuedPlayer;
}

export interface IQueueFormatKey {
    format: SwuGameFormat;
    cardPool: CardPool;
    gamesToWinMode: GamesToWinMode;
}


export interface PreviousMatchEntry {
    opponentUserId: string;
    endTimestamp: number;
}

export class QueueHandler {
    private readonly queues: Map<string, QueuedPlayer[]>;
    private playersWaitingToConnect: QueuedPlayerEntry[] = [];
    private playerPreviousMatch: Map<string, PreviousMatchEntry>;
    private readonly scheduler: IScheduler;
    private readonly config: IGameNodeConfig;
    private readonly preferencePolicy: Readonly<IMatchmakingPreferencePolicy>;
    private readonly previousMatchCleanupTask: IScheduledTask;
    private preferenceAnnouncementTask?: IScheduledTask;

    /** Cooldown interval (in seconds) for rematch prevention */
    public static readonly COOLDOWN_INTERVAL_SECONDS = 15;

    public static readonly PREFERENCE_EXPANSION_VISIBILITY_DELAY_MS = 1_500;

    public constructor(scheduler: IScheduler, config: IGameNodeConfig) {
        this.scheduler = scheduler;
        this.config = config;
        this.preferencePolicy = { ...(config.matchmakingPreferencePolicy ?? defaultMatchmakingPreferencePolicy) };
        for (const name of Object.values(MatchmakingCompetitivenessPreferencePolicyKey)) {
            const durationMs = this.preferencePolicy[name];
            Contract.assertTrue(Number.isSafeInteger(durationMs) && durationMs >= 0, `Invalid matchmaking preference duration ${name}: ${durationMs}`);
        }
        this.queues = new Map<string, QueuedPlayer[]>();
        this.playerPreviousMatch = new Map<string, PreviousMatchEntry>();

        for (const format of Object.values(SwuGameFormat)) {
            for (const cardPool of Object.values(CardPool)) {
                for (const gamesToWinMode of Object.values(GamesToWinMode)) {
                    const key: IQueueFormatKey = { format, cardPool, gamesToWinMode };
                    this.queues.set(JSON.stringify(key), []);
                }
            }
        }

        // Cleanup previous match entries periodically
        this.previousMatchCleanupTask = this.scheduler.setInterval(
            () => this.cleanupPreviousMatchEntries(),
            3600000, // 1 hour
            { message: 'QueueHandler: error cleaning up previous match entries' }
        );
    }

    /** Stops queue-owned cleanup and preference announcements. */
    public shutdown() {
        this.previousMatchCleanupTask.cancel();
        this.preferenceAnnouncementTask?.cancel();
        this.preferenceAnnouncementTask = undefined;
    }

    /** Adds an entry for a player, but they can't match until they actually connect */
    public addPlayer(format: IQueueFormatKey, player: QueuedPlayerToAdd) {
        Contract.assertNotNullLike(player);
        Contract.assertNotNullLike(format);
        const { matchmakingPreference = MatchmakingCompetitivenessPreference.NoPreference } = player;
        Contract.assertTrue(EnumHelpers.isEnumValue(matchmakingPreference, MatchmakingCompetitivenessPreference), `Invalid matchmaking preference ${matchmakingPreference}`);
        if (player.searchStartedAt !== undefined) {
            Contract.assertTrue(Number.isSafeInteger(player.searchStartedAt), `Invalid matchmaking search start ${player.searchStartedAt}`);
        }

        const queueEntry = this.findPlayerInQueue(player.user.getId());
        if (queueEntry) {
            logger.info(`QueueHandler: User ${player.user.getId()} is already in queue for format ${this.queueKeyToString(queueEntry.format)}, rejoining into queue for format ${this.queueKeyToString(format)}`);
            this.removePlayer(player.user.getId(), 'Rejoining into queue');
        }

        const notConnectedPlayerEntry = this.findNotConnectedPlayer(player.user.getId());
        if (notConnectedPlayerEntry) {
            logger.info(`QueueHandler:  ${player.user.getId()} is already in waiting-to-queue list for ${this.queueKeyToString(notConnectedPlayerEntry.format)}, rejoining into queue for format ${this.queueKeyToString(format)}`);
            this.removePlayer(player.user.getId(), 'Rejoining into queue');
        }

        this.playersWaitingToConnect.push({
            format,
            player: {
                ...player,
                matchmakingPreference,
                preferencesPublishedAt: { ...player.preferencesPublishedAt },
                state: QueuedPlayerState.WaitingForConnection,
            }
        });
        logger.info(`QueueHandler: Added user ${player.user.getId()} to waiting list for format ${this.queueKeyToString(format)} until they connect`);

        // if the player has an active socket, immediately connect them
        if (player.socket) {
            this.connectPlayer(player.user.getId(), player.socket);
        }
    }

    /** Connects a player that has been added to the queue */
    public connectPlayer(userId: string, socket: Socket) {
        let playerEntry: QueuedPlayerEntry;

        const queueEntry = this.findPlayerInQueue(userId);
        if (queueEntry) {
            playerEntry = queueEntry;

            logger.info(`QueueHandler: User ${userId} with socket id ${socket.id} is already in queue for format ${this.queueKeyToString(queueEntry.format)}, rejoining into queue for format ${this.queueKeyToString(playerEntry.format)}`);
            this.removePlayer(userId, 'Rejoining into queue');
        } else {
            const notConnectedPlayer = this.findNotConnectedPlayer(userId);
            Contract.assertNotNullLike(notConnectedPlayer, `Player ${userId} is not in the queue`);

            playerEntry = notConnectedPlayer;
            this.removePlayer(userId, `Player connected with socket id ${socket.id}`);
        }

        Contract.assertNotNullLike(playerEntry.format);

        playerEntry.player.state = QueuedPlayerState.Connected;
        playerEntry.player.socket = socket;
        playerEntry.player.disconnectedSocketId = undefined;
        playerEntry.player.searchStartedAt ??= this.scheduler.now();

        this.getQueueByFormat(playerEntry.format)?.push(playerEntry.player);

        // Logged here rather than in addPlayer because this is where searchStartedAt is set — this is the
        // point a player actually starts searching, and the event every wait time is measured from.
        logger.info(
            `QueueHandler: User ${userId} connected with socket id ${socket.id}, added to queue for format ${this.queueKeyToString(playerEntry.format)}`,
            {
                event: 'queueJoin',
                userId,
                ...this.queueKeyMeta(playerEntry.format),
                preference: playerEntry.player.matchmakingPreference,
                searchStartedAt: playerEntry.player.searchStartedAt,
            }
        );
        this.sendPlayerHeartbeat(playerEntry.player);
        this.scheduleNextPreferenceAnnouncement();
    }

    /** If the user exists in the queue and is connected, temporarily move them into a disconnected state while waiting for reconnection */
    public disconnectPlayer(userId: string, socketId: string) {
        const queueEntry = this.findPlayerInQueue(userId);
        if (queueEntry && queueEntry.player?.socket?.id === socketId) {
            this.removePlayer(userId, `Temporarily disconnected on socket id ${socketId}`);
            this.playersWaitingToConnect.push({
                format: queueEntry.format,
                player: {
                    ...queueEntry.player,
                    state: QueuedPlayerState.WaitingForConnection,
                    socket: undefined,
                    disconnectedSocketId: socketId,
                },
            });
            logger.info(`QueueHandler: User ${userId} is waiting to reconnect after socket ${socketId} disconnected`);
        }
    }

    public isWaitingForReconnection(userId: string, socketId: string): boolean {
        return this.findNotConnectedPlayer(userId)?.player.disconnectedSocketId === socketId;
    }

    public isConnected(userId: string, socketId: string): boolean {
        const player = this.findPlayerInQueue(userId);
        return player && player.player.socket?.id === socketId;
    }

    public removePlayer(userId: string, reasonStr: string) {
        for (const [queueKey, queue] of this.iterateQueues()) {
            const index = queue.findIndex((p) => p.user.getId() === userId);
            if (index !== -1) {
                const parsedKey: IQueueFormatKey = JSON.parse(queueKey);
                logger.info(`QueueHandler: Removing player ${userId} from queue for format ${this.queueKeyToString(parsedKey)}. Reason: ${reasonStr}`);
                queue.splice(index, 1);
                this.scheduleNextPreferenceAnnouncement();
                return;
            }
        }

        const index = this.playersWaitingToConnect.findIndex((p) => p.player.user.getId() === userId);
        if (index !== -1) {
            logger.info(`QueueHandler: Removing player ${userId} from queue waiting list. Reason: ${reasonStr}`);
            this.playersWaitingToConnect.splice(index, 1);
            return;
        }
    }

    /** Sets a previous match entry for a player pair */
    public setPreviousMatchEntry(
        player1UserId: string,
        player2UserId: string,
        endTimestamp: number
    ) {
        this.playerPreviousMatch.set(player1UserId, {
            opponentUserId: player2UserId,
            endTimestamp: endTimestamp
        });

        this.playerPreviousMatch.set(player2UserId, {
            opponentUserId: player1UserId,
            endTimestamp: endTimestamp
        });
    }

    private cleanupPreviousMatchEntries() {
        try {
            const now = this.scheduler.now();
            const cooldownMs = QueueHandler.COOLDOWN_INTERVAL_SECONDS * 1000;
            for (const [userId, matchEntry] of this.playerPreviousMatch.entries()) {
                if (now - matchEntry.endTimestamp >= cooldownMs) {
                    this.playerPreviousMatch.delete(userId);
                }
            }
        } catch (error) {
            logger.error(`QueueHandler: Error cleaning up previous match entries: ${error}`);
        }
    }

    /** Send a heartbeat signal to the FE for all connected clients */
    public sendHeartbeat() {
        try {
            for (const [_queueKey, queue] of this.iterateQueues()) {
                for (const player of queue) {
                    if (player.socket) {
                        this.sendPlayerHeartbeat(player);
                    }
                }
            }
        } catch (error) {
            logger.error(`QueueHandler: Error sending heartbeat: ${error}`);
        }
    }

    private sendPlayerHeartbeat(player: QueuedPlayer) {
        Contract.assertNotNullLike(player.socket);
        const serverTime = this.scheduler.now();
        const status = getQueueMatchmakingStatus(player, this.preferencePolicy, serverTime, QueueHandler.PREFERENCE_EXPANSION_VISIBILITY_DELAY_MS);
        player.socket.send('queueHeartbeat', serverTime, status);
        for (const preference of status.competitiveness.allowedOpponentPreferences) {
            player.preferencesPublishedAt[preference] ??= serverTime;
        }
    }

    private scheduleNextPreferenceAnnouncement() {
        this.preferenceAnnouncementTask?.cancel();
        this.preferenceAnnouncementTask = undefined;

        const serverTime = this.scheduler.now();
        let nextAnnouncementAt: number | null = null;
        for (const [_queueKey, queue] of this.iterateQueues()) {
            for (const player of queue) {
                const status = getQueueMatchmakingStatus(player, this.preferencePolicy, serverTime, QueueHandler.PREFERENCE_EXPANSION_VISIBILITY_DELAY_MS);
                if (status.competitiveness.nextExpansionAt !== null) {
                    nextAnnouncementAt = nextAnnouncementAt === null
                        ? status.competitiveness.nextExpansionAt
                        : Math.min(nextAnnouncementAt, status.competitiveness.nextExpansionAt);
                }
            }
        }

        if (nextAnnouncementAt !== null) {
            this.preferenceAnnouncementTask = this.scheduler.setTimeout(() => {
                this.preferenceAnnouncementTask = undefined;
                this.sendHeartbeat();
                this.scheduleNextPreferenceAnnouncement();
            }, nextAnnouncementAt - serverTime, { message: 'QueueHandler: error announcing expanded matchmaking preferences' });
        }
    }

    private findPlayerInQueue(userId: string): QueuedPlayerEntry | null {
        for (const [queueKey, queue] of this.iterateQueues()) {
            const player = queue.find((p) => p.user.getId() === userId);
            if (player) {
                const parsedKey: IQueueFormatKey = JSON.parse(queueKey);
                return { player, format: parsedKey };
            }
        }
        return null;
    }

    private findNotConnectedPlayer(userId: string): QueuedPlayerEntry | null {
        return this.playersWaitingToConnect.find((p) => p.player.user.getId() === userId);
    }

    public findPlayer(userId: string) {
        return this.findPlayerInQueue(userId) || this.findNotConnectedPlayer(userId);
    }

    // Get the next two players from a format queue
    public getNextMatchPair(format: IQueueFormatKey): [QueuedPlayer, QueuedPlayer] | null {
        const queue = this.getQueueByFormat(format);
        if (!queue || queue.length < 2) {
            return null;
        }

        const serverTime = this.scheduler.now();
        for (const player of queue) {
            const status = getQueueMatchmakingStatus(player, this.preferencePolicy, serverTime, QueueHandler.PREFERENCE_EXPANSION_VISIBILITY_DELAY_MS);
            if (status.competitiveness.allowedOpponentPreferences.some((preference) => player.preferencesPublishedAt[preference] === undefined)) {
                this.sendPlayerHeartbeat(player);
            }
        }

        return this.findMatchInQueue(format, queue, this.getMatchmakingRules());
    }

    public getNextMatchAvailableAt(format: IQueueFormatKey): number | null {
        const queue = this.getQueueByFormat(format);
        if (!queue || queue.length < 2) {
            return null;
        }

        const rules = this.getMatchmakingRules();
        let nextMatchAvailableAt: number | null = null;

        for (let i = 0; i < queue.length; i++) {
            const player1 = this.buildMatchmakingPlayerEntry(queue[i]);
            for (let j = i + 1; j < queue.length; j++) {
                const player2 = this.buildMatchmakingPlayerEntry(queue[j]);
                const availableAt = Math.max(...rules.map((rule) => rule.getMatchAvailableAt(player1, player2)));
                nextMatchAvailableAt = nextMatchAvailableAt === null ? availableAt : Math.min(nextMatchAvailableAt, availableAt);
            }
        }

        return nextMatchAvailableAt;
    }

    private getMatchmakingRules(): IMatchmakingRule[] {
        return [
            MatchmakingRule.rematchCooldown(QueueHandler.COOLDOWN_INTERVAL_SECONDS, this.scheduler, this.config.enforceRematchCooldown),
            MatchmakingRule.preference(this.preferencePolicy, this.scheduler, QueueHandler.PREFERENCE_EXPANSION_VISIBILITY_DELAY_MS),
        ];
    }

    private buildMatchmakingPlayerEntry(player: QueuedPlayer): IMatchmakingPlayerEntry {
        return { player, previousMatch: this.playerPreviousMatch.get(player.user.getId()) };
    }

    /**
     * One record per match formed. `preferenceRank` is the compromise the pairing required, reusing the
     * ranking {@link getOpponentPreferenceRank} already computed to choose this opponent:
     * 0 = both got the category they asked for, 1 = one side settled for a no-preference opponent,
     * 2 = Competitive and Casual were paired because both widening windows had elapsed.
     *
     * A rank-2 match means the preference the player chose could not be honoured, so a rising share of
     * them is the signal that a queue option is too thinly populated to be worth offering.
     */
    private logMatchFormed(format: IQueueFormatKey, player1: QueuedPlayer, player2: QueuedPlayer, preferenceRank: number): void {
        const serverTime = this.scheduler.now();
        const describe = (player: QueuedPlayer) => ({
            userId: player.user.getId(),
            preference: player.matchmakingPreference,
            waitedMs: this.waitedMs(player),
            stage: getQueueMatchmakingStatus(player, this.preferencePolicy, serverTime, QueueHandler.PREFERENCE_EXPANSION_VISIBILITY_DELAY_MS)
                .competitiveness.stage,
        });

        const [first, second] = [describe(player1), describe(player2)];
        logger.info(
            `QueueHandler: Matched ${first.userId} (${first.preference}) with ${second.userId} (${second.preference}) in format ${this.queueKeyToString(format)}`,
            {
                event: 'matchFormed',
                ...this.queueKeyMeta(format),
                preferenceRank,

                // Sorted so that a pairing counts the same whichever player the search happened to start from.
                preferencePair: [player1.matchmakingPreference, player2.matchmakingPreference].sort().join('+'),
                players: [first, second],
                longestWaitMs: Math.max(first.waitedMs ?? 0, second.waitedMs ?? 0),
            }
        );
    }

    private getOpponentPreferenceRank(player: QueuedPlayer, opponent: QueuedPlayer): number {
        if (player.matchmakingPreference === MatchmakingCompetitivenessPreference.NoPreference || player.matchmakingPreference === opponent.matchmakingPreference) {
            return 0;
        }

        return opponent.matchmakingPreference === MatchmakingCompetitivenessPreference.NoPreference ? 1 : 2;
    }

    /**
     * Finds a matching pair in the queue based on the provided rules
     *
     * @param format The queue key these players are searching in, for match telemetry
     * @param queue The queue of players to search for a match
     * @param rules The matchmaking rules to apply when finding a match
     * @returns A tuple of the matched players, or null if no match is found
     */
    private findMatchInQueue(format: IQueueFormatKey, queue: QueuedPlayer[], rules: IMatchmakingRule[]): [QueuedPlayer, QueuedPlayer] | null {
        const playersBySearchAge = [...queue];
        for (const player of playersBySearchAge) {
            Contract.assertNotNullLike(player.searchStartedAt, `Queued player ${player.user.getId()} has not started searching`);
        }
        playersBySearchAge.sort((player1, player2) => player1.searchStartedAt - player2.searchStartedAt);

        for (let i = 0; i < playersBySearchAge.length; i++) {
            const player1 = playersBySearchAge[i];
            const p1Entry = this.buildMatchmakingPlayerEntry(player1);
            let bestOpponent: QueuedPlayer | null = null;
            let bestRank = 3;

            for (let j = i + 1; j < playersBySearchAge.length; j++) {
                const player2 = playersBySearchAge[j];
                const rank = this.getOpponentPreferenceRank(player1, player2);
                if (rank >= bestRank) {
                    continue;
                }

                const p2Entry = this.buildMatchmakingPlayerEntry(player2);
                if (rules.every((rule) => rule.canMatch(p1Entry, p2Entry))) {
                    bestOpponent = player2;
                    bestRank = rank;
                    if (rank === 0) {
                        break;
                    }
                }
            }

            if (bestOpponent) {
                this.logMatchFormed(format, player1, bestOpponent, bestRank);
                queue.splice(queue.indexOf(bestOpponent), 1);
                queue.splice(queue.indexOf(player1), 1);
                this.scheduleNextPreferenceAnnouncement();
                return [player1, bestOpponent];
            }
        }

        return null;
    }

    // Check if any format has enough players for matchmaking
    public findReadyFormats(): IQueueFormatKey[] {
        const readyFormats: IQueueFormatKey[] = [];
        for (const [format, queue] of this.iterateQueues()) {
            if (queue.length >= 2) {
                const parsedFormat: IQueueFormatKey = JSON.parse(format);
                readyFormats.push(parsedFormat);
            }
        }
        return readyFormats;
    }

    private *iterateQueues(): IterableIterator<[string, QueuedPlayer[]]> {
        for (const [key, queue] of this.queues.entries()) {
            yield [key, queue];
        }
    }

    private queueKeyToString(key: IQueueFormatKey): string {
        return `(${key.format} / ${key.cardPool} / ${key.gamesToWinMode})`;
    }

    /**
     * The queue key as separate log fields rather than one joined string, so joins and matches can be
     * grouped by any single queue option — which is the question these logs exist to answer.
     */
    private queueKeyMeta(key: IQueueFormatKey) {
        return { format: key.format, cardPool: key.cardPool, gamesToWinMode: key.gamesToWinMode };
    }

    /** How long the player had been searching, or undefined if they never reached the live queue. */
    private waitedMs(player: QueuedPlayer): number | undefined {
        return player.searchStartedAt == null ? undefined : this.scheduler.now() - player.searchStartedAt;
    }

    private getQueueByFormat(key: IQueueFormatKey): QueuedPlayer[] | null {
        const queue = this.queues.get(JSON.stringify(key));
        Contract.assertNotNullLike(queue, `No queue found for ${this.queueKeyToString(key)}`);
        return queue;
    }
}
