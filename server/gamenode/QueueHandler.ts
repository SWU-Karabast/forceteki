import type Socket from '../socket';
import { logger } from '../logger';
import type { User } from '../utils/user/User';
import * as Contract from '../game/core/utils/Contract';
import type { ISwuDbFormatDecklist } from '../utils/deck/DeckInterfaces';
import { CardPool } from '../game/core/Constants';
import { GamesToWinMode } from '../game/core/Constants';
import { SwuGameFormat } from '../game/core/Constants';

import type { IMatchmakingPlayerEntry, IMatchmakingRule } from './MatchmakingRules';
import { MatchmakingRule } from './MatchmakingRules';

export interface QueuedPlayerToAdd {
    deck: ISwuDbFormatDecklist;
    socket?: Socket;
    user: User;
}

export enum QueuedPlayerState {
    Connected = 'connected',
    WaitingForConnection = 'waitingForConnection',
}

export interface QueuedPlayer extends QueuedPlayerToAdd {
    state: QueuedPlayerState;
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

    /** Cooldown interval (in seconds) for rematch prevention */
    public static readonly COOLDOWN_INTERVAL_SECONDS = 15;

    public constructor() {
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
        setInterval(() => this.cleanupPreviousMatchEntries(), 3600000); // 1 hour
    }

    /** Adds an entry for a player, but they can't match until they actually connect */
    public addPlayer(format: IQueueFormatKey, player: QueuedPlayerToAdd) {
        Contract.assertNotNullLike(player);
        Contract.assertNotNullLike(format);

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
            player: { ...player, state: QueuedPlayerState.WaitingForConnection }
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

        this.getQueueByFormat(playerEntry.format)?.push(playerEntry.player);
        logger.info(`QueueHandler: User ${userId} connected with socket id ${socket.id}, added to queue for format ${this.queueKeyToString(playerEntry.format)}`);
    }

    /** If the user exists in the queue and is connected, temporarily move them into a disconnected state while waiting for reconnection */
    public disconnectPlayer(userId: string, socketId: string) {
        const queueEntry = this.findPlayerInQueue(userId);
        if (queueEntry && queueEntry.player?.socket?.id === socketId) {
            this.removePlayer(userId, `Temporarily disconnected on socket id ${socketId}`);
            this.addPlayer(queueEntry.format, { user: queueEntry.player.user, deck: queueEntry.player.deck });
        }
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
            const now = Date.now();
            const cooldownMs = QueueHandler.COOLDOWN_INTERVAL_SECONDS * 1000;
            for (const [userId, matchEntry] of this.playerPreviousMatch.entries()) {
                if (now - matchEntry.endTimestamp > cooldownMs) {
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
                        player.socket.send('queueHeartbeat', Date.now());
                    }
                }
            }
        } catch (error) {
            logger.error(`QueueHandler: Error sending heartbeat: ${error}`);
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

        return this.findMatchInQueue(queue, [MatchmakingRule.rematchCooldown(QueueHandler.COOLDOWN_INTERVAL_SECONDS)]);
    }

    /**
     * Finds a matching pair in the queue based on the provided rules
     *
     * @param queue The queue of players to search for a match
     * @param rules The matchmaking rules to apply when finding a match
     * @returns A tuple of the matched players, or null if no match is found
     */
    private findMatchInQueue(queue: QueuedPlayer[], rules: IMatchmakingRule[]): [QueuedPlayer, QueuedPlayer] | null {
        for (let i = 0; i < queue.length; i++) {
            for (let j = i + 1; j < queue.length; j++) {
                const player1 = queue[i];
                const player2 = queue[j];
                const p1Entry: IMatchmakingPlayerEntry = { player: player1, previousMatch: this.playerPreviousMatch.get(player1.user.getId()) };
                const p2Entry: IMatchmakingPlayerEntry = { player: player2, previousMatch: this.playerPreviousMatch.get(player2.user.getId()) };

                const canMatch = rules.every((rule) => rule.canMatch(p1Entry, p2Entry));

                if (canMatch) {
                    // Remove matched players from the queue
                    queue.splice(j, 1);
                    queue.splice(i, 1);
                    return [player1, player2];
                }

                logger.info(`QueueHandler: Players ${player1.user.getId()} and ${player2.user.getId()} cannot match due to matchmaking rules`);
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

    private getQueueByFormat(key: IQueueFormatKey): QueuedPlayer[] | null {
        const queue = this.queues.get(JSON.stringify(key));
        Contract.assertNotNullLike(queue, `No queue found for ${this.queueKeyToString(key)}`);
        return queue;
    }
}
