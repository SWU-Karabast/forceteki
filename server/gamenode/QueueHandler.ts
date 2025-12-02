import type Socket from '../socket';
import { logger } from '../logger';
import type { User } from '../utils/user/User';
import * as Contract from '../game/core/utils/Contract';
import type { ISwuDbFormatDecklist } from '../utils/deck/DeckInterfaces';
import { ENABLE_BO3, GamesToWinMode } from '../game/core/Constants';
import { SwuGameFormat } from '../game/core/Constants';

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
    swuFormat: SwuGameFormat;
    gamesToWinMode: GamesToWinMode;
}


export class QueueHandler {
    private readonly queues: Map<SwuGameFormat, Map<GamesToWinMode, QueuedPlayer[]>>;
    private playersWaitingToConnect: QueuedPlayerEntry[] = [];

    public constructor() {
        this.queues = new Map<SwuGameFormat, Map<GamesToWinMode, QueuedPlayer[]>>();

        for (const format of Object.values(SwuGameFormat)) {
            const formatMap = new Map<GamesToWinMode, QueuedPlayer[]>();

            formatMap.set(GamesToWinMode.BestOfOne, []);

            if (ENABLE_BO3) {
                formatMap.set(GamesToWinMode.BestOfThree, []);
            }

            this.queues.set(format, formatMap);
        }
    }

    /** Adds an entry for a player, but they can't match until they actually connect */
    public addPlayer(format: IQueueFormatKey, player: QueuedPlayerToAdd) {
        Contract.assertNotNullLike(player);
        Contract.assertNotNullLike(format);

        const queueEntry = this.findPlayerInQueue(player.user.getId());
        if (queueEntry) {
            logger.info(`User ${player.user.getId()} is already in queue for format ${queueEntry.format}, rejoining into queue for format ${format}`);
            this.removePlayer(player.user.getId(), 'Rejoining into queue');
        }

        const notConnectedPlayerEntry = this.findNotConnectedPlayer(player.user.getId());
        if (notConnectedPlayerEntry) {
            logger.info(`User ${player.user.getId()} is already in waiting-to-queue list for ${notConnectedPlayerEntry.format}, rejoining into queue for format ${format}`);
            this.removePlayer(player.user.getId(), 'Rejoining into queue');
        }

        this.playersWaitingToConnect.push({
            format,
            player: { ...player, state: QueuedPlayerState.WaitingForConnection }
        });
        logger.info(`Added user ${player.user.getId()} to waiting list for format ${format} until they connect`);

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

            logger.info(`User ${userId} with socket id ${socket.id} is already in queue for format ${queueEntry.format}, rejoining into queue for format ${playerEntry.format}`);
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
        logger.info(`User ${userId} connected with socket id ${socket.id}, added to queue for format ${playerEntry.format}`);
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
                logger.info(`Removing player ${userId} from queue for format ${this.queueKeyToString(queueKey)}. Reason: ${reasonStr}`);
                queue.splice(index, 1);
                return;
            }
        }

        const index = this.playersWaitingToConnect.findIndex((p) => p.player.user.getId() === userId);
        if (index !== -1) {
            logger.info(`Removing player ${userId} from queue waiting list. Reason: ${reasonStr}`);
            this.playersWaitingToConnect.splice(index, 1);
            return;
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
            logger.error(`Error sending heartbeat: ${error}`);
        }
    }

    private findPlayerInQueue(userId: string): QueuedPlayerEntry | null {
        for (const [queueKey, queue] of this.iterateQueues()) {
            const player = queue.find((p) => p.user.getId() === userId);
            if (player) {
                return { player, format: queueKey };
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

        const p1 = queue.shift();
        const p2 = queue.shift();

        Contract.assertNotNullLike(p1);
        Contract.assertNotNullLike(p2);

        return [p1, p2];
    }

    // Check if any format has enough players for matchmaking
    public findReadyFormats(): IQueueFormatKey[] {
        return Array.from(this.iterateQueues())
            .filter(([_, queue]) => queue.length >= 2)
            .map(([format]) => format);
    }

    private *iterateQueues(): IterableIterator<[IQueueFormatKey, QueuedPlayer[]]> {
        for (const [swuFormat, queueMap] of this.queues.entries()) {
            for (const [gamesToWinMode, queue] of queueMap.entries()) {
                yield [{ swuFormat, gamesToWinMode }, queue];
            }
        }
    }

    private queueKeyToString(key: IQueueFormatKey): string {
        return `(${key.swuFormat} / ${GamesToWinMode[key.gamesToWinMode]})`;
    }

    private getQueueByFormat(key: IQueueFormatKey): QueuedPlayer[] | null {
        const formatMap = this.queues.get(key.swuFormat);
        Contract.assertNotNullLike(formatMap, `No queue found for format ${key.swuFormat}`);

        const queue = formatMap.get(key.gamesToWinMode);
        Contract.assertNotNullLike(queue, `No queue found for ${this.queueKeyToString(key)}`);

        return queue;
    }
}
