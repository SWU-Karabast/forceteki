import { SwuGameFormat } from '../SwuGameFormat';
import type { Deck } from '../utils/deck/Deck';
import type Socket from '../socket';
import { logger } from '../logger';
import * as Contract from '../game/core/utils/Contract';

interface User {
    id: string;
    username: string;
}

export interface QueuedPlayerToAdd {
    deck: Deck;
    socket?: Socket;
    user: User;
}

export enum QueuedPlayerState {
    Connected = 'connected',
    Disconnected = 'disconnected',
    WaitingForConnection = 'waitingForConnection',
}

export interface QueuedPlayer extends QueuedPlayerToAdd {
    state: QueuedPlayerState;
}

interface QueuedPlayerEntry {
    format: SwuGameFormat;
    player: QueuedPlayer;
}

export class QueueHandler {
    private queues: Map<SwuGameFormat, QueuedPlayer[]>;
    private playersWaitingToConnect: QueuedPlayerEntry[] = [];

    public constructor() {
        this.queues = new Map<SwuGameFormat, QueuedPlayer[]>();

        Object.values(SwuGameFormat).forEach((format) => {
            this.queues.set(format, []);
        });
    }

    /** Adds an entry for a player, but they can't match until they actually connect */
    public addPlayer(format: SwuGameFormat, player: QueuedPlayerToAdd) {
        Contract.assertNotNullLike(player);
        Contract.assertNotNullLike(format);

        const queueEntry = this.findPlayerInQueue(player.user.id);
        if (queueEntry) {
            logger.info(`User ${player.user.id} is already in queue for format ${queueEntry.format}, rejoining into queue for format ${format}`);
            this.removePlayer(player.user.id);
        }

        this.playersWaitingToConnect.push({
            format,
            player: { ...player, state: QueuedPlayerState.WaitingForConnection }
        });

        // if the player has an active socket, immediately connect them
        if (player.socket) {
            this.connectPlayer(player.user.id, player.socket);
        }
    }

    /** Connects a player that has been added to the queue */
    public connectPlayer(userId: string, socket: Socket) {
        let playerEntry: QueuedPlayerEntry;

        const queueEntry = this.findPlayerInQueue(userId);
        if (queueEntry) {
            playerEntry = queueEntry;

            logger.info(`User ${userId} is already in queue for format ${queueEntry.format}, rejoining into queue for format ${playerEntry.format}`);
            this.removePlayer(userId);
        } else {
            const notConnectedPlayer = this.findNotConnectedPlayer(userId);
            Contract.assertNotNullLike(notConnectedPlayer, `Player ${userId} is not in the queue`);

            playerEntry = notConnectedPlayer;
        }

        Contract.assertNotNullLike(playerEntry.format);

        playerEntry.player.state = QueuedPlayerState.Connected;
        playerEntry.player.socket = socket;

        this.queues.get(playerEntry.format)?.push(playerEntry.player);
    }

    public removePlayer(userId: string) {
        for (const queue of this.queues.values()) {
            const index = queue.findIndex((p) => p.user.id === userId);
            if (index !== -1) {
                queue.splice(index, 1);
                return;
            }
        }

        const index = this.playersWaitingToConnect.findIndex((p) => p.player.user.id === userId);
        if (index !== -1) {
            this.playersWaitingToConnect.splice(index, 1);
            return;
        }
    }

    private findPlayerInQueue(userId: string): QueuedPlayerEntry | null {
        for (const [format, queue] of this.queues.entries()) {
            const player = queue.find((p) => p.user.id === userId);
            if (player) {
                return { player, format };
            }
        }
        return null;
    }

    private findNotConnectedPlayer(userId: string): QueuedPlayerEntry | null {
        return this.playersWaitingToConnect.find((p) => p.player.user.id === userId);
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

        const p1 = queue.shift();
        const p2 = queue.shift();

        Contract.assertNotNullLike(p1);
        Contract.assertNotNullLike(p2);

        return [p1, p2];
    }

    // Check if any format has enough players for matchmaking
    public findReadyFormats(): SwuGameFormat[] {
        return Array.from(this.queues.entries())
            .filter(([_, queue]) => queue.length >= 2)
            .map(([format]) => format);
    }
}
