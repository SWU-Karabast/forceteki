import type { PreviousMatchEntry, QueuedPlayer } from './QueueHandler';

export interface IMatchmakingPlayerEntry {
    player: QueuedPlayer;
    previousMatch?: PreviousMatchEntry;
}

export interface IMatchmakingRule {
    canMatch(player1: IMatchmakingPlayerEntry, player2: IMatchmakingPlayerEntry): boolean;
}

/**
 * Collection of predefined matchmaking rules & values
 */
export const MatchmakingRule = {
    /**
     * A matchmaking rule that prevents players from rematching
     * within a specified cooldown period.
     *
     * @param cooldownSeconds The cooldown period in seconds
     * @returns An instance of IMatchmakingRule enforcing the cooldown
     */
    rematchCooldown: (cooldownSeconds: number): IMatchmakingRule => {
        return new RematchCooldownRule(cooldownSeconds);
    },
};

class RematchCooldownRule implements IMatchmakingRule {
    private cooldownMs: number;

    public constructor(cooldownSeconds: number) {
        this.cooldownMs = cooldownSeconds * 1000;
    }

    public canMatch(playerEntry1: IMatchmakingPlayerEntry, playerEntry2: IMatchmakingPlayerEntry): boolean {
        const now = Date.now();

        const p1PreviousMatch = playerEntry1.previousMatch;
        const p2PreviousMatch = playerEntry2.previousMatch;
        if (
            p1PreviousMatch &&
            p1PreviousMatch.opponentUserId === playerEntry2.player.user.getId() &&
            this.isWithinCooldown(p1PreviousMatch.endTimestamp, now)
        ) {
            return false;
        }

        if (
            p2PreviousMatch &&
            p2PreviousMatch.opponentUserId === playerEntry1.player.user.getId() &&
            this.isWithinCooldown(p2PreviousMatch.endTimestamp, now)
        ) {
            return false;
        }

        return true;
    }

    private isWithinCooldown(endTimestamp: number, now: number): boolean {
        return now - endTimestamp <= this.cooldownMs;
    }
}
