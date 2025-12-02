import { SwuGameFormat } from '../SwuGameFormat';
import type Socket from '../socket';
import { logger } from '../logger';
import type { User } from '../utils/user/User';
import * as Contract from '../game/core/utils/Contract';
import type { ISwuDbFormatDecklist } from '../utils/deck/DeckInterfaces';
import type { IMatchmakingRule } from './MatchmakingRules';
import { MatchmakingRules } from './MatchmakingRules';

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
    previousMatch?: PreviousMatchEntry;
}

interface QueuedPlayerEntry {
    format: SwuGameFormat;
    player: QueuedPlayer;
}

export interface PreviousMatchEntry {
    opponentUserId: string;
    endTimestamp: number;
}

export class QueueHandler {
    private queues: Map<SwuGameFormat, QueuedPlayer[]>;
    private playersWaitingToConnect: QueuedPlayerEntry[] = [];
    private playerPreviousMatch: Map<string, PreviousMatchEntry>;
    private readonly cooldownSeconds = 60;

    public constructor() {
        this.queues = new Map<SwuGameFormat, QueuedPlayer[]>();
        this.playerPreviousMatch = new Map<string, PreviousMatchEntry>();

        Object.values(SwuGameFormat).forEach((format) => {
            this.queues.set(format, []);
        });
    }

    /** Adds an entry for a player, but they can't match until they actually connect */
    public addPlayer(format: SwuGameFormat, player: QueuedPlayerToAdd) {
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
            player: {
                ...player,
                state: QueuedPlayerState.WaitingForConnection,
                previousMatch: this.playerPreviousMatch.get(player.user.getId())
            }
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
        playerEntry.player.previousMatch = this.playerPreviousMatch.get(userId);

        this.queues.get(playerEntry.format)?.push(playerEntry.player);
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
        this.cleanupPreviousMatchEntryIfNeeded(userId);

        for (const [format, queue] of this.queues.entries()) {
            const index = queue.findIndex((p) => p.user.getId() === userId);
            if (index !== -1) {
                logger.info(`Removing player ${userId} from queue for format ${format}. Reason: ${reasonStr}`);
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

    private cleanupPreviousMatchEntryIfNeeded(userId: string) {
        const entry = this.playerPreviousMatch.get(userId);
        const now = Date.now();
        const cooldownMs = this.cooldownSeconds * 1000;

        if (entry && now - entry.endTimestamp > cooldownMs) {
            this.playerPreviousMatch.delete(userId);
        }
    }

    /** Send a heartbeat signal to the FE for all connected clients */
    public sendHeartbeat() {
        try {
            for (const queue of this.queues.values()) {
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
        for (const [format, queue] of this.queues.entries()) {
            const player = queue.find((p) => p.user.getId() === userId);
            if (player) {
                return { player, format };
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
    public getNextMatchPair(format: SwuGameFormat): [QueuedPlayer, QueuedPlayer] | null {
        const queue = this.queues.get(format);
        if (!queue || queue.length < 2) {
            return null;
        }

        return this.findMatchInQueue(queue, [MatchmakingRules.rematchCooldown(this.cooldownSeconds)]);
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

                const canMatch = rules.every((rule) => rule.canMatch(player1, player2));

                if (canMatch) {
                    // Remove matched players from the queue
                    queue.splice(j, 1);
                    queue.splice(i, 1);
                    return [player1, player2];
                }

                logger.info(`Players ${player1.user.getId()} and ${player2.user.getId()} cannot match due to matchmaking rules`);
            }
        }

        return null;
    }

    // Check if any format has enough players for matchmaking
    public findReadyFormats(): SwuGameFormat[] {
        return Array.from(this.queues.entries())
            .filter(([_, queue]) => queue.length >= 2)
            .map(([format]) => format);
    }
}
