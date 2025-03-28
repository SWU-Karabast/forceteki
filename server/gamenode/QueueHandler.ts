import { SwuGameFormat } from '../SwuGameFormat';
import type { Deck } from '../utils/deck/Deck';
import type Socket from '../socket';
import { logger } from '../logger';
import * as Contract from '../game/core/utils/Contract';

interface User {
    id: string;
    username: string;
}

export enum QueuedPlayerState {
    WaitingInQueue = 'waitingInQueue',
    MatchingCountdown = 'matchingCountDown'
}

export interface QueuedPlayerToAdd {
    deck: Deck;
    socket?: Socket;
    user: User;
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

    public constructor() {
        this.queues = new Map<SwuGameFormat, QueuedPlayer[]>();

        Object.values(SwuGameFormat).forEach((format) => {
            this.queues.set(format, []);
        });
    }

    public addPlayer(format: SwuGameFormat, player: QueuedPlayerToAdd) {
        Contract.assertNotNullLike(player);
        Contract.assertNotNullLike(format);

        const queueEntry = this.findPlayerInQueue(player.user.id);
        if (queueEntry) {
            logger.info(`User ${player.user.id} is already in queue for format ${queueEntry.format}, rejoining into queue for format ${format}`);
            this.removePlayer(player.user.id);
        }
        this.queues.get(format)?.push({ ...player, state: QueuedPlayerState.WaitingInQueue });
    }

    public removePlayer(userId: string) {
        for (const queue of this.queues.values()) {
            const index = queue.findIndex((p) => p.user.id === userId);
            if (index !== -1) {
                queue.splice(index, 1);
                return;
            }
        }
    }

    public findPlayerInQueue(userId: string): QueuedPlayerEntry | null {
        for (const [format, queue] of this.queues.entries()) {
            const player = queue.find((p) => p.user.id === userId);
            if (player) {
                return { player, format };
            }
        }
        return null;
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
