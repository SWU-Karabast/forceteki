import { SwuGameFormat } from '../SwuGameFormat';
import type { Deck } from '../utils/deck/Deck';
import type Socket from '../socket';
import { logger } from '../logger';
import type { User } from '../utils/user/User';

interface QueuedPlayer {
    deck: Deck;
    socket?: Socket;
    user: User;
}

class QueueHandler {
    private queues: Map<SwuGameFormat, QueuedPlayer[]>;

    public constructor() {
        this.queues = new Map<SwuGameFormat, QueuedPlayer[]>();

        Object.values(SwuGameFormat).forEach((format) => {
            this.queues.set(format, []);
        });
    }


    public addPlayer(format: SwuGameFormat, player: QueuedPlayer) {
        const queuedPlayer = this.findPlayerInQueue(player.user.getId());
        if (queuedPlayer) {
            logger.info(`User ${player.user.getId()} is already in queue, rejoining`);
            this.removePlayer(player.user.getId());
        }
        this.queues.get(format)?.push(player);
    }


    public removePlayer(userId: string) {
        for (const queue of this.queues.values()) {
            const index = queue.findIndex((p) => p.user.getId() === userId);
            if (index !== -1) {
                queue.splice(index, 1);
                return;
            }
        }
    }


    public findPlayerInQueue(userId: string): QueuedPlayer | null {
        for (const queue of this.queues.values()) {
            const player = queue.find((p) => p.user.getId() === userId);
            if (player) {
                return player;
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

        return p1 && p2 ? [p1, p2] : null;
    }

    // Check if any format has enough players for matchmaking
    public findReadyFormats(): SwuGameFormat[] {
        return Array.from(this.queues.entries())
            .filter(([_, queue]) => queue.length >= 2)
            .map(([format]) => format);
    }
}

export default QueueHandler;